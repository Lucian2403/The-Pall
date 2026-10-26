# The Pall — Design Documentation

This directory is the **design source of truth**. Approved decisions are distinguished from provisional balances, proposals, and historical implementation reports.

## Begin here

1. [The Pall — approved world introduction](05-gameplay/onboarding/world-introduction.md)
2. [The Plume and geographical progression](02-world/the-plume-and-regions.md)
3. [Choose Your Background — approved character-creation copy](05-gameplay/onboarding/background-selection-introduction.md)
4. [Character creation rules](01-player/character-creation.md)
5. [Six origin stories and onboarding](05-gameplay/onboarding/README.md)
6. [Combat specification index](05-gameplay/combat/README.md)

## Documentation by subject

| Area | What it owns |
| --- | --- |
| [00 — Vision](00-vision/README.md) | Design pillars, visual direction, first-playable scope |
| [01 — Player](01-player/README.md) | Attributes, character creation, skills and progression |
| [02 — World](02-world/README.md) | The Plume, regions, ecology |
| [03 — Resources](03-resources/README.md) | Raw materials, refining, components, production and audits |
| [04 — Equipment](04-equipment/README.md) | Gear rules and item schema |
| [05 — Gameplay](05-gameplay/README.md) | Onboarding, combat, jobs, crafting, trading, survival |
| [06 — Bases](06-bases/README.md) | Facilities and workstations |
| [07 — Technology](07-technology/README.md) | Architecture decisions, account work and implementation boundaries |
| [Historical archive](archive/README.md) | Superseded playtest builds, former plans and past proposals |

## How to interpret statuses

- **APPROVED / LOCKED:** preserve the specific decision and approved wording unless the owner changes it.
- **PARTIALLY APPROVED:** approved principles are binding, but listed numbers and open mechanics are not.
- **PROVISIONAL / PROPOSED:** working design; not permission to treat example values as canon.
- **HISTORICAL ARCHIVE:** evidence of earlier work or decisions, not the current implementation specification. Keep for traceability.

**Authority when documents overlap:** newer explicitly approved corrections govern the affected text or behavior; structural rules remain in their dedicated canonical document. In particular, Millhand's approved editorial scripts govern player-facing wording, while stage interaction files govern unchanged mechanics. [Millhand's editorial map](05-gameplay/onboarding/millhand/INDEX.md) identifies the split.

Keep historical reports out of active indexes. Do not silently promote test values, superseded art direction, or proposed rules to approved canon.

## Documentation maintenance policy

Keep this tree lean. **Do not create a new Markdown report for every implementation patch, local QA pass, or small milestone.** Approved lore/dialogue/mechanics remain in their existing canonical subject documents. Use the existing [platform README](../platform/README.md) for the current technical milestone, test commands and outstanding gates; Git commits and issues carry granular implementation history. Retain older QA files as historical evidence until a deliberate documentation-curation pass, without cloning them into new active reports. Add a new design document only for a genuinely new canonical specification that has no appropriate home, not as routine status narration.

