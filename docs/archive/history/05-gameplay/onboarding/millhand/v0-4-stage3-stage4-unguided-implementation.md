> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# Millhand v0.4 — Unguided workshop, Missing Stamp and the three Stage 4 routes

**Status: PLAYABLE LOCAL IMPLEMENTATION TESTED, NOT YET USER APPROVED (2026-10-22).** The runnable project is supplied in the project conversation as `The_Pall_Millhand_v0_4_Stages_3_4.zip`. GitHub holds this documentation but **not** the executable source tree as individual committed files. This is a real new playable milestone after the v0.3 interactive correction, not a restyling-only milestone.

## User request implemented
- Remove the correct-object highlighting throughout work. The player must read the work instruction and select the relevant prop. The former `next-target` class, target border and hints naming the correct object were removed.
- Wrong-object clicks have in-character local responses drawn from 60+ authored variants across object and route contexts, including occasional restrained adult humour. They are not fake NPC speech or canonical new dialogue, never POST a gameplay action, never spend an in-game turn, and cannot mutate coins, skill, injury or job state.
- Preserve 1.2-second result reveal for meaningful actions, immediate busy feedback, read-only page navigation and audio event hooks; numbered keys are optional.
- Preserve the UI as **temporary** and maintain the approved documentary-industrial art doctrine. The Stage 3–4 document/prop placements are schematic, not final artwork.

## Stages delivered
**Stage 3 — The Missing Stamp** is fully playable after Stage 2 docket return. Examine returned reference plate and number-cancellation slip in either order; both are required to observe the same worker number and inspector date after death. Exact worker ID and dates are still TBD, so no numbers are invented. The complete eight-line approved Guther exchange is retained verbatim and shown through successive focused utterances. One irrevocable choice — Restamp, Question or Record — grants exactly one +1 rank in Industry, Commerce or Scholarship. The selected route is persisted once with server-side idempotency.

**Stage 4 — all three routes implemented**:
- Depot Intake Run / Industry-Hauling: one permitted corrective worker-number mark, load check, meaningful handling-method choice, physical delivery and manifest comparison, truthful received-goods record or additional acknowledged dispute, final receipt. Approved Depot Clerk speech retained.
- Disputed Docket / Commerce-Contracts: issuing docket, contradictory accepted sealed categories, two different contest methods, unresolved submitted objection; approved clerk speech retained.
- Ledger Reconciliation / Scholarship-Investigation: death register, later wage tally, damaged correction, evidence check via neighbouring entries or shift book, journal discrepancy; approved Archive Assistant speech retained.

All tasks are unpaid with no ordinary XP, loot, tradeable props or additional character reward. Route evidence appears only in its corresponding Journal. Stage 4 completes at the **Stage 5 boundary**, where Flint's Wage Claim and integrated combat are **not yet playable**; their later mechanics remain separate.

## Verification
- `npm test`: **67/67 passed** (previous baseline plus Stage 3/4, alternatives, skill-once, unauthorized action, persistence and client regression checks).
- `npm run test:combat`: **49/49 passed**, combat v0.5.1 source unchanged.
- Playwright Chromium browser, via a bridge to the real Node API: wrong hammer selection without state progression; full Stage 1→3→Contracts Stage 4 route, Journal, 390px mobile. No page JS errors, no mobile horizontal overflow. This is a bridged smoke test due to the runner's localhost navigation restriction, not a true same-origin browser certification.
- Zip archive integrity passed. Existing local character session key retained; older `handoff` marker saves are transparently advanced to real Stage 3 evidence scene.

## Outstanding work / visual caveat
User described v0.3 layout as **better, not good**. No final UI, Guther look, worksite/object art, sound, numbers, world clock or numerical handling risk/duration values are approved here. All three Stage 4 routes use a scene with clickable schematic props so their authorised actions can be tested immediately; production spatial rendering and documentary-naturalist art remain unfinished.

Next coherent milestone is Stage 5 The Wage Claim and Cornered using the locked branch-specific Flint dialogue, followed by integration with the proven combat v0.5.1 engine in Stage 6. Do not pretend that the old standalone combat demo is already wired into Millhand, and do not implement the clinic or home until real combat result/health persistence is available.

References: [approved Stage 3](../../../../../05-gameplay/onboarding/millhand/missing-stamp-discovery.md), [approved Stage 4](../../../../../05-gameplay/onboarding/millhand/second-task-branches.md), [Stage 5 locked dialogue](../../../../../05-gameplay/onboarding/millhand/flint-confrontation.md), [art doctrine](../../../../../00-vision/documentary-industrial-art-direction.md), [v0.3 interactive correction](v0-3-interactive-correction-after-rejected-m1.md).
