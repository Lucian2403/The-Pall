# The Pall Combat — Part 4: Momentum Generation, Spending and Decay (APPROVED PROTOTYPE)

**Status: APPROVED MECHANICS AND PROTOTYPE CONFIGURATION (2026-10-19); NUMERICAL VALUES SUBJECT TO BALANCE TESTING.** The user endorsed Basic Strike and Basic Guard generating Momentum on meaningful results and accepted the complementary NPC Momentum rules. **Prototype only:** +10 on meaningful Basic Strike impact, +8 on a Guard that actually mitigates a threat, +5 on an actual attack avoided by Move, 0–100 encounter-local meter, zero opening Momentum, no passive decay, reset after battle. Starter spenders and cost bands are approved as prototype directions, **not final abilities, effects or balance**. Damage, equipment, Health, attack timing and injury details remain open.

**User's design objective:** fights should be demanding and often feel distinct **while remaining simple at the core**. The same income rules apply to inexperienced and veteran characters, animals/humans as applicable, and opponents. An invented separate subskill or a complex per-enemy combo meter is not required.

## 1 — Momentum measures combat advantage, not effort

**Recommended initial model:** 0–100 **points** (not percentages of a changing maximum), starts at **0** at a normal encounter's start, does **not** passively grow, and resets at the end of an encounter. No automatic turn-by-turn decay in the first version: the meter already resets between fights, and upkeep/idle bookkeeping would add complexity without enough initial gameplay value.

**The three meaningful ways to gain Momentum:**
1. A **Basic Strike that successfully affects its target** earns offensive Momentum.
2. A **Basic Guard that successfully mitigates an actual attack** earns defensive Momentum.
3. A **Move that actively avoids a precommitted attack** may earn a smaller positional reward.

Momentum is **not spent to perform** these three Standard Actions. Other resource expenses (Stamina, ammunition, wear) still exist.

**Initial playtest numbers:**

| Action | Event that actually occurred | Candidate Momentum gain | No-gain cases |
| --- | --- | ---: | --- |
| **Attack → Basic Strike** (fist, melee weapon or ordinary firearm shot) | A legal attack connects and causes real impact/pressure: injury/damage or a real defended impact | **+10** | Miss, invalid/out-of-range action, no effective contact, target already gone |
| **Guard** | The Guard actually prevented/reduced a credible incoming hit's damage or qualifying effect | **+8** | Enemy did not attack, enemy missed independently, Guard could not help, no material mitigation |
| **Move** | A legal reposition **causes a precommitted attack to fail** by breaking reach, charge line or line of fire, and the player really arrives at that position in time | **+5** | Moving with no actual attack avoided, moving too late, ineffective cover, running in circles |
| **Use** (reload, bandage, switch weapon) | Any | **0** | It is practical preparation, not automatic advantage |
| **Recover** | Any | **0** | Regains limited Stamina under its separate rules; never generates Momentum |
| **Withdraw** | Any | **0** | Its purpose is escape/ending combat, not preparing a finisher |
| **Momentum technique** | Any | **0 extra from the technique in v1** | Don't immediately refund technique cost from its own hit unless explicitly redesigned |
| **Contextual action** | Any | **0 extra in v1** | Environmental success should not refill its own cost or award per affected enemy |

**Important:** “Attack +10” is not “press Attack +10.” A strike that misses earns **0**. A guarded strike **can** qualify when it is a real hit that the opponent had to defend, even if guard reduced final Health loss to zero; a blow that merely glances off armour with no impact, pressure or effect does not. Precise impact eligibility is defined alongside damage/armor design.

Similarly, “Guard +8” is not “press Guard +8.” The defender must actually stop or reduce something. A full miss by the enemy does not count as a successful Guard. An incoming blow that genuinely hits and is mitigated can give the attacker +10 and the defender +8 in the same round: **both engaged successfully and neither receives free extra actions**.

**Single-action award cap:** one offensive/defensive/positional Momentum award **per actor per selected action**, even if a scattergun shot strikes several enemies, a guard checks two incoming blows, or a weapon hits twice as part of one chosen action. This prevents multihit weapons and group encounters from multiplying the same basic reward. Future advanced techniques may be separately designed, not silently exempt.

