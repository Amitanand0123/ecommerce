import nodemailer from 'nodemailer';

const MAILTRAP_HOST = process.env.MAILTRAP_HOST;
const MAILTRAP_PORT = process.env.MAILTRAP_PORT;
const MAILTRAP_USER = process.env.MAILTRAP_USER;
const MAILTRAP_PASS = process.env.MAILTRAP_PASS;

const APP_FROM_EMAIL = process.env.APP_FROM_EMAIL || `"Your ECOMMERCE App" <noreply@example.com>`;

if (!MAILTRAP_HOST || !MAILTRAP_PORT || !MAILTRAP_USER || !MAILTRAP_PASS) {
  console.error('Mailtrap credentials are missing. Email functionality will be impaired.');
}

const transporter = nodemailer.createTransport({
  host: MAILTRAP_HOST,
  port: parseInt(MAILTRAP_PORT || "2525" , 10),
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  console.log('Attempting to send email with transporter:', {
    host: MAILTRAP_HOST,
    port: parseInt(MAILTRAP_PORT || "2525", 10),
    user: MAILTRAP_USER ? 'User_Exists' : 'User_Missing',
    pass: MAILTRAP_PASS ? 'Pass_Exists' : 'Pass_Missing',
});
  if (!MAILTRAP_HOST || !MAILTRAP_PORT || !MAILTRAP_USER || !MAILTRAP_PASS) {
    console.error('Mailtrap not configured. Skipping email send.');
    throw new Error('Email service is not configured.');
  }

  const mailOptions = {
    from: APP_FROM_EMAIL,
    to: email,
    subject: 'Mailtrap Test',
    text: `Your verification code is ${code}`,
};

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via Mailtrap: %s', info.messageId);
  } catch (error) {
    throw new Error('Failed to send verification email.');
  }
};
