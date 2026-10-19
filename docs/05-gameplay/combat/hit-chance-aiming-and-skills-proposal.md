# The Pall Combat — Part 7: Hit Chance, Aimed Attacks and Combat Skills (PROPOSED)

**Status: USER-REVIEW PROPOSAL — 2026-10-19. NOT LOCKED OR IMPLEMENTED.** Follows [Part 5 AI — approved principles](enemy-ai-decision-system-proposal.md) and [Part 6 Damage / Protection / Injuries — approved architecture](damage-protection-injuries-proposal.md). The objective is **demanding combat with one readable accuracy calculation**, not a maze of invisible independent dice. All accuracy values below are **hypothetical testing fixtures**, not actual weapon stats, NPC balancing or approved skill coefficients. Per user request: **three concrete beginner examples and three hypothetical high-end-game examples**.

## 1. Recommended core philosophy

- **A legal attack can miss. A hit can be protected. A protected hit may cause no lasting wound.** Don't conflate accuracy, penetration, armour protection, guarding, injury and firearm activation.
- **One normal contact check per selected attack.** We should not independently roll melee proficiency, target dodge, aiming, weather, armour avoidance and limb damage. Their effects feed one transparent hit chance. A select few special projectile/area effects may eventually justify explicitly different resolution, without silently multiplying basic chances.
- **Position before probability.** If the target is out of actual reach, completely blocked by an object, legitimately outside the weapon's supported range, or has left a nontracking attack line *before it resolves*, the action fails contact/eligibility as appropriate. **Do not replace impossible reach with a 5% lucky-hit chance**.
- **Guard is mitigation, not universal evasion.** Unless a distinct future technique changes it, Guard affects legitimate incoming impacts in the Part 6 damage pipeline, not a second independent die roll that also lowers accuracy. Movement/cover can change hit chance or make an attack invalid; don't count the same physical obstruction twice.
- **Skills should matter without erasing uncertainty**. Higher Arms and specialization improve practical handling, unlock tactical technique options and give modest reliable accuracy advantages; no unbounded +1% accuracy per 1 Arms level, or auto-hit at Arms 100.
- **Clear probabilities, real outcomes.** The displayed hit-chance value must be the engine's actual current eligible calculation, rounded only for UI as needed. Never show 80% while secretly adjusting RNG against the player. Combat outcomes and any random seed are server-authoritative and replay-safe.

## 2. One testable accuracy formula (NOT approved balance)

Candidate for normal direct attacks:

`HitChance = clamp(MinChance, MaxChance, BaseAttackAccuracy + ArmsHandlingBonus + SpecializationBonus + EquipmentAccuracy + FocusEffect + DistanceEffect + AimZoneEffect + TargetMovementEffect + CoverEffect + OtherVisibleConditionEffects)`

All terms are **percentage points (pp)**, not multiplicative percentages. Thus `70% - 25 pp = 45%`. Clamp candidate **5%–95%** for otherwise legal contested attacks *as a test only*; clamp choice must be validated especially for near-contact strikes and rare expert shots. **An illegal/impossible attack gets no hit roll, not the 5% floor.** The initial design may need distinct reliability/near-certain contact cases rather than universally locking these bounds.

**Do not treat this as eight separate RNG rolls.** The server computes a single probability and samples it once at attack resolution. Relevant signs/range/cover can be summarized in one tooltip.

### Terms and starting trial values — NOT item canon

