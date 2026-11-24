import { betterAuth } from 'better-auth';
import pg from 'pg';
import nodemailer from 'nodemailer';

// Mailpit remains the local default. Production requires an explicit HTTPS
// origin and authenticated encrypted SMTP; no silent verification failures.
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret || secret.startsWith('REPLACE_ME') || Buffer.byteLength(secret, 'utf8') < 32) {
  throw new Error('BETTER_AUTH_SECRET is missing or too short. Generate a random secret in platform/.env.');
}
const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) throw new Error('DATABASE_URL is required');

const production=process.env.NODE_ENV==='production';
const baseURL=process.env.AUTH_BASE_URL??(production?'':'http://127.0.0.1:5173');
if(production){
  if(!baseURL||new URL(baseURL).protocol!=='https:')throw Error('production_auth_requires_https_base_url');
  for(const key of ['SMTP_HOST','SMTP_USER','SMTP_PASS','MAIL_FROM'])
    if(!process.env[key])throw Error('production_auth_requires_'+key);
}
const smtpPort=Number(process.env.SMTP_PORT??(production?'587':'1025'));
if(!Number.isInteger(smtpPort)||smtpPort<1||smtpPort>65535)throw Error('invalid_smtp_port');
const mailer=nodemailer.createTransport({
  host:process.env.SMTP_HOST??'127.0.0.1',
  port:smtpPort,
  secure:production&&smtpPort===465,
  requireTLS:production,
  ...(production?{auth:{user:process.env.SMTP_USER!,pass:process.env.SMTP_PASS!}}:{})
});
const from=process.env.MAIL_FROM??'The Pall Local <no-reply@thepall.invalid>';
if(production&&from.includes('.invalid'))throw Error('production_requires_real_mail_from');
async function sendAccountMail(to:string,subject:string,link:string):Promise<void>{
  await mailer.sendMail({from,to,subject,text:`The Pall\n\nOpen this link:\n${link}\n\nIf you did not request this, disregard the message.\n`});
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
      await sendAccountMail(user.email,'The Pall: reset your password',url);
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAccountMail(user.email,'The Pall: verify your email address',url);
    }
  }
});
