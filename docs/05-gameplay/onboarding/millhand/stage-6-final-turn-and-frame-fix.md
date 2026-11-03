# Stage 6 correction: combat finish, framed controls and local replay

**Date:** 2026-11-03
**Scope:** Millhand Stage 6 presentation and persistence defect; original v0.5.1 combat engine untouched.

## Combat final-turn failure

The Stage 6 adapter used `tutorial_status='COMPLETE'` when the fight ended.
The authoritative `player_characters` schema allows only
`NOT_STARTED`, `IN_PROGRESS`, and `COMPLETED`. PostgreSQL rejected the
last-turn transaction, producing the reported HTTP 500 and leaving the prior
round saved. The endpoint now writes `COMPLETED`, consistent with the
existing database CHECK. No combat arithmetic, outcome, actor Health,
loot or XP formula changed.

The failed transaction wrote neither the final combat state nor its
idempotency receipt. On an affected save, retrying the previously failed
last action after restarting the updated API can complete the fight.

## Owner-approved frames

The top-right situation panel had an untrimmed frame combined with its own
opaque paper background, resulting in an oversized inner border and text
overlapping decoration. It now uses the already approved
`dialogue-frame-trim.png` nine-slice and a single paper fill.

The five action icons, confirm action, and selected-action strip use smaller
dialogue-framed controls. Icon assets, action labels, targeting/position
options, disabled states, focus indications and combat costs remain.

Flint's name and the Work Cart label use the matching nine-slice object
caption treatment already established in Stage 5. The illustrated Flint
asset and the work cart scenery are unchanged.

## Local-only Back to Stage 5

The existing `/dev/rewind-stage` capability now supports Stage 6 → Stage 5,
but it remains restricted to a loopback-bound API with `NODE_ENV` not set
to production, an authenticated account, and a matching owned character.

With an initialized fight, its start receipt at revision zero is required
to recover the **actual** starting Health. A mismatch between the character
Health and persisted fight state, a missing receipt, or an incompatible saved
stance blocks rewind without altering anything.

A successful rewind atomically deletes Stage 6 combat state/receipts,
clears stale Stage 5 action receipts, uses the approved
`previousWageClaim` transition to restore stance selection, restores
pre-combat Health, and moves the character back to Stage 5. It preserves
earlier jobs, route evidence, coins and skills. This control is
**not normal gameplay functionality**.

## Validation

- Stage 6 source regression must match the character-status CHECK.
- Developer rewind checks require pre-combat Health recovery, receipt
  invalidation and the loopback/production guard.
- The original 49 v0.5.1 combat tests, game-core unit tests, API type-check
  and SvelteKit build must remain green.
- End-to-end authenticated PostgreSQL/browser testing is needed to confirm
  the repaired final round on a real existing save.
