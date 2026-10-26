# Millhand Integrated Browser Slice — Milestone 01 (Stages 1–2)

**Status: EXECUTABLE LOCAL DEMO PACKAGED AND TESTED (2026-10-21). NOT THE FINAL GAME UI/UX. NOT PRODUCTION MULTIPLAYER CODE.** This is the first delivered portion of the [user-approved Millhand integrated implementation plan](first-integrated-playable-implementation-plan.md).

The companion download is **`The_Pall_Millhand_Slice_v0_1.zip`**, attached to the October 21 project conversation. It contains the Millhand source, tests, local server and the **entire unchanged combat v0.5.1 source and tests** under `prototypes/combat-v0.5.1/`. **The ZIP source is not yet committed to this GitHub repository.** This document records its status; do not mistake this page for a repository code release.

## Run

- Node.js 20+; unzip the archive; in `The_Pall_Millhand_Slice_v0_1/`, run `npm start`.
- Visit **http://127.0.0.1:8790** in a browser. The previous combat-only app remains independently runnable on port 8787 from `prototypes/combat-v0.5.1/` and is **not yet connected to the Millhand story**.
- `npm test` verifies the new state machine, local session storage and HTTP endpoints. `npm run test:combat` reruns the **unchanged** prior combat test suite.
- Local save data lives in `.demo-data/`; do not commit local saves.

## Implemented and verified

- **Character creation:** name and male/female *portrait placeholder*; STR / DEX / INT / RES 5; **50 maximum Health**, **20 coins**, **Craftsmanship +3 exactly once** and only **Basic Clothes + one Crude Small Bag**.
- **Stage 1 Guther Anvil dialogue:** the **verbatim approved lines** from [Guther's opening](opening-dialogue.md), including optional **“And the pay?” → “When their inspector accepts the lot.” → “You trust that?” → “No. You can ask him.”**, or skipping directly to approved convergence. **[Take the docket]** advances to Stage 2.
- **Stage 2 Smithing:** inspect the docket and blanks, match numbering dies, respond to the approved once-per-tutorial bent blank by **Straighten / Replace / Stamp as-is**, strike and inspect the imprint, correct or reject a flawed mark, finish batch and **return the docket**.
- **Real branch-dependent work consequences** within the prototype: straightening conserves workshop stock at qualitative time cost; replacement uses employer stock; stamping an uneven blank leads to a poor impression requiring a follow-up repair/discard decision. Exact material quantities, elapsed times and probability/grade formulas are still unapproved, so **none are invented as permanent economy numbers**. Employer-owned tools/plates are **never given to player inventory**.
- **Correct onboarding exceptions:** no first-job wage, ordinary XP, additional items or bonus skill levels. The +1 second Major Skill belongs to **Stage 3 route choice later**, not this build.
- **Honest Stage 3 boundary:** the **Missing Stamp** isn't revealed early and the player reaches only a **Stage 3 handoff marker**, not a fake playable revelation.
- Server-owned save and revision/receipt idempotency, local opaque session tokens, and browser resume. This is a **single-machine file-backed local test**, not a secure distributed MMO database.
- **Important interrupted-work bug fixed:** the choices after character creation are immediately actionable; they do **not** stay disabled after successful character creation.

## Verification results

- **42 / 42** new Node Stage 1–2 unit + HTTP tests passing. Includes both Guther dialogue paths, all blank choices, successful correction flow, no job reward, never exposing early Missing Stamp, character/session persistence, authentication token checks, duplicate/stale requests and actual HTTP action submissions.
- **49 / 49** tests passing for the **unchanged v0.5.1 combat suite**.
- Chromium browser completed the full **character creation → optional pay conversation → inspect/match → stamp bent blank → inspect → rework → batch complete → docket returned** path using a **mocked browser origin bridged to the actual local Node HTTP API**. The UI exposed the post-creation buttons, reached the Stage 3 boundary, and logged **zero JavaScript exceptions**.
- Direct Chromium navigation to localhost is blocked by this environment. **Do not overstate the simulated-origin browser test as a confirmed real same-origin network run; the user's own browser should verify it normally.**
- A temporary styled screenshot was generated for smoke-test comparison. This visual design is expressly **NOT approved or final**.

## Still to build

1. **Stage 3:** the exact approved *Missing Stamp* evidence reveal (cancellation slip and returned reference plate, both inspections, Guther's locked exchange) and three mutually exclusive route choices with **one-time +1** in the appropriate different Major Skill.
2. **Stage 4:** three actual Industry / Commerce / Scholarship work variants under the shared reusable job system.
3. **Stage 5:** two approved connecting interactions; forward *real* pre-combat positions and facts to Flint's encounter.
4. **Stage 6:** live integration of the existing v0.5.1 combat engine with persistent true victory/defeat and no compulsory hits.
5. **Stage 7:** correct 10-coin examination and condition-appropriate care without invented treatment.
6. **Stage 8:** shared home, 150-coin rent notice (not charged at tutorial) and verbatim approved closing speech.
7. **Version control synchronization:** commit the ZIP's tested source tree to a prototype path in GitHub before treating the repository as authoritative for executable code. The technical implementation plan anticipated this earlier, but **this GitHub sync is still outstanding**.

**UX boundary:** The user explicitly said that this prototype's UI/UX will not be the final interface. All current colours, screen layout, placeholders and copy outside locked spoken dialogue are temporary verification conveniences. Do not reinterpret them as the eventual city/workshop/main-game navigation design.

References: [approved Guther dialogue](opening-dialogue.md), [approved Smithing Stage 2](platework-interaction.md), [Millhand plan](first-integrated-playable-implementation-plan.md), [shared state contract](../shared-state-implementation-contract.md).
