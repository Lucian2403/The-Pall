# M0.2 — PostgreSQL/API verification and remaining gate

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

**Do not close full M0 yet.** The following gates remain:
1. **Browser integration:** refresh `http://127.0.0.1:5173`, confirm `Connected to the authoritative development API` and that revision/value match `http://127.0.0.1:8788/api/fixture`; click **Commit one test action** once and confirm each increases by exactly one; refresh and confirm the committed count remains.
2. **API process restart persistence:** note the latest revision/value; stop **only API** using `Ctrl+C`, keep Docker PostgreSQL and web dev server running; restart using `npm run dev:api`; reload browser; verify same revision/value after restart (no reset). Run `npm run verify:api` again if desired, noting that script itself commits test actions.
3. **Repository reproducibility:** generate and review a `package-lock.json`, commit it, then verify `npm ci`, test suite, TypeScript/Web checks, real migration and browser test from a clean checkout under Node 24 LTS. `npm install` used for the existing local run does not substitute for committed lockfile.
4. No production authentication, game persistence model, content imports or load/operational validation are implied by this M0 development fixture.

## Important bounds

Do not reset, remove or reinitialize database volumes to test restart recovery; that would destroy the evidence being tested. The fixture is **not** a player account or live game state. No approved gameplay rules, combat logs or Millhand stages were changed by this verification.

Related: [ADR-0001](../docs/07-technology/adr-0001-web-native-mmo-foundation.md), [ADR-0002](../docs/07-technology/adr-0002-open-rules-and-implementation-boundaries.md), [Git workflow](GIT_WORKFLOW.md).