| Modifier | Candidate starting value | What actually changes it | Risk to avoid |
| --- | ---: | --- | --- |
| Example `BaseAttackAccuracy` at intended range | **70%** | The actual weapon/unarmed attack profile, once authored | Do not assign 70 to every future firearm or beast |
| **Arms Handling bonus** | **0 to about +8 pp** across ordinary 0–100 levels | Canonical Arms Major Skill under a diminishing-return trial mapping | A steep linear +100 pp at Arms 100 |
| Correct weapon specialization | **up to +5 pp** example | Tier in canonical **Melee / Pistols / Rifles / Scatterguns** branch | Duplicate the same Arms bonus twice |
| Head targeting | **−25 pp** test | Smaller, harder target with larger potential wound significance | Guaranteed headshot stun/execution |
| Limbs targeting | **−12 pp** test | Narrower/moving target; qualifying limb wound effects are not guaranteed | Auto cripple from selecting Limbs |
| Torso targeting | **0 pp** | Default / easiest zone | Torso always weak against all armour |
| Partial, real cover | **−20 pp** example | Line of attack partly obstructed | Cover both causes automatic miss AND full penalty |
| Bad distance for that weapon | **−10 to −20 pp** example | Range profile (Near/Far or later authored distances) | Treat out-of-range as a tiny hit chance |
| Real Focus/condition problem | **−8 to −15 pp** example | Derived Focus from stress, fatigue, injury, light or similar *without double counting* | Multiplying the same injury as Focus −10, Aim −10 and flat hit −10 arbitrarily |
| Compatible sight upgrade | **+5 pp** example | Real approved T2/T3 sight profile, range and condition | A sight becoming a damage boost or independent failure dice |

*All numeric examples here exist exclusively to evaluate the shape of the system.*

**Proposed illustrative diminishing return for Arms Major bonus:** `ArmsHandlingBonus = 10 × ArmsLevel / (ArmsLevel + 20)` (0→0 pp, 10→3.3 pp, 70→7.8 pp, 100→8.3 pp). This is a **toy balance function**, NOT agreed progression or actual UI math. It limits high-level automatic accuracy and deliberately leaves a place for specialist tiers, sights, better stance and player skill. Do **not** make an extra hidden Raw + Effective Arms roll; use the agreed Raw / Effective Skill distinction explicitly in the derived total.

**Stronger concern:** player skill levels 70–100 take enormous time in The Pall. A mere ~8 pp flat accuracy growth may feel under-rewarding by itself. It must be accompanied by learned techniques, equipment handling, greater variety of eligible range/stance choices, higher reliability of *applicable* skill-dependent actions and access to better gear. Those benefits are subject to later approval. **Do not finalize this formula without progression satisfaction tests.**

## 3. Aimed attacks: one Attack action, one chosen zone

**Attack → choose enemy → Head / Torso / Limbs → commit.** Aiming at a zone is **not a separate free targeting action** or a turn-consuming Aim turn. Choosing the zone changes the *same* attack's accuracy and possible wound/protection consequence.

- **Torso:** generally easiest to hit, useful to reliably reduce Health; it may be heavily protected.
- **Head:** significantly less probable contact; an actual serious hit may have dangerous consequences, but no automatic execution, status or guaranteed critical.
- **Limbs:** medium penalty; a qualifying wound can impair the specific struck arm or leg. If the interface remains grouped as Limbs, the resolver must identify the actual limb for any persistent wound; don't invent a specific broken shooting hand from an unspecific click.
- The **same zone system** can apply to animals when anatomy is meaningful, but a boar's exposed leg and head should not pretend to behave like identical human limbs. No separate “Boar Aiming” skill and no compulsory animal-knockout loop.
- Physical cover may protect zones unequally when geometry really supports that: a low wall might obscure legs, not the head. Do not add multiple independent per-zone cover dice.

**No automatic critical hit just for Head.** A critical/serious wound is an effect of an actual qualifying impact under future injury thresholds and technique rules; if a distinct rare critical mechanic is ultimately desired, it needs separate justification and tests.

## 4. What the existing skills and attributes actually do

### Canonical Arms Major Skill and its existing five specializations

