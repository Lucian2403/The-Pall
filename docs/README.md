# The Pall — Design Documentation

This directory contains the human-readable design source of truth.

## Structure

- `00-vision/` — game pillars and non-negotiable design rules.
- `01-player/` — character state, attributes, skills and progression.
- `02-equipment/` — equipment and survival gear.
- `03-economy/` — resources, crafting, food and the player economy.
- `04-world/` — locations, routes, discoveries and world-state systems.
- `05-content/` — quests, encounters, factions and procedural content.
- `06-bases/` — housing, compounds, workshops and trains.
- `07-technical/` — architecture, data contracts and implementation decisions.
- `decisions/` — important locked design decisions and their reasoning.

## Rule

**Chat proposes. Docs decide. Structured game data tunes. Code implements.**

Game systems should be implemented generically enough that most future additions are new data/content rather than new special-case code.
