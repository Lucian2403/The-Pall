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
  const publicOrigin=baseURL?new URL(baseURL):null;
  if(!publicOrigin||publicOrigin.protocol!=='https:'||
    ['localhost','127.0.0.1','[::1]'].includes(publicOrigin.hostname)||
    publicOrigin.username||publicOrigin.password)
    throw Error('production_auth_requires_https_base_url');
  for(const key of ['SMTP_HOST','SMTP_USER','SMTP_PASS','MAIL_FROM'])
    if(!process.env[key])throw Error('production_auth_requires_'+key);
}
const smtpPort=Number(process.env.SMTP_PORT??(production?'587':'1025'));
if(!Number.isInteger(smtpPort)||smtpPort<1||smtpPort>65535)throw Error('invalid_smtp_port');
if(production&&['127.0.0.1','localhost','::1'].includes(process.env.SMTP_HOST??''))
  throw Error('production_smtp_must_not_use_local_mailpit');
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
// Better Auth recommends not awaiting production mail in the auth request:
// doing so creates timing differences between known and unknown accounts.
// Failures are logged for alerting; production needs a monitored mail service.
function dispatchAccountMail(to:string,subject:string,link:string):Promise<void>{
  if(!production)return sendAccountMail(to,subject,link);
  void sendAccountMail(to,subject,link).catch(()=>
    console.error('Account email delivery failed; check SMTP provider and monitoring'));
  return Promise.resolve();
}

export const auth = betterAuth({
  appName: 'The Pall',
  secret,
  baseURL,
  trustedOrigins: [baseURL],
  // Persistent counters are required when the public API scales beyond one worker.
  // Run auth:migrate with the production environment before deploying.
  rateLimit:{enabled:production,storage:'database',window:60,max:100},
  database: new pg.Pool({ connectionString: databaseURL }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      await dispatchAccountMail(user.email,'The Pall: reset your password',url);
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      await dispatchAccountMail(user.email,'The Pall: verify your email address',url);
    }
  }
});