| Existing branch | Intended combat contribution (proposal) | Not allowed |
| --- | --- | --- |
| **Arms** (Major 0–100) | General competence; bounded handling bonus; access to training and some action/technique prerequisites | Huge always-on additive damage or hidden automatic hits |
| **Melee** | Unarmed and appropriate melee attacks, range/reach handling, qualified maneuvers | Required new “Brawling” subskill just for fists |
| **Pistols** | Pistol handling, recoil/reach/range behaviour and weapon-appropriate techniques | Turning all pistols into long rifles via bonuses |
| **Rifles** | Rifle operation, aiming and suitable long-distance techniques | A bonus that ignores genuine cover or incompatible optics |
| **Scatterguns** | Scattergun operation and relevant distance/spread techniques | Independent +10 Momentum per pellet |
| **Defense** | Guard efficiency, known defensive techniques and their prerequisites; prospective trained movement advantages only when supported | An invented flat universal evasion/armour stat or immunity to all statuses |

Specializations are **smaller tiers**, not additional separate 0–100 XP ladders. Raw Skill gates important breakthroughs. Equipment-assisted Effective Skill can help performance, subject to the existing global distinctions.

### The four attributes and derived conditions

- **DEX:** relevant to coordination, rifle/pistol movement and action readiness; principally skill gates/training opportunities. **Avoid adding full direct DEX bonus and an equivalent Focus/skill bonus for the same improvement**.
- **STR:** access to heavy weapons and relevant melee training/carrying; no guaranteed blunt damage multipliers simply from STR.
- **INT:** medical/technical planning and training; not a generic “aim better at all enemies” stat.
- **RES:** endurance/stress capacity and conditions; not universal armour or guaranteed damage reduction.
- **Focus** is **DERIVED, NOT SPENT**. When fatigue, Composure/Stress, pain, hunger, thirst or injury make precise combat harder, convert their relevant effects into a **single condition penalty to accuracy**, especially at range. Double-counted “injury −8 and Focus −8 caused by that injury” needs to be avoided or deliberately modeled.
- **Stamina** is a spendable action resource and influences Fatigue; actions at low stamina may become slower/worse or be restricted under future rules. This part does **not** lock exhaustion or recovery numbers.

**Non-Arms skills still matter elsewhere:** Fieldcraft → Tracking helps find animals and read signs before fights, Medicine → Trauma affects eligible treatment, Mechanics → Weapon Maintenance affects servicing and diagnosing weapon faults, Scholarship → Engineering Theory may help inspect machinery. **These are not free hidden accuracy multipliers**.

## 5. Firearms: activation is not aim, and optics are not extra failure dice

The [already locked Firing Mechanism component family](../../03-resources/components/mechanical/firing-mechanisms.md) defines **one activation reliability characteristic** at full condition: **T1 97%, T2 98.5%, T3 99.5%**. Mechanism wear/host integration is still TBD.

**Proposed shot resolution**: ammunition/compatibility and legal reach → one weapon-activation check against its applicable built-in mechanism reliability (if successful, the weapon fires) → **one attack contact probability** based on Arms, weapon family, aim zone, range, cover and current Focus → if hit, Part 6 protection/damage/injury resolution.

- Weapon activation failure = **did not fire**; don't label it an inaccurate shot. Exact cartridge/ammo consumption and misfire recovery are weapon-profile questions still TBD.
- Weapon fired but missed = **missed shot**, with ordinary relevant ammo expenditure and any gunfire wear, not a mechanism breakdown.
- Do **not** roll independently for each manufactured spring, rifle sight and mechanism to duplicate an existing reliability characteristic.
- [Rifle sights](../../03-resources/final-products/weapon-fittings/rifle-sights.md) have **approved qualitative accuracy and effective-range improvements** for T2/T3; exact pp improvement remains PROVISIONAL. Their condition may reduce their benefit. No independent optical sight misfire roll, base T1 upgrade item or guaranteed damage multiplier.
- Manufacturing a compatible component at high Precision Mechanisms skill **does not** automatically impose that crafting gate upon a buyer/shooter.

