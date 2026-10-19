# The Pall Combat — Part 5: Enemy AI Decisions, Pressure and Encounter Identity (APPROVED PRINCIPLES)

**Status: APPROVED AT THE AI DESIGN-PRINCIPLE LEVEL (2026-10-19); NOT IMPLEMENTED OR NUMERICALLY LOCKED.** Builds on the [accepted combat foundation](approved-combat-foundation.md), [approved Initiative principles](initiative-and-intent-proposal.md), [six Standard Action families](standard-action-menu-proposal.md), [Momentum playtest rules](momentum-generation-and-spending-proposal.md) and [approved enemy Momentum parity](enemy-momentum-and-techniques-proposal.md). The user wants **hard, varied fights with a simple shared combat core** and requires **2–3 low-stakes and 2–3 high-end-game worked examples** for each new design system. This proposal has three of each. The late-game cases are hypothetical stress tests, not approved lore, content or weapon data.

## 1. Design judgment: difficult is not the same as clairvoyant

A good NPC **pursues an intelligible goal, reads the current battlefield, commits to a legal action, and sometimes makes a costly but explainable choice**. It should neither choose a random button every round nor secretly know the player's input. The player should improve by recognizing that enemy's motive and attack pattern, rather than memorizing a fixed attack list.

**Recommendation:** implement one small **objective-based decision evaluator** for all enemies. The AI varies by objective, tactics, equipment, actual Momentum, conditions and combat experience. Do **not** hand-script one alternating sequence for every new encounter, add separate hidden “boss energy” gauges, or compensate for poor AI with impossible accuracy and inflated Health.

## 2. AI must act on the same legal game state as the player

Every enemy:
1. Sees its **own** Health, injuries, Stamina, Momentum, weapon/ammunition, range and terrain.
2. Perceives only player information that is legitimately observable: currently exposed position, equipment that can be seen, actual previous strikes and defensible signs of injury/weakness. An enemy should not see the precise contents of a concealed bag, an unrevealed skill number, or the **action button being pressed this round**.
3. Chooses from its **actual legal one-action list** (Basic Attack, Guard, Move, Use, Recover, Withdraw, an affordable Momentum technique or a present Contextual interaction). No free reload, automatic extra attack, invented item, out-of-range hit, or fraudulent resource credit.
4. Commits the selected action, aim/target, and legitimate targeting/track mode **before** the player selects their action; the visible telegraph is derived from the committed action.
5. Executes according to the same Action Timing/Guard/target/interrupt rules as the player. If conditions invalidate a committed action, use the normal failure/retarget rule **already declared by that action**. Never choose a brand-new counteraction after reading the player's choice.
6. Records the same per-action Momentum gain (+10 Basic hit, +8 effective Guard, +5 defensive Move in the **provisional** playtest model); deducts technique costs; and assesses true victory, retreat, surrender or defeat.

**Information fairness detail:** a precommitted “advance and strike the target's old location” cannot magically redirect around a new obstacle. A specifically authored tracking strike may follow movement **only if tracking was part of the committed technique and appropriately telegraphed**. Its accuracy/counterplay remain testable.

## 3. One goal, one style, one legal action: the smallest practical model

Each NPC uses **one primary encounter objective**, plus an existing **combat experience profile** and **risk tendency**. These are AI data tags, **not extra visible player stats**:

| Data | Typical values, proposed | Effect on the same six commands |
| --- | --- | --- |
| **Objective** | Block passage; defend object; pursue target; survive/escape; drive away intruder; protect another actor | Determines what a desirable *outcome* is, not just maximum damage |
| **Combat experience** | Untrained; practiced; trained; veteran | Affects how well it weighs threats, legal techniques, cover and resources. Does not grant free Momentum or extra turns |
| **Risk tendency** | Cautious; assertive; desperate | Adjusts preference for Attack, Guard, Move, Recover or Withdraw under otherwise comparable circumstances |
| **Range preference** | Contact / Near / Far (candidate tags) | Influences positioning and legal reach rather than creating a new arbitrary accuracy stat |
| **Technique loadout** | Applicable 0–4 tagged abilities according to capability | Defines which Momentum costs can actually be spent; no unarmed boar using firearm skills |
| **Retreat policy** | Protect duty; flee when route opens; withdraw if overwhelmed; hold while physically capable | Resolves why one opponent leaves and another remains, within the real encounter outcomes |

