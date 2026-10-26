# Millhand — Stage 5: The Wage Claim / Cornered — Editorial Revision 01

**STATUS: APPROVED EDITORIAL CANON — STAGE 5 REVISION 01, WITH PERSONAL JOURNAL UPDATE (2026-10-23).** The project owner approved this version including the revised first-person Journal. **Not yet installed in the playable build.** This proposal reopens spoken dialogue, narration, interface instructions, wrong-object observations and journal copy, **not** the approved Stage 5 structure or combat rules. Historical mechanics and approved causal constraints: [The Wage Claim and Cornered](flint-confrontation.md). Follows approved [Stage 4 editorial Revision 01](stage-4-three-routes-editorial-rewrite-review-draft.md) and the [game-wide writing standard](../../interactions/dialogue-style-guide.md).

## Specific weaknesses in the prior copy
- The original bill confrontation made Flint sound like a clerk reporting a case; **he is a paid collector, not a council officer**. Have him identify the workshop worker and demand money plainly.
- “I don't pay wages” is a useful limited answer but can sound too carefully structured beside every other clipped line. Allow occasional longer plain speech when he needs to explain who sent him.
- The previous choice between reading the bill and challenging authority was underspecified in displayed dialogue. Present both as genuine accessible interactions with the same necessary information, not different routes or hidden skill tests.
- Each Stage 4 result must be voiced only on its branch. Flint learns nothing about the depot, Contracts, or records room until the player says it.
- “Move.” / “No.” can remain a short escalation if placed against a believable physical obstruction; the danger should follow from where Flint stands and his club, not from repeated ominous prose.
- Correctly distinguish the contractor's **charge against the player** from the **cancelled worker number referenced on the plate lot**. Do not imply the dead worker personally owes Flint or that Flint has lawful collection authority.

## Scene 5A — The Wage Claim

**Location:** Existing industrial service passage, on the way home. No invented street name or neighborhood.

*You enter the narrow passage on your way home. A man steps into your path. He has a short club at his side and a folded paper in one hand.*

**FLINT:** “You did the plate work for Anvil?”

**PLAYER:** “Yes.”

**FLINT:** “They've stopped that lot. The contractor wants money for the delay. They've got you down for the job.”

**PLAYER:** “I haven't been paid for that work.”

**FLINT:** “I wasn't sent to pay you.”

*Flint holds out the folded paper.*

**CURRENT INSTRUCTION:** Check the demand or ask who sent Flint.

**PLAYER CHOICE 1 — Read the demand.**

*You read the contractor's paper. You find the disputed plate lot reference and the same cancelled worker number you found in the council's records. The contractor has entered a processing charge against you as the worker assigned to the lot. There is no record of wages being paid to you.*

**Authoring constraint:** The contractor charge has no established numerical amount; do not invent one.

**PLAYER:** “Why have they put the charge on me?”

**FLINT:** “They've got you down for the work. The contractor sent me to collect it.”

**PLAYER CHOICE 2 — Ask who sent him.**

**PLAYER:** “Who gave you the right to take money from me? The council?”

**FLINT:** “The contractor sent me. I work for him.”

*Flint holds the paper where you can read it. You find the lot reference, the cancelled worker number and the charge entered against you. There is no record of wages paid to you.*

Both choices expose the contractor's role and the same essential evidence; neither makes Flint a council officer. “Read the demand” is a physical inspection; the other is an explicit spoken challenge. Both retain the chance to examine the document as a read-only prop afterward.

### Common exchange after either choice

**PLAYER:** “That worker number was cancelled. The man died in the fire.”

**FLINT:** “I didn't put it on there.”

**PLAYER:** “Who did?”

**FLINT:** “Don't know. They don't tell men like us.”

**PLAYER:** “And you still want me to pay?”

**FLINT:** “Yes.”

**PLAYER ACTION:** Tell Flint what you found in your second job. Only the spoken response from your actual Stage 4 route is available. It does not appear or advance automatically.

### Route-specific evidence — only one is present

**If Depot Intake Run / Industry:**

**PLAYER:** “I took metal plates to the depot. The clerk recorded them as plates. I've got the receipt.”

**FLINT:** “They've written ‘workers’ on mine.”

*Flint keeps his paper. He gives no explanation for the difference.*

**If Disputed Docket / Commerce:**

**PLAYER:** “I went to Contracts. They recorded the man as dead in one place and active in another. The clerk took my complaint.”

**FLINT:** “Nobody told me.”

*Flint has no reply to the two council entries. His demand is still from the contractor, not the Contracts clerk.*

**If Ledger Reconciliation / Scholarship:**

**PLAYER:** “I checked the records. They kept putting that number in the wage books after the man died.”

**FLINT:** “Then go and tell them. I don't keep the books.”

*Flint does not know who altered the records.*

**CURRENT INSTRUCTION:** Tell Flint you are leaving.

**PLAYER ACTION / SPOKEN:** “I'm going home.”

