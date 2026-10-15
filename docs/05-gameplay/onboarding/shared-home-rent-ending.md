# Shared Stage 8 — Return Home and Rent Notice (LOCKED FOR ALL SIX)

**Status: COMMON ONBOARDING SCENE APPROVED / LOCKED (2026-10-15).** The universal home and rent structure were already locked in [shared-structure.md](shared-structure.md) and the user explicitly confirmed that **the rent notice must be the same for every background, without separate invented variations**. This is the single canonical source for Stage 8's reusable housing scene. Do **not** create six independent rent notices, different amounts, housing locations or equivalent reskins.

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

The rent panel closes and onboarding is marked complete **once**. The player remains in the ordinary shared rented home with free access to recurring paid work, crafting/trading and normal city travel. There is **no** forced follow-up job, extra landlord conversation or new main-story quest. The notice is not collectible loot.

## Dialogues are not separate rent notices

The **rent notice, housing, location, read/put-down actions and completion rules never vary**. Only the following *already individually approved* origin-specific **post-notice character remarks** exist and remain untouched:

- [Millhand Stage 8](millhand/home-rent-ending.md) — the previously approved self-directed line about earning money from jobs or selling crafted goods after putting down the same notice.
- [Bellrunner Stage 8](bellrunner/home-rent-ending.md) — the previously approved self-directed line about unpaid courier work and checking Hector's board, after putting down the same notice.

These lines are background-character dialogue **outside the rent notice** and do not change any shared rent fact or control. They are existing user approvals, not a license to devise a special closing monologue for every future origin.

**Squatter:** **no new Squatter-specific rent dialogue or origin-only housing event.** Enter home, read this same notice, put it down, finish the Squatter tutorial. Apply the same reuse policy to Stitcher, Scrapper and Inkbound unless the user later explicitly approves a distinct character line. Avoid redundant `home-rent-ending.md` copies within their folders.

## Completion and persistence

- Mark completion only after reading/dismissing the common notice, once. Save it atomically; a restart does not replay it, re-charge for medical care or reissue skill rewards.
- Preserve the **specific branch choice/second Major Skill +1**, the one localized story finding, whether Benny was told (Squatter only, if applicable), and the distinct encounter victory/defeat result for the current background. None of these change rent or the home.
- First and second scripted jobs and the introductory fight award **zero wages, ordinary XP or loot**. No reward or equipment is added at Stage 8. Normal repeatable work afterward follows normal rewards.
- This is closure of the personal starting incident, not a resolution of the poorhouse, closed night-shift site or overarching storyline.
- The cross-background unresolved **perfect-no-damage clinic visit** is still an open shared Health-system question and cannot be fixed by creating a compulsory wound at home.

## QA: compare across six origins

All six should reference the **same home identifier, room/storage implementation, rent amount source, notice content, generic player prompts, absence of deadline/payment and completion logic**. Only the background's already approved dialogue and prior journal findings can differ. The notice itself never does.

Related: [shared onboarding rules](shared-structure.md), [Squatter approved clinic](squatter/clinic-treatment.md), [Millhand Stage 8](millhand/home-rent-ending.md), [Bellrunner Stage 8](bellrunner/home-rent-ending.md), [onboarding index](README.md).
