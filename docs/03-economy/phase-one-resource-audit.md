# Phase One Resource Audit

Status: AUDITED / provisional balance values remain open.

## Verdict

The Phase One resource economy is **structurally coherent**. The main risk is no longer a lack of depth; it is duplicate itemization and legacy placeholder names.

The audit therefore keeps the agreed resource breadth but applies four hard rules:

1. One inventory item only when it creates a meaningful economic decision.
2. Natural source quality normally changes **yield**, not the item identity.
3. Processing steps do not automatically become separate tradeable items.
4. Old vague placeholders are retired once a grounded named resource replaces them.

The current resource breadth is viable because acquisition, harvesting, discovery, processing, market and interaction logic are generic systems driven by data.

## Canonical Phase One source-level catalogue

This list contains resources that can enter the economy directly from extraction, farming, hunting, salvage or discovery.

### Safe city / protected outskirts backbone

| Resource | Primary source | Main purpose | Long-term sink |
| --- | --- | --- | --- |
| Coal | mines, coal works | fuel | furnaces, heating, refining, machinery |
| Common Stone | quarries | construction | rooms, workshops, civic works |
| Common Timber | managed forestry, reclamation | carpentry/construction | buildings, repairs, equipment |
| Iron Ore | protected mines | ferrous metallurgy | tools, equipment, machinery |
| Copper Ore | low-grade protected workings; richer seams farther out | precision industry | valves, wire, machinery, respirators |
| Clay | clay pits/earthworks | ceramics/infrastructure | Fired Ceramic, facilities |
| Industrial Sand | pits/river works | glass/ceramic processes | Treated Glass, facilities |
| Plant Fibre | farms/textile work | textiles | Cloth, bandages, clothing |
| Scrap Metal | demolition/city salvage | recycling/repair | refining, repair, components |
| Grain | protected farms | food/feed/processing | Flour, Bread, livestock feed |
| Vegetables | protected farms | food/feed | meals, livestock upkeep |
| Eggs | chicken flocks | cooking | meals/baking |
| Milk | cattle | cooking | meals; later dairy if justified |
| Chicken Meat | chicken slaughter | food | meals |
| Pork | pig production | food | meals |
| Beef | cattle slaughter | food | meals |
| Raw Hide | livestock/hunting | leather | equipment, packs, repairs |
| Yarrow | gardens/fields | bleeding/wound medicine | medical consumables |
| Calendula | gardens/fields | wound care | medical consumables |
| Nettle | disturbed ground/farms | restorative/nutritional | food/medicine |
| Comfrey | damp fields/gardens | trauma treatment | medical consumables |
| Agarwood | rare logging discovery in appropriate cultivated/remnant trees | calming/luxury medicine | medicine/luxury demand |

### Hunting / frontier food

| Resource | Primary source | Main purpose |
| --- | --- | --- |
| Game Meat | deer/boar; later bear/bison | food and specialist meals |

Different animals can produce different quantities while recipes use food tags where appropriate. Phase One does not require separate Venison, Boar Meat, Bear Meat and Bison Meat inventory items unless later cooking design proves that distinction valuable.

### Grey Marches specialist resources

| Resource | Why Grey Marches matters | Main purpose |
| --- | --- | --- |
| Black Turmeric | rare suitable microclimates/botanical remnants | high-end anti-inflammatory/restorative medicine |
| Sphagnum Moss | surviving clean bog ecology | advanced wound dressings |
| March Zeolite | specific clean geological belt | filtration/decontamination |
| Black Bog Nodules | functioning wetland iron/manganese chemistry | advanced steel/metallurgy |

Copper, herbs, game and salvage may also have better Grey Marches sources, but they are not region-exclusive signature items.

### Pall specialist resources

| Resource | Why Pall matters | Main purpose |
| --- | --- | --- |
| Crude Oil | exposed/sealed geological/industrial deposits accessible only in dangerous territory | advanced fuel/lubrication/chemistry |
| Devil's Claw | Pall-adapted surviving botanical population | pain/inflammation medicine |
| Violet Fluorspar | dangerous exposed fluorite deposits | metallurgy/glass/optics |
| Sootlace | melanized Pall-adapted fungus | advanced filtration/decontamination |
| Pall Membrane | tissue from specific Pall fauna | flexible environmental seals |
| Scar Resin | extreme defensive resin from Pall-stressed trees | sealants/waterproofing/maintenance |

The four **signature Pall materials** remain Violet Fluorspar, Sootlace, Pall Membrane and Scar Resin. Crude Oil is an industrial resource and Devil's Claw is a medicinal plant, so they do not dilute the signature-material concept.

### Survival resource

**Drinking Water** is required outside safe-city infrastructure.

It should be treated as a Phase One survival consumable even though it is not a normal speculative commodity:
- fill cheaply/free in safe city;
- stored in canteens/tanks;
- has weight/volume;
- consumed by Thirst;
- field water sourcing/treatment can remain limited in Phase One.

## Canonical processed materials

