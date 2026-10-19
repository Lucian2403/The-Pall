# The Pall Combat — NPC Momentum and Special Techniques (PROPOSED)

**Status: PROPOSED FOR USER REVIEW — 2026-10-19. NOT YET APPROVED OR NUMERICALLY BALANCED.** Companion to [Part 4: Momentum Generation & Spending](momentum-generation-and-spending-proposal.md), the [approved combat foundation](approved-combat-foundation.md) and [accepted action families](standard-action-menu-proposal.md). The user asks whether hostile NPCs should also build Momentum and use special abilities. **Recommendation: YES, with mechanical parity and deliberately different knowledge/behaviour.** This is a proposal, not a new game-wide locked rule.

## Design principle

**The same combat engine runs both sides of an encounter.** Every combatant with applicable actions has its own Momentum resource and is bound by the same:
- one selected action per actor per round;
- real Initiative and precommitted telegraphs;
- conditional Momentum gains for effective Basic Strike, Basic Guard and defensive Move;
- action cost validation and spend on resolution; no after-the-fact free technique;
- legal reach, ammunition, Stamina, equipment, terrain, injuries, interruptions and true exit conditions;
- no forced accuracy, automatic status, hidden injury or player-only exception.

**Asymmetry is in capabilities, objectives, equipment and decisions**, not in secretly falsifying a resource. A novice labourer, paid watchman, experienced guard and wild animal should NOT share the same full library of techniques.

**Momentum is a game abstraction for temporary practical advantage**, not a magical aura or a directly observed physical fluid. A character can read an adversary's increasing pressure and readiness; the UI can still show a meter for fair tactical decision-making.

## Recommended starting rules (candidate figures, NOT LOCKED)

Each enemy has an **individual 0–100 Momentum pool**, normal start **0**, reset after battle. The Part 4 prototype figures apply equally to NPCs:

| Enemy's resolved basic action | Candidate gain | Conditions |
| --- | ---: | --- |
| Basic Strike | **+10** | Valid meaningful hit or genuine defended impact; none on miss |
| Basic Guard | **+8** | Actually mitigates a credible incoming strike/effect; none against independent miss or idle foe |
| Defensive Move | **+5** | Actually invalidates/avoids a real precommitted attack through position or line of attack |
| Recover, Reload/Use, Withdraw | **0** | No reward just for stalling |
| Momentum/Contextual technique | No automatic refund | Technique spends its displayed amount even on a legal failed attempt |

One gain **maximum per chosen Standard Action**, not per shot pellet, damaged foe or individual hit from one selected action. Momentum is spent on real available techniques (candidate **20 / 35 / 50** points for increasing tactical commitment); these costs may be tuned. If the enemy is prevented from beginning a technique, a shared cancellation/refund rule (later design) must apply to both sides.

**Do NOT hand a novice enemy 50 free Momentum** for difficulty. Exceptionally prepared opponents might justify a visibly signaled different opening state *in a future, separately approved encounter rule*; do not assume such an exception now.

## Technique authoring model

Each technique is **data-driven and tagged**:
- `technique_id`, role (attack / guard / mobility / equipment / context), required weapon/body/anatomy, training tier, prerequisites, Momentum cost, Stamina and supply costs, targeting/range, Action Timing and telegraph; conditions for hit/penetration, effect, and counterplay.
- Human opponents use weapons/training and relevant existing **Arms** branches (Melee, Pistols, Rifles, Scatterguns, Defense). **Don't create a new Momentum skill.**
- Animals use physically plausible moves (charge, gore, evade, retreat, etc.) chosen from a species/behaviour profile. A **normal boar charge must remain a Standard Action** at 0 Momentum; the approved Squatter fight may begin with an actual charge before any momentum is built. A more committed, harder-to-avoid rush could be a later Momentum technique when appropriate.
- Mechanized or pressure-equipped enemies may have fitting/pressure-device operations and malfunction or equipment Leak state where anatomically and mechanically justified. These are not supernatural status spells and never bypass the existing machinery and component data.
- Powerful techniques must have observable intent, legal target and range, and a plausible way to fail, be guarded, evaded or interrupted. No repeated unpreventable crowd-control loop.

## AI decision-making: small, legible, varied

Each NPC evaluates the SAME few facts: current threat, distance, cover, its objective, current Health/condition, ammunition and Stamina, available Momentum, and which legal action would best serve its situation.

