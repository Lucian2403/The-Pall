# M1.1 — Local Better Auth + Mailpit QA

**Date:** 2026-10-26  
**Status: M1.1 LOCAL FUNCTIONAL QA PASSED (owner-reported, 2026-10-26).** Public-release security certification, abuse controls and deployment are separate future gates. The code is for local development, not public deployment. **Better Auth + email/password + verification/reset + self-hosted Postgres were approved by the owner.**

## M1.1 final owner report — 2026-10-26

After the registration, verification, sign-in, recovery and restart tests below, the owner reported **"All tests passed. Let's move on."** in response to the final QA run consisting of:
- `npm run verify:auth-unauthenticated` — anonymous, forged-identity header and fake-token access rejected.
- `npm run verify:api` — earlier M0 database/idempotency/concurrency regression.
- `npm run test:unit`, `npm run check:web`, and `npm run build -w @the-pall/web` — unit/type/build regression.
- Manual isolation of Account A in a normal browser from Account B in an incognito browser, including independent signout.

The **updated Better Auth dependency lockfile is present in GitHub**. It was originally committed with tarball download URLs pinned to a private npm proxy; on 2026-10-26 those URLs were changed to standard npm registry URLs, **without changing versions or integrity hashes** (commit `656f7ab877e3d64fee15ca33c32a33568087b0cf`). Because that URL change was not yet independently run through `npm ci` on the owner's machine, **reproducible installation of this normalized lockfile remains a small follow-up validation**; it does not block beginning M1.2 design.

**Boundary:** The results are user-reported local QA, not independent penetration testing. The authentication system is **not yet approved for public hosting**: email domain, TLS, abuse limits, CSRF/session review, incident response, privacy and backups remain separate launch work. No character ownership APIs exist yet; authenticated character ownership must be explicitly tested in M1.2.

## Owner QA evidence — 2026-10-26

The owner explicitly confirmed **PASS** for the following three steps after resolving a duplicate API process on port 8788 and verifying the PostgreSQL auth schema:

1. **Account registration:** successful in the local account UI.
2. **Verification email:** received in local Mailpit.
3. **Email verification link:** successfully completed.

The owner also reported **five further PASS results**:
- Verified-account login: PASS.
- Browser refresh retained authenticated session: PASS.
- Logout revoked access; `GET /api/me` returned HTTP 401: PASS.
- Password recovery: PASS (Mailpit reset flow, old password rejected/new password accepted according to the requested scenario).
- API process restart retained the authenticated session: PASS.

The registration/email and five session/recovery results are **owner-reported manual browser evidence**, not independent automated integration tests. No credentials, cookies or links were shared. These results establish functional local login and recovery, but **do not yet prove multi-account isolation or public security readiness**.

**Next QA gate:** run M0 regression `npm run verify:api` and a no-cookie/forged-header auth endpoint regression; then verify Account A and Account B produce **different IDs** in isolated browser sessions. Finally run `npm run test:unit`, `npm run check:web`, `npm run build -w @the-pall/web`, and commit the locally regenerated `platform/package-lock.json`.

**Additional acceptance before M1.1 closure:** verify session survives an API process restart, run auth-specific negative and multi-user access tests (at minimum account A/B session separation; character ownership tests become meaningful in M1.2), perform package TypeScript checks, and commit the updated `platform/package-lock.json` after dependency resolution.

## Final M1.1 local QA — two-account isolation and dependency reproducibility

**Precondition:** all previously reported registration, email verification, sign-in, logout, recovery and API-restart checks passed. Use test-only credentials; do not share them.

**A. Pull and run non-mutating boundary + M0 regression checks**

From a Git-tracked `The-Pall\platform` PowerShell window, with the existing API and PostgreSQL running:

```powershell
git status --short
git pull --ff-only
npm run verify:auth-unauthenticated
npm run verify:api
npm run test:unit
npm run check:web
npm run build -w @the-pall/web
```

- `verify:auth-unauthenticated` checks HTTP 401 for no cookie and forged identity headers, without creating accounts or modifying database state.
- `verify:api` checks the original M0 fixture transaction rules; it deliberately increments **only** the non-economic test counter.
- Tests/build are regressions; success requires no runtime or TypeScript errors under Node 24.

**B. Two-account isolation (manual browser test)**

1. In a **normal** browser window, sign in as verified test **Account A**; open `http://127.0.0.1:5173/api/me`, and **locally note** returned `id` and `email`.
2. In a **private/incognito** browser window, go to `http://127.0.0.1:5173/account`; ensure `/api/me` is **401 before sign-in**.
3. Register and verify a **separate Account B** through Mailpit; then sign in as B in the private window. `/api/me` must return B's account ID (different from A), not A's. Do not reuse A's email.
4. Refresh A's original normal window and `/api/me`. It must still return A, not B.
5. Sign out B in private browsing. Its `/api/me` must become **401**; A's normal-window session must remain authorized and unchanged.

**C. Publish the dependency lockfile**

The assistant introduced Better Auth/Nodemailer package manifest changes but **could not regenerate `package-lock.json` with npm**. Your previous `npm install` likely updated the tracked lockfile locally. Check it and commit **only that file**, excluding local secrets and generated data:

```powershell
git status --short
npm install
git add package-lock.json
git diff --cached --stat
git commit -m "Lock M1.1 authentication dependencies"
git push origin main
```

If `git commit` says `nothing to commit`, check GitHub's `platform/package-lock.json` for `better-auth` before assuming it is already tracked. Do **not** commit `.env`, tokens, Mailpit messages, `node_modules`, or session data. Don't force push if Git rejects a non-fast-forward.

After the lockfile is published, optionally rerun `npm ci` with both node servers stopped, to prove the new lockfile is reproducible. Then restart API/web if continuing testing.

**Acceptance:** All A/B and regression checks PASS, the M1.1 dependency lockfile is committed, and an `npm ci` pass on Node 24 follows. This closes **local M1.1**, not public launch security review or future character-ownership authorization.

## Mailpit persistent inbox — 2026-10-30

Mailpit's default SQLite database is temporary and is deleted when the application exits. The local `compose.yaml` now sets `MP_DATABASE=/data/mailpit.db` and mounts the named Docker volume `pall_mailpit_dev` at `/data`. This preserves **newly received** development emails across Mailpit container restarts and recreations. It does **not** recover messages previously lost from the old temporary database. The existing `MP_MAX_MESSAGES=100` limit still prunes older messages when exceeded. SMTP remains bound to `127.0.0.1:1025`; the Mailpit UI remains at `http://127.0.0.1:8025`.

After the change has been merged and pulled, run from `The-Pall\\platform` in PowerShell:

```powershell
docker compose config
docker compose up -d --no-deps mailpit
docker compose ps mailpit
docker inspect (docker compose ps -q mailpit) --format '{{json .Mounts}}'
```

The final command should show a named mount targeting `/data`. Compose recreates the Mailpit container when its configuration changes; there is no need to stop or recreate PostgreSQL. If port 8025 or 1025 is in use by a Mailpit instance from a **different** Compose project, check `docker ps` before starting another instance—do not delete any existing containers or volumes blindly.

**Persistence smoke test:** with the API running, request a password reset for an existing test account from `/account`, confirm a new message in Mailpit, then run `docker compose restart mailpit` and refresh `http://127.0.0.1:8025`. To verify container *recreation*, run `docker compose up -d --no-deps --force-recreate mailpit` and refresh again: the same message should remain. Do not use `docker compose down -v`, `docker volume rm`, or a volume-pruning command: these can destroy named volumes, including PostgreSQL data. Never share password reset or email verification links containing tokens.

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
