import { PrismaClient } from "./generated/prisma-vector/client";

const globalForPrismaVector = globalThis as unknown as {
  prismaVector: PrismaClient | undefined;
};

export const prismaVector =
  globalForPrismaVector.prismaVector ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrismaVector.prismaVector = prismaVector;
