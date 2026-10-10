# Refining and Processing

Status: PROVISIONAL Phase One design.

## Core rules

Refining converts raw resources into economically meaningful processed materials.

A refining recipe defines:
- input commodities and quantities;
- output commodity and quantity;
- workstation capability;
- minimum raw skill;
- batch cap;
- base fuel requirement;
- processing time;
- avoidable material waste;
- avoidable fuel waste;
- interaction pool;
- possible incidents.

Bulk industrial resources use physical quantity units where practical:
- solid bulk commodities: kilograms (kg);
- liquids: liters (L);
- discrete objects/components: pieces;
- herbs and similar small biological materials: recipe-defined bundles/units where needed.

For bulk materials, a market stack quantity therefore represents physical quantity rather than an arbitrary MMO "ore item."

## Contaminated common-metal feedstock

Iron Ore, Copper Ore, and Lead Ore found in the Grey Marches or Pall zones may carry the **Contaminated** state.

The underlying commodity remains the same ore type.

Rules:
- clean and contaminated stacks do not merge;
- contamination is not a quality bonus;
- the nominal recipe ratio does not improve;
- contaminated refining should be more troublesome, not more profitable;
- a contamination-capable facility/process may be required for safe large-scale refining.

Exact extra fuel/time and facility requirements are deferred until the contamination-control system is tuned.

The implementation should support recipe modifiers such as:
- additional Coal;
- additional processing time;
- higher incident chance;
- contamination-control facility requirement.

Do not create separate item IDs such as "Pall Iron Ore" or "Grey Copper Ore."

## Batch-size rule

Maximum requested batch is:

**min(skill batch cap, facility batch cap, available inputs/storage)**

Skill creates the knowledge/handling ceiling. Facility creates the physical throughput ceiling.

### Provisional Refining skill batch caps

| Raw Refining skill | Max output batch |
| --- | ---: |
| 0-9 | 1 kg |
| 10-19 | 3 kg |
| 20-29 | 5 kg |
| 30-39 | 10 kg |
| 40-49 | 20 kg |
| 50-59 | 40 kg |
| 60-69 | 60 kg |
| 70-79 | 80 kg |
| 80-100 | 100 kg |

This replaces irregular 35-skill thresholds and keeps the progression readable.

### Provisional facility caps

| Metalworking facility | Max refining batch |
| --- | ---: |
| T1 Basic Furnace / Forge | 5 kg |
| T2 Proper Smelter / Forge | 20 kg |
| T3 Industrial Metalworks | 50 kg |
| T4 Advanced Foundry | 100 kg |

Exact names and construction requirements remain to be finalized with facility content.

## Waste model

The recipe's nominal conversion ratio already represents unavoidable physical loss such as gangue, slag, scale and impurities.

**Skill waste is additional avoidable process loss**, not the same thing as the recipe conversion ratio.

Provisional avoidable material-waste curve:

**waste_pct = max(1%, 20% × exp(-raw_refining_skill / 35))**

Approximate values:

| Refining skill | Avoidable waste |
| --- | ---: |
| 0 | 20.0% |
| 10 | 15.0% |
| 20 | 11.3% |
| 30 | 8.5% |
| 40 | 6.4% |
| 50 | 4.8% |
| 60 | 3.6% |
| 70 | 2.7% |
| 80 | 2.0% |
| 90 | 1.5% |
| 100 | 1.1% |

Waste never reaches zero.

For UI and server calculation:
- the player chooses desired output;
- the recipe shows nominal inputs;
- expected extra material required from process waste is shown before confirmation;
- batch calculations may use decimals internally even when the UI rounds sensibly.

Good interaction choices may reduce the current batch's avoidable waste. Poor choices or incidents may increase it.

## Furnace-fuel rule

For Phase One, every **furnace-based mineral/metal refining recipe** consumes Coal.

This includes:
- Iron Ore -> Iron Ingot;
- Copper Ore -> Copper Ingot;
- Lead Ore -> Lead Ingot;
- Iron Ingot -> Steel;
- Black Bog Nodules -> Manganese Concentrate;
- Clay -> Fired Ceramic;
- Industrial Sand -> Glass;
- later furnace-based mineral refining recipes.

