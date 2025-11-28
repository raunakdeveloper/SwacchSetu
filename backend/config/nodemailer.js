import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('Email service verified successfully');
  } catch (error) {
    console.error('Email service verification failed:', error.message);
  }
};
