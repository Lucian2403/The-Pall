import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGIN_CATALOGUE, APPROVED_STARTING_FACTS, previewCharacterStart} from '../dist/index.js';

const expected = new Map([
  ['Millhand','Craftsmanship'],
  ['Bellrunner','Industry'],
  ['Squatter','Fieldcraft'],
  ['Stitcher','Medicine'],
  ['Scrapper','Mechanics'],
  ['Inkbound','Scholarship']
]);

test('six approved origins each have the correct Major Skill', () => {
  assert.equal(ORIGIN_CATALOGUE.length, 6);
  assert.deepEqual(
    Object.fromEntries(ORIGIN_CATALOGUE.map(v => [v.origin,v.majorSkill])),
    Object.fromEntries(expected)
  );
});

for (const [origin, skill] of expected) {
  for (const sex of ['Male','Female']) {
    test(`${origin}/${sex} starts with identical kit and +3 to ${skill}`, () => {
      const preview = previewCharacterStart(origin, sex);
      assert.deepEqual(preview.attributes, {STR:5,DEX:5,INT:5,RES:5});
      assert.equal(preview.maximumHealth, 50);
      assert.equal(preview.coins, 20);
      assert.deepEqual(preview.starterItemDisplayNames, ['Basic Clothes','Crude Small Bag']);
      assert.deepEqual(preview.originMajorSkillBonus, {majorSkill:skill,levels:3});
      assert.deepEqual(preview.portraitSelection, {origin,sex});
      assert.equal('itemId' in preview, false, 'TBD item schema must not be invented');
    });
  }
}

test('invalid origin/sex choices are rejected', () => {
  assert.throws(() => previewCharacterStart('Other', 'Male'), /invalid_starting_character_choice/);
  assert.throws(() => previewCharacterStart('Millhand', 'Other'), /invalid_starting_character_choice/);
});
test('read-only preview returns independent mutable copies', () => {
  const one = previewCharacterStart('Millhand','Male');
  const two = previewCharacterStart('Millhand','Male');
  one.attributes.STR = 999;
  one.starterItemDisplayNames.push('Unapproved');
  assert.equal(two.attributes.STR, APPROVED_STARTING_FACTS.attributes.STR);
  assert.deepEqual(two.starterItemDisplayNames, ['Basic Clothes','Crude Small Bag']);
});
