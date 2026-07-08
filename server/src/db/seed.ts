import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';

async function main() {
  const adminEmail = 'admin@example.com';
  const adminUsername = 'admin';
  const adminPhone = '081234567890';
  const password = 'adminpassword123';

  console.log('Seeding database...');

  const existingAdmin = await prisma.account.findUnique({
    where: { username: adminUsername }
  });

  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.account.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      phone: adminPhone,
      password_hash: passwordHash,
      is_admin: true,
      status: 'activated',
      effective_time: now,
      expired_time: nextMonth
    }
  });

  console.log('Admin user created successfully.');
  console.log('Credentials:');
  console.log(`Username: ${adminUsername}`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
