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

### M1.3 → M1.4 playable Millhand Stage 1–2 slice (2026-10-26)

**Status:** Source committed as an implementation candidate; **not yet verified against the owner's running PostgreSQL, Svelte build or browser**. This extends the previously approved full-viewport guided UI; the post-Stage-8 Home dashboard remains locked.

**Canon:** `docs/05-gameplay/onboarding/millhand/opening-dialogue.md` (Stage 1 R02), `stage-2-approved-script.md` (Stage 2 R03), and `platework-interaction.md` (mechanics). The Stage 1 **Take the work paper** button now calls an account-owned, idempotent work command. PostgreSQL advances the selected Millhand from Stage 1 NOT_STARTED to Stage 2 IN_PROGRESS and creates a work record atomically. Reload or return through Character/Scene resumes that exact saved work phase.

**Stage 2 flow:** **Read the work paper** → **Set the number stamps** → **Look at the bent plate** → one of **Straighten**, **Put it aside. Take another**, or **Stamp it anyway** → **Stamp the number** → **Check the stamped number** → if poor, **Fix the mark** or **Put the bad plate aside. Use another** → **Finish checking** → **Return the work paper**. Returning the paper marks saved Stage 2 COMPLETE and opens Stage 3 NOT_STARTED, but *does not yet present the Stage 3 story or work*. The four static shop props use only **icon-gated** contextual actions and neutral read-only inspections; clicking other objects has no work side effect. All approved result text, including the deterministic poor-mark recovery path, is retained.

**Important content gate:** The actual council worker number/serial identifier is **not authored in the approved documents**. No fictional number, worker identity or date has been inserted. The prototype therefore confirms stamp matching **conceptually** rather than implementing a numeric puzzle. It declares this openly on the Stage 2 page, so the stage should **not** be called fully content-complete until that number/data mapping is approved.

**Persistent guarantees:** A valid Better Auth account owns the character; the server rejects foreign character IDs and requests with client-supplied unexpected fields. A per-character PostgreSQL lock serializes mutations, expected revision detects stale tabs, and durable per-character request receipts replay repeated UUIDs without repeated results. No player coins, ordinary XP, inventory, bonus Major Skill or market item rows are changed by this tutorial. One illustrative representative plate and exactly one bent-plate choice, no invented durations, costs or weights.

**Local QA from `The-Pall\platform` (Node 24, Docker/Postgres already running):** Stop API/web Node watchers first, preserve the existing Docker volume; do NOT use `docker compose down -v`.

```powershell
git status --short
git pull --ff-only
npm ci
npm run test:unit
npm run check:api
npm run check:web
npm run build -w @the-pall/web
npm run platework:migrate
```

Start API `npm run dev:api` and web `npm run dev:web` in separate PowerShell terminals. From a third terminal:

```powershell
npm run verify:millhand-work-unauthenticated
npm run verify:characters-unauthenticated
```

**Manual QA with a saved Millhand at Stage 1** (do not create or delete extra characters just for this test):
1. At `/characters`, select the character; **Enter Smithing workshop**. Follow the approved optional Guther dialogue to **Take the work paper**. Click once: character should persist as Stage 2 IN_PROGRESS, at `/characters/<id>/millhand/work`.
2. Select **Council order**, click **Read the work paper**. Click the wrong hammer first or after reading—observe only; it must not progress. Select **Number stamps** then **Set the number stamps**.
3. Select **Metal plates** and **Look at the bent plate**, choose one of the three valid methods. For the best coverage on this one durable character choose **Stamp it anyway**; then select Hammer, stamp, select Metal plates, inspect the poor mark, and fix or replace it. All alternate choices are covered by unit tests without consuming six character slots.
4. Select **Council order** to finish checking; select it again to return the paper. The character becomes Stage 3 NOT_STARTED, **without playing or revealing the later mystery**.
5. At **each phase**, refresh once and verify same work step/branch/character Health/Coins; restart only the API once mid-task if practical. No repeated grants. On mobile, no separate scrollbar inside the popup.
6. In a signed-out/incognito window, `/api/characters/<id>/millhand/work` must be HTTP 401; with a **different signed-in account**, the URL must return generic 404. Test same request-id replay / cross-tab stale revision via devtools only if comfortable, since the server guarantees are not yet independently verified.
7. If any test or migration fails, **stop and report the first error** with secrets redacted. Do not try to reset the DB or manually edit the tutorial stage.

There is no new art requirement, no new character creation grant, and no separate QA Markdown report. Work item/copy parity and full public-release security remain future acceptance gates.

### Recurring NPC conversation review — optional, non-mutating (2026-10-27)

**Owner request:** Explicit player speech choices should advance directly to the NPC reply, not show the selected player line twice. This applies to all six Stage 1 conversations. `resolveStageOneChoice` now skips the redundant player speech beat **only after clicking an explicit spoken choice**; ordinary unprompted dialogue remains unchanged.

All six recurring starting NPCs now have a reusable optional conversation component covering **their work, Grand Cylinder City, and the Plume/Pall**. Guther's existing illustrated person can be clicked in **Millhand Stage 1 and at every Stage 2 platework phase**, including after completion; asking something and closing returns to the exact work/dialogue state, with **no stage, coin, XP, inventory or quest mutation**. The other five origins expose **Talk to [NPC]** on their existing Stage 1 text-first scene. Real artwork for them is not invented. NPC interaction does not replace the approved scene or its work-handoff controls.

**Editorial gate (IMPORTANT):** These **18 new answers are NOT APPROVED** and are explicitly labelled `DRAFT — AWAITING OWNER APPROVAL` on screen. They contain **no invented detailed personal biography**; the origins' approved roles and voice ledger don't provide those details. The full six-NPC proposed texts are added **in-place** to [Dialogue Style Guide](../docs/05-gameplay/interactions/dialogue-style-guide.md), under the marked draft review section. Owner must approve or revise them **before** changing their status or treating the lines as permanent story canon. An extension of `npm run verify:canonical-copy` checks that the runnable draft matches the reviewed texts and every selected Stage 1 player speech leads directly to the reply.

Local test: `git pull --ff-only`, `npm run check:web`, `npm run build -w @the-pall/web`, then refresh an owned Millhand's opening or saved Stage 2 work screen. Click Guther, choose any optional question, verify **no duplicate rendering of the player's prompt**, select "Ask something else" and "Return to work", then continue the saved job where you left off. Repeat with a Bellrunner/Stitcher origin opening if available. There are **no new database migrations or assets**. Source committed; user's browser/build verification still pending.
