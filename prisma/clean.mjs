import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("Limpiando todos los datos de prueba e imaginarios...");

  // 1. Eliminar transacciones, pagos y movimientos
  await prisma.payment.deleteMany();
  await prisma.cashTransaction.deleteMany();
  await prisma.installment.deleteMany();

  // 2. Eliminar créditos y préstamos
  await prisma.shoeCreditItem.deleteMany();
  await prisma.shoeCredit.deleteMany();
  await prisma.loan.deleteMany();

  // 3. Eliminar inventario y variantes de calzado
  await prisma.shoeVariant.deleteMany();
  await prisma.shoe.deleteMany();

  // 4. Eliminar clientes de prueba
  await prisma.customer.deleteMany();

  // 5. Dejar únicamente al usuario Administrador (Nancy)
  await prisma.user.deleteMany();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync("admin123", salt, 10000, 64, "sha512").toString("hex");
  
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

  console.log("SUCCESS: Base de datos limpia (0 clientes, 0 zapatillas, 0 préstamos).");
  console.log("ADMIN: Usuario admin / admin123 listo.");
}

cleanDatabase()
  .catch((e) => {
    console.error("Error al limpiar:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
