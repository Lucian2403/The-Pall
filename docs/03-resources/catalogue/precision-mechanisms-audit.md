# Precision Mechanisms — Catalogue Audit

**Audit date:** 2026-10-12  
**Status:** Audited. No rebalancing decisions made by this audit.  
**Sources:** Main-branch GitHub design documents; workbook `The_Pall_Game_Data_v0_4_precision_tool_roll_locked.xlsx`; reconciled audit export `The_Pall_Precision_Mechanisms_Audited_2026-10-12.xlsx`.

## Scope and method

Checked **14 linked production recipes** (Basic/Precision Springs; Fastener Set; Copper Wire; Gear Assembly; three Firing Mechanisms; two Rifle Sight upgrades; Lens Set; Refined Fluorspar; Precision Tool Roll; adjacent Pressure Valve) for:

- ingredient count and identity; input resource/item referential integrity and duplicate recipe/item IDs;
- raw subskill requirements; bench tier; crafting duration;
- ingredient mass, output mass and nominal unaccounted fabrication/processing loss;
- craftsmanship quality/condition logic and whether finalized numerical quality rows actually exist;
- upstream material/bench dependencies and the distinction between **LOCKED** and **PROVISIONAL** specifications.

Workbook-level checks across **73 item records, 38 recipe records and 90 ingredient records** detected **no orphan recipe inputs, missing recipe outputs, duplicate item/recipe IDs or invalid existing recipe skill references**.

**Important:** Nominal recipe material mass differences are **not** the same as additional skill-based avoidable waste. The 20% recovery of Refined Fluorspar and the Lens Set's grinding losses are intentional, documented conversion choices.

## Recipe and material audit

All masses in kg. These compare **one manufacturing batch's consumed ingredient mass** with **all outputs from that batch**.

| Output | Raw crafting skill / bench | Seconds | Nominal ingredient kg | Output kg | Difference kg | Assessment |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Basic Spring ×4 | Precision 5 / T1 Precision Bench | 20 | 0.50 | 0.40 | 0.10 | Consistent |
| Precision Spring ×2 | Precision 20 / T1 Precision Bench | 30 | **0.70** | 0.40 | **0.30** | **Revised: 42.9% loss** |
| Fastener Set ×8 | Smithing 5 / T1 Forge | 20 | 0.25 | 0.20 | 0.05 | Consistent |
| Copper Wire ×8 | Smithing 10 / T1 Forge | 20 | 0.10 | 0.08 | 0.02 | Consistent |
| Gear Assembly ×1 | Precision 30 / T2 Precision Bench | 60 | 1.70 | 1.50 | 0.20 | Consistent |
| Basic Firing Mechanism ×1 | Precision 5 / T1 Precision Bench | 20 | 0.40 | 0.35 | 0.05 | Consistent |
| Refined Firing Mechanism ×1 | Precision 20 / T2 Precision Bench | 30 | 0.55 | 0.50 | 0.05 | Consistent |
| Precision Firing Mechanism ×1 | Precision 40 / T3 Precision Bench | 50 | 0.85 | 0.75 | 0.10 | Consistent |
| Calibrated Rifle Sight ×1 | Precision 20 / T2 Precision Bench | 30 | 0.29 | 0.20 | 0.09 | Valid, 31% fabrication difference |
| Optical Rifle Sight ×1 | Precision 40 / T3 Precision Bench | 50 | 0.59 | 0.50 | 0.09 | Consistent |
| Lens Set ×1 | Precision 40 / T3 Precision Bench + Lapping | 90 | 0.45 | 0.15 | 0.30 | Intended optical finishing loss |
| Refined Fluorspar 0.10 kg | Refining 30 / **T2 provisionally** | **120 provisional** | 0.50 | 0.10 | 0.40 | Intended **20% recovery** |
| Precision Tool Roll ×1 | Precision 25 / T2 Precision Bench | 30 | **1.35** | **1.20** | **0.15** | **Resolved with Leather 0.30, Cloth 0.15 kg** |
| Pressure Valve ×1 (adjacent chain) | Pressure Systems 20 / T2 Pressure Bench | 45 | **0.96** | **Not defined** | — | Gasket now 0.10 kg; finished valve mass unresolved |

### Precision Spring economy — REBALANCED, 2026-10-12

The user-approved revised recipe is **0.50 kg Steel + 0.20 kg Manganese Concentrate → 2 Precision Springs** (0.20 kg each). **0.70 kg input → 0.40 kg output** is **0.30 kg nominal fabrication loss (42.9%)**. This replaces the previous **1 kg Steel + 1 kg Manganese Concentrate**, which had an 80% material difference. Mechanic skill **20**, T1 Precision Bench, **30 seconds**, durability **100**, mechanical consistency **95%**, quality availability and condition curve remain unchanged. There are no revised upstream recipes for Manganese Concentrate or downstream consumers, merely lower aggregate material cost per spring batch.

## Quality and condition audit

