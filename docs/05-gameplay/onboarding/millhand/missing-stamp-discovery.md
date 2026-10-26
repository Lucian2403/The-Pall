# Millhand — Stage 3, The Missing Stamp: Discovery & Guther Anvil (APPROVED)

## Editorial status override — 2026-10-22

The project owner approved [Stage 3 Missing Stamp Revision 01](stage-3-approved-script.md). Its new dialogue, scene narration, object descriptions, and journal copy **supersede the historical spoken/UI text below**, while the evidence structure, two inspections, one-time three-way skill grant, and all mechanical constraints in this document remain authoritative. The latest wording has **not yet been integrated into the playable browser prototype**.

**Status: APPROVED AND LOCKED SCENE / DIALOGUE (2026-10-14).** User approved the returned reference plate and cancellation slip, the same-number/date contradiction, both inspection actions, Guther's entire common exchange and all three player/foreman response lines. The first-task reward rules, [approved Stage 2 platework](platework-interaction.md) and strict [Spoken Dialogue Standard](../../interactions/dialogue-style-guide.md) remain canonical. Dates, worker ID, assets, work timings and other implementation details remain TBD.

## Existing situation (LOCKED)

The Millhand has finished ordinary council worker-plate Smithing at Guther's workshop. Its job system reused docket matching, die alignment, a bent-blank incident and mark verification. The scripted first job earns 0 coins and 0 ordinary XP; council acceptance is pending. The player already has +3 Craftsmanship at creation but does **not** receive the +1 second Major Skill until choosing a second-task route.

The approved narrative twist is that an identification number from the council work belongs to a worker officially recorded as dead after a locked-door workshop fire, while an inspector's stamp on that identity's plate appears fresh. Guther should be pressured, not written as an omniscient villain. This is a contained labour-contract incident, not an automatic conspiracy or overarching campaign.

## How the player learns the fact (LOCKED method)

**Trigger:** once the approved Stage 2 job has reached *Platework complete*, the player returns the docket. **Do not interrupt the normal Smithing job or display suspicious casualty information before this point.**

**Minimal physical evidence, without invented personal memory:**

- In the council bundle is a **returned reference plate** carrying **the same worker number as a plate the Millhand has just stamped**. It carries a **separate council inspector's mark**; the player did not apply this inspection mark and should not be asked to forge it.
- A **number-cancellation slip** folded in with the return paperwork lists the worker number as **deceased following the previously established locked-door workshop fire**.
- The inspection mark's **date is later than the recorded death**. This makes the claim of a fresh inspection objectively checkable; **do not rely on the player judging ink freshness by eye**. Exact worker ID and dates remain TBD, shown clearly and consistently on screen only after authored.

**Grounding / scope:** the returned reference plate and cancellation slip are **approved story props** for this one incident, not newly tradeable items, a new city-wide registration law, a scripted confession or evidence of an identified criminal. The reason the council sent both papers and the plate together remains unexplained here—do not invent an answer before the branches.

## Two required inspections (LOCKED; accessible in either order)

1. **[Read the cancellation slip]** — displays the worker number and **Dead — workshop fire**, with recorded date.
2. **[Turn the returned plate]** — displays the same worker number and a **council inspection mark with a later date**. The interface highlights that the marks refer to the same number **only when the player has examined both**.

After both views, display **“Same worker number. Inspection recorded after death.”** as an *illustrative UI finding; exact copy TBD*, not spoken dialogue. Avoid an arbitrary pass/fail Investigation test, fake confusion, hidden pixel hunt, timed menu or third unnecessary confirmation click. All players discover the conflict regardless of their Stage 2 bent-blank choice.

**Keep clear terminology:** `worker number` is the metal number the Millhand stamped; `council inspection mark` is separate and already present on the returned reference; `cancellation entry` is official evidence the named worker was recorded dead. A blank's quality doesn't create or erase that discrepancy.

## Guther confrontation — LOCKED spoken dialogue

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

**Editorial intent:** Guther does read the evidence, but answers the worker's question as a problem of signature and wages. The player calls out the evasion; he doesn't deny it. This is the almost imperceptible uncomfortable edge—**not a punchline**. These exact lines are user approved; preserve their wording.

## Three locked responses → draft lines and route handoffs

