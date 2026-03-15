import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Safely altering table to add usernameUpdatedAt column...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "usernameUpdatedAt" TIMESTAMP(3);`);
    console.log("Column 'usernameUpdatedAt' added safely!");
  } catch (err) {
    console.error("Error executing raw SQL:", err);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
