> **Historical archive.** Superseded planning or prototype record; see [active documentation](../../../../README.md) for current rules.

# Combat — Part 1: Turns, Actions, Initiative and Momentum (DISCUSSION DRAFT)

**Status: PROPOSED / OPEN FOR DEBATE — 2026-10-19. NOT APPROVED, NOT LOCKED.** This is a critical design review of the user's proposed system, **not** a mandate to accept everything suggested by either party. Numeric Momentum costs and defensive mitigation below are candidates for playtesting only. Nothing in this file changes existing character attributes, the agreed Arms tree, equipment facts, or approved onboarding outcomes.

## Existing constraints we must respect

- [Character System](../../../../01-player/character-system.md): STR, DEX, INT, RES; all begin at 5; Health max 50 on a new character; Health Ceiling may be lowered by genuine injury. **Stamina** (spent physical reserve), **Fatigue** (physical overexertion), **Composure** (spent mental reserve), **Stress** (mental overload), **Focus** (derived precision value). Attribute scores are mainly training/ability enablers, not large direct combat bonuses.
- [Skills and Progression](../../../../01-player/skills-progression.md): **Arms** Major Skill with exactly **Melee, Pistols, Rifles, Scatterguns, Defense** agreed subskills. Do not introduce separate Dodge, Momentum, Pressure Blast or Medical Combat subskills without a wider approved reason. **Medicine → Trauma** governs suitable first aid, **Mechanics → Weapon Maintenance** governs weapon service, and the existing combat family should not absorb unrelated professions.
- [Equipment](../../../../04-equipment/core/equipment-system.md): weapons and protection experience real durability wear, maintenance and repair; Crude, Standard, Well-made, Fine, Masterwork are workmanship grades, not rarity-based instant damage boosts. Weapon fittings and compatible mechanisms remain separate from combat-action definitions.
- [Common clinic rule](../../../../05-gameplay/onboarding/shared-clinic-examination-policy.md): ordinary combat cannot force the first/second enemy strike to hit or manufacture a wound. Uninjured victory is legitimate; shared clinic examination costs 10 coins regardless.
- All six approved Stage 6 fights must support true nonlethal outcomes; [young injured boar](../../../../05-gameplay/onboarding/squatter/boar-fight.md) must be able to withdraw without requiring the player to punch it unconscious. Tactical positions and obstacles established before the fight must have actual consequences.
- Early implementation is PvE in city/outskirts/Grey Marches; build the core so multiple enemies, firearms and later content can be modeled without replacing every rule, not as a requirement to implement full PvP now.

## User's proposed skeleton — RETAIN

- Turn-based combat; **one selected action per actor on each round**.
- Actions organized as **Standard (Momentum cost 0)**, **Momentum (roughly 20–50 points)** and **Contextual (zone/environment dependent; ~15 points proposed)**.
- Enemy intent and relevant environment displayed before player's commitment; no reflex/timer QTE.
- The engine validates requirements, resolves opposing actions and their consequences in an ordered, reproducible transaction, then prints one clear combat log.

## Main design conflicts — RECOMMENDED CHANGES, NOT LOCKED

### 1. Initiative cannot coexist with “player always strikes first”

Telegraphing an intent *before* action resolution is compatible with Initiative; guaranteeing the player *attacks* first is not. Proposal:
- **Defensive stance effects** (Guard, Brace; maybe Evasion after design) resolve in a **pre-action reaction window** even if the defender is slower. They consume the actor's one selected action; they're not free extra reactions.
- **Offensive and utility actions** then resolve in order of **Initiative plus action-specific priority**, not automatically player-before-enemy. On equal priority use a stable, documented tie-break.
- A strike cancels a later enemy attack **only if a real interrupt/incapacitation condition is successfully applied**, not simply because the attacker went first or dealt damage.
- Enemy intentions are generated/committed before player action. Telegraph quality is an AI/animation/readability decision; not every enemy move should automatically expose a perfectly accurate target zone. Clearly committed heavy attacks can expose more precise targeting; faster/fainting attacks may give less certainty without lying about the game state.
- For a group, show distinct relevant intent for each threatening enemy and resolve each actor once. A one-action player cannot be expected to block everything without line-of-attack/position consequences.

### 2. Standard Guard is currently too generous

