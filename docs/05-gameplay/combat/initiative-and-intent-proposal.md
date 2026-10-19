# The Pall Combat — Part 2: Initiative, Intent and Encounter Variety (APPROVED PRINCIPLES)

**Status: APPROVED PRINCIPLES (2026-10-19).** The user accepted the recommended Initiative, committed telegraphs, Guard preparation and basic Move/Reposition as one zero-Momentum Standard Action, and a lightweight relative-position design. **The former discussion text below is retained as the design rationale and still flags untested options and numerical TBDs; acceptance does not approve every speculative setting or an additional Evasive Step button.** Goals: every turn offers a rational decision, the enemy can't cheat after seeing player input, and the same small action set creates different fights.

## 1 — One initiative order, not three competing speed systems

**Recommendation:** use one **Action Timing** value to decide which *committed non-defensive action* resolves earlier. Build it from the actor's current practical quickness plus the timing of the chosen action and relevant conditions, rather than rolling a new random initiative die every round.

Conceptually:

`Action Timing = actor readiness + selected action's speed + contextual speed effects`

- Actor readiness may reflect relevant trained **Arms** capability, current injuries/conditions, and modest contribution from the existing **DEX** attribute. Equipment weight, fatigue and posture may matter. **STR/DEX/INT/RES should not provide oversized raw power bonuses**, respecting the character system.
- Action speed is attached to the **action**, not solely the equipped weapon: a heavy committed strike is generally slower than a quick jab, but its greater commitment may be rewarded by damage or a different outcome. Guard is handled as its own pre-action protective setup.
- Contextual speed includes starting footing, encumbrance or a prior stagger only when visibly justified. No hidden arbitrary enemy advantage.
- A simple stable tie rule should be used (e.g. a committed defender's protective state is established first; if two attacks tie, a stored stable tie-break rather than a new stealth roll). **Exact values and tie rule are TBD**, and should be tested rather than committed now.

**Why:** One Initiative statistic at encounter start would let a fast enemy always act first regardless of whether it is throwing a huge overhead blow while the player performs a short, quick strike. Multiple separate speed meters, however, are unnecessary. One derived action-order value gives both strategy and reasonable implementation complexity.

## 2 — Telegraph intent, not a guaranteed perfect description of the future

**Core rule:** before the player submits their one action, the AI commits to an action and targeting mode. It must not change that decision as a reaction to the player pressing Guard or Move. But player attacks, obstacles, movement, interrupts and other legitimate resolution effects may cause the action to fail or lose its target.

**Recommend three *presentation* clarity levels, not three new combat resources**:

| Clarity | Player sees | Natural example | Design requirement |
| --- | --- | --- | --- |
| **Clear** | Attack type and its likely target/body zone | Flint raises his club for a strong swing toward the upper body | Slower, committed attacks provide the strongest tactical warnings |
| **Partial** | Attack family/direction, but the exact target not certain | Silas brings his hook forward, aiming to close the distance | Allow more than one sensible defense; don't make an unseen target a coin-flip puzzle |
| **Limited** | Observable preparation/behaviour, but no precise attack | An alert opponent shifts weight and watches the player | Do not pretend the enemy is idle; no fake “guaranteed clear telegraph” |

**Caution:** never make the UI positively state “head attack” and secretly resolve an ordinary untelegraphed leg strike. Hidden information should mean a narrower degree of *certainty*, not dishonest UI. Clarity is determined by enemy action/animation and legitimate visibility conditions; it is not a random information tax with no available counterplay.

**Suggested enemy-intent fields:** action family, expected threat/range, optional likely body zone, targeting behaviour, commitment strength, visible cues, and whether the action can be interrupted by certain actual conditions. These are action data, not one-off scripts.

## 3 — Defending and moving must have different jobs

In each round the player may choose one action. **Recommend the following behavioral separation**:

- **Guard / Brace (Standard, defensive):** protects against a readable or likely incoming attack and establishes that protection at the start of resolution even if the actor is slow. Cannot also attack or reload. The reduction/status interaction is situational and not automatically total.
- **Reposition (Standard, normal movement):** changes distance/side/obstacle relationship; action speed matters and an enemy might strike before the movement is complete. It is not guaranteed evasion or free protection. Must be accessible at zero Momentum.
- **Evasive Step (candidate Standard, defensive movement):** sacrifice the turn's attack to attempt a timely sidestep away from an attack line, when a reachable safe destination exists. A quick defensive timing effect can establish before a clearly committed blow **without claiming immunity from all ranged weapons, tracking attacks or other enemies**. Whether this is a separate button or contextual variant of Move is **UNDECIDED**; don't add a redundant button if plain Reposition covers the same meaningful choice.
- **Attack (Standard, offensive):** its order follows the action-timing calculation; striking early does not cancel enemy intent unless the actual conditions for a meaningful interrupt are met.
- **Withdraw / Leave an opening (Standard, outcome-seeking):** begins or completes separation when geometry, enemy motivation and ordinary combat rules permit it. The boar must be able to choose withdrawal through its normal action logic when given an open route; the player need not knock out the animal.

**Important fairness rule:** no enemy can suddenly retarget its *already committed* head swing at the player's new location unless the original attack has an explicitly signaled, mechanically eligible **tracking** mode. Conversely, any move should not be a free universal counter to all attacks.

## 4 — Keep encounter geometry lightweight

**Recommendation for first playable version:** **relative distance and simple object states, not a tactical grid by default**. Example distance tags: **Contact** (close enough to grapple), **Near** (within reach of a step/short approach), **Far** (requires closing distance, ranged weapons may still work), plus **line of approach / cover / dangerous ground** tags. These are candidate abstractions, not approved distances or metres.

The scene's **one or two meaningful pieces of terrain** should be readable and change attack eligibility or timing:

- A **cart** can obstruct Flint's immediate approach; he can walk around it, and the player might gain one turn to move. It is not indestructible or automatically available as a high-damage attack.
- A **fence and bank** change the boar's possible charge line and its path to leave. Safe separation counts as genuine combat resolution.
- The **coal box** can stand between Silas and the Inkbound, forcing an approach around it; the player has no permission to open it or obtain coal, and standing behind it is not magical immunity.

Use such objects only when actually present. A fight in an open field should still be tactically playable through enemy patterns, distance and resource pressure, not demand a compulsory interactable environmental gimmick.

## 5 — Enemy differences from a small shared set of behaviours

**Enemy actions and motives, not inflated health pools, should shape distinct fights.** Use shared action families but different practical selection tendencies and goals:

| Fight | Key pressure | A useful player response | How it ends |
| --- | --- | --- | --- |
| **Flint, club-wielding wage enforcer** | Heavy, clearly signaled club blow; he is trying to intimidate and block passage | Guard a committed attack, or move using the cart to create a counteropening | Flint stops the assault and withdraws; or player loses and workers intervene |
| **Young injured boar** | Charge line and cramped ground; knocking it unconscious is not the goal | Side-step into a safe lane; leave an open route; guard only if movement is impossible | Animal moves away alive; or player is knocked down and helped afterward |
| **Silas, Fuel Watchman** | Hook's reach, pressure to approach the sealed box and seize the two visible notes | Maintain distance, use the box to obstruct approach, or defend and counter | Silas backs off after player victory, or remains guarding after defeating player |

This is a **design matrix**, not permission to write new, unapproved opponent dialogue or secretly change existing win/lose events.

**Variety guideline (PROPOSED):** an encounter should differ in at least **two** of these: enemy intent patterns, position/terrain, equipment/reach, resources, or legitimate victory condition. Do **not** use arbitrary HP/accuracy scaling to claim it is unique.

## 6 — Avoid four combat degeneracies

1. **Attack spam:** if early strikes always interrupt slower enemies, the fastest attack is always best. Fix by requiring actual interruption conditions and balancing action timing versus damage.
2. **Guard spam:** if passive free guard creates Momentum and blocks every status, it is always safe. Fix by giving only meaningful defended impacts limited Momentum, retaining Stamina/opportunity costs and attack-specific guard effectiveness.
3. **Move spam:** if leaving any attack lane always negates the enemy action at zero risk, movement dominates. Fix by distinguishing defensive movement, normal reposition, tracking/range effects and real reachable safe spaces.
4. **Opaque guessing:** if enemy attacks are unpredictable with no clues, the player cannot make an informed choice. Fix by honestly disclosed degrees of intent, and give the player defensible fallback moves against uncertain threats.

Do not solve these by artificially forcing the second enemy hit to land or by making all enemy attacks bypass defense. The shared clinic policy guarantees no injury is necessary.

## Proposed round decision

**Round starts:** AI action committed → show observed intent, position, resources and real terrain. **Player chooses one action**. Defensive postures establish, then actions resolve by a single practical timing order and range/target eligibility. Recompute actual Health, injuries, Momentum, Stamina, equipment state and the real win/lose/withdraw outcome. Only then format and display the factual log.

**Explicitly open:** formula and ties for timing, contact/near/far exact meanings, tracking versus fixed attacks, enemy telegraph clarity at low Focus, move legality, group enemies, cancel versus weakens rules, Momentum values and how a human enemy yields nonlethally. **Do not add a separate Evasive Step command by default**; start with the existing Move action and revisit only if meaningful playtesting requires it.

## Proposal checkpoint for user feedback

**APPROVED AT PRINCIPLE LEVEL (2026-10-19):** **action-timing-based Initiative**, honest precommitted telegraphs with varying detail, protected Guard before enemy contact, one basic zero-Momentum Reposition action, and small relative-distance/obstacle states. **Do not yet lock values, skill modifiers, an Evasive Step button or additional submechanics.** [Part 3 — the complete Standard Action menu](standard-action-menu-proposal.md) is the next PROPOSAL. Exact round formulas, actual distances, tie rules and UI are still pending.

Related: [approved core principles](approved-combat-foundation.md), [earlier critique](core-turns-actions-initiative-momentum-proposal.md), [Flint](../onboarding/millhand/flint-fight.md), [boar](../onboarding/squatter/boar-fight.md), [Silas](../onboarding/inkbound/silas-pumpard-fight.md).

## User's forward-looking example requirement (2026-10-19)

For each future system proposal, show **two or three concrete low-stakes combat examples and two or three high-end-game combat examples**, illustrating meaningful turn choices and plausible outcomes. Endgame examples are conditional design tests, **not newly locked enemies, weapons or locations**. Preserve the small shared action menu and existing world canon.