The **three player choices, associated Major Skills, spoken player wording and Guther's responses are LOCKED**. Offer all three on a single screen after the common exchange. None is gated by the player having previously chosen the bent-blank option.

| Player response (locked meaning; approved text) | Guther response (LOCKED) | Route unlocked (already LOCKED) |
| --- | --- | --- |
| **[Restamp it]** — “Then I'll mark it again. Send it through.” | “All right. You take the lot to the depot. I'm not signing it clear.” | **Industry / Hauling — Depot Intake Run** |
| **[Question the foreman]** — “Why's the council using a dead man's number?” | “Ask Contracts. They issued the docket.” | **Commerce / Contracts — Disputed Docket** |
| **[Record the number]** — “I'm keeping the number. I want to check the books.” | “Then check them. I've nothing here that'll answer you.” | **Scholarship / Investigation — Ledger Reconciliation** |

**Narrative distinction:** Restamp is willing practical involvement in moving disputed metal; Question asks for contractual authority; Record keeps a reference and seeks another written source. Restamp does **not** forge the council's inspection mark. Record stores the number **in the quest journal/state**, not a new inventory item. None of these three options requires accepting Guther's judgment as truth, and the deeper explanation remains unresolved.

**Restamp route handoff (LOCKED):** the player applies **one corrective/reissue worker-number mark** using the existing Smithing interaction, then proceeds to the Hauling task. This is **not** an extra full Smithing shift or an imitation of the council inspector's mark; 0 coins/ordinary XP. Exact plate source/physical correction method remains an implementation detail.

## Wage, XP, ownership and branch state

- **Common immediate consequence:** Guther cannot sign/clear the disputed council lot. The first task remains **0 coins, 0 ordinary XP** and no permanent item yield. No invented exact contract value.
- **A second task is selected only upon confirming one of the above choices.** Apply the user's locked **+1 level** to the associated **different** Major Skill once on commitment; no second XP payout and no duplicate levels on reload/retry.
- Route selection sets only the local Millhand tutorial branch and appropriate follow-up task. No default permanent crime, reputation, faction, fraud or death-investigation flag.
- The council-owned plate, docket and cancellation slip remain work/quest props; displaying them to the player is not an inventory transfer.
- The player can examine both records again before choosing; do not allow the incident to be skipped by bad Stage 2 workmanship or timer expiry.
- World/job time keeps moving under canonical [Jobs and Time](../../jobs/jobs-and-time.md). Required interactions are resolved before advancing; do not introduce a late hidden checkpoint.
- **The three resulting tasks, two later interactions, Flint fight, 10-coin clinical care and shared 150-coin provisional rent notice are unchanged.** This stage does not trigger them early.

## Tone quality check for approved dialogue

- **“This number was cancelled. Dead in the fire.”** Identifies the contradiction from paperwork, not from an invented memory.
- **“Let me see.”** Guther requests the actual evidence instead of instantly knowing the answer.
- **“I see the date.”** Confirms the newer inspection without a speech explaining the whole mystery.
- **“Can't sign it. No pay till the council clears the lot.”** Moves straight to the practical authority Guther actually possesses; avoids a general moral lecture.
- **“That wasn't my question.” / “I know.”** The single small beat of friction: he knows he evaded the real question. No extra joke or rhetorical proverb.
- **No comedy quota:** unease comes from his inadequate answer, not a wink at the audience.

## Approved scope and open implementation details

**LOCKED:** same worker number on a returned reference plate and death-cancellation slip; a separate council inspection dated after the registered death; two required inspections in either order, no memory or skill gate; Guther's eight-line exchange; all three choices and exact Guther replies; and a single additional corrective worker-number marking action for Restamp, not a fresh full Smithing shift. On branching, award the chosen other Major Skill +1 once, with no wage/ordinary XP from the tutorial work.

**TBD:** exact dates and worker ID, physical prop layout, final system/UI layout, timers, and eventual explanation for the council's inconsistent records. No additional plot or unapproved social system is implied.

Related: [Millhand storyline](README.md), [Stage 2 approved interaction](platework-interaction.md), [Guther opening LOCKED](opening-dialogue.md), [Global Spoken Dialogue Standard](../../interactions/dialogue-style-guide.md).
