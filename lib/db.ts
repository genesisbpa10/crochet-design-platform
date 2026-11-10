import { PrismaClient } from "@prisma/client";

// Una sola instancia de Prisma por proceso (evita agotar conexiones en desarrollo).
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
