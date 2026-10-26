# Background Onboarding — Six Origin Folders

**Status:** Shared tutorial structure is approved. Each origin has its own content directory under `docs/05-gameplay/onboarding/`. Keep character-specific gameplay, stories, interactions, dialogue, combat scenes and branch logic in the corresponding origin folder. Keep rules used by all six origins in shared documents here or in their existing game-wide systems.

| Background | Canonical folder | Starting Major Skill |
| --- | --- | --- |
| **Millhand** | [Millhand](millhand/README.md) | Craftsmanship +3 |
| **Bellrunner** | [Bellrunner](bellrunner/README.md) | Industry +3 |
| **Squatter** | [Squatter](squatter/README.md) | Fieldcraft +3 |
| **Stitcher** | [Stitcher](stitcher/README.md) | Medicine +3 |
| **Scrapper** | [Scrapper](scrapper/README.md) | Mechanics +3 |
| **Inkbound** | [Inkbound](inkbound/README.md) | Scholarship +3 |

## Pre-character creation copy — approved 2026-10-26

- [The Pall — World Introduction](world-introduction.md): approved universal first-login introduction, including the Plume and the uncertain cause of the catastrophe.
- [Choose Your Background — Selection Introduction](background-selection-introduction.md): approved character-creation copy for the six backgrounds, their distinctive work histories and +3 Major Skill advantages.

These are **player-facing approved texts**, not new lore mechanics or replacements for the six origin-specific Stage 1 scenes. Show the world introduction after initial authentication and before background selection; present the background text during character creation.

## Shared, not background-specific

- [Common Background Tutorial Structure](shared-structure.md): universal kit, job progression, +3/+1 Major Skill rules, clinic, one starter home, rent sequence and tutorial reward override.
- [Six-origin deep consistency audit (2026-10-19)](audits/2026-10-19-six-origin-consistency-audit.md): baseline findings plus a dated remediation table for user-approved fixes.
- [Shared onboarding state and QA contract (2026-10-19)](shared-state-implementation-contract.md): one-time rewards/payments, per-origin pay acceptance, evidence custody, early job interactions, actual win/defeat and 36 end-to-end test cases. This is **approved design, not programmed functionality**.
- [Common clinic examination rule (LOCKED 2026-10-19)](shared-clinic-examination-policy.md): fair combat without forced hits, 10-coin examination even when unhurt, appropriate basic care only for real injury.
- [Shared Stage 8 home and rent notice](shared-home-rent-ending.md): **one identical rent scene and verbatim Millhand closing speech for all six origins**; no origin-specific variants.
- [NPC and Dialogue Backlog](npc-dialogue-backlog.md): remaining character dialogue and interaction work across all six.
- [Game-wide Spoken Dialogue Standard](../interactions/dialogue-style-guide.md): locked writing rules and tonal reference for NPC speech.
- [Jobs and Time](../jobs/jobs-and-time.md): reusable job phases, first-two-minute interaction rule and continuous world time.

## Folder conventions

- `<origin>/README.md` is the overview/master storyline, with links to detailed files.
- Give long interactions separate Markdown files **inside the origin's folder** (e.g. `millhand/flint-fight.md`).
- Keep user-approved text clearly marked **LOCKED**; distinguish unapproved story proposals and numerical TBD.
- Do not leave new background-specific scenario files at the onboarding root.
- Reuse shared systems; do not clone the global rules into each folder. All six origins share the **same starter home**, not six separate home definitions.

## Bellrunner opening (current)

