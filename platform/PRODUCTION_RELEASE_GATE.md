# Public Early Access deployment gate

The local Mailpit/fixture configuration is **not** a production deployment.

## Before enabling public sign-ups
- Set a high-entropy BETTER_AUTH_SECRET in a secret manager; never commit it.
- Supply AUTH_BASE_URL as the exact public HTTPS origin, and terminate TLS at a trusted proxy.
- Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT (587 STARTTLS or 465 TLS), MAIL_FROM to a real monitored mail provider. The production API rejects Mailpit loopback addresses and unsecured origins. Test verification and password reset with real accounts.
- Run `NODE_ENV=production npm run auth:migrate` using production secrets, then `NODE_ENV=production npm run auth:status`. The rateLimit table must exist before the first production auth request.
- Isolate the PostgreSQL connection behind a private network; use production credentials, tested backups and restore drills.
- Restrict direct API access to the trusted reverse proxy; configure its source IP handling and rate limiting. Validate forwarded client-IP headers for the chosen proxy before exposing login endpoints.
- Verify `/api/fixture` and `/api/characters/:id/dev/rewind-stage` return 404 in production; do not run NODE_ENV=development on a public listener.
- Run real browser → HTTPS → auth → PostgreSQL registration, email verification, reset, and character deletion checks against a disposable production-like environment. Ensure SMTP delivery failures are monitored; production email dispatch does not delay auth requests to prevent timing disclosure.
- Review logs, access controls, dependency advisories, and data retention before enabling public accounts.

No deployed host, reverse proxy, email provider, or credential is configured by this repository. Passing CI does not attest external infrastructure.

## PostgreSQL connection budgets (per API process)

All gameplay routes (including Millhand, Bellrunner, Stitcher, Clinic, Home,
inventory, Journal, and the local test fixture) use **one Fastify-owned pool**.
Its default maximum is 10 connections (`GAMEPLAY_DB_POOL_MAX`). Better Auth
has a **separate pool** capped at 4 (`AUTH_DB_POOL_MAX`). Both caps accept
integer values from 1 to 50. The default aggregate connection budget is
therefore **14 connections per running API process**, not including migrations,
maintenance sessions, or separate workers.

Set connection caps against PostgreSQL's actual capacity multiplied by the
number of API processes. Do not set both caps to 50 without explicit database
sizing and load tests. Fastify shutdown drains the gameplay and authentication
pools on SIGINT/SIGTERM; scripted Better Auth migrations release their own
pool when finished. External pools injected by tests remain caller-owned.
