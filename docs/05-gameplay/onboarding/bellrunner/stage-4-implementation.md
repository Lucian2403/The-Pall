# Bellrunner — Stage 4 implementation (November 2026)

**Status: implementation on a feature branch; owner manual acceptance and CI still required.**
This document describes the implementation of the already approved
[three second jobs](second-task-branches.md). It does not revise that
canonical story or approve previously TBD numerical game systems.

## Owner art decision — existing backgrounds only

The player explicitly approved reuse of the project's **existing**
paintings and sound. No new generated character, paper, machinery,
blueprint, background or bell asset is required.

| Stage 3 selection | Stage 4 scene | Reused location art | Shared ambience |
| --- | --- | --- | --- |
| Commerce / Contracts | Attendance Certificate — shift-office records counter | `/locations/contracts/contracts-office.webp` | existing Council Office ambience |
| Medicine / Trauma | First Aid Line — staffed clinic setting | `/locations/clinic/clinic-workshop-cold.webp` | existing Medical Clinic ambience |
| Mechanics / Industrial Machinery | The Bell Linkage — accessible exterior controls | `/locations/industrial/industrial-courtyard.webp` | existing Hector / Industrial Courtyard ambience |

The available `/audio/bellrunner/night-shift-bell.mp3` is used as a
separate SFX on the first exterior safety-linkage inspection. It uses
Effects Volume, not Ambience Volume. **No supplementary mechanism art** is
created for a single-use tutorial encounter. The shutdown state and
bell drive are presented as distinct *textual observation panels* while
the trained mechanic supervises passive inspection outside the gate.

NPCs speak as role labels — Clerk, Attendant, Mechanic — with no
new personal names or invented sprites. All player speech uses the
shared uppercase `YOU` renderer. Dialogue appears one approved line
at a time, with Continue, not as a scroll of large blocks.

## Contracts workflow

1. Approved shift-office opening conversation (five individual beats).
2. Compare the closure notice and shift book: match the closed work block
   against the night crew's listed shift.
3. Examine the attendance category: *Absent by choice*, with the worker's
   wage marked not payable, despite the official fume closure.
4. Choose **Request the basis for the absence entry** or **Enter a
   written objection**. Both are honest ordinary Contracts methods.
5. Four approved revelation beats. **Submit the disputed certificate**.
   The clerical record stays disputed; the worksite's missing receiving
   mark is not forged or retroactively supplied.

## Trauma workflow — owner dialogue revision, 12 November 2026

Only the First Aid Line conversations described here have been revised.
The existing Contracts and Industrial Machinery dialogue remains untouched.
The authoritative full spoken/narrative script is in
[Route B — First Aid Line](second-task-branches.md).

1. Two narration beats introduce the workers. The attendant's spoken
   request appears in a third beat **with both player choices directly
   beneath the dialogue**: help the man struggling to breathe or help
   the man who can still walk and talk.
2. The selected priority triggers its own saved dialogue sequence:
   **YOU → ATTENDANT → narration** for the urgent worker, or
   **ATTENDANT → narration** when the other worker was chosen first.
   The urgent patient is always brought to the trained attendant.
3. **First Aid Line — Helping the Attendant:** one narration beat,
   three spoken beats and the choice between recording the worker's
   account and bringing the next worker over. The buttons appear
   under the last attendant line, not a separate documentary screen.
4. **First Aid Line — The Medical Register:** six short beats covering
   the notes (or the parallel worker-escort introduction), attendant
   handover, discovered **Non-work illness** entry, worker-billed
   charges and the player's incredulous response. One action,
   **Ask the attendant why the illness is classified as
   non-work-related**, replaces the old comparison and two
   redundant register-choice buttons.
5. Nine owner-authored revelation beats, including the attendant's
   limited authority, the second cough and her return to the
   treatment bench. **Finish the handover** is displayed under the
   last narration beat, without an extra mechanical task-summary page.

The new server-owned `triageLine`, `detailLine`, and `registerLine`
counters are persistent JSON work state; older Stage 4 saved states
without them use zero. The earlier phases `inspect`, `choose`,
and `finish` remain readable for users who saved partway through
the previous version, without displaying the retired data tables.
No treatment, medical diagnosis, personal item or second skill award
was added.

## Industrial Machinery workflow

1. Approved City-Works Mechanic opening (three individual beats).
2. Observe the two conflicting conditions: safety shutoff **engaged**
   but bell linkage **still actuating**. The bell SFX is heard at the
   recorded inspection beat.
3. Choose **Trace the bell rod** or **Compare the stop and its linkage
   marks**. Both reveal the retaining pin positioned past the stop.
4. **Show the mechanic the held-open link**, then choose to **Mark the
   pin's position on the work sketch** or **Request a second check**.
