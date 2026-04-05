const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.usuario.findMany({
      select: { username: true, estado_cuenta: true },
      take: 10
    });
    console.log("USERS DATA:");
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("QUERY ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
