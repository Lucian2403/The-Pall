# The Pall Combat — Part 6: Damage, Protection and Injuries (PROPOSED)

**Status: PROPOSED FOR REVIEW — 2026-10-19. NOT APPROVED AND NOT IMPLEMENTED.** This is the next design layer after [Part 5: Enemy AI](enemy-ai-decision-system-proposal.md). Existing locked foundations take priority: [Character System](../../01-player/character-system.md) (starting maximum **50 Health**, long-term naturally approaches 100 but 100 is exceptional; genuine injuries may lower effective Health Ceiling), [Equipment](../../04-equipment/core/equipment-system.md) (durability, protection, quality, maintenance), [Item Data](../../04-equipment/data/item-data-schema.md) (distinct physical, ballistic, chemical and heat protection), [Arms skills](../../01-player/skills-progression.md), [combat foundation](approved-combat-foundation.md), and [unhurt clinic policy](../onboarding/shared-clinic-examination-policy.md). **All example numbers for weapon damage, protection, penetration, guard and injury thresholds are hypothetical playtest fixtures, not canon item stats.** No new weapon, armour or technique item is approved here.

**Goal:** a novice can read *hit → protect → hurt → possible wound*, while experienced combatants exploit aim zones, real equipment and timing. Not all hits should cause bleeding, not all armour should be worthless, and the player should never face an invisible guaranteed injury.

## 1. Important distinction: four outcomes, not one overloaded “damage” value

1. **Hit or miss** — does the selected attack legally reach and actually contact the chosen Head, Torso or Limbs zone? The full hit/accuracy formula is **not yet locked** and belongs to combat accuracy/skills later. Position, cover, Initiative, weapon reach, Focus, firing reliability and defence matter before Health damage.
2. **Direct Health damage** — how much physical harm remains after appropriate protection and active Guard? This comes off **one shared Health pool**.
3. **Wound / condition** — only when the real impact, zone, attack type and severity warrant it: e.g. cut, bruise, arm impairment, bleeding. A hit is **not** automatically a serious wound. A few status effects may be caused by the environment or a valid technique under their own disclosed conditions.
4. **Longer-term Health Ceiling effect** — a sufficiently serious injury may lower effective maximum Health until appropriate healing. This is **not** a second per-body-part HP bar or an additional arbitrary damage roll.

**Core caution:** bleeding should be a concrete consequence of a qualifying wound, **not** an on-every-hit debuff. “Critical hit” and aimed Head should not become automatic executions or an excuse for scripted tutorial damage. The boar, Flint and other approved opponents can win, lose or withdraw under the same physical rules, without mandatory deaths.

## 2. Minimal proposed damage pipeline

**Proposed server sequence for a legal attack that is allowed to resolve:**

1. **Validate:** action and target eligible, weapon is in range, firing ammo/activation is available, attack has not been legitimately cancelled before starting. Respect the item's **one real firing mechanism reliability rule**; never create redundant independent spring failure rolls.
2. **Determine contact:** resolve one future hit/accuracy test; if genuine miss or attack fails to reach, **Health damage 0**. This does not turn into a fabricated grazing wound. A genuinely defended impact can still count as a real contact for Momentum, if its conditions qualify.
3. **Calculate raw impact:** fixed weapon/attack profile with **modest** technique/skill effects as later designed; type and aim zone declared. Avoid multiplying together uncontrolled quality, attributes, Arms levels and Momentum bonuses.
4. **Apply zone/type protection:** select only applicable worn gear and real protection for the actually struck zone and physical/ballistic/heat/etc. category; penetration can **reduce matching protection**, never add raw damage out of nowhere.
5. **Apply active Guard:** a chosen, relevant Guard reduces the remaining Health harm by a **type-specific fraction** (not automatic protection against everything). Guard is established before attack resolution but still costs the one action.
6. **Apply net Health damage** once; clamp current Health between 0 and effective maximum. Record the impact, armour absorption, Guard mitigation and Health result separately for clear logs and balancing.
7. **Check one relevant wound/condition outcome:** only on a qualifying actual blow meeting zone/type/severity requirements. Apply its actual side effect and any justified ceiling penalty; do not apply a separate hidden “injury just because stage 7 follows” rule. Repeated wounds/bleed stacking need later bounds.
8. **Update defeat/nonlethal/withdraw states and persistent event log** after correct turn resolution. A local nonlethal victory does not automatically require Health zero; truly incapacitated opponents remain subject to separate surrender/knockdown rules.

