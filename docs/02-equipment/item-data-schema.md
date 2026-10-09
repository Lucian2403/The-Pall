# Item Data Schema

Status: PROVISIONAL / implementation-ready for the first vertical slice.

This document defines how future items are represented in data. Individual item balance is intentionally deferred.

## Design rule

Items are data, not special-case code.

A new coat, rifle, respirator, tool, fitting or component should normally be addable by inserting data rows and reusing generic systems. Code should not need to know the name of a specific item.

The schema is split into a small number of normalized records rather than one enormous row.

## 1. Item master

One row per tangible item.

Core identity:
- item_id — stable permanent ID
- code — short machine-friendly code
- name
- item_category
- item_subcategory
- description
- icon_key / art_key / sound_key
- design_status
- version_introduced

Physical/logistics:
- stackable
- max_stack
- weight_kg
- volume_l
- unit_label / quantity_unit where needed (piece, kg, L, bundle)
- liquid_capacity_l for containers where applicable
- compatible_liquid_group where applicable
- base_durability
- max_durability
- durability_profile_id
- maintenance_profile_id

Economy:
- tradable
- marketable
- droppable
- stealable
- vendor_buyable
- vendor_sellable
- npc_base_buy
- npc_base_sell
- legal_status / contraband_score
- quest_bound / faction_bound

Crafting/quality:
- quality_enabled
- quality_min
- quality_max
- blueprint_id
- recipe_id
- repairable
- repair_skill_id
- repair_material_group
- repair_cost_factor

Recovery/salvage:
- dismantle_allowed
- salvage_group_id

Rarity/availability, if retained, describes how uncommon the object is in the world. It must never substitute for craftsmanship quality or imply an MMO power ladder.

## 2. Equipment record

Only equippable items receive an equipment record.

Possible fields include:
- equipment_id
- item_id
- equipment_type
- slot
- layer
- hands_required
- attribute requirements
- raw skill requirements
- physical / ballistic / chemical / heat protection
- Pall / Ash / toxin / infection resistance
- seal_rating
- filtration_rating
- breathing_resistance
- carry_bonus_kg
- damage values where relevant
- accuracy / misfire / magazine / ammo properties
- noise / smoke / heat output
- movement and attribute penalties
- durability_loss_multiplier
- repair_difficulty
- fitting slot count/profile
- filter slots
- special_effect_key

Not every field applies to every equipment family. Empty is valid.

## 3. Item modifiers

Skill and specialization bonuses must use a generic link table rather than dedicated columns.

Example records:

| item | target | operation | value |
| --- | --- | --- | ---: |
| reinforced_gloves | specialization:melee | ADD | 2 |
| reinforced_gloves | specialization:smithing | ADD | 3 |
| field_respirator | specialization:pall_research | ADD | 4 |
| field_respirator | specialization:tracking | ADD | -3 |
| field_respirator | resistance:pall | ADD_PERCENT | 5 |

This lets future branches or derived stats be added without altering the item schema.

Important progression gates normally use Raw Skill. Item modifiers contribute to Effective Skill.

Modifiers can specify whether their value scales with:
- current durability;
- item quality;
- both;
- neither.

## 4. Item quality availability

Quality is defined per item, not assumed globally.

Quality tiers:
1. Crude
2. Standard
3. Well-made
4. Fine
5. Masterwork

Each item-quality row can define:
- item_id
- quality_tier
- enabled
- required_skill_id / specialization
- required_skill_rank
- required_blueprint_or_breakthrough
- material_tier / source expectation
- max_durability_multiplier
- degradation_multiplier
- reliability_modifier
- repair_tolerance_modifier
- optional small modifier scaling
- notes

General progression:
- Tier 1 can be supported entirely by city materials.
- Tier 2 may require Grey Marches materials.
- Tier 3+ may require Pall-zone materials.
- Tier 4 generally requires 50+ relevant crafting progression.
- Tier 5 generally requires 70+ relevant crafting progression.

These are defaults, not a promise that every item supports every tier.

## 5. Fittings

Only selected equipment families use fittings in the first version:
- weapons;
- backpacks;
- respiratory systems.

A fitting is itself an item and can therefore be crafted, traded, damaged where appropriate and have a quality tier.

Fitting compatibility fields:
- fitting_item_id
- fitting_family
- accepted_host_category/type
- accepted_slot_type
- fitting_size/class if later needed
- notes

Host quality is the hard ceiling:
- Crude host -> Crude fitting only
- Standard -> up to Standard
- Well-made -> up to Well-made
- Fine -> up to Fine
- Masterwork -> up to Masterwork

Lower-quality fittings are allowed in better hosts. Higher-quality fittings are not allowed in worse hosts.

Fitting effects use the same generic Item Modifiers table rather than a separate stat system.

## 6. Degradation profile

Durability loss is driven by reusable profiles.

A profile can define:
- loss per meaningful use
- loss per combat encounter
- loss per environmental exposure interval
- zone severity multiplier
- Pall exposure multiplier
- Ash exposure multiplier
- difficult-combat wear multiplier
- flee/forced-retreat wear multiplier
- stored/protected multiplier
- maintained multiplier
- family-specific notes

Exact rates are balance data and remain tunable.

Outdoor exposure should be calculated from elapsed time in sensible server intervals rather than ticking every second.

## 7. Maintenance profile

Maintenance prevents future wear. It does not restore lost durability.

A profile can define:
- maintenance type
- required consumable/material
- required skill/tool/facility
- maintenance time
- duration mode: uses, encounters or exposure time
- duration/value
- degradation reduction
- reliability/misfire benefit where relevant

Examples include gun cleaning, blade sharpening, coat waxing, respirator servicing and pack reinforcement.

The first version should use simple active/expired maintenance effects rather than another 0–100 meter.

## 8. Durability state

The exact tuning is data-driven, but the current intended bands are:

- 100–81%: Sound
- 80–61%: Worn
- 60–41%: Damaged
- 40–21%: Failing
- 20–11%: Critical
- 10% and below: Ruined / irreparable

Stat loss may follow family-specific curves.

Damage descriptions such as cracked, torn, corroded, scorched or Pall-stained are normally flavour generated from damage history. They are not a second item-condition system.

## 9. Runtime item instance

The catalogue describes an item type. A player's actual physical copy needs an instance record.

Minimum runtime state:
- item_instance_id
- item_id
- owner/location
- quality_tier
- current_durability
- current_max_durability
- maintenance state/expiry where relevant
- installed fittings
- loaded filter/ammunition where relevant
- contained_liquid_id and contained_liquid_amount where relevant
- crafted_by_player_id if applicable
- created_at
- optional provenance/history flags

This separation is essential. Two rifles of the same item_id may have different quality, durability, fittings, repair history and owners.

## 10. Implementation principle

Server owns item truth.

The browser may request:
- equip;
- use;
- repair;
- maintain;
- install fitting;
- remove fitting;
- craft;
- dismantle;
- sell.

The server validates requirements, state, inventory, quality compatibility and costs, then applies the result.

No individual item should need bespoke server code unless it deliberately introduces a genuinely unique mechanic.
