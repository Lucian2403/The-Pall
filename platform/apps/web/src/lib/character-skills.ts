/**
 * The eight agreed Major Skills and 32 subskills, in canonical order.
 * Source of truth: docs/01-player/skills-progression.md, "Canonical Major
 * Skills and Subskills". These are NAMES, not character XP / levels.
 * A saved character currently exposes recorded majorSkillBonuses only.
 */
export const CHARACTER_SKILLS = [
  {major:'Arms', subskills:['Melee','Pistols','Rifles','Scatterguns','Defense']},
  {major:'Fieldcraft', subskills:['Scavenging','Navigation','Foraging','Tracking']},
  {major:'Industry', subskills:['Hauling','Mining','Construction','Refining']},
  {major:'Mechanics', subskills:['Pressure Systems','Precision Mechanisms','Weapon Maintenance','Industrial Machinery']},
  {major:'Craftsmanship', subskills:['Smithing','Carpentry','Tailoring','Cooking']},
  {major:'Medicine', subskills:['Trauma','Surgery','Disease','Herbalism']},
  {major:'Scholarship', subskills:['Pall Research','Investigation','Engineering Theory']},
  {major:'Commerce', subskills:['Trading','Negotiation','Logistics','Contracts']}
] as const;
