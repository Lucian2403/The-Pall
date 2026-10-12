# Rifle Sights — Phase One

**Status (2026-10-12):** **LOCKED**: integrated T1 base sights instead of a separate T1 crafted item; T2 and T3 ingredient identities/counts, craft skill/bench/time, baseline durability and qualitative functions. **LOCKED**: T3 finished weight **0.50 kg**, justified by the **0.15 kg Lens Set**. **PROVISIONAL**: exact effect magnitudes/condition multipliers. Numerical accuracy/range formula is **TBD** until firearm combat is designed.

## Equipment concept

Ordinary rifles have **integrated T1 iron sights** by default. There is **no craftable T1 Rifle Sight item** in Phase One. Craftable optional upgrades:
- **T2 Calibrated Rifle Sight** — improved mechanical alignment and reference detail; accuracy and effective-range improvement.
- **T3 Optical Rifle Sight** — lens-based sighting at longer distances; greater accuracy and long-range support.

Both improve **accuracy** and **effective range**, but effective range is not bullet travel distance. No independent aiming-time stat, damage multiplier, percent-based random sight failure roll, or separate calibration-condition meter has been introduced. Actual numerical bonuses await firearm-combat design; do not double-apply accuracy and range.

Only one upgrade sight may be active at a time. Basic integrated sights remain available when the upgrade is detached or ruined. Different firearm compatibility profiles are TBD. Crafting raw skill is not a gate for buying, owning or shooting with an installed sight; task-specific Weapon Maintenance may govern fitting, repair or inspection.

## Locked recipes

| Input / parameter | T2 Calibrated | T3 Optical |
| --- | ---: | ---: |
| Steel (bulk) | **0.20 kg** | **0.30 kg** |
| Fastener Set | **2** | **4** |
| Copper Wire | **4** | **4** |
| Lens Set | 0 | **1** |
| Distinct ingredient types | **3** | **4** |
| Output | **1 sight** | **1 sight** |
| Major → subskill | Mechanics → **Precision Mechanisms** | Mechanics → **Precision Mechanisms** |
| Raw skill required | **20** | **40** |
| Workstation | **T2 Precision Bench** | **T3 Precision Bench** |
| Crafting time | **30 seconds** | **50 seconds** |
| Base durability | **100** | **80** |
| Weight | **0.20 kg** | **0.50 kg LOCKED** |
| Craftsmanship quality | Crude–Masterwork, independent of tier | Crude–Masterwork, independent of tier |

Copper Wire: [**0.10 kg Copper Ingot → 8 Copper Wires**](../../components/metalwork/copper-wire.md), at Smithing 10, Forge T1, 20 s; **each sight uses four**. Fastener Set is a distinct 0.025 kg component.

T2 ingredient mass: 0.20 kg Steel + 0.05 kg fasteners + 0.04 kg wire = **0.29 kg** input to **0.20 kg** finished sight, leaving **0.09 kg nominal process/waste difference**. This can represent offcuts and alignment finishing; do not generate recoverable scrap by default.

T3 input mass is **0.44 kg plus 1 Lens Set (0.15 kg)**, i.e. **0.59 kg** total, yielding a **0.50 kg** sight with **0.09 kg** nominal assembly loss. The [Lens Set recipe and craftsmanship optical factors](../../components/optics/lens-set.md) are locked, but its **Refined Fluorspar** processing dependency remains TBD.

The wire represents fine alignment/reference elements for T2 and fine optical reticle/reference elements for T3, **not** a structural barrel/receiver or a battery. There is no separate power requirement or new invented intermediate.

## Condition / repair

- T2 mechanical sight is tougher (**durability 100**); T3 optical assembly is more fragile (**durability 80**).
- Worn condition progressively undermines accuracy/range benefits; at **0–10% durability**, the upgrade is unusable.
- No separately rolled “Sight Reliability %” is defined. The item durability already represents alignment and functional wear.
- Tradeable, salvageable and repairable with appropriate specialist work; actual repair costs and skill gates TBD.

## Deferred combat tuning

- Exact numerical accuracy and effective-range benefits.
- Weapon-specific sight support and installation conditions.
- Numerical condition penalties, environment damage rates, field repair accessibility and quality modifiers.
- Optical magnification, reticle interaction and aiming time: do not introduce until combat requires them.
- Upstream Refined Fluorspar processing recipe, and later whole-weapon optical effect formulas; [Lens Set](../../components/optics/lens-set.md) manufacturing and quality tables are locked.

Related: [Copper Wire](../../components/metalwork/copper-wire.md), [Precision Bench](../../../06-bases/workstations/facilities-and-room-progression.md), [Item Data Schema](../../../04-equipment/data/item-data-schema.md).
