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