*Flint folds the paper. He moves farther across the passage, leaving too little room for you to pass without going around him.*

## Scene 5B — Cornered

**FLINT:** “Not till I've got the money.”

**PLAYER:** “They didn't pay me a coin.”

**FLINT:** “I heard you.”

*Flint takes hold of his club. A work cart stands to one side of the passage.*

**PLAYER:** “Move.”

**FLINT:** “No.”

*You have to choose how to meet him. Flint is close enough to strike if you try to push past.*

**CURRENT INSTRUCTION:** Choose your position before Flint comes at you.

**PHYSICAL CHOICE 1 — Brace and defend.**

*You plant your feet and raise your arms to protect your head and body.*

**PHYSICAL CHOICE 2 — Keep moving.**

*You move to the side, trying to get past Flint before he closes the space.*

**PHYSICAL CHOICE 3 — Use the cart as cover.**

*You move behind the nearby work cart, keeping it between you and Flint for the beginning of the fight.*

**Transition:** Stage 6 — The fight begins after one of these three choices. **All three lead into genuine turn-based PvE**. Each must feed its stated stance/position to the combat system; none is a fake peace option or a scripted automatic bonus. The exact numerical effect is governed by the existing combat implementation, not invented here.

## Context-specific inspections and harmless wrong selections

All scene observations are in **second person**, literal and restricted to facts currently known. An incorrect click never advances dialogue or spends a combat turn.

| Context | Player-facing observation |
| --- | --- |
| Inspect the folded bill before Flint has offered it | “Flint still has the folded paper in his hand. He has not handed it to you.” |
| Examine the bill again after the initial choice | Show the actual bill fields again without reissuing a charge or advancing the exchange |
| Try to discuss the depot if the player followed Contracts/Records | The depot-specific speech option does not exist; never provide a generic wrong-route message that spoils other branches |
| Select the club during the Wage Claim | “Flint has a short club at his side. You cannot take it from him by examining it.” |
| Inspect the cart before choosing a stance | “A work cart stands against one side of the passage. Flint is blocking the way ahead.” |
| Try to leave during the required conversation | “Flint is still blocking the passage. Finish speaking to him before you try to get past.” |
| Select an inventory or journal page | Browsing remains immediate and free. Returning does not advance the conversation or change the fight |

No red highlight identifies the right response. Each required utterance remains visible until the user advances or selects the next explicit speech option. The 1.2-second presentation delay belongs to actions with committed outcomes, never autoplay.

## Journal — first-person personal account (Revised 2026-10-22)

This is the Millhand's private account of a bad day, not a transcript or clerk's report. A little anger, fatigue and ordinary disbelief belong here. Record only the facts from this player's route; the speaker may add their own reaction without inventing other discoveries.

**After first meeting Flint:**

*I was heading home when Flint stopped me in the passage. The contractor wants money because the council held up Anvil's plates. What a fine business. They haven't paid us, and now they want me to pay them.*

**After examining or challenging the charge:**

*I checked the contractor's paper. They've put the charge against me, and there's that same dead worker's number again. Flint wasn't sent by the council. The contractor sent him. He came for money, nothing else.*

**Only the selected second-job route is recorded:**

- **Depot:** *I told Flint I delivered metal plates. The depot clerk recorded them properly, and I have the receipt. The contractor's paper had workers written on it. Still no answer for that.*
- **Contracts:** *I told him about the two council records and the complaint I made. Nobody had told him. Seems he was only given enough information to collect the money.*
- **Records:** *I told him about the wages entered after the man's death. Flint didn't know who made those entries. I don't think he much cared, either.*

**After Flint blocks the passage:**

*I told him I was going home. He wouldn't move. Took hold of his club instead. I had to decide how to get past him.*

**Optional stance note — only the chosen action:**

*I braced myself.* / *I tried to move around him.* / *I used the nearby work cart as cover.*

No outcome is entered here until Stage 6 resolves; no invented damage, hidden thoughts before the fight or other branch's evidence.

## Non-negotiable continuity

- Flint is the contractor's working collector, not a lawful bailiff/guard or the person who altered council records.
- The contract charge is **spurious and unquantified**; do not invent a debt amount, law, repayment option or legal penalty.
- The same cancelled worker number is on the contractor's lot reference, but the processing charge is directed at the living player for the held-up lot.
- All three Stage 4 routes lead here, with **only their respective evidence lines** available.
- No money, items, ordinary XP, Arms XP, health change or reputation change from the conversation.
- The player still has 20 starting coins ahead of the Stage 7 clinic unless genuinely spent through a separately approved system; the tutorial does not collect the fee.
- The encounter starts exactly once; all three stances have intended distinct tactical impacts subject to the common combat rules; Flint does not speak an extra threat after his last “No.”
- Stage 6 combat, clinic treatment and home/rent follow, while the deeper record fraud remains unresolved.
- The currently playable Millhand v0.4.1 is **not** updated by this draft.

