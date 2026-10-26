# The Pall

A persistent browser-based post-apocalyptic MMO focused on exploration, survival, a player economy, discovery and a world that remains partially unknown.

## Project status

Pre-production / foundational systems design.

## Documentation

Start with [docs/README.md](docs/README.md).

Current locked foundations include:

- STR / DEX / INT / RES character attributes;
- skill-based competence rather than attribute-driven power;
- equipment-led survival against the Pall;
- Stamina / Fatigue and Composure / Stress;
- derived Focus;
- safe-city water abstraction;
- food variety and recovery systems;
- consensual PvP by default;
- a persistent player economy with resource sinks;
- City → Grey Marches → Deep Ashlands progression;
- scalable housing leading eventually to player-built trains.

## Data

Structured gameplay data and balancing are maintained separately from design prose and are intended to become database seed/configuration data.

## Platform source (M0.2)

The Node/TypeScript + SvelteKit + PostgreSQL technical foundation is tracked under **[platform/](platform/)**. For first-time setup from the older ZIP download, see **[platform/GIT_WORKFLOW.md](platform/GIT_WORKFLOW.md)**. The integration gate has **not** passed until the corrected local verification suite, clean-clone install, restart check and dependency lockfile are verified. Do not mistake this development fixture for the actual Millhand gameplay.
