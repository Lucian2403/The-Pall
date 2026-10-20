# The Pall — Combat Part 10: Integration Contract and Runnable Vertical-Slice Proof (PROPOSAL)

**Status: PROPOSED FOR USER REVIEW (2026-10-20).** Parts 1–9 are now accepted at their recorded principle/architecture levels, including [Part 9's approved wound and medical rules](wounds-bleeding-incapacitation-treatment-proposal.md). The test values and pending policies remain open. The repository is currently **pre-production documentation**, not an operational browser MMO. A separately packaged **Node.js combat test harness** was executed in the design session with 16 automated tests passing, but the harness **is NOT a shipped client, backend or a production system**. Its source is delivered as a standalone conversation artifact; do not claim it has already been deployed to GitHub or production unless actually committed there.

## Purpose and deliberately narrow scope

Next we should **stop expanding the catalogue of mechanics and demonstrate the accepted core in executable code**, starting with **one player versus one enemy**. The first three evidence-producing fixtures are the already approved onboarding fights: **Millhand/Flint**, **Squatter/young injured boar**, and **Inkbound/Silas Pumpard**. All six backgrounds remain binding onboarding canon; these three merely cover the most mechanically distinct early fights.

A successful first simulator demonstrates valid action order, honest telegraphs, genuinely effective movement/guard, individual Momentum, one Health pool, lawful defeat/nonlethal retreat and idempotent transactions. **It does not mean that full MMO architecture, enemy content, character progression, actual weapons or economic balancing are done.**

## 1. The core must be a deterministic, server-authoritative state transition

Conceptual external API:

`CreateEncounter(actorIds, encounterTemplateId, startSnapshot, encounterId) -> EncounterSnapshot`

`GetCommittedTurn(encounterId, actorId) -> {revision, visibleEnemyIntents, legalActionChoices, positions, resources, status}`

`SubmitAction(encounterId, actorId, expectedRevision, requestId, action) -> UpdatedSnapshotOrIdempotentResult`

`FinishEncounter(encounterId, outcomeId) -> PersistedOutcomeAndStoryHandoff`

**Important:** A browser is only a UI. It does not calculate its own damage, grant Momentum, choose an enemy's next action, transfer inventory or commit outcomes. The authoritative application server owns progression and each transactional combat round. A reusable **pure rules engine** can be unit-tested outside the server process; server persistence wraps it with authentication, access checks and atomic state updates.

**One committed choice per actor per round**; NPC intent is chosen before displaying it to the player. Defenses establish before threats. Other actions resolve by the approved action-timing principle; there is no player-first exemption. Range/cover and legal action prerequisites are checked **before** hit chance; firearm mechanism activation is not the same as aim; damage, injury and one round-cleanup bleed tick follow actual outcomes.

## 2. Round state machine — recommended first implementation contract

States: `CREATED -> AWAITING_PLAYER_ACTION -> RESOLVING -> AWAITING_PLAYER_ACTION | FINISHED`. An action commit includes:
- Unique immutable encounter ID, round/revision, participant IDs, start condition, equipment, real position/cover and routes, objective, resources and condition tags.
- NPC action **already selected from legal actions** and stored, with type, target/zone, speed/tracking and what is fairly disclosed through the telegraph.
- The allowed player command, legal target/body zone or movement destination, disclosed action costs, spent item/ammunition references and optional valid Momentum technique.
- One deterministic server-owned RNG stream/seed/counter, with outcomes stored so retries **do not reroll** activation, contact or wound results.
- Outcome ledger and server-side `requestId` receipt with `expectedRevision` CAS; duplicate requests return the previously committed result. Conflicting stale commands are rejected and must reload the updated snapshot.
- End-of-round state including effective Health Ceiling, actual wounds, **one** bleeding severity/tick per actor, Stamina, persistent Fatigue/Stress, Composure, derived Focus, Momentum and real item wear.
- A **separate world-state transaction** records win/loss/escape, inventory/economic changes, clinic readiness and a tutorial progression hook **exactly once**.

**Why this matters in an MMO:** Double-clicking, browser refresh, reconnects and two tabs must not duplicate medical treatment, loot, outgoing attacks, currencies, Combat Stage completion or wound cleanup. A local deterministic function alone cannot guarantee concurrency; production requires a database uniqueness constraint, transaction isolation and optimistic locking.

## 3. Module interfaces to implement, with no new skill trees

1. `ActionValidator`: six Standard families and optional valid Momentum/Contextual alternatives. Invalid action costs neither time nor resources.
2. `EnemyIntent`: objective/skill/risk-aware legal AI decision committed before player input; opponent's tactics and anatomy control the known techniques.
3. `TimingAndPosition`: Guard setup, Action Timing, contact/near/far, reachable cover, fixed vs honestly declared tracking attacks.
4. `AttackResolver`: one conditional contact check per ordinary attack; special firearm **activation reliability from its one required firing mechanism**, range and true aim/zone modifiers.
5. `DamageAndWounds`: zone/type gear protection, conditional Guard reduction, one Health pool, genuinely qualifying wound, Health Ceiling and one bounded Bleeding severity.
6. `Resources`: individual actor Momentum (+10 meaningful Basic Strike / +8 useful Guard / +5 actual attack escaped by Move, **prototype values**), physical/mental expenditures, no passive per-turn regeneration; fresh well-rested fights generally start **80–100 Stamina**, without magically restoring at every new encounter. Fatigue/Stress start accumulating from qualifying exertion/pressure when respective reserve reaches **20 or less**.
7. `CleanupAndResolution`: one bleed tick per cleanup per actor, downed at 0 Health without automatic character deletion, earned withdrawal/surrender/nonlethal victory, objective-specific defeat and a true persisted encounter outcome.
8. `MedicalAndStoryHandoff`: field Use/Bandage only from real supplies; Stage 7 same basic care and **one 10-coin examination even when unhurt**; Stage 8 same rent/home. **No debut-only auto-injury, free bandage or compulsory hit.**

**First iteration exclusions:** multi-enemy combat, PvP, player economy, actual equipment crafting integration, complete medical facilities, full ranged and scattergun ballistics, all six origins' complete story UI, server/web client production deployment, anti-cheat operations at scale, websocket reconnect behaviour, death/respawn policy and wilderness extraction. These are explicitly not solved by a prototype.

## 4. What is actually included in the isolated Node.js harness

**Exploratory prototype scope (not canon):**
- Node.js ESM, no third-party packages; `node --test test.mjs` passed **16 test cases** on 2026-10-20 in the local session.
- `newEncounter('flint'|'boar'|'silas', options)` and pure `step(state, selectedAction, {requestId, expectedRevision})`; deterministic test RNG state and event log.
- One actor per side; actual committed visible intent; Action Timing and Guard setup; Basic Attack, Guard, Move, Recover, Use held bandage, Withdraw, experimental Momentum technique.
- Both player and NPC earn individual provisional Momentum; accurate defensive Move can award +5, meaningful Guard +8, Basic Strike +10. Stamina decreases on effort and Fatigue can accumulate at ≤20. Recover does not cure wounds. A bandage does not heal the underlying cut.
- Basic physically qualifying cut bleeding; exactly one test bleed tick in round cleanup; Health 0 = real downed defeat; boar withdrawing once player opens its path = nonlethal player victory.
- Per-action `requestId` receipt and revision validation **in an in-memory state object**. This tests logic but is **not** a substitute for actual server transactions or a persisted idempotency table.

**Not implemented in the harness:** equipped armor/penetration, Focus+Arms formula, firearms/misfires/ammunition, full injury recovery/Trauma, stress shock application, full enemy AI decision scoring, multiple enemies, real clinic/payment and all story triggers. Their approved rules are written above for later integration. The harness has a hard-coded *test* AI and numeric damage fixtures; a passing test does not prove balance or real encounter fairness.

The harness should be treated as a discardable technical spike. A durable production rules engine must be written/ported only after the architecture and data contracts are approved.

## 5. Required acceptance tests before calling anything playable

**Logic**
- One action per actor per round, Guard established appropriately, Initiative order can favor either actor according to real timing.
- Enemy intent is committed before player input; current click cannot alter a committed nontracking attack.
- Basic Attack/Guard/Move grant Momentum **only when their actual conditions occur**; no idle Guard farm, bleed-triggered Momentum, per-pellet rewards or free NPC starting technique.
- Stamina, Fatigue/Stress, injury caps, current Health and individual Momentum persist across rounds and encounters; no automatic full refill.
- A real hit can produce Health loss but no wound; serious wound is conditional; one bleed severity ticks once per cleanup; no penalty counted twice.
- Invalid/disallowed action does **not** consume a turn, supplies or currency.
- All six onboarding origins remain **unarmed**, with exact start kit, zero combat loot/XP, and all **36 origin × route × result** variations still resolve correctly.
- Nonlethal human endings and boar escape meet scene objectives; player defeat remains defeat; no forced story wound and no auto-permadeath.
- Real Stage 7 clinic exam is 10 coins once, whether injured or not; after the clinic, canonical Stage 8 is accessible. These are integration tests, NOT covered by the local harness.

**Operational**
- Server owns and authorizes every state change; auth, transaction isolation/CAS, reconnect, simultaneous tabs and retry/duplicate message behavior are tested.
- Persisted RNG and action ledger prevent rerolling a missed headshot or failed weapon activation by reconnecting.
- Time/bleeding and idle/disconnect semantics are explicit; never infinitely advance a bleed from a passive offline tab by accident.
- Balance runs cover short fresh encounters (80–100 Stamina) and chained tired encounters, skilled versus novice, guard/recover spam, high armor, different cover, firearms and wounded players.
- Browser combat interface shows truthful telegraphs, valid actions and current player/enemy Momentum without revealing inaccessible enemy private inventory.

## 6. Three low-stakes worked fixtures (actual approved encounter concepts)

**A. Millhand/Flint, service cart.** Flint telegraphs a slow club blow; player at contact can Guard or Move behind the cart. If Move finishes first and breaks the attack line, it deals 0 and may grant defensive Momentum; if the club genuinely connects, suitable Guard can reduce it. A player can also be defeated. A real nonlethal Flint retreat marks victory, no extra coins/XP/club loot, and the clinic still costs 10 once.

**B. Squatter/injured boar, broken fence.** Boar can normal-charge at 0 Momentum. Player Move out of its lane opens a legal exit; when the boar subsequently commits to Withdraw it produces actual victory while the animal survives. Player may instead be knocked down and receive the approved traveler handoff. No animal-only mercy meter or mandatory damage.

**C. Inkbound/Silas, locked coal box.** Hook's range and the box's actual obstruction determine what can connect. A suitable Basic Guard may gain Momentum; an actual qualifying cut can bleed, but the starter character does **not** spontaneously receive a bandage. Nonlethal victory ends assault, not Silas's employment or the fuel lock; defeat returns him to guarding and bystanders help the Inkbound toward the same clinic.

**All example attack chances, HP, Stamina costs and AI weights are test inputs, not newly approved enemy stats.**

## 7. Three high-end / high-stakes stress tests (hypothetical NOT canon)

**D. Veteran rifleman versus two pursuers:** actual server plan supports two committed NPC actions, different ranges, ammo and one actor-specific Momentum pool each; eligible cover invalidates a fixed shot, Use → Reload consumes a turn, and one rifle activation reliability is checked separately from accuracy. **Not implemented in current 1v1 harness.**

**E. Industrial pressure workshop:** a reachable valve/contextual action competes with Attack/Move; steam hazard and gear resistance are not ordinary blockable club damage; a real machinery Leak remains a mechanical state. Two opponents with distinct objectives should not share a Momentum pool. **Not implemented in current harness.**

**F. Injured veteran with severe bleed facing scattergun fighter:** actual limb injury lowers Health Ceiling once, current Health isn't double-subtracted, wound control uses actual field supplies and one Use action, bleed ticks once, low Stamina can increase Fatigue, and low Composure pressure can increase Stress while Focus contributes one penalty. Opponent ammo, spread, reloading and real rescue/extraction rules remain separate. **Only elementary bleed/Downed/bandage behaviour is implemented in the local harness.**

## 8. Recommended production milestones

**M0: acceptance** — review this contract, identify first-stack technical standards (e.g. TypeScript game-core, PostgreSQL transactions, web client transport, hosting), decide coding scope and branch policy. **No platform/tool choice is yet canonical**.

**M1: pure combat engine** — create production-grade action schemas, validations and state transitions; reproducible seeded simulations and strict test vectors. Cover 1v1 and all three training fights using **test-only tuning**.

**M2: persistence and integrity** — atomic round submission, idempotency, locks, action/revision sequence, persistent wound/bleed handling, signed-in player authorization.

**M3: minimal browser view** — display intent, action bar, Head/Torso/Limbs targeting, Momentum, Stamina, consequences and replay log; reconnect recovery.

**M4: story and clinic wiring** — all six Stage 6 battles and all 36 narrative permutations, payment exactly once and shared Stage 8.

**M5: simulations and balancing** — headshot spam, guard/recover loop, novice survivability, injury frequency, chained encounters and actual player tests; only after evidence lock damage/stamina thresholds.

**M6: later** — firearm families, multiple NPCs, industrial hazards, advanced techniques, PvP/wilderness death decisions and network scaling.

## 9. Decision boundary

**User approval requested now:** accept this **integration direction and testing contract**, especially **pure shared authoritative rules before rich UI**, three known starter fixtures, no hidden player/enemy exceptions, a persistent idempotent outcome record and keeping prototype numbers separate from game canon.

**Still open:** technology stack, whether to promote/replace the exploratory JS harness, accurate weapon and injury values, enemy combat loadouts, UI design, multiplayer scaling, death/respawn and wilderness extraction. No permanent decisions are made by running the spike.

References: [Part 9](wounds-bleeding-incapacitation-treatment-proposal.md), [Part 8](stamina-fatigue-composure-stress-focus-proposal.md), [Part 7](hit-chance-aiming-and-skills-proposal.md), [AI](enemy-ai-decision-system-proposal.md), [six-origin state contract](../onboarding/shared-state-implementation-contract.md), [first playable scope](../../00-vision/first-playable-scope.md).
