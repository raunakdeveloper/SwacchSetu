import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const PORT = Number(process.env.SMTP_PORT) || 587;
const HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const IS_SECURE = PORT === 465; // only secure for 465

export const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: IS_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  requireTLS: true,
  tls: {
    minVersion: 'TLSv1.2',
    // Allow serverless ephemeral IPs / avoid cert issues
    rejectUnauthorized: false,
  },
  connectionTimeout: 15_000,
});

export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log(`SMPT verified`);
  } catch (error) {
    console.error('SMTP verify failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Auth failed. Check APP PASSWORD (not normal password).');
    } else if (error.code === 'ESOCKET') {
      console.error('Network/TLS issue. Ensure Gmail allows access, try port 465.');
    }
  }
};
