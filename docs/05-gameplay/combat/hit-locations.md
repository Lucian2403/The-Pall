# Narrative hit locations — version 0.5.1 combat

The player still selects exactly **Head**, **Torso** or **Limbs**. The names below are descriptions of a successfully resolved hit, not separate hit targets, damage rules or wounds.

## Human anatomy

| Target zone | Valid descriptive hit parts |
| --- | --- |
| Head (5) | forehead, temple, cheek, jaw, side of the head |
| Limbs (8) | upper arm, elbow, forearm, hand, thigh, knee, shin, calf |
| Torso (8) | chest, ribs, side, shoulder, upper back, lower back, stomach, lower abdomen |

All human parts use **in the**: `in the jaw`, `in the upper arm`, `in the side of the head`, `in the lower abdomen`. In the current engine these phrases are generated through the shared `hitLocationPhrase` helper; the same helper is used by the event narrator and round narrator.

## Extensible anatomy profile

`CombatActor.anatomy` is an optional data object:

```ts
type AnatomyProfile = {
  kind: string;
  zones: Partial<Record<'head' | 'torso' | 'limbs',
    ReadonlyArray<string | {
      name: string;
      preposition?: 'in' | 'on' | 'across';
    }>>>;
};
```

Example of a generated machine's actual structure:

```ts
const machineAnatomy = {
  kind: 'machine',
  zones: {
    head: [{name: 'lens', preposition: 'on'}],
    torso: [{name: 'casing', preposition: 'on'}],
    limbs: [{name: 'left wheel', preposition: 'on'}]
  }
};
```

A resolved strike on its lens may read **You hit the machine on the lens.** No human parts are assumed. The existing boar fixture has its own explicit quadruped profile. Other animals and generated creatures must provide valid anatomical data when introduced. A missing profile or empty zone produces a neutral hit without a body-part claim. Overriding an existing human fixture's enemy name without supplying a profile also leaves anatomy unknown, rather than automatically assigning human parts.

Profiles describe **the target**, not the attacker. An attack's `zone` is always the original Head/Torso/Limbs selection. Only successful hits carry the independently selected `hitPart` and optional `hitPartPreposition` on the authoritative **damage** event.

## Determinism and RNG preservation

`selectHitLocation(state, target, zone, eventIdentity)` uses a pure FNV-1a hash of the saved encounter identifier, a narration-only location seed, round, revision, target, zone and event identity. It never calls the combat RNG and does not change the state.

A short, persisted `hitLocationRecent` list of target/zone/part triples prevents immediate repetition and avoids the last two parts when there are enough alternatives. This does not force a fixed visible cycle. The selection and recent list survive save, retry and reload.

**Legacy RNG compatibility is deliberate:** before this change, `woundName()` drew one value from the engine's combat RNG after a successful **Torso or Limbs** hit, and drew none for **Head**. The engine still advances that same one value in those same two cases *only to preserve the existing combat RNG stream*. The descriptive selection does **not** use that value. No additional combat RNG draws occur; subsequent attack rolls, damage, AI choices and outcomes keep their former sequences. Tests compare complete combat outcomes under different anatomy profiles and location seeds.

## Chronicle and legacy records

Both shared narrators use the factual `hitPart` and `hitPartPreposition` already saved on the damage event. They never reroll a body part, reassign a zone or infer a body structure from an enemy name. Historical saved events and version-1/version-2/version-3 narratives remain as originally recorded.

The Battle Chronicle still displays **one round story and one compact numerical summary**. No nested Details or Original Event panels have been added. Technical event history remains fully persisted outside that reading UI.

## Before and after: representative wording

Earlier, every successful human Head hit described the **temple**. One valid new sequence can instead read:

- `You punch Dogman in the jaw.`
- `Dogman hits you in the forehead with his club.`
- `You strike Dogman in the side of the head.`

For the other zones:

- `You hit Dogman in the stomach.`
- `Dogman strikes you in the lower back with his club.`
- `You hit Dogman in the calf.`

These are **illustrative possible sentences**, not scripted outcomes or promised combat rolls. Actual location, damage, Guard and Opening information always come from the saved resolved event.

## Verification

The game-core tests check the exact 5/8/8 pools, full zone coverage, grammatical prepositions, independent and replayable selection, recent-repeat prevention, unknown/custom anatomy, and unchanged numerical combat states across distinct descriptive seeds and profiles. The shared event/round narrator tests check recorded hit parts, historical narration and full Flint/Dogman histories. Existing Stage 6, PostgreSQL, API, web-build and browser CI checks remain required.
