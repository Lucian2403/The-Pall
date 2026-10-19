# The Pall Combat — Part 3: The Standard Action Menu (APPROVED FAMILIES)

**Status: SIX STANDARD ACTION FAMILIES ACCEPTED IN PRINCIPLE (2026-10-19); MOMENTUM NUMBERS AND TRIGGERS NOT YET LOCKED.** The user accepted the proposed six-command menu but explicitly wants to review how **Basic Strike and Basic Guard generate Momentum** before approving those details. Both can and should earn Momentum when relevant under the [Part 4 Momentum discussion proposal](momentum-generation-and-spending-proposal.md); this document never bans their income. Numerical action costs, attack/guard rewards, recovery, damage, movement and balancing remain OPEN. The user requests **2–3 beginner and 2–3 high-end-game examples** in future system drafts; this file includes three of each.

## 1. Design verdict

**Six Standard Action commands:** **Attack, Guard, Move, Use, Recover, Withdraw.** Every actor, including an enemy, chooses **at most ONE** action per round. These are **commands**, not new subskills or special classes.

The menu should be usable by an unarmed newcomer at zero Arms specialization and still matter to an experienced rifleman. Difficulty must come from positioning, threat, action timing, fatigue, current gear, enemy behavior and legitimate encounter goals. It must **not** rely on 15 permanent buttons or one surprise mechanic per enemy.

**Critical constraint:** Standard Actions require **0 Momentum**, but may cost Stamina, ammunition, supplies, equipment wear, exposure or a full turn. **0 Momentum does not mean free or safe.**

## 2. Proposed action definitions

| Command | What the player chooses | Purpose | What it DOES NOT automatically do |
| --- | --- | --- | --- |
| **Attack** | One legal target and one aim zone (Head / Torso / Limbs), plus current basic attack mode where appropriate | Basic unarmed strike, melee blow or shot with equipped weapon; resolve timing, range, hit/defense and actual damage | No automatic hit, interruption, status, second shot, or extra action |
| **Guard** | Brace against current threat(s) using existing hands/gear/stance | Establish protection before the threatened blow resolves, if the attack is one guarding can actually mitigate | No universal damage immunity, status immunity, guaranteed counterattack or protection against every enemy simultaneously |
| **Move** | Choose reachable position/approach: advance, withdraw distance, sidestep, go around obstacle, move into/behind existing cover | Alter distance, line of attack and possible escape routes, using the SAME normal action | No free attack, free attack-dodging, teleportation or guaranteed evasion |
| **Use** | One eligible held/prepared item or equipment operation (reload, change weapon, basic bandage/consumable) | Let equipment and preparation matter, at the normal action cost | No free medical supplies, unlimited ammo, instantaneous multi-step repair or free reload after a shot |
| **Recover** | Regain some physical readiness instead of attacking, or steady oneself under the existing Composure rules if later justified | Avoid a stamina/condition softlock; player sacrifices offense, movement and the opportunity to guard | No automatic healing, stamina refill to maximum, Momentum farming, cancellation of bleeding or guaranteed protection |
| **Withdraw** | Attempt to leave the encounter through an actual accessible route | Seek a real escape/nonlethal outcome; risk and success depend on distance, pursuit capability and scene objectives | Not a guaranteed one-button victory, teleport to safety, or forced boar disappearance |

**Recommendation:** present **Attack / Guard / Move / Use** prominently, with **Recover / Withdraw** immediately reachable in the same menu, not hidden behind an extra turn or a complex submenu. Add optional dynamic **Technique (Momentum)** and **Environment (Contextual)** controls ONLY if valid choices currently exist. They are **alternative single actions**, never free second actions.

**Aim zones:** Head / Torso / Limbs are selected **inside Attack**, not separate turn-consuming Aim commands. This proposal does NOT decide precise headshot multipliers, armour, injury thresholds or whether advanced wound models subdivide limbs.

**Attack types:** ordinary unarmed strike/melee/fire use the same **Attack** command and differ through equipped item, range, ammunition and canonical **Arms → Melee, Pistols, Rifles, Scatterguns**. Advanced named attacks belong in a future Technique catalogue. The player does not need to first equip a fictional tutorial weapon.

## 3. Guard, Move and Withdraw must NOT collapse into one overpowered defense

### Guard