A **0-cost 50% reduction**, automatically preventing **all** afflictions, makes passive guarding dominate many attacks, especially when every enemy strike and body target are perfectly announced. Proposal:
- Use **~50% mitigation only as a first balance candidate** against the properly guarded/threatened attack.
- Give each status an actual trigger and interaction with guarding. An impact knockback might be stopped by a successful Brace; bleeding from an edged weapon is prevented only if the attack fails to penetrate or if the injury condition wasn't met. A guard should not universally erase burns, poison, smoke exposure or environmental hazards.
- Guard's one-action opportunity cost is real: while guarding the player cannot also strike, reload or patch themselves that round.
- If guarded damage is small but persistent, neither automatic zero-damage nor automatic status immunity is assumed.
- Guard should not provide unlimited safe Momentum accumulation against a nonattacking enemy.

### 3. Momentum is a resource, not combat XP

Recommend a meter of **0–100 Momentum points**. Write **+10 points**, **cost 20 points**, rather than ambiguous “+10%” or a percentage of a changing maximum. No rule is locked until playtest.
- **Basic strike** (0 Momentum cost) builds modest Momentum when genuinely attempted or landed; exact award on miss/hit TBD. Don't double-count action and hit rewards.
- **Successful, meaningful defense** may also build smaller Momentum, to support a defensive character using **Arms → Defense**. Avoid giving Momentum simply for spamming Guard when unthreatened.
- **Meaningful reposition/counterplay** may gain momentum depending on tactical success, but no idle/Wait farming.
- **Momentum actions** spend a defined fixed amount; expensive actions should be strong but should not win automatically.
- Define whether Momentum carries between encounters, decays while disengaged, changes after a defeat and is capped at 100. **Recommendation:** encounter-local, starts from an agreed baseline; never provide a repeatable infinite pre-fight farming exploit. Carryover rules need explicit later decision.
- Momentum awards for the current round should be applied **after** the current action's cost/eligibility check (cannot pay for a move using points only gained by executing the same move).

### 4. All meaningful actions must fit the “one action” rule

The current offensive/guard examples omit essential combat actions. Proposal for action *families*, not final command inventory:

| Action example | Candidate type | Why it exists |
| --- | --- | --- |
| Basic unarmed/weapon Strike, Fire | Standard | Consumes one action; weapon ammunition/stamina also apply as appropriate |
| Guard/Brace | Standard | Consume one action to mitigate threatened damage/status based on situation |
| Move / Reposition | Standard | Needed for range, cover, boar avoidance and positioning; not a free extra step |
| Reload or change weapon | Standard, possibly variable by equipment | Firearms must have a real cost; later weapon stats may alter action count, not add free attacks |
| Use ordinary consumable / basic first aid | Standard or clearly gated by specific gear and skill | Medicine and inventory resources matter; Momentum alone cannot create a bandage |
| Special technique / focused defense | Momentum | Pay 20–50 **points**, with other requirements as appropriate |
| Use cover, turn a valve, overturn loose obstacle | Contextual | One selected action; cost/value determined by actual object, range, preparation and risk |
| Withdraw / escape attempt | Standard or negotiated multi-round outcome | Required for genuine boar withdrawal and nonlethal resolutions |

The phrase **one action per turn** should mean *one selected combat action per actor per round*; an attack can have attack-and-status effects as a single action, and external environment/status ticks can resolve automatically. It should not prohibit passive consequences of an earlier action, nor grant free attacks with a movement choice.

### 5. Guaranteed status on a hit should not be universal

“Blinded, Crippled or Leak guaranteed when it hits” can trivially stunlock an enemy, make bosses unusable and let environmental attacks bypass all defense. Proposal:
- An attack **must connect** and satisfy its defined delivery conditions (armor/guard/target type/trigger) before a status is applied.
- Well-designed techniques may apply a **guaranteed *appropriate* affliction after a qualifying, unblocked hit**, but this is specific to the technique, target and severity, never a universal rule for Momentum attacks.
- Keep application and resistance transparent. Consecutive crowd-control should face diminishing effectiveness or another simple explicit anti-lock rule; details TBD.
- **Leak is not a generic human condition**. Steam/fluid leaks apply to pressure equipment/constructs/appropriate worn gear, not biological limbs merely because a technique spent Momentum.
- Head/Torso/Limbs are **aiming zones** at present, not three separate mandatory Health bars. Preserve **one character Health pool** with localized wound/status consequences and potential Health Ceiling reduction. Head could be higher-risk/higher-reward; torso reliable; limb targeting permits impairing a specific arm/leg if that level of detail is supported. Avoid pretending “Limbs” is enough to distinguish a damaged shooting hand from injured leg without later explicit subdivision.

### 6. Contextual interactions must not be an automatic win button

