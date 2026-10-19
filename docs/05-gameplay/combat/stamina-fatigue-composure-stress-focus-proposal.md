# The Pall Combat — Part 8: Stamina, Fatigue, Composure, Stress and Focus (APPROVED PRINCIPLES)

**Status: APPROVED DESIGN PRINCIPLES (2026-10-19); TEST-ONLY NUMBERS REMAIN OPEN; NOT IMPLEMENTED.** [Part 7: Hit Chance and Skills](hit-chance-aiming-and-skills-proposal.md) was approved at the **design-principle level**, with numerical accuracy/skill modifiers open. This Part 8 is built on the already established [Character System](../../01-player/character-system.md): **Stamina** is spendable physical reserve, **Fatigue** accumulates with overexertion (especially low/zero Stamina), **Composure** is spendable mental reserve, **Stress** is a harmful condition from mental strain and acting at low/zero Composure, and **Focus is DERIVED, NOT SPENT**. Focus is influenced by Composure, Stress, Fatigue, injuries/pain, Hunger, Thirst and medicine. Food and recovery are governed by [Food Survival](../survival/food-survival.md), including strong context-specific Stamina recovery multipliers; do not silently bypass its economy with an unlimited combat refuel.

**Approved pacing corrections:** (1) A fresh, well-rested character **usually starts combat with 80–100 Stamina** on the proposed 0–100 scale; an encounter never automatically refills a depleted reserve. (2) **Fatigue begins with relevant physical exertion when Stamina reaches 20 or less**, and **Stress begins with relevant mental pressure when Composure reaches 20 or less**. Once triggered, both accumulate **gradually on eligible further exertion/pressure, not automatically on idle rounds**. The qualifying action or pressure event that crosses the threshold can trigger the first small increment. Growth rates, other numeric costs, recovery values, Focus brackets and the exact Composure/Stamina maximum are still test settings. Existing lasting injury or survival-related conditions do not magically vanish.

**User's design standard:** make fights demanding and varied but the *core* simple. Each system proposal must include **2–3 actual beginner scenarios and 2–3 hypothetical high-end-game scenarios**. This file has **three of each**. None of the test numbers changes established player statistics, item attributes, enemies, skills or onboarding results.

## 1. Design verdict — two reserves, two persistent conditions, one derived readout

| Existing stat | Nature | In actual combat | Interface |
| --- | --- | --- | --- |
| **Stamina** | Spendable physical reserve | Pay for physical actions; low reserve makes prolonged exertion risky | **Main bar** |
| **Fatigue** | Accumulated harmful condition | Begins when qualifying physical exertion brings Stamina to **20 or less**, then grows with subsequent exertion | **Condition icon/tooltip**, not another combat fuel |
| **Composure** | Spendable mental reserve | Supports remaining calm/precision under danger or performing specifically demanding techniques; shaken by grounded stressors | **Secondary bar or compact gauge** |
| **Stress** | Accumulated harmful condition | Begins when qualifying mental pressure brings Composure to **20 or less**, then grows with subsequent pressure | **Condition icon/tooltip**, not another fuel |
| **Focus** | Derived read-only precision state | Feeds one accuracy modifier and other precision checks | **Read-only precision label/tooltip**, NEVER a spend button |

**No extra “Adrenaline”, “Fear”, “Balance”, “Poise”, “Suppression” or “Exhaustion” meter.** Ordinary environmental/medical statuses may exist if a genuine source warrants them, but don't duplicate five base stats.

**Momentum is distinct:** it represents *earned tactical advantage* and pays for special techniques; it does not replace Stamina, Composure or Focus. **Momentum itself gives no passive Health/damage multiplier.**

## 2. Smallest workable Stamina model

