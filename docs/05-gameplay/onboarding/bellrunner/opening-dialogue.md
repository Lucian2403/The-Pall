# Bellrunner — Hector D. Smoke, Stage 1 Opening Conversation

**STATUS: PROPOSED FOR USER APPROVAL (2026-10-15).** This is a first spoken dialogue draft, not locked text. The Dispatch House, **Hector D. Smoke (Dispatch Master)**, first **Industry / Hauling** job *Shift Dispatch*, council shift notices, generic courier hub, *The Wrong Bell* incident after ordinary work, all three second Major Skills and **Dogman** are already locked in [Bellrunner](README.md). Apply the [game-wide spoken dialogue standard](../../interactions/dialogue-style-guide.md) and the approved [Millhand Guther opening](../millhand/opening-dialogue.md) as a calibration point **without copying Guther's character or structure**.

## Scene B01 — Dispatch House, First Assignment (PROPOSED)

*Hector takes a bundle of council shift notices from the sorting shelf. A duty bell sounds across the hall.*

**HECTOR:** “Council notices. That round should've gone with the last runners.”

**PLAYER (optional):** “So they'll say I'm late.”

**HECTOR (optional reply):** “I've put down when I gave them to you. They can come here if they don't like it.”

**HECTOR (convergence; also when player skips optional response):** “Take the route sheet. Bring back the marks from whoever takes them.”

**Interface action:** **[Take the round]** → open the standard **Industry / Hauling — Shift Dispatch** preparation screen. The player inspects the assigned route, notices/delivery count, carried load and expected job time, then proceeds to normal courier mechanics. This is one ordinary paid-job family, with a scripted onboarding exception.

## Why these lines (reviewable, not extra dialogue)

- **Hector has a different authority style from Guther.** He runs the sorting floor, acknowledges his late dispatch and has already noted when the runner received the bundle. He's brisk and willing to answer complaints from those higher up rather than making a junior messenger defend the office's delay. **This is a proposed characterization only**, not a new invented biography or guarantee of later protection.
- The optional player objection is **about being blamed for late delivery**, not a decorative “What is my job?” questionnaire. Hector answers the real concern. The optional lines don't alter rewards, work terms or story route.
- The bell is an **ordinary duty bell within the working Dispatch House**. This is NOT the later condemned worksite's bell and does not reveal or prefigure the unsafe site in dialogue.
- Hector's words use ordinary work vocabulary: council notices, route sheet, receiving marks. No modern bureaucratic formula or theatrical period accent; no forced bell-related joke or clever proverb.
- “Take the round” is the action to receive task-related papers; **no special inventory loot** is granted.
- The scene is short deliberately. The player learns the actual route selection and delivery verification through the **job UI**, not through instructional monologue.

## Proposed user interface and ordinary first-job handoff

**Job panel — Shift Dispatch** (exact copy and numerical parameters TBD):

| Field | Display direction |
| --- | --- |
| Workplace | **Dispatch House** (LOCKED hub) |
| Supervisor | **Hector D. Smoke — Dispatch Master** (LOCKED NPC) |
| Work | Deliver a municipal **shift-notice bundle** by ordinary courier route |
| Family | **Industry → Hauling** |
| What to inspect first | Route sheet, number of stops, bundle condition/weight, job duration and delivery acceptance instructions |
| Payment | **Not yet cleared.** The payment outcome belongs to this scripted disputed route; show no promised payout. Exact explanation for **why** the work is eventually rejected/unpaid is **not settled at Stage 1** and must be established credibly after the later Wrong Bell discrepancy. |
| Trigger | **[Take the round]** → ordinary work preparation. No mystery event in this screen. |
| Work skill | The character already received **Industry +3 Major Skill** from background choice; no bonus or job XP is earned from the scripted opening task. |

**Proposed next UI actions after acceptance (Stage 2 design, not yet authored/approved):**
1. **[Inspect route and notices]** — check bundle count and marked destinations.
2. **[Choose the route]** — ordinary comparison of shorter/busier path versus longer/easier path (premise direction already in master outline; exact options/consequences must be separately approved).
3. **[Make deliveries / record receipts]** — a reusable receiver/delivery verification work interaction.
4. Only **after normal courier task mechanics resolve**, trigger the one-time **The Wrong Bell** discovery: a worksite closed after harmful fumes is still calling workers in. Do NOT mention that closure or the supposed warning bell in Scene B01.

**Economy and system guardrails (LOCKED globally):**
- The **two scripted work tasks** in Bellrunner's onboarding, and the fight, award **0 coins, 0 ordinary XP and no loot**. Ordinary repeatable dispatch rounds outside the onboarding pay coins/XP. Do not present a definite wage then silently confiscate it.
- +3 Industry was already granted at character creation; the +1 in another Major Skill comes once on selecting one of the later **Commerce / Medicine / Mechanics** branch tasks. No early bonus in this scene.
- Starting inventory is **Basic Clothes + Crude Small Bag + 20 coins**. No free special satchel, rifle, extra medicine or dispatch tools.
- Mandatory prompts belong near start of activities under [Jobs and Time](../../jobs/jobs-and-time.md), not at a surprise later timer.
- Use the ordinary courier/Hauling mechanics wherever possible. Do not create a one-time “ring a bell at the right instant” minigame.

## Critical narrative point to resolve in later scenes

The user has insisted that an onboarding task's lack of wages should **make sense as an exceptional event** rather than falsely teaching players that normal courier work is unpaid.

Scene B01 avoids claiming normal nonpayment and avoids promising money. **A concrete causal explanation must be authored in the Wrong Bell scene**—for example, a route whose council accounting or receiving authority later refuses to validate the closed-site notice. This explanation is **not locked yet** and must not be inferred simply from “not yet cleared” on the draft UI. The second chosen task should follow from resolving that contested round and have its own credible nonpayment context.

## Approval boundary

**LOCKED earlier:** location, Hector's role/name, shift-notice job family, later *Wrong Bell* premise, +3 Industry, shared kit/reward sequence and future Dogman encounter.

**PROPOSED now:** exact Hector dialogue, the optional blame exchange, opening stage direction, route-sheet handoff and payment-state UI language. Do not mark this scene approved until user explicitly agrees to this particular text.

**Not authored:** Stage 2 normal courier interactions; Stage 3 discovery, branch decision and Hector's return exchange; all subsequent route dialogue, Dogman confrontation, fight and clinician/home adaptation.

Related: [Bellrunner overview](README.md), [game-wide dialogue guide](../../interactions/dialogue-style-guide.md), [shared onboarding](../shared-structure.md), [Jobs and Time](../../jobs/jobs-and-time.md).
