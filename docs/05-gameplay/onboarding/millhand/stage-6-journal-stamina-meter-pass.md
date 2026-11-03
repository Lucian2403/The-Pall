# Stage 6: Live Stamina, compact resource bars, and Personal Journal

**Date:** 2026-11-04  
**Scope:** Millhand / Flint combat presentation; no combat-system changes.

## Shared header

The combat screen now supplies an explicit `combatStamina` value to
`TutorialShell`, sourced from `battle.player.stamina` in the current
authenticated, persisted combat snapshot. The Svelte prop updates after
each saved turn and also initializes correctly when the user reloads a
previously saved battle. The header uses that source ahead of character
catalogue data or the provisional 100/100 HUD baseline.

For non-combat stages, the existing header resource behavior is retained.
Health continues to use the saved character Health already updated by
the combat route.

## Flint and player resource displays

The reusable combatant status template now renders three compact meters
with the **current numeric value** for both actors: Stamina, Fatigue
and Momentum. The numeric values always come from the saved combat
snapshot; no independent local counter is maintained.

The visual bars use a 0–100 reference scale; the exact number is always
shown next to the label. The v0.5.1 engine does not impose a hard
100-point Fatigue cap, so a Fatigue value above 100 is still displayed
unaltered even when its visual bar is full. Bar graphics are decorative;
the text remains available to assistive technologies.

## Personal Journal

The outcome Journal now uses the earlier Stage 4–5 Journal's parchment
background, ink color, typographic hierarchy, centered reading width,
line spacing and title treatment. The title is `PERSONAL JOURNAL`
with the chapter heading `The Fight with Flint`. Previously approved
first-person entries remain untouched.

## Boundaries and verification

This changes Svelte presentation only. The original combat v0.5.1
engine, turn actions, persistence, rewards, audio cues, result handling
and developer rewind remain unchanged.

`npm run verify:stage-six` includes assertions for the header's
combat-snapshot binding, both actors' three numeric resource meters,
and the consistent parchment Journal. The usual combat regression
suite, API checks and production web build must also pass.
