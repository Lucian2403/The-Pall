# Millhand First Integrated Playable v0.1 — Character Creation + Stages 1–2

**Status: EXECUTABLE LOCAL IMPLEMENTATION BUILT AND TESTED (2026-10-21). PRE-PRODUCTION, NOT FINAL UI/UX.** The associated user explicitly cautioned that this is **NOT** the final user interface or experience; it is only a **temporary testing shell**. The project conversation supplies `The_Pall_Millhand_Slice_v0_1.zip` as the runnable **source archive**, including the preserved combat baseline. **This GitHub document records the milestone; the runnable source is not yet committed as individual repository files.** Do not claim the code is already in GitHub or the full eight-stage tutorial is finished.

## How to run the local artifact

Unzip `The_Pall_Millhand_Slice_v0_1.zip`. From the extracted `The_Pall_Millhand_Slice_v0_1` directory run:

- `npm start` → open **http://127.0.0.1:8790** (Node.js 20+, no external dependencies).
- `npm test` → the new character/dialogue/Smithing engine and HTTP state suite (**29/29 passing**).
- `npm run test:combat` → **original unchanged v0.5.1 combat engine and HTTP tests (49/49 passing)**. The combat prototype lives under `prototypes/combat-v0.5.1/`; it has **not yet been joined to the Millhand Stage 6 story**.
- `npm run demo:combat` → old terminal combat demonstration.

The standalone combat app uses local port **8787** when launched from its own prototype directory; the new character/work app uses **8790**. There is no production backend, login, SQL database or multiplayer environment.

## Actually implemented

**Character creation**
- Millhand origin, name and the two **male/female portrait selectors as placeholders**, not actual portrait art.
- STR / DEX / INT / RES each **5**, Craftsmanship Major Skill +3 granted once, max Health **50**, Basic Clothes and **one Crude Small Bag**, **20 coins**.
- Current Stamina **90** is a clearly marked *prototype working value*, not a locked permanent pool or automatic refill policy.

**Stage 1 — Guther Anvil**
- Approved **exact spoken dialogue**: council lot opening, optional pay question and trust exchange, and the foreman's final docket instruction. Skipping optional dialogue does not alter work rewards.
- `Take the docket` changes to Stage 2; docket, numbering dies, hammer and prepared stock remain **employer-owned worksite props**.

**Stage 2 — reusable Smithing interaction**
- `Inspect docket and blanks` → `Match the dies to the docket` → once-per-tutorial bent-corner complication.
- Three valid work choices with actual recorded distinctions: **straighten** (extra handling, same blank), **replace** (employer-stock replacement / rejection count), or **stamp as-is** (poor impression with forced appropriate rework/discard before completion).
- `Strike the mark` → `Check the impression` → optional corrective work → `Complete platework review` → `Return the docket`.
- `smithing_match_marks`, `smithing_blank_seating` and `smithing_mark_and_verify` represented as reusable module definitions in the pure rule engine; phase rules validate legal sequencing on the server.
- **0 coins, 0 ordinary XP and zero new inventory items** from the unpaid disputed tutorial task. No special +1 second-skill gain yet.
- Ends with Stage 2 complete **before** Stage 3 Missing Stamp. Absolutely **no early evidence disclosure** or invented reference ID, worker serial, inspection date, world time/duration or paid job reward.

**Persistence and validation**
- Node HTTP server binds to `127.0.0.1` and writes local saves under `.demo-data/`; atomic file replacement, character-local revision numbers, request ID receipts and in-process serialized actions support refreshing, restarting, replay protection and rejecting stale or forged submissions.
- Validation for legal character names, portrait type, action family/choice, stage, sequencing and unauthorized session access.
- Browser retains an opaque local test token and resumes progress. A "different local character" button changes the active browser token without claiming to delete old server saves.
- Temporary compact dark UI with simple dialogue text, choice buttons and optional recent activity. **This is a throwaway testing interface and does not express approved product art, layout, iconography, sound or final UX.**

## Verification evidence and limits

- **29/29** new Node tests passed, including all three blank responses, optional pay exchange/skip, forged actions, stage-gated requirements, basic save/reload and stale/concurrent request idempotency.
- **49/49** inherited original combat tests passed untouched; total **78/78** across distinct suites.
- HTTP smoke test to local `/api/health` returned 200.
- Chromium **direct localhost navigation** remains blocked by administration in this execution environment. A Chromium `set_content` UI test using a **Python bridge to the real Node server/API** completed character creation → optional Guther dialogue → as-is bent blank → rework → return docket, with screenshots captured at Stage 1 and Stage 2. This is a bridge-based UI smoke test, **not same-origin live-browser E2E certification**.
- During the browser smoke test a real issue was corrected: initial dialogue choices were disabled after creation because the busy flag wasn't cleared before rerender. It is fixed in the attached artifact.
- The interface intentionally has no job timers, item recipes or avatar art while those specs remain open. Browser-visible prose for routine choices is illustrative; **approved Guther dialogue words are untouched**.

## What is NOT implemented yet

Stage 3 Missing Stamp revelation/dialogue and all three branch choices; Stage 4 Industry/Commerce/Scholarship jobs; Stage 5 Flint narrative and positional handoff; combat/character-state connection in Stage 6; Stage 7 actual clinic and fixed one-time 10-coin service; Stage 8 same shared home/150-coin rent notice; six-origin/36-permutation cross-testing; standard paid jobs/XP; trading; multiplayer world.

**Repository follow-up, not completed:** import this tested prototype's **individual source files** (including the untouched v0.5.1 combat modules) into a GitHub prototype directory. The ZIP currently holds the actual code; this note is the source-of-truth pointer and acceptance record, not a claim that the source itself has been versioned in GitHub. After source import, a clean Git checkout must pass both 29 and 49 tests.

**Next milestone:** user playtests the actual flow and feedback; then implement the **Stage 3 Missing Stamp** exactly as approved (two inspections, Guther exchange, three choices, +1 different Major Skill once) without exposing any of its story clues during the ordinary work task.

References: [Millhand locked overview](README.md), [Guther opening](opening-dialogue.md), [Smithing task](platework-interaction.md), [Stage 3 Missing Stamp](missing-stamp-discovery.md), [integrated implementation plan](first-integrated-playable-implementation-plan.md), [shared state QA](../shared-state-implementation-contract.md).