- [Stage 1 — Hector D. Smoke opening conversation](bellrunner/opening-dialogue.md) — **APPROVED AND LOCKED 2026-10-15**. The Dispatch House, ordinary Shift Dispatch job and later *Wrong Bell* premise are also locked.
- [Stage 2 — Shift Dispatch courier-work interaction](bellrunner/shift-dispatch-interaction.md) — **APPROVED AND LOCKED 2026-10-15**. Reusable route, bundle and receipt-verification work; no early Wrong Bell reveal.
- [Stage 3 — The Wrong Bell discovery and branch decision](bellrunner/wrong-bell-discovery.md) — **APPROVED AND LOCKED 2026-10-15**.
- [Stage 4 — Three follow-up work tasks](bellrunner/second-task-branches.md) — **APPROVED AND LOCKED 2026-10-15**, including revised natural dialogue.
- [Stage 5 — Dogman: Show Your Papers / Gate Barred](bellrunner/dogman-confrontation.md) — **APPROVED AND LOCKED 2026-10-15**.
- [Stage 6 — Dogman's turn-based fight](bellrunner/dogman-fight.md) — **APPROVED ENCOUNTER 2026-10-15**; combat numbers TBD.
- [Stage 7 — Clinic visit](bellrunner/clinic-treatment.md) — **APPROVED AND LOCKED 2026-10-15**; shared medical values TBD.
- [Stage 8 — Return home and rent notice](bellrunner/home-rent-ending.md) — **APPROVED AND LOCKED 2026-10-15**. Bellrunner's eight-stage onboarding is complete at narrative level.

## Squatter opening (current)

- [Stage 1 — Benny Ben and the Yarrow Cut order](squatter/opening-dialogue.md) — **APPROVED AND LOCKED 2026-10-15**. The Squatter opening premise and background are already locked.

- [Stage 2 — Yarrow Cut](squatter/yarrow-cut-interaction.md) — **APPROVED AND LOCKED 2026-10-15**.
- [Stage 3 — The Warm Patch](squatter/warm-patch-discovery.md) — **APPROVED AND LOCKED 2026-10-15**.
- [Stage 4 — Three second-skill jobs](squatter/second-task-branches.md) — **APPROVED AND LOCKED 2026-10-15**.
- [Stage 5 — Rustling Bank / Nowhere to Step](squatter/boar-confrontation.md) — **APPROVED AND LOCKED 2026-10-15**.
- [Stage 6 — Injured boar fight](squatter/boar-fight.md) — **APPROVED ENCOUNTER 2026-10-15**, combat numbers TBD.
- [Stage 7 — Clinic after the boar](squatter/clinic-treatment.md) — **APPROVED AND LOCKED 2026-10-15**, shared medical details TBD.
- [Stage 8 — Identical home and rent notice for all six](shared-home-rent-ending.md) — **COMMON APPROVED AND LOCKED 2026-10-15**, no Squatter-specific variant.

## Inkbound opening (current)

- [Stage 1 — Erwin Buro at the Civic Copying Office](inkbound/opening-dialogue.md) — **APPROVED AND LOCKED 2026-10-17**, including Erwin's class-aspiring voice.
- [Stage 2 — The Winter Register](inkbound/winter-register-interaction.md) — **APPROVED AND LOCKED 2026-10-17**, plain record-checking work and richer Erwin dialogue.
- [Stage 3 — The Acceptable Losses discovery](inkbound/acceptable-losses-discovery.md) — **APPROVED AND LOCKED 2026-10-17**, exact Ward Six revelation and three skill choices.
- [Stage 4 — The Coal Waiver / The Door Count / The Short Cart](inkbound/second-task-branches.md) — **APPROVED AND LOCKED 2026-10-17**, distinct Contracts, Navigation and Hauling activities.
- [Stage 5 — The Sealed Stove / The Coal Hook](inkbound/sealed-stove-confrontation.md) — **APPROVED AND LOCKED 2026-10-19**, includes corrected natural resident lines.
- [Stage 6 — Silas Pumpard's fight](inkbound/silas-pumpard-fight.md) — **APPROVED ENCOUNTER 2026-10-19**, distinct win/defeat; global combat numbers TBD.
- [Stage 7 — Clinic after Silas](inkbound/clinic-treatment.md) — **APPROVED AND LOCKED 2026-10-19**, ordinary ten-coin care; Inkbound narrative onboarding complete.
- [Stage 8 — Shared rented home and rent notice](shared-home-rent-ending.md) — **ALREADY LOCKED**, same speech and notice as all origins.

## Scrapper opening (current)

- [Stage 1 — Ignatius Smog at Rust Yard](scrapper/opening-dialogue.md) — **APPROVED AND LOCKED 2026-10-16**, simple old-pump instructions and his established fresh-air quip.
- [Stage 2 — Strip a Condemned Pump](scrapper/condemned-pump-interaction.md) — **APPROVED AND LOCKED 2026-10-16**, remove two outer plates, free a rusty bolt, sort good metal from junk.
- [Stage 3 — The Last Dry Floor discovery](scrapper/last-dry-floor-discovery.md) — **APPROVED AND LOCKED 2026-10-16**, three plain-language decisions.
- [Stage 4 — Three follow-up jobs](scrapper/second-task-branches.md) — **APPROVED AND LOCKED 2026-10-16**, Construction / Navigation / Logistics.
- [Stage 5 — The Copper Claim / The Red Lever](scrapper/barnaby-confrontation.md) — **APPROVED AND LOCKED 2026-10-16**, Barnaby dispute and three tactical approaches.
- [Stage 6 — Barnaby's fight and two outcomes](scrapper/barnaby-fight.md) — **APPROVED ENCOUNTER 2026-10-16**, genuine win/defeat and safe continuation; global combat numbers TBD.
- [Stage 7 — Clinic after Barnaby's fight](scrapper/clinic-treatment.md) — **APPROVED AND LOCKED 2026-10-16**, standard ten-coin care. Scrapper's eight-stage narrative onboarding is complete.
- [Stage 8 — Common home and identical rent notice](shared-home-rent-ending.md) — **ALREADY APPROVED FOR ALL SIX BACKGROUNDS**; no Scrapper-specific variation.

## Stitcher opening (current)

- [Stage 1 — Claudia Cyka's harsher opening](stitcher/opening-dialogue.md) — **APPROVED AND LOCKED 2026-10-16**. Her harsh, beautiful and calculating character direction is locked.
- [Stage 2 — Morning Dressings basic Trauma work](stitcher/morning-dressings-interaction.md) — **APPROVED AND LOCKED 2026-10-16**. The later Teaching Bed premise remains locked.

- [Stage 3 — The Teaching Bed](stitcher/teaching-bed-discovery.md) — **APPROVED AND LOCKED 2026-10-16**, with revised Claudia speech.
- [Stage 4 — Three follow-up jobs](stitcher/second-task-branches.md) — **APPROVED AND LOCKED 2026-10-16**.
- [Stage 5 — The Empty Sheet / The Night Door](stitcher/owler-confrontation.md) — **APPROVED AND LOCKED 2026-10-16**.
- [Stage 6 — Owler's fight and two outcomes](stitcher/owler-fight.md) — **APPROVED ENCOUNTER 2026-10-16**, three revised lines; combat numbers TBD.
- [Stage 7 — Treatment after Owler](stitcher/clinic-treatment.md) — **APPROVED AND LOCKED 2026-10-16**, common 10-coin service; global Health effects TBD. Stitcher narrative onboarding complete.
- [Stage 8 — Common home, rent notice and same closing line](shared-home-rent-ending.md) — **ALREADY APPROVED FOR ALL SIX ORIGINS**; no Stitcher-specific script.

## Millhand progression (current)

| Stage | Document | Status |
| --- | --- | --- |
| 1 | [Guther opening](millhand/opening-dialogue.md) | LOCKED |
| 2 | [Worker plate Smithing task](millhand/platework-interaction.md) | LOCKED |
| 3 | [Missing Stamp discovery](millhand/missing-stamp-discovery.md) | LOCKED |
| 4 | [Second-task routes](millhand/second-task-branches.md) | LOCKED |
| 5 | [Flint confrontation](millhand/flint-confrontation.md) | LOCKED |
| 6 | [Flint fight](millhand/flint-fight.md) | Encounter narrative LOCKED; combat mechanics TBD |
| 7 | [Clinic treatment](millhand/clinic-treatment.md) | LOCKED; detailed Health mechanics TBD |
| 8 | [Return home and rent notice](millhand/home-rent-ending.md) | LOCKED, including the exact self-directed closing line |

**Continuity:** the permanent Flint fight outcome (player victory / player defeat) must be retained for dialogue variation if a **future separately approved** quest features him.
