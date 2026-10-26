> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# Millhand browser UI v0.2 — CRPG presentation and implemented local prototype

**Status (2026-10-21): USER-REQUESTED UI/UX REDESIGN IMPLEMENTED IN LOCAL RUNNABLE ARCHIVE, NOT FINAL ART.** The October 21 project conversation supplies `The_Pall_Millhand_Slice_v0_2.zip`. This repository document records the milestone; **the v0.2 runnable source and generated test assets are not yet committed as individual repository files**. Do not confuse documentation with a deployed browser game.

## What changed
The v0.1 all-purpose dashboard/event-log presentation is deprecated. The new browser shell has independent presentation modes: a dedicated **Guther dialogue scene** with one current approved spoken line and clear quoted response choices; optional chronological **Conversation History**; a dedicated **workbench** with a six-part tracking rail for the plate lot, visually distinguished action rows and condition-dependent narrative; separate **Journal / Character / Inventory** drawers; and a quiet Stage 2-complete handoff. A restrained Health / coins / Craftsmanship / starting-gear footer persists. Keyboard shortcuts 1–9 select currently legal choices, J/C/I open records and Escape closes a drawer. Responsive mobile layouts and reduced-motion styling are present.

Provisional generated Guther, forge and bench images plus an unnumbered steel-plate SVG are supplied as replaceable testing assets. They **do not approve canonical portrait art, exact workshop appearance or any worker serial number**. No sound is supplied or promised to be functional. Formal design documentation, screen-by-screen wireframes, visual tokens, asset contracts, developer implementation record, playtest guide and Chromium example screenshots are packaged in the v0.2 archive.

## Mechanics deliberately unchanged
The authoritative `millhand.mjs` state engine, `store.mjs` local persistence, and all combat v0.5.1 prototype source remain unmodified. UI actions still post the same approved `choice.id`, request ID and expected revision, with server-side validation. The original local session-storage key is retained for v0.1 save compatibility. No new canonical dialogue, reveal, side quest, wages, ordinary XP, loot, skill gains, crafting resources or special player advantage has been invented.

Stage 1 Guther's approved words are still spoken verbatim. Stage 2 implements the unchanged docket/blank/die/strike/inspection flow with straighten, replace or risky as-is decisions and required repair of a poor impression. Millhand starts four attributes at 5, maximum Health 50, Craftsmanship +3 at creation, 20 coins, Basic Clothes and one Crude Small Bag. This particular scripted platework grants 0 coins and 0 ordinary XP; employer tools and documents remain non-inventory props. The application **stops at the Stage 3 boundary**. Missing Stamp evidence and the three Stage 3 choices have not been implemented or shown during ordinary smithing.

## Verification
- `npm test`: **42/42** original Millhand engine, integrity, HTTP and persistence tests passed after the UI refactor (the prior static UI regression test was updated for the new DOM/controller).
- `npm run test:combat`: **49/49** inherited, **unchanged** combat v0.5.1 tests passed.
- Chromium bridge-assisted browser walkthrough: creation → pay/trust dialogue → history/journal → take docket → inspect/match → bend decision → server save/resume → stamp as-is → poor impression → rework → complete and return docket → Stage 3 boundary. Tested desktop and 390px mobile; no JavaScript page errors or mobile horizontal overflow. The environment blocked direct Chromium navigation to localhost; **this is a bridge-assisted UI smoke test, not real same-origin browser certification**.

## Direction and implementation guardrails
1. Dialogue is a **scene**, not a transcript: current speaker and current utterance are primary, history stays optional.
2. Work uses object/quality/action framing, not the dialogue renderer. Future Hauling, Contracts and Investigation work needs its own substantive actions and suitable imagery.
3. Health, coins, origin skill, equipment and journal are accessible but subordinate to the current scene.
4. Quoted player speech and unquoted physical commitments have separate visual grammar.
5. Do not show internal `phase`, `blank response`, `normal XP` or backend milestone mechanics as the main user experience.
6. All business/gameplay decisions stay authoritative in the pure state engine and persistence layer; UI may explain, but never generate rewards or unlocks.
7. Preserve visual/canon separation: v0.2 proves interaction direction, not final pixel or audio approval.

**Next story implementation milestone remains Stage 3 Missing Stamp**, with exactly the previously approved two inspections, Guther exchange, one irrevocable route and one +1 other Major Skill award. This UI pass is separate from that work. Stage 4–8 implementation and source-code GitHub synchronization are still pending.

References: [Millhand approved overview](../../../../../05-gameplay/onboarding/millhand/README.md), [approved Guther opening](../../../../../05-gameplay/onboarding/millhand/opening-dialogue.md), [reusable platework](../../../../../05-gameplay/onboarding/millhand/platework-interaction.md), [Stage 3 Missing Stamp](../../../../../05-gameplay/onboarding/millhand/missing-stamp-discovery.md), [first integrated playable v0.1](first-integrated-playable-v0-1-implementation.md), and [shared state contract](../../../../../05-gameplay/onboarding/shared-state-implementation-contract.md).
