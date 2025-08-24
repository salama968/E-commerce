import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemplate.js";

let cachedTransporter = null;

const buildTransporter = async () => {
  const hasGmailCreds = process.env.EMAIL && process.env.EMAIL_PASSWORD;
  if (hasGmailCreds) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD, // Use Gmail App Password (2FA required)
      },
      tls: { rejectUnauthorized: false },
    });
  }
  // Fallback to Ethereal for development/testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const getTransporter = async () => {
  if (!cachedTransporter) {
    cachedTransporter = await buildTransporter();
  }
  return cachedTransporter;
};

export const sendMail = async (email) => {
  const transporter = await getTransporter();
  const fromAddress = process.env.EMAIL
    ? process.env.EMAIL
    : "no-reply@example.com";
  const info = await transporter.sendMail({
    from: `"E-commerce" <${fromAddress}>`,
    to: email,
    subject: "Verify your email",
    text: "Please verify your email.",
    html: emailTemplate(email),
  });

  // If using Ethereal, output preview URL to console
  const previewUrl = nodemailer.getTestMessageUrl?.(info);
  if (previewUrl) {
    console.log("Email preview:", previewUrl);
  }
  console.log("Message sent:", info.messageId);
};