**Approved normal opening:** most well-rested fresh combats begin at **80–100 Stamina**; Stamina persists across fights rather than refreshing on every new encounter. **Numeric action costs below are TEST DATA ONLY:**
- Normal physical actions consume Stamina; a committed action costs its due even on an ordinary miss. No refund because the attacker missed, or because an enemy avoided it.
- **Test-only** baseline costs in an illustrative 0–100 normalized Stamina scale:
  - **Basic Strike/shot:** **8** Stamina (the actual gun type may later have a different cost).
  - **Basic Guard/Brace:** **5**, paid for the chosen guarded effort even if the incoming enemy unexpectedly misses; +8 Momentum only on actual mitigation.
  - **Move:** **6**, for a meaningful one-action reposition; movement speed and distance remain Part 2 TBD.
  - **Use (simple reload or bandage):** **2** for physical handling (an advanced field treatment may need more).
  - **Recover → Catch Breath:** regain **16** Stamina, capped by effective maximum, but consume the **full turn** and provide **no Guard or automatic protection**.
  - **Withdraw:** physical escape attempt has a genuine Stamina cost, **8** as a trial value; result/route rules are still open.
  - **Momentum technique:** pays its existing Momentum amount and a **technique-specific Stamina cost** rather than getting a free physical attack. Example **12** trial Stamina in addition to 20 Momentum; not an extra action.
- One action still per actor per round. Stamina doesn't restore automatically every round **or upon starting another encounter**. A small *outside-combat* recovery rule is separate and can use the already documented food/shelter/rest effects.
- **Important accessibility:** an actor at 0 Stamina can still choose **Recover**, and basic survival choices (Guard, Move/attempt Withdraw, ordinary Attack if still physically possible) should not cause a hard softlock. Allow an **overexertion fallback** with real action-speed/effect penalties plus Fatigue consequences; physically impossible special techniques can be restricted. A character may instead be truly incapacitated by injuries/defeat under Health rules, never merely because a UI button is disabled at 0.
- **No direct Health subtraction just for selecting a low-Stamina basic action.** A future specific exhaustion injury could be justified, but don't manufacture a tutorial wound.

**Why no free normal per-round Stamina refill?** Constant passive refill would make basic Guard nearly free and remove the consequence of choosing Attack, Move and Recover. Fight pacing can be tuned using modest action costs and objective-based enemy behaviour instead.

## 3. Fatigue: harmful overexertion, not a second Stamina bar

**USER-APPROVED THRESHOLD:** ordinary combat Fatigue is not generated while Stamina remains **above 20**. Once a physically demanding action reduces Stamina to **20 or below**, that action may create the **first small Fatigue increment**; further qualifying physical actions while in the low band add more. Being at 18 while waiting does **not** continuously add Fatigue.

**Unapproved trial growth:** +5 Fatigue per qualifying low-Stamina physical action; a forced overexertion beyond the remaining reserve adds another +10 and an honest action-performance penalty. The trial +5/+10 rates, whether thresholds scale with an eventual non-100 pool, and exact Stamina costs remain balance data.

- Well-rested entrants normally have **80–100 Stamina**, so ordinary short tutorial fights should rarely need Catch Breath.
- A battle begun after a prior fight, dangerous trek or other real activity **inherits the current reserve and Fatigue**. Never set it to 100 just to initiate combat.
- **Recover → Catch Breath** raises Stamina but does **not erase already accumulated Fatigue**. Longer-term recovery uses actual rest and survival systems.
- Fatigue may influence physical action timing and Focus, but must not be counted twice in attack accuracy. Reaching 20 is not automatic damage, an injury or a hard action lock.
- Actor at zero Stamina can still Recover and attempt eligible basic survival choices through the agreed overexertion fallback, subject to actual incapacitation.

**Boundary illustration:** with trial Strike cost 8, Stamina **90 → 82** creates no Fatigue. Stamina **27 → 19** enters the low band and can generate the first test +5 Fatigue. A second eligible exertion at 19 can add a further +5. No round-by-round passive Fatigue increment.

## 4. Composure and Stress: threat pressure without a panic minigame

**USER-APPROVED THRESHOLD:** ordinary combat **Stress** starts only when the character's **Composure reaches 20 or below**. A genuine pressure event that reduces Composure across that boundary may create the first small Stress increment; subsequent qualifying threats/actions while Composure remains low generate gradual Stress. **No free Stress increment just because the character waits at 17 Composure.**

