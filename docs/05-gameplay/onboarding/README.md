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

## Shared, not background-specific

- [Common Background Tutorial Structure](shared-structure.md): universal kit, job progression, +3/+1 Major Skill rules, clinic, one starter home, rent sequence and tutorial reward override.
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

## Stitcher opening (current)

- [Stage 1 — Claudia Cyka's harsher opening](stitcher/opening-dialogue.md) — **APPROVED AND LOCKED 2026-10-16**. Her harsh, beautiful and calculating character direction is locked.
- [Stage 2 — Morning Dressings basic Trauma work](stitcher/morning-dressings-interaction.md) — **APPROVED AND LOCKED 2026-10-16**. The later Teaching Bed premise remains locked.

- [Stage 3 — The Teaching Bed](stitcher/teaching-bed-discovery.md) — **APPROVED AND LOCKED 2026-10-16**, with revised Claudia speech.
- [Stage 4 — Three follow-up jobs](stitcher/second-task-branches.md) — **APPROVED AND LOCKED 2026-10-16**.
- [Stage 5 — The Empty Sheet / The Night Door](stitcher/owler-confrontation.md) — **PROPOSED 2026-10-16**.
- [Stage 6 — Owler's fight and two outcomes](stitcher/owler-fight.md) — **PROPOSED 2026-10-16**, combat numbers TBD.

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
