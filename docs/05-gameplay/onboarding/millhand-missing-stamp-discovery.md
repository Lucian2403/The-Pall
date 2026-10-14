# Millhand — Stage 3, The Missing Stamp: Discovery & Guther Anvil

**Status: PROPOSED SCENE / DIALOGUE FOR USER REVIEW (2026-10-14).** The *Missing Stamp* premise, three response routes, first-task reward rules and approved Guther opening are already LOCKED. **The mechanism of the discovery, exact spoken lines, inspection UI and choice-response dialogue below are NEW PROPOSALS, not canon.** The approved [Stage 2 platework](millhand-platework-interaction.md) completes before this scene. Follow the strict [Spoken Dialogue Standard](../interactions/dialogue-style-guide.md).

## Existing situation (LOCKED)

The Millhand has finished ordinary council worker-plate Smithing at Guther's workshop. Its job system reused docket matching, die alignment, a bent-blank incident and mark verification. The scripted first job earns 0 coins and 0 ordinary XP; council acceptance is pending. The player already has +3 Craftsmanship at creation but does **not** receive the +1 second Major Skill until choosing a second-task route.

The approved narrative twist is that an identification number from the council work belongs to a worker officially recorded as dead after a locked-door workshop fire, while an inspector's stamp on that identity's plate appears fresh. Guther should be pressured, not written as an omniscient villain. This is a contained labour-contract incident, not an automatic conspiracy or overarching campaign.

## How the player actually learns the fact (PROPOSED)

**Trigger:** once the approved Stage 2 job has reached *Platework complete*, the player returns the docket. **Do not interrupt the normal Smithing job or display suspicious casualty information before this point.**

**Minimal physical evidence, without invented personal memory:**

- In the council bundle is a **returned reference plate** carrying **the same worker number as a plate the Millhand has just stamped**. It carries a **separate council inspector's mark**; the player did not apply this inspection mark and should not be asked to forge it.
- A **number-cancellation slip** folded in with the return paperwork lists the worker number as **deceased following the previously established locked-door workshop fire**.
- The inspection mark's **date is later than the recorded death**. This makes the claim of a fresh inspection objectively checkable; **do not rely on the player judging ink freshness by eye**. Exact worker ID and dates remain TBD, shown clearly and consistently on screen only after authored.

**Grounding / non-canon scope:** the returned reference plate and cancellation slip are **proposed story props** for this one incident, not newly tradeable items, a new city-wide registration law, a scripted confession or evidence of an identified criminal. The reason the council sent both papers and the plate together remains unexplained here—do not invent an answer before the branches.

## Two short required inspections (PROPOSED; accessible in either order)

1. **[Read the cancellation slip]** — displays the worker number and **Dead — workshop fire**, with recorded date.
2. **[Turn the returned plate]** — displays the same worker number and a **council inspection mark with a later date**. The interface highlights that the marks refer to the same number **only when the player has examined both**.

After both views, display **“Same worker number. Inspection recorded after death.”** as a *proposed UI finding*, not spoken dialogue. Avoid an arbitrary pass/fail Investigation test, fake confusion, hidden pixel hunt, timed menu or third unnecessary confirmation click. All players discover the conflict regardless of their Stage 2 bent-blank choice.

**Keep clear terminology:** `worker number` is the metal number the Millhand stamped; `council inspection mark` is separate and already present on the returned reference; `cancellation entry` is official evidence the named worker was recorded dead. A blank's quality doesn't create or erase that discrepancy.

## Guther confrontation — proposed first spoken draft

*The Millhand sets the returned plate beside the cancellation slip.*

**PLAYER:** “This number was cancelled. Dead in the fire.”

**GUTHER:** “Let me see.”

*Guther compares the two.*

**PLAYER:** “The inspector marked his plate afterward.”

**GUTHER:** “I see the date.”

**PLAYER:** “What do we do?”

**GUTHER:** “Can't sign it. No pay till the council clears the lot.”

**PLAYER:** “That wasn't my question.”

**GUTHER:** “I know.”

**Editorial intent:** Guther does read the evidence, but answers the worker's question as a problem of signature and wages. The player calls out the evasion; he doesn't deny it. This is the almost imperceptible uncomfortable edge—**not a punchline**. All lines remain subject to user approval.

