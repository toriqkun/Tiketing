import prisma from '../src/utils/prisma';
import bcrypt from 'bcrypt';
import { sendEmail } from '../src/utils/email';

async function fixTicket() {
  const ticket = await prisma.ticket.findUnique({
    where: { ticket_number: 'TCK-20260707-0001' }
  });

  if (!ticket) {
    console.log('Ticket not found');
    return;
  }

  console.log('Found ticket:', ticket.ticket_number, ticket.ticket_type);

  if (ticket.ticket_type === 'create') {
    const password = 'Onm12345!';
    const passwordHash = await bcrypt.hash(password, 10);
    const effective = new Date();
    const expired = new Date();
    expired.setMonth(expired.getMonth() + 1);

    const existing = await prisma.account.findUnique({
      where: { email: ticket.target_email! }
    });

    if (existing) {
      console.log('Account already exists, just sending email');
    } else {
      console.log('Creating account...');
      await prisma.account.create({
        data: {
          username: ticket.target_username!,
          email: ticket.target_email!,
          phone: ticket.target_phone,
          password_hash: passwordHash,
          effective_time: effective,
          expired_time: expired,
          must_change_password: true,
          status: 'activated'
        }
      });
      console.log('Account created!');
    }

    console.log('Sending email...');
    sendEmail(
      ticket.target_email!,
      'Your Account Has Been Created',
      `Hello ${ticket.target_username},\n\nYour account has been created.\nUsername: ${ticket.target_username}\nPassword: ${password}\n\nPlease login and keep this safe.`
    );
    console.log('Done!');
  } else {
    console.log('Ticket is not create type');
  }
}

fixTicket().catch(console.error).finally(() => prisma.$disconnect());
