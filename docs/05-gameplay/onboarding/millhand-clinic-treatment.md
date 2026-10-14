# Millhand — Stage 7: The Clinic Visit

**STATUS: PROPOSED INTERACTION AND DIALOGUE FOR USER REVIEW (2026-10-15).** The **10-coin treatment**, access after **victory or defeat**, use of a **normal reusable city health service**, no tutorial combat rewards, and subsequent return to the **same** shared starter home with **10 coins** are already LOCKED. The clinic's specific flow, role-labelled clinician's dialogue and visible status panels are proposed. Neither a new named clinic nor a new permanent NPC is established. Medical Health/injury details remain TBD; do not simulate a fictional health system merely to complete this scene.

## What currently needs editing from the earlier sketch

The Millhand master currently says **“Inspect condition”** and **“Choose/confirm a basic patch-up”** without a playable interaction or spoken exchange. Those are **interface requirements, not dialogue**, and they do not say what a player actually reads or decides. The earlier generic suggestion of a “small, working-class city infirmary” must not become an invented proper place name. There is also an unresolved issue if the player wins without an injury: **do not inflict a hidden unavoidable wound** just to make the mandatory visit seem useful. Medical service and combat design must later settle this honestly.

## Entry conditions and two arrival paths (LOCKED direction)

- If the Millhand **defeated Flint**, he backs off; player can reach a city care provider through the ordinary travel/service interface.
- If **Flint defeated the Millhand**, anonymous workers interrupted and a role-labelled passerby assisted the injured character to care. Do not call it a victory, spawn police, invent a named healer or strand the character.
- In both, the player still has **20 coins**; no starting currency has been confiscated or rewarded. The player's original Basic Clothes and Crude Small Bag are intact.
- The fight outcome **stays recorded** for future Flint-specific dialogue should a later quest include him; the clinician does not need to mention Flint or know that history.
- This **is not** the rent-reveal scene. No rental demand is posted or explained before the later home scene.

## Proposed service flow — reusable for future city clinic visits

### M01 — Condition view

The player opens the regular **Care / Treatment** interface and sees:

- Current Health and Health maximum (the character's **base starting maximum is 50**, but the *effective ceiling may differ if a genuine injury changes it*; do not invent a reduction for this scripted visit).
- Actual current injuries/conditions, if any, expressed as a readable status (wound location or a generic descriptor if the future injury engine does not track body regions).
- Clinic service available: **Basic treatment / patch-up**.
- Upfront price for *this tutorial instance*: **10 coins**.
- Expected service outcome: removes or improves a minor treatable condition and/or restores Health as the future Health system actually supports. **Never promise “Fully restored” unless the actual treatment rules support it.**

**UI actions:** **[Examine condition]** and **[Speak to clinician]**. Do not require special Medicine/Trauma skill or equipment to buy NPC treatment.

### M02 — Clinician dialogue (NEW, PROPOSED)

*The clinician looks over the injury.*

**CLINICIAN:** “Sit down. Let me see.”

*After the examination:*

**CLINICIAN:** “I can dress that. Ten coins.”

**PLAYER:** “I've only got twenty.”

**CLINICIAN:** “Then you've enough.”

*The player is offered the priced service.*

**[Pay 10 coins for treatment]**

The exchange is plain and slightly uncomfortable because the price consumes **half the player's money**, not because the clinician makes an industrial joke. The clinician is neither theatrical nor unreasonably cruel. There is **no additional quirky line after payment**.

**Conditional spoken-detail guardrail:** “I can dress that” is appropriate for a visible scrape/cut. If the future combat outcome is bruising, strain or another condition not treated with a dressing, the clinician must use an accurate symptom-specific line instead—**do not pretend every possible wound needs a bandage**. A concrete conditional line is not approved until an actual injury family exists.

### M03 — Confirm ordinary paid treatment

- The player explicitly confirms the **10-coin cost**. Avoid a stealth charge or second fee. This is a routine service interaction, **not** a separate Medicine job granting XP.
- The clinician performs only the work corresponding to the displayed condition and treatment, then the game updates Health/injury consistently with the eventual medical system. Recovery must be sufficient to resume normal play and travel home.
- **Coins before:** 20. **Clinic fee:** 10. **Coins after:** 10.
- **No loot, skill increase, ordinary XP, consumable item gift, future debt, charity coupon or injury-specific additional charge.**
- **[Leave the clinic]** transitions into normal city movement; then the character returns to the same common starter home. The rent notice is **not** shown at the clinic.

## A real design edge case — a player who takes zero damage

The shared tutorial requires a clinic visit and 10-coin payment. Stage 6 also forbids secretly hurting a perfectly played character. Both principles stand; **we do not resolve them by inventing damage or quietly changing the clinic's fee.**

Before implementing combat, pick one transparent world-consistent reason for every possible outcome to have a paid treatment or examination, or adjust how the fight is designed so an authentic treatable condition arises under normal rules. Examples of *directions for later review*, **NOT decisions**:
- The encounter can cause a **visible legitimate condition from an actual supported action** (e.g., guarding a hard club strike has a known physical cost) even without losing Health; the player sees it happen and may avoid/mitigate it through real combat rules. **No forced invisible bruise.**
- A genuine assessment/medical service may be justified if it has a real in-game medical purpose, though **charging 10 coins merely to look at a perfectly healthy character risks feeling punitive**. Do not use this as a story workaround without user approval.

The exact zero-damage exception remains **OPEN** until a shared combat/injury design establishes it. No claims about fixed restorative Health numbers or injury prevalence should be treated as canon.

## Role and asset scope

- **Clinician / Clinic Attendant** is a **role label**, not a newly named recurring NPC. Gender, costume, provider name, neighborhood and clinic's exact building remain TBD. The scripted dialogue must work without inventing these.
- Use the same underlying clinic service system for all starting backgrounds with appropriate injury-specific text where justified. **All six share the locked 10-coin tutorial care amount**, even though their fights and entering conditions differ.
- **World time** runs during treatment and interactions under existing job/time rules. Actual service time TBD; do not force a late mandatory checkpoint.

## Persistence / handoff constraints

- Once the **10-coin tutorial treatment** has been paid and resolved, mark the care step completed. Server must not allow page reload to charge again for the scripted service.
- Save the actual Health/injury result, spending of 10 coins and current balance 10 coins.
- Advance Millhand onboarding to **Stage 8 — Return Home / provisional 150-coin rent notice**, which is not drafted here.
- Maintain Flint combat outcome as an independent persistent story fact; do not erase it when care is completed.

## Approval requested

Approve the **examine → speak → quoted cost → pay once → medical result → leave** flow and the **short clinician conversation**. Exact appearance/name of clinic, medical effects, treatment duration, and the perfect-no-damage encounter edge case remain unresolved pending later global system design.

Related: [approved Flint fight](millhand-flint-fight.md), [Millhand tutorial](millhand.md), [common tutorials](shared-structure.md), [character Health](../../01-player/character-system.md), [game-wide dialogue standard](../interactions/dialogue-style-guide.md).