Non-furnace processing such as milling Grain, tanning Hide or weaving Fibre does not consume Coal merely for consistency.

## Fuel model

Coal is a bulk commodity measured in kg.

Each recipe has a **base Coal requirement per kg of target output**.

Skill/facility should primarily reduce avoidable overburn and poor furnace management, not make the thermodynamic base fuel requirement disappear.

Fuel use therefore has:
- base recipe fuel;
- optional avoidable fuel waste;
- facility modifier;
- incident/interaction modifier.

Exact economy tuning can change base rates without changing the system.

---

# Iron refining

Status: PHASE ONE.

## Recipe: Iron Ore -> Iron Ingot

Nominal conversion:

**2 kg Iron Ore + 1 kg Coal -> 1 kg Iron Ingot**

The 2:1 ore ratio already abstracts:
- waste rock/gangue;
- slag;
- impurities;
- unavoidable refining loss.

Additional skill waste is applied on top of the nominal ore requirement.

### Requirements

- workstation: Smelting Furnace capability;
- facility: T1 Basic Furnace / Forge or better;
- skill: Industry -> Refining;
- minimum raw Refining: 0;
- novice-accessible;
- fuel: Coal.

A novice can perform the process, but pays through:
- low batch cap;
- higher avoidable material waste;
- greater chance of needing an interaction;
- potentially higher avoidable fuel consumption.

### Outcomes

Iron Ingot is a fungible processed bulk material and does not use Crude/Standard/Fine/etc.

Process outcome affects:
- ore wasted;
- Coal overburn;
- completion time;
- chance of a minor furnace incident.

It should not produce separate "Poor Iron Ingot" inventory stacks.

---

# Steel refining

Status: PHASE ONE.

## Design correction: Scrap Metal is not mandatory

Steel should **not** require Scrap Metal in every recipe.

Making scrap mandatory would be both economically awkward and metallurgically backwards: scrap is useful as recycled feedstock, but the ability to make steel should not depend on finding old broken objects.

Phase One should support a primary steel process plus a later/unlocked recycled route.

## Primary recipe: Iron Ingot -> Steel

Provisional nominal conversion:

**1 kg Iron Ingot + 0.5 kg Coal -> 1 kg Steel**

Coal here abstracts the carbon-bearing fuel/process input and heat requirement; most Coal mass is burned rather than incorporated into the steel.

Requirements:
- workstation: Forge / steel-hearth capability within Metalworks;
- minimum raw Refining: **20**;
- T2 Proper Smelter / Forge recommended/required for normal production;
- Coal fuel.

Steel at Refining 20 should be possible but inefficient and attention-demanding.

## Recycled-steel route

A second route can make Scrap Metal economically important without making it compulsory.

Provisional direction:

**0.5 kg Iron Ingot + 1 kg Scrap Metal + 0.75 kg Coal -> 1 kg Steel**

Requirements:
- Refining 30+;
- suitable Metalworks facility;
- scrap inspection/sorting capability.

The higher nominal input reflects dirt, corrosion, mixed metals and unrecoverable contamination in generic Scrap Metal.

This route:
- reduces demand for virgin Iron Ingot;
- creates a permanent sink for salvage;
- is more sensitive to poor process decisions;
- can become attractive when scrap is cheap.

Exact ratios remain balance values.

## Advanced metallurgy

Black Bog Nodules -> Manganese Concentrate should matter in selected advanced steel-based recipes/processes.

Do **not** create a universal "Fine Steel" commodity simply to consume Manganese Concentrate.

Instead, advanced components may require:
- Steel;
- Manganese Concentrate;
- appropriate facility/skill.

This preserves the Grey Marches resource sink without fragmenting Steel into quality grades.

---

# Iron/steel interaction design

## Philosophy

Ordinary refining should not become a repetitive minigame.

