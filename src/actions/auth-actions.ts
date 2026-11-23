"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Función de hashing criptográfico con PBKDF2
export async function hashPassword(password: string, existingSalt?: string) {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

// Función de verificación segura contra ataques de temporización
export async function verifyPassword(password: string, hash: string, salt: string) {
  try {
    const check = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(check, "hex"), Buffer.from(hash, "hex"));
  } catch (e) {
    return false;
  }
}

// Asegurar que exista al menos el usuario Administrador
export async function ensureDefaultAdmin() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      const { hash, salt } = await hashPassword("admin123");
      await prisma.user.create({
        data: {
          username: "admin",
          name: "Nancy (Administradora)",
          passwordHash: hash,
          salt: salt,
          role: "ADMIN",
          isActive: true,
        },
      });
      console.log("Usuario Administrador por defecto creado: admin / admin123");
    }
  } catch (error) {
    console.error("Error al verificar o inicializar admin:", error);
  }
}

export async function loginAction(formData: FormData) {
  try {
    const username = (formData.get("username") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { success: false, error: "Ingresa tu usuario y contraseña" };
    }

    // Asegurar que exista admin si la base de datos está vacía
    await ensureDefaultAdmin();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

    if (!user.isActive) {
      return { success: false, error: "Tu cuenta de usuario ha sido desactivada" };
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

    // Crear sesión válida por 7 días
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    await setSessionCookie({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role as "ADMIN" | "OPERATOR",
      exp,
    });

    revalidatePath("/", "layout");
    return { success: true, role: user.role };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Ocurrió un error al iniciar sesión" };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getAuthUser() {
  return await getCurrentSession();
}

export async function changePasswordAction(currentPass: string, newPass: string) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: "No has iniciado sesión" };
    }

    if (!newPass || newPass.length < 5) {
      return { success: false, error: "La nueva contraseña debe tener al menos 5 caracteres" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const isCurrentValid = await verifyPassword(currentPass, user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return { success: false, error: "Tu contraseña actual es incorrecta" };
    }

    const { hash, salt } = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, salt },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return { success: false, error: "No se pudo cambiar la contraseña" };
  }
}
