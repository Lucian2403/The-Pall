# Millhand — First Integrated Playable Implementation Plan

**Status: IMPLEMENTATION ROADMAP / PROPOSED TECHNICAL EXECUTION (2026-10-21).** The user agreed to progress beyond the satisfactory local combat v0.5.1 prototype into a complete playable Millhand chapter. This plan does **not** alter any locked narrative, starting resources, rewards, combat values, clinic price, or housing outcome. It is a local browser vertical slice, **not** a production MMO or claim that the chapter is already implemented.

## Inputs available

- Original runnable companion archive: `The_Pall_Combat_Browser_Slice_v0_5_1.zip` in the conversation; its source consists of `combat.mjs`, `server.mjs`, `store.mjs`, browser assets, and tests, with the existing 49 passing rule/API checks.
- [Millhand overview and all Stage 1–8 approved dialogue/content](README.md).
- [Shared onboarding structure](../shared-structure.md), [state and idempotency contract](../shared-state-implementation-contract.md), [six-origin clinic rule](../shared-clinic-examination-policy.md), [shared Stage 8](../shared-home-rent-ending.md).
- [Jobs and time rules](../../jobs/jobs-and-time.md) and [first playable geographic scope](../../../00-vision/first-playable-scope.md).
- Current project game-data workbook, for **read-only cross-checks** unless the user explicitly requests updates to game data.

## Recommended default

Use **Node.js local HTTP server + modular pure domain rules + compact browser client** initially, reusing the existing combat v0.5.1 as an **unchanged experimental engine baseline**. Introduce structured data/content separation and reliable local persistence with event/revision/idempotency safeguards. **Do not advertise the local JSON store as safe concurrent multi-user production persistence.** SQL schema, authentication and hosting can be decided when a production deployment is actually planned.

## Step 0 — Version-control the tested baseline

1. Commit the runnable v0.5.1 combat source and tests into a **clearly labelled prototype** directory in `Lucian2403/The-Pall`, with its original test conditions and balance disclaimers.
2. Do **not** overwrite locked documentation or silently replace combat v0.5.1's weapon/stamina/AI values.
3. Add a repeatable `npm test` and `npm start` workflow. Keep generated local save files out of Git.
4. Establish a separate integrated prototype app that *imports* shared combat functionality, rather than copying temporary code into each origin.

**Gate:** same engine tests and local browser combat remain usable from a clean Git checkout.

## Step 1 — Character creation and Stage 1–2

- Single persisted character record with canonical STR/DEX/INT/RES = 5, starting maximum Health 50, one chosen origin, Basic Clothes, Crude Small Bag, 20 coins; chosen origin awards its existing +3 Major Skill once at creation.
- Local vertical slice starts with **Millhand only**; UI architecture must later support all six origins.
- Implement Guther Anvil's **approved exact dialogue** and normal interactive workshop interface. Expose job preparation, tools/material checks, actual Smithing operations and explicit finish states.
- No ordinary wages, XP or new loot for introductory first task despite reusing the normal Smithing job engine: the narrative's exceptional pay/acceptance is honored.
- Save/reload may not duplicate background bonus, job completion or props.

**Gate:** create → converse → work → valid approved completion with correct resources on replay.

## Step 2 — Missing Stamp, second-task choice and branch execution

- Stage 3 clue appears *only after* the actual Stage 2 action/acceptance prerequisites. Use approved scene data.
- Exactly one of the three Stage 4 routes is selected and durably sealed; +1 level in that route's **different Major Skill** is granted **once on commitment**, not at the later job finish.
- Reuse the generic work-phase engine with route-specific approved Industry, Commerce and Scholarship mechanics/conditions and no tutorial wage/ordinary XP.
- Preserve each route's evidence and custody. A second route's findings must never bleed into narrative/flags.
- Stages 5's two linking interactions use existing approved dialogue, note facts, actors and position choices. Store `precombat_position` for actual combat geometry where supported.

**Gate:** 3 branches each advance legitimately without extra coins, levels or cross-branch knowledge; stale requests reject.

## Step 3 — Stage 6 combat adapter

- Feed precombat position, current Health/Stamina/conditions, legitimate equipment and NPC to existing v0.5.1 combat; no forced hits or injuries.
- Persist `PLAYER_VICTORY` or `PLAYER_DEFEAT` once. Both outcomes naturally lead to the approved after-fight scene and care, with the correct Flint-specific persistence for future encounters.
- Preserve Flint's published 14–17 club trial, experimental AI and 1.25-second client reveal **as test fixtures**, not new canon.
- Combat outcome cannot be rerolled through reload or duplicate transitions; no tutorial combat loot, wages or XP.

**Gate:** every Stage 4 route supports both reachable fight outcomes for **six Millhand end-to-end combinations**, and a clean untouched victory is legitimate.

## Step 4 — Stage 7 clinic and Stage 8 shared home

- Clinic uses genuine current Health/wounds; `Examine → Review price → Pay 10 coins → Leave` is one server-authoritative, idempotent service including appropriate basic care if needed.
- Unhurt branch explicitly says **“No injuries found. No treatment needed.”**, restores no fictional Health, applies no bandage.
- Defeat-safe helper transition is narratively appropriate; no forced injuries or inventory confiscation.
- The final playable state has **10 coins** when no unrelated spending occurs, shared starter home and **150-coin rent notice**. The rent is revealed and **not collected** in the tutorial.
- Millhand's approved closing speech is used **verbatim**; game state and branch history remain saved after completion.

**Gate:** one payment per character, no double healing, no premature rent collection or overwritten narrative.

## Step 5 — End-to-end QA and delivery

- Automate **3 chosen routes × 2 true combat outcomes = 6 Millhand end-to-end scenarios** with character/skill/coin/item/Health/notes invariants.
- Expand with perfect no-damage, real wound/bleed, defeat-assisted arrival, route-specific evidence, repeated submission, browser refresh/restart and two-tab stale revision cases.
- Release locally runnable ZIP plus committed source, documented `npm start` and `npm test`, a changelog and known limitations.
- Gather user's real hands-on feedback before building the other five origins.

## System modules to keep reusable

`character-core`, `jobs-core`, `dialogue/choice runner`, `quest-stage machine`, `combat adapter`, `clinic service`, `inventory/economy ledger`, `server persistence`, `browser UI`. Approved game dialogue is **content data**, not hardcoded control flow; all writes must be validated server-side.

## User input needed now

**None.** The tested combat ZIP, game-data workbook and approved Millhand/GitHub narratives are already accessible in the project conversation. Technical defaults may be used for the local test app without deciding final MMO stack, server hosting, art, sound or visual identity. Seek the user's explicit decision **only if** an unapproved new story interaction, permanent numeric rule or substantive UX direction becomes essential. User participation is principally milestone playtesting and accepting/refining choices.

**Open, not silently approved:** full first-30-minutes pacing, location maps and assets, job duration and resource costs, authenticated MMO deployment, shared multiplayer trading, persistent database choice, medicine recovery numbers and future equipment/abilities.

**Next actual action:** import and commit the tested v0.5.1 source under a prototype path, then build the smallest runnable **character creation → Guther opening → Smithing Stage 2** increment and run tests before implementing Stage 3 onward.
