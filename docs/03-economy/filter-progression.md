# Phase One Filter Progression

Status: PROVISIONAL — recipes, tier order, crafting times and skill gates locked; governing skill/subskill and final penalties remain open.

## Core role

Filter Medium is an intermediate material used to produce Filter Canisters for respirators and related protective equipment.

The progression must allow a player to prepare for dangerous zones before already possessing materials from those zones.

Therefore the filter chain deliberately climbs by region:
- Tier 1 uses only safe-economy materials;
- Tier 2 introduces a Grey Marches material;
- Tier 3 introduces a Pall material;
- Tier 4 combines multiple frontier/Pall materials for deep expeditions.

There is no Tier 0. The crude safe-economy filter is Tier 1.

## Governing skill

Do **not** invent a new skill/subskill for this chain yet.

The governing skill/subskill remains **TBD**.

Whatever existing skill is eventually chosen, the raw-skill requirements are locked as:
- Tier 1: 10
- Tier 2: 15
- Tier 3: 25
- Tier 4: 40

The chosen skill should support the entire Filter Medium chain consistently.

## Tier 1 — Crude Filter Medium

**Recipe**

2 Cloth + 1 Coal -> 1 Crude Filter Medium

**Requirements**
- governing skill: TBD
- minimum raw skill: 10
- crafting time: **7 seconds**

**Gameplay role**
- first player-made filter material;
- available before entering the Grey Marches;
- intended for short exposure at the Grey fringe and emergency use;
- poor durability / short service life compared with later tiers.

Coal represents crude adsorptive material rather than a sophisticated industrial filter medium.

## Tier 2 — Grey Filter Medium

**Recipe**

2 Cloth + 1 Coal + 1 March Zeolite -> 1 Grey Filter Medium

**Requirements**
- governing skill: TBD
- minimum raw skill: 15
- crafting time: **10 seconds**

**Gameplay role**
- standard Grey Marches filter material;
- supports ordinary Grey activity and short / cautious Pall incursions;
- introduces March Zeolite as the first frontier filtration material.

## Tier 3 — Pall Filter Medium

**Recipe**

2 Cloth + 2 March Zeolite + 1 Sootlace -> 1 Pall Filter Medium

**Requirements**
- governing skill: TBD
- minimum raw skill: 25
- crafting time: **13 seconds**

**Gameplay role**
- first serious Pall filter material;
- designed for meaningful exposure in Pall zones;
- introduces Sootlace as a Pall-sourced filtration material.

Tier 3 must **not** be a pure linear upgrade.

It should carry at least one meaningful drawback or operating cost, such as:
- increased breathing resistance / reduced Stamina recovery while active;
- higher equipment wear;
- higher maintenance burden;
- another expedition-relevant penalty.

Exact penalty is not yet locked.

## Tier 4 — Deep Pall Filter Medium

**Recipe**

4 Cloth + 2 March Zeolite + 2 Sootlace + 1 Pall Membrane -> 1 Deep Pall Filter Medium

**Requirements**
- governing skill: TBD
- minimum raw skill: 40
- crafting time: **20 seconds**

**Gameplay role**
- long-duration/deep-Pall filtration;
- emphasizes service life and stability under severe contamination rather than simply offering a huge protection-number increase;
- uses Pall Membrane as a high-end barrier/sealing material.

Tier 4 must also carry a meaningful drawback.

Possible directions:
- heavier canister/respirator load;
- greater mobility penalty;
- stronger breathing resistance;
- higher equipment maintenance;
- very high replacement cost.

Exact drawback is not yet locked.

## Sidegrades

Phase One has **one recipe per filter tier**.

Alternative Tier 3 or Tier 4 sidegrades are deferred.

Later variants should only be added if they create materially different expedition choices rather than merely swapping small stat values.

## Progression logic

The intended acquisition loop is:

1. Safe economy produces Cloth and Coal.
2. Player crafts Tier 1 and can enter the Grey fringe.
3. Grey exploration yields March Zeolite.
4. Player upgrades to Tier 2 and can operate deeper / attempt short Pall incursions.
5. Pall exploration yields Sootlace.
6. Player upgrades to Tier 3 for serious Pall work.
7. Deep Pall fauna/material acquisition yields Pall Membrane.
8. Player produces Tier 4 for sustained deep-Pall expeditions.

This prevents circular progression where the player needs a Pall material before being capable of entering the Pall.


## Filter Canister composition direction

Filter Canisters should use a component-derived model rather than one hardcoded catalogue entry per possible component combination.

Current component direction:
- Metal Plate / canister body;
- Copper Fitting;
- Seal Gasket;
- Filter Medium.

A crude canister may omit the Copper Fitting and Seal Gasket and rely on a poorer integral/crimped connection.

The finished canister's headline Ash/Pall respiratory resistance is derived from:
- the medium's filtration capability;
- shell seal;
- connection seal;
- gasket seal where present.

Players always see the final practical resistance values.

Relevant subskills can reveal deeper component diagnostics through the generic Inspect system.

Mixed-tier components are allowed. Their result is calculated rather than manually authored.

## Still open

- governing existing skill and subskill;
- workstation/facility;
- batch-size rules;
- waste model;
- exact Tier 3 and Tier 4 penalties;
- Filter Canister assembly times and final workstation requirements;
- exact protection/service-life values.


## Canister component recipes

Status: PROVISIONAL Phase One; recipes, skill gates and workstation families locked.

### Metal Plate

**1 Iron Ingot -> 2 Metal Plates**

Requirements:
- Craftsmanship -> Smithing;
- minimum raw Smithing: **0**;
- workstation: **Forge**;
- T1 Forge is sufficient.

### Copper Fitting

**1 Copper Ingot -> 4 Copper Fittings**

Requirements:
- Craftsmanship -> Smithing;
- minimum raw Smithing: **15**;
- workstation: **Forge**;
- T1 Forge is sufficient.

The skill requirement provides the progression gate; a higher Forge tier is not required merely to make the fitting.

### Seal Gasket

**1 Leather + 1 Cloth -> 4 Seal Gaskets**

Requirements:
- Craftsmanship -> Tailoring;
- minimum raw Tailoring: **15**;
- workstation: **Textile & Leather Workshop**;
- T1 Textile & Leather Workshop is sufficient.

Leather provides the flexible sealing surface; Cloth provides reinforcement/packing.

These components are leaf components for Phase One. Do not add further sub-components unless a later recipe creates a distinct economic reason.

### Final Filter Canister assembly

The final canister should **not** be assembled at the Forge or Textile & Leather Workshop.

Governing subskill:
- Mechanics -> **Pressure Systems**.

Agreed raw Pressure Systems gates:
- Tier 1 Crude Filter Canister: **5**;
- Tier 2 Grey Filter Canister: **15**;
- Tier 3 Pall Filter Canister: **25**;
- Tier 4 Deep Pall Filter Canister: **40**.

The Tier 1 gate deliberately does not start at 0. A completely untrained character must first gain basic Pressure Systems competence through concrete related work before independently assembling even a crude canister.

The exact Pressure/Mechanics workstation name/tier and assembly times remain open.

This does not change the separate Filter Medium skill gates. A player may assemble a canister using purchased or otherwise acquired Filter Medium without personally having the skill required to manufacture that medium.