### One simple mathematical candidate

For early **direct physical / ballistic hit** trials only:

`EffectiveProtection = max(0, MatchingZoneProtection - AttackPenetration)`

`PostProtection = max(0, RawImpact - EffectiveProtection)`

`NetHealthDamage = round_half_up(PostProtection * (1 - RelevantGuardReduction))`

Where GuardReduction is **0** when no eligible Guard is active; capped between 0 and 1 when it is. Round **once** at the end to an integer, not at every intermediate stage. No negative damage, no healing through high protection, and no armour penetration counted twice.

- This is an intentionally **simple flat protection model**, not yet a universal solution for steam, acid, poison, fire, blunt trauma through plate or other complex sources. Those may have distinct direct-resistance/environment rules when designed.
- **Protective clothing and full armour are different**: the existing universal **Basic Clothes** has no approved combat protection values. Don't silently assign the existing item a permanent numeric armor rating from these examples.
- Provisional **Guard reduction candidates** for numerical stress tests: **50%** against an applicable ordinary club/punch/blunt or close strike; **less against high-force animal charge and bullets** without suitable defensive equipment; **0 against an environmental exposure the stance doesn't physically intercept**. These are not locked.
- High protection may legitimately stop low-force attacks completely. This is an intended possibility (e.g., an unarmed punch against proper armour), but progression must retain counterplay using **different zones, cover/movement, actual weapon/gear choices, retreat and scenario objectives**, not “every enemy gets at least 1 unavoidable damage.”
- Armour degradation follows existing durability rules and equipment profiles; the damage pipeline **does not** add a second armour-HP meter or require exactly one durability loss per hit.

**Known risk:** flat protection is simple but can create all-or-nothing thresholds. Test low-damage punches against heavy armour and high-penetration firearms against light clothing. If it fails, adjust by family-specific penetration and protection profiles, rather than introduce a second random armour/critical roll by default.

## 3. Aim zones are meaningful without three Health bars

| Aim zone | First-design trade-off | Potential consequences | Explicit limit |
| --- | --- | --- | --- |
| **Torso** | Default, dependable contact; many garments cover it | Reliable ordinary Health loss; bruising or a serious torso wound only when appropriate | Not universally the weakest armour |
| **Head** | Harder to hit, high risk if a qualifying blow lands | Pain/disorientation or serious head injury at warranted severity | No automatic one-shot kill or guaranteed concussion |
| **Limbs** | Moderate aiming difficulty, may trade pure damage for positional/functional harm | A justified arm/leg wound can affect strike, movement or guard capabilities | Cannot claim the shooting hand is broken from undifferentiated “Limbs” without recording which limb was actually hit |

**Recommendation:** keep the **three visible buttons** Head/Torso/Limbs, but if a qualifying limb injury happens, store **the actual limb** (e.g., arm/leg or later left/right if supported) for consistent penalties. The UI remains simple and injury data can be deeper. Do **not** attach another visible bar per zone.

For basic unarmed beginners, aim-zone attacks should all have ordinary physical limits and should never permit an untrained character to use a head-click as a guaranteed stun. Exact aim penalties, head risk, limb injury chance and weapon applicability are TBD.

## 4. Wounds and Health Ceiling: state, not another damage lottery

**Recommendation:** base a genuine injury on **post-mitigation impact severity, damage type, struck zone and relevant protection**, with a small reusable set of injury types and severity bands. **No independent per-hit infection/bleed/cripple dice by default.**

