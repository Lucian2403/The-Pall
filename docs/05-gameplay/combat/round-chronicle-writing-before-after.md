# Battle Chronicle — complete writing comparison

These are **real test outputs**, not imagined fight dialogue. The Before texts are from PR #60 at commit `11f266e5`, before the continuity-writing pass. The After texts are from deterministic CI for commit `62b28a70`, after that pass. The final presentation-only changes do not alter the round composer.

Flint and Dogman use the actual `combat-v0.5.1` resolver, seed `199`, and high-Health **test-only** fixtures to keep the fights active for twelve rounds. These values are not gameplay balancing changes. The Glass-Silt Weaver trace is twelve **simulated committed events** with an unfamiliar ability. It is not a playable procedural encounter. Both columns use the same event sequence for each fight.

The numerical data, tactical labels and source event order are not edited for style. Complete original events remain available in the expanded Chronicle.

## Flint — real engine, 12 rounds

### Before: separate action phrasing

```text
Round 1: You guard. Flint hits you in the chest with a heavy club, but you block part of the blow.
10 damage to you · 4 blocked · +10 Momentum (Flint)
Opening gained (You)
Round 2: You take the opening and hit Flint in the ribs. Flint strikes you on the forearm with a heavy club.
9 damage to Flint · Opening bonus +5 · 15 damage to you
Round 3: You take the opening and hit Flint in the ribs. Flint uses Driving Blow but misses you.
4 damage to Flint · +10 Momentum (You) · −20 Momentum (Flint)
Opening gained (You) · Exposed (You)
Round 4: You guard. Flint takes the opening and hits you in the side with a heavy club, but you block part of the blow.
10 damage to you · 7 blocked · +10 Momentum (Flint)
Opening gained (You)
Round 5: You take the opening and hit Flint in the side. Flint misses you.
12 damage to Flint · Opening bonus +5 · +10 Momentum (You)
Opening gained (You)
Round 6: You attack Flint but miss. Flint hits you in the side with a heavy club.
16 damage to you · +10 Momentum (Flint)
Opening used (You) · Exposed (You)
Round 7: You guard. Flint uses Driving Blow but misses you.
+3 Fatigue (You) · −20 Momentum (Flint) · +3 Fatigue (Flint)
Opening used (Flint) · Opening gained (You)
Round 8: You take the opening and hit Flint in the side. Flint strikes you in the chest with a heavy club.
13 damage to Flint · Opening bonus +5 · 14 damage to you
Round 9: You strike Flint in the ribs. Flint attacks you but misses.
7 damage to Flint · +10 Fatigue (You) · +10 Momentum (You)
Opening gained (You) · Exposed (You)
Round 10: You guard. Flint takes the opening and hits you in the ribs with a heavy club, but you block part of the blow.
9 damage to you · 7 blocked · +5 Fatigue (You)
Opening gained (You)
Round 11: You take the opening and hit Flint in the chest. Flint uses Driving Blow but misses you.
8 damage to Flint · +10 Fatigue (You) · +10 Momentum (You)
Opening gained (You)
Round 12: You miss Flint. Flint tries to hit you but misses.
+10 Fatigue (You) · +10 Fatigue (Flint)
Opening used (You) · Opening gained (You) · Exposed (You)
```

### After: history-aware exchange wording

