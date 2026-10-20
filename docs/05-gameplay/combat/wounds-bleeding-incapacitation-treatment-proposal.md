# The Pall Combat — Part 9: Wounds, Bleeding, Incapacitation and Treatment (APPROVED PRINCIPLES)

**Status: USER-APPROVED DESIGN PRINCIPLES (2026-10-20); NOT IMPLEMENTED OR NUMERICALLY LOCKED.** Builds on [Part 6 — APPROVED damage / protection / injuries](damage-protection-injuries-proposal.md), [Part 8 — APPROVED Stamina / Composure / conditions](stamina-fatigue-composure-stress-focus-proposal.md), [Character Health](../../01-player/character-system.md), [Medicine skills](../../01-player/skills-progression.md), and the [LOCKED six-origin clinic policy](../onboarding/shared-clinic-examination-policy.md). **Three beginner and three late-game examples** are included. All numeric bleed rates, treatment effects and thresholds here are **trial candidates only**. This is a game-system design for The Pall, not medical guidance.

## Design objective

Wounds must matter **before, during and after a fight**, but must not create multiple hidden Health pools, unavoidable tutorial injuries, instant character deletion, or a punishment spiral that makes the player unable to resume ordinary play. Most hits remove Health **without necessarily producing a persistent wound**. Major injury should emerge from actually qualifying impact, protection, location and damage type, never an extra arbitrary injury lottery.

The player should understand **what hurt, whether they're actively bleeding, what field care can accomplish, and why professional care is still worthwhile**.

## 1. Four clear result bands, not four extra bars

| Result | Meaning | Typical consequences | Care need |
| --- | --- | --- | --- |
| **Impact only — no persistent wound** | Actual post-mitigation hit reduces shared Health but does not pass a wound threshold | Immediate Health loss; may describe pain/bruise in prose but no lasting injury state | Rest/recovery restores Health by still-TBD means; no pretend dressing |
| **Minor wound** | Real superficial cut, scrape or small strain, based on type/zone/impact | One modest tagged condition, perhaps mild bleeding only when biologically appropriate | Simple field dressing may control it; may recover naturally or with basic care |
| **Serious wound** | Strong penetrating/sharp/blunt injury qualifying a functional impairment | Meaningful limb/precision/mobility penalty, possible active bleeding, effective Health Ceiling reduction | Stabilization in the field; proper care and longer recovery for underlying injury |
| **Critical wound** | Dangerous sustained injury at sufficiently high severity, not just aiming at Head | Severe bleeding or high-risk impairment; likely incapacitation under genuine Health/condition rules | Urgent stabilization and suitable clinical/surgical care; **not automatic permanent character deletion** |

**Terminology caution:** A blunt club can hurt and produce an injury without causing bleeding. A penetrating bullet can cause bleeding and a lasting injury if it genuinely connects and qualifies. Head targeting is not automatically a critical wound; limb targeting is not automatically a broken arm. A mechanical **Leak** remains equipment/pressure-system state, never a biological wound.

**Existing rule:** one shared **Health** pool, starting maximum 50 for new characters, with optional **injury-lowered effective Health Ceiling**. Visible aim zones remain Head / Torso / Limbs; persistent injury states can store the affected arm or leg where relevant, without body-zone HP bars.

## 2. How a hit becomes a wound

Use Part 6's existing order:
1. Legal range/position, attack timing, one contact roll where applicable; firearm activation remains its **existing component reliability**, distinct from hit chance.
2. On actual contact: matching zone/type protection, real penetration, valid Guard and final **net Health damage**.
3. Evaluate a single **data-driven wound eligibility rule** from the *actual residual injury-causing impact*, attacked body part, physical mechanism (blunt / edged / piercing / ballistic / thermal / chemical when supported), applicable protection and any explicitly authored technique condition.
4. If eligible, assign/update **one corresponding wound record** with **minor, serious or critical** severity and effects; no “free bleed roll” and no guaranteed stun/cripple solely because player chose a zone.
5. Apply direct Health damage once; update injury-caused effective Health Ceiling without subtracting the same damage again. Record the causal combat event.

**Candidate data fields:** `actor_id`, `wound_type`, `zone`, `limb_id?`, `severity`, `bleeding_intensity`, `treatment_state`, `created_at`, `last_effect_processed`, `ceiling_effect_id?`, `condition_effect_ids[]`. Equipment status and environmental contamination remain separate sources and need no special wound container.

