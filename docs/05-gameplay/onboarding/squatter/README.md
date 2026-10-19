# Squatter — Protected Outskirts Opening

**Tutorial economy / housing rule (LOCKED 2026-10-14):** The first and second opening work tasks are **unpaid (0 coins) and award no ordinary XP**; the scripted introductory fight also awards 0 XP, coins and loot. On committing to a second-task choice, gain **+1 level once** in that branch's *different* Major Skill, alongside the initial +3 Major Skill granted at character creation. All origin characters begin with 20 coins, spend 10 on the standard tutorial clinic service, and return to the same shared rented home with 10 coins. Its rent notice is **150 coins PROVISIONAL**, due date/penalties TBD. Ordinary repeatable jobs outside these six exceptional tutorials still pay coins and XP. Precise in-world reasons each tutorial task is unpaid should be written into the eventual dialogue.

**Status: Opening E2E quest APPROVED (2026-10-13).** [Stage 1 Benny Ben opening dialogue](opening-dialogue.md) is **APPROVED AND LOCKED (2026-10-15)**. [Stage 2 Yarrow Cut ordinary Foraging interaction](yarrow-cut-interaction.md) and [Stage 3 Warm Patch discovery](warm-patch-discovery.md) are **APPROVED AND LOCKED (2026-10-15)**. [Stage 4 three second-skill jobs](second-task-branches.md) and [Stage 5 two boar pre-fight encounters](boar-confrontation.md) are **APPROVED AND LOCKED (2026-10-15)**. [Stage 6 injured boar fight](boar-fight.md) is **APPROVED AT ENCOUNTER LEVEL (2026-10-15)** and [Stage 7 clinic](clinic-treatment.md) is **APPROVED AND LOCKED (2026-10-15)**. [Stage 8](../shared-home-rent-ending.md) is the **identical shared home-and-rent scene for every origin**, approved without a Squatter-specific duplicate. All eight Squatter narrative stages are complete; shared numerical combat/Health and provisional rent systems remain TBD. **Hedge Shelter**, recurring **Benny Ben, the Herb Dealer** as the foraging-job NPC, **Yarrow Cut**, **The Warm Patch**, three second-Major-Skill branches, the young injured wild boar, medical visit and rent-at-home ending are locked in narrative direction. Combat rules, numerical values, NPC personal names, location geometry, non-tutorial pay and medical mechanics are deferred; scripted tutorial care is 10 coins. The [shared tutorial structure](../shared-structure.md), **Fieldcraft +3**, and standard starter kit are locked.

## Character starting state (LOCKED)

- **Origin:** Squatter — raised among families in the Protected Outskirts; familiar with local survival routines.
- **Background Major Skill:** **Fieldcraft +3** at character creation. Fieldcraft includes Foraging, Scavenging, Navigation, Tracking; the initial job uses **Foraging**.
- **Attributes:** STR 5 / DEX 5 / INT 5 / RES 5; base max Health 50.
- **Starter gear for all origins:** **Basic Clothes, one Crude Small Bag, 20 coins.** No background-special starter knives, medicines or weapons. Exact item records/stats remain TBD.
- **Tutorial:** first Fieldcraft job → unique choice → unpaid tutorial second task in a **different Major Skill** → two interactions → short **turn-based PvE fight** → treatment at ordinary city care service → home with little money → rent notice, E2E tutorial ends. The overarching main storyline does not start here.

## Hedge Shelter — LOCKED first location and permanent job hub

**Hedge Shelter (LOCKED).** A shabby timber-and-canvas lean-to at the **protected outskirts near the Grand Cylinder City gate**. It has marked harvesting routes, hanging herb bundles, a communal scale and a contract board, plus sheltered baskets. Nearby common fields are a low-risk, established Fieldcraft work area. Exact neighbourhood, map tile and asset layout TBD.

**Recurring job NPC: Benny Ben, Herb Dealer (personal name and occupational title LOCKED)**: a practical broker who weighs and pays for ordinary collected plants and assigns nearby Foraging/gathering jobs. **His personality is LOCKED by user direction (2026-10-15): Benny deeply loves herbs and living nature, believes protecting the few healthy patches left is essential to long-term prosperity, and feels compassion for plants and animals in dangerous/Pall-affected zones that receive no care.** He sees sustainable harvesting as a way to sustain medicines, work and future growth, not as a contradiction of his trade. His affection should appear in grounded behaviour and occasional heartfelt lines, not constant sermons, caricature, or invented personal experiences inside the zones. This is the permanent **Fieldcraft / Foraging paid-job hub**, not a tutorial-only place or a general city Smithing station. Benny is not established as a villain.

