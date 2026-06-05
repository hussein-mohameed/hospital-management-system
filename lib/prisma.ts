import { getMockPrisma } from "./prisma-mock";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL || ""}`;
const isMockMode = 
  !process.env.DATABASE_URL || 
  process.env.DATABASE_URL.includes("[PASSWORD]") || 
  process.env.DATABASE_URL.includes("[REGION]") ||
  process.env.MOCK_DATABASE === "true";

let prismaInstance: any;

if (isMockMode) {
  if (typeof window === "undefined") {
    console.log("⚠️ [Prisma] Running in Database Mock Mode (Offline/Local JSON).");
  }
  prismaInstance = getMockPrisma();
} else {
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { PrismaClient: RealPrismaClient } = require("@prisma/client");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  prismaInstance =
    globalForPrisma.prisma ??
    new RealPrismaClient({
      adapter,
      log: ["query"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance as PrismaClient;

