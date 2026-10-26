> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# Millhand v0.3 M1 — Browser shell and full-page records (2026-10-22)

**PLAYTEST CORRECTION (2026-10-22): M1 NAVIGATION-ONLY PRESENTATION WAS REJECTED BY THE PROJECT OWNER.** Functional test results remain valid, but the owner found it to be the same dashboard with minor layout changes. This milestone must NOT be described as an approved UI/UX result. Subsequent work requires actual in-scene object interactions and a distinct Guther dialogue experience rather than only rearranged navigation. See the separately packaged interactive local prototype after this feedback; it also remains subject to visual review.

**Status: COMPLETED LOCAL FOUNDATION INCREMENT, NOT FINAL v0.3 UI.** This record follows the approved [v0.3 rebuild plan](v0-3-executable-ui-rebuild-plan.md). The runnable source is supplied as `The_Pall_Millhand_v0_3_M1_Foundation.zip` in the 2026-10-22 project conversation, **not yet committed as individual GitHub prototype files**. This milestone does not claim M2 spatial interactions, M3 action-delay/audio hook, or M4 documentary artwork are finished.

## Real modifications in M1
- Desktop left navigation offering only genuine available destinations: Workshop, Journal, Inventory, Character, Conversations.
- Responsive mobile bottom navigation for Workshop/Journal/Inventory/Character; Conversations accessible from the active Guther scene.
- Journal, Inventory, Character and Conversation History are now full-page routes rather than modal side drawers; navigation uses browser hash routes and updates active destination.
- Pages use actual character state: 20 starting coins, 50 maximum Health, 5 in each STR/DEX/INT/RES, Craftsmanship +3 and actual initial Basic Clothes/Crude Small Bag. Journal reflects current Stage 1/2 progress without Stage 3 disclosure.
- The same local storage save key and real `/api/characters` authorization/revision/requestId workflow are preserved. Navigating records is client-side only and does not execute game actions.
- The old v0.2 artwork is **temporarily retained and expressly not approved** under the newly locked global [Documentary Industrial Art Direction](../../../../../00-vision/art-direction.md). Screenshot samples are included solely for inspection of M1 routing and layouts, not to request final visual approval.
- Four additional source-code foundation tests assert real destinations, no fake system pages, retained authoritative action requests and responsive navigation rules. No new narrative, jobs, resources, reward, stage or underlying combat logic.

## Verification
- `npm test`: **46/46** passing (42 inherited Millhand plus four new UI foundation assertions).
- `npm run test:combat`: **49/49** passing with combat v0.5.1 preserved unchanged.
- Node source syntax passes.
- Chromium bridge to the real Node local server: created a Millhand, opened Journal full page, returned to the exact dialogue, performed a Stage 2 docket inspection, browsed Journal and returned to the correct die-matching step, switched to 390px mobile layout and opened full-page Inventory. No page JS exceptions. **The browsing environment blocked direct navigation to the local development host, so this is a bridge-assisted browser smoke test, not same-origin certification.**
- ZIP archive integrity checked; local saves excluded.

## Development still pending, in priority order
1. **M2:** Replace remaining v0.2 dialogue/work presentation: make workshop a genuine location with object-specific pointer/touch/keyboard interactions, focused Guther conversation, and visible plate condition. Remove always-visible work tracker and large right control panel from the primary experience.
2. **M3:** Add immediate busy acknowledgement and ~1.2s reveal cadence for committed actions, with named audio event slots; keep page changes instant and preserve server idempotency.
3. **M4:** Produce five coherent documentary-naturalistic asset studies and replace the temporary illustration where user-approved; non-cinematic practical light, archival typography only in documents/UI.
4. **M5:** Expand automated browser/playtest QA, archive working source and synchronize individual prototype source files into GitHub.

## Asset checkpoint
No user-provided assets are required to review or extend M1. Request the user's specific Guther appearance reference and workshop/city composition references **only once M2 fixes actual object positions and production framing**. Logo and archival artwork become useful during M4 interface polish, audio files once the M3 event list is stable.

## Running the foundation
Extract ZIP, enter `The_Pall_Millhand_Slice_v0_3_foundation`, run `npm start` using Node.js 20+; local browser URL: `http://127.0.0.1:8790`. Tests: `npm test`, `npm run test:combat`.

**Do not treat the M1 ZIP as the finished redesign.** It establishes navigation and full-page information architecture; the primary workshop interaction criticised in v0.2 still awaits M2.