**No exact injury thresholds locked.** Avoid blindly treating every low-Health character as “critically wounded”: a character may be low on Health due to several nonpenetrating blows without having a persistent bleeding wound. Conversely, a substantial qualifying sharp hit can cause a real injury before current Health reaches 0.

**Limb fidelity:** record whether a genuinely severe injury affects an arm or leg; if head/torso/limbs were the only aim UI choices, the resolver must still have a consistent physical limb identity when applying a lasting condition.

## 3. Bleeding is a bounded consequence, not a stacking exploit

**Proposal:** model **one aggregated Bleeding status per actor**, sourced from one or more actual qualifying wounds. Display one clear severity indicator: **Controlled / Light / Moderate / Severe** (names may change). A bandage controls or reduces bleeding; it does not necessarily heal the wound causing it.

- **No bleeding from a natural miss, protected zero-impact contact, blunt bruising without a wound, a boar passing by, or automatic Stage 7 requirements.**
- Bleeding is eligible when the actual injury type and severity support it (e.g. qualifying laceration, puncture or bullet wound). **No additional independent random bleed roll** by default.
- **One bleed tick at the end-of-round cleanup**, after all committed actions have resolved and direct damage / injury application is recorded. When a round ends the bleed effect ticks **once at most**, then resolve any resulting downed/incapacitated state. If a technique is interrupted, it cannot be charged twice or generate duplicate condition ticks.
- **Test values ONLY:** Light **−1 Health/round**, Moderate **−2**, Severe **−3**. The exact scale must be checked against 50 Health beginners, encounter length and high-end outcomes; the system could adopt different numbers after simulation.
- Bleeding must **not multiply by pellet count, number of cuts, area-of-effect targets or repeated application of the same wound**. Multiple eligible wounds may **raise an actor's one bleeding severity** under a bounded policy, rather than stack endless identical damage-over-time entries; exact escalation criteria remain open.
- **Important timing:** a hit received this round can create an active bleed and that status is eligible for the normal **one** cleanup tick at that round's end, never a hidden instant extra bleed tick during contact plus another cleanup tick. Whether the first tick starts next cleanup or one cleanup later is a policy choice; **recommend the round's normal cleanup** for readability, but keep the rule explicit.
- Health lost to active bleeding is **actual Health damage**, not automatically a new limb wound every tick. A tick cannot produce endless additional wound states, Health Ceiling reductions or Basic Strike Momentum for either attacker.
- **Field treatment** can stop/reduce ongoing bleeding using a real eligible medical item and the ordinary **Use** action. The status moves to **Controlled** when the treatment works. A controlled wound does **not** spontaneously re-bleed every round unless a **disclosed, later re-injury/worsening event** actually happens.

**Avoid a bleed lock:** if a conscious character can never survive the next bleed tick regardless of choosing one treatment action, field medicine is fake agency. A suitable action needs a genuine chance of effect, with emergency basic supplies and a readable urgent warning. Failure and severe wounds remain meaningful; no guaranteed survival is promised from every bad situation.

## 4. Downed, incapacitated, defeated, dead: don't conflate outcomes

**Recommended first playable slice:** reaching **0 current Health** or experiencing a separately defined genuine incapacitating condition makes an actor **Downed / Unable to Act**. This is the immediate tactical state, **not automatic irreversible character death**. The actor's current committed action may be cancelled only under the shared Initiative/interrupt rules.

- **Downed:** cannot choose normal Attack, Guard, Move, Use or Recover; combat resolution can continue for remaining actors. Any support from allies/clinicians consumes actual actors' legal actions and supplies.
- **Defeated:** encounter-specific objective/combat result is recorded, not inferred from the downed state alone. A party may survive if others resolve the threat; a solo fighter may lose; a human antagonist may yield before dropping to zero Health. No “enemy reaches zero = player gets kill rewards” shortcut.
- **Unconscious / medically incapacitated:** may be a consequence of severe injury/Health collapse, not a new collectible status meter. Do not add an arbitrary always-on second "downed HP" bar in first slice.
- **Death / permanent loss / respawn:** **NOT YET DECIDED GAME-WIDE.** Do not silently establish permadeath, gear loss, grave recovery, permanent death, insurance, revival tokens, or unlimited resurrection. **Proposal for first PvE playable slice:** defeat normally ends in a recoverable downed state with legitimate transport/treatment consequences; potentially lethal wilderness death and future consensual PvP death penalties require a separately approved policy.
- **Enemy behaviour:** the frightened young boar does not execute a fallen Squatter; Flint's workers interrupt after genuine player loss; Silas returns to protecting the sealed coal box after defeating the Inkbound. These are **already approved narrative outcomes** applied *after honest combat resolution*, not a universal immunity-from-danger status triggered at Health 1.
- **No automatic 1-Health safety cushion:** if an ordinary attack would legitimately take the player to zero, record zero/Downed and a true loss. The tutorial defeat branch makes onward care possible; it doesn't rewrite the action into a miraculous miss.
- **Avoid idle/offline execution loopholes:** server-authoritative combat and pending wound effects are persisted. Browser refresh or disconnect cannot reroll a bleed tick or drop an injury; neither should a passive website tab or offline wall clock instantly kill a character without a separately approved persistent-world hazard/time policy.