## Three locked responses → draft lines and route handoffs

The **three player choices and associated Major Skills are LOCKED**, but the **spoken wording below is PROPOSED**. Offer all three on a single screen after the common exchange. None is gated by the player having previously chosen the bent-blank option.

| Player response (locked meaning; draft text) | Guther response (proposed) | Route unlocked (already LOCKED) |
| --- | --- | --- |
| **[Restamp it]** — “Then I'll mark it again. Send it through.” | “All right. You take the lot to the depot. I'm not signing it clear.” | **Industry / Hauling — Depot Intake Run** |
| **[Question the foreman]** — “Why's the council using a dead man's number?” | “Ask Contracts. They issued the docket.” | **Commerce / Contracts — Disputed Docket** |
| **[Record the number]** — “I'm keeping the number. I want to check the books.” | “Then check them. I've nothing here that'll answer you.” | **Scholarship / Investigation — Ledger Reconciliation** |

**Narrative distinction:** Restamp is willing practical involvement in moving disputed metal; Question asks for contractual authority; Record keeps a reference and seeks another written source. Restamp does **not** forge the council's inspection mark. Record stores the number **in the quest journal/state**, not a new inventory item. None of these three options requires accepting Guther's judgment as truth, and the deeper explanation remains unresolved.

**Possible small revision before approval:** “Then I'll mark it again” may read as needless duplicate work after Stage 2 stamping. If so, have this option authorize **a single correction/reissue mark** on the returned/replacement worker plate, using the same existing Smithing work interaction, then assign the Hauling route—**no new full Smithing shift** and still **no coins/ordinary XP**. This detail is UNDECIDED; do not lock an extra stamping action silently.

## Wage, XP, ownership and branch state

- **Common immediate consequence:** Guther cannot sign/clear the disputed council lot. The first task remains **0 coins, 0 ordinary XP** and no permanent item yield. No invented exact contract value.
- **A second task is selected only upon confirming one of the above choices.** Apply the user's locked **+1 level** to the associated **different** Major Skill once on commitment; no second XP payout and no duplicate levels on reload/retry.
- Route selection sets only the local Millhand tutorial branch and appropriate follow-up task. No default permanent crime, reputation, faction, fraud or death-investigation flag.
- The council-owned plate, docket and cancellation slip remain work/quest props; displaying them to the player is not an inventory transfer.
- The player can examine both records again before choosing; do not allow the incident to be skipped by bad Stage 2 workmanship or timer expiry.
- World/job time keeps moving under canonical [Jobs and Time](../jobs/jobs-and-time.md). Required interactions are resolved before advancing; do not introduce a late hidden checkpoint.
- **The three resulting tasks, two later interactions, Flint fight, 10-coin clinical care and shared 150-coin provisional rent notice are unchanged.** This stage does not trigger them early.

## Tone quality check for new draft

- **“This number was cancelled. Dead in the fire.”** Identifies the contradiction from paperwork, not from an invented memory.
- **“Let me see.”** Guther requests the actual evidence instead of instantly knowing the answer.
- **“I see the date.”** Confirms the newer inspection without a speech explaining the whole mystery.
- **“Can't sign it. No pay till the council clears the lot.”** Moves straight to the practical authority Guther actually possesses; avoids a general moral lecture.
- **“That wasn't my question.” / “I know.”** The single small beat of friction: he knows he evaded the real question. No extra joke or rhetorical proverb.
- **No comedy quota:** unease comes from his inadequate answer, not a wink at the audience.

## Approval scope requested

1. **Evidence logic**: returned council reference plate + cancellation slip, identical number, inspector date **after** recorded death.
2. **Two inspect actions** with direct comparison and no memory/skill gate.
3. **Guther's exact common lines**, to be read aloud critically under the locked whole-game tone.
4. **Three response-wordings and reactions** (routes/skills are already locked, words are not).
5. Resolve the small Restamp action ambiguity before implementation; precise date/worker IDs, document art, NPC animation, timings and exact UI copy may stay TBD.

Related: [Millhand storyline](millhand.md), [Stage 2 approved interaction](millhand-platework-interaction.md), [Guther opening LOCKED](millhand-opening-dialogue.md), [Global Spoken Dialogue Standard](../interactions/dialogue-style-guide.md).
