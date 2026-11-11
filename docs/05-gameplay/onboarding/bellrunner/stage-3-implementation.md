# Bellrunner Stage 3 — The Wrong Bell (implementation work in progress)

This is the next implementation after the accepted Stages 1–2, on a dedicated feature branch. The scene uses the shared TutorialShell and ActivityLayout (scene mode), with original painting left and a single contextual parchment on the right.

## Owner-approved inputs

- Original courtyard: `IndustrialCourtyard.png` (1672×941), generic empty environment. Optimized 1672×941 WebP should be copied to `platform/apps/web/static/locations/industrial/industrial-courtyard.webp`.
- Night-shift bell: `BellRunnerBellCourtyard.mp3` (4.81 s), distinct from Hector's duty bell. Copy to `platform/apps/web/static/audio/bellrunner/night-shift-bell.mp3`.
- Exact revised watchman, three route choices and Hector return conversation: [approved scene source](wrong-bell-discovery.md), revised 2026-11-11. Runtime copy is in `apps/web/src/lib/bellrunner-stage3-copy.ts`.
- No people are painted into the background. Waiting workers and watchman remain dialogue-only until separately approved character artwork exists.

## Gameplay boundary

At `take_final_notice`, Stage 2 advances to Stage 3 in the same transaction as the final dispatch work-state update. Older saves already at `final_notice_taken` have the `enter_wrong_bell` continuation action.

Stage 3 has independent persistent state and request receipts in migration `0016_bellrunner_wrong_bell.sql`. Two inspections can happen in either order; the watchman sequence precedes branch commitment. The settlement ledger explains zero coins, zero ordinary XP, no items. On confirmation, exactly one Major Skill level is granted: Commerce, Medicine or Mechanics; the branch is locked and saved. No item, wage, medical status, combat or world-time data is invented.

The page intentionally stops after the chosen Stage 4 handoff. **Stage 4 branch gameplay and the separate actor sprites are not implemented in this PR.** Hector's deferred optional return conversation is stored as approved copy but is not inserted into the forced Stage 3–4 path.

## Installation and QA

1. Install both binary assets at the exact paths listed above. They are not automatically committed by this text-only editing connector. The asset ZIP was prepared separately from the owner's uploads; do not substitute unrelated stock art.
2. From `platform/`: run `npm run bellrunner:migrate` and restart API.
3. Run `npm run check:web`, `npm run check:api`, `npm run verify:bellrunner-stage1` and `npm run verify:bellrunner-stage3`.
4. Play an existing Stage 2 save (including one at `final_notice_taken`) and a new Bellrunner through the sealed notice.
5. Inspect both objects in either order; advance each watchman line; try all three route branches on separate test characters. Refresh mid-dialogue. Confirm +1 exactly once and no coins/XP/item changes.
6. Verify mute/SFX slider, repeated bell cue, focus/keyboard access, mobile crop, and no second parchment.

Do not merge until binary assets are installed and visual/gameplay review has passed.
