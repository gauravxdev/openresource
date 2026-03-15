import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Safely altering table to add username column...");
  
  try {
    // Add the column. (PostgreSQL handles optional columns gracefully, initializing as NULL)
    await prisma.$executeRawUnsafe(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" TEXT;`);
    console.log("Column 'username' added safely!");

    // Add exactly the unique constraint Prisma would add.
    // Multiple NULLs won't violate this in PostgreSQL.
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "user_username_key" ON "user"("username");`);
    console.log("Unique constraint added safely!");

  } catch (err) {
    if (err.message && err.message.includes("already exists")) {
      console.log("Column or index already exists, which is fine.");
    } else {
      console.error("Error executing raw SQL:", err);
    }
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