- “Environment object present” does not imply a useful one is present on **every** combat round. A valve, loose cart, wall, fence or coal box can be out of range, spent, protected or unsafe.
- ~15 Momentum points is a test price, not automatic for every contextual action. **Simple repositioning around a fence should normally need no Momentum**, otherwise new Squatter players cannot solve the approved boar encounter before they have built Momentum.
- Large environmental damage, stun, denial or cover can justify costs, preparation or risk. Never bypass armor/defenses merely because an action is called Contextual.
- Obstacle collision, range and facing should be consistent with whatever minimal positional abstraction is chosen; an environment object cannot simultaneously serve as invulnerable cover and destructible terrain without a rule.

## Revised round sequence — PROPOSAL

1. **Enemy intent commit + telegraph:** AI decides one planned action per actor, reveals readable warning(s) with appropriate degree of precision, plus interactable objects and range/position. Intent cannot be rewritten opportunistically **after** the player chooses except through a disclosed, resolved combat rule.
2. **Player chooses exactly one action:** check Momentum, stamina, ammunition, item availability, action/target restrictions and current conditions. Invalid input asks for a new choice; does not silently consume a turn.
3. **Pre-action defensive setup:** selected Guard/Brace/relevant defensive stance becomes effective for the upcoming resolution; it already consumes its actor's one action.
4. **Resolve actions by real order:** Initiative + technique priority, with explicit and deterministic tie rule. Apply hit/miss, damage, injury and any qualifying interrupt; a truly incapacitated enemy loses or changes its already committed action as defined, not automatically on every hit. If the enemy acts first, its attack can land before a slower player strike.
5. **Cleanup:** tick bleeding/steam hazards etc. under one defined global timing order; calculate win, loss, flee/disengagement including animal withdrawal; update current Health, zone injury state, Stamina, Momentum, condition and equipment durability. The UI narrative log is generated **from these actual recorded outcomes**, not separate speculative text. Then begin next round if combat continues.

**Technical ordering note:** the server may calculate results internally first and format/print the log last; the displayed narration order must match real Initiative resolution. There is no need to force the enemy to be narrated last.

## Existing-world tests that can disprove the design

- **Flint:** if he shows a slow club attack, a faster basic strike should not automatically prevent it; a defensive choice should meaningfully reduce its impact. Three approved pre-fight positions must matter.
- **Young injured boar:** the Squatter starts with no Arms bonus or Momentum attack, yet can use ordinary movement and the fence to make safe passage; nonlethal animal withdrawal cannot require a costly special move or animal knockout.
- **Silas:** player may stand in the open, create distance or move behind the coal box; his hook's reach/box obstacle and initiative must matter. The staged fight cannot seize handwritten notes as a direct inventory reward.
- **Firearm user:** one action to fire or reload (subject to weapon specs), range/cover matter, a rifle's existing internal firing mechanism reliability should not be compounded by redundant part-by-part failure rolls.
- **Uninjured victory:** successful defense can produce zero damage and leads to a genuine ten-coin exam only, never an automatic hit or a forced wound.
- **Multiple foes (future):** every enemy acts once; UI shows multiple planned threats; guard/reposition cannot act as an unexplained defense against all enemies at once.

## Explicit questions for approval, not hidden canon

1. **Initiative:** will it govern actual offense/utility action order, while defensive stances establish protection before contact? **Recommendation: YES.**
2. **Momentum value scale:** 0–100 points, fixed gains/costs, earned after action resolution. **Recommendation: YES; exact gains/costs remain TBD.**
3. **Defense:** Basic Guard reduces relevant attack damage but does not automatically cancel all statuses. **Recommendation: YES.**
4. **Core options:** free Momentum-cost Strike/Guard/Move/Reload/Withdraw and paid specialized moves, subject to stamina/items. **Recommendation: YES; specific move list later.**
5. **Zone Health:** single existing Health plus body-zone targeting and injuries, rather than three parallel HP pools. **Recommendation: YES.**
6. **Telegraph detail:** committed/strong attacks give clear information; not every quick/feint action guarantees perfect knowledge. **Recommendation: YES.**
7. **Contextual effects and status guarantees:** only applied when an actual tool, hazard, wound or qualifying hit justifies them; no universally guaranteed disable or environmental bypass. **Recommendation: YES.**

**Change control:** This is an authored **discussion draft** only. It does **not** finalize turn ordering, one-action limits, costs, mitigation, Momentum generation, body-zone implementation, formulas or special attacks. It does not modify the locked Arms subskills or Health foundations.