## 2 — Spend Momentum on choices, not automatic power

**Candidate spending brackets:**

| Cost | Intended role | Conditions |
| ---: | --- | --- |
| **20** | Accessible tactical technique / improved defense | Has a real trade-off and is useful in an early fight once a player earns Momentum |
| **35** | Strong specialized technique or rapid crisis response | Must obey weapon, skill, target and supply prerequisites |
| **50** | Expensive high-commitment technique | Large advantage but never unconditional victory, invulnerability or unavoidable disable |

**Contextual options:** an environment action may cost **0** for an ordinary one-turn interaction or something around **15** for a powerful, situation-dependent maneuver; this is **not** a universal fixed tax for touching a fence or valve. All actions use the **same one action each round**.

**Critical early-game recommendation:** every new character should have at least one **simple, always-understandable Momentum spender**, otherwise the tutorial displays a bar players cannot use because they lack any Arms subskill unlock. Propose two **candidate baseline techniques** shared by all origins, not yet canon:
- **Press Advantage — 20 points:** spend one action on an aggressive attempt with a situational advantage over a normal Basic Strike (exact hit/damage/pressure trade-off TBD). It is **not** an automatic hit, free extra strike or guaranteed status.
- **Hold Firm — 20 points:** spend one action on a more committed defense than Basic Guard, with stronger protection against a relevant threat, still subject to type, reach and Stamina. It is **not** blanket immunity or a free counterattack.

Stronger special techniques can later be tied to the already agreed **Arms → Melee / Pistols / Rifles / Scatterguns / Defense** branches, equipment or real contextual preparation. A medical emergency technique also needs actual supplies and suitable **Medicine → Trauma** ability; Momentum cannot create medical resources.

**Explicit decision open:** whether these two names/effects are suitable, or a different smaller starter menu is better. The user is not approving a complete move catalogue by accepting Momentum income.

## 3 — Order of operations, costs and the one-action rule

A consistent, server-owned order is needed so players don't buy a technique with Momentum earned from that very technique:

1. AI commits an action; enemy intent is shown. The player sees **current** Momentum, valid techniques and costs.
2. Player selects **one action**; validate available Momentum **at selection time**. If cost exceeds existing points, don't execute or spend a turn.
3. Defensive preparation establishes where relevant, and all actions resolve in actual Initiative/action-timing order. An enemy can meaningfully interrupt an actor only according to later interrupt rules.
4. If the actor **committed** to a Momentum technique, subtract its Momentum cost **when it begins resolving**, before checking the attack's hit result. A legal technique that misses still consumes Momentum. If the actor was incapacitated **before beginning the technique**, whether its Momentum is conserved follows one shared committed-action cancellation rule (TBD); don't invent enemy-specific exceptions.
5. Apply at most one eligible Momentum gain for a **selected Standard Action** when the actual result is known. A strike grants no gain from a bleed/poison tick on the following round. Award cap 100.
6. Process end-round damage/status, defeat, escape or other legitimate end conditions; write a truthful battle log: *“Guard reduced the club blow. +8 Momentum.”* Do not claim the character built Momentum if the guard had no real effect.

**Enemies follow the same logic.** They are not granted unexplained permanent 100 Momentum to bypass these rules. A trained or equipment-assisted foe could use a higher-cost action if earlier combat choices actually earned those points or a clearly defined later encounter setup specifies starting conditions.

## 4 — Why simple anti-farming conditions suffice (for now)

- **Guard farming:** repeated Guard with no threat = 0. Guarding a real attack gives +8 but can cost Stamina and surrender all offence/space each round. Low-damage enemies can still contribute real Guard points, so Stamina and enemy AI must make endless turtling costly; if playtests expose infinite safe loops, adjust stamina/opponent behavior **before** adding invisible diminishing-return counters.
- **Attack farming:** a missed/basic invalid strike gives 0; a proper strike costs the turn, ammunition/Stamina where relevant, and allows the opponent its committed action. A strong attacker can build faster, but must take real risk.
- **Move farming:** moving behind a cart without causing a committed attack to fail gives 0. The same enemy attack can be avoided only once in that round. Repeat back-and-forth movement cannot generate points unless each reposition genuinely defeats an actual, fresh threat, while imposing its own timing/risk.
- **Multiple enemies and high fire rates:** award once per selected action, not once per struck target, bullet or guardable incoming attack. Status ticks do not count.
- **Encounter boundary:** no carrying full Momentum between fights, no preparation against a harmless target, no resource gained from repeat-clicking actions after combat ends. If future games need persistent tactical readiness, design that separately; don't allow farming it with tutorial enemies.
- **Defensive builds remain viable:** Guard +8 versus Strike +10 is deliberately close, so a practiced defender doesn't feel punished for reading a dangerous enemy correctly. A missed strike earning 0 makes aggression more volatile; defensive success can still build toward a tactical move.

