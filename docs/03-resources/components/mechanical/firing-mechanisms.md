# Firing Mechanisms — Phase One

**Status: LOCKED (updated 2026-10-12)** for recipe inputs, crafting gates and times, technological tiers, finished weights, durability and full-condition reliability. Operational wear and repair/compatibility systems still need validation.

Every firearm has one **required internal Firing Mechanism** component, distinct from the optional modification slots. The name identifies a gameplay component family; individual firearm families may have different compatible actuation profiles, including for an eventual pneumatic weapon. Do not assume an identical physical part fits every firearm.

**Technology tier** (Basic / Refined / Precision) and **craftsmanship quality** (Crude / Standard / Well-made / Fine / Masterwork) are separate dimensions. No technology tier 4 is defined.

## Recipes and manufacturing progression

All recipes yield **1** compatible internal mechanism.

| Input / property | T1 Basic | T2 Refined | T3 Precision |
| --- | ---: | ---: | ---: |
| Bulk Steel | **0.25 kg** | **0.30 kg** | **0.35 kg** |
| Basic Spring | **1** | 0 | 0 |
| Precision Spring | 0 | **1** | **2** |
| Fastener Set | **2** | **2** | **4** |
| Output | 1 | 1 | 1 |
| Mechanics → Precision Mechanisms (raw) | **5** | **20** | **40** |
| Precision Bench | **T1** | **T2** | **T3** |
| Crafting time per item | **20 s** | **30 s** | **50 s** |
| Finished weight (LOCKED) | **0.35 kg** | **0.50 kg** | **0.75 kg** |
| Combined input mass | **0.40 kg** | **0.55 kg** | **0.85 kg** |
| Nominal fabrication loss | **0.05 kg** | **0.05 kg** | **0.10 kg** |

Fastener Set weighs **0.025 kg each**, Basic Spring **0.10 kg**, Precision Spring **0.20 kg**. Metal Plate and Copper Fitting are **not** ingredients. No Gear Assembly in the firearm mechanism.

T3 no longer consumes **Manganese Concentrate directly**. Its two Precision Springs already create upstream Manganese Concentrate demand. Assembling T3 requires more material and additional high-tier springs, without introducing a new input category or implying that the T3 Bench performs a separate manganese-finishing process.

**Mass balance locked:** T2 consumes 0.55 kg of input materials and produces a **0.50 kg** mechanism (nominal 0.05 kg fabrication loss). T3 consumes 0.85 kg of input materials and produces a **0.75 kg** mechanism (nominal 0.10 kg fabrication loss). T1 remains **0.35 kg**. These losses are abstractions; they do not automatically create recoverable scrap.

Bulk materials are measured in kg and can be consumed fractionally. Manufactured springs and Fastener Sets use discrete counts.

## Baseline attributes

Values are Standard craftsmanship at full condition.

| Stat | T1 Basic | T2 Refined | T3 Precision |
| --- | ---: | ---: | ---: |
| Activation reliability | **97%** | **98.5%** | **99.5%** |
| Base durability | **80** | **100** | **120** |
| Weight | **0.35 kg** | **0.35 kg** | **0.40 kg** |
| Direct weapon damage bonus | **None** | **None** | **None** |
| Working wear suggestion per 100 discharges | *4* | *3* | *2* |

The per-100-discharge wear figures are **PROVISIONAL**, awaiting combat and maintenance balance. Reliability is one finished-mechanism activation value, not compounded with an independent spring-failure roll. The spring's 90%/95% *mechanical consistency index* is an assembly/quality/inspection characteristic, not a literal 10%/5% independent chance of per-shot failure.

Mechanism condition can contribute to increased malfunction risk as durability declines. Exact final host-weapon malfunction integration, quality modifiers, repair recipes/costs and per-family installation gates remain TBD; avoid counting the same underlying condition as multiple independent failures.

## Gameplay / economy rules

- All firearms require one compatible internal mechanism; item technological tier may have minimum compatibility restrictions in later weapon designs.
- Owning, trading, looting or ordinary use does **not** inherit the Precision 5/20/40 crafting skill gate.
- Installing, inspecting and repairing use separate relevant skills, primarily **Weapon Maintenance**, with requirements determined by the exact firearm/task.
- Component craftsmanship quality is independent of technology tier and is limited by the host item's allowed fitting quality. A Masterwork T1 is still T1.
- Tier upgrades emphasize reliability, service life and refinement, **not direct projectile damage**.
- T1 should be accessible from city trade/vendors and ordinary salvage; T2/T3 support specialist production and trade.
- The Firing Mechanism is a distinct complete assembly component. Avoid separate per-discharge tracking of consumed input springs and redundant rolls.

## Dependencies and open work

Fastener Sets: [locked recipe](../metalwork/fastener-set.md). Basic Spring: [locked recipe and reliability](basic-spring.md). Precision Spring: [Economy and Crafting](../../catalogue/economy-and-crafting.md).

Still required before complete weapon integration: explicit pistol/rifle/scattergun/pneumatic compatibility data, host-dependent condition effects and wear tests, repair recipe/cost and durability loss, NPC/salvage market supply, and quality adjustment curves.
