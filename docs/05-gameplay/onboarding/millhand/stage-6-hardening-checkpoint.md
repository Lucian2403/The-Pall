# Stage 6 hardening checkpoint — 2026-11-04

**Scope:** Three bounded corrections approved before Stage 7. The approved
v0.5.1 combat source, its numeric balance, combat Chronicle and existing UI
are unchanged.

## 1. Stance-specific first enemy intent

On **new** Stage 6 encounters the production adapter now aligns the initial
committed enemy intention with the chosen starting position:

- **Brace and defend:** Contact range with the existing +2 Readiness and
  Flint's ordinary opening club intent. A Guard can reduce an actual blow.
- **Keep moving:** Near range, using the existing Flint club intention.
  Flint's committed attack is outside contact unless the player chooses
  to close before it resolves; the player can maintain distance, recover
  or reposition instead. The combat engine makes all hit/miss decisions.
- **Use the cart:** Far range, with Flint's first committed action set to
  the **existing engine Move** action to get around the obstruction. Flint
  cannot hit through the cart on the first turn. No damage-reduction rule
  or invented cover bonus has been introduced.

After the first turn, v0.5.1 alone decides all future enemy intentions.
The generated first-intent distinction is stored in the regular combat
snapshot; no hidden re-roll, scripted hit, or automatic surrender occurs.
**Existing saved fights are not reset or retroactively modified.**

## 2. Character deletion

The authenticated roster deletion transaction now deletes Stage 6 combat
receipts and encounter, then Stage 5 wage-claim receipts and state, before
deleting Stage 4 and earlier records and the character. All tables retain
their existing restrictive foreign keys. The operation is still
account-scoped, exact-name confirmed, revision-locked, and atomic; a failed
confirmation or stale revision leaves all records unchanged.

## 3. Real PostgreSQL integration test

`platform/scripts/verify-stage6-postgres.integration.test.ts` runs the
**shipping** Fastify combat and character handlers against a dedicated
throwaway PostgreSQL database, created from the current production table
migrations. The in-process test uses an injected *verified-identity resolver*
instead of a Better Auth email/login flow. Production registration passes
no resolver and continues to use Better Auth and cryptographic RNG.

The tests cover:

- all three opening ranges, intentions and first-turn consequences;
- anonymous and wrong-account reads/mutations;
- replay-safe start/turn receipts and reused request-ID rejection;
- invalid actions and stale revisions;
- simultaneous turns from two clients and a single committed result;
- reload/readback of the same Chronicle and Health;
- finished victory and defeat, exact character Health, no coins/skills/XP,
  and no premature Stage 7 transition;
- authorized character deletion with Stage 5/6 child records, rollback on
  wrong confirmation, and isolation from another account.

The test runner requires `STAGE6_TEST_DATABASE_URL` with a database named
**`pall_stage6_test`**; it refuses other database names to avoid accidental
deletion or schema pollution. CI provisions disposable PostgreSQL 16 and
runs the tests after the original v0.5.1 suite. These are real SQL transaction
tests, **not** a substitute for separately testing the live Better Auth
email/session flow in a browser.

## Exit criteria

The original combat-v0.5.1 checksum, original 49 tests, all existing Stage 4–6
regressions, API typecheck, web build, and the new PostgreSQL tests must pass.
Any of them failing blocks merging this checkpoint. A short manual Stage 6
run remains the final visual/audio acceptance step before Stage 7.
