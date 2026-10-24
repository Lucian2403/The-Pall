# ADR-0001 — Web-native architecture for The Pall

**Date:** 2026-10-24  
**Decision:** **APPROVED IN PRINCIPLE BY OWNER**, pending implementation and verification of each component.  
**Scope:** The Pall as a **text-led, minimally illustrated, low-animation persistent browser MMORPG**. This document does not change approved gameplay, canon, visual shell or combat logs.

## Decision / non-goals

**Use a web-native client, not Godot.** The owner expressly confirmed there will be **no real-time graphical exploration**. Locations are illustrated, interactions largely textual, and combat is tactical/turn-based. Do not introduce character-walking scenes, physics or a 3D engine as an assumed prerequisite.

**Chosen production direction**
- **Browser UI:** TypeScript + Svelte (use SvelteKit for routing/build/deployment; keep platform-independent game content and rules outside its components).
- **Authoritative game API:** Node.js **24 LTS** + TypeScript, modular monolith as the first production topology, with explicit authenticated HTTP endpoints.
- **Persistence:** PostgreSQL for users, characters, inventory, currency, quest state, transactions and event receipts; server writes must be atomic.
- **Optional later services:** Redis/queues/WebSockets *only when justified* by chat, presence, scheduled world activities, push notifications or measured load. Not required in the first foundation milestone.
- **Assets:** external modular static files, with default and hover variants; avoid huge inline base64 image payloads. Reuse the provisionally accepted Gate 02 workshop v1.0 visual/interaction contract rather than a new UI design.
- **Structured content:** game data must be validated and versioned, imported from authored data sources only after review; spreadsheet values are not silently rebalanced. Narrative content remains a separate approved source.

**Node version note:** As of 2026-10-24, Node 24 is LTS; Node 26 is Current and has not yet reached its announced 2026-10-28 LTS date. Re-evaluate support before production deployment, not on each feature.

## Architecture boundaries

```text
Client (Svelte/TS)
    |  HTTPS; sends player *intent*, never authoritative results
Game API (Node/TS)
    |  authenticates, validates choices, enforces revision/idempotency
    +--> Pure domain rules (character, quest, combat, jobs, crafting)
    +--> Transaction boundary (balance/inventory/quest/outcome together)
    | 
PostgreSQL (truth: player state, ledger, event/command receipts)
```

- **No client-calculated rewards, combat damage, balances, item creation or skill advancement.** User sees the relevant choice; server determines and persists the result.
- Domain functions are deterministic where possible, separate from HTTP, browser rendering and database calls.
- Command requests carry an **idempotency key** and **expected state revision**. Within a database transaction, lock or compare revision, process exactly once, record the result and persist all relevant state changes. Retries return the original receipt; stale commands are rejected.
- Keep the **approved v0.5.1 combat rules and verbatim combat log** intact during port/integration. Treat the existing engine as an *experimental baseline* until we have parity tests in the new architecture; do not silently fix or rebalance it.
- **Journal is distinct from the combat log.** Narrative entries reflect only the chosen route, actually observed evidence and persisted outcomes, but may use the approved personal voice.
- Transactions, constraints and server-side validation protect real-money-equivalent game state from races and fraudulent client requests; database connectivity alone is not sufficient.

## Repo layout — recommended first cut

```text
platform/
  apps/
    web/              # SvelteKit routes and reusable UI
    api/              # Node/TypeScript HTTP server, auth and command endpoints
  packages/
    contracts/        # shared, versioned request/response schemas
    game-core/        # pure domain rules (independent of UI and DB)
  db/
    migrations/       # reviewed PostgreSQL schema changes
  tests/
    integration/      # API/DB concurrent and replay tests
  README.md
  .env.example
```

Keep existing `docs/`, game data and prototype ZIP references intact. Do not pretend source ZIPs from prior conversations are already committed in the repository. A fresh checkout must build from committed source with a lockfile.

