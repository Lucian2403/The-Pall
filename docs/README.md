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

## Specific design records

- [Filter Progression](03-economy/filter-progression.md)
- [Gear Assembly — Phase One](03-economy/gear-assembly.md)
- [Basic Spring — Phase One](03-economy/basic-spring.md)
- [Fastener Set — Phase One](03-economy/fastener-set.md)
- [Firing Mechanisms — T1 to T3](03-economy/firing-mechanisms.md)
- [Copper Wire — Phase One](03-economy/copper-wire.md)
- [Rifle Sights — T2 and T3](03-economy/rifle-sights.md)
- [Lens Set — Advanced Optics](03-economy/lens-set.md)
- [Refined Fluorspar — Specialist Mineral Processing](03-economy/refined-fluorspar.md)
- [Precision Tool Roll — Portable Fine Mechanics](03-economy/precision-tool-roll.md)
- [Precision Mechanisms — Catalogue Audit](03-economy/precision-mechanisms-audit.md)
