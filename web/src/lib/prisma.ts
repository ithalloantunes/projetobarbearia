import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is obrigatorio em producao.");
  }

  return "mysql://barbersaas:barbersaas@localhost:3307/barbersaas";
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(resolveDatabaseUrl());
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}