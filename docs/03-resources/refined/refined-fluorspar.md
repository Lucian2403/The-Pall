# Refined Fluorspar — Phase One

**Design state (2026-10-12):** **LOCKED** conversion ratio and skill gate: **0.50 kg Violet Fluorspar → 0.10 kg Refined Fluorspar**, with **Industry → Refining 30**. **PROVISIONAL**: 120-second processing time and T2 industrial workstation capability. **UNRESOLVED**: final facility and tool/upgrade mapping, contamination modifiers and final process/waste handling.

## Gameplay function and supply chain

Violet Fluorspar is a specialized geological resource found in dangerous exposed **Pall-zone** deposits. It is a mineral, not created by the Pall. Refined Fluorspar is the processed, optically useful portion of the raw resource.

- Raw input: `res_violet_fluorspar` (bulk material, kg).
- Processed output: `res_refined_fluorspar` (bulk material, kg); no technological tiers, quality grades, separate durability or repair meter.
- Manufacturing skill: **Industry → Refining**, **minimum raw 30**.
- Core conversion: **0.50 kg Violet Fluorspar → 0.10 kg Refined Fluorspar**.
- Nominal recovered mass: **20%**, rejected unsuitable mass: **80%**.
- No additional recipe reagent. Do not add Coal merely because other refining recipes are furnace processes. An industrial washing/inspection utility need not be an item ingredient.
- Time proposal retained from previous concept: **120 seconds per nominal batch**, **PROVISIONAL**.
- Working facility direction: **T2 industrial metalworks/processing capability**, **PROVISIONAL**; do **not** invent or lock a Mineral Separation Attachment, its recipe, or a new building yet. The actual processing hardware and exact T2 workstation identifier will be settled when the broader facilities system is developed.
- Production is sorting, mineral separation, cleaning, grading and careful handling rather than high-temperature fluorspar smelting.

## Consumers and balance

The [Lens Set](../components/optics/lens-set.md) consumes **0.05 kg Refined Fluorspar** per unit. Thus one **0.10 kg nominal processing batch supports two Lens Sets**, and each finished Lens Set implies **0.25 kg raw Violet Fluorspar** at the nominal recipe ratio. This excludes additional, avoidable loss.

**Waste accounting:** The 80% loss is built into the nominal recipe. It must not be charged a second time as generic refining waste. The game's existing **avoidable waste model** may cause additional material loss or reduced net output; precise rounding, batch handling and contaminated-feed adjustments remain to be resolved. Treat 0.10 kg as the nominal batch output, not guaranteed actual yield at all skill/conditions.

Refined Fluorspar is **fungible**, divisible in kg (the Lens Set consumes 0.05 kg), marketable and tradable. Optical craftsmanship qualities are assigned at Lens Set production, **not** to raw or refined mineral inventory.

Potential future consumers in advanced metallurgy, glass, gauges and respirator lenses remain **candidates** until those designs establish real recipes. Later industrial variants might support recovery from less optically suitable fluorite without adding grades to this current product prematurely.

## Progression note

The **Pall Filter Medium** does *not* unlock with Refining 30. Current locked filter manufacture uses **Mechanics → Pressure Systems 25 + Scholarship → Pall Research 15**. Players may attempt short/cautious incursions with Grey filters earlier, consistent with [Filter Progression](../final-products/respiratory/filter-progression.md). Refining 30 is a distinct industrial specialization that roughly aligns with the period when players begin to bring Pall-region resources into the economy; it is not an exploration gate.

## Deferred

- Exact T2 facility construction requirements and what mineral-grading capability is built in.
- Additional refine-process time modifiers, batch sizing, contamination effects, and avoidable waste rounding in 0.01 kg material increments.
- Separate Pall-zone mining drop rates and market acquisition price.
- Extraction-site safety, material sorting events and industrial incident tuning.

See also [Resource Acquisition](../raw/resource-acquisition.md), [Refining and Processing](refining-and-processing.md), [Lens Set](../components/optics/lens-set.md).