**Mathematical illustration ONLY:** with test aim success **70%** and an otherwise sound T1 activation at **97%**, the chance that the weapon *both fires and hits* would be **0.97 × 0.70 = 67.9%** in this simple independent conditional model. That does **not** mean two rolls for every small mechanism part or that a projectile that fires is secretly assigned a second misfire probability. Exact implementation must distinguish the logged outcomes.

## 6. AI and initiative integration

- Enemy and player use the **same contact formula**; equipment, training, condition and cover produce genuine differences. NPC skill values belong in authored profiles and tests, never hidden per-turn cheating.
- AI chooses a *legal target zone* and a committed action before seeing the player's current click. The telegraph can provide clear, partial or limited information as already approved; **a declared Head strike cannot secretly resolve as a Torso hit with the same ordinary action**.
- Resolve timing and possible positional invalidation **before** contact RNG. Attack contact and final damage then follow the actual order. Guard is established in the defensive preparation phase. A slower chosen Attack remains legal unless the earlier action genuinely incapacitates/interrupts or alters reach.
- If a Move breaks an attack's precommitted, nontracking line, treat attack as invalidated/missed for an honest reason, without also sampling an unrelated 20% cover miss and claiming both causes.
- Momentum: a **genuine connecting Basic Strike** can earn the existing +10 **playtest** reward under impact criteria, not each projectile; a technique that misses still spends its already committed Momentum. A failed firearm activation does not grant hit Momentum.
- Deterministic state + saved RNG for retry/reconnect: identical committed action and saved seed must not be rerolled to farm headshots or avoid a bad result.

## 7. Three beginner / low-stakes worked examples (real approved tutorial opponents)

**These are probability examples, not scripted outcomes or approved weapon values.** Assume hypothetical `BaseAttackAccuracy = 70%`, Arms novice **0** (none of the six onboarding origins starts with Arms +3), zone effects Torso 0 / Limbs −12 / Head −25 pp, and plausible range unless noted.

### A — Flint: fists, torso versus head, service cart

- The unarmed Millhand attacks the **Torso at legitimate Contact range**: **70%** hypothetical chance.
- Select **Head** instead: **70 − 25 = 45%**. A hit would still need a genuine high-impact injury condition for disorientation; click alone does not give it.
- Flint moves so the cart partially obstructs a current attack line: hypothetical partial-cover **−20 pp** gives **50%** Torso. **If the cart completely blocks fist reach, the action is invalid/has no reachable attack**, not 5%.
- Flint's heavy club uses *his* own weapon and training profile. Guard may reduce its eventual damage; **Guard is not an extra minus-50-pp accuracy roll**.

**Decision:** the head is higher-risk and not a reliable early-game stun button. Position relative to the cart matters more than random “critical” fishing.

### B — Squatter: boar, positional survival

- An unarmed Squatter at **Contact** could attempt a qualifying strike against its torso at **70%**, or an exposed limb at **58%** (70 − 12) in this human-derived *test* approximation. Species-specific anatomy and reach must be verified before finalizing animal targeting modifiers.
- The boar's ordinary charge has its own legal attack/aim profile, **not a free 100% hit**; if the player's **Move** successfully clears its precommitted path first, the charge does **not** get a residual 5% luck roll.
- If the animal's attack legitimately strikes before the player moves, normal damage/injury applies; movement can still be a rational but risky action depending on timing.
- The boar can withdraw through a safe opening and grant the already approved **nonlethal player victory**, even if the Squatter never attacks.

**Decision:** combat accuracy exists, but solving the real threat does not require repeated punches or building Momentum.

### C — Inkbound and Silas: hook reach and cover

- At Contact, the Inkbound's unarmed **Torso** attempt uses the example **70%** baseline; **Limbs 58%**, **Head 45%**, with the same actual injury checks later.
- Silas's work hook might be usable at a different range. The exact reach and damage type remain **unapproved**; don't invent a permanent weapon stat merely to complete the example.
- If the coal box partially covers a legal line, example Torso chance becomes **50%**; if it prevents Silas reaching the Inkbound, **the hook cannot strike from the other side without a legal approach**.
- Silas cannot automatically hit the papers, seize the notes or inflict a guaranteed broken arm by choosing a limb zone.

