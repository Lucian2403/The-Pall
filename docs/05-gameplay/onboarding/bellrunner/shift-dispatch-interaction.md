# Bellrunner — Shift Dispatch Courier Work (Stage 2 — PROPOSED)

**Status: PROPOSED FOR USER REVIEW (2026-10-15). NOT LOCKED.** This draft covers only the ordinary Industry / Hauling work between the [approved Hector opening](opening-dialogue.md) and the separately authored future *Wrong Bell* discovery. The Dispatch House, Hector D. Smoke, the council-notice round, the later sealed unsafe-site order, the three second-skill branches and Dogman are already locked in the [Bellrunner master](README.md). The exact work interactions and UI wording here are proposals.

## Design boundary

- A Bellrunner is an experienced city courier. The screen offers actual work choices, not a tutorial speech explaining the job to their own character.
- The work is **ordinary Shift Dispatch**, a reusable courier/Hauling job family available through the persistent Dispatch House. Do not build a one-off Bellrunner-only delivery minigame.
- The sealed order is simply one of the round's ordinary-looking pieces of council paper at this stage. **Do not disclose the condemned block, harmful fumes, anomalous bell or official closure until Stage 3**, after ordinary route work.
- Council notice bundle, route sheet and receipt marks are **job/quest props**, not tradeable inventory or permanent starter tools. Basic Clothes, one Crude Small Bag and 20 coins remain the only universal starting inventory.
- The scripted task is ultimately worth **0 coins, 0 ordinary XP and no loot**; Industry +3 was granted at creation. Its **credible cause of nonpayment belongs to Stage 3**. Do not announce a false guaranteed wage in Stage 2. The eventual different-Major-Skill +1 grant belongs only to branch commitment later.

## S02-A — Check the round (ordinary preparation)

After Hector's approved **[Take the round]**, the normal **Shift Dispatch** work panel opens.

**Panel fields (numerical values TBD):**

| Field | Player sees |
| --- | --- |
| Work / source | Shift Dispatch / Dispatch House — Hector D. Smoke |
| Skill family | Industry → Hauling |
| Load | A bundle of council shift notices, with count, recorded destination order and carried weight displayed from the job data |
| Documentation | Route sheet with addresses and spaces for receiving marks |
| Travel | Route alternatives with estimated duration and handling conditions (exact values TBD) |
| Wages | **Not yet cleared** — the already-approved Stage 1 payment-state wording; no numeric promise |
| Required preparation | **[Check the round]** to compare the physical bundle against the addresses marked on the sheet |

**Action: [Check the round].** The player is shown a straightforward comparison of notices and address lines. If work order is disturbed or a count needs correcting, the player can **[Put the notices in route order]** before leaving. This must be visible, recoverable bookkeeping, not a hidden-number puzzle. One representative preparation action covers the bundle rather than making the player click once per letter.

**Outcome:** the parcel set is ready, no equipment is awarded, and the player proceeds to ordinary route selection. A clean count does not reveal what any sealed council order contains.

**Reusable module (working name):** courier_bundle_check — compare job cargo count/condition against a dispatch sheet; reorder/reconcile if required. ID and exact condition variants TBD.

## S02-B — Choose the road (ordinary Hauling route choice)

The route sheet offers two plausible ways to cover the same stops. Neither changes which sealed document will later produce the tutorial incident.

| Choice | Practical distinction | Possible work consequence |
| --- | --- | --- |
| **[Take the direct road]** | Shorter distance through busier streets, among carts and other couriers | Lower base travel time; higher likelihood of crowd delay or jostled papers; no forced injury or automatic lost notice |
| **[Take the quieter road]** | Longer circuit with more room to carry the bundle undisturbed | Longer base time; fewer crowd-handling complications |

This is a real **time/handling trade-off**, not a moral choice or a hidden reward test. Show both estimates and their qualitative risks before selection. The two options should be viable with the universal starter kit. No cart, horse, weapon or paid upgrade is required.

**Reusable module (working name):** hauling_route_choice — path duration against congestion, load-handling exposure and incident weighting. The numerical travel model, exact street geometry and probability weights remain TBD.

World and travel timers follow [Jobs and Time](../../jobs/jobs-and-time.md). No late mandatory route prompt should appear near the end of a timer; ordinary required interactions are front-loaded.

## S02-C — A receiving mark is spoiled (ordinary delivery discrepancy)

At a **routine** receiving point, after a notice has been handed over, the inked receiving mark drags into an adjacent line of the route sheet. The courier knows a hand took the paper, but the sheet no longer clearly proves **which stop** acknowledged it.

**Proposed UI description:**

> The receiving mark has smeared across two lines. You saw the notice taken, but the sheet won't show it plainly.

**Choose one ordinary work response:**

