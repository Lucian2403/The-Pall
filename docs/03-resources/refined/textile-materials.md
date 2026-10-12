# Leather and Cloth — Phase One Standardized Materials

**Status: LOCKED (2026-10-12)** for one-unit weights, existing Leather conversion, revised Cloth conversion and Seal Gasket unit weight. Character/equipment recipes and filter statistics are not changed by this record.

## Units

Both processed materials are **discrete standardized pieces**, not kilogram-denominated bulk commodities.

| Material | Unit identity | Weight per unit | Quality |
| --- | --- | ---: | --- |
| **Leather** | One workable trimmed leather panel | **0.30 kg** | No crafting-quality grades for processed bulk |
| **Cloth** | One standard woven textile piece | **0.15 kg** | No crafting-quality grades for processed bulk |

Neither raw **Raw Hide** nor raw **Plant Fibre** receives a material weight solely from these processed-material values; their finished-to-raw mass balance should be handled if and when relevant. Counts, not fractional kg, are used in the crafting recipes consuming these pieces.

## Production

At the existing **Textile & Leather Workshop** using **Craftsmanship → Tailoring**:

- **2 Raw Hide → 1 Leather** (unchanged).
- **4 Plant Fibre → 1 Cloth** (**revised from 2 → 1 on 2026-10-12**).

The Cloth production skill requirement and the existing workshop requirements remain unchanged. The 4:1 source yield represents selection, preparation, spinning and weaving; it does not introduce a new intermediate item, quality grade, bench attachment or separate processing profession.

## Confirmed consumers / implications

### Precision Tool Roll

Existing locked recipe: **0.50 kg Steel + 4 Fastener Sets + 2 Leather + 1 Cloth → 1 Precision Tool Roll**. With Steel at 0.50 kg, four Fasteners at 4 × 0.025 kg = 0.10 kg, two Leather pieces at 0.60 kg total, and one Cloth at 0.15 kg, **input mass = 1.35 kg**. Finished roll weight is now **LOCKED at 1.20 kg**, with **0.15 kg nominal loss (11.1%)**.

### Seal Gasket

Existing locked recipe: **1 Leather + 1 Cloth → 4 Seal Gaskets**, each now **0.10 kg** (increased from **0.02 kg**).

- Material input = 0.30 + 0.15 = **0.45 kg**.
- Four gaskets output = 4 × 0.10 = **0.40 kg**.
- Nominal trimming/finishing loss = **0.05 kg (11.1%)**.
- The gasket's **98% baseline gasket seal** and **65 durability** are unchanged. Craft requirement **Tailoring 15 at T1 Textile & Leather Workshop** is unchanged.

The gasket increases the structural weight of every Grey/Pall/Deep Pall Filter Canister by **0.08 kg**, because each uses one. The Crude Canister has no gasket and is unaffected.

| Canister | Structure before | Structure after | Filter Medium mass |
| --- | ---: | ---: | --- |
| Crude | 0.50 kg | **0.50 kg** | Excluded |
| Grey | 0.60 kg | **0.68 kg** | Excluded |
| Pall | 0.60 kg | **0.68 kg** | Excluded |
| Deep Pall | 1.10 kg | **1.18 kg** | Excluded |

## Respiratory system status: no redesign

The [Filter Progression](../final-products/respiratory/filter-progression.md) already locks all four Filter Medium recipes, Ash/Pall filtration, service lives, breathing resistance, Pressure Bench/skill requirements, canister sealing, structural condition behavior and the Seal Gasket's non-weight stats. **No such values are being reopened**.

The workbook's **individual Filter Medium weight_kg values remain blank**; similarly the published canister structural weights deliberately say they exclude medium mass. This is a specific optional bookkeeping detail, **not** a claim that Filter Medium recipes, statistics or respiratory mechanics are undefined. Do not fill those blank fields with invented numbers.

See [Refining and Processing](refining-and-processing.md), [Precision Tool Roll](../final-products/tools/precision-tool-roll.md), [Filter Progression](../final-products/respiratory/filter-progression.md).
