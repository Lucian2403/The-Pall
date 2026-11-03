# Stage 6 — Flint Combat (v0.5.1 engine integration)

Implementation boundary: authenticated Millhand Stage 6, preserving the original
`combat.mjs` from the owner-provided `The_Pall_Combat_Part10_Prototype.zip`, at
`The_Pall_Millhand_v0_6_1_Playtest_Corrections/prototypes/combat-v0.5.1`.
Engine SHA-256: `4d7b2c958611c8b564113a9c8825b7346461516e02d237b09fce331ba3e5ef89`.

The combat calculations, enemy AI, telegraphs, narration, and event log were not modified.
The source remains a **prototype** with adjustable trial numbers, not finalized MMO balance.
The legacy test suite is available alongside the vendored module.

## How the handoff works

1. Stage 5 records one of `brace`, `moving`, or `cart`; the character becomes Stage 6.
2. The web route automatically starts the encounter once via an authenticated POST.
   A database row and a server-generated random seed ensure no client can roll its own
   starting enemy intent. A reload resumes the same encounter.
3. The combat adapter preserves v0.6.1's three existing starting conditions:
   `brace` applies player readiness +2; `moving` begins at `near` distance;
   `cart` begins at `far` distance. These are **not** hidden damage bonuses.
4. Every combat choice is validated, then resolved by the original `step()` under
   a PostgreSQL character-row lock. The original returned events are appended
   verbatim to the saved Battle Chronicle. The character's current Health is
   committed in the same transaction.
5. The authoritative engine result is stored permanently with the encounter.
   Victory or defeat uses the approved separate Stage 6 aftermath and personal Journal.
   Workers intervene after a defeat. No coins, loot, items, skill points, or XP.
6. Stage 7 is a separate implementation milestone. The fight result is retained
   at Stage 6 until clinic support is connected; do not fake a 10-coin debit or
   hidden stabilization for defeated characters.

## Start and migration

From `platform/`:

```sh
npm run combat:migrate
npm run build:packages
npm run dev:api
npm run dev:web
```

After updating source and restarting the API/web servers, opening Stage 6 for a
character with an approved saved stance resumes or initializes the same combat.
The migration is additive and does not reset pre-existing Stage 5 or 6 saves.

## Contract checks

- Confirm new/legacy Stage 6 characters, all three stances, and replay-safe start.
- Test 49 owner-supplied legacy engine and HTTP rules, plus the platform adapter.
- Test each action exactly once; duplicate ID returns its original response;
  concurrent stale revision receives a conflict; no duplicate Health loss.
- Test both Flint retreat/knockdown victory and player defeat, without coercion.
- Test forged owner ID, malformed commands, UI reload and multiple tabs.
- Test developer Previous Dialogue is rejected once combat has started.
- Stage 7 clinic debit must wait for a separately approved and implemented state machine.

The existing browser v0.5.1 UI is a historical visual reference, not the
final production combat interface. Current Svelte scene has deliberately
provisional layout and keeps the owner-approved alley and Flint art.
