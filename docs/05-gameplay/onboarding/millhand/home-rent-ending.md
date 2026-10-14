# Millhand — Stage 8: Return Home and the Rent Notice

**STATUS: NEW STAGE 8 PROPOSAL, NOT YET APPROVED (2026-10-15).** This document supplies the proposed final scene and interface transitions of Millhand's complete opening episode. The **sequence** is already LOCKED for all six origins: after the fight and **paid 10-coin medical care**, the character reaches the **same universal starter rented home**, has **10 coins** left from the initial 20, and only **there** learns that rent is due. The rent amount is **150 coins PROVISIONAL**. All exact dialogue/notice words below are **proposed**; no landlord, deadline, penalties or additional story beat are canonized.

See [Millhand main design](README.md), [approved clinic scene](clinic-treatment.md), [approved Flint fight](flint-fight.md), [shared tutorial architecture](../shared-structure.md) and [game-wide spoken dialogue standard](../../interactions/dialogue-style-guide.md).

## What this ending must accomplish

The Millhand has done the work and remains unpaid; followed one of three genuine alternate tasks; discovered one kind of contradictory official evidence; resisted, or lost to, Flint's attempted contractor collection; and spent 10 coins on necessary care. The player can now return to the life they already have, with a very simple economic problem.

**The tutorial does not end with Flint's fight.** It ends only after the player returns home and reads the notice. Do not tack on a new incident, suggest that the worker-number mystery has been solved, reveal an overarching campaign, or promise a story follow-up that is not authored.

This is the **identical home, location, floor plan, storage capability and rent framework** used by Bellrunner, Squatter, Stitcher, Scrapper and Inkbound. Do not add a Millhand-specific flat, forge corner, hereditary keepsake, landlord or bonus storage.

## Scene H01 — Arrive after care (PROPOSED presentation)

**Prerequisites (LOCKED):**
- Player has recorded Stage 6 fight result as **victory or defeat**;
- Stage 7 service completed with the **10-coin tutorial care charge**, processed once;
- Current coin balance is **10** under the defined no-extra-spending/tutorial-rewards economy;
- Existing Millhand route (Industry/Commerce/Scholarship) and its evidence have been recorded.

**Playable transition:**
1. The player leaves the clinic and uses **ordinary city return travel** (real world-time continues per [Jobs and Time](../../jobs/jobs-and-time.md)). Do not require a late-time checkpoint or unavoidable new confrontation.
2. **[Enter home]** — ordinary enter-home action, without a special miniature cutscene or a location only Millhand can access.
3. The player finds a **rent notice** in the home. **Its exact placement (door/desk/table) is TBD**; avoid adding layout details before the common home asset is designed.
4. **[Read the rent notice]** — opens a short written artifact in the ordinary message/interaction panel.

**Observable scene line (PROPOSED; restrained):**

> There is a rent notice waiting at home.

No narrator assessment of the player's disappointment, suffering, anger, luck or exhaustion. No invented memory or named householder.

## Scene H02 — The notice (PROPOSED exact copy)

In-world paper, with a simple accounting style appropriate to the nineteenth-century setting:

> **RENT**
>
> **150 coins owing.**

This is **not** a bill with an invented date, an official municipal seal, a landlord's name or a threatened eviction. **150 is a PROVISIONAL number under current game design**, and the notice template should be data-driven from the eventual shared rent system; do not bake this figure into story scripting outside that provisional value.

**Separate interface comparison** (UI, not spoken dialogue or part of the historical paper):

| Field | Value |
| --- | --- |
| Rent shown on notice | **150 coins (PROVISIONAL)** |
| Coins currently held | **10** |
| Difference to earn | **140** |
| Collection deadline | **Not defined yet** |
| Payment action | **Not required or available in this tutorial scene** |

The “140” is the arithmetic gap, **not an extra fine**. Don't imply the player owes 150 immediately under a countdown system that does not exist. Rent frequency, landlord, due date, payment rules and missed-payment consequences remain future design work.

## Scene H03 — End the Millhand opening (PROPOSED flow)

