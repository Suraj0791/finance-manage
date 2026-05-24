const { PrismaClient } = require('@prisma/client');

console.log('Testing Prisma connection...');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as alive`;
    console.log('✅ SUCCESS: Prisma successfully queried the database!', result);
  } catch (error) {
    console.error('❌ ERROR: Prisma query failed.');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