**Emergency outside combat:** when an actor survives a fight with active bleeding, the next appropriate opportunity must remain visibly urgent. Either real in-world time advances statuses by explicit server-owned rules, or the simulation pauses such ticking outside active combat; **do not accidentally do both**. For the first implementation, propose **one explicit combat-tick model and a separately designed world-time conversion**, with no invisible free pause used to farm safety.

## 5. Field care and proper treatment have three different goals

| Treatment target | What it can do | What it cannot secretly do |
| --- | --- | --- |
| **Control immediate bleeding** | Use an actual eligible dressing/bandage, action and supplies to reduce/stop the bleed; Medicine → Trauma can improve suitability/reliability with skill-appropriate constraints | Conjure sterile supplies, undo a serious injury, instantly refill all Health |
| **Restore current Health** | Specific restoratives, proper rest, clinic care and recovery conditions can restore Health **up to the current effective Health Ceiling** | Raise Health above a genuine wound-reduced ceiling; charge the same medical item twice |
| **Recover underlying injury** | Clinic/specialist care, treatment of underlying damage and elapsed recovery can reduce an impairment or restore effective Health Ceiling | Make a fractured arm fully functional in one ordinary turn just because Health was topped up |

**Recommend:** `Use → Apply Dressing` consumes **one action** and one real applicable dressing, optionally selecting the displayed actual active bleeding wound. It should be accessible at low Medical skill for a simple minor bleed, while **Medicine → Trauma** improves the ability to recognize, reliably manage and later treat more serious trauma. **Medicine → Surgery** and suitable trained facilities are for qualifying difficult interventions, not required to press ordinary basic bandage. No newly invented "Combat Medic" subskill.

**Important counterplay:** a bandage should be applied **before the end-round bleed tick** if its legally resolved Use action finishes in time under real Initiative. If the wounded actor is interrupted before the treatment resolves, normal interruption rules apply. A treatment does not retroactively erase Health already lost from bleeding.

**Treatment item economics:** existing herbs/material properties such as **Yarrow (hemostatic)**, **Calendula (wound care)**, **Sphagnum Moss (absorbent)** and **Comfrey (trauma recovery)** can inform **later recipes**, but **this proposal does not invent recipe quantities, inventory item IDs or permanent potion effects**. An herb's medicinal property does not mean carrying the raw plant is an instant useable battlefield bandage. Proper preparation and supplies must be defined with item data.

**Healing and the player's labour/economy:** damage and ongoing injury should create legitimate demand for treatment, supplies, skill and recovery time, without making every small fight cost more than it can plausibly earn. A perfect defence can save health, equipment and medicine costs; a healer can earn through legitimate care in later service systems.

## 6. Clinic, stabilization, long-term recovery and tutorial invariants

**LOCKED clinic rule across all six origins:**
- Exactly the same **examination → upfront price → pay 10 coins once → leave** structure after Stage 6, regardless of win or loss. Ordinary *basic care*, if truly needed, is included in the **one flat 10-coin** introductory charge; a perfectly unhurt character is examined and gets **no bogus bandage or healing**.
- Serious actual injuries receive **condition-appropriate stabilization/basic care under that fixed introductory service**, sufficient to resume ordinary play and return home as the locked onboarding demands. This need not promise full regeneration of Health or instant removal of all serious wounds. **Do not charge a surprise premium**, force a separate quest or leave an incapacitated protagonist unable to reach Stage 8.
- The clinician's preapproved “Needs cleaning. I'll dress it” applies **only** if a real cut/scrape merits dressing. A bruise, injury-free win or serious underlying injury cannot be misrepresented as the same bandage task. No new named doctor/dialogue without separate approval.
- After defeat, the six origin's **previously approved helper/aftermath** permits arrival at normal clinic care. The system should apply the ordinary **Downed → Assisted / Stabilized → Clinic** handoff once, preserving true player defeat, original notes/items, money and narrative history. Never automatically flip a defeat into a win.

