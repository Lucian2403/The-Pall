# Economy + Crafting

Status: PROVISIONAL foundation.

## Core principle

The Pall economy should behave like an industrial chain rather than a generic crafting menu.

Players should rarely remain fully self-sufficient at higher progression. Exploration, refining, component manufacture, specialist crafting, logistics and trade should feed one another.

Primary chain:

**Raw resources -> Processed materials -> Components -> Finished goods**

Equipment wear, consumables, repairs, vehicle operation, taxes and construction create permanent demand.

## First playable scope

The first playable version should contain enough economic breadth to create real trade and specialization from the start.

The earlier 50-70-item estimate is now too tight for the agreed food, herb and regional-resource breadth.

Current scope target:
- **first vertical slice:** roughly 45-55 economic items;
- **Phase One content:** roughly 75-90 economic items.

These are ceilings/working ranges, not quotas. Every item still has to justify itself through sourcing, trade, specialization, logistics, or recipes.

### Raw resources — canonical direction

The detailed audited catalogue lives in `phase-one-resource-audit.md` and `resource-acquisition.md`.

Broad Phase One groups:
- safe industrial: Coal, Stone, Timber, Iron Ore, Copper Ore, Clay, Sand, Plant Fibre, Scrap Metal;
- agriculture/livestock: Grain, Vegetables, Eggs, Milk, Chicken Meat, Pork, Beef, Raw Hide;
- hunting: Game Meat;
- common/rare medicinal resources: Yarrow, Calendula, Nettle, Comfrey, Agarwood, Black Turmeric;
- Grey Marches: Sphagnum Moss, March Zeolite, Black Bog Nodules;
- Pall: Crude Oil, Devil's Claw, Violet Fluorspar, Sootlace, Pall Membrane, Scar Resin;
- survival: Drinking Water outside safe-city infrastructure.

Vague older placeholders such as Pall-Touched Ore, Rare Medicinal Growths and Violet/Purple Stone are retired.

### Processed materials — canonical direction

Keep the Phase One processed layer lean:
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
- Medical Alcohol only if Medicine/Chemistry recipes justify it

Processing steps do not automatically become separate tradeable items.

### Components — audited candidates

Strong Phase One candidates:
- Metal Plate
- Fastener Set
- Precision Spring
- Copper Wire
- Copper Fitting
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

Do not add an intermediate merely because the real object would contain one. Finished recipes may consume Sawn Timber, Cloth, Leather, Metal Plate, etc. directly.

Crafted components may have workmanship quality where it materially affects a finished item. Raw and bulk processed materials normally do not use the five-tier craftsmanship ladder.

## Finished goods — provisional examples

### Consumables
- Bread
- Cheap Ration
- Cooked Meat Meal
- Herbal Tea
- Field Medicine
- Antiseptic
- Bandage Pack
- Pall Suppressant / treatment
- Ammunition pack
- Spare Respirator Filter
- Repair Kit
- Weapon Cleaning Kit
- Coat Wax / Sealant

### Equipment
- Canvas Pack
- Sealed Salvage Pack
- Cloth Filter Mask
- Field Respirator
- Basic Work Coat
- Sealed Survey Coat
- Riveted Work Jacket
- Expedition Boots
- Basic Pistol
- Long Rifle
- Industrial Cleaver
- Blacksmith Hammer
- Precision Tool Roll

### Fittings
- Basic Rifle Sight
- Reinforced Stock
- Sling
- Extended Filter Housing
- Reinforced Respirator Seal
- Backpack Tool Rack
- Water Carrier
- Sealed Backpack Compartment

### Base / infrastructure goods

Phase One upgrades should primarily consume existing processed materials/components directly (for example Sawn Timber, Stone, Fired Ceramic, Metal Plate, Fasteners). Dedicated infrastructure intermediates are added only when a recipe later proves they create useful specialization.

## Example production chains

### Respirator chain

Explorer / scavenger:
- Pall Membrane
- Sootlace
- March Zeolite
- salvage/ordinary metal inputs

Processor/component specialists:
- Treated Glass
- Filter Medium
- Lens Set
- Seal Gasket
- Filter Canister
- Copper Fittings

Respiratory crafter:
- Field Respirator

Explorer:
- buys respirator and replacement filters

The respirator later degrades and requires parts or eventual replacement, keeping the chain alive.

### Rifle chain

Resource suppliers:
- Iron Ore / recycled Scrap Metal
- Common Timber
- Copper Ore
- salvaged mechanism parts

Processors:
- Steel
- Sawn Timber
- Copper Ingot

Component makers:
- precision spring
- firing mechanism
- metal plate
- fastener set

