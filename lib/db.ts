import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool as PgPool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  const pool = new PgPool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    options: "-c search_path=ApexVendor,public",
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["error", "warn"] });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Instancia compartida del cliente de Prisma para la interacción con la base de datos PostgreSQL.
 * Implementa el patrón Singleton para evitar múltiples conexiones en entornos de desarrollo.
 */
export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
