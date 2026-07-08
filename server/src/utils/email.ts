import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('--------------------------------------------------');
    console.log(`[EMAIL FALLBACK] To: ${to}`);
    console.log(`[EMAIL FALLBACK] Subject: ${subject}`);
    console.log(`[EMAIL FALLBACK] Text:\n${text}`);
    console.log('--------------------------------------------------');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: (SMTP_FROM && SMTP_FROM.includes('@')) ? SMTP_FROM : '"App Operation Maintenance" <hello@demomailtrap.com>',
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send email via SMTP, falling back to console:', error);
    console.log(`[EMAIL FALLBACK] To: ${to}\nSubject: ${subject}\nText:\n${text}`);
  }
};
