// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const allUsers = await db.user.findMany({
    select: { id: true, name: true, email: true, username: true, role: true, _count: { select: { resources: true } } }
  });
  
  console.log("Admins:", allUsers.filter(u => u.role === 'admin'));
  console.log("Contributors:", allUsers.filter(u => u.role === 'contributor'));
}

main().catch(console.error).finally(() => db.$disconnect());
