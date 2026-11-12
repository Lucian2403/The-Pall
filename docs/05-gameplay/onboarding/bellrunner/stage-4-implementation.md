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

## Trauma workflow

1. Approved Attendant opening (three individual beats).
2. Select which worker needs the attendant first. The worker struggling
   to speak is urgent. Selecting the other worker triggers the canonical
   staff correction; no simulated death or medical injury is imposed.
3. Choose **Take observations for the attendant** or **Bring the next
   worker to the attendant**; staff remain responsible for care.
4. Compare observed worksite and symptoms with the **Non-work illness**
   classification and worker-billed treatment charge.
5. Ask for the worksite to be added to notes, or ask why the worker
   is billed. Both lead to the four approved exchange beats.
6. **Finish the handover**. No new disease, treatment, supply, diagnosis
   or player medical item is created.

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
  The Dogman Stage 5 encounter is **not** implemented by this work;
  a clear stop screen is displayed, not a fake encounter.
- Local development-only Back to Stage 3 is allowed before Stage 4
  begins, safely removing the once-awarded branch skill. Once the job
  is in progress it is blocked; development-only Back to Stage 4
  from unopened Stage 5 returns to the saved completed-job handoff
  without affecting skills, coins or the completed work.
- No arbitrary timers, success probabilities, penalty values, diagnosis,
  formal register text beyond the explicitly illustrated category or
  skill multipliers are introduced. Their numerical contracts remain TBD.

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