**Decision:** distance and real obstruction shape hit eligibility before probability; nonlethal aftermath stays intact.

## 8. Three hypothetical high-end-game worked examples — NOT new canon

**All enemies, equipment modifiers and numerical shooting qualities are testing fixtures only, not approved NPC inventories, items, combat content or final skill progression.** To illustrate bounded scaling, use candidate Arms Handling `10×Arms/(Arms+20)`, giving ≈**+8 pp** for Arms 70–80, and +5 pp hypothetical applicable trained specialization. Never read these as real weapon family accuracy specs.

### D — Veteran rifleman using upgraded sights in the Grey Marches

- Hypothetical rifle base at suitable range **70%**, **Arms 70 → +8 pp**, applicable Rifle tier **+5 pp**, calibrated/optical sight **+5 pp** test → **88% Torso** for a legal clear shot.
- Target **Head** instead → **63%** (88 − 25). With **partial cover −20** → **43%**. A wall that entirely blocks line of fire invalidates the shot regardless of skill.
- A T2/T3 sight is allowed to improve accuracy and practical range, but **does not improve raw bullet damage or skip weapon activation**.
- If using a hypothetical sound T1 mechanism, the **97% activation** check remains separately visible from the 43–88% conditional accuracy.
- A veteran has multiple good alternatives (Move, Guard, wait for exposed shot, techniques, Withdraw), not “always click Head because Arms 70.”

**Decision:** gear/aim/cover and player judgment still matter more than a giant level multiplier.

### E — Wounded experienced melee fighter under strain

- Hypothetical **Base 70**, Arms 80 **+8**, suitable Melee specialization **+5**, genuine arm impairment **−12**, Fatigue/Focus-related penalty **−8**, **Torso = 63%** if the hit remains legal. **Head = 38%**.
- **Warning about double counting:** only keep *both* −12 injury handling and −8 Focus if they represent **different effects** (impaired striking arm vs mental/tremor precision) and the derived Focus calculation hasn't already fully included the same penalty. Otherwise drop one.
- A successfully selected Guard protects against the threatened strike through the damage/condition pipeline rather than giving the wounded veteran another hidden dodge roll.
- A different actual limb, tool use or reposition could change this player's options. Don't force the veteran to attack in conditions where defending/retreating is wiser.

**Decision:** long-term injuries can overpower modest elite accuracy gains. Even a trained character must respect real physical limits.

### F — Trained scattergun specialist versus moving and partially protected foe

- Hypothetical suitable-range profile **70%**, Arms 70 **+8**, Scatterguns tier **+5** → **83% Torso** in an open legal firing line.
- If there is real partial cover **−20 pp**, chance becomes **63% Torso**, or **51% Limbs** (another −12).
- Scattergun shot uses **one selected Attack, one player/enemy Momentum grant at most**. Later pellet/spread/armor modeling must be specified in a separate weapon-family design, not extra arbitrary per-pellet accuracy/misfire rolls in this base system.
- If the foe's committed **Move** finishes first and breaks the declared nontracking firing line, the shot may fail entirely; weapon operation and committed-action spending still follow normal rules.
- An experienced NPC with sufficient Momentum may consider a specialized shot only if trained and legal; no secret ammunition or free follow-up shot.

**Decision:** range, cover, movement and ammunition remain meaningful even with high skill.

## 9. Anti-exploit and gameplay acceptance checks