5. Four approved revelation beats. **Record the inspection**. No
   machinery operation, repair, fume exposure, part collection or
   unapproved restoration of the site occurs.

## Shared save/progression contract

- The committed Stage 3 branch is read server-side; HTTP clients
  cannot select another Stage 4 branch.
- Migration `0017_bellrunner_second_job.sql` adds independently
  versioned Stage 4 work state and idempotency receipts. Apply it through
  `npm run bellrunner:migrate`, which now applies Stages 1–4.
- The route action is authenticated, account-scoped, phase-checked,
  optimistic-revision-checked and protected with request-hash receipts.
  Concurrent duplicate submission cannot run the work twice.
- The character receives **no second skill award** in Stage 4.
  There are **no new coins, XP, loot or inventory items**.
- The local finding, honest method and optional staff triage correction
  are recorded in saved state and shown in the shared Personal Journal.
- A completed job exposes **Continue to the outside service gate**.
  This marks Stage 4 as `exited` and moves the character to Stage 5.
  The Dogman Stage 5 encounter is **not** implemented by this work.
  Until it exists, the exterior-gate screen shows a brief in-world
  narrative ending, not a debug screen, technical recap or fake encounter.
- **Owner requirement: the local-only `← Back to Stage 3` button
  remains visible throughout Stage 4**, including opening dialogue,
  records/inspection, choice, revelation and completed-job handoff.
  Rewind holds an owner-scoped character lock, clears Stage 4 state and
  idempotency receipts and reopens the Stage 3 route decision, reversing
  exactly the selected route's one-time +1 Major Skill award. The
  character's coins, Health, items, earlier courier work and other
  skills are preserved. A repeated rewind is rejected. This destructive
  developer replay is unavailable on production/public API hosts.
  Development-only Back to Stage 4 from unopened Stage 5 keeps the
  already completed job and awarded skill, undoing only the departure.
  The same rewind requirements are **mandatory for all future stages**
  and verified in CI by `verify:dev-rewind` and PostgreSQL tests.
- No arbitrary timers, success probabilities, penalty values, diagnosis,
  formal register text beyond the explicitly illustrated category or
  skill multipliers are introduced. Their numerical contracts remain TBD.

## Stage 4 — do not echo the story in data cards

**Owner review, 12 November:** the previously rendered `WORKSITE NOTICE`
and `SHIFT BOOK` boxes beneath *Attendance Certificate* repeated the
narration above them. The same defect existed later in Contracts
(`ATTENDANCE CATEGORY`, `WAGE COLUMN`) and in *The Bell Linkage*
(`VENTILATION SAFETY SHUTOFF`, `SHIFT BELL LINKAGE`, `RETAINING PIN`).
These boxed readouts and adjacent developer-style explanatory notes have
been removed from **all Bellrunner Stage 4 paths**.

Keep the original visible actions, branch-dependent outcomes and saved
journal facts. Present what the player sees through one natural narrative
beat or character dialogue, **not** an extra status/worksheet underneath.
Genuine inspectable world objects in other stages are different: those
remain interactive, but must not restate information already delivered.
`verify:bellrunner-stage4` explicitly forbids these cards from returning.

## Immersion rule — no post-choice reward ledger

The owner rejected a third, technical dialogue screen following a route
choice (for example: `Payment: 0 coins`, `Major Skill increased +1`,
`Next:` and `Your choice is recorded`). In all three Bellrunner Stage 3
branches, the final `Continue` after the approved response and
consequence now navigates **directly** into the chosen Stage 4 activity.
The same rule removes the out-of-world Stage 3 route/skill footnote in
Millhand and technical payout remarks in Stage 4.

The skill award and economy remain saved exactly as before; their values
belong in HUD, Character Sheet and journal, not in the story parchment.
Stage 4's own handoff and temporary Stage 5 boundary are narrative only.
`npm run verify:story-immersion` enforces this across existing and future
narrative scenes and is part of web checks and CI.

## Acceptance

From `platform/`:

```sh
npm run bellrunner:migrate
npm run verify:bellrunner-stage3
npm run verify:bellrunner-stage4
npm run verify:dialogue-speakers
npm run check:api
npm run check:web
npm run build -w @the-pall/web
```

Manually verify three separate Bellrunner test characters from Stage 3
through each Stage 4 job. Confirm refresh midway through an opening
conversation and each ordinary work stage, all method combinations,
normal and corrected patient ordering, accurate per-route journal
facts, zero repeat skill awards, and Back to previous Stage behavior.
Confirm existing artwork fully appears without cropping or a 404 at
wide/narrow layouts; existing ambience follows the active location and
the bell uses SFX volume.

GitHub source commits do not in themselves certify web rendering or
database persistence. Keep the pull request as Draft until CI and
the owner's manual tests are complete.