```text
Round 1: You guard. Flint hits you in the chest with a heavy club, but you block part of the blow.
10 damage to you · 4 blocked · +10 Momentum (Flint)
Opening gained (You)
Round 2: You take the opening and hit Flint in the ribs. Flint hits you again on the forearm with a heavy club.
9 damage to Flint · Opening bonus +5 · 15 damage to you
Opening used (You)
Round 3: You hit Flint again in the ribs. Flint uses Driving Blow but misses you.
4 damage to Flint · +10 Momentum (You) · −20 Momentum (Flint)
Opening used (You) · Opening gained (You) · Exposed (You)
Round 4: You guard. Flint takes the opening and hits you in the side with a heavy club, but you block part of the blow.
10 damage to you · 7 blocked · +10 Momentum (Flint)
Opening used (Flint) · Opening gained (You)
Round 5: You take the opening and hit Flint in the side. Flint attacks you but misses.
12 damage to Flint · Opening bonus +5 · +10 Momentum (You)
Opening used (You) · Opening gained (You)
Round 6: You attack Flint but miss. Then Flint hits you in the side with a heavy club.
16 damage to you · +10 Momentum (Flint)
Opening used (You) · Exposed (You)
Round 7: You guard. Flint uses Driving Blow but misses you.
+3 Fatigue (You) · −20 Momentum (Flint) · +3 Fatigue (Flint)
Opening used (Flint) · Opening gained (You)
Round 8: You take the opening and hit Flint in the side. Flint also hits you in the chest with a heavy club.
13 damage to Flint · Opening bonus +5 · 14 damage to you
Opening used (You)
Round 9: You hit Flint again in the ribs. Flint attacks you but misses.
7 damage to Flint · +10 Fatigue (You) · +10 Momentum (You)
Opening gained (You) · Exposed (You)
Round 10: You guard. Flint takes the opening and hits you in the ribs with a heavy club, but you block part of the blow.
9 damage to you · 7 blocked · +5 Fatigue (You)
Opening used (Flint) · Opening gained (You)
Round 11: You take the opening and hit Flint in the chest. Flint uses Driving Blow but misses you.
8 damage to Flint · +10 Fatigue (You) · +10 Momentum (You)
Opening used (You) · Opening gained (You)
Round 12: You and Flint both miss.
+10 Fatigue (You) · +10 Fatigue (Flint)
Opening used (You) · Opening gained (You) · Exposed (You)
```

## Dogman — real engine, 12 rounds

### Before: separate action phrasing

```text
Round 1: You guard. Dogman hits you in the chest with a light club, but you block part of the blow.
8 damage to you · 4 blocked · +10 Momentum (Dogman)
Opening gained (You)
Round 2: You take the opening and hit Dogman in the ribs. Dogman strikes you in the ribs with a light club.
9 damage to Dogman · Opening bonus +5 · 13 damage to you
Round 3: Dogman guards. You take the opening and hit Dogman in the chest, but Dogman blocks part of the blow.
3 damage to Dogman · 3 blocked · +10 Momentum (You)
Opening gained (Dogman) · Exposed (You)
Round 4: You guard. Dogman takes the opening and uses Committed Swing to hit you in the side with a light club, but you block part of the blow.
9 damage to you · 8 blocked · −20 Momentum (Dogman)
Opening gained (You)
Round 5: Dogman steps aside, and your attack falls short.
Round 6: You move closer. Dogman moves closer.
Round 7: You guard. Dogman guards.
+3 Fatigue (You) · +3 Fatigue (Dogman)
Round 8: Dogman steps aside, and your attack falls short.
+3 Fatigue (Dogman) · +3 Fatigue (You)
Round 9: You move closer. Dogman moves closer.
+3 Fatigue (You) · +3 Fatigue (Dogman)
Round 10: You guard. Dogman attacks you but misses.
+5 Fatigue (You) · +3 Fatigue (Dogman)
Opening gained (You)
Round 11: You take the opening and hit Dogman in the chest. Dogman misses you.
13 damage to Dogman · Opening bonus +5 · +10 Fatigue (You)
Opening gained (You)
Round 12: Your attack misses Dogman. Dogman tries to hit you but misses.
+10 Fatigue (You) · +10 Fatigue (Dogman)
Opening used (You) · Opening gained (You) · Exposed (You)
```

### After: history-aware exchange wording