- Acts as a **defensive preparation**, able to take effect before an incoming attack regardless of the defender's slower Attack timing. It consumes the one action.
- A relevant blow can still injure the character, depending on attack, guard effectiveness, protection and real Health calculations.
- Guarding a charging boar with bare hands **should generally be less reliable than stepping clear of its approach**, even if Guard can reduce injury severity.
- **Basic Guard MAY EARN MOMENTUM (important clarification):** guarding an actually threatening attack successfully earns an eventual defensive Momentum reward; unthreatened Guard spam does not. The proposed [Part 4 model](momentum-generation-and-spending-proposal.md) illustrates **+8 on a genuinely mitigated blow**, but exact numbers and trigger criteria await the user's approval and testing.

### Move

- This is **ordinary movement**, not a distinct dodge skill or button. Its timing is determined by the action-order rules already approved.
- If a slower player tries to move before a faster committed attack, the player can still be hit at the original position. If they move first and the enemy's precommitted, nontracking attack has no valid target anymore, that attack can miss/fail for a clear mechanical reason.
- **Cover isn't an all-or-nothing magic shield.** A wall can break line of fire, a cart may obstruct only part of a route, and an enemy can change position on a later turn. A move into cover must account for whether that cover is actually reachable within the action's movement allowance.
- If player chooses **Move toward exit** from Near to Far, that is **not yet a completed escape**. Withdrawal is a separate resolution attempt unless a genuine scene-specific automatic separation condition has already been met.

### Withdraw

- Treat as **an objective / encounter-exit attempt**. If reachable and not actively blocked, it can finish the fight. If the opponent can pursue or block it under the precommitted rules, the attempt may fail or expose the player. Define exact checks later.
- The **boar's nonlethal withdrawal** must be handled as a normal enemy decision/outcome: the animal may choose Withdraw when it has an open route and its instincts favor retreat; the player can also get clear without reducing its Health to zero.
- **Not every withdrawal counts as a player victory.** If a player abandons a contested objective to flee, the outcome may be **escaped**, not victory. In the locked Squatter introduction, letting the endangered animal get clear is explicitly an **approved victory objective**. Avoid globally awarding win/loot/XP just for clicking Withdraw.
- Existing equipment policy allows **durability loss on difficult retreats**. A blocked or desperate escape must not have no cost; exact wear, pursuit and escape formula remain TBD.

## 4. Use versus Momentum and Contextual actions

- **Use** is the baseline, general item/equipment operation. **Reload** consumes the turn by default, though later weapon-specific handling and skills can define appropriate exceptions/alternative speeds. Firing Mechanism baseline activation reliability is already specified in the item's component design; don't multiply independent spring/misfire rolls.
- **Basic first aid:** requires an actual suitable bandage or equivalent resource and the appropriate care requirements. Use consumes one action, and injury/bleeding results depend on Medicine/Trauma and later Health rules. A Momentum-based **Emergency Patch** could be a faster/higher-risk version, but cannot conjure supplies or take a second action in the same round.
- **Contextual action:** using an actually reachable valve, barred gate, exposed power conductor, movable barricade, etc. consumes the player's one action. **Walking behind a fence is merely Move and costs zero Momentum**. Exploiting a pressure hazard to hurt or delay enemies may have meaningful eligibility and Momentum requirements. No environmental interaction is guaranteed to bypass defences or deal extreme damage.
- **Recover:** keep one neutral action, not separate six resource-refill buttons. Early implementation should primarily restore a limited amount of **Stamina**. If Composure or Focus recovery needs a distinct effect, the later Stress system must make it intelligible and non-exploitable; **Focus remains derived rather than spendable**. Recover does not earn Momentum by waiting.
- **Combat consumes time:** the normal world does not have to freeze for everyone outside an isolated encounter, but exact integration with continuous world-time remains a separate systems design question.

## 5. UI proposal — no action bar clutter

One consistently visible compact row for **Attack | Guard | Move | Use | Recover | Withdraw**. Under Attack: choose Head, Torso, Limbs; only legal targets/attack modes. Under Move: choose legal reachable destinations and any available cover. Under Use: list equipped weapon reload and currently carried usable consumables only.