Interactions occur when:
- the recipe is new to the character;
- skill is close to recipe difficulty;
- the batch is large relative to experience;
- the furnace/facility is worn;
- mixed/recycled inputs are used;
- an uncommon process incident occurs.

A skilled refiner making ordinary Iron Ingots in a good facility should usually run the batch quietly.

Steel should remain attention-demanding longer than basic Iron.

## Interaction family A: Furnace heat

Example prompt:

> The furnace has come up hot, but the charge is not settling evenly. The upper layer remains dark while the lower bed is beginning to spark.

Low-skill options:
- Add more Coal.
- Increase the draft.
- Continue as-is.
- Stop the batch.

Higher Refining may reveal:
- The draft is already sufficient; more air will waste fuel.
- Redistribute the charge before adding fuel.
- The lower bed is overheating; reduce draft briefly and preserve yield.

Possible consequences:
- extra Coal consumed;
- lower/higher avoidable material waste;
- extra processing time;
- minor facility wear.

## Interaction family B: Slag separation

Example prompt:

> A thick glassy layer is collecting around the working metal.

Low-skill options:
- Keep heating.
- Skim it now.
- Stir the charge.
- Stop and inspect.

Higher Refining may identify:
- slag is ready to separate;
- the metal is still carrying too much impurity;
- further heating will begin costing usable iron.

Possible consequences:
- recovered yield;
- lost metal;
- extra fuel;
- extra time.

No separate Slag commodity is required in Phase One.

## Interaction family C: Airflow / furnace condition

Example prompt:

> The flame has become dull and uneven. Heat is falling despite normal fuel consumption.

Possible causes selected by context:
- partially blocked air path;
- wet/poorly stored Coal;
- furnace lining damage;
- overloaded batch.

Higher Refining/Mechanics reveals cause-specific options.

Possible consequences:
- clear obstruction;
- reduce batch load;
- spend extra Coal;
- accept longer process time;
- facility durability damage if ignored.

## Interaction family D: Steel process control

Example prompt:

> The metal has reached working heat, but the surface response is uneven across the batch.

Low-skill options:
- Keep heating.
- Add Coal.
- Work the batch now.
- Slow the process.

Higher Refining/Smithing information may reveal:
- the batch is overheating;
- carbon exposure has been uneven;
- one section needs additional working;
- continuing at the current heat risks extra scale loss.

Consequences primarily affect:
- material waste;
- Coal use;
- process time.

Bulk Steel remains one fungible commodity.

## Interaction family E: Recycled scrap

Only relevant when Scrap Metal is used.

Example prompt:

> One part of the scrap charge is producing an unfamiliar coloured scale before the rest has reached working heat.

Higher Refining/Scholarship/Mechanics may reveal:
- a contaminating non-ferrous piece;
- heavily corroded material;
- usable iron worth separating;
- a component better recovered intact than melted.

Choices may:
- remove contamination and lose time;
- continue and accept higher waste;
- abort part of the charge;
- recover a valuable component.

This makes recycled steel meaningfully different from virgin production.

## Mastery

Suggested routine thresholds:
- Iron Ingot becomes normally interaction-free around Refining 20-25 with a sound facility.
- Steel becomes normally interaction-free around Refining 40-45 for ordinary batches.
- Recycled steel remains somewhat more incident-prone because input consistency is worse.
- Oversized batches, damaged facilities and unusual inputs can reintroduce interactions for experts.

Skill should reveal understanding first and efficiency second.


---

# Copper refining

Status: PHASE ONE.

## Recipe: Copper Ore -> Copper Ingot

Copper uses the same basic rules as Iron.

Nominal game conversion:

**2 kg Copper Ore + 1 kg Coal -> 1 kg Copper Ingot**

Requirements:
- T1 Basic Furnace / Forge or better;
- Industry -> Refining;
- minimum raw Refining: **0**;
- Coal fuel.

Copper uses:
- the same skill batch-cap table as Iron;
- the same avoidable-waste curve;
- the same facility-cap rule;
- the same broad interaction difficulty.

Copper Ingot is fungible and does not carry craftsmanship quality.

