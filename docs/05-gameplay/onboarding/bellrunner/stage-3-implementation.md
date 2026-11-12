# Bellrunner Stage 3 — The Wrong Bell (implementation work in progress)

This is the next implementation after the accepted Stages 1–2, on a dedicated feature branch. The scene uses the shared TutorialShell and ActivityLayout (scene mode), with original painting left and a single contextual parchment on the right.

## Owner-approved inputs

- Original courtyard: `IndustrialCourtyard.png` (1672×941), generic empty environment. The optimized 1672×941 WebP is committed at `platform/apps/web/static/locations/industrial/industrial-courtyard.webp`.
- Night-shift bell: `BellRunnerBellCourtyard.mp3` (4.81 s), distinct from Hector's duty bell. Committed at `platform/apps/web/static/audio/bellrunner/night-shift-bell.mp3`.
- Exact revised watchman, three route choices and Hector return conversation: [approved scene source](wrong-bell-discovery.md), revised 2026-11-11. Runtime copy is in `apps/web/src/lib/bellrunner-stage3-copy.ts`.
- No people are painted into the background. Waiting workers and watchman remain dialogue-only until separately approved character artwork exists.

## Gameplay boundary

At `take_final_notice`, Stage 2 advances to Stage 3 in the same transaction as the final dispatch work-state update. Older saves already at `final_notice_taken` have the `enter_wrong_bell` continuation action.

Stage 3 has independent persistent state and request receipts in migration `0016_bellrunner_wrong_bell.sql`.
On the local development server, the shared **Back to Stage 2** button safely clears only Stage 3 investigation state, restores Stage 2 to its final-notice handoff, and keeps the completed courier work. Once the route has been committed and the character is at Stage 4, **Back to Stage 3** removes the selected route and reverses only its one-time +1 Major Skill bonus. Both rewinds are transactional and unavailable on production/non-loopback servers. Two inspections can happen in either order; the watchman sequence precedes branch commitment. The settlement ledger explains zero coins, zero ordinary XP, no items. On confirmation, exactly one Major Skill level is granted: Commerce, Medicine or Mechanics; the branch is locked and saved. No item, wage, medical status, combat or world-time data is invented.

After the watchman's final exchange, the coughing worker and repeated bell narration appear alone with **Continue**. The next local beat is **Choose what you will do next.**, rendering exactly three shared Millhand-style nine-slice second-job cards and their Major Skill / discipline plaques: Commerce / Contracts, Medicine / Trauma, Mechanics / Industrial Machinery. The optional **Compare the orders** inspection belongs only to the earlier evidence phase, never to the second-job choice. Choosing a card performs the existing server-owned branch action directly, as in Millhand. Approved branch dialogue then appears in two short Continue beats, followed by a third beat with the unpaid-round result and exact Major Skill award. Local Continue does not itself award skills or save progress. The page intentionally stops after the chosen Stage 4 handoff. **Stage 4 branch gameplay and the separate actor sprites are not implemented in this PR.** Hector's deferred optional return conversation is stored as approved copy but is not inserted into the forced Stage 3–4 path.

## Stage 3 stabilization — 2026-11-12

- **Evidence remains readable after inspection or refresh.** Once the player has read the posted closure or the sealed packet's outside dispatch slip, the visible evidence buttons change to **Review...**. Re-reading is a local presentation action: it does not POST again, advance the revision or repeat a reward.
- **Compare the orders is recorded once** while still inspecting the worksite. After comparison, the evidence panel offers **Review the comparison** locally. This action is not offered during the watchman conversation or on the three-option second-job choice screen.
- The initial worksite exposition appears once, during arrival/inspection. It is **not repeated** when the watchman starts speaking; the eleven approved lines are untouched.
- The Stage 3 night-shift bell SFX is available at the bell hotspot, once as the watchman encounter begins, and again on the final watchman **Continue**, immediately before the authored second-ring narration. It respects the SFX setting, not the shared depot ambience volume.
- The previous Stage 1/2 Hector component assertion and the shared Millhand/Bellrunner button-style assertion have been updated to test the architecture that is actually rendered.
- `verify:bellrunner-stage3` now tests all three branch commitments, rejection of repeated comparisons, the exact final narration, local read-only evidence review and the correct second-bell cue.

**Verification boundary:** source-level changes and regression tests are committed, but they still require the owner's local Node/Svelte checks and manual browser validation. No new assets or canonical dialogue were added.

## Installation and QA

1. Both owner-supplied binary assets are already committed at the exact SvelteKit static paths above. Their original Git blobs were moved from an accidentally nested `platform/platform/...` directory into the correct `platform/apps/web/static/...` directory without changing file bytes. Run `npm run verify:bellrunner-stage3-assets` to verify them.
2. From `platform/`: run `npm run bellrunner:migrate` and restart API.
3. Run `npm run check:web`, `npm run check:api`, `npm run verify:bellrunner-stage1` and `npm run verify:bellrunner-stage3`.
4. Play an existing Stage 2 save (including one at `final_notice_taken`) and a new Bellrunner through the sealed notice.
5. Inspect both objects in either order; advance each watchman line; try all three route branches on separate test characters. Refresh mid-dialogue. Confirm +1 exactly once and no coins/XP/item changes.
6. Verify mute/SFX slider, repeated bell cue, focus/keyboard access, mobile crop, and no second parchment.

Do not merge until web/API checks and the owner's visual/gameplay review have passed.
