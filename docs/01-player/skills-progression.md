# Skills and Progression

## Structure

The character uses a small number of Major Skills with long progression, plus specialization branches.

Current proposed Major Skills:
- Arms
- Fieldcraft
- Industry
- Mechanics
- Craftsmanship
- Medicine
- Scholarship
- Commerce

Major Skills use a long 0–100 progression. Specializations use a smaller tier structure rather than separate full XP grinds.

## Canonical Major Skills and Subskills

The following is the current agreed Phase One skill tree.

These subskills are canonical unless a later explicit design decision changes them.

| Major Skill | Agreed subskills |
| --- | --- |
| **Arms** | Melee, Pistols, Rifles, Scatterguns, Defense |
| **Fieldcraft** | Scavenging, Navigation, Foraging, Tracking |
| **Industry** | Hauling, Mining, Construction, Refining |
| **Mechanics** | Pressure Systems, Precision Mechanisms, Weapon Maintenance, Industrial Machinery |
| **Craftsmanship** | Smithing, Carpentry, Tailoring, Cooking |
| **Medicine** | Trauma, Surgery, Disease, Herbalism |
| **Scholarship** | Pall Research, Investigation, Engineering Theory |
| **Commerce** | Trading, Negotiation, Logistics, Contracts |

### Skill-tree guardrail

Do not introduce a new subskill merely because a single recipe or item needs somewhere to live.

A new subskill must justify a broader gameplay identity, progression path, multiple activities/recipes, and meaningful distinction from the existing branches.

**Chemistry is not currently an agreed subskill.** It was discussed as a possible home for specialist filter/material processing, but remains uncommitted.

Until an explicit decision is made, recipes such as Filter Medium should keep their governing skill/subskill as TBD rather than silently expanding the skill tree.


## Learning

Most skill progression comes from:
- jobs;
- crafting and cooking;
- research;
- combat;
- expeditions;
- encounters and incidents.

Activities have a learning difficulty. Trivial activities eventually provide little or no useful progression to advanced characters.

Progression should increasingly unlock options, techniques and understanding rather than huge numerical multipliers.

## Breakthroughs

Major milestones may require a practical breakthrough, qualification, difficult job, trainer, discovery or other proof of competence rather than XP alone.

## Craftsmanship and recipes

Recipes and blueprints may be bought, traded, found or discovered before the character is capable of understanding them.

A recipe can therefore exist in the player's possession while remaining:
- unreadable;
- partially understood;
- understood but not craftable with current facilities;
- fully craftable.

Comprehension may require Major Skill level, specialization tier, attributes, research, reputation or facilities.

Higher Craftsmanship/specialization unlocks more recipes and deeper understanding of existing recipes.

## Material efficiency

Higher specialization may reduce material consumption, but only by reducing **waste and inefficiency**.

Recipes should distinguish:
- **essential material** — physically required by the finished item and generally cannot be reduced below a floor;
- **process waste / allowance** — extra material consumed because the crafter is inexperienced, imprecise or using inefficient methods.

Example:

A component may have:
- 4 iron ingots essential;
- +1 iron ingot process allowance;
- 20 copper wires essential;
- +4 copper wires process allowance.

A novice might consume 5 iron + 24 copper.
A skilled crafter might consume 5 iron + 22 copper.
An expert might consume 4 iron + 20 copper.

This preserves economic sinks while making mastery valuable.

## Additional mastery benefits

Higher specialization may also improve:
- output quality;
- durability;
- repairability;
- crafting time;
- failure chance;
- fuel consumption;
- byproduct recovery;
- ability to substitute equivalent materials;
- ability to identify defects before completion.

No specialization should create a single universally best recipe path.


## Progression curve and specialization pressure

Major Skill progression should use a steep nonlinear XP curve inspired by RuneScape-style progression: early levels are quick and readable, while high levels become dramatically more expensive.

The intended feel is:
- 1–15: accessible; most active players can build basic competence across several skills.
- 15–30: meaningful commitment.
- 30–50: specialist territory.
- 50–70: major long-term investment.
- 70–90: rare expertise.
- 90–100: exceptional lifetime mastery.

A player should not be hard-locked from raising multiple skills, but reaching 50+ in several Major Skills should be extremely costly in time, prerequisites, breakthrough content and infrastructure.

The design goal is broad low-level competence with narrow high-level mastery.

## Cross-skill breakthrough gates

