import { PrismaClient } from "@prisma/client";

export const testPrismaInstance = (databaseUrl: string) =>
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
