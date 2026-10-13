# First Playable Vertical Slice — Scope Boundary

**Status: AGREED — 2026-10-13.**

This document defines the *first playable vertical slice*, not the whole of Phase One. The implementation milestone will be restricted to **Grand Cylinder City → Protected Outskirts → Grey Marches → return to city**. The Pall itself remains in the broader Phase One progression and is **not an accessible destination in the first slice**.

## Playable places

- **Grand Cylinder City:** introductory city life, starting jobs, market, basic crafting and recovery.
- **Protected Outskirts:** introductory gathering, harvesting and lower-risk exploration.
- **Grey Marches:** first hazardous expeditions, environmental preparation and hazards, limited PvE combat and discovery.
- **Return to City:** sell, rest, repair, develop skills, re-equip and plan another trip.

This is a **location boundary**, not a statement that all content already proposed for these regions must ship in the first slice. Named sites, NPCs and routes still require definition.

## Essential playable systems

- Character creation, existing four attributes, initial state and skill advancement.
- Inventory, carrying and equipment condition.
- Safe-area jobs and gathering; introductory refining/crafting and basic trade.
- Stamina/Fatigue, Composure/Stress, Health/injury, Hunger, and active Thirst when outside safe-city infrastructure.
- Survival protection and environmental exposure primarily through suitable equipment.
- Basic PvE combat, encounter resolution and retreat consequences.
- Basic NPC commerce and accessible player market, with safeguards for low initial liquidity.
- Time-based travel, a limited encounter template pool, discoveries and expedition rewards.

The precise mechanisms, gameplay tuning and content roster are **not yet locked** merely because their feature family is included.

## Explicitly outside the first playable slice

- Entry into the Pall or deep-Pall expedition loop (retained for later Phase One).
- High-tier material acquisition that requires deeper Pall zones.
- Advanced housing/large player estates, player-owned industry, trains and industrial transport networks.
- Extensive faction simulation and a large generated quest/content catalogue.
- Complete implementation of every T3/T4 component or top-end equipment recipe already designed.
- Broad multiplayer warfare or nonconsensual PvP.

Do not conflate **not in first slice** with **cut from Phase One**. Existing lore and locked item specifications remain canonical and may ship in subsequent Phase One milestones.

## Acceptance test for the vertical slice

A player can create a character, obtain a starting opportunity, undertake a city job, earn an appropriate reward, gather or craft something useful, prepare for and travel into the Grey Marches, resolve a genuine hazard or opponent using their skills/equipment, safely return (or suffer intelligible consequences), sell/trade materials, maintain/recover and choose the next objective. The server persists important outcomes correctly.

## Next design task — not yet locked

Specify the **first 30 minutes** of play, including access to the market, background-specific beginner jobs, reward/skill feedback, tutorial pacing and the first outskirts objective. **Now agreed across all six origins:** starting kit is **Basic Clothes + one Crude Small Bag + 20 coins**, and each origin completes first-skill job → twist/choice → different-skill second job → two interactions → turn-based PvE encounter → healing → home and rent notice (see [Shared Tutorial Structure](../05-gameplay/onboarding/shared-structure.md)). Precise item attributes, wages/XP, medical charges, timings and specific NPC names remain to be authored.

References:
- [Core Design Pillars](design-pillars.md)
- [Character System](../01-player/character-system.md)
- [Jobs and Time](../05-gameplay/jobs/jobs-and-time.md)
- [Economy and Crafting](../03-resources/catalogue/economy-and-crafting.md)