Suggested behaviour tendencies (NOT locked thresholds):
- **Ordinary worker / minor novice:** mainly Basic Strike, Guard and Move; **0–1 modest technique** if specifically trained or experienced; sometimes panic, misjudge or withdraw.
- **Professional watchman / trained patrol:** basic actions plus **1–2 distinct learned techniques**, used selectively when affordable and useful; defensive as well as offensive spending.
- **Experienced combatant / elite NPC:** **2–4 relevant techniques**, deliberate combinations, resource conservation, knowledge of cover/reload timing; still one action per round and no unseen free resource.
- **Animal:** species-specific action and motive profile; no human Guard-with-hands, firearm reload or first-aid behaviour; movement, charge, defense, fear and withdrawal remain valid. An animal need not spend Momentum every fight.
- **Group of foes:** every enemy has its own meter; **no shared Momentum battery**. They can cooperate through visible position and AI objective, not a secret bonus that creates extra attacks.

A simple AI priority sequence is enough to start: (1) survive unavoidable immediate danger where practical, (2) try its legitimate objective / reach correct range, (3) evaluate affordable techniques, (4) use a suitable basic action, (5) withdraw when motive/condition and exit allow. Give personalities **different decision weights**, not individual bespoke rules for every enemy.

**Important pacing caution:** most short onboarding fights may finish before a +20 technique becomes available to either side. That's acceptable; do **not** stretch them with HP bloat or hand opponents hidden starting Momentum just so they demonstrate a skill.

## Fair visibility for the player

**Recommendation:** display an enemy's approximate or exact **current Momentum in a compact UI meter**. For a single opponent, exact 0–100 is simpler to test, and a visible rising bar lets the player plan around a potential technique. At higher enemy counts, condensed indicators can avoid screen clutter. Whether production displays exact values or bands is a **presentation decision not yet approved**.

- A technique can be used only if the enemy had sufficient Momentum at action commitment; the same test applies to players.
- When a high-cost maneuver is committed, the existing telegraph should make the **type of danger** recognizable; hiding exact ability names is acceptable, but no surprise guaranteed status from an unrelated-looking attack.
- The combat log shows gains and spends, e.g. **“Flint's club blow connects. Flint gains 10 Momentum.”** A narrative line must follow actual battle results, never claim a resource gain for an attack that missed.
- Offensive techniques resolve according to Initiative and legal interruption; Guard's pre-action protection rule is unchanged.
- A player may choose to **Guard, Move, Attack, Recover, Use or Withdraw** in response to a charged enemy; these should stay meaningful rather than every special requiring a specially invented counter button.

## Three beginner / low-stakes encounter examples

**All figures are hypothetical demonstrations under the Part 4 candidate +10 / +8 / +5 values. No Stage 6 enemy stats, new dialogue, guaranteed injuries or exact techniques are retroactively approved.**

### A. Flint — wages dispute, club and service cart
1. Flint's **Basic Strike** genuinely lands an ordinary club blow (unless the player's actual Guard/Move prevents it) → Flint goes 0 → **10** Momentum. Player can still avoid all damage through genuine play; example assumes a connection.
2. Flint **Guards** a player's successful unarmed strike and materially reduces it → Flint goes 10 → **18**.
3. Flint lands another normal club blow → **28**. On a later turn he can **consider a proposed 20-point heavy press/Driving Blow**, clearly telegraphed and with a real weakness, or hold Momentum while trying to get around the cart.
4. The Millhand might Guard or move instead. Flint's technique isn't a mandatory tutorial cutscene, nor is its status/hit guaranteed.

**Distinctness:** blunt, lower-skill opponent builds pressure, but slow clubs and a real cart create windows for the player.

### B. Silas Pumpard — locked coal box and hook
1. Player attacks. Silas actually **Guards** successfully → **8** Momentum. His job remains guarding the coal box; he doesn't automatically become a specialist soldier.
2. Silas advances or swings his hook. If he **hits**, +10 → **18**; moving toward the player without actually avoiding a committed strike gives **0**.
3. If another meaningful hit occurs, he reaches **28**. A *possible future technique* is a **Hook and Pull** attempt costing 20, only if the target is within reach and it cannot automatically confiscate the two working notes or inflict a guaranteed Cripple status.
4. The Inkbound can keep the box between them, guard when cornered or attack at legitimate unarmed range.

**Distinctness:** reach, proximity and guarding the box rather than invented extra health or extra turns.

### C. Young injured boar — narrow path and broken fence
1. The boar can attempt **a normal charge at zero Momentum**: the user-approved encounter must not depend on earning 20 points first.
2. If the charge lands meaningfully, a candidate 10 Momentum is gained. If it misses due to the Squatter moving, boar gains 0 and the Squatter may gain +5 for a successful defensive Move.
3. If the animal is cornered long enough to earn enough Momentum, a more forceful rush could be available in a *future* profile, but injury and fear could instead cause it to retreat. **Opening a path for the animal is already a legitimate player victory.**

**Distinctness:** charge line and animal motive; human techniques do not carry over.

