# Millhand — Stage 7: The Clinic Visit (APPROVED)

**STATUS: CLINIC INTERACTION AND DIALOGUE APPROVED / LOCKED (2026-10-15).** The user approved the reusable **examine → speak → see price → pay 10 coins once → treat → leave** flow and the exact short clinician conversation, with injury-appropriate wording when the actual wound type is known. Both fight outcomes access the care service; the character returns to the **same** shared starter home with **10 coins**. No new named clinic or permanent NPC has been established. **Health/injury numbers, exact medical effects and the perfect-no-damage case remain TBD**; do not invent damage or a healing system to force a scene.

## What currently needs editing from the earlier sketch

The Millhand master currently says **“Inspect condition”** and **“Choose/confirm a basic patch-up”** without a playable interaction or spoken exchange. Those are **interface requirements, not dialogue**, and they do not say what a player actually reads or decides. The earlier generic suggestion of a “small, working-class city infirmary” must not become an invented proper place name. There is also an unresolved issue if the player wins without an injury: **do not inflict a hidden unavoidable wound** just to make the mandatory visit seem useful. Medical service and combat design must later settle this honestly.

## Entry conditions and two arrival paths (LOCKED direction)

- If the Millhand **defeated Flint**, he backs off; player can reach a city care provider through the ordinary travel/service interface.
- If **Flint defeated the Millhand**, anonymous workers interrupted and a role-labelled passerby assisted the injured character to care. Do not call it a victory, spawn police, invent a named healer or strand the character.
- In both, the player still has **20 coins**; no starting currency has been confiscated or rewarded. The player's original Basic Clothes and Crude Small Bag are intact.
- The fight outcome **stays recorded** for future Flint-specific dialogue should a later quest include him; the clinician does not need to mention Flint or know that history.
- This **is not** the rent-reveal scene. No rental demand is posted or explained before the later home scene.

## Approved service flow — reusable for future city clinic visits (details TBD)

### M01 — Condition view

The player opens the regular **Care / Treatment** interface and sees:

- Current Health and Health maximum (the character's **base starting maximum is 50**, but the *effective ceiling may differ if a genuine injury changes it*; do not invent a reduction for this scripted visit).
- Actual current injuries/conditions, if any, expressed as a readable status (wound location or a generic descriptor if the future injury engine does not track body regions).
- Clinic service available: **Basic treatment / patch-up**.
- Upfront price for *this tutorial instance*: **10 coins**.
- Expected service outcome: removes or improves a minor treatable condition and/or restores Health as the future Health system actually supports. **Never promise “Fully restored” unless the actual treatment rules support it.**

**UI actions:** **[Examine condition]** and **[Speak to clinician]**. Do not require special Medicine/Trauma skill or equipment to buy NPC treatment.

### M02 — Clinician dialogue (LOCKED; wording conditional on wound type)

*The clinician looks over the injury.*

**CLINICIAN:** “Sit. Let me see.”

*After the examination:*

**CLINICIAN:** “Needs cleaning. I'll dress it.”

**PLAYER:** “How much?”

**CLINICIAN:** “Ten coins.”

**PLAYER:** “Ten?”

**CLINICIAN:** “That includes the dressing.”

*The player is offered the priced service.*

**[Pay 10 coins for treatment]**

The exchange is practical: the bill includes the dressing, but **10 coins is half the player's remaining money**. The clinician answers the small objection without apology or a punchline. Don't add a wry afterthought once payment is complete.

**Conditional spoken-detail guardrail:** “Needs cleaning. I'll dress it” is appropriate for a visible scrape/cut. If the future combat outcome is bruising, strain or another condition not treated with a dressing, the clinician must use an accurate symptom-specific line instead—**do not pretend every possible wound needs a bandage**. A concrete conditional line is not approved until an actual injury family exists.

### M03 — Confirm ordinary paid treatment

- The player explicitly confirms the **10-coin cost**. Avoid a stealth charge or second fee. This is a routine service interaction, **not** a separate Medicine job granting XP.
- The clinician performs only the work corresponding to the displayed condition and treatment, then the game updates Health/injury consistently with the eventual medical system. Recovery must be sufficient to resume normal play and travel home.
- **Coins before:** 20. **Clinic fee:** 10. **Coins after:** 10.
- **No loot, skill increase, ordinary XP, consumable item gift, future debt, charity coupon or injury-specific additional charge.**
- **[Leave the clinic]** transitions into normal city movement; then the character returns to the same common starter home. The rent notice is **not** shown at the clinic.

## Unhurt victory — resolved for all six backgrounds (LOCKED 2026-10-19)

The user chose **ordinary combat without any guaranteed hit**, followed by the regular **10-coin examination whether hurt or unhurt**. If the Millhand has full Health and no wound, the clinician confirms **“No injuries found. No treatment needed.”** through the shared UI; no dressing or healing is performed. The approved **“Needs cleaning. I'll dress it.”** line plays **only** if an actual treatable cut/scrape exists. Unhurt and other injury types must not trigger that line. The service still charges exactly 10 coins once. See the [common clinic policy](../shared-clinic-examination-policy.md).

## Role and asset scope

- **Clinician / Clinic Attendant** is a **role label**, not a newly named recurring NPC. Gender, costume, provider name, neighborhood and clinic's exact building remain TBD. The scripted dialogue must work without inventing these.
- Use the same underlying clinic service system for all starting backgrounds with appropriate injury-specific text where justified. **All six share the locked 10-coin tutorial care amount**, even though their fights and entering conditions differ.
- **World time** runs during treatment and interactions under existing job/time rules. Actual service time TBD; do not force a late mandatory checkpoint.

## Persistence / handoff constraints

- Once the **10-coin tutorial treatment** has been paid and resolved, mark the care step completed. Server must not allow page reload to charge again for the scripted service.
- Save the actual Health/injury result, spending of 10 coins and current balance 10 coins.
- Advance Millhand onboarding to **Stage 8 — Return Home / provisional 150-coin rent notice**, which is not drafted here.
- Maintain Flint combat outcome as an independent persistent story fact; do not erase it when care is completed.

## Approval boundary

**LOCKED:** examine → speak → priced 10-coin treatment → pay once → treatment result → leave; exact dialogue shown for an injury that needs cleaning/dressing; no added clinician name or persistent loot; preserve the win/lose Flint outcome. **TBD:** injury-specific alternative lines, clinic appearance/name, precise medical effects/duration, and an honest handling of a perfect uninjured combat result under the future common combat/injury system.

Related: [approved Flint fight](flint-fight.md), [Millhand tutorial](README.md), [common tutorials](../shared-structure.md), [character Health](../../../01-player/character-system.md), [game-wide dialogue standard](../../interactions/dialogue-style-guide.md).

**Shared Stage 7 policy LOCKED 2026-10-19:** All six clinics use a 10-coin post-fight examination with injury-appropriate basic care only when genuinely needed. No guaranteed attack hit, compulsory wound, needless treatment, second charge or special origin reward. See [central policy](../shared-clinic-examination-policy.md).
