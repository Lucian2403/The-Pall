# Common Background Tutorial Structure

**Status: LOCKED structural design (2026-10-13).** This architecture applies to **all six** starting backgrounds: Millhand, Bellrunner, Squatter, Stitcher, Scrapper and Inkbound.

## Required E2E sequence

1. **Choose name, Male/Female portrait and background.** STR/DEX/INT/RES all start at 5; chosen background grants **+3 levels in one Major Skill**, before any tutorial quest.
2. **Start with identical kit for every background: Basic Clothes + one Crude Small Bag + 20 coins (LOCKED).** The actual item records/stats remain TBD. Begin in a background-specific persistent job hub and speak with its regular NPC job-giver.
3. **First paid job — chosen background's Major Skill.** Run normal, reusable job preparation and meaningful gameplay interactions; learn the generic mechanics and receive its normal coins and skill experience.
4. **Unique twist after regular job interactions.** A background-specific incident prompts a meaningful choice. This event is not randomly repeated by the ordinary job system.
5. **Second paid job — a different Major Skill.** The player's incident choice **branches to one of several logical second jobs**, each using normal reusable interactions associated with its different Major Skill. Millhand uses three options leading to Industry / Commerce / Scholarship. All other backgrounds should likewise offer consequential alternatives, with the exact choices/skill destinations authored per origin.
6. **Two meaningful follow-up interactions after the second job,** bridging the story and impending hostile encounter. They should use reusable interaction frameworks (dialogue/inspection/approach), not a new minigame each.
7. **Short introductory PvE fight**, with an antagonist logically tied to the chosen background's story/route. The game uses **turn-based combat**, but its system and numerical balance will be defined separately. Fight is survivable and moderately challenging; there must be a non-blocking defeat outcome.
8. **City medical treatment/patch-up** that teaches ordinary Health, injury and care services and consumes a sensible small amount of money; exact prices/stat changes TBD.
9. **Return to character's home** with limited money. **Rent-due notice appears at home only after treatment** and ends this background's E2E tutorial. The rent hook introduces economic pressure **not** the overarching main storyline. No rent amount/deadline/sanctions locked yet.

## Consistency rules

- Background-specific content varies by start location, recurring NPC, first job, eerie/dark incident, three-way choice, second-job specializations, antagonist and narrative detail.
- **All backgrounds use the exact structural rhythm above**, with comparable beginner difficulty, job earnings, healing cost burden and approximate duration; costs, difficulty and route rewards must be tested for parity.
- Real-time job and travel clocks continue during interactions according to [Jobs and Time](../jobs/jobs-and-time.md); do not force players to wait for late prompts.
- Combat is scripted **PvE** for onboarding, not an expansion of nonconsensual PvP rules; no special combat system is created only for tutorials.
- Tasks may introduce lore to the player without treating their character as someone who needs the basics of their life explained.
- The opening chapters are **self-contained jobs and incidents**, not the start of the game's central story. Do not promise systemic future ramifications unless authored.
- **Universal starting items are LOCKED:** every origin and portrait starts with **Basic Clothes, one Crude Small Bag and 20 coins**; item data/stats are still TBD. Do not introduce extra origin-specific starter items. Wage/XP and paid medical costs vary by story but need balanced player outcomes.
- Existing skill and job rules remain canonical; tutorial XP comes from actual skill-relevant activity, not bonus +3 levels for the second skill.

## Content authoring checklist per background

Start location (persistent) · NPC (recurring) · first job and generic interactions · unique twist · choice-driven second Major Skill jobs · two bridging interactions · motivated enemy · clinic/service · home/rent scene · rewards/XP parity · defeat/retry behavior · asset/UI and persistent state references.

See [Millhand](millhand.md), [Bellrunner](bellrunner.md) and [Squatter (proposed)](squatter.md). Bellrunner's agreed second jobs lead to Commerce/Contracts, Medicine/Trauma or Mechanics/Industrial Machinery; the fight opponent is the **Shift Marshal's unofficial dogman**, not the Shift Marshal himself. Squatter's **Hedge Shelter**, **Herb Dealer** job-giver, **Yarrow Cut**, **The Warm Patch**, three second jobs (Commerce/Trading, Medicine/Herbalism, Industry/Construction) and injured wild boar opponent are **locked in story direction**, with numerical mechanics and precise rent/home details TBD.
