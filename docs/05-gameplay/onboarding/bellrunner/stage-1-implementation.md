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
  and choice buttons and `workshop-object-labels.css` framed plaques.
  Paper inspections now use the **same lower parchment dialogue frame**
  instead of popup text over the illustration. Both stages reuse the
  original style rather than generating extra scenic overlays. Hector's original artwork is not cut across the
  waist: the duplicate depot foreground masks only the bottom 7% of
  the scene, where the counter edge can cover his feet.
- **Immersive workstation layout shared by Stages 1–2:** both
  Bellrunner stages use the shared **scene** mode of
  `ActivityLayout.svelte` (see
  [Game shell and activity layouts](../../../07-technology/game-shell-and-activity-layouts.md)).
  When the activity container (not the window) is at least 880px wide,
  Hector's full-body portrait over the Depot illustration is on the
  left, and the parchment dialogue plus the original three job papers
  in the **Round Documents** tray share the reading column on the
  right. Narrower containers stack art → dialogue → documents. The
  art is sized from the measured space below the HUD so that Hector,
  the parchment and its first choice share the first screen. Spare
  ultrawide width becomes symmetrical gutters.
  Each framed card is one keyboard/click target with an Inspect
  affordance. The Route Sheet card changes to **Take Route Sheet**
  at the canonical final handoff, continuing through the same
  authenticated, idempotent `take_round` action. No redundant
  Review Route button or additional acceptance step is introduced.
  The parchment is **as tall as its content** (no stretching to the
  art column). It uses the owner nine-slice framing and button art,
  and anchors **Previous line** at its foot.
  Narrative progress actions may use the owner's highlighted button
  art; the optional topics, route alternatives and receipt choices
  remain visually neutral. The approved speech is reproduced
  verbatim, and inspection descriptions are shown in the parchment
  instead of popups over the painting.
  During Stage 2, the paper tray appears only at the Depot;
  street and receiving scenes retain their original art and
  dialogue-only controls. `ActivityLayout.svelte` owns placement,
  `pall-story-landscape.css` the shared visual treatment, and
  `BellrunnerDocumentTray.svelte` the shared cards.
  Chromium QA (`verify:bellrunner-layout-browser`) checks the actual
  responsive positions and NPC/paper interactions. The owner requested
  that the original **Grand Cylinder City header remain visible**. It
  stays at 88–136px, and now also carries the locked City map
  gateway. The earlier `compactBanner` suppression is not used.
  Bellrunner secondary choices now use pale framed parchment with
  ink-line icons; Continue uses a distinct dark-brass primary style.
  These button styles apply only to Bellrunner, leaving Millhand and
  the global owner UI kit unchanged.

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

At the handoff, the dialogue displays **Take the Route Sheet**,
with **Previous line** as its only button. Clicking the actual Route
Sheet object—its plaque now reads **Take Route Sheet**—calls
`POST /api/characters/:id/bellrunner/dispatch` using the existing
owner-checked, row-locked and idempotent `take_round` operation.
Other Depot papers remain inspectable but cannot advance the stage.
This action moves the character from Stage 1 NOT_STARTED to Stage 2
IN_PROGRESS. No money, XP, items or Major Skill levels are awarded.
The repetitive “Payment: Not yet cleared” status is never displayed
in these dialogue panels. Hector's optional, authored conversation
**About the payment** remains available by clicking the NPC asset.

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
3. **At the receiving desk**, the supplied location painting is
   static and free of floating task props, object nameplates and
   hotspots. A short first dialogue panel explains how the clerk's
   mark smears across the route sheet. **Continue** opens the
   receiver conversation with their two lines and the three honest
   dialogue choices. Checking the receiving book happens through
   that dialogue choice, never through an extra click on scenery.
4. **Two saved dialogue beats** follow the chosen response: the
   player's spoken request, then the receiver's reply and consequence.
   The book-check option includes the player's final ledger notation.
5. **The final sealed order** follows directly after the receiver
   responds. The earlier compulsory round-report panel provided no
   new mechanical or narrative result, so it has been removed from
   normal progression; the route and receipt proof remain saved for
   future Hauling reporting. The owner-approved final text states
   that the usual deliveries and marks are recorded but one sealed
   order still requires delivery to the marked address. Stage 3
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