Weapons specialist:
- final rifle

The exact mechanical recipes must remain fictionalized and game-oriented rather than attempting to model real-world weapons construction in detail.

### Medicine chain

Forager:
- named herbs with distinct medical roles

Processor/medical crafter:
- Sterile Dressing
- Antiseptic / Medical Alcohol where required
- recipe-specific herb preparation
- Field Medicine

Doctor:
- uses the finished medicine in treatment or buys it for clinical stock.

## NPC role

NPCs prevent economic collapse but do not replace player production.

NPCs may sell:
- basic food;
- crude/common tools;
- low-quality clothing;
- basic repair supplies;
- common ammunition;
- some city-sourced raw materials.

NPC goods should generally be:
- low quality;
- relatively expensive for their quality;
- limited in specialist variety.

NPCs may buy common goods at low baseline prices to create a floor value, but player demand should normally be superior.

## Economic sinks

Coin sinks:
- NPC repair/service fees
- market listing and sales taxes
- housing/property costs
- medical services
- licenses
- transport
- reputation expenditures
- facility upkeep
- guard/workforce costs later

Material sinks:
- coal and oil consumption
- food
- medicines
- ammunition
- filters
- maintenance supplies
- repair kits
- crafting waste
- equipment degradation and destruction
- building upkeep
- vehicle maintenance
- failed expeditions

Recycling must be partial. Ruined items should not return nearly all original materials.

## Crafting specialization

Higher crafting ability may improve:
- material efficiency / reduced waste;
- quality ceiling;
- reliability;
- durability;
- repairability;
- production speed;
- fuel efficiency;
- defect detection;
- salvage recovery.

High-quality output should depend on more than raw skill:
- appropriate breakthrough;
- required material identity/source/condition;
- facility;
- tools;
- recipe/blueprint understanding;
- relevant specialization.

The economy should reward buying components from other players rather than mastering every upstream profession.

## First-build design target

The first playable economy should already support:
- gathering/scavenging;
- refining;
- component manufacture;
- finished crafting;
- cooking;
- medicine;
- repair/maintenance supplies;
- equipment replacement;
- fitting production;
- player market trading.

It should feel like a small economy, not a tutorial placeholder.


## Background civic demand

The city should consume ordinary goods even when no visible player or NPC merchant is buying them.

This is not simulated fake NPC characters placing market orders. It is a controlled systemic sink representing:
- households;
- workshops;
- municipal works;
- hospitals;
- barracks;
- factories;
- taverns;
- construction;
- transport;
- maintenance.

Typical background-demand goods:
- coal;
- timber;
- stone;
- cloth;
- leather;
- basic food;
- common medicine;
- iron/steel products;
- simple tools;
- construction materials.

### How it should work

Each commodity can have:
- a baseline demand per real-world day;
- a preferred price band;
- a maximum amount the city will absorb per period;
- demand modifiers from world events;
- optional reputation/faction modifiers.

The system should buy only limited quantities and generally at unattractive-to-moderate prices.

Purpose:
- establish a soft floor value;
- prevent basic commodities becoming worthless in low-population periods;
- create permanent material sinks;
- make production viable without replacing player demand.

It must not:
- guarantee profit at any production cost;
- absorb infinite supply;
- outbid real players;
- behave as a hidden price-fixing mechanism.

Example:
The city may consume up to 2,000 units of Coal per day at a dynamic baseline around 6-8 coins each. If players flood the market, the civic buyer quota fills and extra coal must find player demand or wait. During a cold snap or rail-construction event, demand may temporarily rise.

Background demand may be represented through market UI as named institutional demand such as:
- Municipal Fuel Office;
- Dock Quarter Kitchens;
- Physicians' Stores;
- Foundry Consortium;
rather than pretending individual NPC shoppers exist.

## Frontier traders and procedural caravans

The Grey Marches and Pall zones may contain temporary traders, caravans, salvagers, expedition camps and wandering specialists.

These are visible world content, not economic stabilization bots.

Possible forms:
- nomad caravan;
- scavenger convoy;
- lone explorer;
- military supply camp;
- travelling apothecary;
- engineer expedition;
- black-market peddler;
- stranded trade wagon;
- temporary frontier market.

They may:
- sell limited quantities of unusual resources;
- sell rare components;
- occasionally carry one high-quality finished item;
- buy specific goods at unusually good prices;
- offer barter instead of coins;
- provide rumours, maps, contracts or discoveries;
- disappear or relocate later.

### Procedural generation

A trader instance can be generated from authored building blocks:
- trader/archetype;
- faction/allegiance;
- location or route;
- inventory theme;
- quality ceiling;
- stock quantity;
- price modifier;
- wanted goods;
- duration;
- risk/event hook.

