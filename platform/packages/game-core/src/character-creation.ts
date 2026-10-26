/**
 * M1.2 — READ-ONLY approved character starting catalogue.
 * This is not a character-create command, DB migration, inventory implementation,
 * item catalogue or a source of finalized portrait asset IDs.
 * Canon: docs/01-player/character-creation.md (2026-10-13 approvals).
 */
export const ORIGIN_CATALOGUE = [
  {origin: 'Millhand', socialRole: 'Foundry and workshop labor', majorSkill: 'Craftsmanship'},
  {origin: 'Bellrunner', socialRole: 'City messengers and shift couriers', majorSkill: 'Industry'},
  {origin: 'Squatter', socialRole: 'Families at the protected outskirts', majorSkill: 'Fieldcraft'},
  {origin: 'Stitcher', socialRole: 'Clinic attendants and informal caregivers', majorSkill: 'Medicine'},
  {origin: 'Scrapper', socialRole: 'Scrap-yard pickers and demolition crews', majorSkill: 'Mechanics'},
  {origin: 'Inkbound', socialRole: 'Records keepers and ledger copyists', majorSkill: 'Scholarship'}
] as const;

export type Origin = (typeof ORIGIN_CATALOGUE)[number]['origin'];
export type CharacterSex = 'Male' | 'Female';

export const APPROVED_STARTING_FACTS = {
  attributes: {STR: 5, DEX: 5, INT: 5, RES: 5},
  maximumHealth: 50,
  startingCoins: 20,
  // Display names only. Final item IDs, weights, slots and conditions are not approved.
  starterItemDisplayNames: ['Basic Clothes', 'Crude Small Bag'],
  originMajorSkillBonusLevels: 3
} as const;

/** Creates a UI/testing preview only; no server state or rewards are written. */
export function previewCharacterStart(origin: Origin, sex: CharacterSex) {
  const matching = ORIGIN_CATALOGUE.find(x => x.origin === origin);
  if (!matching || (sex !== 'Male' && sex !== 'Female')) {
    throw new Error('invalid_starting_character_choice');
  }
  return {
    origin: matching.origin,
    sex,
    portraitSelection: {origin: matching.origin, sex}, // no invented file path
    attributes: {...APPROVED_STARTING_FACTS.attributes},
    maximumHealth: APPROVED_STARTING_FACTS.maximumHealth,
    coins: APPROVED_STARTING_FACTS.startingCoins,
    starterItemDisplayNames: [...APPROVED_STARTING_FACTS.starterItemDisplayNames],
    originMajorSkillBonus: {majorSkill: matching.majorSkill, levels: APPROVED_STARTING_FACTS.originMajorSkillBonusLevels}
  };
}
