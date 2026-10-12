# Basic Spring — Phase One

Status: **LOCKED** for component identity, recipe, skill/workstation gate and physical characteristics. Spring consistency (90%) and condition multipliers are **LOCKED**.

Decision date: **2026-10-11**.

## Identity and place in progression

Basic Spring is an entry-level return-action mechanical component under **Mechanics → Precision Mechanisms**. It is a **distinct item**, not the Crude craftsmanship-quality version of the existing Precision Spring. Higher-quality Basic Spring stays a Basic Spring; it does not transform into a Precision Spring.

- Item ID: `itm_basic_spring`
- Recipe ID: `rec_basic_spring`
- Category: Component / Precision mechanism
- Confirmed consumer: **T1 Basic Firing Mechanism**, see [Firing Mechanisms](firing-mechanisms.md)
- Salvageable, tradable and marketable; quality/condition-compatible copies may stack (maximum stack size TBD)

## Locked recipe

**0.50 kg Steel → 4 Basic Springs**

| Requirement | Value |
| --- | --- |
| Raw skill | **Precision Mechanisms 5** |
| Workstation | **T1 Precision Bench** |
| Crafting time | **20 seconds per batch** |
| Output | **4 Basic Springs** |
| Weight per completed spring | **0.10 kg** |
| Total spring output weight | **0.40 kg** |
| Nominal fabrication loss | **0.10 kg** Steel |

Steel is a bulk processed commodity, and the maker may **buy, trade for or salvage** it. Steel's separate Refining 20 production route is **not** a prerequisite to the spring's Precision Mechanisms 5 recipe. There is no Precision Spring ingredient and no invented intermediary.

Material failure behavior, quality-roll specifics, blueprint/discovery rules and waste-recovery mechanics remain TBD; the nominal `0.10 kg` difference is production loss, not a new salvage byproduct.

## Locked base characteristics

| Property | Value |
| --- | --- |
| Item weight | **0.10 kg** |
| Base/max durability | **60 / 60** |
| Repairable | **No**; replace when worn beyond use |
| Salvageable | **Yes**, with yield TBD |
| Tradable / marketable | **Yes** |
| Stackable | **Yes**, when quality/condition classes permit; stack cap TBD |
| Craftsmanship quality | Separate from technological item identity; exact quality availability TBD |

Basic Springs wear through meaningful mechanical use. Exact operation wear rate and environmental effects are **not defined**. Do not introduce extra fatigue, elasticity, tension, or stored-energy meters in Phase One.

## Locked spring consistency

**90% Standard-quality spring consistency/reliability index is LOCKED.** It expresses mechanical consistency, not a literal 10% per-use failure probability. The existing Precision Spring retains its **95%** rating unchanged. This metric is a component quality input, **not a separate per-shot malfunction roll** after the spring is incorporated into a Firing Mechanism.

The Basic Spring condition curve **is locked to** the previously defined Precision Spring multipliers:

| Remaining durability | Condition | Proposed consistency multiplier |
| --- | --- | ---: |
| 81–100% | Sound | 100% |
| 61–80% | Worn | 98% |
| 41–60% | Damaged | 92% |
| 21–40% | Failing | 80% |
| 11–20% | Critical | 60% |
| 0–10% | Ruined | Unusable |

The assembled host mechanism should derive one final activation-reliability value, rather than rolling independently for the mechanism and for each of its springs.

## Inspection and acquisition

- **Precision Mechanisms:** shape, mechanical consistency, workmanship and wear.
- **Weapon Maintenance:** effect of the part in a finished firing mechanism.
- **Engineering Theory:** suitability for a given mechanical load/system.
- Purchase and ownership are not gated by Precision Mechanisms; manufacture requires raw Precision **5**.

## Scope boundaries and unresolved work

- This does **not** change the existing Precision Spring (Precision 20), Pressure Valve, or Gear Assembly recipes.
- The T1 Basic Firing Mechanism consumes **1 Basic Spring** per completed mechanism; [its recipe is locked](firing-mechanisms.md).
- Future Basic Spring consumers require named recipes; no speculative sinks.
- Still TBD: per-use durability loss; available item quality grades and modifiers; NPC supply and prices; specific salvage tables; stack cap; beginner Precision 0–5 jobs; mechanism reliability integration.

Related: [Precision Bench](../04-base/facilities-and-room-progression.md), [Economy + Crafting](economy-and-crafting.md), and [Gear Assembly](gear-assembly.md).