**Global treatment outside tutorial is not yet decided:** NPC clinic price bands, successful bandage effects, medical facilities, surgery requirements, recovery duration and treatment consumable quantities are separate economy/balance questions. The tutorial's 10-coin fee is a specific locked introductory service, not a global unlimited emergency surgery rate.

**Anti-softlock check:** critical wound during the starter fight should still pass through honest combat rules, then the fixed clinic service must supply a coherent safe handoff. **Do not simply ban severe wounds from starter enemies as an invisible immunity rule**. Instead tune actual early opponent damage, action timing and available exits, and give already agreed after-defeat assistance.

## 7. Three beginner / low-stakes encounter examples (LOCKED story situations; hypothetical combat inputs)

All numbers and injury outcomes are **illustrative only**; the tutorial does NOT guarantee an attack connects or a wound exists. Fresh fighters generally have **80–100 Stamina**, and **Fatigue/Stress normally begin only when their respective reserves are at or below 20** under Part 8.

### Beginner A — Millhand and Flint: impact versus lasting injury

- Begin **50/50 Health**, well-rested. Flint commits his readable club swing.
- **Outcome 1, genuine effective Guard:** a hypothetical raw club blow 12 becomes **6 net damage** after a compatible test 50% Guard. Player becomes **44/50**; if no actual wound threshold is crossed, the only consequence is Health loss. **No bleeding**. The successful mitigation may award prototype Guard **+8 Momentum**.
- **Outcome 2, meaningful unguarded club hit:** if the blow actually connects for hypothetical **12 Health damage**, the player goes **38/50**; a qualifying blunt strain could cause a *minor* wound but **not automatic bleeding**.
- **Outcome 3, successful tactical Move:** cart blocks the committed contact before resolution; **0 Health damage, 0 wound**. If this leads to victory, Stage 7 says **“No injuries found. No treatment needed.”** and still charges 10 coins once.
- **Why:** no scripted scratch, no meaningless bleed after every club hit; the player learns that Guard and Move can reduce long-term costs.

### Beginner B — Squatter and young injured boar: defeat without character deletion

- Player is **50/50**, unarmed beside broken fence; boar's ordinary charge costs **0 Momentum**, respecting approved encounter rules.
- If Squatter moves clear in time and gives the animal an open route, **boar Withdraw** is the approved **nonlethal player victory**. No player Health loss, wound or forced treatment.
- If an actual charge hits, hypothetical **15 damage** leaves **35/50** and may inflict physical impact/knockback where qualified. A genuine later attack could defeat the player; do **not** force the initial one to do so or guarantee a bleed.
- When the player really loses, the boar leaves past the fallen obstruction and an **unnamed traveller** helps them toward the ordinary clinic. The player is **defeated**, not dead or magically victorious; clinic care follows the same fixed service.
- **Why:** movement/exit remains the objective, and the game is not designed around killing a frightened animal.

### Beginner C — Inkbound and Silas: sharp wound versus medical response

- The Inkbound begins **50/50 Health** with their two already-approved **non-loot personal work notes**. Silas guards the sealed box; no free coal access.
- If Silas legitimately contacts the player's limb with his work hook, a **test-only net 8 Health harm** could leave **42/50**. The **actual strike type and sufficient wound severity** determine if it is only impact, a minor cut or a meaningful arm injury.
- Suppose a specifically qualifying cut causes **Light Bleeding −1 at cleanup**: then one eligible cleanup changes **42 → 41/50**. On a later turn, if an actual held dressing is available, **Use → Apply Dressing** can attempt control; the introductory universal kit **does not secretly contain free medical supplies**, so the sample does not assume one.
- If the Inkbound finishes without any injury, the ordinary 10-coin clinic visit is examination-only. If hurt, basic appropriate care is provided with no added beginner fee. Silas does **not** confiscate the work notes as a combat-loot event.
- **Why:** a wound is a concrete consequence of a qualifying hit; a first-session player is not forced to possess nonexistent bandages.