Below or beside standard actions, offer **Technique** if a valid Momentum maneuver is unlocked and affordable, and **Environment** when a real contextual interaction is in reach. Show costs and why invalid actions are unavailable. *No action is silently spent on invalid input.* Actual skill gates belong to the existing agreed tree.

**Caution:** six buttons are a proposed *logical menu*, not a mandate to make six equally large UI buttons on mobile. A responsive compact layout, disabled/hide states and one-click target selection should be prototyped.

## 6. Beginner / low-stakes examples (3 concrete tests)

These use **existing approved onboarding opponents**; examples show plausible choices but are **not new guaranteed outcomes or unapproved changes to their canonical dialogue**.

### Low-stakes A — Flint and a cart

- **Round 1:** Flint visibly commits to a slow club swing. Player at Near with a cart to one side. **Guard** reduces the prospective injury but gives up offense. **Move** around the cart might disrupt his approach if the player acts soon enough. **Attack** is possible only if actual distance/reach permits it; a basic punch **does not automatically cancel** Flint's club attack.
- **Round 2:** Flint must step around the cart to close again. Player may **Attack** if Flint is now in reach, **Move** to maintain separation or **Recover** if Stamina was consumed. Recover is risky if Flint is already in striking distance.
- **Outcome:** Flint can genuinely back off if he is stopped under later nonlethal rules; the player may also be defeated and witness-supported. No free club, enforced hit or mandatory wound.

**Design lesson:** Guard, Move and Attack are situational alternatives. The same cart need not offer a dedicated special button.

### Low-stakes B — Young injured boar beside a broken fence

- **Round 1:** The boar clearly prepares a forward charge. Player is unarmed, has **zero need for Momentum**, and can **Move** laterally behind the damaged fence or toward firm footing. **Guard** is available but dangerous against a heavy charge, not automatic immunity.
- **Round 2:** If the line toward open ground is now clear, the boar can itself **Withdraw** instead of continuing to attack; the player may **Move** farther aside. Choosing **Attack** against the animal is possible but is not required to satisfy the encounter's actual objective.
- **Outcome:** boar gets clear = **approved nonlethal victory** for this particular introductory encounter. If the player is knocked down first, defeat is honestly recorded and a traveler assists afterward.

**Design lesson:** an encounter must be winnable through real movement/withdrawal, not by exhausting the opponent's Health.

### Low-stakes C — Silas Pumpard at the sealed coal box

- **Round 1:** Silas advances with the work hook to seize the two carried notes. At Near, the Inkbound can **Move** so the box obstructs his direct approach; at Contact, **Guard** may be safer if his action resolves first. **Attack** risks staying within reach.
- **Round 2:** If Silas's hook requires him to come around the box, the player can **Attack** when in actual unarmed range, or **Move** away again. A move only succeeds before his already committed strike if its Action Timing and position make that plausible.
- **Outcome:** win drives Silas away; loss leaves him at his locked box and witnesses help. Neither outcome opens the padlock or awards coal.

**Design lesson:** position, range and selected action matter with no bonus item or tutorial-only technique.

## 7. Late-game / high-stakes examples (3 hypothetical stress tests)

These are **illustrative encounter tests ONLY**. Named locations beyond the current slice, advanced enemy combinations and any weapon/pressure-tech concepts below are **not approved new lore, item stats or promised launch content**. They test whether the **same six commands** remain meaningful under stronger opposition.

### High-stakes A — Experienced rifleman versus two armed pursuers (Grey Marches)

- **Setup:** equipped veteran with a rifle carrying limited ammunition; one opponent threatens a shot from Far, another tries to close from Near. There is broken masonry for cover. Rifle operation and reload follow existing weapon data when designed.
- **Round 1:** **Move** behind reachable masonry may prevent a clear long-range shot but costs the player a chance to fire. **Attack** the nearer enemy may interrupt them *only* if a qualifying result occurs; otherwise the far shooter can still fire. **Guard** against one threat doesn't automatically shield against the other.
- **Round 2:** With spent ammunition or an empty chamber, **Use → Reload** competes directly with **Move** to a different angle. Reloading in the open might be disastrous, but the engine doesn't add a hidden free shot for the player.
- **Round 3:** **Withdraw** might become viable after breaking line of approach, at possible equipment-wear cost; pursuing an objective by staying is risky.
- **Challenge:** threats from two angles, limited ammunition, mutually exclusive movement/attack/reload decisions—not inflated enemy HP.

