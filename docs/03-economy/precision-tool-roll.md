# Precision Tool Roll — Phase One

**Status: LOCKED (2026-10-12)** for identity, recipe, raw skill gate, bench tier, crafting time, intended portable tool role, base durability and quality statistics. **PROVISIONAL:** 1.20 kg finished weight (Leather and Cloth lack settled individual mass). Detailed maintenance/repair recipes and tool-use durability loss are TBD.

## Purpose

Precision Tool Roll is **reusable portable precision-mechanics equipment**, not a consumed material input and not a replacement for the Precision Bench. It contains specialist small hand tools, measuring/alignment implements and a padded reinforced Leather/Cloth carrier.

- Item ID: `itm_precision_tool_roll`
- Recipe ID: `rec_precision_tool_roll`
- Category: Equipment / portable mechanical toolkit
- No technological tiers; supports five distinct **craftsmanship qualities**.
- Tradeable, marketable, lootable, salvageable where justified.
- **Repairable** at a suitable workshop; service materials/time and repair gates TBD.
- **Base durability:** **100** for Standard; quality-specific maxima below.
- **Weight:** **1.20 kg PROVISIONAL**, because unit weights for **2 Leather** and **1 Cloth** are still undefined. Known fixed input mass before these is **0.60 kg** (=0.50 kg Steel + four 0.025 kg Fastener Sets).

## Locked recipe

**0.50 kg Steel + 4 Fastener Sets + 2 Leather + 1 Cloth → 1 Precision Tool Roll**

| Property | Agreed |
| --- | --- |
| Major / subskill | **Mechanics → Precision Mechanisms** |
| Minimum raw skill | **25** |
| Workstation | **T2 Precision Bench** |
| Crafting time | **30 seconds** |
| Output | **1 roll** |
| Quality roll | **Enabled** |
| Steel input | **0.50 kg bulk Steel** |
| Fastener Set input | **4 discrete sets** |
| Leather input | **2 units** |
| Cloth input | **1 unit** |

30 seconds is an intentional game-time abstraction for final toolset finishing, calibration, selection, securing and packing, not a claim that every hand tool is forged from scratch in that interval. No Precision Spring, Copper Wire, or additional speculative intermediate is required. Inputs come from already established Steel, Fastener Set, Leather and Cloth chains.

## What the roll enables

With the appropriate **task-specific character skill** and any required repair supplies:

- Fine inspection and diagnosis of mechanical parts in the field, including Firing Mechanisms and Gear Assemblies.
- Minor sight alignment and specialist adjustments.
- Field maintenance of suitable small precision equipment.
- More efficient completion of **eligible** field inspection/alignment/maintenance tasks.

**Not allowed:** manufacture advanced parts without a Precision Bench; major component rebuild; automatically repair badly damaged precision equipment; substitute for a Repair Kit or Weapon Cleaning Kit; grant the skill required to install/use a firearm mechanism. Routine simple weapon cleaning must remain possible without this roll.

When a character is at a properly equipped Precision Bench, the roll is **not mandatory** because the station already contains tools. Outside a workshop, a roll can be required for specifically identified precision hand-tool tasks, but **not all repair or inspection activities**. The role is **tool access**, not a universal +skill substitute.

## Quality progression — locked

| Workmanship quality | Maximum durability | Eligible field task time reduction | Minimum raw Precision Mechanisms | Minimum bench |
| --- | ---: | ---: | ---: | --- |
| Crude | **80** | **0%** | **25** | **T2** |
| Standard | **100** | **5%** | **25** | **T2** |
| Well-made | **110** | **8%** | **40** | **T2** |
| Fine | **120** | **12%** | **55** | **T3** |
| Masterwork | **130** | **15%** | **75** | **T4** |

Skill/bench gates are minimum eligibility, **not** automatic guarantees of a quality result. Workbench quality ceilings remain in force. Quality does not improve other unrelated crafting timers, confer raw skill, or raise repair restoration; the time modifier operates only on eligible field tasks. A 5% Standard-quality speed modifier refers to task duration, not success chance.

No separate random `Reliability %`, calibration meter, tool-sharpness meter or secondary wear system is introduced. Durability decreases with meaningful adjustment, maintenance and repairs; inspection alone generally has negligible wear. At 0–10% remaining durability the tool roll is unusable, following normal equipment condition rules.

## Remaining balancing and implementation work

- Exact Leather/Cloth unit weights and resulting finished roll weight/mass balance.
- Eligible task tags and skill requirements for weapon maintenance, precision inspection, alignment and field service.
- Per-task tool wear rate; environmental wear, repair materials/time, major repair penalties and NPC repair services.
- Exact salvage yield, vendor stock, crafted appearance/art and trade prices.
- Outcome quality-roll distribution and facility tuning.

Related: [Precision Bench](../04-base/facilities-and-room-progression.md), [Equipment System](../02-equipment/equipment-system.md), [Crafting Workflow](crafting-workflow.md), and [Fastener Set](fastener-set.md).
