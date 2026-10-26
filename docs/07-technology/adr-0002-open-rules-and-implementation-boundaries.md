# ADR-0002 — Build the foundation while gameplay decisions remain open

**Status: APPROVED ENGINEERING PRINCIPLE (2026-10-24).** Owner explicitly agreed to advance the web-native foundation but emphasized that substantial gameplay design remains undecided. **This document does not decide new gameplay rules.**

## Policy

**Separate domain rules and approved content from transport, persistence, and presentation.** We do not need the final crafting economy, combat balance, housing, PvP, progression, or loot system to implement command validation, database transactions, frontend composition and persistence.

Every gameplay-related requirement must have one of these states:
- **Approved:** may be implemented, with parity tests against the authoritative design and saved outcome.
- **Provisional:** may appear in clearly labelled isolated experiments; do not migrate into shared core or player persistence as canon.
- **Open:** no inference or placeholder “final” value; create only an interface when an actual feature needs it.
- **Rejected or Superseded:** must not silently reappear through copied prototypes.

## Rules-safe design

1. **Game commands contain intentions, not computed outcomes.** A player requests e.g. inspect/choose/commit, never tells the API how many coins, skill points, wounds or items to grant.
2. **Pure domain rules are independently testable** and do not import UI, HTTP or database clients. Game calculations can change without replacing infrastructure.
3. **Content data is versioned and validated** before being used in a published build. Use reviewed item/crafting data and approved narrative text; do not hardcode experimental balance in UI views.
4. **Server owns authoritative state**, with an expected revision, unique request ID and atomic receipt for committed actions. Reconnects, retries and duplicate clicks cannot double-grant game effects.
5. **Do not create the whole game database today.** M0 creates only a technical fixture. Actual character/inventory/market and timed-world migrations follow approved domain rules.
6. **Prior approvals remain binding**: the Gate 02 modular illustrated workshop and compact dialogue; the existing combat engine/log while reviewed for faithful integration; separate first-person personal Journal. Technical migration is not permission to edit any of these.
7. **Use a modular monolith first.** No premature Godot renderer, microservice fleet, queue/Redis, real-time map or always-on WebSocket dependency.

## Gate plan

**M0.1 — Source and rule boundary:** TypeScript package layout; shared command schema; deterministic technical fixture; tests rejecting client-injected economic outcomes. This verifies only pure-source boundaries; it cannot pass full M0 alone.

**M0.2 — Operational persistence:** Generate and commit a dependency lockfile; verify a clean Node 24 install and build; run real PostgreSQL migrations; test duplicates, request-key conflict, invalid commands, two concurrent requests, stale revisions, and restart recovery.

**M0.3 — Browser/API integration:** Demonstrate the Svelte app reading server-owned fixture state and submitting one action; test success/error flows, no client-authoritative game mutations and restart persistence.

**M1 — Millhand Stages 1–2:** Only after all M0 gates pass, integrate *approved* Guther dialogue/platework behind authenticated, validated, persistent commands. Keep the provisionally accepted Workshop v1.0 composition and click-to-reveal object actions. Other stages and all undecided game systems remain deferred.

## Evidence and limitation

A local scaffold revised on 2026-10-24 has **six passing pure-unit tests** (four request validation, two deterministic fixture) using Node 22 tooling and TypeScript 5.8.3. Node 24 dependency builds and live PostgreSQL/browser tests are **not yet verified**, so **M0 has not passed**. Local source package: `The_Pall_Platform_M0_1_Source.zip` in the accompanying ChatGPT conversation; code is **not claimed committed** to GitHub. See [ADR-0001](adr-0001-web-native-mmo-foundation.md) and [Millhand first integrated implementation plan](../archive/history/05-gameplay/onboarding/millhand/first-integrated-playable-implementation-plan.md).

**Blocking principle:** No further actual game logic expands until a relevant mechanic is approved; no further actual MMO implementation expands beyond M0 until real database and integration tests pass.
