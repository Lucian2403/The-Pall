# Interaction Generation Architecture

Status: PROVISIONAL / foundational.

## Core rule

Runtime interactions should be **authored, data-driven, and procedurally assembled**.

The live game should not freely invent gameplay interactions with generative AI.

AI may be used during development to help create interaction concepts, descriptions, dialogue variants, consequence ideas, rare-event ideas, and flavour text.

After review, approved content becomes structured game data with known conditions, choices, outcomes and balance values.

**AI helps author content. The server executes approved rules.**

## Interaction template model

Each acquisition/job/activity family owns a pool of authored interaction templates.

Example Coal templates: blocked chute; wet coal shipment; broken cart axle; unstable support; oversized chunks; poor-quality seam; injured worker; missing tool; overloaded machinery; foreman requests faster output; unusual contamination; damaged lamp; collapsed storage pile; disputed load count; overheating machinery.

A template may define: interaction_id, valid activity families, required site features, rarity/weight, severity range, possible causes, secondary complications, skill/attribute requirements, tool/facility requirements, player options, hidden/visible information, outputs, injuries/status risks, durability consequences, time consequences, XP/reputation effects, quest/discovery hooks, and cooldown/repeat controls.

## Procedural assembly

The server selects only interactions valid for the current context.

A selected template can then vary by parameters such as cause, severity, site quality, material quality, weather/environment, tool availability, facility condition, player skill, player role, other workers present, chosen work method, and world event state.

Example: template `blocked_chute`; generated context: cause `wet_coal`, severity `medium`, secondary risk `tool_damage`.

The gameplay remains predictable enough to test while still producing variation.

## Skill-dependent options

Player skill should alter understanding and available actions.

Novice options might be: force the blockage loose; stop work and call the supervisor; move to another task.

An Industry specialist may additionally see: redistribute the load before opening the gate.

A Mechanics specialist may additionally see: release the seized guide bearing.

Higher skill should reveal better information and more intelligent approaches rather than only adding a hidden percentage bonus.

## Interaction frequency

Interactions must not appear merely because a timer exists.

They should be caused by difficulty, novelty, risk, poor tools/facilities, unusual materials, player choices, environmental conditions, or rare events.

Routine work should increasingly become quiet for experienced players.

Some activity sessions should contain no interaction at all.

## Content volume targets

Phase One direction:
- approximately 8–12 core templates per acquisition/activity family;
- 2–5 authored or parameterized variants per template;
- multiple possible solutions/outcomes;
- a meaningful no-interaction chance.

This can already produce dozens of practical combinations without requiring hundreds of bespoke scenes.

Mature systems may expand toward roughly 20–30 core templates per family where justified.

These are content targets, not hard engine limits.

## Rarity pools

Common examples: tool issue, bad material, loading problem, minor process mistake.

Uncommon examples: machinery failure, worker accident, unusual deposit, significant environmental complication.

Rare examples: strange Pall residue, buried machinery, sealed cache/object, unusual biological/mineral find, quest/discovery trigger.

Rare events can bridge ordinary work into discoveries, rumours, contracts, quests, faction consequences, or unusual loot.

## Repetition control

The server should track a short recent-interaction memory for each player/activity family.

Recently seen templates receive temporarily reduced selection weight.

This prevents technically random but repetitive sequences such as blocked chute -> blocked chute -> blocked chute.

Possible controls include per-template cooldown, recent-history penalty, minimum spacing for rare interactions, and location-specific repetition limits.

## Determinism and testing

Every gameplay interaction must resolve from known server-side data.

Example interaction ID: `coal_blocked_chute_01`.

Developers/admins should be able to inspect trigger conditions, selection weight, all choices, skill gates, possible rewards, durability loss, injury chance, XP, and time effects.

This allows balancing, telemetry, and bug fixing.

No important economic or progression outcome should depend on uncontrolled generated text.

## Reuse across systems

This architecture should support resource acquisition, city jobs, crafting incidents, research complications, travel encounters, expedition hazards, facility incidents, player-owned industry, and vehicle problems.

Individual systems may add their own interaction fields, but they should reuse the same generic selection and repetition framework where possible.

## Design target

The player should feel: **This worksite behaves differently today.**

Not: **The game rolled the same pop-up with different wording.**

Variation should come from context, skills, consequences, and world state—not merely text randomization.