**First tutorial task (LOCKED): Yarrow Cut**. [Stage 2 work interaction](yarrow-cut-interaction.md) is approved; exact values remain TBD. Gather a modest assigned quantity of common **Yarrow** from a reliable known public patch near the shelter. Yarrow's normal safe field/outskirts sourcing and bleeding-control medicinal role are already documented in [Herbs and Harvesting](../../../03-resources/raw/herbs-and-harvesting.md).

Normal, reusable Foraging interactions:
1. Speak to Benny Ben: see the quantity, payment, estimated time and a simple gathering destination.
2. Identify **Yarrow** and confirm the patch, paying attention to safe plant identification.
3. Choose a harvest method / how much to take without ruining regrowth; normal yield, patch health, equipment/time implications apply.
4. Sort dirty/damaged plant matter from usable cuttings and return/deliver through a generic quantity/condition check. This reuses normal Fieldcraft/Foraging gameplay, but the tutorial instance yields 0 coins and 0 ordinary XP; ordinary repeatable harvest jobs pay normally.

**Source-of-truth economy guardrail:** Herb material has **no Crude–Masterwork tier**; patch population and harvest pressure are shared-world rules. Introductory required common Yarrow must remain obtainable even when the world patch is depleted or other players have harvested it.

**User-approved harvest provenance repair (2026-10-19):** [Yarrow Cut Stage 2](yarrow-cut-interaction.md) now retains the source section for each harvested bundle under either harvest method. [Stage 4 Apothecary's Weighing](second-task-branches.md) consults those records before accepting the separate dry-upper-ground portion and holds suspect stems. This does not reveal the old outfall during Stage 2 or establish a new disease mechanic. The implementation requirement is included in the [shared onboarding contract](../shared-state-implementation-contract.md).

## The Warm Patch — LOCKED tutorial-only twist

[Stage 3 scene, clues and branch handoffs](warm-patch-discovery.md) are approved and locked. [Stage 4 route work/dialogue](second-task-branches.md) is approved.


**Only after the normal Foraging interactions** are finished, the Squatter discovers that this Yarrow bed is thriving over a half-collapsed outfall beside the old poorhouse disposal ground. Wet ribbons from medical dressings are tangled around the roots; a human finger bone has surfaced after a rain. A faint warmth comes through the drainage bricks. Benny Ben expected ordinary plants and gives no explanation for the newly exposed remains.

This is a **local scandal concerning neglected remains and the supply of medical herbs**, not a Pall expedition or the opening of the main plot. The buried dead are implied; avoid gratuitous gore or requiring full simulated burial systems. Exact identity/cause and why the drain is warm remain **TBD**, not a new canon Pall phenomenon.

Three agreed first-event choices send the player to distinct **unpaid tutorial activities reusing ordinary job templates**:

| Player decision | Second tutorial task and Major Skill | Locally resolved revelation (agreed narrative direction; dialogue TBD) |
| --- | --- | --- |
| **Deliver the harvest without mentioning the find** | **Commerce → Trading: The Apothecary's Weighing.** A working apothecary needs a hand sorting, weighing and recording everyday herb deliveries (generic trade/inspection templates). | The apothecary recognizes the disposal-ground stains on some bundles but buys the verified clean portion: medicine for the poor cannot simply stop. Is commercial pragmatism complicity? |
| **Warn the infirmary about the patch** | **Medicine → Herbalism: Suspect Cuttings.** The player assists a clinic herbalist with identifying usable versus contaminated Yarrow and preparing clean stock, unpaid in this tutorial (ordinary Herbalism/quality-check activity). | The infirmary's refuse may be draining into the same ground where its medicinal plants are gathered, and the staff know more than they admit. |
| **Trace the warm drainage channel** | **Industry → Construction: Clear the Outfall.** The player helps a ditch crew check supports and clear a blocked public drainage channel, unpaid in this tutorial (ordinary basic construction/handling interactions; no elite mechanics gate). | The disturbed ground contains discarded pauper-welfare tags and medical linens. The village's water and herbs rely on a neglected city outfall. |

**Job/skill guardrail:** The first and second scripted tutorial tasks give 0 coins and 0 ordinary XP. The chosen second-task Major Skill (Commerce, Medicine or Industry) gains exactly +1 level when the route is selected, once. Their normal repeatable job versions still pay coins/XP. No route requires unearned mastery, specialist tools, new unique crafted items, or a new Major Skill.

## Two follow-up interactions after second job — APPROVED scenes

[Stage 5 bank/boar interaction and dialogue](boar-confrontation.md), [Stage 6 fight and outcomes](boar-fight.md), and [Stage 7 clinic visit](clinic-treatment.md) are all APPROVED AND LOCKED at their respective scene/encounter levels. Numerical combat and Health effects remain TBD.

**Interaction 1, "The Rustling Bank" (LOCKED):** Returning toward the city gate along the edge of the disturbed drainage ground, the player sees rooted soil shifting and hears scraping among the reeds. Choose whether to inspect tracks, take the raised path or investigate a fresh tear in the ground. The choices determine information/position, not whether the mandatory combat exists. A Fieldcraft-aware player may identify animal signs sooner.

**Interaction 2, "Nowhere to Step" (LOCKED):** A **young, injured wild boar**, disturbed by the exposed ditch and human activity, bursts from the reeds into the narrow passage. The player decides whether to hold ground, retreat behind a broken fence section or move toward the stone embankment; then regular turn-based PvE begins. **The young, injured wild boar is the LOCKED tutorial opponent.** Boar already exists in the Phase One animal roster and can injure people even outside Pall zones; beginner combat difficulty must be carefully tuned to the starting 50 Health and lack of a weapon. Do not imply a normal wild boar is an easy bare-handed kill.

### Short fight, care and home — agreed story direction; mechanics TBD

- **LOCKED opponent:** a desperate young, injured **wild boar**, not another hired thug. The encounter should allow a frightened, unarmed novice to **drive it off** using sensible defensive positioning or environmental shelter rather than requiring them to kill an adult boar bare-handed. Tutorial combat grants no XP or loot; difficulty, animal AI, Health loss and defeat fallback must be defined later in the global turn-based combat system. If testing reveals unfair difficulty, the encounter mechanics/setting can be tuned without silently replacing the locked opponent.
- **Injury and care (UPDATED to approved Stage 6–7):** the player may take a real wound during the boar fight, but a perfectly safe victory does **not** cause a scripted cut. Both victory and defeat lead to the standard **10-coin clinic service**, with actual injuries treated under the later shared Health rules, followed by the identical shared home. Do not infer a guaranteed wound or new disease mechanics from older pitch notes.
- **Ending:** use the **single [shared Stage 8 home-and-rent scene](../shared-home-rent-ending.md)** already approved for all backgrounds, not a separate Squatter script. After the 10-coin clinic visit, the player returns to the identical home with 10 coins remaining, reads the same provisional 150-coin rent notice, puts it down, and **speaks the exact Millhand-origin closing line used by all six backgrounds**. Then the tutorial ends. No separate rent collector, due date, home variation or overarching story is introduced.

## Locked versus to be designed

**LOCKED:** Squatter Fieldcraft +3; universal Basic Clothes + Crude Small Bag + 20 coins; **Hedge Shelter** as reusable Protected Outskirts Foraging hub; **Benny Ben, the Herb Dealer** as recurring job-giver; **Yarrow Cut** as the first Fieldcraft job with general plant identification/harvest interactions; **The Warm Patch** twisted discovery; three choices leading to **Commerce / Trading (The Apothecary's Weighing)**, **Medicine / Herbalism (Suspect Cuttings)** and **Industry / Construction (Clear the Outfall)**; two story interactions **The Rustling Bank** and **Nowhere to Step**; **young injured wild boar** as shared PvE opponent; paid medical care; home/rent scene ends the tutorial. This E2E episode is separate from the overarching main storyline.

**TBD, not locked:** Benny Ben's appearance (his Stage 1 dialogue is approved); exact map location and visuals; job quantities, normal-job wages/XP and timings; second-job NPCs; precise fate of disposed remains and warm drain; dialogue; player choice suboptions; turn-based combat balancing and novice-boar defensibility; non-tutorial doctor/service fees and Health state; shared home location, rent deadline and collector. The unique scripted event is not a regular repeatable Fieldcraft encounter.