## Three hypothetical high-end-game encounters

**Stress tests ONLY — no new NPCs, locations beyond existing world regions, special weapons, encounters or loot are made canonical by these examples.**

### D. Veteran rifleman against an experienced rifle opponent (Grey Marches)
1. The opposing rifleman hits with an ordinary shot → +10 Momentum. Player uses cover successfully against a second committed shot on a later round → player +5; opponent gains none from the miss.
2. Opponent successfully **Guards/uses defensible cover** against one player attack only if its chosen legal Guard actually mitigates it → opponent +8. If the enemy reached 20+ through honest earlier play, it might select a **20-point trained sighted-shot technique** on a subsequent round.
3. The shot is **not guaranteed**; range, Focus, cover, rifle Firing Mechanism reliability and ammunition still apply. The technique consumes a full turn and its Momentum.
4. If the rifle is empty, **Use → Reload** earns no Momentum. It cannot use the same turn to shoot.

### E. Two experienced human opponents around a pressure line (future industrial fight)
1. Opponent A uses a legal **Basic Strike** and hits → +10 to A. Opponent B successfully Guards a separate player attack on its own action → +8 to B. **Neither transfers Momentum** to the other.
2. On later rounds, A may save toward a 35-point aggressive technique, while B holds 20 for a focused defensive technique. Both select at most one action in their individual round.
3. If a valve is operable and reachable, one combatant may spend a contextual action to change hazardous steam flow. No automatic enemy-specific bonus; exposed pressure machinery can suffer a **Leak**, the combatant's flesh cannot.

### F. Wounded veteran facing a trained scattergun guard
1. The scattergun guard has Momentum only if earned in the encounter. If the player's Guard materially reduces a legal pellet hit, the player may gain +8, and the attacker may gain +10 **if the impact qualifies**, no per-pellet multiplier.
2. After another successful shot or defensive exchange, the guard may afford a firearm technique. But if the gun must reload, **Use → Reload** consumes one full action and earns 0 Momentum.
3. The wounded player can choose Move to reach a side passage, Guard, Use a real bandage or Withdraw through a valid route. The opponent cannot both reload and execute its charged technique in one action.

## Rules that must be tested, not handwaved

1. **Early-burst fairness:** an enemy that goes second in the Initiative order cannot spend +10 earned from its own attack as part of that same committed action.
2. **No invisible hero handicap:** all six onboarding NPCs have honest Momentum acquisition; their AI should be appropriately inexperienced or scared, not mechanically incapable of using the resource.
3. **Guard/attack mutual gain:** a guarded blow may give both sides Momentum if each succeeds under actual conditions. Cap gains per chosen action.
4. **No endless turtle strategy:** equal rules still allow Guard/Guard cycles; award only when an actual attack is mitigated, and later Stamina/AI balance must make passive stalling risky.
5. **No weapon-family mismatch:** Silas cannot use a rifle technique with a hook, animals cannot perform human grapple/reload skills, and a rifleman with an empty chamber cannot fire a special shot.
6. **A resource bar is not a free second attack:** special techniques consume the same one action as basic techniques.
7. **No repetitive compulsory ability order:** decision weights and tactical circumstances should determine what the NPC does, rather than always spending exactly at 20 or 35.
8. **Separate Momentum on multiple enemies:** UI and AI must handle individual pools; one successful shotgun blast doesn't generate +10 for each hit target, and one enemy cannot fund another's technique.
9. **Respect approved nonlethal outcomes:** Flint and Silas can withdraw without forced killing, and the young injured boar can leave when the path is clear. No late-game capability should quietly require dropping an animal's Health to zero to win.

## Pending explicit decisions

- Is **same earn/spend mechanics for every combatant** (including NPCs and plausible animal actions) approved?
- Should enemy Momentum be **exactly visible** or displayed as **rough readiness tiers**?
- How many techniques are actually needed in Phase One for minor worker, guard, hunter/animal and elite archetypes? Above counts are suggestions.
- Confirm 20/35/50 technique expense bands only after actual combat tests; do not lock them from these examples.
- Whether longer, heavily trained engagements need optional justified nonzero initial Momentum (recommend **not in first version**).

**Review boundary:** This is a proposed NPC extension and numeric stress test, not an approved catalog of Flint/Silas/boar moves, enemy stats or new lore. The basic player Momentum prototype itself remains numerically PROPOSED.

Related: [Momentum Part 4](momentum-generation-and-spending-proposal.md), [combat foundation](approved-combat-foundation.md), [Initiative and intent](initiative-and-intent-proposal.md), [skills](../../01-player/skills-progression.md), [equipment](../../04-equipment/core/equipment-system.md), [onboarding fights](../onboarding/README.md).
