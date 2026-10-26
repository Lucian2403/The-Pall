# M1.1 — Local Better Auth + Mailpit QA

**Date:** 2026-10-26  
**Status: PARTIALLY VERIFIED ON OWNER'S NODE 24/DOCKER ENVIRONMENT (2026-10-26); M1.1 IS NOT YET COMPLETE.** The code is for local development, not public deployment. **Better Auth + email/password + verification/reset + self-hosted Postgres were approved by the owner.**

## Owner QA evidence — 2026-10-26

The owner explicitly confirmed **PASS** for the following three steps after resolving a duplicate API process on port 8788 and verifying the PostgreSQL auth schema:

1. **Account registration:** successful in the local account UI.
2. **Verification email:** received in local Mailpit.
3. **Email verification link:** successfully completed.

Evidence is the owner's reported manual browser test, not independent server-log or automated test verification. These results **do not** establish that sign-in, durable session recovery, sign-out revocation, password reset, or multiple-account isolation work. No login credentials or links were shared.

**Next manual QA gate:** sign in with the verified account; open `http://127.0.0.1:5173/api/me`, expect verified account JSON; refresh and confirm session; sign out, expect HTTP 401; request a password reset and use only the Mailpit link; verify old password fails and new password succeeds. Run `npm run verify:api` as M0 regression after the auth tests.

**Additional acceptance before M1.1 closure:** verify session survives an API process restart, run auth-specific negative and multi-user access tests (at minimum account A/B session separation; character ownership tests become meaningful in M1.2), perform package TypeScript checks, and commit the updated `platform/package-lock.json` after dependency resolution.

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
### First migration run: expected warning versus failure

On a **new** database, Better Auth 1.7 can log `ERROR [Better Auth]: Database schema mismatch` listing `user`, `session`, `account`, and `verification` **before** the programmatic migration runs. This is an initial schema diagnosis, not proof the migration failed. Our `npm run auth:migrate` uses `getMigrations(auth.options)` followed by `runMigrations()`. A successful run ends with `Better Auth local schema migration finished.`

**Do not also run `npx auth migrate`.** In this monorepo the Better Auth config is at `apps/api/src/auth.ts` rather than the CLI's default search locations. Bare `npx auth migrate` can report `No configuration file found` even after our programmatic migration succeeded. It is redundant.

### If Docker Compose says "service postgres is not running"

This can happen after migrating from the earlier ZIP project to the Git-tracked checkout: **the PostgreSQL container can be running under the previous Compose project name**, while `docker compose exec postgres` in the new checkout checks only the new project's service. The application's `DATABASE_URL` can still connect normally.

**Do not start another Postgres container or remove volumes just to run a read-only query.** Use the new application-level check instead:

```powershell
git pull --ff-only
npm run auth:status
```

This uses `DATABASE_URL` from the current ignored `.env`, queries `pg_tables`, and makes **no data changes**. Expected:

```text
Better Auth tables found: account, session, user, verification
PASS: All 4 Better Auth tables exist in the application database.
```

If the query fails to connect, inspect `docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"` and share the output (not `.env` or credentials). Investigate a port/container mismatch rather than deleting anything. The earlier `docker compose exec` command is **superseded** for this transition.

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