## 8. Three hypothetical high-end-game worked examples (NOT canon world content)

These are **stress tests only**, not newly confirmed NPCs, combat weapons, clinics, recipes or loot.

### Endgame D — Veteran rifleman with a penetrative limb injury, Grey Marches

- Hypothetical trained combatant starts **70/70 Health** and has legitimate armour. A shot genuinely penetrates an arm for **14 net damage**: **70 → 56/70**. A **serious arm wound** reduces effective Health Ceiling to **60**, resulting in **56/60**, **not 42/60**.
- An actual qualifying bleeding wound produces **Moderate Bleeding −2 Health per round** (trial). After one cleanup: **54/60**. A real field dressing can potentially control bleeding in one action, without erasing arm impairment or instantly changing 60 back to 70.
- An unattended 2-point bleed in a long confrontation is costly. A damaged arm changes rifle handling, while current Health may be restored later **only to the current ceiling** until proper underlying care.
- **Decision:** spend a vulnerable action treating the wound, move behind cover to treat later, or risk more health loss to finish the encounter.

### Endgame E — Two pursuers around industrial machinery, critical injury and ally care

- Hypothetical exposed fighter suffers a sufficiently serious actual penetrative wound and receives **Severe Bleeding −3 per cleanup** (trial), in addition to direct attack damage. Steam hazards have their own category and do not automatically cause bleeding.
- With **9 Health remaining**, three unresolved normal cleanup ticks at −3 would bring Health **9 → 6 → 3 → 0** if nothing changes. **At 0 the actor becomes Downed**; this is not silently permanent death.
- An ally can spend their **one Use action** and actual suitable supplies to help control the bleed if timing permits; neither ally gets a free attack in that round. An NPC enemy follows the same action economy.
- If the group withdraws and leaves an incapacitated ally, extraction/rescue policy and wilderness consequences remain **separate open decisions**—the engine must not teleport everyone home for free.
- **Decision:** finish the enemy faster, devote a turn and supplies to the bleeding actor, or attempt a coordinated withdrawal before incapacitation.

### Endgame F — Wounded melee veteran versus scattergun specialist, staged treatment

- Veteran begins a **consecutive fight**, carrying actual **Fatigue**, low Stamina and a serious leg wound. There is one Health pool but the leg wound affects real movement and may lower Health Ceiling.
- The scattergun opponent commits a shot. The veteran can **Move** toward legal cover, **Guard** if applicable, or **Use** a real dressing if active bleeding threatens the next cleanup. Ordinary barehanded Guard doesn't universally stop a projectile.
- Dressing can produce **Bleeding: Controlled**, but cannot repair the leg or negate gunshot Health damage already suffered. **Recover → Catch Breath** helps Stamina, **Recover → Steady Nerves** helps Composure, and neither is medical healing or an instant Fatigue/Stress cure.
- A later professional treatment and recovery period may restore the injured leg's function and raise effective Health Ceiling; specific duration, pricing and medical skill gates remain unapproved.
- **Decision:** one injury can influence position, available attacks, escape prospects, medicine spending and future readiness without requiring separate body-part Health bars.

## 9. QA, exploitation and server implementation checks