Keep the processed layer lean.

Phase One core:
- Iron Ingot
- Copper Ingot
- Steel
- Sawn Timber
- Leather
- Cloth
- Flour
- Fired Ceramic
- Treated Glass
- Refined Oil
- Manganese Concentrate

Provisional additional processed reagent:
- Medical Alcohol — keep only if Medicine/Chemistry recipes need it; Grain can supply the fermentation/distillation feedstock without creating another crop.

Important:
- not every raw material needs a processed inventory form;
- March Zeolite can be prepared as part of making Filter Medium;
- Sootlace treatment can be part of a filter recipe;
- Pall Membrane stabilization can be part of a seal/equipment recipe;
- Scar Resin purification can be part of a sealant recipe;
- Sphagnum sterilization can be part of medical crafting;
- Fluorspar preparation can be part of metallurgy/glass processing.

If later trade data shows that one of these processing professions deserves its own market item, it can be promoted into a separate processed good without changing the architecture.

## Component layer audit

The component layer is useful because it creates player specialization, but it must not turn every physical part into a market item.

Strong Phase One candidates:
- Metal Plate
- Fastener Set
- Precision Spring
- Copper Wire
- Brass Fitting
- Pressure Valve
- Gear Assembly
- Firing Mechanism
- Leather Strap
- Sealed Seam Kit
- Filter Medium
- Seal Gasket
- Filter Canister
- Lens Set
- Sterile Dressing

Conditional / cut unless recipes prove the need:
- Reinforced Frame
- Cloth Panel
- Harness Assembly
- Syringe/applicator component
- Machine Part Crate
- Pressure Pipe
- Workshop Bench Components
- separate Timber Beam component

Finished recipes can consume Sawn Timber, Cloth, Leather, Metal Plate, etc. directly where an extra intermediate would add only bookkeeping.

## Raw vs processed vs component quality

Do not apply Crude / Standard / Well-made / Fine / Masterwork universally.

- Natural resources: **no craftsmanship quality tier**.
- Processed bulk materials: normally fungible; no five-tier quality ladder in Phase One.
- Crafted components: may use craftsmanship quality when workmanship materially affects the finished item.
- Finished equipment/fittings: use the established quality system where supported.

Natural source conditions such as rich ore, mature herbs, straight timber or clean clay normally affect:
- amount recovered;
- waste;
- extraction time;
- contamination;
- tool wear.

They should not fragment inventory into "Fine Iron Ore", "Masterwork Yarrow", "Straight Timber", etc.

## Acquisition-system coverage

### Industrial extraction
Covered by:
- Coal
- Stone
- Iron Ore
- Copper Ore
- Clay
- Sand

Generic systems required:
- worksite;
- tool use/degradation;
- contextual interactions;
- site throughput/reserve;
- wage job vs independent extraction.

### Forestry
Covered by:
- Timber
- rare Agarwood
- Pall Scar Resin

Generic systems required:
- shared/managed stands;
- target selection;
- harvest pressure/regrowth where appropriate;
- logging interactions;
- hauling.

### Farming/livestock
Covered by:
- Grain
- Vegetables
- Eggs
- Milk
- Chicken Meat
- Pork
- Beef
- Raw Hide
- Plant Fibre

Generic systems required:
- Farm Holding capacity;
- crop/livestock allocation;
- offline production cycles;
- feed input;
- output storage;
- occasional contextual incidents.

No breeding/genetics/veterinary simulation in Phase One.

### Hunting
Covered by:
- Game Meat
- Raw Hide
- Pall Membrane from selected fauna

Generic systems required:
- Tracking;
- combat;
- carcass recovery;
- carrying/logistics;
- yield loss from poor kills.

Fishing is LATER.

### Herbalism
Covered by:
- Yarrow
- Calendula
- Nettle
- Comfrey
- Black Turmeric
- Sphagnum Moss
- Devil's Claw

Generic systems required:
- shared hidden/public patches;
- private knowledge;
- careful/standard/aggressive harvesting;
- regrowth/depletion;
- skill-dependent identification/yield.

### Salvage
Covered by:
- Scrap Metal;
- recovered standard components;
- serialized complex mechanisms.

Salvage is a method of acquisition, not a requirement to create dozens of separate "salvage resources."

### Oil
Covered by:
- Crude Oil

Adds two generic capabilities worth implementing:
- extraction tool requirement (Field Pump);
- liquid container capacity.

Do not separately itemize hoses, funnels, couplers, etc.

## Regional relevance audit

### Safe city / outskirts

Role:
- reliable economic foundation;
- recovery path for broke players;
- basic food/fuel/material supply;
- entry professions.

End-game relevance remains through:
- Coal;
- Iron/Copper;
- Grain;
- Cloth/Leather;
- Timber;
- common herbs;
- civic demand.

The safe economy must never become worthless simply because Pall zones exist.

### Grey Marches

End-game reasons are strong enough:
- March Zeolite for filtration;
- Black Bog Nodules for advanced metallurgy;
- Sphagnum for trauma medicine;
- Black Turmeric as rare medicine;
- richer salvage/copper/hunting opportunities.

