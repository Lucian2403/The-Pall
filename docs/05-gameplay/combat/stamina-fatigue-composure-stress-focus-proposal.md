# The Pall Combat — Part 8: Stamina, Fatigue, Composure, Stress and Focus (PROPOSED)

**Status: DISCUSSION PROPOSAL — 2026-10-19. NOT APPROVED; NOT IMPLEMENTED.** [Part 7: Hit Chance and Skills](hit-chance-aiming-and-skills-proposal.md) was approved at the **design-principle level**, with numerical accuracy/skill modifiers open. This Part 8 is built on the already established [Character System](../../01-player/character-system.md): **Stamina** is spendable physical reserve, **Fatigue** accumulates with overexertion (especially low/zero Stamina), **Composure** is spendable mental reserve, **Stress** is a harmful condition from mental strain and acting at low/zero Composure, and **Focus is DERIVED, NOT SPENT**. Focus is influenced by Composure, Stress, Fatigue, injuries/pain, Hunger, Thirst and medicine. Food and recovery are governed by [Food Survival](../survival/food-survival.md), including strong context-specific Stamina recovery multipliers; do not silently bypass its economy with an unlimited combat refuel.

**User's design standard:** make fights demanding and varied but the *core* simple. Each system proposal must include **2–3 actual beginner scenarios and 2–3 hypothetical high-end-game scenarios**. This file has **three of each**. None of the test numbers changes established player statistics, item attributes, enemies, skills or onboarding results.

## 1. Design verdict — two reserves, two persistent conditions, one derived readout

| Existing stat | Nature | In actual combat | Interface |
| --- | --- | --- | --- |
| **Stamina** | Spendable physical reserve | Pay for physical actions; low reserve makes prolonged exertion risky | **Main bar** |
| **Fatigue** | Accumulated harmful condition | Builds when pushing exertion at low/empty reserve; degrades performance until real recovery | **Condition icon/tooltip**, not another combat fuel |
| **Composure** | Spendable mental reserve | Supports remaining calm/precision under danger or performing specifically demanding techniques; shaken by grounded stressors | **Secondary bar or compact gauge** |
| **Stress** | Accumulated harmful condition | Builds under sufficiently intense/prolonged mental strain, particularly at low Composure; lingers beyond one Recover turn | **Condition icon/tooltip**, not another fuel |
| **Focus** | Derived read-only precision state | Feeds one accuracy modifier and other precision checks | **Read-only precision label/tooltip**, NEVER a spend button |

**No extra “Adrenaline”, “Fear”, “Balance”, “Poise”, “Suppression” or “Exhaustion” meter.** Ordinary environmental/medical statuses may exist if a genuine source warrants them, but don't duplicate five base stats.

**Momentum is distinct:** it represents *earned tactical advantage* and pays for special techniques; it does not replace Stamina, Composure or Focus. **Momentum itself gives no passive Health/damage multiplier.**

## 2. Smallest workable Stamina model

**Recommended structure (numbers are TEST DATA ONLY):**
- Normal physical actions consume Stamina; a committed action costs its due even on an ordinary miss. No refund because the attacker missed, or because an enemy avoided it.
- **Test-only** baseline costs in an illustrative 0–100 normalized Stamina scale:
  - **Basic Strike/shot:** **8** Stamina (the actual gun type may later have a different cost).
  - **Basic Guard/Brace:** **5**, paid for the chosen guarded effort even if the incoming enemy unexpectedly misses; +8 Momentum only on actual mitigation.
  - **Move:** **6**, for a meaningful one-action reposition; movement speed and distance remain Part 2 TBD.
  - **Use (simple reload or bandage):** **2** for physical handling (an advanced field treatment may need more).
  - **Recover → Catch Breath:** regain **16** Stamina, capped by effective maximum, but consume the **full turn** and provide **no Guard or automatic protection**.
  - **Withdraw:** physical escape attempt has a genuine Stamina cost, **8** as a trial value; result/route rules are still open.
  - **Momentum technique:** pays its existing Momentum amount and a **technique-specific Stamina cost** rather than getting a free physical attack. Example **12** trial Stamina in addition to 20 Momentum; not an extra action.
