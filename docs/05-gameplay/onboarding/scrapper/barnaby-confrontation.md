# Scrapper — Stage 5: The Copper Claim / The Red Lever (PROPOSED)

**Status: PROPOSED FOR USER APPROVAL (2026-10-16); NOT LOCKED.** The two scene names, Rust Yard setting, **Barnaby Rusk** as a piece-rate scrap worker, his desire to cut copper for payment, and the coming fight are **already locked in the [Scrapper overview](README.md)**. This document proposes the exact dialogue, actions and transition to the short fight. [Stage 3](last-dry-floor-discovery.md) and the three [Stage 4 jobs](second-task-branches.md) are now **APPROVED AND LOCKED**.

## Scene S05-A — The Copper Claim

*The Scrapper returns to Rust Yard. A man is standing beside the old pump with a short iron work tool and a paper naming the copper pipe to be cut. He is Barnaby Rusk, another yard worker. Ignatius Smog and a couple of workers are close enough to see the pump.*

The pipe still carries water. **It has not been cut.** Smog's earlier promise to leave it alone has not cancelled the order sent to Barnaby. His work is paid **by the weight of the copper he brings back**; he has been promised extra for this pipe. The money is a real pressure on him, not a joke. He is not a secret agent, official guard or murderer looking for a fight.

**BARNABY:** “Get clear. I've come for that copper.”

**PLAYER:** “You can't cut it. There's people living below.”

**BARNABY:** “What's that got to do with me?”

**PLAYER:** “The pump keeps the water out of their rooms.”

**BARNABY:** “I get paid for what's on that paper.”

The player now has **[Tell Barnaby what you found]**. Give exactly **one** route-dependent exchange. Do not let one branch automatically know the others' facts.

### If Stage 4 was The Brace Shift — Industry / Construction

**PLAYER:** “The wall's leaking. We put boards against it, but they won't hold forever.”

**BARNABY:** “Then the wall needs fixing. That's not my job.”

*The player can show the drain workers' note if the job recorded one.* The boards buy time but cannot replace the running pump or repair the whole wall.

### If Stage 4 was The Low Passage — Fieldcraft / Navigation

**PLAYER:** “I found a way out and marked it. Some of them haven't left yet.”

**BARNABY:** “Then tell them to hurry.”

*The player can point toward the marked side passage.* The residents are not magically evacuated; several are still below.

### If Stage 4 was The Spare Line — Commerce / Logistics

**PLAYER:** “There's another hose coming. It's not connected yet.”

**BARNABY:** “I'm here for the copper that's already here.”

*The player can show the yard's delivery slip.* The hose is on its way or waiting nearby; the old pump's pipe is still required until proper installation and checking.

### Smog's response — same after any route

*Smog walks up from the other side of the pump. He has heard enough.*

**SMOG:** “Leave the pipe, Barnaby. I'm stopping this job.”

**BARNABY:** “Who's paying me, then?”

**SMOG:** “You'll have to take that up with whoever sent you.”

**BARNABY:** “Easy for you to say.”

This is a **foreman's order at this yard**, not a city-wide cancellation of the salvage contract. The other nearby workers heed it and keep their cutting equipment idle. Barnaby is still determined to earn his money; his personal work order has not been withdrawn by whoever promised to pay him. His refusal to stand down creates the next encounter. Ignatius has not suddenly acquired the money or the power to house the families.

**[Go to the pump controls]** — follow Barnaby when he moves towards the controls. The player does not touch the machinery.

## Scene S05-B — The Red Lever

*Beside the pump is a large handle painted red. A worn sign beside it reads **STOP PUMP**. Pulling the handle would shut the pump off, allowing the copper pipe to be cut. Barnaby walks towards it, still holding his work tool.*

The lever is **a visible, ordinary stop handle**; the player only needs to understand that the pump must keep running for the rooms below to stay dry. The player's earlier Stage 2 job did not touch this handle.

*The scrap workers stand back. They are watching Barnaby, not helping him. Smog remains nearby, having already told Barnaby to leave the pipe alone.*

**BARNABY:** “Move. I'm finishing my work.”

**PLAYER:** “Smog told you to leave it.”

**BARNABY:** “And who's feeding me when I go home empty-handed?”

### Choose one response before the fight

| Player action | What changes about the scene |
| --- | --- |
| **[Stand in his way]** | The player takes a position in the narrow walkway between Barnaby and the red handle. Close quarters; little room to retreat |
| **[Move beside the scrap bin]** | The player positions themself beside a large iron bin. Barnaby must come round it to reach the walkway; exact cover/movement effect awaits the general combat system |
| **[Warn him once more]** | The player stays in the open, within a few steps of Barnaby, and tries to stop him with words |

For **[Warn him once more]**, play this short conditional line:

**PLAYER:** “Leave it, Barnaby. People will lose their homes.”

**BARNABY:** “Get out of my way.”

For the other two choices, use only the physical movement and **BARNABY:** “I said move.” Do not add a second invented speech before fighting.

*Barnaby steps away from the lever toward the player and shoves forward with his arm raised. His attempt to force the path starts the turn-based fight.*

The handle has **not** been pulled. Barnaby is **still a few steps from it**. The pump is running when Stage 6 begins. This arrangement gives the player a real reason to fight without a scripted single-frame action flooding the cellars. The scene happens openly in a working yard; Smog and other workers remain physically nearby for a plausible defeat-safe interruption later.

## Mechanics and story conditions

- **Exactly two distinct follow-up interactions:** dispute the copper work order, then protect the pump controls. Normal dialogue and position choices, not a custom mini-game.
- The Stage 4 route changes **what the player can prove**, and what can temporarily protect the people below; it does not give the player all three discoveries.
- **Smog's authority:** he can stop his workers and his yard's machinery work, but Barnaby believes the individual copper order will pay him. He is defying the stop because he wants his piece-rate earnings, not acting on an off-screen assassination order.
- **No early catastrophe:** no player choice or timer in Stage 5 pulls the handle, cuts the pipe, floods the cellars or makes a bystander vanish. Barnaby cannot pull the lever during the pre-fight dialogue while the player is unable to respond.
- Stage 5 ends as Barnaby attacks, with the selected position carried into the **real introductory turn-based PvE encounter** in Stage 6. Its numeric effects are TBD.
- No weapon pickup, new item, legal penalty, bonus skill, coins, XP or loot. The player already received +1 in the selected second Major Skill at Stage 3 commitment, once.

**ALREADY LOCKED:** scene titles, Barnaby's identity and paid copper motive, three possible Stage 4 findings, one fight after two interactions, pump kept running through the local ending.

**PROPOSED:** precise argument and branch responses, Smog's on-site stop order, ordinary red stop handle and three positioning responses.

**TBD:** exact yard geometry, work tool used in the fight, health/defence numbers, whether a route's paperwork is shown through an inventory-free job screen or journal.

Related: [Scrapper story](README.md), [Stage 4 approved](second-task-branches.md), [Stage 6 fight proposal](barnaby-fight.md), [dialogue style](../../interactions/dialogue-style-guide.md).
