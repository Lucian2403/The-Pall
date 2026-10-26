# M0.2 — Local PostgreSQL/API and browser/restart verification

**Evidence reported by owner: 2026-10-26, local Windows + Docker Desktop checkout from GitHub.**

## Observed verification

Owner ran `npm run verify:api` in the Git-tracked `platform/` application and reported:

```text
PASS: API reachable
PASS: Action saved in PostgreSQL
PASS: Duplicate request returns the same result and does not double-apply
PASS: Stale revision rejected
PASS: Conflicting idempotency key rejected
PASS: Client-supplied game rewards rejected
PASS: Two concurrent actions cannot both commit
PASS: Fixture revision=22, value=22
Local API + DB verification passed. Browser checks and restart recovery still require separate confirmation.
```

**Interpretation:** Seven verifier assertions passed against the owner's local API and PostgreSQL database. This was user-reported test evidence, not an independently observed hosted run. The corrected verifier uses structural JSON comparison to avoid a previous false failure caused by PostgreSQL `jsonb` key ordering; the fixture revision/value was also checked after duplicate and concurrent submissions.

## Browser and restart checks — owner confirmation, 2026-10-26

The owner separately reported that **all previously requested checks passed**:
- Browser fixture connected to the authoritative development API.
- One browser-triggered fixture action incremented revision and value exactly once.
- Browser refresh retained the committed revision/value.
- Stopping and restarting only the API process, while keeping PostgreSQL, retained the committed revision/value.

No revised numeric snapshot or raw console transcript for these second-round checks was supplied; the result is an **owner-reported PASS**, not a separately observed automated browser run.

## Remaining full-M0 gate: reproducibility

- Ensure `platform/package-lock.json` exists and commit it to Git.
- Run `npm ci` from a clean state using Node 24 LTS.
- Run `npm run test:unit`, `npm run check:web`, and `npm run build -w @the-pall/web`.
- Confirm the app and API still start and can read persisted fixture data after that clean installation.
- Ensure docs describe real evidence, not assume deployment readiness.

**M0.2 local functional checks: PASS. Full M0: NOT YET CLOSED** until reproducible installation/build is verified. The development fixture is not production-authenticated, publicly deployed, game-balanced, load-tested or production-hardened.

## Important bounds

Do not reset, remove or reinitialize database volumes to test restart recovery; that would destroy the evidence being tested. The fixture is **not** a player account or live game state. No approved gameplay rules, combat logs or Millhand stages were changed by this verification.

Related: [ADR-0001](../docs/07-technology/adr-0001-web-native-mmo-foundation.md), [ADR-0002](../docs/07-technology/adr-0002-open-rules-and-implementation-boundaries.md), [Git workflow](GIT_WORKFLOW.md).
