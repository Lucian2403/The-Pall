# Character Creation — Phase One

Status: Partially agreed, updated 2026-10-13. Explicitly locked decisions are separated from still-proposed content.

## Agreed fields

- Character name.
- **Twelve fixed, stylized 2D starting portraits:** one **male** and one **female** portrait for each of the six backgrounds. Character creation selects name, sex (Male / Female) and background; it does **not** provide a modular portrait editor. Background bonuses and tutorial gameplay are identical for male and female characters.
- Six **locked** background/origin names and social roles. Every chosen background grants **+3 levels in its associated Major Skill at character creation**, and provides **one small background-related tutorial quest**. Unique starter items are not required or defined yet.
- **All attributes fixed at STR 5, DEX 5, INT 5, RES 5 for every background.** No point distribution or background-based attribute changes (LOCKED).
- No age selection.
- **Global starter kit (LOCKED for all six backgrounds): Basic Clothes + 1 Crude Small Bag + 20 coins.** These are the same for male and female characters and for every background. Exact item IDs, mass/capacity and condition values remain TBD.
- **All six backgrounds return after medical treatment to one identical shared starter rented home** (same location/interior/functions/rent, no origin-specific hut). The rent notice appears there and does **not** initiate the overarching main storyline. **150 coins rent is provisional**; rent deadline, recurring frequency and penalties remain TBD. The character already knows their circumstances; these events teach the player.

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
| **Millhand** | Foundry and workshop labor | **Craftsmanship +3** | [Guther Anvil, Smithing Foreman, and The Missing Stamp](../05-gameplay/onboarding/millhand/README.md); tutorial direction locked |
| **Bellrunner** | City messengers and shift couriers | **Industry +3** | [Hector D. Smoke, Dispatch Master, and The Wrong Bell](../05-gameplay/onboarding/bellrunner/README.md); branching tutorial locked |
| **Squatter** | Families at the protected outskirts | **Fieldcraft +3** | [Benny Ben, Herb Dealer, and The Warm Patch](../05-gameplay/onboarding/squatter/README.md); branching tutorial locked |
| **Stitcher** | Clinic attendants and informal caregivers | **Medicine +3** | [Claudia Cyka, Matron, and The Teaching Bed](../05-gameplay/onboarding/stitcher/README.md); branching tutorial locked |
| **Scrapper** | Scrap-yard pickers and demolition crews | **Mechanics +3** | [Rust Yard / Ignatius Smog / The Last Dry Floor](../05-gameplay/onboarding/scrapper/README.md), three second jobs and Barnaby Rusk confrontation locked |
| **Inkbound** | Records keepers and ledger copyists | **Scholarship +3** | [Civic Copying Office / Erwin Buro / The Acceptable Losses](../05-gameplay/onboarding/inkbound/README.md), three second jobs and Silas Pumpard encounter locked |

**NPC naming rule (LOCKED, revised 2026-10-14):** important recurring characters and major encounter opponents have names/recognizable single-name identifiers; minor clerks, workers, attendants, route staff and basic service NPCs can be identified by **role** without inventing personal names. Six named origin job-givers: **Guther Anvil** (Millhand), **Hector D. Smoke** (Bellrunner), **Benny Ben** (Squatter), **Claudia Cyka** (female Matron/Stitcher), **Ignatius Smog** (Scrapper), **Erwin Buro** (Inkbound). Named/mononym combat opponents: **Flint** (Millhand), **Dogman** (Bellrunner), **Owler** (Stitcher), **Barnaby Rusk** (Scrapper), **Silas Pumpard** (Inkbound). Do not force a personal name for the Squatter boar or minor functional NPCs.

**Implementation rule:** The +3 is applied at character creation to the **Major Skill level**, not to a subskill or attribute, and is not contingent on completing the tutorial quest. Other Major Skills begin at the same common baseline for every character. **Squatter grants Fieldcraft +3; Scrapper grants Mechanics +3.** No background changes any core attribute.

**Tutorial rule — LOCKED for ALL SIX backgrounds (updated 2026-10-14):** each receives an E2E tutorial with the same sequence: **first UNPAID work task using its starting Major Skill, ordinary job interactions, one unique dark/twisted incident and meaningful choice, a choice-dependent second UNPAID task using a different Major Skill, two further interactions, a manageable scripted turn-based PvE fight with a believable adversary, a 10-coin injury treatment, and return to the SAME shared rented home with 10 coins to discover rent due (150 coins, provisional)**. Only then does the background tutorial complete. [Shared Background Tutorial Structure](../05-gameplay/onboarding/shared-structure.md) is the canonical full specification. Story, jobs and antagonists differ for each origin; see [Millhand](../05-gameplay/onboarding/millhand/README.md) and [Bellrunner](../05-gameplay/onboarding/bellrunner/README.md). The player learns the lore naturally; the character is not an amnesiac. The older 2–5-minute tutorial target is superseded, and pacing needs testing. These E2E tutorial episodes are **not the overarching main storyline**. Rent amount **150 coins is a provisional target**, not final; deadline, recurrence, collection, sanctions, upgrades and precise home asset/location remain TBD.

**Starter inventory rule (LOCKED for all six origins):** **Basic Clothes, one Crude Small Bag, and 20 coins.** This supersedes Millhand's old *Worker Clothes / cheapest Bag* working names and the old rule reserving 20 coins to Millhand. Every player receives the **same** starting equipment and coins regardless of background or sex. The item's exact records (ID, slot coverage, weight, capacity, quality/durability values) remain to be authored. Tutorial work documents and objects may be quest props, not permanent extra starter gear. Do **not** invent background-specific inventory perks.

**Tutorial reward rule (LOCKED):** every character receives +3 levels in the chosen background **Major Skill** at creation and **one additional +1 level in the different Major Skill chosen for the second tutorial task** (applied once at branch commitment). Both origin tutorial tasks and the scripted introductory fight award **zero coins, zero ordinary XP and no extra loot/levels**. The tutorial-only lack of wages must have a story explanation for each background; all equivalent ordinary repeatable jobs outside tutorial continue to pay coins and XP. Starting cash **20 coins**, obligatory tutorial medical treatment **10 coins**, ending balance **10 coins**, rent notice **150 coins (provisional)**, initial shortfall **140 coins**. The shared home is not customized by background.

A background has real value through early Major Skill progress, a distinctive social perspective and a short tailored introduction, while all players retain unrestricted long-term progression.

## Next decisions

1. Detail the six short tutorial quests and their transition into a shared opening.
2. Develop the **shared starter home** and rental service: 150 coins is provisional, while due date, recurrence, sanctions and when it becomes payable are TBD.
3. Define **item data and equip slots** for universal Basic Clothes and Crude Small Bag; then specify rewards for **non-tutorial** repeatable jobs, including how the tutorial explains unpaid work.
4. Decide how late the barber unlocks and specify its cosmetic variant assets and exact fee.

Related: [First Playable Scope](../00-vision/first-playable-scope.md), [Character System](character-system.md), [Jobs and Time](../05-gameplay/jobs/jobs-and-time.md).
