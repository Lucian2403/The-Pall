# Scrapper — Stage 2: Strip a Condemned Pump, Ordinary Mechanics Work (PROPOSED)

**Status: PROPOSED FOR USER APPROVAL (2026-10-16); NOT LOCKED.** This follows [Ignatius Smog's proposed Stage 1 dialogue](opening-dialogue.md). The job title, permanent Rust Yard hub, Mechanics Major Skill and first-task structure are [already locked](README.md). This document designs **ordinary reusable disassembly, inspection and grading interactions**, all completed before the unique *Last Dry Floor* discovery in Stage 3.

## What is being stripped — and what is not

The condemned auxiliary drainage pump stands along Rust Yard's old culvert wall. The salvage docket treats the machine as scrap. For this **first supervised clearance**, the foreman has assigned **only detachable outer fittings, covers and nonessential mounting hardware** that the yard has identified as accessible. The **drive, pressure-bearing assembly, main pipe, outlet and working drainage connection are explicitly out of scope**.

A yard-owned tool bench is available. The player is a Scrapper with **Mechanics +3** at creation, not a novice inventing machinery safety rules or a master engineer. The work should be understandable on an ordinary low-level industrial machine and re-usable for other condemned pumps, broken boilers and scrap-yard mechanical lots. Do not create a dedicated tutorial-only pump minigame.

**Caution for production:** the later revealed pump is still serving occupied cellars. Never permit opening a live pressure joint, exposing moving drives or disabling its supply as a supposedly safe low-level stripping action. The safe external-work zone must be physically isolated from the pump's live components in the eventual art/geometry. If that cannot be made technically credible, move the removable parts to an adjacent **already detached side casing** rather than telling the player to dismantle a running drive guard.

## S02-A — Take stock

**[Read the salvage docket]**

A normal work-order panel shows:

| Field | Content |
| --- | --- |
| Job | **Strip a Condemned Pump — Mechanics** |
| Source | Rust Yard's own condemned-stock clearance |
| Target | Exterior, nonessential fittings on the culvert-wall pump |
| Keep | Reusable external brackets, sound fasteners and usable covers if their condition warrants |
| Scrap | Failed or bent parts that cannot be economically reused |
| Do not touch | Main drainage pipe, drive, live joints, pressure-bearing casing and outlet |
| Job pay | **0 coins and 0 ordinary XP in this tutorial clearance**; outside onboarding this same interaction is normally paid |
| Equipment | Yard-owned hand tools, returned to their bench |
| Required action | **[Inspect the outer fittings]** |

This is not an invitation to select a global pump Shutdown control. At this point the player has **not** noticed a working load, warning cloth or signalling knocks. A condemned-stock label does not give the player permission to disregard the limited work order.

**[Inspect the outer fittings]** — show visible wear on exterior fasteners, a sound bracket and an old guard/cover. Mark their current state in the ordinary inspection layer; exact quality grades, item IDs, weight and numerical yields remain TBD.

## S02-B — Choose a removal order

Before touching a tool, let the player choose:

| Choice | Genuine consequence |
| --- | --- |
| **[Back off the cover fasteners first]** | Standard direct dismantling. Quicker if the fasteners cooperate, but the older bracket still carries some load from the loose cover and can resist removal |
| **[Support the cover before loosening it]** | A little more preparation, but reduces the chance of bending the reusable bracket during removal |

Either is a legal safe way to remove *nonessential outer hardware*, as eventually supported by shared Mechanics interaction quality/time rules. The safer choice isn't free; it takes more preparation. The quicker choice isn't a hidden compulsory failure.

**[Choose a yard tool]** — use a plausible workshop spanner/wrench or supporting clamp **from the yard bench**, not a starter item. Tools are work props that stay at Rust Yard. Do not give the player a lasting wrench on accepting or finishing the task.

## S02-C — Routine complication: a stubborn fastener

As the worker begins removing the outer fittings, **one corroded fastener will not turn freely**.

**Job text (not dialogue):** *One of the cover bolts holds fast. The bracket shifts a little when you put force on it.*

**[Examine the bolt and bracket]** — reveal whether the bracket is being stressed; do not require the player to identify hidden materials by guesswork. Then offer three ordinary Mechanics responses:

1. **[Ease the bolt free with a second spanner]** — support the bracket and work the bolt loose slowly, protecting the cover and fastener. More handling time; preserves good condition if inspection confirms it.
2. **[Take off the neighbouring mount first]** — remove a different accessible, nonessential support to relieve strain before returning to the stubborn bolt. More steps/time; useful when the original angle is awkward.
3. **[Force the bolt]** — faster but risks twisting the bracket or shearing the fastener. If it breaks, the damaged pieces are graded as scrap and the player must complete a normal rework/record step. The forceful choice is not a guaranteed way to preserve valuable parts.

Do not let a scripted break damage the **live drainage pipe**, stop the pump or injure cellar residents during the ordinary Stage 2 loop. The mishap can cost salvage quality, material yield (if normal work rules support it) or job time, but **does not give permanent player-owned scrap or an invented injury system**. Once the mistake is visible, allow honest correction without an unavoidable hard fail.

Where the work art cannot safely support removing that neighbouring piece, replace it with another already-identified detachable support. The important reusable mechanics are tool choice, sequence, time/condition trade-off, and a straightforward fix.

## S02-D — Inspect and sort the recovered hardware

After the outer parts are detached:

**[Check recovered condition]** — review each accessible piece using familiar quality categories. Do not assign fixed condition numbers, prices or invented item recipes here.

**[Sort the pieces]** — send viable brackets/fasteners to the yard's **reuse bin**, and severely bent or broken pieces to the **scrap bin**.

- A careful player can preserve more reusable stock.
- A hurried player may have made scrap out of a sound fastener, but should not be told that poor-quality metal is fit for use.
- If the player misgrades a piece, **[Inspect again]** allows correction; sorting never awards loot to the player's bag. Employer-owned salvage stays in the yard.
- The final mechanical work summary shows parts recovered, rejects, any damage and estimated ordinary yard value only if later economy systems provide the value. Do **not** settle personal wages from that appraisal during onboarding.

**[Record the strip tally]** — a repeatable Mechanics job close-out form reflects exactly what was removed and the player's actual condition choices. Do not let a reload multiply recovered parts or wages.

## S02-E — Foreman sign-off

*Ignatius looks over the tally and the sorted fittings. His cough interrupts him for a moment.*

**SMOG:** “All off?”

**PLAYER:** “The outside fittings. I left the pipe alone.”

**SMOG:** “Good. Put the tools back.”

**[Return yard tools]** and **[Close the clearance docket]** conclude **only the normal stripping job**. These lines work whether the player preserved every part or broke one; the written tally holds that distinction. If there is a serious misgrade, Ignatius can ask for a recount through ordinary job validation, without another authored NPC dialogue tree.

The **0-coin, 0-ordinary-XP** tutorial clearance has been stated on the docket since entry. No promise of withheld wages, no unexpected fee and no bonus for the choice to protect parts. Recurring *Strip a Condemned Pump* jobs outside this personal opening pay the usual coin/skill XP according to future general Mechanics rules.

## S02-F — Hand over to Stage 3: The Last Dry Floor

Only **after** the docket has been closed, the routine tools returned and the external housing area is cleared does the one-off *Last Dry Floor* discovery become available. **Stage 3 begins** when the player notices the old pressure dial cycling, finds the warning cloth (“DON'T STOP IT. WATER REACHES THE BEDS.”) and hears three deliberate knocks beneath the iron floor.

Do **not** put any of these clues in the Stage 2 dialogue, choice text, reward screen or incidental status message. Likewise, no premature encounter with Barnaby Rusk, no trip into the occupied cellar, and no choice of second Major Skill before the discovery. The pump's essential drainage link remains uncut.

## System/persistence guardrails

- Reusable job sequence: **read docket → inspect exterior → choose removal order/tool → resolve stuck fastener → inspect and grade → sort → sign off**. These are ordinary Mechanics family actions, not special origin-exclusive UI.
- Work interactions appear within the first two minutes of the job under the approved [Jobs and Time](../../jobs/jobs-and-time.md) rule; world time continues during choices. If the base job timer ends while an action remains unresolved, completion waits for the interaction.
- The job must have legible risks/rework and equal access to required tools. No hidden high-skill gate, no unannounced auto-break due to an invisible stat, and no forced manual click at the far end of a long work timer.
- Persist the condition/grade outcome of the **yard's work order** but do not mint player items. The character keeps **Basic Clothes, Crude Small Bag, 20 coins and Mechanics +3** after Stage 2.
- Only the Stage 3 choice can grant **+1 level in a different Major Skill (Industry, Fieldcraft or Commerce)**, once.
- The story incident is limited to the **initial** condemned auxiliary drainage pump; future repeatable pump jobs cannot repeatedly trigger the under-yard cellar story.
- No spontaneous barrel of live steam, player fatality, new disease, secret Pall influence, or side-plot about Ignatius's cough. A routine bolt problem is enough.

## Approval boundary

**Already locked:** Rust Yard and Ignatius, initial auxiliary drainage pump, Mechanics +3, external-only first strip, reusability as a normal job, zero tutorial rewards, and *The Last Dry Floor* as the later unique reveal.

**Proposed for Stage 2:** exact docket view, two removal-order choices, workshop tool handling, three remedies for one corroded fastener, part grading and tally, Ignatius's short sign-off, and safe Stage 3 handoff.

**TBD:** actual machine geometry, strain/load simulation, quality and salvage formulas, exact job duration, names/stats of actual recoverable materials, yard tool asset IDs, wages/XP outside the tutorial, and finalized UI copy.

Related: [Scrapper master story](README.md), [Stage 1 proposed](opening-dialogue.md), [shared onboarding](../shared-structure.md), [jobs and time](../../jobs/jobs-and-time.md), [dialogue style](../../interactions/dialogue-style-guide.md).