- Ordinary Attack, Guard or Move **do not automatically spend Composure**, so ordinary scuffles do not create constant mental attrition.
- Composure can be depleted by credible serious shocks or deliberately demanding specialized actions. A foe's telegraph by itself does not drain mental reserve; genuine shock magnitude remains to be defined.
- A shock at **Composure 80 → 74** does **not** generate ordinary Stress. A genuine pressure event at **Composure 24 → 18** may begin Stress accrual, with the incremental amount TBD.
- When Composure reaches 0, basic player agency remains. Reduced precision/steadiness may matter via actual Focus and other conditions, but there is no automatic input hijack or random flight.
- **Recover** is one existing selected action with one chosen mode: **Catch Breath** for Stamina **or Steady Nerves** for Composure (candidate +12 Composure), never both. The actor loses that turn's attack/Guard/Move opportunity.
- **Steady Nerves cannot erase Stress** or treat a wound; restoring Composure above 20 prevents further ordinary low-Composure Stress gain until a later crossing, but existing Stress persists.
- Exceptionally traumatic injuries/environmental effects would require separately reviewed conditions; do not silently bypass the threshold with a generic “hit causes Stress” rule.
- Enemy NPCs follow compatible reserves/condition principles as appropriate to their form. The frightened injured boar follows its realistic retreat/charge motives, not human anxiety dialogue.

Composure is a reserve; Stress is a lingering condition. Neither replaces Momentum or the player's intentional tactics.

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

**Only the pacing principle and threshold rule are approved** here. All action costs, example initial Composure and encounter outcomes are hypothetical; no newly granted starter inventory, automatic injury or scripted hit.

### A — Millhand against Flint: recovery is not forced

- **Start:** well-rested Millhand at illustrative **90 Stamina**, **80 Composure**, zero Fatigue/Stress and 0 Momentum.
- **Round 1:** Guard against Flint's committed club blow: Stamina **90 → 85** (trial −5). A truly effective Guard earns prototype +8 Momentum; a naturally missed attack earns none.
- **Round 2:** Basic unarmed Strike: Stamina **85 → 77** (trial −8); Momentum increases only if contact is meaningful.
- **Round 3:** Move around the actual cart: Stamina **77 → 71** (trial −6); if it really foils an attack, the agreed prototype defensive Move may earn +5 Momentum.
- **Result:** **no Fatigue**, **no routine need to Recover**. An untouched win remains legitimate and pays for the standard 10-coin clinic examination without fake healing.

### B — Squatter against injured boar: moving is sustainable

- **Start:** well-rested Squatter at **90 Stamina** and 0 Momentum.
- **Round 1:** Move out of charge line: **90 → 84**, with +5 Momentum only if a committed attack was actually avoided.
- **Round 2:** Move aside to open a safe exit: **84 → 78**; no Momentum if no fresh attack was thwarted.
- **Round 3:** the injured animal may choose Withdraw when a real exit becomes available. This is the approved nonlethal player victory.
- **Result:** **zero Fatigue and no forced attack or Recover**. The low-reserve rule will matter more during sustained travel, repeated fights or exceptionally long encounters.

### C — Inkbound against Silas: worry is not immediate Stress

- **Start:** illustrative **90 Stamina and 80 Composure** without Stress/Fatigue.
- **Round 1:** Guard costs trial 5 Stamina → **85**; a meaningful successful mitigation may generate defensive Momentum.
- **Round 2:** if an actual serious event reduces Composure by a test −6, **80 → 74**, ordinary **Stress stays at zero**.
- **Round 3:** Basic Strike trial −8 Stamina → **77**. Steady Nerves is available but generally unneeded when Composure remains 74.
- **Result:** Silas can still win legitimately and the notes remain protected by their approved narrative contract, but no compulsory mental debuff is invented.

## 8. Three hypothetical high-end-game worked examples (STRESS TESTS ONLY)

**None of these fights, enemies, or gear modifiers is additional canon.** Low-reserve openings below are consequences of **prior exertion or actual damage/pressure**, not ordinary automatic fresh-fight settings.