Its interaction text should have copper-specific flavour, but mechanically it remains the second novice-accessible refining process rather than a new subsystem.

---

# Black Bog Nodules processing

Status: PHASE ONE.

## Recipe: Black Bog Nodules -> Manganese Concentrate

This is a harder regional refining process than Iron or Copper.

Provisional game conversion:

**3 kg Black Bog Nodules + 2 kg Coal -> 1 kg Manganese Concentrate**

Requirements:
- T2 Proper Smelter / Forge or better;
- Industry -> Refining;
- minimum raw Refining: **25**;
- Coal fuel.

Why Refining 25:
- Iron/Copper remain the novice foundation at 0;
- Steel opens around 20;
- Grey Marches Manganese should require an established refiner;
- it is still reachable well before high mastery;
- the valuable Grey Marches material does not become unusable for most of the playerbase.

### Batch

Use the same skill batch-cap table as Iron/Copper.

Actual batch remains limited by skill, facility, inputs and storage.

### Time

Manganese Concentrate should take roughly **1.75x the Iron/Copper refining time per kg of output** as a starting balance value.

### Waste

Use the same avoidable-waste curve.

The 3:1 source conversion is the recipe's built-in unavoidable loss. Skill adds only avoidable process waste on top of that.

### Interactions

Use the same one-interaction philosophy, but with a higher difficulty pool.

Possible game situations:
- the batch is heating unevenly;
- too much fuel is being consumed for the current progress;
- useful material is mixed with obvious waste;
- the furnace is struggling under the load;
- a portion of the batch may be reworked at the cost of extra Coal and time.

Higher Refining reveals which response is likely to preserve more material and fuel.

Outcomes affect:
- extra Coal use;
- extra time;
- avoidable material waste;
- facility wear.

Do not create multiple grades of Manganese Concentrate.

## Manganese-use progression

Recommended gates:

- **Refining 25:** produce Manganese Concentrate.
- **Refining 40:** use Manganese Concentrate in advanced metallurgy recipes.
- **Refining 50+:** ordinary manganese-assisted work becomes largely routine in a suitable facility.

This gives the metal progression a readable staircase:

**0 Iron/Copper -> 20 Steel -> 25 Manganese Concentrate -> 30 recycled Steel -> 40 advanced manganese-assisted metallurgy.**


---

# Lead refining

Status: PHASE ONE.

## Recipe: Lead Ore -> Lead Ingot

Nominal game conversion:

**2 kg Lead Ore + 1 kg Coal -> 1 kg Lead Ingot**

Requirements:
- T1 furnace capability or better;
- Industry -> Refining;
- minimum raw Refining: **0**;
- Coal fuel.

Lead uses:
- the same skill batch-cap table as Iron/Copper;
- the same avoidable-waste curve;
- the same nominal baseline processing time;
- the same facility-cap model.

Lead Ingot is fungible and primarily feeds ammunition production.

---

# Ceramic processing

Status: PHASE ONE.

## Recipe: Clay -> Fired Ceramic

Nominal game conversion:

**5 kg Clay + 2 kg Coal -> 1 kg Fired Ceramic**

Requirements:
- furnace/kiln capability;
- Industry -> Refining;
- minimum raw Refining: **0**;
- Coal fuel.

Why Refining 20 for Glass:
- basic clay firing is forgiving enough for a novice;
- glassmaking requires tighter heat control and cleaner handling;
- it creates a meaningful progression step between basic refining and specialist metallurgy;
- it prevents Glass from being just another Refining-0 commodity.

Rules:
- same skill batch caps as Iron/Copper;
- same avoidable-waste curve;
- same baseline time per kg of output as Iron/Copper;
- same facility throughput logic.

The high 5:1 input ratio represents water, unsuitable mineral fraction, shrinkage, breakage, and rejected material without creating additional clay-processing commodities.

### Ceramic interaction themes

Use the same interaction frequency philosophy, but ceramic-specific situations:
- uneven heating;
- charge still too wet;
- cracking during firing;
- poor furnace loading;
- deciding whether to extend the firing cycle at extra Coal cost.

