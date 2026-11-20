# The Pall — Complete Round Chronicle Samples

These three complete, ordered Chronicles were emitted by the deterministic
`platform/scripts/verify-combat-rounds.test.ts` acceptance test on the current
PR #60 branch. They are saved round narratives; they are **not** collections of
individual engine event messages.

For Flint and Dogman the test calls the real `combat-v0.5.1` encounter
resolver with fixed seed `199` and a high-Health **test fixture** so the
encounter stays active for at least twelve rounds. That Health override is
only in the test; the game has **not** been rebalanced.

For the generated Glass-Silt Weaver, the test supplies twelve deterministic
**resolved event records**, including a new ability named Bindwater Reach. The
current combat prototype has no procedural encounter generator; this is a
universal-narrator acceptance test, not a claim that the creature is playable.

The compact numbers line highlights damage, blocking and applied conditions.
Other costs, failed effects and exact source events remain in each round's
expandable Details section in the actual UI.

## Flint — real engine, 12 rounds

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

## Dogman — real engine, 12 rounds

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

## Glass-Silt Weaver — generated event trace, 12 rounds

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

## Source preservation

Each recorded round summary has `version:3`, its encounter and round identity,
source event indexes, ordered actions and tactical statuses. The server writes
it in the same transaction as the original committed event records. Older
version-1, version-2 and raw event histories retain their saved wording.
