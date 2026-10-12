# Rifle Sights — Phase One

**Status (2026-10-12):** **LOCKED**: integrated T1 base sights instead of a separate T1 crafted item; T2 and T3 ingredient identities/counts, craft skill/bench/time, baseline durability and qualitative functions. **PROVISIONAL**: T3 finished weight and exact effect magnitudes/condition multipliers. Numerical accuracy/range formula is **TBD** until firearm combat is designed.

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
| Weight | **0.20 kg** | **0.50 kg PROVISIONAL** |
| Craftsmanship quality | Crude–Masterwork, independent of tier | Crude–Masterwork, independent of tier |

Copper Wire: [**0.10 kg Copper Ingot → 8 Copper Wires**](copper-wire.md), at Smithing 10, Forge T1, 20 s; **each sight uses four**. Fastener Set is a distinct 0.025 kg component.

T2 ingredient mass: 0.20 kg Steel + 0.05 kg fasteners + 0.04 kg wire = **0.29 kg** input to **0.20 kg** finished sight, leaving **0.09 kg nominal process/waste difference**. This can represent offcuts and alignment finishing; do not generate recoverable scrap by default.

T3 input mass is **0.44 kg plus 1 Lens Set**. Its **0.50 kg** finished weight cannot be reconciled until Lens Set weight and optical assembly/material losses are specified. Lens Set is a **planned component**, not a complete locked recipe as of this document.

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
- Lens Set recipe/weight/quality and any lens-specific material-processing gate.

Related: [Copper Wire](copper-wire.md), [Precision Bench](../04-base/facilities-and-room-progression.md), [Item Data Schema](../02-equipment/item-data-schema.md).