```text
Round 1: You guard. Dogman hits you in the chest with a light club, but you block part of the blow.
8 damage to you · 4 blocked · +10 Momentum (Dogman)
Opening gained (You)
Round 2: You take the opening and hit Dogman in the ribs. Dogman hits you again in the ribs with a light club.
9 damage to Dogman · Opening bonus +5 · 13 damage to you
Opening used (You)
Round 3: Dogman guards. You hit Dogman again in the chest, but Dogman blocks part of the blow.
3 damage to Dogman · 3 blocked · +10 Momentum (You)
Opening used (You) · Opening gained (Dogman) · Exposed (You)
Round 4: You guard. Dogman takes the opening and uses Committed Swing to hit you in the side with a light club, but you block part of the blow.
9 damage to you · 8 blocked · −20 Momentum (Dogman)
Opening used (Dogman) · Opening gained (You)
Round 5: Dogman steps aside, and your attack falls short.
Round 6: You move closer. Dogman moves closer.
Round 7: You guard. Dogman guards.
+3 Fatigue (You) · +3 Fatigue (Dogman)
Round 8: Dogman moves to the side, and your attack falls short.
+3 Fatigue (Dogman) · +3 Fatigue (You)
Round 9: You move closer. Dogman moves closer.
+3 Fatigue (You) · +3 Fatigue (Dogman)
Round 10: You guard. Dogman attacks you but misses.
+5 Fatigue (You) · +3 Fatigue (Dogman)
Opening gained (You)
Round 11: You take the opening and hit Dogman in the chest. Dogman misses you again.
13 damage to Dogman · Opening bonus +5 · +10 Fatigue (You)
Opening used (You) · Opening gained (You)
Round 12: You and Dogman both miss.
+10 Fatigue (You) · +10 Fatigue (Dogman)
Opening used (You) · Opening gained (You) · Exposed (You)
```

## Glass-Silt Weaver — generated event trace, 12 rounds

### Before: separate action phrasing

```text
Round 1: Glass-Silt Weaver uses Bindwater Reach and wraps you with its filament.
3 damage to you · Held (2 rounds)
Round 2: You step aside, and Glass-Silt Weaver uses Bindwater Reach, but cannot reach you.
Round 3: You catch your breath. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
Round 4: Glass-Silt Weaver wraps you with its filament using Bindwater Reach.
6 damage to you
Round 5: You move to the side, and Glass-Silt Weaver uses Bindwater Reach, but cannot reach you.
Round 6: You rest for a moment. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
Round 7: Glass-Silt Weaver uses Bindwater Reach to wrap you with its filament.
9 damage to you
Round 8: You step aside, and Glass-Silt Weaver uses Bindwater Reach, but cannot reach you.
Round 9: You catch your breath. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
Round 10: Glass-Silt Weaver uses Bindwater Reach and wraps you with its filament.
12 damage to you
Round 11: You move to the side, and Glass-Silt Weaver uses Bindwater Reach, but cannot reach you.
Round 12: You rest for a moment. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
```

### After: history-aware exchange wording

```text
Round 1: Glass-Silt Weaver uses Bindwater Reach and wraps you with its filament.
3 damage to you · Held (2 rounds)
Round 2: You step aside. Glass-Silt Weaver uses Bindwater Reach, but cannot reach you.
Round 3: You catch your breath. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
Round 4: Glass-Silt Weaver wraps you with its filament using Bindwater Reach.
6 damage to you
Round 5: You move to the side. Glass-Silt Weaver tries Bindwater Reach, but you are out of reach.
Round 6: You rest for a moment. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
Round 7: Glass-Silt Weaver uses Bindwater Reach to wrap you with its filament.
9 damage to you
Round 8: You step aside. Glass-Silt Weaver uses Bindwater Reach, but cannot reach you.
Round 9: You catch your breath. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
Round 10: Glass-Silt Weaver uses Bindwater Reach and wraps you with its filament.
12 damage to you
Round 11: You move to the side. Glass-Silt Weaver tries Bindwater Reach, but you are out of reach.
Round 12: You rest for a moment. Glass-Silt Weaver guards.
+9 Stamina (You) · −4 Fatigue (You)
```


## Manual review

In Flint's second round, the later strike is now described as a hit **again**, because the enemy hit in round one. Flint's third round recognises another player hit; round six preserves the order of a missed player attack followed by an enemy hit. The labels distinguish Openings used from Openings gained.

Dogman's repeated sidesteps and out-of-reach player attacks remain factual: no dodge success is claimed unless the resolver records one. Round twelve is a short **both miss** exchange instead of two disconnected miss sentences. His Committed Swing still carries the actual ability name and Guard reduction.

Glass-Silt Weaver's three wordings for Bindwater Reach follow prior use of the same generated ability ID. The range failures are clear without inventing a successful dodge or human anatomy. The initial `Held (2 rounds)` effect is shown once, when it actually applied.

The Chronicle still deliberately gives plain descriptions when combat metadata cannot establish a physical method. It does not guess that the fighter punches, swings, panics, falls or feels pain. Combat victory and defeat are checked by separate resolved-ending tests; these high-Health twelve-round examples do not invent a finishing blow.
