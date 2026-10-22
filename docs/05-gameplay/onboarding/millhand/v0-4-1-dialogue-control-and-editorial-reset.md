# Millhand v0.4.1 — Dialogue playback correction and editorial reset

**Status: LOCAL CORRECTIVE BUILD TESTED; WRITING/UX NOT YET USER APPROVED (2026-10-22).** Runnable source archive is supplied in the project conversation as `The_Pall_Millhand_v0_4_1_Dialogue_Control_Fix.zip`. Individual source files are not yet committed to GitHub.

## Why this patch was required
The player reported that Missing Stamp and later dialogues were hidden and conversation progressed without selecting a response. Inspection of `public/app.js` in v0.4 confirmed `beginConfrontationExchange()` called `setTimeout(advance, 1350)`, advancing Stage 3 lines on a timer while response choices were hidden until the sequence ended. Stage 4's approved NPC exchanges were added as whole blocks to `state.dialogue`, but the workshop view exposed at most the final NPC line. Guther's route-specific response could disappear during the instantaneous transition into Stage 4.

This was a **presentation/control bug**, not permission to edit the user-approved narrative or bypass server rules. The requested 1.2-second cadence applies to the reveal **after a committed player action**, not automatic progression through scripted speech.

## Implemented in v0.4.1
- Every line of the Stage 3 Guther exchange appears one at a time. A visible player-operated **Continue conversation** control advances to the next line; the three route responses only appear after the last line is consciously dismissed.
- After a Stage 3 branch selection, the two approved route-specific Player/Guther lines are shown instead of being hidden by immediate Stage 4 render.
- The Depot Clerk (six lines), Contracts Clerk (six lines), and Archive Assistant (five lines) exchanges are all displayed with explicit player-initiated progression. Player and scene description lines remain visible.
- While a required conversation is ongoing, workshop/document objects cannot execute an action that would skip it.
- Browser restoration offers the currently relevant required dialogue from the beginning if the session was interrupted. No new game action is submitted merely to advance locally displayed prose.
- Original `millhand.mjs`, persistence mechanics, character benefits, reward policy, branch logic and combat v0.5.1 source are unchanged. Dialogues are **not rewritten** in this patch.

## Tests
- `npm test`: **70/70 passed** (3 new dialogue-control regressions; legacy autoplay assertion replaced by player-control assertion).
- `npm run test:combat`: **49/49 passed** (unchanged combat core).
- Bridge-assisted Chromium against real Node API: complete Stage 1–4 Contracts path, including ~2.3-second idle at Missing Stamp first line with no advance, ten individually advanced Missing Stamp lines, two individually advanced Guther branch lines, ~1.75-second idle at clerk's first line, six individually advanced clerk lines, object controls disabled during conversation, and successful Stage 5 boundary handoff. No JS page errors. Localhost direct-navigation restrictions still apply.

## Editorial decision recommendation — NOT A LOCKED REWRITE
The owner dislikes all existing scene wording, dialogue and interaction copy despite earlier approvals. **Do not expand into Stage 5+ with the current voice.** First keep the Stages 1–4 mechanics and factual story skeleton, while reviewing every line of direct speech, narrative scene prose, journal text, object inspection, wrong-object humour and transitional cues. Assess natural 19th-century-influenced working speech, character distinctions, credible actions, economy of prose, deliberate tone and clear in-world information. The random remark bank is particularly likely to sound repetitive or arbitrarily comic despite its count.

Previous text approval is not irrevocable. The **next design milestone** should be an editorial pass with new scene-by-scene dialogue samples and visual inspection, accepting/adjusting the writing before expanding Flint's confrontation, clinic and home. Do not silently change approved dialogue during this bug-fix patch and do not pretend that this patch itself satisfies the creative revision.

References: [Stages 1–8](README.md), [approved Stage 3 original](missing-stamp-discovery.md), [approved Stage 4 original](second-task-branches.md), [v0.4 implementation record](v0-4-stage3-stage4-unguided-implementation.md).
