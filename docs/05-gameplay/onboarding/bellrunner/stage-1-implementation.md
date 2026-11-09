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

Clicking Hector or choosing **Ask Hector something** shows six topics
in both Stage 1 and the saved Stage 2 Dispatch House:
work, receiving marks, routes, payment, Grand Cylinder City, and
the Plume/Pall. The verbatim owner lines are stored in
`approved-bellrunner-hector.ts`. Each turn appears once and progresses
only when the player clicks Continue. After each topic, **Ask something
else** returns directly to the topic list and **Return to the round**
returns to the preserved main assignment state. These topics are
client-only; they never write progress or grant rewards. The
`BellrunnerHectorConversation.svelte` component is shared between
both scenes, and returning to the work panel never resets the
current dispatch revision or route choice.

**Take the round** calls `POST /api/characters/:id/bellrunner/dispatch`
with owner authentication, transaction-locked character row, origin
and stage checks and an idempotent request receipt. It permanently
moves the character from Stage 1 NOT_STARTED to Stage 2 IN_PROGRESS
until an explicit local-only developer rewind. No money, XP, items or
Major Skill levels are awarded.

## Stage 2 courier activity

Source: `shift-dispatch-interaction.md` (approved) and the pure
transition module `bellrunner-dispatch-work.ts`.

The Stage 2 page follows the revised owner-approved **roleplay**
sequence, with no repeated "check the bundle", sorting or "make the
deliveries" confirmation panels:

1. **Choose the road immediately** after accepting Hector's round.
   The Short Route (internal `direct`) passes through the tight
   freight-yard backstreets and suggests possible thieves; the Long
   Route (internal `quieter`) takes the busy but more visible main
   roads. Neither currently rolls for threats, charges time, changes
   reputation or calculates travel rewards.
2. **One authored first-person journey scene** follows selection,
   preserving the owner's six route paragraphs *verbatim* in
   `bellrunner-stage2-narrative.ts`. **Continue to the delivery**
   moves directly to the scripted ordinary receiving incident.
3. **At the receiving desk**, narration establishes that the clerk
   accepted a council notice and smeared its mark across two address
   lines. The receiver acknowledges the bad ink *before* any choice.
   Select a fresh mark, cross-check the office book or record the
   unclear mark honestly; all three are legitimate.
4. **Two saved dialogue beats** follow the receipt choice: the
   player's spoken request, then the receiver's reply and the
   consequence. The book-check path includes the player's final
   ledger notation. Only after both steps can the round report open.
5. **Round report and final sealed order** retain the saved route
   and proof condition (`clear`, `book_confirmed` or
   `noted_unclear`). The sealed order remains unread, and Stage 3
   cannot start before its own implementation.

Historical `checked` and `book_checked` saves are still handled;
older API commands `check_round` and `sort_notices` remain
compatible but are not exposed to new players. New receipt-dialogue
phases are `receiver_reply` and `receiver_result`. These are
written to the existing `0015` JSONB work state, so this revision
needs no new schema migration.

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
