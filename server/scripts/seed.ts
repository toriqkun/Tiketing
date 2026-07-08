import prisma from '../src/utils/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');
  
  // Clear tables
  await prisma.ticketHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.accountAuditLog.deleteMany();
  await prisma.account.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.account.create({
    data: {
      username: 'admin',
      password_hash: adminPassword,
      email: 'admin@example.com',
      phone: '081234567890',
      is_admin: true,
      status: 'activated',
      effective_time: new Date(),
      expired_time: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  });
  console.log('Admin user created:', admin.username);

  // Create default user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.account.create({
    data: {
      username: 'user1',
      password_hash: userPassword,
      email: 'user1@example.com',
      phone: '081234567891',
      is_admin: false,
      status: 'activated',
      effective_time: new Date(),
      expired_time: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  });
  console.log('Default user created:', user.username);
  
  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
