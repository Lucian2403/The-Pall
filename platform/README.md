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

## M1.2 — Character selection and creation (persistence candidate; owner QA pending)

Design review: [six origins, approved starting facts, and still-open account policies](../docs/01-player/m1-2-character-selection-creation-design-review.md). A **read-only** six-origin TypeScript catalogue and 12 Male/Female starting-preview tests are committed under `packages/game-core/`. The first-entry **approved world introduction** is now at `/introduction`, and an **authenticated, read-only six-background preview** is at `/backgrounds`; successful account sign-in routes to the introduction. Read [M1.2 Intro QA](M1_2_INTRO_QA.md) for local browser verification. No `characters` table, character creation mutation endpoint, item IDs or gameplay rewards have been added, since slot/naming/deletion/staged availability policies remain subject to owner review. Test commands and the lockfile portability check are in [M1.2 QA](M1_2_STARTING_CATALOGUE_QA.md).

### M1.2 persistent character storage (local-only candidate)

After the approved first-login and read-only background preview, the app now has **account-owned character creation and roster selection**. Local development policy: six slots/account; 3–24-character normalized globally unique names; multiple origins allowed; no rename/deletion. Character creation is a single PostgreSQL transaction with idempotency receipts, account revision locking and server-owned starting facts. Item IDs and usable equipment are deliberately **not** invented: Basic Clothes/Crude Small Bag are stored as pending starter requirements. All six characters have the correct starting location but no playable Stage 1 integration yet.

**Do not assume this code is verified just because GitHub contains it.** Run the additive schema with `npm run characters:migrate` using the existing `.env DATABASE_URL`, then `npm run test:unit`, `npm run check:api`, `npm run check:web`, `npm run build -w @the-pall/web`, and `npm run verify:characters-unauthenticated` while the API runs. Full details, manual Account A/B tests and warnings about permanent occupied slots: [M1.2 Persistent QA](M1_2_PERSISTENT_CHARACTERS_QA.md). Nothing here has changed the M0 test fixture or approved scripts.

## M1.3 — Owned character → approved Stage 1 dialogue (committed candidate)

**Scope:** The world introduction and character roster already exist. An authenticated character can now open `/characters/<owned-uuid>/opening` via **Enter [starting location]** on the character-detail page. The UI fetches the saved, account-owned character through `GET /api/characters/:id`, chooses **only that origin's** approved opening, and shows one dialogue beat at a time with explicit choices. All six origins have their own scripts. The Millhand scene retains Guther's optional pay exchange and player-name substitution; the other five retain their respective approved voices and optional branches. No static page preview can move a character forward, award coins/XP, create items or invoke Stage 2.

**Do not treat this as completed gameplay or final art.** The new origin-opening route is a **read-only, replayable M1.3 content handoff**; Stage 1/2 real job actions, saved dialogue state, final assets, durable chapter progression and the common eight-stage onboarding are subsequent integration work. The script copy came from `docs/05-gameplay/onboarding/<origin>/opening-dialogue.md`; `npm run check:web` now checks exact Stage 1 textual parity and that all branches converge without entering Stage 2.

**Current owner QA:** This candidate is committed but **not yet tested on the owner's Node 24 browser environment**. M1.2 functional creation, duplicate-name and anonymous API checks passed; after-restart persistence and authenticated Account A/B character-detail isolation remain unconfirmed until explicitly tested.

**Local M1.3 acceptance** (use the same local API, Postgres and web servers; no new migration):
```powershell
git pull --ff-only
npm run check:web
npm run build -w @the-pall/web
```
Sign in to your existing character, visit `/characters`, select that saved character, then choose **Enter [starting location]**. Advance the script manually; try its optional dialogue and backtracking. At the work-paper/route/ward/yard handoff the scene must stop and display that Stage 2 is not connected. Refresh must not change your saved coins, Major Skill bonus or tutorial Stage 1. A signed-out or different-account browser must not open a privately owned character's page or opening.

**Documentation discipline:** keep future M1.3 fixes and pass/fail checkpoints here, not in another new milestone Markdown. The design source of truth remains `docs/` and Git history records individual patches.

### Workshop asset integration — owner correction, 2026-10-26

The first actual Millhand workshop illustration is now wired into the **Stage 1 opening screen** at `/characters/<owned-uuid>/opening`. Four static cutouts are positioned on the workbench with small **icon-and-label clickable targets**. Clicking an icon opens the object's approved read-only description. **There are no idle/hover image pairs or sprite swaps.** It follows the latest user-supplied screenshot, and the stage dialogue still uses approved Guther lines and player choices. The Stage 2 **gameplay state machine is not yet integrated**; the opening still stops at its handoff.