**Do not introduce a new Morale meter** just to support this. The existing character model already has **Composure and Stress**, plus Health/injuries. When those systems are quantified later, the AI can use their real effects and motive/risk thresholds. For now, a decision can depend on an objective plus observable condition without pretending a finished morale formula exists.

### One reusable AI turn (proposal)

1. **Snapshot** last committed/fully resolved combat state and legitimate perception.
2. **List** actions currently legal under distance, ammo, stamina, Momentum and equipment.
3. **Evaluate** each with a small common scoring model:
   - **Objective progress** — does this protect the box, clear a safe path, threaten the player, keep distance, etc.?
   - **Immediate survival risk** — will this leave the actor exposed to a known, credible threat?
   - **Opportunity** — can this action actually reach the target or useful ground now?
   - **Resource consequence** — is spending ammo, Stamina or earned Momentum sensible?
   - **Continuity/commitment** — did an earlier choice create a good opening, is an obvious escape route now open, or is the action a useless repeat?
4. **Choose** one of the best **legal** options, with modest seeded variation among *comparable* choices according to experience/risk. **Randomness must not make a rational defender repeatedly ignore a clear lethal threat.** An inexperienced worker may overcommit or fail to exploit cover; an elite will use credible opportunities more consistently, not read hidden data.
5. **Commit and telegraph** the action **before** the player's click. Resolution is engine-controlled and the output log reports what really happened.

The AI engine must never select an impossible action and simply treat it as a hit. If no offensive action is legal, it can Move toward its objective, Guard a threat, Recover, Use/reload, or Withdraw when the encounter permits.

This is **one common evaluator and a small data record for each enemy**, not an elaborate authored behaviour tree for every NPC. No fixed score values, random weights, thresholds or timing modifiers are locked in this proposal.

## 4. How Momentum should affect NPC judgment

**The NPC has Momentum; the player has Momentum. Neither automatically spends it at the first available threshold.** Example priority:

- At **0–19**, NPC uses Basic Actions and earns Momentum only from real results. A boar can still perform its **ordinary zero-Momentum charge**.
- At **20+**, NPC may consider a valid 20-point technique **if it helps its objective more than Guard/Move/Use/Attack**. Saving points or retreating remains legal.
- At **35+ / 50+**, larger techniques become candidates only if actually known, target/range appropriate and affordable under the shared rules. A veteran may save for one; an untrained worker does not gain knowledge of it merely by having a full bar.
- Being at full Momentum is **not** a forced enrage mode, mandatory special attack or automatic enemy advantage. The enemy still gets only **one action**.
- Guard, Attack and tactical Move remain meaningful choices at high Momentum.
- A technique must be selected and paid from existing Momentum, not funded by the hit that technique is about to attempt.

**Telegraph contract:** when a foe commits a special technique, its intent should distinguish the danger sufficiently to permit rational action. The exact name may be hidden, but a high-force lunge should not be rendered as harmless idling. The proposed enemy Momentum UI already makes accumulating readiness visible; number versus bands is a later UI choice.

## 5. How encounters become distinct without new combat systems

Require each authored encounter to meaningfully differ from a nearby comparable fight in **at least two** practical dimensions: objective, normal behavior pattern, weapon/reach, terrain or cover, starting positioning, scarcity of ammo/Stamina/other resources, third-party involvement, or legitimate ending condition.

**Caution:** not every trivial street scuffle can be genuinely unique. The goal is *variety of decisions*, not an expensive catalogue of bespoke mechanics. Repeatable common enemies can share a profile; their surroundings and starting circumstances supply natural variation.

