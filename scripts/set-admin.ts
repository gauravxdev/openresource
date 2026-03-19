// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const updatedUser = await db.user.update({
    where: { username: 'rajsir' },
    data: { role: 'admin' }
  });
  
  console.log("Successfully updated rajsir to admin:", updatedUser);
}

main().catch(console.error).finally(() => db.$disconnect());