The system should never free-generate arbitrary canonical items. It selects from valid item pools and rule tables.

Example inventory:
- Fine Field Respirator x1
- Violet Stone x5
- Precision Valve x2
- High-Capacity Filter x3
- Pall-Touched Alloy x7

When sold out, stock does not immediately regenerate.

### Availability

Frontier traders should be:
- temporary;
- limited-stock;
- geographically inconvenient;
- sometimes dangerous to reach;
- not guaranteed to appear on a fixed schedule.

Their position may be discovered through:
- exploration;
- rumours;
- faction contacts;
- map intelligence;
- player reports;
- encounter outcomes.

Some traders can persist for hours or days; others may exist only for one world-event window.

### Pricing

Frontier pricing can be significantly above city norms for scarce goods.

Likewise, they may pay a premium for items difficult to obtain locally.

Example:
A caravan deep in the Grey Marches might sell Violet Stone at 180 coins when the city market averages 130, because the player is paying for immediate availability far from home.

The same caravan might buy:
- medicine;
- food;
- filters;
- ammunition;
at above-city prices because resupply is difficult.

This creates two-way frontier trade rather than simple rare-item vending.

### Important limits

Frontier merchants should not become reliable vending machines for endgame equipment.

Rare finished goods should be:
- uncommon;
- quantity-limited;
- procedurally selected;
- expensive;
- sometimes damaged or lower durability;
- constrained by trader archetype and region.

A Fine respirator appearing in a caravan should feel like a lucky find, not a daily purchase route.

### Player interaction

Players may discover the same caravan and compete economically without requiring PvP.

Possible consequences:
- first buyers deplete limited stock;
- rumours spread through chat or player-made maps;
- merchants speculate by transporting goods back to the city;
- explorers sell location intelligence;
- players may escort or assist certain caravans;
- faction reputation can unlock hidden stock or better prices.

This system supports discovery, trade, logistics and player communication at the same time.


## Economic harshness guardrails

The Pall should be economically demanding without making routine play feel like constant financial attrition.

Core rule:

**Basic survival should be sustainable. Ambition should be expensive. Scale should be very expensive.**

### Normal play should remain net-positive

A reasonably competent player completing an ordinary activity successfully should usually earn enough to:
- replace routine consumables;
- absorb ordinary equipment wear;
- cover expected travel/supply costs;
- retain a meaningful surplus.

Poor runs may break even or lose a little. Disastrous runs can be costly. Skilled, well-prepared or lucky runs should be strongly profitable.

Routine successful play must not routinely consume nearly all earnings.

### Avoid cost stacking

Do not attach every possible expense to the same activity.

Possible cost families:
- core costs: materials, fuel where appropriate, durability, food/supplies;
- convenience/service costs: NPC repair, transport, storage, specialist services;
- scale costs: property upkeep, machinery, workers, guards, vehicles;
- market friction: modest listing/sales fees;
- high-risk costs: Pall filters, advanced medicine, specialist recovery/repair.

Only a few should dominate any one activity.

### Safety-net activities

City work and other low-risk activities should provide a reliable recovery path for broke players.

A player must never become economically trapped because they cannot afford the equipment required to earn the money needed to buy that equipment.

Low-risk work should be less profitable than dangerous exploration, but dependable and low-overhead.

### Growth expenses should create capability

Major spending should usually purchase or unlock something tangible:
- room;
- workshop;
- facility;
- vehicle;
- storage;
- machine;
- equipment;
- access to a new production chain.

Recurring upkeep should normally be much smaller than acquisition cost.

Advanced infrastructure should unlock new earning potential rather than function only as a tax.

### Upkeep should not punish absence excessively

Returning after time away should not routinely mean catastrophic loss.

Unpaid or overdue upkeep may:
- reduce efficiency;
- disable advanced production;
- require servicing before use.

It should not normally delete months of progress, destroy property or create impossible debt.

### Costs should be understandable

Players should be able to estimate the financial shape of an activity.

Higher Commerce, relevant skill, familiarity or tools may reveal more precise forecasts such as:
- expected supply cost;
- likely repair/wear cost;
- estimated break-even value;
- likely market value range.

Harshness should come from informed risk and overreach, not opaque surprise fees.

### Balancing rule

When tuning content, use these checks:
1. Is successful normal play net-positive?
2. Are basic activities low-overhead?
3. Are large recurring costs tied to optional ambition/scale?
4. Can a broke player recover without outside charity?
5. Does major spending create new capability or earning potential?
6. Are losses understandable and reasonably forecastable?
