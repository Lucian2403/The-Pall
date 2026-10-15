# Bellrunner — Stage 8: Home and Rent Notice (APPROVED; SHARED SCENE)

**Status: APPROVED AND LOCKED, updated by user's 2026-10-15 universal-closing-line instruction.** Bellrunner uses the exact [common Stage 8 home, rent notice and final spoken line](../shared-home-rent-ending.md) used by Millhand, Squatter, Stitcher, Scrapper and Inkbound. The earlier, independently approved Hector-specific **home-closing speech was explicitly superseded** when the user required every background to speak the Millhand line. Do not show or restore the superseded line.

## Bellrunner handoff and shared scene

The courier leaves [Stage 7](clinic-treatment.md) by ordinary city travel. Dogman's [Stage 6 outcome](dogman-fight.md) remains victory or defeat. Do not stage another ambush or force a visit to Hector.

Run the **shared Stage 8** without a Bellrunner-specific fork:

1. **[Enter home]** — same universal rented home and property/storage rules.
2. **[Read the rent notice]** — identical in-world `RENT — 150 coins owing.` text; the amount remains provisional.
3. **[Put the notice down]** — the player then says **the exact universal Millhand-origin closing speech** stored in [shared-home-rent-ending.md](../shared-home-rent-ending.md). No reference to Hector or courier work is added to that line.
4. Complete the Bellrunner introduction once, preserving the shared post-clinic balance of 10 coins, no further charge and no new compulsory job.

The central shared file is the **single source of truth** for full narration, precise quotation, payment/notice rules and completion order; do not duplicate the line as a background script.

## Bellrunner-specific journal closure — not part of the rent notice

Keep **only the one finding belonging to the Stage 4 route actually played**:

| Route | One local finding |
| --- | --- |
| **Attendance Certificate** | Workers who stayed out of the unsafe building are recorded as voluntarily absent and lose wages. |
| **First Aid Line** | The medical register classes the affected workers' complaints as non-work illness, leaving them with the charges. |
| **The Bell Linkage** | Someone left the night bell connected despite the ventilation safety shutoff; the culprit remains unknown. |

Retain the **Dogman victory/defeat** result independently. The danger at the closed worksite and its paperwork remain locally unresolved. No new overarching quest is promised.

The Dispatch House remains available for *ordinary paid jobs*. Hector's previously approved optional conversation about the council's rejection of the courier round belongs only to an **ordinary later visit to Hector**, not the home ending, and remains unchanged.

## Implementation

Use identical housing scene/notice/dialogue IDs and controls across six backgrounds. This document contains Bellrunner's journal and transition metadata only. A reload cannot repeat the home speech, the clinic charge, Dogman's encounter or the one-time second-skill grant.

**TBD:** final shared home asset, rent schedule/penalties, global combat/Health effects and exact production identifiers. No Bellrunner-specific rent semantics or closing speech remain in force.

Related: [Bellrunner overview](README.md), [approved clinic](clinic-treatment.md), [common onboarding](../shared-structure.md), [universal Stage 8](../shared-home-rent-ending.md).
