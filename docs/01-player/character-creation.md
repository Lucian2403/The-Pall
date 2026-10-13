# Character Creation — Phase One

Status: Partially agreed, updated 2026-10-13. Explicitly locked decisions are separated from still-proposed content.

## Agreed fields

- Character name.
- **Twelve fixed, stylized 2D starting portraits:** one **male** and one **female** portrait for each of the six backgrounds. Character creation selects name, sex (Male / Female) and background; it does **not** provide a modular portrait editor. Background bonuses and tutorial gameplay are identical for male and female characters.
- Six **locked** background/origin names and social roles. Every chosen background grants **+3 levels in its associated Major Skill at character creation**, and provides **one small background-related tutorial quest**. Unique starter items are not required or defined yet.
- **All attributes fixed at STR 5, DEX 5, INT 5, RES 5 for every background.** No point distribution or background-based attribute changes (LOCKED).
- No age selection.
- **Global starter kit (LOCKED for all six backgrounds): Basic Clothes + 1 Crude Small Bag + 20 coins.** These are the same for male and female characters and for every background. Exact item IDs, mass/capacity and condition values remain TBD.
- **Every short background tutorial ends by revealing rent coming due, introducing shared immediate economic pressure, NOT initiating the game's overarching main storyline.** The tutorial introduces the **player** to the lore through the character's existing life; the character is not an amnesiac receiving an introductory history lesson. Rent amounts, payment deadline, penalties and housing rules remain TBD.

## Portrait system — locked starter implementation

- Exactly **twelve predefined stylized 2D portraits** at character creation: **male and female** versions of Millhand, Bellrunner, Squatter, Stitcher, Scrapper and Inkbound. The corresponding portrait is determined by background plus sex.
- No initial choice of face, body silhouette, eyes, hairstyle, facial hair, skin tone, clothing top or outerwear beyond choosing Male or Female and a background. Previously discussed modular creator asset counts are **superseded as first playable requirements**.
- **Equipped gameplay items visibly alter the portrait.** Only items/garments that the equipment system genuinely equips should produce such overlays; cosmetic-only accessories are not added to creation.
- **A barber in Grand Cylinder City** becomes available around mid-game, perhaps slightly earlier (precise access gate TBD). For a small fee of a couple of coins (exact amount TBD), the barber changes **hairstyle, beard/facial hair where applicable, and hair/facial-hair colour** on both male and female portraits. No face, sex, background, body or skin-tone editing is approved. The barber is not part of the opening character creator.
- Keep portrait assets compatible with future barber variations and equipment overlays, even though the first twelve portraits are hardcoded. The portrait may therefore have internal rendering layers without exposing a modular creation UI.

**Visual direction:** distinctive, nonrealistic, simplified 2D industrial illustration; muted palette, graphic shadows, consistent alignment and recognizable backgrounds. AI may assist in making assets, but normalization and equipment-layer compatibility are needed. Exact art canvas dimensions and layer architecture remain technical proposals, not newly locked design constraints.

## Six backgrounds — agreed skills and tutorial scope

**LOCKED (2026-10-13):** six names and social origins; four attributes fixed at 5; +3 levels to exactly **one Major Skill** associated with the chosen background; one short background-related introductory tutorial quest.

| Background | Where they come from | Starting Major Skill bonus | Brief tutorial idea (proposed, not yet detailed) |
| --- | --- | --- | --- |
| **Millhand** | Foundry and workshop labor | **Craftsmanship +3** | [Noisy workshop, Smithing foreman and tutorial](../05-gameplay/onboarding/millhand.md); narrative under review |
| **Bellrunner** | City messengers and shift couriers | **Industry +3** | [The Wrong Bell](../05-gameplay/onboarding/bellrunner.md): Dispatch House, Shift Dispatch, three follow-on jobs and Shift Marshal's dogman opponent locked |
| **Squatter** | Families at the protected outskirts | **Fieldcraft +3** | [Hedge Shelter / Herb Dealer / Yarrow Cut / The Warm Patch](../05-gameplay/onboarding/squatter.md) and three second-job branches, injured boar combat and rent-at-home sequence locked |
| **Stitcher** | Clinic attendants and informal caregivers | **Medicine +3** | [Cinder Row Infirmary / Matron / Morning Dressings / The Teaching Bed](../05-gameplay/onboarding/stitcher.md) with three second jobs, Night Porter encounter and home/rent ending locked |
| **Scrapper** | Scrap-yard pickers and demolition crews | **Mechanics +3** | Diagnose and dismantle a damaged mechanical assembly in the salvage yard |
| **Inkbound** | Records keepers and ledger copyists | **Scholarship +3** | Investigate a discrepancy in a city work or ration ledger |

**Implementation rule:** The +3 is applied at character creation to the **Major Skill level**, not to a subskill or attribute, and is not contingent on completing the tutorial quest. Other Major Skills begin at the same common baseline for every character. **Squatter grants Fieldcraft +3; Scrapper grants Mechanics +3.** No background changes any core attribute.

**Tutorial rule — LOCKED for ALL SIX backgrounds (2026-10-13):** each receives an E2E tutorial with the same sequence: **first paid job using its starting Major Skill, ordinary job interactions, one unique dark/twisted incident and meaningful choice, a choice-dependent second paid job using a different Major Skill, two further interactions, a manageable scripted turn-based PvE fight with a believable adversary, paid injury treatment, and return home with little money to discover rent due**. Only then does the background tutorial complete. [Shared Background Tutorial Structure](../05-gameplay/onboarding/shared-structure.md) is the canonical full specification. Story, jobs and antagonists differ for each origin; see [Millhand](../05-gameplay/onboarding/millhand.md) and [Bellrunner](../05-gameplay/onboarding/bellrunner.md). The player learns the lore naturally; the character is not an amnesiac. The older 2–5-minute tutorial target is superseded, and pacing needs testing. These E2E tutorial episodes are **not the overarching main storyline**. Rent amount, timer, sanctions and housing rules remain TBD.

**Starter inventory rule (LOCKED for all six origins):** **Basic Clothes, one Crude Small Bag, and 20 coins.** This supersedes Millhand's old *Worker Clothes / cheapest Bag* working names and the old rule reserving 20 coins to Millhand. Every player receives the **same** starting equipment and coins regardless of background or sex. The item's exact records (ID, slot coverage, weight, capacity, quality/durability values) remain to be authored. Tutorial work documents and objects may be quest props, not permanent extra starter gear. Do **not** invent background-specific inventory perks.

A background has real value through early Major Skill progress, a distinctive social perspective and a short tailored introduction, while all players retain unrestricted long-term progression.

## Next decisions

1. Detail the six short tutorial quests and their transition into a shared opening.
2. Define the **rent-due reveal** after each origin tutorial, then decide the amount, deadline and whether/when it becomes a playable obligation.
3. Define **item data and equip slots** for the now-locked universal Basic Clothes and Crude Small Bag; 20 starting coins is already locked for everyone. Then finish name rules and rewards for regular first jobs.
4. Decide how late the barber unlocks and specify its cosmetic variant assets and exact fee.

Related: [First Playable Scope](../00-vision/first-playable-scope.md), [Character System](character-system.md), [Jobs and Time](../05-gameplay/jobs/jobs-and-time.md).
