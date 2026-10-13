# Character Creation — Phase One

Status: Partially agreed, updated 2026-10-13. Explicitly locked decisions are separated from still-proposed content.

## Agreed fields

- Character name.
- **Twelve fixed, stylized 2D starting portraits:** one **male** and one **female** portrait for each of the six backgrounds. Character creation selects name, sex (Male / Female) and background; it does **not** provide a modular portrait editor. Background bonuses and tutorial gameplay are identical for male and female characters.
- Six **locked** background/origin names and social roles. Every chosen background grants **+3 levels in its associated Major Skill at character creation**, and provides **one small background-related tutorial quest**. Unique starter items are not required or defined yet.
- **All attributes fixed at STR 5, DEX 5, INT 5, RES 5 for every background.** No point distribution or background-based attribute changes (LOCKED).
- No age selection.
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
| **Bellrunner** | City messengers and shift couriers | **Industry +3** | Deliver a shift notice and learn the city's labour routes |
| **Squatter** | Families at the protected outskirts | **Fieldcraft +3** | Find a safe patch of useful plants just outside the gates |
| **Stitcher** | Clinic attendants and informal caregivers | **Medicine +3** | Assist with a routine minor injury and learn who receives care |
| **Scrapper** | Scrap-yard pickers and demolition crews | **Mechanics +3** | Diagnose and dismantle a damaged mechanical assembly in the salvage yard |
| **Inkbound** | Records keepers and ledger copyists | **Scholarship +3** | Investigate a discrepancy in a city work or ration ledger |

**Implementation rule:** The +3 is applied at character creation to the **Major Skill level**, not to a subskill or attribute, and is not contingent on completing the tutorial quest. Other Major Skills begin at the same common baseline for every character. **Squatter grants Fieldcraft +3; Scrapper grants Mechanics +3.** No background changes any core attribute.

**Tutorial rule:** Each origin-specific segment is a **small, self-contained end-to-end quest** (target about 2–5 minutes), grounded in local lore and meaningful everyday work. The character is familiar with their own circumstances; conversations and activity teach the **player** about the setting without an artificial history lecture. **Finishing the origin tutorial reveals rent coming due**, converging all six origins onto the same short-term economic predicament, **not the overarching main storyline**. This does **not** yet establish a rent payment mechanic, number of coins, timer, sanctions or debt system. Origins do not create six separate main questlines or mandatory ongoing origin missions. NPCs, objectives, exact rent-notice delivery and incidental rewards remain to be authored.

**Inventory rule:** Do **not** assign unique background items merely to fill a character-creation column. **Millhand is now specifically locked to Worker Clothes, the cheapest Bag and 20 starting coins** (precise item definitions and their statistics TBD; see the [Millhand opening](../05-gameplay/onboarding/millhand.md)). Do not apply Millhand's exact 20-coin figure or item selection to other backgrounds without a separate decision. If suitable, properly specified inventory items become available later, optional origin-specific starter variations may be introduced with comparable value; no such variations are locked now.

A background has real value through early Major Skill progress, a distinctive social perspective and a short tailored introduction, while all players retain unrestricted long-term progression.

## Next decisions

1. Detail the six short tutorial quests and their transition into a shared opening.
2. Define the **rent-due reveal** after each origin tutorial, then decide the amount, deadline and whether/when it becomes a playable obligation.
3. Define shared starting inventory and money once basic item records support them; finalize naming rules and first common job.
4. Decide how late the barber unlocks and specify its cosmetic variant assets and exact fee.

Related: [First Playable Scope](../00-vision/first-playable-scope.md), [Character System](character-system.md), [Jobs and Time](../05-gameplay/jobs/jobs-and-time.md).
