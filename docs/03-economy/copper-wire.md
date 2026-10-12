# Copper Wire — Phase One

**Status: LOCKED (2026-10-12)** for recipe, quantity, craft gate, bench, time and finished unit weight. Future use in other products requires separate named recipes.

## Identity

Copper Wire is a **discrete small coil/length of workable copper wire**, not a 1 kg commodity and not a Copper Fitting. Wire can serve fine sight reference/alignment elements and optical reticles. It has no battery/electrical power role by default. `Copper Ingot` is the existing upstream processed bulk commodity.

- Item ID: `itm_copper_wire`
- Recipe ID: `rec_copper_wire`
- Component; tradeable, marketable, salvageable where dismantling warrants it
- No durability meter, repair, technological tiers or craftsmanship-quality grading
- Suggested common stack cap: **100**

## Locked recipe

**0.10 kg Copper Ingot → 8 Copper Wires**

| Field | Locked value |
| --- | --- |
| Manufacturing skill | **Craftsmanship → Smithing 10** (raw) |
| Workstation | **Forge T1** (wire drawing/working capability abstracted into its tooling) |
| Crafting time | **20 seconds per batch** |
| Output | **8 Copper Wires** |
| Weight per wire | **0.01 kg** / **10 grams** |
| Total finished weight | **0.08 kg** |
| Nominal material loss | **0.02 kg** (20%) |
| Other recipe inputs | **None** |

Drawplate/die is reusable tool capability, not another consumed ingredient; Coal may be a Forge operating fuel but is not an extra wire-recipe ingredient. Do **not** turn Copper Fitting into Copper Wire.

Bulk processed copper may be deducted in fractional kilograms (0.10 kg here); output is discrete wire units. Other manufacturing abilities, such as Refining Copper Ingot, are not inherited gates for a Smithing 10 wire crafter who buys copper.

## Confirmed consumers

- **T2 Calibrated Rifle Sight: 4 Copper Wires** per sight.
- **T3 Optical Rifle Sight: 4 Copper Wires** per sight.

Each consumes **0.04 kg** of finished Copper Wire. Eight wire units from one craft batch therefore supply two sights.

## Deferred

Additional consumers, vendor prices and salvage yields, crafting fail/quality rolls, exact Forge tool requirements, and appearance/icon art.

Related: [Rifle Sights](rifle-sights.md), [Refining and Processing](refining-and-processing.md), [Fastener Set](fastener-set.md).
