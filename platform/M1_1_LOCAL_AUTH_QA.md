# M1.1 — Local Better Auth + Mailpit QA

**Date:** 2026-10-26  
**Status: COMMITTED IMPLEMENTATION CANDIDATE — NOT TESTED ON OWNER'S NODE 24/DOCKER ENVIRONMENT.** The code is for local development, not public deployment. **Better Auth + email/password + verification/reset + self-hosted Postgres were approved by the owner.**

## Why no The Pall domain or personal SMTP is needed

Register a test account using your own personal email address, if desired. **Mailpit will intercept the message and display it locally; the message will NOT arrive in that external inbox.** No personal mailbox password, SMTP credential or production domain is needed. Our test sender is the reserved invalid address `no-reply@thepall.invalid` and exists **only inside Mailpit**.

No public service or signup page should be exposed. Keep localhost binding and temporary test identities.

## Setup: PowerShell (in Git checkout `The-Pall\platform`)

1. Stop old `dev:api` and `dev:web` processes with Ctrl+C. Keep Docker Desktop/Postgres running.
2. `git pull --ff-only`
3. `npm install` — **do not use `npm ci` yet**, as auth dependencies were added after the prior lockfile. npm install updates local `package-lock.json` for review and later commit.
4. Generate a secret in PowerShell; **do not paste the output into chat**:
   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```
5. Open your existing local `.env` file using `notepad .env`. Preserve the working `DATABASE_URL`, `API_HOST` and `API_PORT` values. Add or update these lines; **replace** the example with the random secret generated above:
   ```dotenv
   BETTER_AUTH_SECRET=PASTE_YOUR_OWN_RANDOM_SECRET_HERE
   AUTH_BASE_URL=http://127.0.0.1:5173
   SMTP_HOST=127.0.0.1
   SMTP_PORT=1025
   MAIL_FROM=The Pall Local <no-reply@thepall.invalid>
   ```
   **Don't share or commit `.env`.** Use `127.0.0.1` consistently for browser and Vite proxy, not a mixture of `localhost` and `127.0.0.1`, because session cookies are host-based.
6. Start the local email catcher:
   ```powershell
   npm run mail:up
   ```
   Open `http://127.0.0.1:8025` to confirm the Mailpit inbox loads. Emails remain local.
7. Apply Better Auth's development schema to existing PostgreSQL (does not reset M0 data):
   ```powershell
   npm run auth:migrate
   ```
   **Stop if this reports an error or proposes unexpected table changes.** Do not delete database volumes or run `down -v`.
8. Verify local package/TypeScript checks:
   ```powershell
   npm run test:unit
   npm run check:web
   npm run build -w @the-pall/web
   ```
9. Start servers in separate terminals (both in `The-Pall\platform`):
   ```powershell
   npm run dev:api
   ```
   ```powershell
   npm run dev:web
   ```
10. Open `http://127.0.0.1:5173/account`. Register using a **test password you do not reuse anywhere** and any email address; a personal email may be used but its actual inbox will receive nothing. Open Mailpit `http://127.0.0.1:8025`, open the verification message, click its link and return to Account to sign in. Email verification should be required before a session can be issued.
11. Open `http://127.0.0.1:5173/api/me` in a new tab (via the same-origin Vite proxy). When signed in, it should return your test account's ID/email/verified flag. After sign-out it must return **HTTP 401**.
12. Use Forgot Password at `/account`, inspect the reset email in Mailpit, click its link, set a different password, confirm the old password no longer works and the new password does.
13. Run the existing `npm run verify:api` regression suite after the auth server starts; M0 behaviour must be unchanged.

## QA report requested

Send the **outputs, not secrets**, for:
- `npm run auth:migrate`
- `npm run check:web`
- Any `npm run dev:api` exception
- Register → Mailpit verification → sign-in → sign-out → password reset, PASS/FAIL
- `npm run verify:api` regression result

**Do not send:** password, full verification/reset URLs (contain short-lived tokens), the Better Auth secret, `.env` contents, or Mailpit screenshots containing sensitive links. Redact these if sharing an error.

## Dependency lockfile follow-up

If the flow passes locally, commit **only the regenerated lockfile**:

```powershell
git status --short
git add package-lock.json
git diff --cached --stat
git commit -m "Lock M1.1 Better Auth dependencies"
git push origin main
```

The lockfile **has not been regenerated/committed by the assistant** because this execution environment cannot install the new npm packages. Until updated, `npm ci` may fail due to mismatch. Do not mark M1.1 complete until installation, schema, verification flow, session isolation and security checks pass.

## Boundaries and deferred work

- Account label is **not** the character name. Characters and slots are deferred to M1.2.
- The `/api/fixture` M0 demo remains local-only and untrusted as gameplay. All real character endpoints must enforce session + ownership.
- Better Auth cryptography, passwords and recovery tokens are delegated to the library; do not implement custom equivalents.
- Email verification and password reset are **local Mailpit tests**; a production email domain/provider and operational security are deferred.
- Public release requires SMTP deliverability, TLS, production cookie settings, rate/abuse controls, security review, credential rotation, backups and privacy policy.
- The local account UI is a testing surface, **not** an approved visual design for The Pall.