This successfully prevents the Grey Marches from becoming a disposable mid-level zone.

### Pall

Reasons:
- Crude Oil;
- Devil's Claw;
- Violet Fluorspar;
- Sootlace;
- Pall Membrane;
- Scar Resin;
- advanced salvage/fauna/discoveries.

The Pall provides specialist inputs rather than universal replacements for ordinary resources.

## Permanent sink audit

Every core resource currently has a credible sink:

- Coal -> burned permanently.
- Stone -> construction/civic works.
- Timber -> construction/equipment/repairs.
- Iron/Copper -> equipment, components, repairs, partial loss through recycling.
- Clay/Sand -> ceramics/glass/facilities.
- Fibre/Hide -> degradable equipment/medical goods.
- Grain/Vegetables/Eggs/Milk/Meat -> consumed as food/feed.
- Herbs -> medicine consumed.
- Oil -> fuel/maintenance consumed.
- March Zeolite/Sootlace -> filters/decontamination consumed or wear out.
- Black Bog Nodules/Fluorspar -> industrial processing inputs consumed.
- Pall Membrane -> degradable protective gear.
- Scar Resin -> maintenance/sealant consumed.
- Scrap Metal -> recycling/repair feedstock.

No major resource currently lacks a long-term reason to leave the economy.

## Legacy placeholders to retire

The following earlier names should **not** remain separate Phase One resources:

- Industrial Oil -> replaced by **Crude Oil / Refined Oil**
- Violet Stone / Purple Stone -> replaced by **Violet Fluorspar**
- Pall-Touched Ore -> remove; vague and redundant
- Rare Medicinal Growths -> replace with named plants
- Ancient Precision Components -> treat as salvageable complex mechanisms/components
- Intact Glass -> salvage may recover Treated Glass or Lens Set directly
- Chemical Residue -> defer until Chemistry design proves it needs a distinct commodity
- Contaminated Alloy Scrap -> use Scrap Metal with contamination where mechanically relevant, or a specific salvage result
- Stabilized Pall Material -> remove vague generic material
- Seasoned Hardwood -> not Phase One; use Common Timber -> Sawn Timber
- Handle Blank / Plank / Cut Stone / Crushed Aggregate -> do not create separate Phase One items without a recipe-driven need
- Generic Herbal Extract -> remove as a universal commodity; named herbs must retain their identity
- Raw Fish / Fish Stew -> LATER with Fishing
- Fruit -> LATER unless cooking design establishes a clear role

## Missing or unresolved links

### 1. Drinking Water
Previously present in survival rules but absent from the formal resource catalogue. Must be added before implementation.

### 2. Food spoilage
Milk/meat/vegetables imply perishability, but a full expiration system would add major inventory/market complexity.

Recommendation for Phase One:
- no per-item freshness grades;
- no stack fragmentation by expiry;
- farm/workshop incidents may model spoilage;
- detailed preservation/spoilage system is LATER.

### 3. Farm inputs
Farms must not create food from nothing.

Phase One can reuse existing resources:
- Grain planting reserves some Grain as seed;
- Vegetable planting reserves a small amount of Vegetables/planting stock;
- Chicken/Pig/Cattle consume feed based on livestock population;
- safe-city water is infrastructure.

Do not introduce Seed, Hay, Silage, Chicken Feed, Cattle Feed, Fertilizer, etc. unless later gameplay needs them.

### 4. Liquid container support
Oil and expedition water require generic container mechanics.

The item schema should support:
- liquid capacity;
- compatible content type;
- current contained amount;
- container durability/seal.

This is generic infrastructure, not an Oil-specific hack.

### 5. Resource-site architecture
Herbs, oil, geological deposits and some salvage discoveries can share a generic world resource-site model:
- site ID;
- type;
- world location;
- reserve/population;
- regeneration/depletion;
- contamination;
- discovery/knowledge state;
- extraction requirements.

This should be implemented once and configured by data.

## Scope count

The agreed breadth now implies roughly:
- ~34 source-level/survival resources;
- ~11-12 core processed materials;
- ~15 strong component candidates;
- finished consumables/equipment/fittings on top.

Therefore the earlier **50-70 total economic items** target is now too restrictive if interpreted as the full Phase One launch catalogue.

Recommendation:
- first vertical slice: roughly **45-55 total economic items**;
- Phase One content target: roughly **75-90 total economic items**, provided they reuse the same generic systems.

Do not inflate the target merely to hit a number. Every item must pass the economic-decision test.

## Phase One stop rule

Do not add another ordinary resource before implementation unless it fills a demonstrated missing role.

New resource proposals must answer:
1. What unique sourcing or gameplay does it create?
2. What distinct recipes/sinks need it?
3. Why can an existing resource not serve that role?
4. Does it require a new subsystem?
5. Is that subsystem worth Phase One scope?

The resource catalogue is now broad enough to proceed to refining/processing design.
