# The Pall — M0 verified local development foundation

This tracked `platform/` directory contains the M0.2 developer fixture, local setup conveniences and a corrected idempotency verifier. Follow **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** when moving from the earlier standalone ZIP or pulling later changes. It is not a game or deployed server. **M0 local development gate PASSED on 2026-10-26** (owner-reported checks): Node 24 clean install, six unit tests, Svelte typecheck, production web build, live PostgreSQL API/idempotency/concurrency tests, browser integration and process restart recovery. The only game operation is a non-economic test counter. No approved gameplay/visuals/combat have been changed.

## Simple sequence

1. Install **Node.js 24 LTS** (official: https://nodejs.org/en/download) and have Docker Desktop running. Open a NEW terminal and check `node --version`, `npm --version`, `docker compose version`.
2. Extract the ZIP and open a terminal **inside the folder with `package.json` and `compose.yaml`**.
3. Copy `.env.example` to `.env` (Windows PowerShell: `Copy-Item .env.example .env`; macOS/Linux: `cp .env.example .env`). The `.env` file is a local-only config and should never be uploaded.
4. `npm install` (creates `package-lock.json` when online).
5. `npm run db:up` (starts a local PostgreSQL container; Docker Desktop may download the image on first run).
6. `npm run db:migrate` (creates a disposable fixture row in PostgreSQL).
7. `npm run test:unit` (runs core and contract unit tests).
8. Start **Terminal A** in this folder: `npm run dev:api`. Leave it open. Verify http://127.0.0.1:8788/health shows `{"status":"ok","module":"technical-fixture"}`.
9. Start **Terminal B** in this folder: `npm run dev:web`. Leave it open. Open http://127.0.0.1:5173 and click **Commit one test action**. The fixture value should increase by exactly one.
10. Start **Terminal C** in this folder: `npm run verify:api`. It verifies idempotency, stale conflicts, invalid input and a two-request concurrency race. It WILL increment the non-economic test counter twice by design.
11. To check persistence, record the current counter in the page. Stop Terminal A with Ctrl+C, start `npm run dev:api` again, reload the page: the number should remain.
12. To stop: Ctrl+C in Terminals A and B; optionally `npm run db:stop` in C. This stops but **does not delete** database data. Do not use `docker compose down -v` unless intentionally deleting this fixture database.

If a step fails, **stop there** and copy the error message plus the command you used. No need to install PostgreSQL separately: Docker manages it. No need to install Svelte separately: npm handles dependencies.

## Intended responsibilities

- **You:** local Node 24 installation, Docker Desktop running, commands, return output or error.
- **Assistant:** code fixes, specs, domain boundaries, QA plan and guided troubleshooting, preserving approved combat and Millhand decisions.
- **Verified locally by owner (2026-10-26):** API/PostgreSQL idempotency, invalid/stale/concurrent requests, browser interaction/refresh and restart recovery. See [M0.2 QA evidence](M0_2_QA_EVIDENCE.md).
- **Full M0 local gate closed:** `platform/package-lock.json` tracked, `npm ci` and six unit tests passed, Svelte typecheck and web build passed under Node 24, and all seven API checks passed under Node 24. See [M0.3 verification evidence](M0_3_REPRODUCIBILITY_CHECKLIST.md). Production security, load testing, account identity and deployment are separate future work.

See `docs/DECISION_BOUNDARIES.md` for the policy on undecided game rules. The existing `M0_STATUS.md` describes M0.1 historical status, not the outcome of your local setup.

## Source control

The complete M0.2 application is now committed under `platform/` in `Lucian2403/The-Pall`. The ZIP-based folder will not receive updates from `git pull` unless it was already set up as a Git checkout. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for the one-time move. The corrected verification script and clean-install/build suite passed on the owner's local Docker-backed Node 24 setup. The evidence and scope limitations are recorded in [M0.3](M0_3_REPRODUCIBILITY_CHECKLIST.md).

## M1.1 — Better Auth local functional flow passed; public-release security still deferred

The owner approved Better Auth email/password identity with verification and password reset. A first local implementation is committed under `apps/api/src/auth.ts`, `apps/api/src/auth-routes.ts`, and `apps/web/src/routes/account/`, with a Docker Mailpit email catcher. Read **[M1_1_LOCAL_AUTH_QA.md](M1_1_LOCAL_AUTH_QA.md)** before pulling this change.

**Important:** Dependencies changed after the prior committed lockfile. After `git pull`, run **`npm install`**, not `npm ci`, to update `platform/package-lock.json`. Commit the regenerated lockfile only after local compile and auth smoke checks pass. The owner must generate their own `BETTER_AUTH_SECRET` in the ignored `.env`; the example placeholder is deliberately rejected. All emails remain in local Mailpit, and no personal mailbox credentials or domain are needed.

The M0 fixture remains separate. The owner reported successful registration, Mailpit email verification, login, session refresh, logout revocation, password recovery and API-restart persistence. **M1.1 local functional QA was closed on 2026-10-26** after owner-reported Account A/B isolation, anonymous/forged-request regression and unit/type/build tests. The Better Auth lockfile is committed; the normalized public-registry URLs require a final `npm ci` check. Public-release security work is separate. See [M1.1 local QA](M1_1_LOCAL_AUTH_QA.md). This is not a public authentication deployment.

## M1.2 — Character selection and creation (review in progress)

Design review: [six origins, approved starting facts, and still-open account policies](../docs/01-player/m1-2-character-selection-creation-design-review.md). A **read-only** six-origin TypeScript catalogue and 12 Male/Female starting-preview tests are committed under `packages/game-core/`. No `characters` table, character creation API, item IDs or gameplay rewards have been added, since character slot/naming/deletion/staged availability policies remain subject to owner review. Test commands and the lockfile portability check are in [M1.2 QA](M1_2_STARTING_CATALOGUE_QA.md).
