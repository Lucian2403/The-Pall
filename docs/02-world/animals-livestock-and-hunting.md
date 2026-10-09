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
- Bear
- European Bison
- Hare/Rabbit

Fishing is **LATER** and not part of the Phase One implementation.

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

Pasture/farm upgrades must not reduce the animals' biological food requirement. Feed consumption scales with livestock population. Better infrastructure may reduce feed **waste, spoilage, or loss during storage/distribution**, but the animals themselves eat the same amount.

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

For the first playable implementation, the player-owned livestock system should support:
- Chicken Flock
- Pig Pen
- Cattle Herd Unit

Pig and Goat remain valid world/NPC livestock and can become player-manageable later.

This is enough to produce:
- Eggs
- Chicken Meat
- Pork
- Milk
- Beef
- Raw Hide

without creating a full animal-management game.


## Phase One pig farming

Pig is a valid player-managed livestock option in Phase One.

A Pig Pen:
- consumes more farm capacity than a Chicken Coop;
- consumes recurring feed;
- produces no recurring food output;
- is raised toward a slaughter cycle;
- yields Pork and Raw Hide when slaughtered/processed.

This creates a different farm model from chickens and cattle:
- Chickens -> recurring Eggs or slaughter for meat;
- Cattle -> recurring Milk or slaughter for Beef + Hide;
- Pigs -> primarily meat/hide production after a growth cycle.

Phase One still does not simulate individual animals, breeding genetics, age curves, or veterinary micromanagement.

## Hunting progression

Do not create a separate full "Hunting" major skill in Phase One.

Hunting competence comes from the interaction of:
- Fieldcraft -> Tracking: finding, following and reading animal signs;
- Arms: bringing the animal down safely;
- Fieldcraft/Craftsmanship: field dressing, preserving hide/meat, and reducing waste.

Progression should unlock access to more difficult prey because the player can:
- interpret harder tracks;
- approach safely;
- survive dangerous encounters;
- recover the carcass efficiently;
- carry or transport larger yields.

### Hunting bands

#### Early / ordinary hunting
Primary prey:
- Hare/Rabbit;
- Deer;
- Wild Boar.

Deer:
- moderate meat;
- useful hide;
- rewards clean shot and careful field dressing.

Wild Boar:
- more dangerous;
- strong meat yield;
- usable hide;
- can seriously injure an unprepared hunter.

#### Advanced hunting
Primary prey:
- Bear;
- European Bison.

These are not simply "higher level deer."

They require:
- stronger Arms capability;
- better Tracking;
- heavier equipment;
- more ammunition/weapon reliability;
- better transport capacity;
- more time to field-dress;
- greater injury risk.

They provide large carcasses, making logistics a major part of the reward.

A player on foot may kill a bison and still be unable to carry most of its value home.

This is intentional.

#### Pall hunting
Selected Pall fauna can become high-end hunting targets.

They may yield:
- specialized hide;
- Pall-resistant leather source material;
- altered tissue;
- glands;
- membrane;
- bone/keratin;
- unique meat where biologically and thematically appropriate.

Pall hunting should remain species-specific rather than every monster dropping the same generic resources.

## Pall meat rule

The earlier rule remains: **most Pall meat is unsafe as ordinary food**.

However, a small number of specifically designed Pall species may yield edible or medicinally useful meat.

Such meat may require:
- decontamination;
- specialist butchering;
- Cooking/Medicine/Scholarship knowledge;
- proper facility;
- inspection for contamination.

These special meats can provide strong or unusual food effects, but should not simply be "better steak."

Possible effect directions:
- unusually long Stamina recovery bonus;
- temporary resistance to Fatigue;
- Composure recovery;
- improved cold/heat tolerance;
- rare Pall-resistance preparation.

Each Pall meat should carry tradeoffs or preparation difficulty.

Example:
A rare Pall herbivore may yield meat that can be rendered safe and gives a long-duration recovery effect, but preparation is difficult and failed processing creates Contaminated Meat.

## Pall hide rule

Selected Pall fauna may yield specialized hides.

Possible chain:
Contaminated Hide -> Stabilized Pall Leather

Use cases:
- sealed expedition clothing;
- respirator harnesses;
- gloves/boots;
- packs;
- protective fittings.

Higher hunting/recovery skill improves:
- amount of usable hide;
- damage avoidance during field dressing;
- contamination assessment;
- preservation;
- ability to identify which tissue is actually valuable.

## Scope tags

**PHASE ONE**
- Chicken, Pig, Cattle player farming
- Deer and Wild Boar hunting
- basic hunting interactions
- meat/hide recovery
- shared farm-capacity system

**PHASE ONE if content budget allows**
- Bear
- European Bison
- one or two Pall huntable fauna with distinct harvests

**LATER**
- Fishing
- detailed breeding
- genetics
- veterinary profession depth
- individual animal simulation
- extensive Pall cuisine