- **Lens Set** has all five finalized normalized workmanship rows (**Crude → Masterwork**), and 10 numerical optical modifiers; the host sight must apply the optical contribution once, not twice.
- **Precision Tool Roll** has all five finalized quality rows and five eligible field-task time modifiers (0/5/8/12/15%), with durability maxima 80/100/110/120/130.
- **18** items in the workbook have `quality_enabled = true`, but only Lens Set and Tool Roll currently have normalized `33_Item_Qualities` rows. The other **16** require separate eventual definitions. Within the Precision family, this includes the two Springs, Gear Assembly, three Firing Mechanisms and both Rifle Sight upgrades. **Do not invent rank gates or modifier percentages to fill these rows automatically.**
- **Basic Spring** is 90% mechanical consistency; **Precision Spring** 95%. These are not independent per-shot failure rolls once incorporated into a Firing Mechanism.
- Firing Mechanism standard activation reliability 97/98.5/99.5%; operational wear per 100 discharges 4/3/2 remains **PROVISIONAL**.
- Neither Rifle Sight nor Lens Set requires a second random `Reliability %` meter. Aiming-time and numeric accuracy/range combat modifiers remain undefined until firearm combat is designed.
- Integrated T1 iron sights are not a separate craftable recipe; T2/T3 sights are optional, exclusive upgrades.

## Dependency and facility audit

1. **No hard cyclic recipe dependencies found** among the audited component chains. Material producer skill gates are independent of the consumer's crafting skill; goods may be acquired by trading or salvage.
2. **Optical Rifle Sight** consumes Lens Set; Lens Set consumes **0.05 kg Refined Fluorspar**. Nominally **0.50 kg Violet Fluorspar → 0.10 kg Refined Fluorspar** supplies two lenses/sights. Refining **30** and 20% recovery are LOCKED; the **T2 processing assignment and 120 seconds are PROVISIONAL**, as instructed.
3. **Optical Lapping Attachment** is represented in `22_Base_Modules` with its LOCKED materials (1 Gear Assembly + 1 Metal Plate + 4 Fastener Sets), Precision Mechanisms 40 and 120-second install time. These construction ingredients exist only as a **description/note**, not normalized input rows. Decide how base-module build recipes are represented when facility implementation is designed.
4. **Precision Tool Roll** correctly allows portable inspection/alignment/eligible maintenance but cannot replace a Precision Bench, consumable Repair Kit or Weapon Cleaning Kit. Required task tags and actual repair/material costs remain TBD.
5. **Pressure Valve** remains an adjacent consumer of Precision Spring; its **input mass is 0.96 kg** after the Seal Gasket increases from 0.02 to 0.10 kg. Its own finished mass and downstream machine-specific uses should be reviewed with the pressure-component family, not invented here.
6. **Host compatibility and installation:** Firing mechanisms require one compatible internal slot, while sight upgrade fitment and firearm-specific maintenance skill gates remain to be designed with combat and repair systems.
7. The generic facility **quality ceiling** (T1/T2/T3/T4) is separate from a recipe's minimum workstation tier. Masterwork Lens Set requires a T4 Precision Bench and raw Precision Mechanisms 75 even though ordinary Lens Set production starts at T3/40.

## Recording defects corrected in audit workbook

- Added the **existing canonical Mechanics → Weapon Maintenance** subskill to `02_Skills`. Five firearm component `repair_skill_id` links already referenced `skill_weapon_maintenance` without a corresponding skill row. **No specific weapon-repair operation gate was invented.**
- Corrected two outdated spreadsheet notes that said the **Lens Set recipe/weight were TBD**. Lens Set is LOCKED at **0.15 kg**; the Optical Rifle Sight's finished weight is LOCKED at **0.50 kg** with **0.59 kg** input mass.
- Added `37_Precision_Audit` containing ingredient/output mass checks, linked sources, issue register and compact upstream dependency summary.
- All agreed recipes, weights, skill gates and numerical performance stats are otherwise unchanged.

## Prioritized next decisions

| Priority | Decision | Why |
| --- | --- | --- |
| **Resolved 2026-10-12** | Precision Spring recipe rebalance | User approved 0.50 kg Steel + 0.20 kg Manganese Concentrate → 2 springs; nominal 42.9% mass difference. No other spring stats changed. |
| **2** | Finish per-item quality tables only as those components are needed in equipment/repair implementation | Flags currently exist but most grade rows do not |
| **Resolved 2026-10-12** | Leather/Cloth weights; Tool Roll and Seal Gasket mass | Leather 0.30 kg, Cloth 0.15 kg, Tool Roll finished weight 1.20 kg from 1.35 kg input; Seal Gasket 0.10 kg; Cloth output now uses 4 Plant Fibre. |
| **4** | Define mineral-processing facility details without premature workstation attachment inventory | T2/120-second fluorspar processing currently provisional |
| **5** | Normalize installed-module construction recipes when the facility schema is designed | Optical Lapping ingredient list currently notes-only |
| **Later** | Firearm interaction, repair, durability wear, sight bonuses and item compatibility | Depends on actual combat/equipment loop |

**Decision rule:** This audit records and fixes clear bookkeeping problems but **does not amend locked design values**. Outstanding choices remain explicit and should be reviewed separately.

See [Precision Tool Roll](../final-products/tools/precision-tool-roll.md), [Firing Mechanisms](../components/mechanical/firing-mechanisms.md), [Rifle Sights](../final-products/weapon-fittings/rifle-sights.md), [Lens Set](../components/optics/lens-set.md), and [Refined Fluorspar](../refined/refined-fluorspar.md).