**No guaranteed win:** the AI cannot be required to perform a wasteful attack on Round 2 so the player can use a predetermined counter. Likewise, do not extend a tutorial fight solely to demonstrate a 20-point special. Enemies can win through actual combat, and poor player choices must have believable consequences; however, beginner onboarding must remain survivable with the **unarmed universal kit** and without forced hits or made-up wounds.

## 6. Withdrawal, surrender and encounter outcomes

- **Withdraw** is one action, not a guaranteed escape. An actual route, distance/pursuit relationship, motive and action timing govern whether separation succeeds.
- **Different outcomes:** ordinary player escape from a defended objective may be marked **escaped/failed objective**, whereas enemy flight after a genuine local victory can be **victory**. [The Squatter's boar fight](../onboarding/squatter/boar-fight.md) defines the boar's safe withdrawal as an actual **player victory**, because separation is the objective.
- Human NPCs can withdraw or stop an assault when actual combat circumstances justify it. The approved Flint and Silas fights require **nonlethal victory and genuine defeat**, not universal killing.
- A cornered animal whose path remains blocked may fight harder, but should not have a scripted “rage buff” or permanent forced aggression. When a safe line opens, withdrawal should become attractive or eligible under the regular evaluator.
- For tutorial defeat, preapproved bystander intervention is an **aftermath scene** after a genuine combat loss. It does not secretly make the player win or change NPC Momentum retroactively.

Exact disengagement/retreat checks remain for the later nonlethal and Health design.

## 7. Three low-stakes worked examples — established onboarding fights

The outcomes below are **possible results**, not fixed scripted turns. The +10/+8/+5 values are provisional. Opponents retain their approved identities and narrative continuity; no new spoken lines, loot, weapons or combat injuries are established.

### A — Flint, service passage and cart

| Round | AI choice based on committed snapshot | Player's available decision | Consequence illustrated |
| --- | --- | --- | --- |
| 1 | Flint sees a reachable novice and commits a **slow club attack**. Clear telegraph. | Guard, Attack if in reach, or move toward cart | Guard may reduce the blow, but the club is not guaranteed to hit |
| 2 | If the player guarded and Flint remains able to strike, he may **advance/angle around the cart** rather than repeat the same heavy swing | Player may move to maintain separation or strike within unarmed reach | Cover changes approach; Flint receives **no +5** merely for closing distance |
| 3 | If Flint has earned 20+ through real hits/defenses, an affordable, suitable club technique becomes a candidate; otherwise Basic Attack/Guard/Move remain legal | Defend the new threat or exploit overcommitment | Flint doesn't know a veteran rifle technique; spending 20 isn't automatic |

**Why this fight feels different:** direct intimidation and slower club commitment, while a service cart affects positioning. The AI can be crude without being rigged to miss.

### B — Young injured boar, fence and narrow exit

| Round | AI's actual observable situation | AI decision | Possible player response |
| --- | --- | --- | --- |
| 1 | The player still obstructs the route; boar is frightened and hurt | **Normal zero-Momentum charge** is eligible and visibly committed | Sidestep into real cover, or Guard at risk |
| 2 | The player has moved aside, but the fence may still partly block the firm exit | **Move** toward a safe gap or pause, not automatically a second charge | Move farther clear, avoid the crumbling edge |
| 3 | A safe escape line now exists | **Withdraw** becomes attractive; animal leaves if legal | Player achieves **approved nonlethal victory**, with no boar knockout or mandatory player attack |

If the player remains in its path, the boar can charge again and cause a genuine defeat. The animal is not a human strategist and does not accumulate an imaginary rifle skill or decide to loot a bag.

### C — Silas Pumpard, folded notes and locked coal box

| Round | AI objective and situation | Plausible choice | Tactical implication |
| --- | --- | --- | --- |
| 1 | Silas is near the player, and the box may separate them | Move around the box or threaten with a reachable hook, depending on line | The box is a real obstruction, not magic full protection |
| 2 | Silas is still responsible for the seal | Remain nearby/Guard if the player backs away, rather than automatically chase across the entire street | **Defending the coal** is more important to him than maximum damage |
| 3 | If Silas has enough genuinely earned Momentum and the target is within hook reach | Consider a trained *candidate* hook technique, or basic attack if more sensible | No guaranteed confiscation of notes, locked-box opening or scripted limb disable |

Silas's motivation creates different decisions from Flint even with the same underlying Attack/Guard/Move code. True victory makes him retreat from the confrontation; defeat leaves him guarding the seal.

## 8. Three high-end-game stress tests — hypothetical, NOT new canon

### D — Two trained rifle pursuers, uneven range (Grey Marches)

**Situation:** player is behind some broken masonry; one enemy at Far has a loaded rifle, another is nearer and must reload. Each enemy has an individual Momentum pool.

- **Round 1:** far rifleman commits a shot into a visible firing lane, while the nearer pursuer independently selects **Use → Reload**. The player picks **Move** into masonry or Attack one reachable enemy. A successful move can spoil only attacks whose committed targeting and timing permit it.
- **Round 2:** riflemen evaluate their actual positions, ammunition and attack lanes. If player moved, the far enemy may Move to recover sight rather than fire through a wall. The near enemy may close distance or fire now that the weapon is loaded.
- **Round 3:** one trained pursuer with 20+ earned Momentum may consider an aimed technique; the other cannot borrow those points. Guarding one shot does **not** automatically block both opponents' different firing lines.

**Challenge:** different threats from different distances, ammunition timing and cover, not artificially doubled HP or cheated group Momentum. Exact enemy count/balance requires testing before real first-slice release.

### E — Industrial machinery and a hazardous pressure line (hypothetical)

**Situation:** one cautious guard protects a valve; a more aggressive opponent approaches. Steam is dangerous for both. This is an illustrative industrial encounter only.

- **Round 1:** the defensive guard chooses Guard or Move to keep the valve protected; the aggressive foe chooses Attack if legal. They commit independently before the player acts. A player Move can reach cover but does not automatically shut the valve.
- **Round 2:** if the player threatens the machinery, the guard may select an eligible **Contextual interaction** rather than spend accumulated Momentum on a damaging attack. An opponent cannot operate a distant valve or create a Leak on a human's body.
- **Round 3:** player may **Use** a real supply, **Recover** at risk or spend earned Momentum on a legal technique. Enemies similarly select from what they can actually afford and reach. Steam affects friend and foe by the same exposure rules.

**Challenge:** protecting machinery, safety risk, pressure-system state and two distinct motives, using the same basic action menu.

### F — Wounded veteran against an experienced scattergun specialist (hypothetical)

**Situation:** player has a genuine arm injury, low Stamina and restricted Health ceiling; enemy has a scattergun with finite ammunition. A side passage is reachable.

- **Round 1:** the scattergun wielder, seeing the player exposed, commits a shot. Player chooses Guard or Move. If cover blocks a legal line, the shot does not magically follow the target; if the player is too slow, the shot may connect.
- **Round 2:** after the shot, an unloaded weapon must use **Use → Reload** according to its actual weapon configuration. A competent NPC may instead Move to cover before reloading. It cannot reload **and** shoot for free.
- **Round 3:** if the player moves to the side passage while enemy reloads, **Withdraw** may become a real option, but only if the route and pursuer make separation possible. If the enemy has earned 20+ Momentum, an appropriate firearm technique competes with basic fire and repositioning rather than being automatically selected.

**Challenge:** wound penalties, line of sight, reload timing, escape versus finishing the encounter. Expertise means better decisions, not hidden unavoidable hits.

## 9. Implementation shape (data, not bespoke scripts)

Candidate reusable NPC profile:
- `objective_id`, `retreat_policy_id`, `behavior_style_id`, `combat_experience_band`, `preferred_range`, `technique_ids[]`, `risk_tendency`, `legal_weapon_classes[]`.
- Context is the current persisted encounter/actor state: equipment, status, position/cover, available exits, threat indicators, previous **resolved** visible actions, each combatant's own Momentum.
- Commit `selected_action_id`, `target_id`, `aim_zone_or_position`, `tracking_mode`, `commit_round`, and the small seed/tie-breaker used when near-equal options exist.
- Send `telegraph_id` derived only from that commitment plus legitimate observer visibility.
- Reuse combat resolution/validation, action timing, Momentum income, damage, retreat and objective-completion logic identically between player and NPC actions.
- **Logging and QA:** track legal alternatives, score reasons, selected action and visible telegraph in development diagnostics only. Production players see understandable combat events, **not hidden target skill numbers or debugging explanations**.

This should allow designers to add an opponent mostly through a **data record and an approved encounter goal**, avoiding one manually written AI script for each fight.

## 10. Acceptance tests before locking a full AI specification

1. Enemy **does not adapt to current-turn input**; identical committed state/seed yields the same chosen action and telegraph, and retry/reconnect cannot reroll a more favorable commitment.
2. Untrained NPC may overcommit but **never gets illegal attacks**, free Momentum, stolen techniques, or fake enemy-on-hit events.
3. Flint/squatter boar/Silas are **observably distinct** using the same action pool and real terrain. Their approved combat outcome conditions remain reachable.
4. An enemy with 0 Momentum cannot perform a 20-point technique. A 20+ enemy may legally **decline** to spend it, and may Recover/Reload instead.
5. Any successful Guard or tactical Move earns Momentum only from **real mitigated/avoided attacks**, not passive farming. Cap income one per selected action.
6. An experienced human understands ammunition and cover without knowing the player's hidden inventory or selected current-turn action.
7. A boar's regular charge is available at 0 Momentum; an open route makes normal withdrawal eligible. The tutorial can be won without punching it.
8. Two enemies have independent Momentum/one action each and readable individual threats. Group actions must be balanced against a one-action player without free extra enemy turns.
9. Enemy Withdraw, player escape, player victory, player defeat and contested-objective failure are **distinct persisted resolutions**. No invented loot, scripted win, guaranteed injury or mandatory encounter length.
10. Stress cases with zero Stamina, low Composure, empty ammo, cover destroyed, blocked retreat, eliminated opponent and status interruptions produce **legal action/failure outcomes**, not AI crashes.
11. UI never announces a definite attack zone and resolves an unrelated undeclared zone under an ordinary action. Legitimate tracking or special deception requires explicit authored ability and honest visible cues.
12. Measure actual beginner survivability, average rounds, experienced-player win rate, time spent guarding/recovering, Momentum earned/spent, unused techniques and escape frequency **before approving final numeric AI weights**.

## Recommendation for next decisions

**APPROVED PRINCIPLES (2026-10-19):** one common **objective + style + legality + utility** NPC evaluator; one precommitted action; no mid-turn reading of player input; independent Momentum pools; no hidden bonus attacks; meaningful retreat/surrender policies; graduated competence and deliberate, bounded variation. The specific weights and NPC loadouts remain open.

**Keep open:** scoring weights, stochastic choice among best options, exactly what players see of enemy intent/readiness, Combat Experience tuning, multi-enemy encounter limits and the exact end-of-fight surrender/retreat thresholds. Do not add a second special AI resource bar or bespoke mechanics merely to make bosses “unique.”

**Part 6 now defines the agreed damage, protection and actual injury-trigger architecture**, using three beginner and three high-end examples. It must respect existing one Health pool, limb-specific injury/Health ceiling and the locked examination-only outcome for uninjured wins. Later work should separate actual weapon profiles, stamina/fatigue and skill modifiers from AI policy.

**References:** [combat core](approved-combat-foundation.md), [Initiative rules](initiative-and-intent-proposal.md), [Momentum](momentum-generation-and-spending-proposal.md), [NPC Momentum parity](enemy-momentum-and-techniques-proposal.md), [Health](../../01-player/character-system.md), [Squatter boar](../onboarding/squatter/boar-fight.md), [Flint](../onboarding/millhand/flint-fight.md), [Silas](../onboarding/inkbound/silas-pumpard-fight.md).
