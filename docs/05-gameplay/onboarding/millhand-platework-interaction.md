# Millhand — Worker Plate Smithing Task (Stage 2 — APPROVED)

**Status: INTERACTION STRUCTURE APPROVED AND LOCKED (2026-10-14).** User approved docket inspection, mark/die matching, the bent-blank work complication, three alternatives (straighten / replace / stamp anyway), stamp/inspect/rework as needed, and the boundary before the later unique Missing Stamp reveal. Normal Smithing interactions stay reusable. **Exact serial numbers, durations, formulas, appearance, item records and other numerical implementation remain TBD; illustrative UI copy is not separately final.** See [approved Guther opening](millhand-opening-dialogue.md), [Millhand story](millhand.md), [dialogue style standard](../interactions/dialogue-style-guide.md), [jobs](../jobs/jobs-and-time.md) and [crafting](../crafting/crafting-workflow.md).

## Design intent and guardrails

The first Millhand task is **ordinary worker-plate stamping piecework**, a low-level supervised **Craftsmanship / Smithing** activity at the established regular workshop. The player already knows the job. Introduce ordinary reusable work controls without a lecture, twitch minigame, secret timed click, or one-off quest-specific apparatus. The normal preparation/handling work must be completed **before** *The Missing Stamp* revelation. The municipal worker plates are **employer-owned work/order props**; no new tradeable "Worker Plate" component, recipe, market slot or starting item is proposed.

The first task is scripted to yield **0 coins, 0 ordinary XP and no item output to inventory**. Guther's already-approved opening explicitly warns that the inspector must accept the lot before anyone can be paid. Only **after** the normal task resolves do the disputed records freeze that payment. Ordinary repeatable Smithing work outside onboarding remains compensated and has ordinary XP progression. Do not show a guaranteed monetary reward then secretly remove it. Character already has +3 Craftsmanship at creation; the +1 level in a *different* Major Skill belongs to the eventual three-way story branch, NOT this task.

## Entry — LOCKED handoff and approved screen flow (exact UI copy TBD)

Guther's approved last line:

> "Check the number before you strike. If one doesn't match, leave it for me."

Player presses **[Take the docket]**.

**Approved panel information** (exact UI copy and implementation TBD; not NPC speech):

- **Work:** Mark the council's worker identification plates.
- **Docket:** Gives the identifying numbers required for the batch.
- **Provided on site:** Prepared plate blanks, numbering dies/stamps, hammer and bench/forge facilities as required for this work. Shop-owned: nothing added permanently to player inventory.
- **Payment state:** **Pending council acceptance** (UI text proposed, not locked; no amount promised).
- **Next action:** **[Inspect the docket and blanks]**.
- **Batch count, serial numbers, stock usage, base time, weight, and any tool condition numbers:** all TBD; do not create hard-coded economy entries or historical worker IDs just to write this interaction.

The player works one representative plate/placement as a short, **batch-level** interaction. Don't make them align and stamp every individual plate by repeatedly clicking a button.

## Approved four-stage interaction

### P01. Inspect and match — ordinary work

Screen shows the **docket's required number** and the selected work blank. Player compares required mark with the prepared numbering dies. Keep the required number unambiguous in the UI; selecting an appropriate die is ordinary setup, **not a misleading "spot the hidden digit" test**.

**Choice/action:** **[Match the dies to the docket]**.

Outcomes:
- Correct die arrangement is confirmed before striking.
- If the player adjusts it before striking, there is no irreversible loss.
- No allusion yet to a dead worker, the workshop fire or a fresh inspection stamp. Knowing a serial number is **not** knowing its owner's fate.

**Reusable module:** `smithing_match_marks` (working identifier; exact ID TBD). Can parameterize all ordinary stamped work with a source docket and mark pattern.

### P02. Prepare plate — the one meaningful ordinary complication

**Illustrative UI text (not character dialogue; wording TBD):**

> One blank has a bent corner. It won't lie flat beneath the stamp.

The normal game can select this **reusable bent-blank incident** only when material condition and job setup warrant it. **For the tutorial's first work session, trigger it once to teach a real choice**; do not force it for every future job or every stamped batch.

Three legitimate responses:

| Player choice | Immediate result | Trade-off shown in UI |
| --- | --- | --- |
| **[Straighten the blank]** | Try to flatten/reseat it at the shop bench, then continue on the original blank. | More work time, less material waste; can still require ordinary inspection. |
| **[Set it aside. Take another.]** | Remove the unsuitable blank from the current batch and select one of the employer's other prepared blanks. | Faster route at the cost of employer material usage/reject count. No free item to player. |
| **[Stamp it as it is]** | Continue with poor seating; the mark may be shallow or crooked and need corrective work before the lot can be checked. | Least preparation, higher rework/quality risk; does **not** skip the quality check or softlock the story. |

**Consequences are physical and visible**: work time, usable/rejected stock, number legibility and a possible rework step. These remain concept-level outcomes; **exact chances, seconds, material units, repairable grade and skill modifiers are TBD**. With +3 Major Skill and no settled Smithing subskill level, do not invent skill thresholds or guarantee mastery-dependent alternatives.