- One action still per actor per round. Stamina doesn't restore automatically every round. A small *outside-combat* recovery rule is separate and can use the already documented food/shelter/rest effects.
- **Important accessibility:** an actor at 0 Stamina can still choose **Recover**, and basic survival choices (Guard, Move/attempt Withdraw, ordinary Attack if still physically possible) should not cause a hard softlock. Allow an **overexertion fallback** with real action-speed/effect penalties plus Fatigue consequences; physically impossible special techniques can be restricted. A character may instead be truly incapacitated by injuries/defeat under Health rules, never merely because a UI button is disabled at 0.
- **No direct Health subtraction just for selecting a low-Stamina basic action.** A future specific exhaustion injury could be justified, but don't manufacture a tutorial wound.

**Why no free normal per-round Stamina refill?** Constant passive refill would make basic Guard nearly free and remove the consequence of choosing Attack, Move and Recover. Fight pacing can be tuned using modest action costs and objective-based enemy behaviour instead.

## 3. Fatigue: harmful overexertion, not a second Stamina bar

**Recommended first version:** Fatigue changes **when an action is performed from already low Stamina**, not because “time passed, so +1 Fatigue” on every round. This preserves short, readable tutorial fights.

**Trial condition rule only:** if an action starts with **Stamina below 20 of the normalized 100**, add **+5 Fatigue** for physical exertion; if required cost exceeds available Stamina and the actor overexerts, add an **additional +10**, reduce Stamina to 0 and apply an appropriate action-performance penalty. Trial costs, thresholds and whether the bands are based on *percentage of current effective max* all need balancing; for a non-100 real pool, ratios must be scaled rather than copy 20 literally.

- Fatigue can eventually affect **action readiness/Initiative**, physically difficult movement/strength tasks and **Focus**. Apply its precision effect through **Focus once**; don't also subtract the same condition via an unrelated hidden hit penalty.
- Fatigue is **not immediately erased by one Recover turn**. Recover restores a reserve; lingering exhaustion needs rest/time and suitable existing recovery economy. This prevents Guard → Recover → Guard from being a free perpetual defence.
- A harsh expedition may begin with legitimate Fatigue carried from travel, Hunger, poor rest or prior activity; the exact world-state integration remains to be quantified, not an enemy-only handicap.
- Do not track an additional injury-level “Exhaustion” debuff unless actual health design demands it; Fatigue already serves that role.

## 4. Composure and Stress: threat pressure without a panic minigame

**Composure** is the *immediate capacity to remain controlled*, **Stress** the *lingering mental burden*. Both are already canonical. Recommendation:
- **Ordinary Attack/Guard/Move do not automatically spend Composure** simply for being in combat. Requiring a mental point on every punch would turn easy scuffles into attrition for no good reason.
- A **credible shock** — serious wound, highly threatening near-miss, exposure to a dangerous event, witnessing a real partner fall — may reduce Composure based on an authored, bounded pressure event. **No arbitrary Composure loss merely because an enemy telegraphed an attack.**
- Certain **concentration-heavy** techniques or hazardous precise actions may spend Composure as an additional disclosed resource, if the action genuinely demands it. Don't make a normal rifle shot consume arbitrary Composure on top of ammo and Stamina.
- **Stress** rises from qualifying serious/repeated pressure and particularly from acting with low Composure. It affects Focus and possibly other context-sensitive checks. **A single unguarded ordinary punch should not automatically generate a pathological Stress disorder.**
- If Composure falls to 0, characters **retain agency**: basic actions remain selectable, but precision/intimidation under strain may suffer real consequences. No random compulsory auto-retreat, input hijack or paralysis solely from an empty Composure bar. Exceptional panic/incapacitation must be a separately qualified actual effect, not automatic for every low-level opponent.
- **Proposed Recover option, same button and same one-action economy:** `Recover → Catch Breath` (mainly Stamina) **or** `Recover → Steady Nerves` (small Composure recovery, e.g. **+12 normalized points** TEST ONLY). The player chooses **one**, never both simultaneously, and remains vulnerable while recovering. This is **a choice inside the existing Recover command**, not a seventh mandatory action button or an additional free phase.
- **Recover → Steady Nerves does not erase Stress or an actual wound.** Longer-term quiet/rest, medical treatment or suitable gear/food under later rules must govern Stress recovery. Show the distinction in the log.
- Enemy NPCs share the same Composure/Stress/Focus rules to the extent anatomically/behaviourally appropriate, but a wild boar's reactions are driven by animal motive/fear/injury, not a human speech/intimidation mechanic. **No bespoke enemy-only mental-power stat.**

## 5. Focus: one read-only derived precision value

**Recommendation:** derive Focus from the current, actually relevant character state. Do not create an independent Focus XP/progression bar, Focus potion meter or spendable combat currency.

