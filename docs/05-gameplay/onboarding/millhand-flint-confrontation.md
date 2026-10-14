# Millhand — Stage 5: The Wage Claim, Cornered, and Local Plot Payoff (APPROVED)

**Status: FLINT SCENE AND REVISED DIALOGUE APPROVED/LOCKED (2026-10-15).** The user approved Flint's blunt speech and limited access to information, the contractor bill/lot reference, the distinct Stage 4 evidence responses, both interactions (*The Wage Claim* and *Cornered*), physical stance choices and the limited local outcome. Flint is not the author of the records. **Full mystery culprit, specific payment chain, numerical combat rules, character injuries and implementation details are not canonized by this approval.** The fight is turn-based and defeat-safe; combat mathematics stays deferred.

## First, what is missing from Stage 4

The three Stage 4 routes and supporting NPC exchanges are **approved and locked**. They reveal useful facts but, on their own, feel incomplete:

- **Depot Intake:** “Then put down plates. I receive what's here.” The clerk's answer is overly tidied up. A physically meaningful load/receipt task is promising, but ending at an unexplained manifest is not yet a payoff.
- **Contracts:** “You can put that in writing.” A credible bit of bureaucratic evasion, but it becomes a dead end unless the formal objection later matters.
- **Archive:** “I don't know.” Realistic but inert if the discovered altered wage entry has no practical consequence afterward.

**The reviewed Stage 4–5 episode is approved as a self-contained local shakedown, without claiming to solve the larger record fraud.** Each route gives the player a fact they can use when Flint arrives. These should be distinct observations that change a response, not just three ways to fill a notebook and see identical dialogue.

## Why Flint confronts the player (LOCKED CAUSAL LINK)

A **contractor responsible for the disputed municipal worker-plate lot** treats the council's refusal to clear the lot as a **chargeable inspection delay**. The contractor has the player's workshop mark/work assignment on the lot's existing paperwork and sends its collector, **Flint**, after the worker rather than settling the dispute. This does **not** require Flint to track the player's actions across three routes, be secretly present at each site, or know what the player privately discovered. He knows which worker was assigned to the disputed batch; this is enough to seek them out along the established common homeward passage.

The demand contains two linked references:
1. **The worker-plate lot reference**, including the **same cancelled number** seen in The Missing Stamp;
2. **A demand for a processing/inspection charge against the player as the assigned workshop worker**.

This makes the dead-worker record material to Flint's business: the number remains usable on contractor paperwork even while another official record calls its holder dead. The charge may be spurious and not backed by lawful enforcement; **Flint is unofficial muscle, not a legitimate bailiff or official city guard**. Do **not** invent a numerical fee, an official statute allowing it, a fixed general tax, or a legal eviction consequence.

**Extent of the explanation:** the episode can establish a concrete abuse—**a contractor can keep using a cancelled worker number in paperwork and demand money from the living worker who questions the lot**. The episode does **not** yet prove who changed the records, who authorized two incompatible seals, where every coin is going, or that the entire city's labour system follows the same fraud.

## Interaction 1 — The Wage Claim (LOCKED DIALOGUE AND INTERACTION INTENT)

**Location:** existing industrial service passage on the route home after any of the three second tasks. Flint intercepts the Millhand on the disputed lot; do not imply new citywide PvP permission or a new cutscene-only location.

*Flint holds out a folded contractor's bill.*

**FLINT:** "You worked on Anvil's plates?"

**PLAYER:** "I did."

**FLINT:** "They've stopped the lot. You owe money for it."

**PLAYER:** "They haven't paid me."

**FLINT:** "I don't pay wages."

*A short UI inspection of the bill is available before the argument continues. It refers to the cancelled worker number and identifies the player as the person being charged. The bill comes from the contractor, not a lawful city officer.*

**PLAYER:** "This number's a dead man's."

**FLINT:** "I didn't write it."

**PLAYER:** "Who did?"

**FLINT:** "Don't know. They don't tell men like us."

**PLAYER:** "And you still want my money?"

**FLINT:** "Yes."

**Editorial guardrail:** Flint can read his assignment and knows who to demand money from; he has no access to the people who altered the books. His ignorance is part of the **chain of orders**, not proof of stupidity or a claim that *all* workers are incapable of understanding events. One flat "Yes" is the entire uncomfortable beat. Don't add a punchline or a speech about class.

