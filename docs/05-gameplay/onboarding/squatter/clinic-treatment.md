# Squatter — Stage 7: Clinic After the Boar (APPROVED)

**Status: APPROVED AND LOCKED (2026-10-15).** The user approved the exact clinician dialogue, examination and ordinary single-payment service flow following either outcome of the [approved Stage 6 injured-boar encounter](boar-fight.md). The existing [shared clinic](../shared-structure.md), previously approved [Millhand](../millhand/clinic-treatment.md) and [Bellrunner](../bellrunner/clinic-treatment.md) visits establish the universal 10-coin fee, ordinary treatment panel and same later home. Do not invent an exclusive Squatter clinic.

## S07-A — Enter for an examination

- **Player victory:** the boar leaves, the route to the city gate becomes passable, and the Squatter reaches the clinic through ordinary travel.
- **Player defeat:** the boar knocks the Squatter down, limps away once its path is open, and an unnamed traveller helps the injured player toward the clinic. The scene must still record that the player **lost** the fight.
- Both outcomes preserve the real Health/injury state, personal bag, clothes, remaining starter coins and the chosen Stage 4 discovery. The player has **20 coins before paying** for the standard tutorial care; the boar neither drops a prize nor steals anything.

The provider is a **role-labelled clinician** using the same medical service system as other origins; do not invent a new name, building or special treatment skill because the Squatter once collected herbs.

## S07-B — Approved spoken dialogue

*The clinician glances up as the Squatter comes inside.*

**CLINICIAN:** “What happened to you?”

**PLAYER:** “Ran into a wild boar by the drainage bank. Young one, but it wasn't pleased to see me.”

**CLINICIAN:** “A wild boar? Sit here. Let's see how you came out of it.”

**[Examine condition]** — show the actual current Health and real fight injuries or conditions, if any. A scrape, cut, bruise or other problem must be supported by the combat outcome; a character who avoided all contact should **not** be assigned an invisible tusk wound.

*After the clinician has examined the player, the service screen shows what care—if any—is appropriate.*

**PLAYER:** “What's it going to cost?”

**CLINICIAN:** “Ten coins. That covers looking you over and the ordinary treatment.”

**PLAYER:** “All right.”

**[Pay 10 coins and accept care]** — clearly display the service outcome before confirmation. One payment only; the common medical rules resolve what actually improves. Do not claim an injury was cleaned/dressed unless one exists and the defined treatment calls for it.

**[Leave the clinic]** — resume ordinary city travel to the shared starter rented home, where Stage 8 will reveal the common provisional rent notice.

## Keep the medical condition truthful

A **defeat** may involve an actual wound from the animal, and an affected player can receive basic treatment under the later injury rules. A **victory** might still include injury from an exchange; neither label by itself establishes which wound exists.

Likewise, a flawless victory may cause **no injury at all**. The user has **LOCKED the shared examination-only case (2026-10-19)**: an unhurt Squatter receives a normal check, sees **“No injuries found. No treatment needed.”**, pays 10 coins once and receives no fabricated wound, bandage or healing. A genuinely injured Squatter receives appropriate basic care included in that 10-coin fee. [Common policy](../shared-clinic-examination-policy.md).

The clinician need not know about the buried bone, source-held herbs or Benny's philosophy. Don't insert a speech about the poorhouse or make this clinic conversation secretly another Herbalism job. If the player previously chose Medicine/Herbalism, that does not give free treatment, extra skill gains or an alternative paid fee.

## Minimal gameplay and persistence

1. Arrive through either approved-in-principle Stage 6 outcome.
2. **[Examine condition]** displays actual Health, conditions, priced care and effects supported by the global system.
3. **[Speak to clinician]** presents the short proposed exchange; the dialogue never assumes victory/defeat beyond “ran into a boar”.
4. **[Pay 10 coins and accept care]** confirms a single standard service charge. With no other permitted tutorial spending, coins move from **20 to 10**. Recovery/condition changes remain system-defined; do not invent numerical healing.
5. **[Leave the clinic]** returns the player to ordinary movement and starts the shared Stage 8 return-home/rent sequence. No rent notice at the clinic.

Save the clinic-complete flag and debit atomically; a reload cannot charge another 10 coins or replay the animal incident. Persist which Stage 4 route was completed, whether Benny was optionally told about the contaminated edge, and whether the boar encounter ended in victory or defeat.

## Approval boundary

**Already locked:** common medical service, price, no extra coins/XP/loot, same home and rent progression, no hidden injury, ordinary clinic role label and real treatment when needed.

**Approved in Stage 7:** exact dialogue, examination wording, the single pay-and-care interaction in this Squatter scene and the outcome-aware but non-branching arrival. Preserve the spoken lines verbatim unless revised by the user.

**TBD:** actual wound categories, severity, injury-specific treatment outcomes and service timing. **Examination-only handling when unhurt is LOCKED** by the shared policy. No additional wildlife-disease or infection system is established here.

Related: [Stage 6 boar fight](boar-fight.md), [Squatter overview](README.md), [shared clinic](../shared-structure.md), [Millhand care reference](../millhand/clinic-treatment.md), [Bellrunner care reference](../bellrunner/clinic-treatment.md).

**Shared Stage 7 policy LOCKED 2026-10-19:** All six clinics use a 10-coin post-fight examination with injury-appropriate basic care only when genuinely needed. No guaranteed attack hit, compulsory wound, needless treatment, second charge or special origin reward. See [central policy](../shared-clinic-examination-policy.md).