Conceptually:
`Focus = clamp(0, FocusBaseline - ConditionPenalty(Fatigue, Stress, low Composure, injury/pain, Hunger, Thirst, medication, visibility and other applicable sources))`

This is **conceptual**, not a final mathematical function; source weights, whether Composure supplies a discrete modifier, and how negative/positive effects combine remain TBD. Conditions that are already represented within Focus should **not** be added as another free-standing accuracy subtraction.

**Candidate Focus→precision mapping (TEST ONLY):**

| Focus reading (normalized) | Ordinary accuracy adjustment | Reading to the player |
| --- | ---: | --- |
| **80–100** | **0 percentage points** | Clear / steady |
| **60–79** | **−3 pp** | Slightly distracted |
| **40–59** | **−8 pp** | Unsteady |
| **20–39** | **−15 pp** | Poor concentration |
| **0–19** | **−25 pp** | Severe impairment |

Use this as the **single Focus contribution** to Part 7 hit chance and medical/crafting precision rules when relevant. Don't give a high-level player another unbounded accuracy boost simply for being at 100 Focus.

**Design caution:** seeing an enemy's head location is not inherently a high-INT ability. Actual tactical literacy is reflected in training, Focus, enemy intent presentation and player judgment; don't build a second hidden “mental aim” formula.

## 6. UI: tactical clarity, not five glowing bars

**Persistent during a fight:** Health, **Stamina bar, Composure compact bar, Momentum bar**, and **enemy telegraphed intent**. Fatigue and Stress appear as small explicit condition indicators when present; Focus appears only as a precision status tooltip or context line beside hit chance. During a shot, a simple example might show:
> **Torso 67%** (cover −20 pp; skill +5 pp; unsteady Focus −8 pp).

These values must match the *real* resolver, and the displayed line is not an added independent roll. Show an action's Stamina/Momentum cost, before the player confirms it. Avoid five permanent huge meters filling the mobile screen.

If the player attempts an unaffordable demanding technique, explain the reason rather than consume their action silently.

## 7. Three beginner / low-stakes worked examples (existing locked encounters)

**All values are illustrative prototype fixtures.** The actual universal starting kit is still **Basic Clothes + Crude Small Bag + 20 coins**, no starting weapon, 50 max Health and no Arms tutorial bonus. **Stamina/Composure starting max and actual costs are NOT YET CANONICAL.** Example pools of 30/40/etc. indicate **current reserves** within a hypothetical normalized 100-point scale, not permanent limits. All hits/misses/guards described below are *conditional possible outcomes*, never forced.

### A — Millhand and Flint: defend or regain breath

- Example player starts with **30 Stamina**, **40 Composure**, no Fatigue/Stress and 0 Momentum.
- **Round 1:** Flint commits a heavy club swing. Millhand chooses **Guard** and pays **5 Stamina**, leaving **25**. If the blow **actually hits and is mitigated**, Guard earns the agreed **prototype +8 Momentum**. If Flint instead misses entirely, no Guard Momentum appears. No scripted hit/injury.
- **Round 2:** Player chooses **Basic Strike**, pays **8 Stamina**, leaving **17**. If the strike lands meaningfully, Momentum rises from 8 to **18**; a miss earns 0.
- **Round 3:** Flint still threatens. **Recover → Catch Breath** brings Stamina from 17 to **33**, but leaves the Millhand unguarded while Flint resolves his committed action. The alternative is Guard/Move/Attack at lower reserves and, later, the risk of Fatigue if pressing on below the trial 20 threshold.
- **Design result:** no free recovery, but the player is never trapped in a zero-Stamina state. An early successful Guard and Strike help build Momentum without making recovery safe.

### B — Squatter and boar: mobility can exhaust a novice

- Example Squatter begins with **20 Stamina**, 0 Momentum and no injury.
- **Round 1:** boar commits a regular charge. Squatter's **Move** costs 6, leaving **14**. If movement clears the real line *before* the charge resolves, Health harm is 0 and player earns **+5 Momentum**; if too slow, normal hit/Guard/injury rules apply.
- **Round 2:** an additional **Move** costs 6, leaving **8**. Because the second physical action began below the **hypothetical low reserve threshold of 20**, it adds **+5 Fatigue** in the illustrative trial model; merely moving doesn't grant more Momentum unless it actually defeats another committed attack.
- **Round 3:** if an open exit now exists, the boar can choose **Withdraw**, and the Squatter earns the already-approved **nonlethal player victory**. No need to punch the boar, spend 20 Momentum or manufacture an injury.
- **Design result:** movement is tactical but not infinitely free, especially after exertion. **Do not** turn this short starter fight into an obligatory exhausting three-round event just to show the mechanic.

