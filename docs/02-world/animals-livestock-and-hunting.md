# Animals, Livestock and Hunting

Status: PROVISIONAL foundation.

## Core principle

Animals should support food, leather, hunting, farming and Pall ecology without becoming a livestock simulator.

Phase One should use a small roster with clear economic roles.

## Domestic animals

### Chicken
Primary outputs:
- Eggs
- Chicken meat

Role:
- cheap city food;
- small household/cooperative farming;
- low space and low operating cost.

### Pig
Primary outputs:
- Pork
- Raw Hide

Role:
- efficient meat animal;
- consumes food waste/byproducts;
- common butcher supply.

### Goat
Primary outputs:
- Milk
- Goat meat
- Raw Hide

Role:
- hardy livestock suitable to poor land;
- more plausible near protected outskirts than large herds everywhere.

### Cattle
Primary outputs:
- Beef
- Milk
- Raw Hide

Role:
- expensive, space-hungry livestock;
- important source of large hides and bulk meat;
- mainly farms/estates rather than personal hut ownership.

Horses are intentionally deferred from Phase One because they would require a deeper animal/logistics system: feeding, injury, veterinary care, Pall exposure, theft, stables and death.

## Farms

Yes, farms should exist.

Basic food and animal products should come from protected agricultural belts, estates and farms near the city.

Farm types may include:
- municipal food farms;
- private estates;
- livestock holdings;
- dairy farms;
- poultry yards;
- small player-owned plots later.

Players do not need to personally raise animals to access meat, milk, eggs or hides.

NPC farms provide baseline supply.

Player farming can become an optional economic path later, but Phase One should focus on jobs/contracts and limited ownership rather than detailed breeding simulation.

## Wild animals

Phase One should use a small safe/near-frontier roster.

### Deer
Outputs:
- meat;
- Raw Hide.

Role:
- medium-value hunting target;
- more efficient hide source than small animals;
- requires tracking and clean shot/kill for best yield.

### Wild Boar
Outputs:
- meat;
- Raw Hide.

Role:
- dangerous for an ordinary hunter;
- high meat yield;
- can injure the player even outside Pall zones.

### Hare / Rabbit
Outputs:
- small meat yield;
- small pelt/byproduct.

Role:
- low-risk hunting/trapping;
- useful early Fieldcraft activity.

### Fish
Outputs:
- fish/meat.

Role:
- safe or low-risk food acquisition;
- distinct from hunting;
- supports rivers, canals and protected fisheries.

Small nuisance/predator animals such as foxes, rats and crows may exist for encounters/flavour, but do not need dedicated economic chains unless later content requires them.

## Hunting gameplay

Hunting should not be:
"Select Deer -> wait 2 minutes -> receive meat and hide."

Typical flow:
1. choose a hunting area;
2. identify tracks/signs;
3. decide whether to pursue;
4. approach;
5. resolve a hunt/encounter;
6. decide how much time to spend field-dressing and what to carry.

Fieldcraft may reveal:
- species;
- age/size;
- freshness of tracks;
- injury;
- likely direction;
- contamination;
- whether signs belong to a Pall-touched creature.

Arms affects the kill/defence side.

Craftsmanship/Fieldcraft affects carcass recovery efficiency.

A poor kill can reduce:
- usable meat;
- usable hide;
- time efficiency.

The player may also need to choose between carrying meat, hide and other loot because carcasses are heavy.

## Pall-touched animals

Pall creatures may produce economically useful biological materials, but they should not simply be better livestock.

Possible outputs:
- Altered Tissue;
- Pall Membrane;
- contaminated hide;
- glands/organs;
- unusual bone/keratin;
- rare medicinal/research samples.

### Pall meat

Pall-touched meat should normally be unsafe as ordinary food.

Most Pall meat is:
- contaminated;
- research material;
- alchemical/medical input;
- discardable waste.

A small number of species may later become edible after specialist processing, but this should be exceptional and require knowledge/facilities.

Do not make Pall hunting the optimal source of ordinary meat.

### Pall hide

Pall hide can be valuable, but must be processed.

Suggested chain:
**Contaminated Hide -> Stabilized Pall Leather**

Stabilized Pall Leather may be used in:
- advanced protective clothing;
- respirator harnesses;
- sealed gloves/boots;
- Pall-resistant packs;
- specialist fittings.

