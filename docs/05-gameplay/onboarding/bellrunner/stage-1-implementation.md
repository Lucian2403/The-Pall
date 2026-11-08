# Bellrunner Stages 1–2 — approved dialogue and ordinary courier interaction

**Implemented on PR #44, November 2026.** Stage 1 now uses the owner's
2026-11-09 replacement Hector dialogue, not the superseded four-line
October version. Six approved optional conversations are repeatable.
Stage 2 Shift Dispatch includes real persisted courier work. Stage 3's
Wrong Bell site and Stages 4–8 are not yet integrated.

## The scene and owner assets

- The existing `/locations/origins/bellrunner-depot.webp` supplies the
  Dispatch House backdrop. `depot-ambience.mp3` is claimed through the
  shared TutorialShell soundscape, subject to player audio controls.
- Owner Hector and three paper cutouts:
  `/characters/hector/hector-d-smoke.webp`,
  `/locations/bellrunner/council-work.webp`,
  `/locations/bellrunner/sealed-order.webp`, and
  `/locations/bellrunner/route-sheet.webp`.
  The original transparent source files were preserved; these are
  optimized WebP render assets. Paper cutouts are **task props**, not
  inventory items.
- `UI_DutyBell.mp3` is retained without transcoding at
  `/audio/bellrunner/duty-bell.mp3`. The ordinary duty bell plays once
  on explicit scene entry (button or clicking Hector before entry); it
  stops on unmount. The anomalous night bell belongs only to Stage 3.
- Shared owner-approved layout: `pall-owner-ui.css` nine-slice dialogue
  and choice buttons; `workshop-object-labels.css` framed plaques; and
  `WorkshopItemPopover` inspection cards. Both stages use these rather
  than new styling. Hector's original artwork is not cut across the
  waist: the duplicate depot foreground masks only the bottom 7% of
  the scene, where the counter edge can cover his feet.

## Stage 1 dialogue

Source: `opening-dialogue.md` and `approved-stage-one.ts`.
The opening proceeds through seven authored beats, including the
player's own response and Hector's reply. All beats require Continue
or a real action: no automatic skips, repeated selected lines, or
spontaneously generated dialogue.

Clicking Hector or choosing **Ask Hector something** shows six topics:
work, receiving marks, routes, payment, Grand Cylinder City, and
the Plume/Pall. The verbatim owner lines are stored in
`approved-bellrunner-hector.ts`. Each turn appears once and progresses
only when the player clicks Continue. After each topic, **Ask something
else** returns directly to the topic list and **Return to the round**
returns to the preserved main assignment state. These topics are
client-only; they never write progress or grant rewards.

**Take the round** calls `POST /api/characters/:id/bellrunner/dispatch`
with owner authentication, transaction-locked character row, origin
and stage checks and an idempotent request receipt. It permanently
moves the character from Stage 1 NOT_STARTED to Stage 2 IN_PROGRESS
until an explicit local-only developer rewind. No money, XP, items or
Major Skill levels are awarded.

## Stage 2 courier activity

Source: `shift-dispatch-interaction.md` (approved) and the pure
transition module `bellrunner-dispatch-work.ts`.

The Stage 2 page is now ordinary interactive work, not a placeholder
gallery. Its sequence is:

1. **Inspect route and notices**: verify the notice bundle against the
   sheet. Optionally put notices in destination order.
2. **Take the direct road / Take the quieter road**: one saved choice;
   shorter/crowded versus longer/less crowded. Durations, street names,
   weights, probabilities and skill thresholds remain unspecified,
   rather than being fabricated to fill UI fields.
3. **Make deliveries and record marks**: the tutorial's representative
   mundane smudged-mark event.
4. **Ask for a fresh mark / Check their receiving book / Note the
   spoiled mark and go on**: all three truthful routes save distinct
   receipt outcomes. Checking the book exposes an additional
   confirm-or-correct action; no forged mark or unapproved punishment.
5. **Round report / Finish the ordinary circuit / Take the final
   notice**: show chosen road, sorting and receipt state. The final
   sealed council order remains unread; Stage 3's closed worksite
   cannot be revealed ahead of the playable next scene.

Each command is `POST /api/characters/:id/bellrunner/dispatch/work`
with action, UUID request ID and expected current revision.
The server checks owner, origin, Stage 2 and the allowed phase, locks
the character and dispatch row, writes the new JSONB work state and
a receipt in one transaction, then increments the revision. Stale tabs,
duplicate commands, wrong phases, anonymous and other-account calls
do not mutate progression. Refresh and restart preserve the exact
route and receiving-mark evidence. Work receipts cannot survive a
development rewind. The action module is deliberately free of
Bellrunner-only UI strings so its ordinary courier transitions may
later be reused by paid dispatch jobs.

The playable slice **ends with the sealed notice in hand**, at the
boundary before Stage 3. Until Stage 3 is implemented, the character
remains at Stage 2 and no fake Stage 3 content or advancement is
issued. The exceptional tutorial job pays 0 coins, ordinary XP and
loot, as canon requires; the cause of the withheld payment belongs
to the future approved Wrong Bell discovery.

## Migration and local testing

The existing `npm run bellrunner:migrate` command now runs both
additive scripts `0014_bellrunner_stage1.sql` and
`0015_bellrunner_dispatch_work.sql`. No destructive reset is needed.
Run it when updating an existing Bellrunner branch, then restart API
and web servers.

For regression from a saved Stage 2, the shared
**← Back to Stage 1** header button calls the loopback-only developer
rewind. It clears the accepted round, Stage 1 and Stage 2 receipts,
then restores Stage 1. Starter clothing, bag, coins, Major Skill,
other characters and unrelated progress are untouched. The rewind
route is absent in production.

## Verification

- Exact original asset checksums.
- User-approved opening and each spoken Hector topic line compared
  against canonical Markdown; single-step dialogue navigation.
- No mid-body crop, shared owner frames and inspect popovers.
- Pure courier transition tests for road choices and three
  receiving-proof outcomes, plus state/phase guard tests.
- PostgreSQL owner checks, Stage 1 exactly-once acceptance, Stage 2
  optimistic concurrency and idempotency, complete receipt states,
  unchanged inventory/coins and rewind after partial work.
- Svelte build, API typecheck and existing Millhand suite.

**Owner visual playtest remains required** for Hector's proportions,
mobile object placement, longer optional topics and the duty-bell/
depot-ambience balance. The PR remains unmerged.