- **Minor impact** — loses actual Health; may leave **no persistent wound**. Appropriate for protected/guarded contact; no obligation to bandage.
- **Qualifying wound** — if the impact is strong/penetrating/sharp enough under that wound's real rule, apply a tagged injury such as **bruise**, **cut/bleeding** (where actual tissue damage warrants bleeding) or **strained/injured limb**; exact thresholds TBD.
- **Serious wound** — can lower effective Health Ceiling and influence movement/attacks/Focus/pain, without introducing permanent stat-loss or a special second Health pool. A clear medical recovery method must exist.
- **Repeated qualifying hits** — no unlimited “bleed stack per bullet/pellet” or multiplying identical wounds on one body part. Recommend a bounded state that replaces/raises severity as justified. Exact wound progression/bleeding tick timing needs later design.
- **Guard may reduce net harm below an injury threshold**, so a successful basic defensive choice can produce an unharmed character. For impacts still serious enough, Guard does **not** magically cancel cuts or burns.
- **Lethal versus nonlethal** is a consequence of actual attack/equipment/action and opponent outcome policy; no universal assumption that HP zero must mean death. A boar's safe retreat and Flint/Silas withdrawal are legitimate alternative wins.

**Effective Health ceiling:** `EffectiveMaximum = min(BaseMaximum, InjuryAdjustedCeiling)`. When a new injury reduces the ceiling, current Health is clamped to the new effective maximum if necessary. That **must not also apply a second arbitrary damage event** beyond the original strike and the transparent cap adjustment. Recovery restores the permitted ceiling via real care over time; exact treatment and time are TBD.

**Example of ceiling vs damage:** a hypothetical veteran with 70 base maximum Health and 70 current Health takes 14 actual Health damage, leaving **56/70**. A serious injury reduces their allowed ceiling to **60**. Because 56 is already under 60, the result becomes **56/60**, not 42/60; do not subtract the 14 again. If current Health were above the new ceiling, clamp to it once and log the ceiling change.

**No-damage clinic case is already LOCKED:** after a genuine untouched victory, Stage 7 still charges 10 coins for an examination, shows **no injuries found** and performs no invented treatment or healing.

## 5. Momentum and experience must not destabilize damage

- **Momentum buys a technique**, rather than acting as a passive direct damage multiplier on every attack. A high Momentum meter does **not** automatically raise weapon damage.
- **Arms → Melee/Pistols/Rifles/Scatterguns** should improve competence, technique availability and relevant accuracy/timing, not become unlimited raw damage against heavily armoured targets.
- **Arms → Defense** may affect real Guard effectiveness/repertoire in later balancing; it does not create automatic status immunity.
- **STR/DEX/INT/RES** retain their original training/opportunity roles with restrained direct combat bonuses. Equipment, preparation and weapon/ammo choice remain important.
- **One attack action** gets at most one Basic Strike Momentum gain, even with multiple shotgun pellets, multi-target splash, or multiple impact logs. Status ticks don't become free extra hits or Momentum farms.
- **NPC and player use identical pipeline** and same zone/equipment protection model. Difficulty cannot come from silently doubling NPC damage or changing their hit math after seeing the player's action.

## 6. Three beginner / low-stakes combat examples

**All figures are deliberately hypothetical test inputs.** They are **not** approved item ratings for Flint's club, Silas's hook, Basic Clothes or the boar. Every example first assumes the described attack **actually connects**; a miss produces 0 Health harm and no invented wound.

### Example A — Millhand versus Flint: Guard matters

- Player has standard **50/50 Health** with no assumed protective combat rating from Basic Clothes.
- **Test-only club attack RawImpact 12**, **MatchingZoneProtection 0**, **Penetration 0**.
- If an unguarded club blow lands: `12 - 0 = 12 Health damage`; player goes **50 → 38**. Such a large unguarded blow **might qualify** for a genuine wound under later thresholds. There is no forced wound simply for entering this scene.
- If player chose a relevant **50% Guard** and the blow connects: `round(12 × 0.5) = 6`; player goes **50 → 44**. With a wound threshold hypothetically above 6, no lasting wound occurs. The effective Guard also qualifies for the provisional **+8 Momentum**; Flint may gain +10 for genuine meaningful contact.
- If player moved in time behind the cart and the committed attack has no valid target, **0 damage**, no wound; meaningful defensive Move may gain +5 Momentum.
- **Point:** Guard reduces harm but does not make hits impossible. A no-damage win remains legitimate.

### Example B — Squatter versus young injured boar: a charge is not a punch

