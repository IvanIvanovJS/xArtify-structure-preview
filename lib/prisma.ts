// /lib/prisma.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

declare global {
  // Позволяваме глобална променлива в dev, за да не отваряме много конекции при HMR
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
