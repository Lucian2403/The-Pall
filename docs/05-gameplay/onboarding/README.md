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
- [NPC and Dialogue Backlog](npc-dialogue-backlog.md): remaining character dialogue and interaction work across all six.
- [Game-wide Spoken Dialogue Standard](../interactions/dialogue-style-guide.md): locked writing rules and tonal reference for NPC speech.
- [Jobs and Time](../jobs/jobs-and-time.md): reusable job phases, first-two-minute interaction rule and continuous world time.

## Folder conventions

- `<origin>/README.md` is the overview/master storyline, with links to detailed files.
- Give long interactions separate Markdown files **inside the origin's folder** (e.g. `millhand/flint-fight.md`).
- Keep user-approved text clearly marked **LOCKED**; distinguish unapproved story proposals and numerical TBD.
- Do not leave new background-specific scenario files at the onboarding root.
- Reuse shared systems; do not clone the global rules into each folder. All six origins share the **same starter home**, not six separate home definitions.

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