1. **[Put the notice down]** closes the notice. This is a simple continuation/acknowledgement, not a roleplay choice that secretly changes housing rules.
2. The server marks the **Millhand tutorial complete exactly once** only after the home notice has been read and dismissed. A reload must not charge rent, repeat the 10-coin treatment, award a second Major Skill level again or replay Flint's forced encounter.
3. The character remains **at the same rented home**, now free to perform normal paid jobs, travel or use ordinary services according to the wider game. **No automatic next quest or main-story promise.**
4. The regular **Guther Anvil Smithing workshop** stays available as a recurring job hub, with **normal wages and skill XP outside onboarding** (exact amounts still TBD). The unpaid tutorial was the exception due to the disputed council lot.
5. The dead worker's identity, inspector's later mark and one chosen second-job fact are recorded as a **finished local quest summary**, not as an incomplete “Find the mastermind” objective.

**UI completion text (PROPOSED):**

> **Millhand opening complete.**
>
> The council lot remains disputed. No wages were paid.
>
> **10 coins in hand. Rent owing: 150 coins.**

Keep this factual and quiet, not triumphal or defeatist. No extra quote from Flint, Guther or a landlord. The player should understand their next practical need—earning ordinary money—without being handed an unrelated mandatory quest.

## Journal recap — branch-aware, no new rewards (PROPOSED)

This is *existing quest-journal state*, not a new evidence inventory system, XP source or promised storyline:

| Chosen Stage 4 route (already LOCKED) | Single local finding retained in journal |
| --- | --- |
| **Depot Intake Run / Industry +1** | The depot recorded actual **metal plates**, though the original manifest called them a transfer of **workers**. |
| **Disputed Docket / Commerce +1** | Two contradictory official classifications for the same dead worker's number were both sealed; the player lodged a written objection. |
| **Ledger Reconciliation / Scholarship +1** | The cancelled number appears in a later wage tally; a correction in the records was scraped away. |

Also retain **Flint fight outcome = player victory or player defeat**, as requested by the user on 2026-10-15. This is a **permanent narrative continuity flag**, not a stat boost: should a **separately approved future quest** feature Flint, he speaks one short line acknowledging the outcome. **No new Flint quest or line is created here.**

For a normal job after tutorial, return to ordinary payouts/XP. **No coins, XP or loot from the Millhand tutorial itself** beyond the user's preexisting creation +3 Craftsmanship and single +1 at the chosen Stage 3 branch commitment.

## Important no-injury edge case

If a player wins against Flint without taking actual damage/condition, Stage 6/7 treatment must still be reconciled with the globally locked required 10-coin clinic sequence **without secretly inflicting an injury**. That tension is explicitly still **TBD** in the [clinic treatment](clinic-treatment.md). Stage 8 cannot resolve it by inventing a compulsory wound or waiving the locked charge; its entry condition is simply that the care step was completed according to the eventual approved Health system.

## Implementation guardrails and QA

- Shared home and rent state belongs to the **global onboarding system**, not a Millhand-only content item.
- Ensure **no rent reveal** at the forge, depot, records room, Flint encounter or clinic.
- **No due date, penalty, eviction countdown, debt collection, automatic rental payment or named landlord** in this draft.
- On notice read, show exact arithmetic 150 − 10 = 140, clearly distinguishing rent owed from new fines.
- The notice is a readable quest/UI prop; no permanent loot item, reward, home furnishing or exclusive storage.
- End once, after reading, with persisted status. No repeat +1 skill, 10-coin clinic charge or Flint fight from reload.
- Preserve **Stage 4 route**, **Flint victory/defeat**, **spend 10 coins on care**, and shared home/rent flags across session.
- No background-specific special home or exceptional income. The next job under normal Smithing/other job systems is paid according to normal rates.

## Approval scope

**Already LOCKED:** the exact end sequence, common home, 20 starting coins, 10 clinic coins, 10 home balance, provisional rent amount 150, no coin/XP/loot from tutorial, no new main-story quest, Flint outcome persistence for possible future dialogue.

**PROPOSED for approval now:** a single calm entry scene, rent notice copy, wallet/rent comparison view, read/put-down interaction, completion text and branch-aware final journal summary. Numeric combat/health rules, specific rent due date/rate finalization, future rent payments, room layout and automatic availability of follow-up work in UI are all TBD.