Higher Refining reveals whether more heat will help or simply increase breakage/fuel waste.

Fired Ceramic remains one fungible processed material.

---

# Glass processing

Status: PHASE ONE.

## Recipe: Industrial Sand -> Glass

Nominal game conversion:

**7 kg Industrial Sand + 2 kg Coal -> 1 kg Glass**

Requirements:
- suitable high-heat furnace capability;
- Industry -> Refining;
- minimum raw Refining: **20**;
- Coal fuel.

Rules:
- same skill batch caps as Iron/Copper;
- same avoidable-waste curve;
- same baseline time per kg of output as Iron/Copper;
- same facility throughput logic.

The high 7:1 input ratio abstracts unsuitable grains, impurities, rejected melt, furnace loss, and the fact that "Industrial Sand" is a broad harvested feedstock rather than pure silica.

### Glass interaction themes

Possible situations:
- melt remains cloudy;
- furnace heat is uneven;
- impurities are collecting at the surface;
- the batch is beginning to overheat;
- the furnace is consuming Coal without fully clearing the melt.

Higher Refining reveals whether to:
- continue heating;
- skim impurities;
- redistribute the batch;
- reduce heat;
- accept lower recovery.

Glass remains fungible.

Violet Fluorspar can later enter specific advanced glass/optics recipes without creating a separate universal "Fine Glass" commodity.


---

# Timber processing

Status: PHASE ONE.

Timber processing is **not Industry -> Refining** and does not use the Forge.

It uses:
- Craftsmanship -> Carpentry;
- Carpenter's Bench / Sawing Station;
- saw/tool durability;
- no Coal requirement for ordinary sawing.

## Recipe: Common Timber -> Planks

Nominal conversion:

**1 Common Timber -> 4 Planks**

Minimum raw Carpentry: **0**.

Common Timber is a standardized workable timber/log unit. Planks are discrete stackable pieces.

## Carpentry waste

Wood has higher avoidable processing loss than basic metal refining at low skill because of:
- saw kerf;
- knots;
- hidden splits;
- poor grain reading;
- warped cuts;
- damaged ends;
- mistakes in laying out usable boards.

Provisional avoidable-yield loss:

| Carpentry | Avoidable wood loss |
| --- | ---: |
| 0 | 25% |
| 10 | 19% |
| 20 | 14% |
| 30 | 10% |
| 40 | 7% |
| 50 | 5% |
| 60 | 3.8% |
| 70 | 2.8% |
| 80 | 2.0% |
| 90 | 1.5% |
| 100 | 1.0% |

Waste never reaches zero.

Because Planks are discrete, implementation must calculate waste across the whole batch rather than rounding every single Timber unit independently. Small-batch rounding must not systematically punish players.

## Interaction themes

Possible situations:
- hidden split opens during the first cut;
- grain begins pulling the saw off line;
- one side is warped;
- a knot cluster makes the planned board layout inefficient;
- damp timber starts binding the saw;
- the log can be reoriented for fewer but cleaner boards.

Higher Carpentry reveals:
- likely grain direction;
- whether a crack continues internally;
- best cutting orientation;
- when preserving one wide board is more valuable than maximizing count.

Outcomes affect:
- usable Plank yield;
- time;
- tool wear;
- occasional injury risk.

At higher skill, ordinary Common Timber sawing becomes routine.

## Specialist Grey Bogwood

Grey Bogwood processing uses the same Carpentry system but is deliberately harder.

Recommended minimum raw Carpentry: **30**.

It should:
- take longer;
- cause more tool wear;
- have a higher interaction chance until mastered;
- produce Bogwood Planks.

Bogwood Planks are heavier and harder to work but offer superior dimensional stability and weather/rot resistance in recipes where those properties matter.

There is **no separate Pall wood commodity in Phase One**.

Pall forestry already has Scar Resin as a specialist resource. Adding an altered Pall timber solely to create another Carpentry tier would duplicate purpose and expand contamination/processing scope without enough payoff.