- Player is unarmed at **50/50**. The boar's routine charge remains a **0-Momentum Standard Attack**; never require it to build special Momentum to charge.
- **Test-only charge RawImpact 15**, no applicable rated armour/penetration. If the player stays in its reachable line and the charge genuinely lands, direct Health loss is **15**: **50 → 35**. It *may* also produce legitimate knockback or a real wound if later rules qualify, not a guaranteed scripted injury.
- If player selected Guard with a **hypothetical weaker 30% mitigation versus charging mass**, landed damage is `round_half_up(15 × 0.7) = 11`: **50 → 39**. This remains dangerous even when guarded.
- If player uses **Move** and gets clear of the already committed, nontracking charge in time, **0 damage**, and the boar may later **Withdraw** along an opened route for the approved nonlethal player victory. The Move needs no Momentum.
- **Point:** correct positioning outperforms Guard against a charging animal without creating a boar-only minigame.

### Example C — Inkbound versus Silas: body targeting and hook

- Inkbound has **50/50** and carries only their established non-loot work notes; no invented combat weapon.
- **Test-only hook impact 8**, with **0** matching protection in this fixture. On an unguarded real impact, Health drops **50 → 42**.
- Against a suitable **50% Guard**, residual damage is `round(8 × 0.5) = 4`: **50 → 46**, without automatic bleeding or a forced cripple status.
- If Silas targets a limb, only a **genuinely qualifying sharp/forceful limb wound** may impair an arm/leg; we must first know what the actual strike and target were. Choosing “Limbs” in the UI isn't enough to invent a broken hand.
- The coal box can prevent the attack from reaching its target under normal position/Initiative rules; it remains padlocked regardless of victory/defeat.
- **Point:** the same math supports unarmed care, weapon reach, position and meaningful injury tags; no forced plot wound.

## 7. Three high-end-game examples (hypothetical stress tests, NOT new canon)

These are **illustrative encounters** using hypothetical weapons, armour ratings and hazards. They do not establish new NPC identities, equipment items, recipes, locations, ammunition design or late-game progression requirements.

### Example D — Experienced rifleman versus protected opponent (Grey Marches)

- Assume an aimed torso shot is legal, a compatible mechanism successfully fires, and the round *really hits*. **Test-only RawImpact 28 ballistic**, target torso **BallisticProtection 11**, attack **Penetration 5**.
- Effective protection `max(0, 11 - 5) = 6`. Un-guarded Health harm `28 - 6 = 22`.
- With a **hypothetical 20% effective gunfire Guard** using *genuinely suitable cover/gear*, harm is `round_half_up(22 × 0.8) = 18`.
- Both outcomes may qualify for serious injury depending on true injury thresholds and struck zone. The active Guard is **not** universally meaningful against bullets simply because a character held up bare hands.
- **Point:** ballistics and protection create weapon-choice decisions, without a passive Momentum damage multiplier or an extra hidden critical-roll lottery.

### Example E — Veteran with injured arm in edged-weapon melee (future content)

- Hypothetical attacker **RawImpact 21 physical/sharp**, arm protection **8**, effective attack penetration **3**, plus a relevant **50% Guard**.
- Protection becomes `8 - 3 = 5`; residual `21 - 5 = 16`; Guard halves it to **8** net Health loss. Without Guard, the same hit would deal **16**.
- If an actual **arm wound** qualifies, it may affect actions using that arm and potentially Health Ceiling. A shield/guard that reduced impact below the serious wound condition might avoid that lasting impairment; it does **not** automatically erase all bleeding or pain.
- A separate sample serious wound: veteran has **70/70**, loses **14 Health** to a qualifying hit → **56/70**, injury lowers ceiling to **60** → **56/60**, **not** 42/60.
- **Point:** Guard, limb protection and recovery alter long-term risk rather than merely changing a damage meter.

### Example F — Pressure-line heat hazard and protective gear (future industrial encounter)

- Hypothetical steam hazard event with **RawHeatExposure 18**, applicable **HeatProtection 9**, and **no effective Guard** because an ordinary combat brace cannot stop heat exposure.
- Illustrative simple heat harm is **9** before any hazard-specific severity/time rules, while a legal **Move out of the dangerous area before the hazard resolves** may produce **0** this turn.
- The hazard may affect equipment durability and create a **pressure Leak state on machinery** if mechanical rules actually warrant it—not bleeding from a person's arm or an imaginary human “steam leak.”
- If later thermal exposure uses a separate duration/resistance model, document it as a deliberate environmental source instead of pretending this entire weapon formula covers heat perfectly.
- **Point:** protection category, movement timing and actual environment, not a universal Guard or out-of-nowhere status.