1. **No hidden guaranteed first/second hit**, no tutorial-only accuracy overrides, no wounded player fabricated to justify a clinic. Real untouched victory is possible.
2. Legal range/cover assessed **before** probability; if impossible, no lucky-hit floor. One ordinary attack accuracy roll, not a cascade of repeated miss/evade/aim/location dice.
3. Head/Torso/Limbs affect the same attack action; target selection does **not** consume another turn or create a free new action.
4. Beginner heads are difficult, but do not cause automatic severe wounds; limbs do not guarantee Cripple.
5. One Health pool; after contact, Part 6 armour/guard/injury checks apply once in correct order.
6. No skill/DEX/Focus double-dipping; mixed-specialty characters have strengths without erasing the long Arms progression curve.
7. NPC uses same formula, visible commitment, and legal sight/reach; telemetry detects if high-skill opponents reach the probability cap too often.
8. Firearm activation reliability is the **existing mechanism's single rating**, with no extra part-level failure rolls; its failure logged separately from inaccurate fire.
9. Raw skill controls breakthrough/unlocks; Effective skill affects performance when equipped help is actually relevant; purchased items don't inherit their crafting skill gates.
10. Shotgun/pellet effects cannot secretly generate unlimited hits or per-pellet +10 Momentum.
11. Replay/reconnect uses server-side committed action and saved seed; refresh/retry cannot sample accuracy or activation twice.
12. Collect hit rates per zone/weapon/skill/range/Focus/cover and resulting injury rates; compare to intended novice/equipped/veteran outcomes before deciding the real formula or min/max caps.
13. Test veteran rifle versus novice at favorable range, two enemies behind cover, bruised melee fighter under Focus loss, boar charge invalidated by movement, and zero-damage Guard victories.
14. Prevent head-target spam being mathematically dominant. If head wound benefits overwhelmingly exceed its lower contact rate, revise wound payoff or aim penalty; do not hide a punitive die.
15. Never apply a “critical” and “penetration” independent probability stack to double-count the same strike without explicit later approval.

## 10. Decisions proposed (NOT YET LOCKED)

**A.** Use **one** contact probability roll for an ordinary attack, after legal reach and action timing. Distinguish firearm **activation** from aiming and contact.

**B.** Keep the three aim choices *inside Attack*, with **Torso reliable / Limbs less reliable / Head least reliable**, conditional consequences from actual injury rules.

**C.** Use a **small additive percentage-point model** with bounded Major Arms contribution and modest existing-branch specialization; skill progression principally adds tools and technique choices, not guaranteed hits.

**D.** Treat Focus as the only derived precision condition interface, avoid repeated penalties for the same underlying injury/stress, and keep DEX/STR/INT/RES primarily in their previously approved attribute roles.

**E.** Let actual weapon family, distance, legal cover, mobility and maintained rifle sights modify the same contact probability; don't bolt on independent per-component reliability rolls.

**F.** Test **70% candidate weapon base, Head −25 pp, Limbs −12 pp, partial cover −20 pp and a candidate 5–95% eligible-attack clamp** for illustration ONLY. These values may be too forgiving or too punishing and must be tested against real encounter outcomes and gear. They are NOT approved or canonical.

**Next** after user review: Part 8 should define **Stamina, Fatigue, Composure, Stress and Focus interactions** and action resources, then weapon classes, wound/medical thresholds, nonlethal outcomes and an executable encounter prototype. Continue the required **three low-stakes + three hypothetical endgame** tests for each major design.

**Change control:** this is a proposed document, not a numerical balance lock or shipped browser code. The already-approved six onboarding story outcomes, skills, equipment quality/durability, manufacturer component stats, 50 starting Health and 10-coin no-wound examination remain untouched.

Related: [Skills](../../01-player/skills-progression.md), [Character](../../01-player/character-system.md), [Damage](damage-protection-injuries-proposal.md), [Initiative](initiative-and-intent-proposal.md), [Enemy AI](enemy-ai-decision-system-proposal.md), [Firing mechanisms](../../03-resources/components/mechanical/firing-mechanisms.md), [Rifle sights](../../03-resources/final-products/weapon-fittings/rifle-sights.md).
