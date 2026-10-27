# Millhand — Find the Approved Content

The origin's [story master](README.md) retains narrative structure and mechanical continuity. This page directs implementation to the **latest approved player-facing copy** without deleting historical mechanics or changing quest state.

| Stage | Mechanics / encounter contract | Approved player-facing copy |
| --- | --- | --- |
| 1 — Workshop opening | [Opening dialogue](opening-dialogue.md) | [Approved Stage 1 Revision 02](opening-dialogue.md) |
| 2 — Worker plates | [Platework interaction](platework-interaction.md) | [Stage 2 Revision 03](stage-2-approved-script.md) |
| 3 — Missing Stamp | [Discovery mechanics](missing-stamp-discovery.md) | [Stage 3 Revision 01](stage-3-approved-script.md) |
| 4 — Three second jobs | [Route mechanics](second-task-branches.md) | [Stage 4 Revision 01](stage-4-approved-script.md) |
| 5 — Flint confrontation | [Confrontation](flint-confrontation.md) | [Stage 5 Revision 01](stage-5-approved-script.md) |
| 6 — Flint fight | [Encounter](flint-fight.md) | [Stage 6 Revision 02](stage-6-approved-script.md) |
| 7 — Clinic | [Clinic encounter](clinic-treatment.md) | [Stage 7 Revision 01](stage-7-approved-script.md) |
| 8 — Shared rented home | [Single universal Stage 8](../shared-home-rent-ending.md) | [Stage 8 Revision 01](stage-8-approved-script.md), with the universal notice and speech unchanged |

[Approved personal Journal wording for Stages 1–4](stages-1-4-approved-journal.md) supplies the personal first-person voice; use conditional branch text only when the corresponding game state occurred.

**Optional Guther conversation:** [Approved owner-written Guther workshop dialogue (2026-10-27)](guther-optional-conversation.md) is separate from the Stage 1 opening and Stage 3 Missing Stamp exchanges. The shared small NPC popup handles its player-selected follow-ups; all work state remains unchanged.

**Stage 3 integration candidate (2026-10-27):** The authenticated Missing Stamp route, persistent evidence inspections, Guther dialogue, three route commitments and first-person journal are implemented in source under `platform/apps/web/src/routes/characters/[id]/millhand/missing-stamp/` and `platform/apps/api/src/millhand-missing-stamp-routes.ts`. A non-destructive database migration `0004_millhand_missing_stamp.sql` is required. The **worker number and two dates remain unapproved**; the live conversation/route selection is intentionally gated until those fields can be shown consistently with Stage 2. Local build and playtest are still required.

**Editorial approval does not imply code integration.** Earlier stage mechanics files sometimes contain older, historically approved dialogue. Preserve their interaction and state constraints while using the explicitly approved newer script for narration and speech. Never rewrite the already approved combat log as part of an editorial pass.

Current visual production: [Gate 01 UX contract](visual-production-gate-01-workshop-ux-contract.md), [Gate 02 wireframe review](visual-production-gate-02-workshop-wireframe-review.md). Latest local integration note: [v0.6.1](v0-6-1-owner-playtest-corrections.md). Prior builds are [archived](../../../archive/README.md).
