import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  cachedPrisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.cachedPrisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.cachedPrisma = db;
