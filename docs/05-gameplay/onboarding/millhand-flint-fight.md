# Millhand — Stage 6: Flint's Turn-Based Fight

**STATUS: NEW ENCOUNTER DRAFT, NOT APPROVED (2026-10-15).** This is a **story-level combat encounter specification only**. It is **not** the full combat ruleset. The opponent, encounter justification and spoken lead-in are already [LOCKED in Stage 5](millhand-flint-confrontation.md); do not revise that approved conversation. **Turn-based PvE** format, a manageable beginner fight and a nonblocking loss are locked from [shared onboarding](shared-structure.md). Actual damage, initiative, accuracy, stamina, enemy HP, skill gates, action terminology, health depletion and injury calculations remain TBD.

## Locked entry

- Millhand has finished exactly one second-task branch: **Industry / Depot Intake Run**, **Commerce / Disputed Docket**, or **Scholarship / Ledger Reconciliation**. That task's worker-number information has already shaped Flint's approved reaction.
- **The Wage Claim → Cornered** are complete. Flint blocks the way home with a short club and refuses to let the player pass. His ending **“No.”** is the existing final line. **Do not add a new speech before the fight.**
- Player began with 20 coins; no tutorial wages or ordinary XP. The universal starting inventory provides **Basic Clothes** and **Crude Small Bag**, not a weapon. The relevant background bonus is Craftsmanship +3 and one chosen other Major Skill +1; no extra Arms or combat level has been granted.
- Flint is one **human wage enforcer**, not a police officer, bounty boss, supernatural creature or mastermind. The fight is a **scripted PvE incident in the city** and does not change city PvP permissions.

## Core encounter purpose

The player experiences a short real turn-based fight, learns to read a visible hostile intention, makes a defensive decision and has an opportunity to counter. It should be survivable with the agreed universal kit. The player may lose without resetting the tutorial. **Flint must not die or need to be executed**; the local ending is getting past a shakedown rather than killing a man to clear a quest.

The encounter must have **actual consequences** from actions and positions. Do not script a guaranteed automatic win after three UI clicks or make a Stance button cosmetic. Do not hand out a club, a firearm, temporary inventory weapon, money, gear or Arms XP.

## Proposed battle presentation

**Non-spoken scene line:** *Flint grips his club and comes forward.* (visual scene cue; final animation/copy TBD)

**On-screen opponent:** `Flint — Wage Enforcer`; identifiable as one ordinary human threat. No unapproved personal title or level.

**Starting placement:** derived from the **already-approved Stage 5 pre-fight choice**:

| Prior choice (LOCKED option name) | Visible tactical intention | Mechanical translation (UNDECIDED) |
| --- | --- | --- |
| **Brace and defend** | Player sets their stance before Flint reaches them | Opening guard state or reduced first-hit exposure, only if supported by general combat rules |
| **Keep moving** | Player tries to create space around Flint | Opening initiative / relative position, only if supported |
| **Use nearby cart as cover** | Existing cart separates the combatants for part of the opening | Cover/line-of-approach state, only if supported; not a new item or arena puzzle |

The options should not offer three identical results; **if global combat design cannot honour one, revisit the Stage 5 stance implementation instead of promising a fake bonus**. No numeric modifiers are invented here.

## Proposed reusable fight teaching beats

### Beat C01 — An attack is coming

Flint shows a **readable wind-up** with the club before his meaningful blow. The player sees the pending threat *inside the turn-based interface*; no reaction timer, flashing skill test or twitch minigame.

The system should make it clear which actions can protect the player or change positioning. **Guard**, **move/reposition** and **attack/strike** are illustrative action families inherited from the existing Millhand design, not confirmed final combat labels or formulas.

A rational player who guards or changes position should usually fare better against the warned heavy hit than a player who attacks blindly. Exact outcomes must later be tested under the global system, not hard-coded into this episode.

### Beat C02 — A real opening