### D — Fresh experienced rifleman against two shooters

- **Start:** well-rested rifleman at **90 Stamina**, illustrative **80 Composure**, limited ammunition.
- **Round 1:** Move to real cover costs trial 6 Stamina → **84**; a precommitted attack truly avoided may yield +5 Momentum.
- **Round 2:** legal rifle shot costs trial 8 → **76** and actual ammunition. It can generate +10 Momentum on genuine contact.
- **Round 3:** a special shot could need **20 Momentum and 12 Stamina** (test only). If the player earned only 15 Momentum, the special is unavailable **despite sufficient Stamina**. Normal Attack, Reload or repositioning remains viable.
- **Result:** an adequately rested high-level fighter is **not** asked to Recover in the opening three turns.

### E — Exhausted veteran entering another fight in a pressure workshop

- **Start:** **14 Stamina carried forward** after a demanding previous fight or dangerous journey; the player is not magically refreshed at combat entry. Actual lingering Fatigue may already exist.
- **Round 1:** a trial 8-Stamina Attack leaves **6** and generates another **small Fatigue increment** because Stamina is already at or under the approved 20 threshold.
- **Alternative:** Recover → Catch Breath restores test 16 Stamina **14 → 30** but leaves the player exposed. Or Move away from a hazard for trial 6, if timing and destination allow.
- **Result:** the Recover decision is now urgent for a real reason—previous exertion—rather than an artificial 20-Stamina spawn.

### F — Wounded veteran against scattergun guard, low Composure

- **Start:** another fight soon after a hard encounter; player persists at **11 Stamina**, **24 Composure**, an actual arm wound, some already accumulated Fatigue and no freshly invented Stress.
- **Round 1:** a genuine frightening event drains test **6 Composure → 18**. The event crosses the agreed 20 threshold and **may generate the first small Stress increment**, exact increment TBD.
- **Round 2:** Basic Attack trial cost 8 Stamina → **3** and adds gradual Fatigue. A later **genuine** low-Composure mental pressure event can add more Stress; idle waiting never does.
- **Alternative:** Recover → Steady Nerves could restore test 12 Composure **18 → 30**, but provides no Stamina or Stress removal. Catch Breath could address Stamina instead, not both.
- **Result:** persistence and separate mental/physical recovery create meaningful stakes; the scattergun wielder obeys the same one-action and reload rules.

## 9. Interaction traps and acceptance tests

1. **No needless fresh-fight recovery:** most well-rested starts have 80–100 Stamina, so short encounters shouldn't require Recover. **No Guard → Recover immortality:** Guard consumes Stamina even if enemy naturally misses; Recover consumes full action and supplies no automatic Guard, Health or injury removal. Actual AI can change approach instead of delivering useless repeated blows.
2. **No automatic five-meter clutter:** only two resource reserves (Stamina/Composure) + existing Health/Momentum as active bars; Fatigue/Stress as conditions; Focus read-only/derived.
3. **20-point Fatigue gate and no zero-Stamina softlock:** qualifying physical exertion that crosses to ≤20 may begin gradual Fatigue; idling at low Stamina does not generate it.  Recover always works unless genuine incapacitation; basic survival choices can overexert with explicit penalty. No forced damage as a hidden punishment just for being tired.
4. **20-point Stress gate; no phantom mental damage:** enemy telegraph alone doesn't drain Composure. Ordinary Stress accrues only on qualifying mental pressure at Composure ≤20, including a genuine threshold-crossing event; it never ticks just because a round passes.
5. **No injury duplicate penalty:** if pain/injury modifies Focus, don't again apply a second independent injury-to-hit modifier unless it reflects a distinct physical impairment (e.g. arm mechanics).
6. **No infinite Steady Nerves spam:** it consumes the turn, cannot erase Stress, and may be disrupted by real action/encounter outcomes; enemy combat continues.
7. **No unlimited meal multiplier inside combat:** existing food recovery multipliers remain under their own eligibility, duration and diminishing-benefit rules, not automatically `×10` on an emergency one-action Recover.
8. **No invented forced animal frenzy:** low reserve or low Composure doesn't silently guarantee a boar charge lands, mandate a tutorial injury or replace its real withdrawal decision.
9. **No skill/attribute double counting:** attribute-related training gates retain priority; Focus is one precision input. RES can affect suitable long-term reserve/resistance training without a free all-purpose reduction.
10. **NPC parity:** enemies actually consume their Stamina/Composure and accumulate appropriate Fatigue/Stress. AI chooses from legal actions without secretly granting a fatigued opponent a free shot.
11. **Save and reconnect:** snapshot reserves, Fatigue/Stress, derived Focus inputs, committed recovery mode, costs, actual shock events and the round outcome once. On replay, don't charge Stamina again or permit rerolling a panic/precision outcome.
12. **Continuous-world interaction:** well-rested fresh fights typically begin at 80–100 Stamina; **never reset Stamina or Composure at encounter start**. Travel, hunger, thirst and carried condition remain grounded in earlier game systems. Quantify outside-combat recovery; don't fully heal an expedition by idling.
13. **Cross-encounter economy:** Stamina/Composure (and lingering harmful conditions) need legitimate outside-combat recovery; their recovery must not be permanently tied to winning a fight or paying the **10-coin examination fee**. An unhurt tutorial character can pay for an examination without receiving a fake Fatigue/Stress cure.
14. **Playtest metrics:** record average net Stamina spent/encounter, percentage of Recover actions, proportion of fights ending with Fatigue, Focus-related miss contribution, action starvation rates, Stress persistence, and perceived punishment for beginner movement.

