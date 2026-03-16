import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: 'rajsir' },
    include: {
      resources: true
    }
  })
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  console.log("User Role:", user.role);
  console.log("Number of Resources:", user.resources.length);
  user.resources.forEach(r => {
    console.log(`- ${r.name} (addedBy: ${r.addedBy}, status: ${r.status})`);
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