After an unsuccessful heavy blow, a guarded strike, or Flint overreaching into an obstructed space, the player may gain a chance to hit, crowd him back or move past him. The action must be described in actual combat terms when the global system is defined.

**No guaranteed miss or staged stumble** just because the tutorial needs a window. Telegraphs and turn choices must create that opportunity within the established combat system. Include a safe/recoverable loop where a wrong choice hurts but does not make the first fight unwinnable.

### Beat C03 — Stop the collector

Fight ends once Flint can no longer enforce the demand: driven off, forced to back away or knocked down long enough to escape. **Do not require a killing blow**. Avoid granting a new post-fight dialogue menu unless a real decision requires it; the Stage 5 spoken exchange has already done the story work.

- **Player victory:** Flint backs away or falls and the Millhand passes; **no collection occurs in this incident**. His contractor's bill remains legally unresolved, and the council records remain wrong. The result is a narrow, credible personal victory.
- **Player defeat (story proposal requiring approval):** The fight is audible beyond the service passage. Other workers approach; Flint refuses to make a spectacle, breaks off and leaves the money uncollected. An unnamed passerby helps the injured Millhand get to ordinary medical care. **No new named rescuer, faction, police rescue or quest chain.** A defeat is clearly recorded, **not narrated as a win**, and must not force a restart or take away the 20 coins needed for treatment.
- **Player disconnect/timeout:** preserve the combat state according to future global rules; don't let a browser reload duplicate rewards, run Flint's dialogue again to farm any effect, or bypass the medical transition. The exact timeout/disconnect rule remains deferred.

## Injury and clinic handoff — proposed implementation constraint

Both victory and defeat must feed the existing **10-coin medical visit**. The player's condition should plausibly need care; however, **do not impose silent unavoidable damage that invalidates a perfect defensive performance**. This is a real design tension still to settle in the future health/injury system. Possible future implementation: a mild treated condition from the physical struggle even if combat HP is high, or ordinary sustained damage during the encounter. **Neither solution is locked**.

Victory should leave the player capable of reaching care. Defeat should trigger assistance or a transport/transition that makes care reachable despite serious wounds. Treatment must remain payable with the locked 20 starter coins; after the required 10-coin fee the character has 10.

The fight itself awards **0 coins, 0 ordinary XP, 0 Arms XP, 0 items, 0 additional levels**. No loot from Flint's clothes, club or contractor document. The second Major Skill +1 was granted upon Stage 3 choice, not here.

## State / testing intentions (illustrative, not final identifiers)

- Entry: `millhand_second_task_done=true` and both Stage 5 interactions recorded, Stage 5 tactical stance stored.
- Combat is a normal **one-human PvE instance** created once; no replay for levels, drops or special cash.
- Completion: `millhand_flint_resolved=won|lost` and exactly one post-fight clinic transition.
- All three Stage 4 routes reach the same fight, but earlier evidence is preserved in quest recap; Flint does not magically learn other routes' discoveries.
- The shared tutorial continues **fight → medical point/10 coins → same starter home/10 coins → provisional 150-coin rent notice**, then ends. Flint's loss is NOT itself the end of onboarding.

## Stage 6 approval scope

Approve encounter-level narrative, the three teaching beats and the **anonymous-worker-interrupted defeat** approach if credible. Keep the global turn-based rules, all numerical stats, injuries and the exact story/medical transition details **deferred**.

### Writing / tone check

There is deliberately **no fresh one-liner from Flint** after Stage 5's approved “No.” The physical change in the scene is enough. The defeat rescue does not have to involve a speech either. Do not add theatrical action narration, period slang or moralising about the worker's lot.

Related: [Stage 5 approved confrontation](millhand-flint-confrontation.md), [Millhand master story](millhand.md), [Shared Tutorial Structure](shared-structure.md), [Game-wide Dialogue Standard](../interactions/dialogue-style-guide.md).
