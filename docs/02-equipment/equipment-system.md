# Equipment System

## Locked core rules

### Durability and degradation

- Tools and weapons lose durability whenever they are meaningfully used, including inside the city.
- Outside the city, worn clothing and protective equipment also lose durability from environmental exposure over time.
- Outdoor equipment degradation may occur from:
  - combat encounters;
  - elapsed exposure time in a zone;
  - particularly severe environmental hazards;
  - failed or desperate escape attempts.
- Hard encounters should cause more equipment wear than easy encounters.
- Fleeing from a difficult combat encounter can cause a significant durability penalty, representing rough retreat, damaged gear and emergency use.
- Different item families have different degradation profiles. A rifle, coat, hammer and respirator should not wear at the same rate or for the same reasons.
- Server implementation should aggregate time-based exposure into intervals rather than process durability loss every second.

### Dynamic effectiveness

Item effectiveness decreases as durability falls. Condition bands can be used instead of recalculating every modifier at every single durability percentage.

Provisional condition bands:
- 100–81%: sound
- 80–61%: worn
- 60–41%: damaged
- 40–21%: failing
- 20–11%: critical
- 10% and below: ruined / irreparable

Different item families may use different degradation curves.

At critical condition, an item may still function poorly. At roughly 0–10% durability, it is considered ruined and cannot be repaired.

### Quality tiers

The five quality tiers are:
1. Crude
2. Standard
3. Well-made
4. Fine
5. Masterwork

These are craftsmanship qualities, not MMO rarity colors.

Quality primarily affects:
- maximum durability;
- resistance to degradation;
- repair tolerance;
- reliability;
- small stat improvements where appropriate;
- possibly minor additional properties.

Quality access is tied to both progression and material access.

General direction:
- Tier 1: can be produced from materials available inside the city.
- Tier 2: may require materials sourced from the Grey Marches.
- Tier 3+: may require materials from Pall zones.
- Tier 4: generally requires 50+ progression in the relevant Craftsmanship branch/specialization.
- Tier 5: generally requires 70+ progression in the relevant Craftsmanship branch/specialization.

Not every item supports all five qualities.

Examples:
- some simple items may exist only in one or two quality tiers;
- some advanced items may unlock only at high skill and still support only the first two or three quality grades;
- higher quality variants may themselves require later progression, such as 60+ or 70+.

There is no requirement for every item to have a Masterwork version.

### Repairs

Repairs restore lost durability but require resources.

City service repair:
- performed by an appropriate NPC or service such as smith, carpenter or specialist;
- costs coins;
- also consumes appropriate parts/materials;
- may be required for complex or high-tier equipment.

Self-repair in a workshop:
- no coin service fee;
- consumes more parts/materials than specialist service;
- consumes a repair kit or equivalent repair supply for each repair operation;
- requires appropriate skill, tools and facility.

Field repair:
- limited to suitable/basic equipment;
- uses repair kits and materials;
- restores only part of the lost durability;
- advanced/high-tier equipment may require proper facilities and cannot be fully repaired in the field.

Major repairs may reduce maximum durability for some item classes, creating long-term item sinks.

### Maintenance

Maintenance is preventative and does **not** restore durability.

The first-version maintenance system should remain lightweight:
- an item can be **Maintained** or **Overdue** rather than having another numeric meter;
- maintenance consumes small amounts of cheap materials and a short amount of time;
- maintenance reduces future degradation or failure risk for a limited duration, number of uses or until severe exposure;
- maintenance can be performed in the city and, for some items, in the field with appropriate supplies.

Possible examples:
- weapon cleaning/oiling: reduced degradation and misfire risk for the next number of shots/encounters;
- coat waxing/sealing: reduced Pall/Ash environmental wear for a period of exposure;
- respirator seal inspection: reduced seal deterioration and filter waste;
- backpack stitching/reinforcement: reduced durability loss from heavy carrying;
- tool sharpening/alignment: reduced wear and better reliability for the next number of work actions.

Maintenance should reward preparation without creating another resource bar to babysit.

### Modification slots

Keep attachment/modification systems narrow in the first version.

Only selected item families should normally support modification slots:
- backpacks;
- weapons;
- respiratory systems.

Most clothing, tools and miscellaneous equipment should have no modification slots unless there is a clear gameplay reason.

### Item condition / damage flavour

Do not add a second mechanical condition system on top of durability in the first version.

Terms such as:
- corroded;
- cracked;
- scorched;
- torn;
- fouled;
- Pall-stained

can be descriptive/RP text derived from the source of durability loss.

They may appear in tooltips, combat logs, repair summaries or item history, but should not create additional hidden debuff stacks unless a future item explicitly needs a unique mechanic.

This keeps the first-version item model understandable while preserving atmosphere.

## Important distinction: raw vs effective skill

Character progression must remain distinct from equipment assistance.

- **Raw Skill** = the character's learned progression.
- **Effective Skill** = Raw Skill + temporary modifiers from equipment, tools, conditions and other effects.

Equipment bonuses may improve checks, work speed, accuracy, output quality or available action options.

However, important progression gates such as:
- breakthroughs;
- recipe comprehension;
- major qualification requirements;
- certain permanent unlocks

should usually check Raw Skill, not Effective Skill, unless a specific design explicitly allows assistance.

This prevents gear-swapping from replacing character development.

## Environmental degradation

Outdoor degradation should depend on:
- zone severity;
- item material;
- item category;
- exposure time;
- whether the item is equipped/exposed or protected in storage;
- Pall/Ash resistance of the item itself;
- maintenance state.

Protected backpack/stored items should generally degrade much more slowly than exposed equipment.

## Item identity

Useful item dimensions may include:
- weight;
- volume/storage footprint;
- durability;
- quality;
- material;
- noise;
- heat/smoke output;
- environmental resistances;
- skill/specialization modifiers;
- mobility/encumbrance effects;
- maintenance difficulty;
- repair class;
- legality/contraband state;
- contamination state where explicitly relevant;
- modification slots;
- manufacturer/crafting provenance.

## Salvage

Ruined or obsolete equipment may still be dismantled for partial material/component recovery when appropriate.

This helps keep destroyed items economically relevant without making destruction meaningless.