Breakthroughs become increasingly interdisciplinary.

A high-level breakthrough in one Major Skill may require:
- minimum levels in other Major Skills;
- a specialization tier;
- specific equipment;
- a faction/reputation threshold;
- a discovered location;
- a rare blueprint or artifact;
- a completed expedition;
- a crafted or repaired object;
- a puzzle, diagnosis or investigation.

This ensures advanced mastery reflects a capable character rather than a single isolated XP bar.

### Example: Medicine 30 breakthrough

A player reaches the Medicine XP threshold for level 30 but cannot advance automatically.

The breakthrough may require:
- Arms 10+
- Fieldcraft 15+
- an expedition into an Ashlands medical ruin
- surviving the route and reaching the site
- repairing a damaged medical mechanism or power system
- tracking down a missing component or solving an environmental obstacle
- recovering and understanding a medical blueprint/archive

The exact secondary skill used may vary by route or solution.

The breakthrough should feel like a personal milestone and a piece of world content, not a certification checkbox.

## Branching solutions

High-level breakthrough content should support multiple valid approaches when practical.

Example:
- Mechanics can repair the sterilization unit.
- Craftsmanship can fabricate a replacement housing.
- Fieldcraft can track a scavenger who stole the missing component.
- Commerce/reputation may obtain access through negotiation.
- Arms may force a dangerous route, but should not be the universal solution.

This keeps skill builds distinct and prevents every breakthrough from requiring the same checklist.


## Item inspection and knowledge reveals

Phase One uses a single universal **Inspect** action.

Inspect itself is not a skill and does not require a new Inspection specialization.

Every player can always see basic gameplay-critical information such as:
- item name/type;
- weight;
- current durability/condition;
- equipment requirements;
- final headline protection values where applicable;
- obvious penalties;
- basic recipe/use information when already known.

Relevant subskills reveal deeper diagnostic information.

### Technical inspection

Three agreed subskills provide broad technical analysis:

- **Mechanics -> Precision Mechanisms** — assembly tolerances, moving parts, fittings, alignment, precision defects and component workmanship.
- **Scholarship -> Engineering Theory** — design principles, load paths, material/system limitations, theoretical performance and likely failure modes.
- **Scholarship -> Pall Research** — Pall contamination behavior, anomalous material response, hazard suitability and Pall-specific degradation.

These are important cross-domain inspection skills, but they are not universal replacements for profession knowledge.

### Domain inspection

Items may additionally reference the subskill that normally makes, maintains or understands them.

Examples:
- weapons: Weapon Maintenance; Precision Mechanisms where relevant;
- respirators/pressure equipment: Pressure Systems; Precision Mechanisms; Pall Research where relevant;
- forged metal goods: Smithing;
- wooden goods: Carpentry;
- textile/leather goods: Tailoring;
- industrial/refining machinery: Industrial Machinery and/or Engineering Theory;
- medical items: Trauma, Surgery, Disease or Herbalism as appropriate;
- food/cooking products: Cooking.

### Reveal model

Inspection data should be divided into layers rather than hidden wholesale.

A novice sees the practical result.

A competent specialist sees the likely cause.

An expert sees quantified diagnosis and improvement potential.

Example for a respirator canister:
- everyone: Pall Resistance 63%;
- Pressure Systems / Precision Mechanisms: poor connection seal is reducing performance;
- higher relevant skill: Connection Seal 82%, estimated result after replacing the fitting;
- Pall Research: whether the medium is appropriate for the current Pall hazard and how exposure may affect service life;
- Engineering Theory: interaction between shell, fitting, gasket and medium and the limiting system behavior.

The server stores the full item truth. The UI reveals only the information permitted by the player's relevant raw/effective knowledge.

Important progression gates should still use Raw Skill. Inspection assistance from equipment may improve detail or confidence but should not substitute for permanent expertise.


### Data-driven implementation rule

Inspection does not require handcrafted logic for every item/component combination.

Inspectable properties should use reusable data rules that map:
- property/component tag;
- relevant subskill;
- reveal threshold;
- reveal depth;
- text/numeric output.

The same rule can therefore apply to any compatible item.

Example:
- a connection-seal rule can be reused by respirators, valves and pressure equipment;
- a mechanism-alignment rule can be reused by firearms and precision machinery;
- a Pall-material rule can be reused by respirators, sealed gear and contaminated components.

Deep inspection is limited to selected complex item families in Phase One rather than every inventory item.