## 8. Exploits, balance and implementation checks

1. **No guaranteed contact/Health loss:** an actual hit test and protection apply; the tutorial cannot force the first/second hit or assign an unseen wound to justify the 10-coin visit.
2. **No infinite zero-damage fortress:** if strong protection fully cancels ordinary fists, that can be realistic, but encounters must allow legal equipment choices, withdrawals, position and objective outcomes; low-tier opposition must not be balanced by granting hidden armour penetration.
3. **No one-click head executions:** aiming at Head has meaningful risk; severe outcomes require legal circumstances. Exact aim modifiers remain a separate approval task.
4. **No bleed on every hit:** the wound gate distinguishes Health harm from lasting wound; blunt attacks don't automatically inflict sharp cuts, and Guard shouldn't universally cancel every effect.
5. **No stack explosion:** one selected attack cannot spawn arbitrary numbers of limb injuries, damage-over-time stacks or per-pellet Momentum rewards. Multiple impacts need clear bounded rules.
6. **No double-counting protection:** if armour already reduces damage, don't silently count its absorption again as a universal reduction to injury threshold *and* a separate random armour block without explicit approved logic.
7. **No injury cap double-damage:** clamp the affected Health Ceiling appropriately, without re-subtracting the original wound's Health damage.
8. **No invented starter armour:** Basic Clothes and Crude Small Bag remain the same starter kit; combat protection values are still TBD, not supplied by this spec.
9. **No skill-stat explosion:** training can improve timing/accuracy/options, but raw attributes should not directly produce runaway hit damage in the new model.
10. **No unbounded high-level power:** around 100 maximum natural Health is exceptional, so weapon/protection/conditions must create difficulty, not unrealistic multi-thousand-Health enemies as a shortcut.
11. **Deterministic event replay and reconnect:** the authoritative engine saves initial state, committed actions, resolution data, random seed where applicable, net Health, new wounds, resulting effective ceiling, and equipment state atomically. Double clicks/retries do not duplicate damage, bleeding or XP.
12. **Telemetry from fights:** track attack miss rates by aimed zone, direct net damage, total Guard mitigation, zone/gear protections, injury frequency/severity, overall fight length, low-Health escapes and new-player defeat rates before locking values.

## 9. Decisions requested from the user

**Recommendation A — Keep one Health pool, three aimed zones.** Strikes may cause qualifying localized injuries and genuine ceiling penalties; do not add three extra HP bars.

**Recommendation B — Adopt a transparent, short pipeline.** Validate + hit test → matching zone/type protection & effective penetration → Guard reduction if applicable → Health damage once → eligible wound/ceiling consequences.

**Recommendation C — Keep injuries conditional, not automatic.** Distinguish raw Health loss from actual wounds; avoid a second random “bleed/status proc” after every ordinary blow. Record genuine limb identity for severe injury without complicating the Attack UI.

**Recommendation D — Prototype flat protective ratings with penetration and type-aware Guard.** The **formula and sample numbers remain open** until simulations prove whether armour-vs-fists and firearm penetration behave well. Consider family-specific adjustments only if required.

**Recommendation E — Handle incapacitation, bleed timers, critical attacks, actual treatment and weapon-specific profiles as separate next layers.** Do not invent them here. After acceptance, define **Part 7: Hit Chance, Aimed Attacks and Combat Skills**, then Stamina/Health effects and weapon-family tuning before implementation.

**Change control:** Part 6 is **PROPOSED, not canon**. Existing foundation (50 starting max Health, one pool, Health ceiling injury interactions), shared clinical charge, six staged tutorial results, NPC Momentum parity and equipment condition rules stay authoritative. None of the test damage/protection ratings or wound thresholds is approved by including them as examples.

Related: [Accepted Combat Foundation](approved-combat-foundation.md), [Part 5 AI](enemy-ai-decision-system-proposal.md), [Health/Focus](../../01-player/character-system.md), [Equipment](../../04-equipment/core/equipment-system.md), [Item Data](../../04-equipment/data/item-data-schema.md), [Shared clinic rule](../onboarding/shared-clinic-examination-policy.md).