## 5 — Beginner / low-stakes worked examples (3)

**All Momentum arithmetic is demonstrative and assumes the described attack actually occurs and the action succeeds.** No outcome or damage is hard-coded by the example. No tutorial fight is guaranteed to last enough rounds for a special move.

### Example A — Millhand against Flint (club, cart)

| Round | Player's selected action | Actual hypothetical result | Momentum at end |
| --- | --- | --- | ---: |
| Start | — | Encounter begins | **0** |
| 1 | **Guard** | Guard materially reduces Flint's committed club blow | **8** |
| 2 | **Basic Strike** | Unarmed hit lands on Flint | **18** |
| 3 | **Move** beside cart | Action timing permits move; Flint's committed nontracking swing misses because cart obstructs him | **23** |
| 4 | **Press Advantage** (candidate technique, cost 20) | Eligible one-action technique is attempted; success is not guaranteed | **3** |

**Contrast:** if Flint's club misses naturally in Round 1, Guard grants **0**, not +8. If the Round 2 punch misses, the pool remains **8** and Press Advantage is not yet available. Guarding can build a resource **without** becoming a guaranteed winning tactic.

### Example B — Squatter versus injured boar

| Round | Choice | Actual hypothetical result | Momentum |
| --- | --- | --- | ---: |
| Start | — | Unarmed player by broken fence | **0** |
| 1 | **Move** laterally | Boar's committed charge misses because player clears its path in time | **5** |
| 2 | **Move** to leave open lane | No new enemy attack is actually avoided; no income | **5** |
| 3 | — | Boar chooses an ordinary retreat/Withdraw and leaves through the safe route | **5**, then reset on encounter end |

**Takeaway:** player can achieve the already-approved **nonlethal victory with only 5 Momentum**; no “20 Momentum required to escape” gate, mandatory attack on the boar, or contrived finisher.

### Example C — Inkbound versus Silas at the coal box

| Round | Action | Result | Momentum |
| --- | --- | --- | ---: |
| Start | — | Silas threatens the player | **0** |
| 1 | **Basic Strike** | Punch misses or is entirely avoided; no impact | **0** |
| 2 | **Guard** | Guard actually mitigates Silas's reachable work-hook blow | **8** |
| 3 | **Basic Strike** | Next strike lands | **18** |
| 4 | **Guard** | Another relevant blow is mitigated | **26** |
| 5 | **Hold Firm** (candidate technique, cost 20) | More committed defense, conditional on attack type; no automatic invulnerability | **6** |

**Takeaway:** a bad first choice costs a round. The player can still build Momentum through good defenses rather than winning a damage race. If the fight ends before Round 5, that's legitimate.

## 6 — Hypothetical late-game/high-stakes worked examples (3)

**Stress tests only.** These are not new committed NPCs, weapon statistics, raid encounters or world locations, and the numbered costs/effects are unapproved balancing candidates.

### Example D — Veteran rifleman versus two armed pursuers (Grey Marches)

| Round | Player's action | Resolved circumstance | Momentum |
| --- | --- | --- | ---: |
| Start | — | Rifle loaded; enemies at different ranges | **0** |
| 1 | **Basic Shot** (Attack) | A shot reaches its target with a meaningful effect | **10** |
| 2 | **Move** behind masonry | An already committed shot fails after a valid line-of-fire break | **15** |
| 3 | **Basic Shot** | A second legitimate hit lands; consumes actual ammunition | **25** |
| 4 | **Specialized 20-point technique** | One eligible technique, not an extra shot or guaranteed disable | **5** |
| 5 | **Use → Reload** | Reloading consumes one action, grants **0 Momentum**, and may expose player | **5** |

