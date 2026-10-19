# Shared Stage 8 — Return Home and Rent Notice (LOCKED FOR ALL SIX)

**Status: COMMON ONBOARDING SCENE AND EXACT SHARED CLOSING SPEECH APPROVED / LOCKED (2026-10-15).** The universal home and rent structure were already locked in [shared-structure.md](shared-structure.md); the user explicitly confirmed that **both the rent notice and the Millhand closing line are identical for all six backgrounds, without origin-specific variations**. This is the single canonical source for Stage 8's reusable housing scene. Do **not** create six independent rent notices, different amounts, housing locations or equivalent reskins.

## One scene, every origin

**Entry conditions:** the selected background's Stage 6 outcome (victory or defeat) has been recorded and the common 10-coin Stage 7 clinic service has been resolved once. The character returns to the **same starter rented home** through normal city travel. World time still follows the standard jobs/travel rules.

**[Enter home]**

*There is a rent notice waiting at home.*

**[Read the rent notice]**

> **RENT**
>
> **150 coins owing.**

This is the **identical in-world notice** regardless of background. The amount is **PROVISIONAL** pending rent-system design; use a shared data-driven rent amount rather than copying this figure into six separate scripts. No landlord name or signature, due date, collection hour, municipal seal, threat, eviction countdown or automatic rent payment is written into it.

**Separate ordinary UI, not printed on the paper:**

- Balance after the 10-coin tutorial clinic fee: **10 coins**.
- Provisional rent: **150 coins**.
- Amount still needed: **140 coins**.
- Actual rent frequency, due date, penalty, payment mechanics, landlord identity and housing upgrade system: **TBD**. Do not invent them in an origin ending.

**[Put the notice down]**

*The character puts the notice down.*

**PLAYER (quietly, to themselves):** “Ah, hell. Need a place of my own. First I've got this rent to pay. More jobs... or I could make something to sell.”

**This exact spoken line is now LOCKED for ALL SIX backgrounds by the user's explicit 2026-10-15 direction.** It is the previously approved Millhand line, reused verbatim for Bellrunner, Squatter, Stitcher, Scrapper and Inkbound; no origin-specific substitutions, inserted names or rephrasings. A female or male portrait uses the same gender-neutral player voice label. This suggests ordinary paid work or making goods to sell; **it does not establish a home-ownership feature or a new mandatory quest.**

Immediately after the line, the rent panel closes and onboarding is marked complete **once**. The player remains in the ordinary shared rented home with free access to recurring paid work, crafting/trading and normal city travel. There is **no** forced follow-up job, extra landlord conversation or new main-story quest. The notice is not collectible loot.

## Exactly one closing speech for every origin

The rent notice, housing, location, read/put-down actions, completion rules **and player's spoken closing line are identical** for all six backgrounds. The identical line from the [previously approved Millhand home ending](millhand/home-rent-ending.md) is canonical in this one common scene.

The user explicitly **superseded Bellrunner's earlier Hector-specific self-talk** and the prior decision to omit Squatter-specific self-talk. No alternative Stage 8 speech should be created for Stitcher, Scrapper or Inkbound. Each origin may still have its own **quest-journal summary and branch/fight history**, but these must not enter or change the rent scene.

Use this shared scene rather than producing six copied home/rent scripts.

## Completion and persistence

- Mark completion only after reading/dismissing the common notice, once. Save it atomically; a restart does not replay it, re-charge for medical care or reissue skill rewards.
- Preserve the **specific branch choice/second Major Skill +1**, the one localized story finding, whether Benny was told (Squatter only, if applicable), and the distinct encounter victory/defeat result for the current background. None of these change rent or the home.
- First and second scripted jobs and the introductory fight award **zero wages, ordinary XP or loot**. No reward or equipment is added at Stage 8. Normal repeatable work afterward follows normal rewards.
- This is closure of the personal starting incident, not a resolution of the poorhouse, closed night-shift site or overarching storyline.
- **Clinic rule LOCKED 2026-10-19:** [The shared clinic examination](shared-clinic-examination-policy.md) costs 10 coins whether injured or unhurt. When unhurt, the clinician examines the character without giving unnecessary treatment. No injury is created at combat or at home to justify the fee.

## QA: compare across six origins

All six should reference the **same home identifier, room/storage implementation, rent amount source, notice content, generic player prompts, absence of deadline/payment and completion logic**. Only the background's earlier quest-journal findings may differ; **the closing speech does not**. Neither the notice nor its narration changes by origin.

Related: [shared onboarding rules](shared-structure.md), [Squatter approved clinic](squatter/clinic-treatment.md), [Millhand Stage 8](millhand/home-rent-ending.md), [Bellrunner Stage 8](bellrunner/home-rent-ending.md), [onboarding index](README.md).