**One-time asset install:** The submitted `smithingAssets.zip` contains seven source images. We prepared a browser-optimized 7-image WebP folder preserving owner-supplied art (note the source hammer is named `hammer_hover.png`, **but it is treated as the sole static hammer**). Binary images were **not** transferred by the GitHub connector; the source code is committed, but the images must be extracted locally into `apps/web/static/workshop/`.

From `The-Pall\platform` in PowerShell, after saving the accompanying `smithing_web_assets_for_project.zip` archive into Windows Downloads:

```powershell
git pull --ff-only
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\smithing_web_assets_for_project.zip" -DestinationPath ".\apps\web\static" -Force
npm run verify:workshop-assets
npm run check:web
npm run build -w @the-pall/web
```

With API and web servers already running, open the saved Millhand character's **Enter Smithing workshop** route. Inspect each of the four icons and verify that only inspection text appears until Stage 2 is actually implemented. On mobile confirm the icons are individually tappable and no intro choices are hidden. Other five origin openings remain on the prior text-led route.

The WebP archive must ultimately be committed to GitHub under `apps/web/static/workshop/` for reproducible installs; do **not** commit another test report or the large original ZIP to source control. `npm run verify:workshop-assets` checks each WebP locally. This entry documents a **candidate layout awaiting owner browser review**, not finished Stage 2 mechanics or final UI art acceptance.

### Guided tutorial shell and no nested scrollbars — owner-requested UI correction

The owner confirmed that the illustrated Millhand opening now loads, but required **no scrollbars inside any section or dialogue popup** and requested the next UI step: the reusable sidebar, top status bar, location banner and game chrome. A responsive **`TutorialShell.svelte`** is now connected to **all six origin-opening routes**, using each owned character's real name, current/max Health, coins, origin, location and Stage 1 value. The desktop left rail and mobile bottom navigation link only to currently implemented pages; City/Market/Jobs/Crafting/etc. remain **visibly locked until the real shared Stage 8 completion**. This is **not** the post-tutorial Home/dashboard implementation and does not create new currencies, clock values or travel effects. The city header is a styled interim banner until the owner provides a reusable illustrated city panorama.

The Millhand `WorkshopScene.svelte` now uses **one static prop image plus an icon-label hotspot per object**, and removes its internal `overflow:auto`/height-limited dialogue. On desktop, the compact dialogue sits over the workshop scene with natural height; on narrow screens it follows the scene art with natural height. **The document itself can scroll vertically**, but text and controls must not be clipped inside their own independently scrolling boxes. Further dialogue scenes and work screens must follow the same rule.

**Local QA:** `git pull --ff-only`, `npm run check:web`, `npm run build -w @the-pall/web`, then refresh an already-owned Millhand `/characters/<id>/opening` while one API and one frontend dev process run. Verify desktop widths around **1440 px and 1024 px**, and mobile **390 px and 320 px**. Advance to Guther's longest wage exchange and select all four object icons. Check no nested scrollbars, readable dialogue, no overlapping click targets, and that topbar Health/Coins match `/api/characters/<id>`. Check one other origin route also uses the shared shell without workshop art. Stage 2 state mutation remains unimplemented and no DB migration is needed.

**Status:** committed candidate, awaiting owner's browser/build feedback. No new Markdown report created.

### Edge-to-edge guided UI — owner layout direction (2026-10-26)

The user approved the shared sidebar/topbar and directed the entire game frame to fill **100% of the browser viewport**, **flush against all four outer edges**. The guided tutorial shell therefore has **no overall `max-width`, outer margin, exterior padding, frame outline or rounded exterior corners**. Desktop keeps only internal functional separators; mobile has a full-width header and fixed bottom navigation with a safe-area allowance. The Stage 1 workshop area expands into the remaining usable screen height rather than living in a narrow centered card. When long dialogue or a small screen requires more space, the **page scrolls normally**; dialogue and inspection popups do not get independently scrolling text. Individual controls and speech panels retain their own inner padding for readability.

This rule applies to the **pre-Stage-8 guided presentation**. The post-Stage-8 Home dashboard remains locked and unimplemented. All character statistics continue to be read from server-owned state and no additional game systems have been unlocked.

Local QA: `git pull --ff-only`, `npm run check:web`, `npm run build -w @the-pall/web`; refresh `/characters/<owned-character-id>/opening` and `/characters/<owned-character-id>`. Check desktop widths 1440 and 1920, mobile widths 390 and 320, and full-screen/zoom settings. Verify no dark margins outside the shell, no unwanted horizontal overflow, readable dialogue and four independently tappable work-object icons. Expect vertical **document** scrolling only when necessary. This is a layout-only candidate until the owner's visual check passes; there is no API or database migration.