### C — Inkbound versus Silas: Composure matters without overriding controls

- Example Inkbound has **24 Stamina**, **24 Composure**, no wounds and 0 Momentum.
- **Round 1:** chooses **Guard**, spends 5 Stamina → **19**. If a real hook blow is reduced, player earns +8 Momentum; if not, no credit.
- **Round 2:** imagine a later genuine threatening impact or severe near-miss qualifies for a **test-only −6 Composure shock**; Composure drops **24 → 18**. Such shocks aren't automatic on every Silas attack, and **no invented guaranteed hit** is allowed.
- **Round 3:** player may choose **Recover → Steady Nerves** and restore a hypothetical **+12 Composure** to **30**, but cannot also attack, Guard or restore Stamina in that turn. A real ongoing Stress condition would **not** vanish from that action.
- **Design result:** mental pressure creates a tactical decision without a panic minigame or extra action family.

## 8. Three hypothetical high-end-game worked examples (STRESS TESTS ONLY)

These are **not new canon NPCs, approved weapons, loot, medical effects or world areas**. Scenario numbers below are intentionally test-only.

### D — Experienced rifleman caught between two shooters (Grey Marches)

- Character enters with **32 Stamina**, **24 Composure**, low/no Fatigue, limited ammunition and already equipped rifle. Enemies commit their separate attacks before player input.
- **Round 1:** player **Moves** behind actual cover, pays 6 Stamina → **26**. A legitimately foiled shot may earn +5 Momentum. Moving doesn't simultaneously fire.
- **Round 2:** player **Attacks** with a legal shot, pays 8 Stamina → **18**, consumes appropriate ammunition, and may earn +10 Momentum if the shot connects. Mechanism activation is separate from accuracy, as Part 7 approved.
- **Round 3:** a hypothetical precise **Momentum technique** costs **20 Momentum and 12 Stamina** (plus any justified Composure cost). With only 15 earned, it isn't affordable. The player must choose another standard action, **Use → Reload** if empty, or risk exposure while recovering.
- **Design result:** a veteran has better choices, not two actions in one turn or a bottomless resource pool.

### E — Pressure-system hazard, exhausted melee combatant (future industrial encounter)

- Player begins with **14 Stamina** and has to choose between defending a threatening foe and escaping a steamy machinery lane.
- **Attack** costs test-only 8 Stamina → **6** and adds +5 Fatigue because exertion began below 20. It may inflict real damage if the legal attack connects, but cannot also reposition or manipulate a valve.
- **Recover → Catch Breath** instead restores Stamina **14 → 30**, sacrificing the entire action; an enemy hit or steam exposure can still reach the player depending on its committed timing.
- **Move** might be wiser than either, if a reachable clear lane avoids a committed pressure hazard, but it still uses Stamina. **Guard cannot make a person immune to heat/steam.**
- **Design result:** no dominant button. Body exhaustion matters, while a genuinely prepared position can save more Health than raw equipment.

### F — Injured veteran versus close-range scattergun guard (future encounter)

- Veteran starts at **11 Stamina**, **15 Composure**, genuine arm injury (effective Health Ceiling lowered), **10 Fatigue** and **8 Stress** as hypothetical states. The actual Focus formula will aggregate them for one precision penalty.
- **Basic Attack** costs 8 → **3 Stamina**, accumulates trial Fatigue from already-low reserve and may be poor if the arm is impaired; do not separately count that same injury three times in hit chance.
- **Recover → Steady Nerves** could restore Composure from **15 → 27** in one action, but provides **no Stamina, no wound healing and no instant Stress removal**, leaving enemy opportunity.
- If a legal exit exists, **Move/Withdraw** may avoid an attack at real resource cost; if the enemy must **Use → Reload**, it has to commit that action like the player. Choosing to bandage an existing wound takes one **Use** action and suitable supplies.
- **Design result:** even a highly trained character must decide whether to protect a wound, conserve physical reserve, regain Composure or escape under fire.

## 9. Interaction traps and acceptance tests

