# Combat Part 10 — Browser Slice v0.1, Implementation Status

**Status: EXECUTABLE LOCAL PROTOTYPE CREATED AND TESTED (2026-10-20); NOT PRODUCTION CODE.** This is the implemented follow-up to the [Combat Part 10 integration contract](combat-integration-and-prototype-contract.md), continuing the previously approved 18-test isolated JavaScript combat spike. The runnable browser-slice ZIP was attached to the corresponding ChatGPT project conversation as `The_Pall_Combat_Browser_Slice_v0_1.zip`. **This document is committed in GitHub; the source ZIP is a conversation download, not a repository commit.** Do not infer a code path in GitHub from this page.

## How to run the companion downloaded archive

Unzip the provided `The_Pall_Combat_Browser_Slice_v0_1.zip`; from the `The_Pall_Combat_Browser_Slice` folder run `npm start`. Open `http://127.0.0.1:8787` in a browser on the SAME machine. Node.js 20+ is required; the implementation was tested with Node.js 22 and has **zero external dependencies**. Run `npm test` for the engine and HTTP integration checks; `npm run demo` prints terminal transcripts.

The browser UI presents three already-approved onboarding encounter **test fixtures**: Flint and the service cart, a young injured boar with a genuine ordinary withdrawal victory, and Silas Pumpard at the coal box. UI shows committed enemy intent, action menu with optional aim/reposition/recover configuration, actor resource bars, enemy Momentum, battle event log and outcome. A new encounter starts another separate local session. No scripted onboarding reward, item or coin change is made.

## What was actually implemented

- Existing deterministic **1v1 combat engine** reused, with six Standard Action families and experimental Momentum technique, action-time ordering, meaningful Guard, positional Move, basic actor Momentum, Stamina/Fatigue, simplified damage/wound/bleed and real Downed outcomes.
- Node.js HTTP server `server.mjs` bound to **127.0.0.1**; browser sends **decisions**, not damage or speed parameters. `store.mjs` strictly whitelists action fields, rejecting forged speed/Momentum.
- File-backed persistence in `.demo-data/`; each request to a session is serialized in the single process, with **atomic file replacement**. Refresh and Node server restart can restore its current session. Browser keeps an opaque token in localStorage for local demo resume.
- Revision check and idempotent per-request receipt are stored together with the updated encounter. Duplicate action submissions return the previously committed result without charging Stamina/hits twice; conflicting reuse and stale revisions are rejected. This is **not a full distributed transaction**.
- Browser interface in `public/index.html`, `public/styles.css`, `public/app.js`, with compact layout, responsive CSS, accurate log messages and a local demo indicator.
- `npm test`: **23/23 PASS**, covering the prior 18 rule tests and 5 HTTP-level groups: static page/API health, session credentials/persisted restart, duplicate/stale/invalid/forged commands, boar ordinary withdrawal victory and local-only request restrictions.
- `node --check` of server, store and client JavaScript passed; smoke-tested local HTTP health route and terminal demo. **Automated Chromium navigation was attempted but blocked by administrator policy in the execution environment**, so visual/browser-click behavior is **not claimed verified**. Test with a real local browser before promotion.

## Still absent (important)

Not a hosted/live MMO, not a multiplayer world, not production authentication, TLS, rate limiting, durable multi-process database transactions or world-time simulation. No full head/limb armour, full focus/skill system, cartridges/Firing Mechanism activation, complete NPC utility AI, medical/surgery engine, precise collision geometry, multi-foe combat, 10-coin clinic payment, Stage 8 home transition or complete six-origin onboarding integration. Test balances are **NOT CANONICAL**; the prototype's opponent weapon and health figures do not override approved narrative constraints.

## Next steps

1. Review the actual local interface on a user's machine and record design/interaction issues from gameplay (especially beginner hit rates, clumsy movement, boar withdrawal and Flint's difficulty).
2. Promote the experimental pure rules into a versioned, modular game-core implementation with schemas and deterministic replay.
3. Select production infrastructure, implement **true database atomicity, authenticated sessions, reconnect handling**, and add integration tests against the **36 six-origin × branch × outcome combinations** before claiming all onboarding is implemented.
4. Finish physical cover/armor/aim, weapon activation, appropriate Momentum techniques and healing, measuring balance under large simulation batches.
5. Only later expand to multiple opponents, world economy integration and load testing.

**Canon references:** [Part 1 approved combat](approved-combat-foundation.md), [Momentum](momentum-generation-and-spending-proposal.md), [Health and injury](wounds-bleeding-incapacitation-treatment-proposal.md), [six-origin state/QA contract](../onboarding/shared-state-implementation-contract.md).