**Tension:** accuracy, movement, ammunition and available Momentum force trade-offs without a second action bar or per-bullet bonus farming.

### Example E — Veteran fighting two opponents near a pressure line (future hypothetical)

| Round | Player action | Resolved circumstance | Momentum |
| --- | --- | --- | ---: |
| Start | — | Two enemies, valve and dangerous steam pipe nearby | **0** |
| 1 | **Move** | Reachable side cover prevents a committed attack from connecting | **5** |
| 2 | **Basic Strike** | Valid hit lands on one enemy | **15** |
| 3 | **Guard** | Guard mitigates an actual close-range blow; the other enemy still threatens | **23** |
| 4 | **Environment → operate hazardous valve** (example cost 15) | Steam alters the area if the valve is truly operable and in reach; could endanger player too | **8** |
| 5 | **Recover** | Stamina improves under future rules; **0 Momentum** gained | **8** |

**Tension:** context can reward prior earned Momentum without becoming a free win or automatically generating extra points from every enemy affected.

### Example F — Injured endgame fighter versus close-range scattergun

| Round | Action | Actual result | Momentum |
| --- | --- | --- | ---: |
| Start | — | Arm wound lowers practical fighting ability; scattergun enemy prepares shot | **0** |
| 1 | **Move** into adjacent cover | Committed shot loses its target/line under legitimate timing | **5** |
| 2 | **Use → Bandage** | Spends actual carried item, one action, **0 Momentum** | **5** |
| 3 | **Basic Strike/Shot** | Appropriate weapon/range attack hits | **15** |
| 4 | **Basic Strike/Shot** | Another valid hit before a finish; ammunition/Stamina are real | **25** |
| 5 | **Hold Firm** (candidate 20-point technique) | One defense option; armour/status interactions still apply | **5** |

**Tension:** injury and treatment consume real turns. Ordinary attacks and meaningful movement still build tactical resources; a high skill level does not create unrestricted free techniques.

## 7 — Questions that genuinely need the user's decision

1. **Strike/Guard income:** recommend **Basic Strike +10 on meaningful hit**, **Basic Guard +8 on meaningful mitigation**; miss, idle Guard and unrelated enemy miss = **0**. Movement can give **+5 only when it directly avoids a real committed attack**. Do we agree to prototype these, while leaving numeric values adjustable?
2. **Momentum life cycle:** recommend encounter-local **0–100**, start 0, no passive decay, reset after fight. Does the temporary nature match the intended feeling?
3. **Spenders:** recommend two low-level baseline options (20-point offensive **Press Advantage** and defensive **Hold Firm**) so beginners can use the mechanic, then skill/equipment-locked advanced techniques. Exact names/effects still under review.
4. **Costs and action integrity:** cost paid on committed resolution, no free action and no technique self-refund; all gains come from resolved eligible Standard Actions. Approve principle, test precise cancellation edge cases later.
5. **Enemy parity (APPROVED PRINCIPLE):** the same earn/spend mechanics apply to NPCs and players, with individually tracked enemy meters, visible readiness, techniques governed by body type, skills and equipped items, and no hidden bonus actions. See [NPC Momentum and techniques](enemy-momentum-and-techniques-proposal.md). Specific enemy loadouts, AI and numerical balance remain pending.
6. **Avoid excessive rules:** begin without per-round passive decay, “combo ranks,” special Momentum subskills or hidden guard-diminishing counters. Add only if actual playtests establish a problem.

**Change control:** The user accepted these Momentum mechanics and NPC parity on 2026-10-19. **The +10/+8/+5 values, 20/35/50 technique bands and 0–100 display are the initial playtest configuration, not immutable final stats.** No additional attack/defense statuses, specific technique damage or NPC behaviour tree is thereby approved.

Related: [Approved combat core](approved-combat-foundation.md), [approved Initiative model](initiative-and-intent-proposal.md), [six Standard Actions](standard-action-menu-proposal.md), [Health/Focus/Stamina](../../01-player/character-system.md), [Equipment](../../04-equipment/core/equipment-system.md).
