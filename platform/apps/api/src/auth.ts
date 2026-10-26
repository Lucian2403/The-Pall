import { betterAuth } from 'better-auth';
import pg from 'pg';
import nodemailer from 'nodemailer';

// Local development identity service. This module MUST NOT be used as-is for a public deployment.
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret || secret.startsWith('REPLACE_ME') || Buffer.byteLength(secret, 'utf8') < 32) {
  throw new Error('BETTER_AUTH_SECRET is missing or too short. Generate a random secret in platform/.env.');
}
const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) throw new Error('DATABASE_URL is required');

const baseURL = process.env.AUTH_BASE_URL ?? 'http://127.0.0.1:5173';
const smtpPort = Number(process.env.SMTP_PORT ?? '1025');
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? '127.0.0.1',
  port: smtpPort,
  secure: false
});
const from = process.env.MAIL_FROM ?? 'The Pall Local <no-reply@thepall.invalid>';

async function sendDevelopmentMail(to: string, subject: string, link: string): Promise<void> {
  // Use Mailpit locally: delivery does not leave the developer machine.
  await mailer.sendMail({ from, to, subject, text: `The Pall — local development\n\nOpen this link:\n${link}\n\nIf you did not request this, disregard the message.\n` });
}

export const auth = betterAuth({
  appName: 'The Pall',
  secret,
  baseURL,
  trustedOrigins: [baseURL],
  database: new pg.Pool({ connectionString: databaseURL }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      // Do not let SMTP latency leak whether a user account exists.
      void sendDevelopmentMail(user.email, 'The Pall: reset your password', url)
        .catch(() => console.error('Local SMTP failed to deliver a password reset message.'));
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendDevelopmentMail(user.email, 'The Pall: verify your email address', url)
        .catch(() => console.error('Local SMTP failed to deliver an email verification message.'));
    }
  }
});
