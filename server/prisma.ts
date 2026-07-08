import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT 1 as result`;
  console.log('Success:', result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