## 10. Accepted principles and open balance choices

**APPROVED A.** Two spendable reserves: **Stamina for bodily work, Composure for mental control/special demanding techniques**. Fatigue and Stress are harmful accumulated conditions, not separate renewable currencies; **Focus is always derived and never spent**. This matches canonical character design.

**APPROVED B.** Use the same **Recover** action with a choice of **Catch Breath** or **Steady Nerves** (one effect, one action); avoid an extra button or out-of-turn regeneration. Recover is risky under credible threat and does not clear lasting harmful conditions.

**APPROVED C.** Low or empty Stamina permits emergency basic actions with visible overexertion/Fatigue rather than trapping the player; unusually demanding maneuvers may be unavailable until recovery. No automatic hidden Health damage.

**APPROVED D.** Integrate **Focus as one condition-derived adjustment** to accuracy and other precision checks; don't multiply the same wound/fatigue twice. Stamina-driven Fatigue may affect Action Timing and other physical actions without replacing Health damage.

**APPROVED E (WITH 20-POINT GATE).** Use credible actual battle incidents for Composure loss and Stress, not an invisible “every enemy turn −5 mental points.” Keep player agency at low Composure unless a separately defined genuine incapacitation effect occurs.

**APPROVED BOUNDARY / TEST-ONLY VALUES F.** The **20-or-lower Stamina/Composure onset rule** and usual fresh **80–100 Stamina** are approved at the working 0–100 scale. By contrast, the absolute future maximum reserve, individual action costs 8/5/6/2, Recover +16 Stamina / +12 Composure, Fatigue +5/+10 increments and Focus 0/−3/−8/−15/−25 pp bands remain **test inputs**, not final gameplay numbers.

**NEXT:** define the actual wound/status treatment & healing timing **or** weapon families and Stamina costs; prioritize a runnable one-on-one combat prototype once these shared rules are stable. Keep **three novice + three hypothetical endgame** worked cases in every following subsystem.

**Change control:** the Part 8 structure and two explicit corrections are **USER-APPROVED (2026-10-19)**: most fresh/rested fights start at 80–100 Stamina (no automatic refill between encounters); ordinary Fatigue/Stress accumulation begins when Stamina/Composure respectively reaches 20 or below and grows gradually from qualifying exertion/pressure. All example costs, refill amounts, growth increments, Focus penalties and exact Composure maxima remain TEST-ONLY. Existing 50 starting Health, six combat families, Momentum prototype, unchanged onboarding/no-wound clinic and food systems are preserved. **No combat implementation is claimed.**