1. **No forced first/second hit or wound**, no hidden tutorial bleed to justify clinic pricing, no auto-danger when the player wins untouched.
2. **Part 6 collision/damage before injury**; a real hit may cause Health loss but no wound; no independent guaranteed critical from choosing Head or Limbs.
3. **Correct single cleanup bleed tick** even if status applied mid-round, multi-pellet hit or repeated client reconnect; do not duplicate ticks or award Momentum from bleed ticks.
4. **No infinite simultaneous bleed stacks**. One visible bleeding condition with bounded severity can reflect multiple wounds; upgrading wound severity requires an actual qualifying incident.
5. **No Health Ceiling double damage**. Applying injury ceiling affects maximum, without re-subtracting already recorded direct damage.
6. **Real treatment resources**: no bandage unless held, purchased or supplied by an actual service. A basic bandage should not require advanced Surgery level; specialist work should.
7. **No free Use + Attack combo**: both treatment and attacking use a full selected combat action; interruption and Action Timing apply normally.
8. **No self-resurrection from 0 Health by clicking Recover**; genuine downed/assistance rules apply. No permanent death mechanics created without separate user approval.
9. **Bleeding persistence:** server owns condition, once-only ticks, offline timing policy and encounter progression. Reloading/closing the browser never cures or re-rolls an injury.
10. **Starter defeat remains a true defeat** and enters the correct assistance → 10-coin clinic → shared Stage 8 path, without taking currency, inventing loot or abandoning an incapacitated player.
11. **Starter unhurt check** still prints the exact approved no-wound message, charges 10 once, restores no nonexistent Health and adds no fake dressing.
12. **Medical care and player skill** use canonical Medicine → Trauma (first aid) and Medicine → Surgery (specialist work). No new arbitrary medical subskills or high-tier mandatory beginner gates.
13. **No instant heal-to-full through bandages, herbs, or an “emergency patch” technique**, and no infinite healing from alternating Recover / Use without legitimate consumable costs.
14. **No unavoidable after-battle death** merely because the server converts an active combat bleed into unbounded browser-offline wall-clock ticks. World time conversions and rescue outcomes must be deliberately defined.
15. **Balance telemetry:** frequency of minor/serious/critical wounds by zone and damage type; number of bleed ticks before control/downed; bandage usage, success by Trauma skill; clinic costs relative to activity profit; wound recovery duration; early survival after nonlethal defeat; whether late-game injuries cause tedious prolonged downtime.
16. **Idempotent transactional state:** persist combat action, seeded RNG, current Health, effective cap, wound updates, bleed process key, item consumption, downed/outcome and clinic payment. Retry/disconnect cannot duplicate wounds/ticks, restore a used dressing or charge 10 again.

## 10. Approved design principles and remaining open questions

**APPROVED A.** Use **impact-only, minor, serious and critical** result bands, with wounds qualifying from actual post-protection/Guard impacts rather than from an additional universal wound die.

**APPROVED B.** Use **one aggregate active Bleeding status per actor**, with clearly stated severity and **one tick during each round's cleanup**. **Test-only** Light/Moderate/Severe bleed harm of −1/−2/−3 Health per cleanup, not final balance. Controlled bleeding doesn't instantly recur without a new actual event.

**APPROVED C.** **0 current Health means Downed / unable to act, not automatically permanently dead**. A valid defeat remains defeat; human surrender/animal withdrawal can also produce win/loss without Health 0. Permanent death, revive/respawn, gear loss and wilderness extraction policy should be approved separately.

**APPROVED D.** Treatment has **three separate operations**: control ongoing bleeding, restore current Health (to actual effective cap), and resolve lasting injury/recover cap. In combat, **Use** consumes one action and real supplies. **Medicine → Trauma** aids field care; difficult procedures fit **Surgery** and facilities, not a seventh Combat Medic skill.

**APPROVED E (CONFIRMATION OF PRIOR CANON).** Locked introductory clinic remains 10 coins for exam/basic care as needed, with actual injury-appropriate treatment and uninjured examination-only outcome, and an honest playable handoff from any real defeat. Non-tutorial NPC clinic costs and all healing times remain OPEN.

**APPROVED WORK BOUNDARY F.** Decide later whether/how lethal wilderness and future PvP defeat differ, and how active bleeding interacts with real world time and disconnections; no secretly invented death or permadeath system now.

**Next:** proceed to [Part 10 — Combat Integration and Runnable Prototype Contract](combat-integration-and-prototype-contract.md), with an accompanying isolated runnable proof-of-concept. This is not yet a production browser MMO. A narrow **Combat Integration / Runnable Vertical Slice** contract (server-authoritative state machine, event log, actual three tutorial encounter fixtures and comprehensive automated tests) before expanding into a large catalog of weapon techniques or items. Any later weapon-family and medical recipe work must use the approved combat rules and remain data-driven.

**Related:** [Character](../../01-player/character-system.md), [Part 6 damage architecture](damage-protection-injuries-proposal.md), [Part 8 reserve and condition rules](stamina-fatigue-composure-stress-focus-proposal.md), [Medicine skills](../../01-player/skills-progression.md), [Onboarding clinic](../onboarding/shared-clinic-examination-policy.md), [Stitcher Trauma job](../onboarding/stitcher/morning-dressings-interaction.md), [Medicinal herbs](../../03-resources/raw/herbs-and-harvesting.md).

**Approval note, 2026-10-20:** The user approved Part 9. Bleed tick **−1/−2/−3**, exact severity thresholds, treatment timing, injury recovery duration, death/respawn, wilderness extraction and pricing beyond the fixed introductory 10-coin service are still **open balance and policy**. The approval does not imply any code is production-ready.
