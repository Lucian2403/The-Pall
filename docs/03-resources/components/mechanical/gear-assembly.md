# Gear Assembly — Phase One

Status: **LOCKED design** for component identity, crafting gate, baseline behavior and economic-access rules. Host-specific uses, installation/repair ranks and some balancing values remain **TBD**.

Decision date: **2026-10-11**.

## Purpose and identity

Gear Assembly is a **reusable mechanical transmission component**, carrying rotary movement and mechanical force between linked parts. It is a specialist crafted good, **not** an ingredient automatically required by every pump, workshop, machine or repair.

- Item ID: `itm_gear_assembly`
- Recipe ID: `rec_gear_assembly`
- Category: Component / Power Transmission
- One standard item family; craftsmanship quality handles workmanship differences instead of multiplying gear-item variants.
- Supported quality direction: Crude → Standard → Well-made → Fine → Masterwork, only where skill, materials and facility actually permit that grade.
- Tradable, purchasable, salvageable and workshop-repairable.
- Stackable **only when quality and condition class are compatible**. Stack limit TBD.

## Manufacturing recipe

**1 kg Steel + 1 Metal Plate + 8 Fastener Sets → 1 Gear Assembly**

| Requirement | Agreed value |
| --- | --- |
| Primary subskill | Mechanics → Precision Mechanisms |
| Minimum **raw** skill to manufacture | **30** |
| Workstation | **Precision Bench, T2** |
| Crafting time | **60 seconds** per assembly |
| Output | **1 Gear Assembly** |
| Quality roll | Enabled |

- Do **not** consume a Precision Spring. Basic gear trains do not need a spring by default.
- Fastener Set's [locked recipe and physical values](../metalwork/fastener-set.md) use 0.25 kg Steel to produce eight 0.025 kg sets at Smithing 5 on a T1 Forge. Revised ingredient mass: 1.00 kg Steel + 0.50 kg Metal Plate + 0.20 kg Fastener Sets = 1.70 kg total for a 1.50 kg assembly (nominal 0.20 kg fabrication loss).
- Secondary skill gates, failure handling, blueprint rules, material waste and batch extensions are TBD unless defined separately.
- A **manufacturing prerequisite is not an ownership, trading, installation, operation or repair prerequisite**.

## Physical properties and condition

| Property | Baseline |
| --- | --- |
| Weight | **1.50 kg** |
| Durability | **100** |
| Standard-quality Transmission Efficiency | **95%** |
| Main wear source | Operation and mechanical stress |

Transmission Efficiency expresses how effectively the component transfers motion. A host machine uses this value through its own data/formula; **do not** universally apply a 5% production-speed penalty to every machine.

### Durability-driven efficiency

These are **multipliers on baseline Transmission Efficiency**, not replacement absolute efficiencies.

| Current durability | State | Efficiency multiplier |
| --- | --- | ---: |
| 81–100% | Sound | **100%** |
| 61–80% | Worn | **98%** |
| 41–60% | Damaged | **93%** |
| 21–40% | Failing | **85%** |
| 11–20% | Critical | **70%** |
| 0–10% | Ruined | **Unusable** |

- Protected storage produces minimal environmental wear; machine operation is the principal degradation source.
- Maintenance consists of lubrication/alignment, reducing future wear or malfunction risk. **Maintenance does not restore durability.**
- Workshop repair consumes materials and may, after major repeated repairs, reduce maximum durability. Exact materials, ranks, repair rates and maintenance durations are TBD.
- Do not add separate tooth damage, friction or lubricant meters in Phase One.

## Economic access and cross-skill guardrail

**Precision Mechanisms 30 gates manufacture only.**

1. **Acquire/own/trade/transport:** no Precision Mechanisms requirement.
2. **Install:** governed by the receiving machine and the installation task, potentially under another subskill. It does not inherit the manufacture gate. Exact host-specific rank TBD.
3. **Operate:** governed by the host machine, not the Gear Assembly recipe.
4. **Maintain/repair:** task- and machine-specific skills, tools, materials and facilities; do not copy the Precision Mechanisms 30 gate automatically.
5. **Early progression:** the **basic Field Pump must remain operational and routinely repairable without a Gear Assembly**. If a later, optional upgraded pump requires one, that dependency must be justified and explicit.
6. **Supply:** specialist player crafting, mechanically plausible salvage and a limited costly NPC fallback to avoid professions getting stranded by a thin market. NPC vendors, price, stock and actual salvage sources remain TBD. NPC supply should not undercut dedicated player crafters.

This protects Industry players and other non-Mechanics specialists from having to master the entire component manufacturing tree merely to participate in their profession.

## Candidate consuming equipment — not yet confirmed recipes

| Candidate | Proposed role | Design state |
| --- | --- | --- |
| Optional upgraded Field Pump | Transmission mechanism | Possible, not required by the basic pump |
| Oil Distillation equipment | Controlled auxiliary mechanical feed/pumping | Only if its actual build/upgrade/repair content justifies it |
| Named industrial machinery | Component replacement in defined repair tasks | Not automatically required |
| Later steam-carriages and trains | More complex mechanical transmission | Future milestone |

Do not silently insert Gear Assembly into existing equipment recipes to manufacture artificial demand. Consumers become canonical **only once a named recipe, upgrade or repair has been designed**.

## Inspect roles

Use the generic layered Inspect rules, not item-specific server code.

- **Precision Mechanisms:** alignment, tooth wear, backlash/play, workmanship and likely mechanical defects.
- **Engineering Theory:** structural suitability, loads and design constraints.
- **Industrial Machinery:** consequences for the machine into which the assembly is installed.

## Unresolved / future work

- Fastener Set NPC availability, regional sourcing, and salvage distribution (recipe now locked).
- Specific installation, operation, maintenance and repair gates for named host items.
- Actual consuming recipes, upgrade variants and repair activities.
- NPC supply source, stock, prices and salvage tables.
- Maximum stack size, repair cost, salvage return, upkeep consumables/time, fine quality progression thresholds, and detailed failure outcomes.

See also: [Economy + Crafting](../../catalogue/economy-and-crafting.md), [Skills and Progression](../../../01-player/skills-progression.md), and [Facilities and Room Progression](../../../06-bases/workstations/facilities-and-room-progression.md).