Processing requires:
- decontamination/stabilization;
- specialist facility;
- relevant Craftsmanship/Scholarship knowledge.

Not every Pall creature yields usable hide.

## Pall animal design rule

Pall animals should not merely be:
"Deer, but purple and stronger."

Each Pall-touched species should have:
- a specific ecological adaptation;
- a specific combat/problem-solving hook;
- a distinct harvest profile;
- a reason it exists in that region.

Some may be worth hunting.
Some may be worth avoiding.
Some may be valuable only to researchers.

## Supply hierarchy

Ordinary meat/hide:
- farms and butchers;
- protected hunting;
- Grey Marches hunting.

Special biological materials:
- Grey Marches predators;
- Pall-touched fauna;
- rare expedition encounters.

This ensures basic food and Leather remain available without dangerous-zone dependence.

## Phase One scope target

Domestic:
- Chicken
- Pig
- Goat
- Cattle

Wild:
- Deer
- Wild Boar
- Hare/Rabbit
- Fish

Pall-touched:
- 3-5 authored species initially, each with distinct behavior and harvestable materials.

This is enough to make the ecosystem feel alive without creating a zoo-sized content burden.


## Phase One player livestock model

Player livestock should reuse the base/facility farming framework rather than introduce a separate simulation system.

The player owns a **Farm Holding** with limited productive capacity.

That capacity can be allocated between:
- crop plots;
- poultry/coops;
- small livestock pens later;
- cattle pasture/stall capacity later.

The limitation is capacity, not owning several disconnected farms.

### Capacity points

Use farm capacity points rather than every animal occupying one identical slot.

Illustrative direction:
- Grain plot: 1 capacity
- Vegetable plot: 1 capacity
- Chicken flock / coop: 1 capacity
- Goat pen: 2 capacity
- Pig pen: 2 capacity
- Cattle unit: 3-4 capacity

Exact values are balance data.

A small early farm may therefore choose:
- 2 Grain plots;
- 1 Grain + 1 Vegetable;
- 1 Grain + 1 Chicken coop;
- 2 Chicken coops.

A larger holding can diversify further.

### Livestock as production groups

Phase One should not track every chicken or cow as an individual character.

Represent livestock as production groups such as:
- Chicken Flock
- Cattle Herd Unit

Each group has:
- required farm capacity;
- feed/upkeep requirement;
- production cycle;
- output;
- occasional incident state.

This keeps the system deep enough economically without adding breeding/genetics/veterinary micromanagement.

### Recurrent vs destructive outputs

Some animal products are renewable:
- Chickens -> Eggs
- Cattle -> Milk

Some require slaughter/removal of livestock:
- Chickens -> Chicken Meat
- Cattle -> Beef + Raw Hide

This creates an economic choice between ongoing production and immediate meat/hide recovery.

Replacement livestock can be bought from NPC farms/breeders in Phase One.

Breeding mechanics are LATER.

### Feed

Livestock should create demand for existing agricultural goods rather than introduce a large feed-item catalogue.

Phase One direction:
- chickens consume Grain;
- cattle consume a farm upkeep bundle represented mainly by Grain/Vegetables/pasture access;
- city clean water is abstracted as farm utility under normal conditions.

Do not introduce separate Chicken Feed, Cattle Feed, Hay, Silage, Bran, etc. in Phase One unless later economy data proves they are needed.

Pasture/farm upgrades may reduce purchased feed requirements.

### Interaction philosophy

Livestock uses the same interaction architecture as crops.

Routine production should often run quietly.

Meaningful interactions may include:
- poor laying;
- damaged coop;
- feed shortage;
- injured animal;
- escaped livestock;
- spoiled milk;
- predator threat;
- difficult calving only if/when breeding is introduced later;
- disease concern.

Higher Fieldcraft / Medicine / Craftsmanship may reveal better responses.

Phase One should keep serious breeding/veterinary incidents rare.

### Phase One species priority

For the first playable implementation, the player-owned livestock system only needs:
- Chicken Flock
- Cattle Herd Unit

Pig and Goat remain valid world/NPC livestock and can become player-manageable later.

This is enough to produce:
- Eggs
- Chicken Meat
- Milk
- Beef
- Raw Hide

without creating a full animal-management game.