## First engineering gate: M0 — foundation only

**Goal:** From a clean clone, run a minimal browser UI and authoritative API; prove a real PostgreSQL write and safe repeat handling. Do not rewrite Millhand's content while doing this.

**Required deliverables**
1. Repository workspaces + lockfile; documented Node version, install and development commands.
2. SvelteKit page using a *placeholder* route and reusable panel primitives—**not** an unsolicited re-imagination of Gate 02.
3. TypeScript API with `GET /health` and a server-authoritative **fixture action** that changes a non-economic test record.
4. PostgreSQL migrations, including a fixture state version and unique idempotency receipt; local DB startup instructions.
5. One coherent cross-package type/schema for the fixture command, validated on both ends.
6. Automated tests proving new command, duplicate same-key retry, stale revision rejection, invalid input rejection, and server restart persistence.
7. A documented procedure for handling secrets and development-only test accounts (do not commit credentials).
8. A short requirements-trace table from approved Gate 02 / combat / shared onboarding docs to future modules.

**Explicit pass/fail gate:** tests run against a **real Postgres instance** and pass; the UI calls the API; a duplicate command cannot advance the fixture twice; a server restart retains the outcome. Screenshots or mock data alone do not pass. No claims of full MMO scalability from M0.

## Second gate: M1 — actual Millhand Stage 1–2

Only **after M0 passes**:
1. Preserve Gate 02 workshop composition and the owner's modular PNG/hover interaction model. New character speech remains a small in-scene dialogue, manual advancement.
2. Wire approved Stage 1 Guther conversation and Stage 2 object-inspection/plate decisions from authored content into server-command-backed UI.
3. Persist stage/choice/character/Journal state, without changing the underlying choices and effects. No tutorial wage, XP, loot or invented worker number.
4. Verify normal and poor-mark variants, refresh/reconnect, duplicate submit, two browser tabs and mouse/touch/keyboard.
5. Require actual owner visual/interaction review. M1 does not imply Stage 3–8 production completion.

## Deferred decisions / cautions

- Hosting, CDN region, domain, billing, GDPR/privacy, account provider, anti-bot strategy, database backup/restore policy, operational monitoring, rate limiting and incident response are **production requirements**, not solved in this ADR.
- No premature microservices, worker fleet, Redis, WebSocket everywhere, distributed transactions or future performance claims.
- Do not use `localStorage` as trusted login or currency storage.
- All public endpoints require auth and per-account authorization once they operate on real player state. The M0 fixture must be clearly **development-only**.
- No UI redesign, game mechanic change, combat-log rewrite, invented economic value or new lore is authorized by this tech decision.

## Why not Godot?

Godot is a useful renderer for animated 2D/3D games. The owner explicitly does not want real-time exploration. Adding a game engine would complicate lightweight text/illustration views, ordinary browser accessibility and forms without replacing the authoritative economy/quest backend. If requirements later materially change, this choice can be revisited in a new ADR rather than quietly altered.

## Canon / references

- [First integrated playable plan](../05-gameplay/onboarding/millhand/first-integrated-playable-implementation-plan.md)
- [Workshop Gate 02 review](../05-gameplay/onboarding/millhand/visual-production-gate-02-workshop-wireframe-review.md)
- [Combat integration contract](../05-gameplay/combat/combat-integration-and-prototype-contract.md)
- [Shared onboarding state contract](../05-gameplay/onboarding/shared-state-implementation-contract.md)
- Official current documentation: Svelte (https://svelte.dev/docs/svelte/overview), Node release schedule (https://nodejs.org/en/about/previous-releases), PostgreSQL (https://www.postgresql.org/docs/current/).

**Owner decision summary (2026-10-24):** “I don't want real-time graphical exploration. I want text-based, minimum-illustrated and low animated browser MMORPG. ... Totally agree with all.” The technical choices above implement that direction. M0 acceptance remains a separate engineering test gate.
