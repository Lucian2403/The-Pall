# Lens Set — Phase One Optical Component

**Status: LOCKED (2026-10-12)** for recipe input identities/quantities, subskill gate, station/tool gate, crafting time, weight, craftsmanship-quality factors and manufacturing-quality access. **Not yet end-to-end producible:** upstream Refined Fluorspar processing recipe is **TBD**. Exact firearm combat calculations are also TBD.

## Function

A Lens Set comprises matched, shaped and polished optical elements used by a **T3 Optical Rifle Sight**. It is a **specialized optical component**, not a finished sight, telescope or separate technological tier.

- Item: `itm_lens_set` — `LENS_SET`
- Recipe: `rec_lens_set`
- Category: Component / Optical component
- Main consumer: **1 Lens Set per T3 Optical Rifle Sight**
- Marketable, tradable, salvageable (specific yields TBD)
- Five **craftsmanship qualities** (Crude, Standard, Well-made, Fine, Masterwork); **no Lens Set technology tiers**
- **0.15 kg** per completed Lens Set
- **Not repairable**; damage is managed via the finished host optical item's durability, not by a second installed lens durability meter

## Recipe — locked

**0.30 kg Glass + 0.10 kg Industrial Sand + 0.05 kg Refined Fluorspar → 1 Lens Set**

| Manufacturing field | Locked value |
| --- | --- |
| Major/subskill | **Mechanics → Precision Mechanisms** |
| Raw skill gate | **40** |
| Workstation | **T3 Precision Bench** minimum |
| Required installed station attachment | **Optical Lapping Attachment** |
| Crafting time | **90 seconds** per Lens Set |
| Output | **1 Lens Set** |
| Finished weight | **0.15 kg** |
| Total consumed input mass | **0.45 kg** |
| Nominal loss (offcuts, polishing and processing consumables) | **0.30 kg** |

Glass provides the optical forms; Industrial Sand is a consumed grinding/abrasive medium; Refined Fluorspar provides a specialist corrective optical element. These are gameplay abstractions for optics manufacturing, not detailed real-world optical engineering instructions. The output-to-input mass difference is **not** recoverable scrap by default.

**Upstream dependency:** Raw [Violet Fluorspar](resource-acquisition.md) is a Pall-zone specialty material and `Violet Fluorspar → Refined Fluorspar` is previously named in resource-acquisition lore, but **there is no locked refining recipe, skill, furnace, yield or duration yet**. Treat `Refined Fluorspar` as a planned processed commodity until its production chain is defined. Do not conflate Violet Fluorspar with ready-to-use Refined Fluorspar, and do not invent a mass conversion ratio.

## Workstation upgrade — Optical Lapping Attachment

A **reusable workstation capability**, installed on a **T3 or T4 Precision Bench**. It is **not consumed** when a Lens Set is crafted and does not require an independent bench family. The build/install activity consumes:

| Input | Units |
| --- | ---: |
| Gear Assembly | **1** |
| Metal Plate | **1** |
| Fastener Set | **4** |

- Installation requires **raw Precision Mechanisms 40**.
- One-time setup/install time: **120 seconds**.
- A station with this upgrade can grind, lap, mount and align specialist optics.
- It does not grant Glass refining or Refined Fluorspar production ability: those remain upstream processing jobs.
- Upgrade-specific maintenance, portable version and installation failure behavior TBD.
- This is an installed bench fixture rather than a newly introduced consumable `Optical Lapping Tool` ingredient.

## Craftsmanship-quality factors — locked

The numbers below multiply **only the Lens Set's optical contribution to a host sight's accuracy/range benefit**, **not** the firearm's total accuracy, total effective range or bullet travel distance. Standard = 100%, and these are not hit probabilities.

| Craftsmanship quality | Accuracy optical factor | Effective-range optical factor | Minimum raw Precision Mechanisms | Minimum bench |
| --- | ---: | ---: | ---: | --- |
| Crude | **90%** | **88%** | **40** | **T3** |
| Standard | **100%** | **100%** | **40** | **T3** |
| Well-made | **104%** | **105%** | **50** | **T3** |
| Fine | **108%** | **110%** | **60** | **T3** |
| Masterwork | **112%** | **115%** | **75** | **T4** |

Higher skill and suitable facilities affect achievable *workmanship*; there are not five differently priced material recipes. Skill and facility requirements are **access floors**, not guaranteed outcomes.

**Quality ceiling:** Lens quality caps the finished Optical Sight quality. A Fine sight cannot be manufactured from a Standard Lens Set. The normal fitting/host craftsmanship ceiling still applies. Do **not** stack another identical optical-quality multiplier from the finished sight's quality tier on top of these same lens factors: optics benefit is applied once through the assembled sight's final data.

The host Optical Sight retains its **80** base durability and uses ordinary sight condition/wear effects. The Lens Set does **not** add a separate independent reliability roll, aiming-time attribute, optical fatigue bar or in-weapon lens durability meter.

## Mass balance of consumer

The T3 Optical Rifle Sight consumes **0.30 kg Steel + 4 Fastener Sets (0.10 kg total) + 4 Copper Wires (0.04 kg total) + 1 Lens Set (0.15 kg)** = **0.59 kg of material**. The agreed **0.50 kg** finished sight leaves **0.09 kg nominal assembly loss**. Its 0.50 kg weight can now be locked.

## Still open

1. **Next design step: Refined Fluorspar** — exact raw Violet Fluorspar → Refined Fluorspar processing recipe, refined unit measurement, skill gate, station, process time, losses and sourcing.
2. Exact numerical firearm accuracy/range formulas, including how combined sight/lens benefits are capped and applied once.
3. Repair/salvage yields, contamination constraints and finished quality-roll probabilities.

See [Rifle Sights](rifle-sights.md), [Precision Bench](../04-base/facilities-and-room-progression.md), [Item Data Schema](../02-equipment/item-data-schema.md).