### High-stakes B — Expert against guarded combatants in a hot pressure-workshop (future content)

- **Setup:** capable melee or firearm character faces a guard using cover and another advancing from Near. A pressure line and valve are present; steam exposure is hazardous to *both* sides if used carelessly. This is a **hypothetical industrial setting**, not a new promised NPC/factory encounter.
- **Round 1:** **Move** behind real machinery avoids a clear line of sight if completed in time. A valid **Environment** action might open a valve to obstruct a passage or expose a foe, but the valve must be reachable and steam can harm the player too.
- **Round 2:** Player could use **Attack** against the exposed enemy, **Guard** against their pending swing, or a future earned **Technique** using Momentum if its prerequisites are actually met. The pressure system might develop a **Leak status as an equipment/environmental state**—never as an unexplained human-limb ailment.
- **Round 3:** If Stamina is low, **Recover** trades a dangerous turn of vulnerability for continued fighting; using **Use → Basic first aid** requires a real carried medical supply and does not automatically undo steam injury.
- **Challenge:** hazard positioning and timing, not an instant-win lever or new bespoke action bar.

### High-stakes C — Veteran defender with an impaired limb facing a close-range scattergun (future content)

- **Setup:** player has a genuine arm injury from an earlier fight, reduced effective Health Ceiling and low Stamina. A close-range armed enemy threatens a shot; there is a side passage. A second shot may require reloading depending on the firearm's actual capacity. No additional “cripple resource bar” is created.
- **Round 1:** **Guard** may mitigate some physical injury but **cannot simply negate every pellet or status**. **Move** toward a reachable side passage may reduce exposure, contingent on Action Timing and the enemy's precommitted tracking behavior. **Attack** in the open may be too risky.
- **Round 2:** Player must choose between **Use → Bandage** (if carrying supplies, with appropriate Medical conditions), **Recover** (to address low Stamina), or **Withdraw** through an actual route. All consume the same one-action budget.
- **Round 3:** If the opponent is reloading, there may be a brief chance to **Attack** or move, but no automatic victory from their visible reload intent.
- **Challenge:** injuries, range, supplies, action timing and retreat. Even with strong gear, the player can lose for poor decisions.

## 8. Three action-economy abuses we should test before approval

1. **Infinite Guard/Recover loop:** if Guard cheaply prevents all damage and Recover safely restores all Stamina, two alternating commands trivialize bosses. Both must carry real risk/opportunity costs; actual balance TBD.
2. **Guaranteed escape:** if any Move changes distance and Withdraw always succeeds afterward, all exploration fights become harmless. Distance, route, pursuit, enemy commitment and withdrawal penalties matter.
3. **Free item chaining:** if reload, item use, weapon switching or emergency patches are “utility” outside the main action, the one-action core collapses. Everything useful must consume that action unless a later narrowly balanced advanced technique explicitly changes behavior.

## 9. Decision checkpoint — all proposed, not yet canon

**APPROVED AT ACTION-FAMILY LEVEL (2026-10-19):** **Attack, Guard, Move, Use, Recover, Withdraw** as the six basic commands, with Momentum and Contextual actions as alternative single actions. The user's requested Momentum income review is not a rejection of Strike/Guard Momentum: the actual earn/spend figures are under **separate review in [Part 4](momentum-generation-and-spending-proposal.md)**. No Evasive Step button is approved, nor are combat numeric effects locked.

**Still open for further work:** exact Attack timing/ranges, position move distance, when Guard works against projectiles, Stamina consumption/recovery, effect of Composure/Focus, ammo reload lengths and capacities, ordinary bandage legality, retreat probability/cost, group attacks, advanced techniques and numerical Momentum gain/loss.

**Next in review:** [Part 4 — Momentum generation, decay and technique categories](momentum-generation-and-spending-proposal.md), with 3 beginner and 3 hypothetical endgame worked examples. Then damage and Health before tuning the six onboarding encounters.

**References:** [approved core](approved-combat-foundation.md), [approved Initiative principles](initiative-and-intent-proposal.md), [Arms tree](../../01-player/skills-progression.md), [Equipment](../../04-equipment/core/equipment-system.md), [character Health / Stamina](../../01-player/character-system.md), [six onboarding encounter index](../onboarding/README.md).