### Playable interaction, not just dialogue

The player may choose either:
- **[Inspect the demand]** — reveal contractor-issued charge, reference to the cancelled worker number, and absence of documented payment to the player. This is ordinary **document inspection / authority check** from the reusable interaction library.
- **[Challenge Flint's authority]** — ask who issued the demand and whether it gives him the right to collect. He identifies the contractor rather than lawful city authority; the player can still compare the displayed number with existing quest notes. This uses a reusable **dialogue / claim-validation** pattern.

Both provide the core information without a specialist skill gate. They change the immediate wording/tone of one reply, **not money, loot, combat XP or an invented legal status**.

### Branch-specific evidence that matters (LOCKED SPOKEN RESPONSES)

After seeing the notice, the player can bring up the fact obtained in Stage 4. Only the **chosen** branch appears; Flint has no unexplained foreknowledge of it.

**If Depot Intake Run (Industry / Hauling):**

**PLAYER:** "The depot took plates. My receipt says plates."

**FLINT:** "That's not what mine says."

*Difference:* the player's receipt proves that the contractor's classification is not a straightforward delivery record. Flint has no answer beyond the paper he was given.

**If Disputed Docket (Commerce / Contracts):**

**PLAYER:** "I showed the clerk both seals. He wrote down what was wrong."

**FLINT:** "He didn't tell me."

*Difference:* the player can dispute the contractor's claimed authority using the recorded, unresolved contractual conflict. Flint's demand is **not** a council decision or correction of the conflicting seals.

**If Ledger Reconciliation (Scholarship / Investigation):**

**PLAYER:** "That number's in the wage book. The man's dead."

**FLINT:** "Tell whoever keeps it."

*Difference:* the player now understands that the cancelled identity is still used for accounting. Flint need not know who scraped out the correction or why.

**Shared last instruction:** Flint demands settlement and reaches for the worker's papers/way past, not because all three investigations lead to a new hidden villain but because the player will not satisfy his demand. If the player asks to leave, proceed to *Cornered*.

## Interaction 2 — Cornered (LOCKED DIALOGUE AND STANCES)

Flint steps into the narrow way back home and produces his existing small club (weapon type as currently assumed in Millhand master; exact combat item and statistics TBD).

**PLAYER:** "I'm going home."

**FLINT:** "Not till I've got the money."

**PLAYER:** "They kept my wages."

**FLINT:** "I heard."

*Flint blocks the passage.*

**PLAYER:** "Move."

**FLINT:** "No."

**Tone:** Flint doesn't grasp, or care about, the difference between a disputed lot and the worker's debt. He repeats the demand rather than debating it. No speech about power; no clever double meaning. His short refusal is the threat.

### The actual second player interaction

Choose a physical response to the blocked passage. All three lead into **the same necessary short PvE fight**, and their exact mechanical effect requires the global turn-based combat design.

| Choice (approved intention, effects TBD) | What the player does | What is **NOT** yet defined |
| --- | --- | --- |
| **[Brace and defend]** | Stand clear of Flint's first approach and prepare to protect yourself | Guard effectiveness, initiative, damage |
| **[Keep moving]** | Try to go around him before he closes the space | Positioning/initiative outcome |
| **[Use the nearby cart as cover]** | Put an existing worksite obstacle between Flint and the player | Cover mechanics, movement points |

These are physical stances, **not peaceful exits** and not new items awarded to inventory. Do not force a specific fatality. The fight is turn-based with the existing common combat system, remains winnable with the universal starting kit and 50 starting maximum Health, and must have a recoverable defeat-to-care path.

## What exactly is resolved, and what is not (critical)

**Approved local resolution direction following the fight (mechanics TBD):**

- On player victory, **Flint withdraws** and cannot collect the bogus processing charge from the character **in this incident**. This is a meaningful small action: **one shakedown was resisted**, without permanently defeating the contractor, voiding the disputed records in every office, or automatically recovering wages.
- On defeat, **Flint leaves or the confrontation is interrupted** and the tutorial moves through a credible rescue/aid-to-care transition. **He must not confiscate the character's starting coins or render the fixed 10-coin clinic fee impossible.** A loss has Health/injury effects to be determined separately; an unwinnable money penalty is prohibited.
- In **all** outcomes the player's Stage 4 finding remains available in completed-quest notes: **(A)** plates received under a worker-transfer manifest; **(B)** dead/active classifications each carry seals; or **(C)** wage entries continued after cancellation and a correction was scraped away. The work was unpaid. The disputed number remains uncorrected.
- The council has **not** paid the Millhand. No money or ordinary XP is awarded by Stage 5 or the fight. The single +1 level was already granted at the Stage 3 choice.
- The player's *local plot* is over because they learned what was wrong with their own lot, chose how to act, encountered a contractor trying to charge them for questioning it, and resisted his collection. **No extra victim rescue, instant city reform, secret conspiracy boss, permanent criminal flag or promised continuation.**
- The *larger truth*—who altered the records, who gets all the money, whether the corpse was properly accounted for—is **deliberately unknown**. Do not misrepresent the mere existence of Flint's demand as proof of a comprehensive scheme.

### Does this fully satisfy the player's concern?

**Scope acknowledged upon approval:** This plot resolves the worker's immediate encounter with Flint, not the larger falsification of records. The player's limited knowledge is deliberate; he cannot identify a culprit from three incompatible documents and a collector who does not know who wrote them. Any future expansion into a solved fraud mystery requires separate approval.

### Integration and persistence (PROPOSED)

- Set `flint_notice_seen`, `flint_claim_resolved`, `flint_confrontation_done` in the local tutorial state; labels are illustrative, not final schema.
- Persist Stage 4 branch and fact. Flint does not possess every route's evidence. One branch-unique line and consequence is enough to make earlier choice register.
- **Two** post-second-task interactions exactly: *The Wage Claim* and *Cornered*. Fight follows, not included as a third optional job.
- Then the already-locked sequence is **10-coin ordinary medical treatment → return to identical starter home with 10 coins → provisional 150-coin rent notice**. Neither treatment dialogue nor home/rent copy is locked in this document. No extra cash sink or skill progression.
- Keep exact combat numerical balancing, duration, recovery, property effects, authority status and source of contractor fee TBD.

## Strict dialogue self-review (before approval)

**Specific lines that were wrong in the previous draft (diagnosed before rewriting):**

- **“Inspection's held. There's a charge.”** Sounds like an official clerk reporting a case. Flint is a practical collector, so he says the lot has stopped and demands money.
- **“That's the instruction.”** Mechanical and formal. **“I didn't write it.”** expresses the limited fact that Flint didn't make the paperwork, while **“They don't tell men like us.”** explains why he cannot name its author.
- **“Contracts took my objection. You haven't got a clearance.”** *Objection* and *clearance* both existed in 19th-century English, but this combined bureaucratic phrasing feels like a modern dispute department. Here the player names a concrete clerk and what the clerk wrote, while Flint responds only with what he knows.
- **“I've got a demand.”** More formal than needed; **“He didn't tell me.”** is blunt, literal and stubborn.
- **“You keep saying wages.”** Sounds like a line constructed for a clever uncomfortable laugh. **“I heard.”** is shorter, less performative and just as cold.

**What to preserve in the new version:**

- Flint is **a little slower to reason through documents, with plain words and direct physical pressure**; not an exaggerated fool, ungrammatical caricature, regional parody, or exposition machine.
- **“They don't tell men like us.”** is the only explicit statement about the information gap. He hasn't been told who altered the numbers. Nor can he promise that anyone would answer a low-paid worker's questions. **Don't add a second line about the same theme.**
- **“And you still want my money?” / “Yes.”** is the sole dry uncomfortable beat. A bad system is funny only in its implacable seriousness.
- Flint's assignment comes from the contractor, not an invented official law. His knowing the lot reference does not imply knowing who manipulated it.
- Stage 4's **“Then put down plates. I receive what's here.”** is now part of the approved Stage 4 dialogue; retain its exact wording unless the user requests a future revision.

## Approval boundary

**LOCKED:** Flint's revised plain-spoken lines, class/information context (he is told only enough to collect), the contractor's demand, the three branch-specific dialogues, the two pre-combat encounters, the three pre-fight physical stances as choices, and limited local confrontation resolution without a wider revealed culprit. **UNDECIDED:** specific combat rules and effect of stances, opponent tuning, injury/defeat mechanics, further story content, exact contractor identity/legal authority beyond existing role.
