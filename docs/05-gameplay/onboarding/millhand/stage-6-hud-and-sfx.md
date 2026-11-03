# Stage 6 HUD placement and owner combat SFX

**Date:** 2026-11-03  
**Status:** Interim UI refinement; combat mechanics unchanged.

## Visual placement

On desktop the enemy's Health, Stamina, Fatigue, Momentum and expandable
condition details sit beside Flint in the industrial alley, below and to the
right of his nameplate. The round/intent parchment stays at upper right.
The approved action icon strip and compact action-detail selector stay in
the lower alley.

Below the alley, **Battle Chronicle occupies the left column** and **the
player's combat condition the right column**, directly beneath the action
controls. Full Chronicle history, wounds and secondary stats remain accessible.
At widths under 920 px the enemy card moves beneath the scene, and the lower
Chronicle and player card stack. No values or action options are dropped.

The standing Flint asset is replaced by
`/characters/flint/flint-defeated.webp` whenever the saved encounter outcome
is `player_victory`. Player defeat keeps standing Flint. The work cart and
frame labels are unchanged.

## Original SFX files and browser assets

All 12 cues came from owner upload `UI_Combat_SFX.zip` and are stored under
`platform/apps/web/static/audio/the-pall/combat/`. Eleven WAVs were
transcoded to compact MP3; the supplied Guard MP3 is preserved.

| Uploaded file | Browser file | Trigger |
| --- | --- | --- |
| `UI_Combat_Guard.mp3` | `guard.mp3` | Saved player Guard |
| `UI_Combat_Reposition01.wav` | `reposition.mp3` | Saved player Reposition |
| `UI_Combat_Hit01–04.wav` | `hit-01–04.mp3` | Damage event with positive actual damage |
| `UI_Combat_MaleGrunt01–03.wav` | `male-grunt-01–03.mp3` | Flint takes damage or male player takes damage |
| `UI_Combat_MaleGrant04.wav` | `male-grunt-04.mp3` | Same male grunt group; source typo retained here |
| `UI_Combat_MaleLowStamina.wav` | `male-low-stamina.mp3` | Flint, or male player, crosses below 20 Stamina |
| `UI_Combat_FightFinished.wav` | `fight-finished.mp3` | Encounter transitions from active to finished |

Effects are predecoded on Stage 6 mount, not throughout the other tutorial
stages. They share the game's SFX volume, mute, scene activity and browser
unlock settings. The existing global UI click remains on selecting an action;
the confirmation control suppresses the generic click to avoid false attack
feedback. Game-specific sounds only occur following a successful authenticated
turn response; old Chronicle events and page reloads do not replay them.
Female player characters do not receive the supplied male grunt.

No changes were made to the v0.5.1 combat engine, Flint AI, damage,
action costs, enemy intentions, save schema or battle Chronicle events.