This is an ordinary **material-condition and work-method interaction**, not the mystery.

**Reusable template (working ID):** `smithing_blank_seating` with condition = bent; parameterizable for other suitable blank/marked-metal work.

### P03. Stamp / inspect the result — ordinary work resolution

After preparation, the player commits the work once:

**[Strike the mark]** (one work action, **not** a rhythm/timing minigame).

Then inspect:

- **Mark readable / correctly placed:** accept for batch review.
- **Mark poor:** **[Rework if possible]** or **[Set aside]**; continue to a usable batch sample with employer stock. These are generic work-recovery actions. Never require unlimited clicks, paid materials or a fail-loop.
- **Record in UI** the resulting work condition (legible/reworked/rejected), material handling and any extra elapsed time.

All versions conclude the normal interaction without determining the fate of the novel stamped identifier or concealing key story choices behind quality rolls.

**Reusable module:** `smithing_mark_and_verify` (working identifier).

### P04. Ordinary task complete → story boundary

After ordinary inspection and verification, a **job-resolution view** shows:

- **Platework completed; lot sent for council acceptance** (exact copy proposed).
- **Tutorial currency earned: 0 coins.**
- **Tutorial ordinary XP earned: 0.**
- **Inventory change: none** (workshop property stays workshop property).
- No one-time combat reward and no other skill level gain. First task does not finish onboarding.
- **Next:** the approved *Missing Stamp* one-time event begins **only now**, after a normal work session has resolved, introducing the apparently dead worker's identifying mark and the fresh inspection mark.

**Important boundary:** do **not** define the exact method by which the player verifies the worker is dead or why the inspection mark is fresh here. That belongs to **Stage 3: revelation and Guther's response**, which is **not yet authored/approved**. Do not put worker-death hints into the ordinary P01–P03 screens.

## Sample player-facing flow (approved actions; exact UI wording TBD)

1. **[Take the docket]** — approved conversation ends.
2. **[Inspect the docket and blanks]** — required mark and provided equipment visible.
3. **[Match the dies to the docket]** — confirm plate marking setup.
4. **"One blank has a bent corner. It won't lie flat beneath the stamp."**
   - **[Straighten the blank]**
   - **[Set it aside. Take another.]**
   - **[Stamp it as it is]**
5. **[Strike the mark]** → **[Check the impression]** → optional rework/replace only if result needs it.
6. **"Platework complete. The lot is awaiting inspection."**
7. **[Return the docket]** → handoff to separate *The Missing Stamp* reveal, with no further normal work prompts.

No new NPC dialogue is required during this routine activity. The task UI does its own teaching, and Guther's approved line is not repeated as exposition.

## Implementation notes (approved design intent; details TBD)

| Aspect | Direction |
| --- | --- |
| Normal job family | `Craftsmanship / Smithing`, supervised/contract stamping work |
| Content approach | 3 ordinary reusable modules: mark matching, bad-blank handling, mark verification |
| Batch approach | One representative meaningful interaction per batch rather than per-plate repetition |
| Interaction timing | Front-load every required input inside the existing **first-two-minutes** rule; actual base duration TBD |
| Time simulation | World/job time **continues** while prompts are open; completion waits for the required interaction |
| Skill | +3 Craftsmanship already assigned at creation, no new subskill gate/XP for tutorial |
| Failure | Ordinary delay/material reject/rework; never consume player's 20 starter coins or block story |
| Mandatory event | One ordinary bent-blank condition triggered during first tutorial only; outside tutorial it is conditional and repetition-managed |
| Second skill | No +1 now; award when one of the 3 different-Major-Skill second-task branches is chosen later, once |
| Economy | 0 coins, 0 ordinary XP, 0 extra inventory materials from this scripted work |
| One-off story reveal | Separate event keyed only after `smithing_task_completed`; always fires once in Millhand tutorial regardless of ordinary quality choice |
| Server data | Author choices/outcomes/condition parameters and persistence flags; no runtime generative AI |

## Approved versus remaining design

**LOCKED:** one representative plate per batch interaction, docket/die matching, bent-blank work complication on the tutorial instance, **Straighten / Set aside & replace / Stamp as-is** options with trade-offs in time/waste/quality/rework, stamp/verify, normal task completion before the unique reveal, no tutorial wages/XP/loot, employer-owned tools and stock, nonblocking work recovery, reuse outside onboarding (where routine work does pay/advance normally).

**TBD:** precise number of plates, serial numbers, data IDs, final job and UI wording, grade modifiers/chances, extra time or material quantities, exact workstation tooling, condition calculations, base duration and the separate Stage 3 reveal/dialogue. Do not treat these undecided implementation details as approved facts.

Related: [Millhand storyline](millhand.md), [Approved Guther opening](millhand-opening-dialogue.md), [Jobs and Time](../jobs/jobs-and-time.md), [Crafting Workflow](../crafting/crafting-workflow.md), [Spoken Dialogue Standard](../interactions/dialogue-style-guide.md).
