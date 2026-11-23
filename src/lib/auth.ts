import { cookies } from "next/headers";
import {
  SessionPayload,
  SESSION_COOKIE_NAME,
  signToken,
  verifyToken,
} from "./token";

export type { SessionPayload };
export { SESSION_COOKIE_NAME, signToken, verifyToken };

// Obtener sesión actual en Server Components / Server Actions
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// Establecer cookie de sesión
export async function setSessionCookie(payload: SessionPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días de duración
  });
}

// Eliminar cookie de sesión (Cerrar sesión)
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
