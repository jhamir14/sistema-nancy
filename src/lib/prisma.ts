import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:./dev.db";

  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    let rawUrl = url;
    let authToken = process.env.TURSO_AUTH_TOKEN;

    if (url.includes("authToken=")) {
      try {
        const parsed = new URL(url);
        authToken = parsed.searchParams.get("authToken") || authToken;
        parsed.searchParams.delete("authToken");
        rawUrl = parsed.toString();
      } catch (e) {
        const parts = url.split("?authToken=");
        rawUrl = parts[0];
        authToken = parts[1] || authToken;
      }
    }

    const adapter = new PrismaLibSql({
      url: rawUrl,
      authToken: authToken || undefined,
    });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