1. **No Guard → Recover immortality:** Guard consumes Stamina even if enemy naturally misses; Recover consumes full action and supplies no automatic Guard, Health or injury removal. Actual AI can change approach instead of delivering useless repeated blows.
2. **No automatic five-meter clutter:** only two resource reserves (Stamina/Composure) + existing Health/Momentum as active bars; Fatigue/Stress as conditions; Focus read-only/derived.
3. **No zero-Stamina softlock:** Recover always works unless genuine incapacitation; basic survival choices can overexert with explicit penalty. No forced damage as a hidden punishment just for being tired.
4. **No phantom mental damage:** enemy telegraph alone doesn't automatically drain Composure. Stress and shock events must be tied to actual pressure, thresholds and persistence.
5. **No injury duplicate penalty:** if pain/injury modifies Focus, don't again apply a second independent injury-to-hit modifier unless it reflects a distinct physical impairment (e.g. arm mechanics).
6. **No infinite Steady Nerves spam:** it consumes the turn, cannot erase Stress, and may be disrupted by real action/encounter outcomes; enemy combat continues.
7. **No unlimited meal multiplier inside combat:** existing food recovery multipliers remain under their own eligibility, duration and diminishing-benefit rules, not automatically `×10` on an emergency one-action Recover.
8. **No invented forced animal frenzy:** low reserve or low Composure doesn't silently guarantee a boar charge lands, mandate a tutorial injury or replace its real withdrawal decision.
9. **No skill/attribute double counting:** attribute-related training gates retain priority; Focus is one precision input. RES can affect suitable long-term reserve/resistance training without a free all-purpose reduction.
10. **NPC parity:** enemies actually consume their Stamina/Composure and accumulate appropriate Fatigue/Stress. AI chooses from legal actions without secretly granting a fatigued opponent a free shot.
11. **Save and reconnect:** snapshot reserves, Fatigue/Stress, derived Focus inputs, committed recovery mode, costs, actual shock events and the round outcome once. On replay, don't charge Stamina again or permit rerolling a panic/precision outcome.
12. **Continuous-world interaction:** travel and precombat hunger/thirst/condition remain grounded in earlier game systems. Quantify time and safe/outside-city recovery later; don't fully heal a long expedition just by waiting one round with no opponent in range.
13. **Cross-encounter economy:** Stamina/Composure (and lingering harmful conditions) need legitimate outside-combat recovery; their recovery must not be permanently tied to winning a fight or paying the **10-coin examination fee**. An unhurt tutorial character can pay for an examination without receiving a fake Fatigue/Stress cure.
14. **Playtest metrics:** record average net Stamina spent/encounter, percentage of Recover actions, proportion of fights ending with Fatigue, Focus-related miss contribution, action starvation rates, Stress persistence, and perceived punishment for beginner movement.

## 10. Decisions for user approval

**A.** Two spendable reserves: **Stamina for bodily work, Composure for mental control/special demanding techniques**. Fatigue and Stress are harmful accumulated conditions, not separate renewable currencies; **Focus is always derived and never spent**. This matches canonical character design.

**B.** Use the same **Recover** action with a choice of **Catch Breath** or **Steady Nerves** (one effect, one action); avoid an extra button or out-of-turn regeneration. Recover is risky under credible threat and does not clear lasting harmful conditions.

**C.** Low or empty Stamina permits emergency basic actions with visible overexertion/Fatigue rather than trapping the player; unusually demanding maneuvers may be unavailable until recovery. No automatic hidden Health damage.

**D.** Integrate **Focus as one condition-derived adjustment** to accuracy and other precision checks; don't multiply the same wound/fatigue twice. Stamina-driven Fatigue may affect Action Timing and other physical actions without replacing Health damage.

**E.** Use credible actual battle incidents for Composure loss and Stress, not an invisible “every enemy turn −5 mental points.” Keep player agency at low Composure unless a separately defined genuine incapacitation effect occurs.

**F.** **Numeric candidates are all optional**: 100-point example scales, costs 8/5/6/2, Recover +16 Stamina / +12 Composure, low-Stamina threshold 20, Fatigue +5/+10 and Focus 0/−3/−8/−15/−25 pp bands are **for test simulations only**. No permanent balance or equipment stat is locked here.

**NEXT:** after Part 8 approval, design the actual wound/status treatment & healing timing **or** weapon families and Stamina costs; prioritize a runnable one-on-one combat prototype once these shared rules are stable. Keep **three novice + three hypothetical endgame** worked cases in every following subsystem.

**Change control:** this document is **PROPOSED**. Existing canonical Health (new max 50), combat action economy, raw/effective Arms progression, Momentum prototype, honest AI, approved no-wound clinic policy and survival food benefits are preserved. Nothing here constitutes shipped browser MMO code.