| Player action | Result | Meaningful trade-off |
| --- | --- | --- |
| **[Ask for a fresh mark]** | Have the receiver mark the correct line again. The receipt is clear. | Some additional work time, strongest direct proof of delivery |
| **[Check their receiving book]** | Compare the office's entry with the route sheet. If it agrees, note that confirmation; if it does not, the courier can still request a fresh mark. | Extra inspection/time, alternative documentary proof; not an instant free solution |
| **[Note the spoiled mark and go on]** | Record that the notice was handed over but the mark cannot be read; carry that uncertainty back on the sheet. | Quicker departure, but the ordinary work report records an unresolved receipt rather than pretending it is valid |

All three choices are *honest* work methods. None requires forgery, invents a named clerk, causes a permanent disciplinary flag, blocks the job, deducts starter coins, or creates special loot. The game should preserve the visible receipt condition for the round's later report. The tutorial's eventual exceptional nonpayment must not depend on the player deliberately picking the poorest receipt option.

A smudged receiving mark is a **reusable mundane courier incident**; it does not reveal the sealed-site secret, supply a clue about the Shift Marshal, or change which of the three later Major Skills can be chosen.

**Reusable module (working name):** hauling_receipt_verification — receiving proof, spoiled documentation, an office-book cross-check, and truthful annotation if still unresolved. Future ordinary Hauling jobs can parameterize the type of discrepancy and its normal wage/quality effects.

## S02-D — Finish the ordinary circuit; hand off to Stage 3

The player completes the route's **routine** notice stops and receives a normal courier-work summary: addresses attended, bundle/receipt condition, route choice and elapsed time. Do not place separate compulsory puzzles at every door.

A **sealed council order still requires final presentation at its marked address**. The script offers **[Take the final notice]** as the intentional handoff into the unique *Wrong Bell* scene. Nothing in the Stage 2 summary tells the player that its destination is officially closed. The abnormal bell, closure evidence, night-shift summons, watchman and moral branch choice all belong to **Stage 3, not here**.

**Resolution presentation:** ordinary work performed; receipt verification outcome visible; **payment not yet cleared**. No wage, ordinary skill XP, loot or second-skill level is delivered in Stage 2. Stage 3 must resolve the exceptional disputed round and establish a concrete reason why this particular council job pays nothing. Standard future Shift Dispatch rounds still use ordinary wages and skill XP.

## Work invariants, resilience and implementation

- **Fixed tutorial interaction:** one useful inspection/preparation, a two-route choice and one ordinary receiving-mark complication. In general repeatable jobs, the incident should be conditional and repetition-managed, with occasional uneventful rounds.
- **Timing:** preparation and mandatory interactive checkpoints appear near the beginning of the activity, within the first-two-minute guidance. Timers continue while a prompt is open; a finished timer never bypasses unresolved input. The later *Wrong Bell* handoff is a deliberate action after the ordinary circuit, not an unexpected late timer pop-up.
- **Failure/recovery:** unclear papers may require more time, a second mark or an honest notation. No single work action can erase the scripted sealed order, lose the quest beyond recovery or force a failed tutorial restart. Actual roll formulae, skill-dependent options and elapsed-time modifiers are TBD.
- **Skill:** Industry +3 is already present. Do not assume a Hauling subskill tier or invent an Industry skill threshold. Any future Hauling expertise bonus must fit the general progression and inspection systems. One +1 in Commerce / Medicine / Mechanics belongs to the selected later route.
- **State (working identifiers, NOT canon IDs):** chosen_route; notice_count_verified; receipt_status = clear / book_confirmed / noted_unclear; ordinary_dispatch_work_complete; final_sealed_notice_pending; wrong_bell_event_fired. Only the first four describe this reusable job; the last two are tutorial story gates.
- **No new permanence:** no special reputation, guilt, crime, story faction, money or permanent gear consequences have been approved for these ordinary choices. Later branch and Dogman motivations depend on the Stage 3 choice, not on how the player handled a smudged mark.
- **Shared game architecture:** implement with authored data and known outcomes; do not use runtime freeform AI to adjudicate the job.

## Approval boundary

**Already LOCKED elsewhere:** Bellrunner Industry +3; Hector, Dispatch House and the approved spoken opening; Industry/Hauling Shift Dispatch as first job; hidden *Wrong Bell* discovery only after ordinary work; the three later Commerce/Medicine/Mechanics tasks; Dogman; no tutorial wages/XP/loot; common clinic/home/rent path.

**PROPOSED IN STAGE 2:** bundle-check screen and optional reordering; direct-versus-quieter road trade-off; spoiled receiving mark and its three handling choices; the round-summary presentation and explicit final-notice handoff; working data identifiers.

**TBD / later stage:** number of notices, destination labels, site location, duration, weights, threshold/percentage formulas, final UI prose, the closed-site reveal, Hector's post-round response and the exact nonpayment cause. Do not canonize these unapproved details by writing them into a LOCKED summary.

Related: [Bellrunner background](README.md), [Approved Hector Stage 1](opening-dialogue.md), [Shared onboarding structure](../shared-structure.md), [Jobs and Time](../../jobs/jobs-and-time.md), [Interaction architecture](../../interactions/interaction-generation.md), [Spoken dialogue standard](../../interactions/dialogue-style-guide.md).
