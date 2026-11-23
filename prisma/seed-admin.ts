import { prisma } from "../src/lib/prisma";
import crypto from "crypto";

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
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
    console.log("Admin user seeded: username='admin', password='admin123'");
  } else {
    console.log(`Users already exist (${count}).`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
