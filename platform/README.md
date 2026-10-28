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


### Millhand optional conversation editorial approval and skip-to-work (2026-10-27)

Guther's **four owner-revised optional dialogue branches** are now in `docs/05-gameplay/onboarding/millhand/guther-optional-conversation.md` and `apps/web/src/lib/approved-guther-optional.ts`. Their words have been copyedited on owner request, with two later owner edits removing the dashes from the Cylinder's power explanation and the list of workshop work. These two sources must stay identical. **Guther alone is approved**; the other five NPCs' optional discussions remain draft material to be reauthored when those origins are tackled.

A **“Enough talk. Let's work.”** spoken option appears at each Millhand Stage 1 dialogue moment and in Guther's optional topic menu and every reply. During Stage 1 it goes to the existing **Take the work paper** handoff without silently submitting that POST. During Stage 2 it dismisses Guther's optional conversation, leaving the server work state, current object selection and available actions intact. The compact in-scene dialogue remains; no new assets, tables or rewards. `npm run verify:canonical-copy` checks all 22 lines and the skip-to-work contract.

### Next implementation gate — Millhand Stage 3: The Missing Stamp

**Status:** Approved narrative and mechanic contract exists; **runnable Stage 3 is not yet connected**. After `return_paper`, the current API saves Stage 3 `NOT_STARTED` and Stage 2 `COMPLETE`. Do not show the Stage 3 clues earlier or recycle the Stage 2 UI as if this scene is playable.

Canonical implementation order, from `docs/05-gameplay/onboarding/millhand/stage-3-approved-script.md` (words) and `missing-stamp-discovery.md` (mechanics):

1. Two distinct interactable council evidence objects: **returned reference plate** and **cancellation slip**. Either inspection can be first; both are required. Save inspection flags persistently, without awarding XP/coins and without treating either prop as player inventory.
2. Only when **both** have been inspected, reveal the discrepancy automatically (no third compare button), then allow **Show Guther the papers**. Display the approved Guther exchange in the compact dialogue popup, explicitly advanced by the player. A selected player line is already spoken; do not show it again in a second speech screen.
3. Show **all three route choices together** after Guther has answered: reissue the worker number and take the lot to depot (Industry/Hauling), ask Contracts (Commerce/Contracts), or note the number and inspect records (Scholarship/Investigation).
4. Route commitment is **once only**, persisted and idempotent, and awards the designated second Major Skill **+1 exactly once**. Restamp must perform only one authorised worker-number action, never reproduce or alter the council inspection mark. Preserve the two other Stage 4 branch boundaries without inventing their implementation.
5. Keep returned plate worker number, cancelled worker number, stamped worker number and both dates **identical across records**, with inspection date after recorded death. **These identifying values remain unapproved/unwritten.** Do not invent dates or show template tokens as in-world evidence. Treat exact numeric comparison and the final player-visible contradiction as a **content gate** until authored values exist.
6. Preserve account ownership, PostgreSQL transaction/receipt protection, revision validation and character persistence. Refresh during either inspection and after a route selection must not duplicate the +1 award or replay the discovery. No Stage 3 interaction yields money, ordinary XP or loot.
7. Validate Stage 2 → Stage 3 routing for an existing saved character without deleting or resetting it. Test inspections in either order, premature conversation denial, Guther line-by-line progression, three mutually exclusive commitments, mobile dialogue and signed-out/foreign-character protection.

The next development work is the Stage 3 state-machine/API/UI integration under these boundaries. Do not claim the stage is complete or testable with canonical numbers and dates before those values are authored.


### M1.5 Stage 3 implementation candidate — The Missing Stamp (2026-10-27)

**Committed:** `apps/web/src/routes/characters/[id]/millhand/missing-stamp/+page.svelte` and `MillhandMissingStampScene.svelte` show the existing workshop and Guther artwork with two separate evidence hotspots, owner-approved spoken copy, player-controlled dialogue progression, the three route choices, a read-only factual journal and a way to return to optional Guther talk. The Stage 2 completion screen, character view and shared navigation now link here.

**Server-owned progression:** `packages/game-core/src/millhand-missing-stamp.ts` defines the inspect-in-either-order state machine, evidence validation, nine dialogue beats (eight spoken + one narration), optional player-controlled skip directly to the three mandatory choices, three route selections, and one re-stamp action only for Industry/Hauling. The API stores state and UUID receipts in `player_character_missing_stamp`, enforces account ownership, CSRF origin, expected revision and PostgreSQL row locks. On the **first** committed route selection it increments the selected Major Skill `Industry`, `Commerce` or `Scholarship` by **exactly one level** in the existing character bonuses JSON, once only, with no additional coins, XP or inventory; Contracts and Records proceed to saved Stage 4 `NOT_STARTED`, while Industry completes a one-time worker-number restamp before saved Stage 4. Stage 4 job screens remain unimplemented.

**Mandatory content gate:** `AUTHORED_MISSING_STAMP_EVIDENCE` is explicitly **null** until the owner authorises the worker number and two exact dates. The game allows saved inspections and an approved partial first-person journal, but does **not** fabricate or display numeric evidence. After both objects are inspected, a clearly non-diegetic authoring notice appears and `show_guther` remains disabled. The rest of the stage is structurally implemented and unit-tested with test-only fixtures; it cannot be completed in the running game until real approved values are set. No test fixture value is used in player-facing code. The stamped Stage 2 number was previously conceptual, so this is a cross-stage content reconciliation gate, not simply a copywriting task.

**One-time local setup, from `The-Pall\platform`:**

```powershell
git pull --ff-only
npm ci
npm run build:packages
npm run test:unit
npm run check:api
npm run check:web
npm run build -w @the-pall/web
npm run missing-stamp:migrate
```

Do not run a destructive reset or recreate the player's Millhand. Migration `db/migrations/0004_millhand_missing_stamp.sql` only **adds** Stage 3 state and receipt tables; Stage 2 records remain intact. Restart API and web processes after migration. To inspect the new scene, open an owned Millhand already at Stage 3 or finish Stage 2 through **Return the work paper**, then select **Continue to The Missing Stamp**.

**QA sequence:** Inspect returned plate then slip (or vice versa on a different test state) and refresh after the first inspection, verify the saved record flags, journal, and missing-date authoring notice. Click Guther for optional talk, then resume without losing evidence. Check no new wages, loot or skill level appears from inspections. When actual dates and the shared worker number are approved, re-run both inspection orders, inspect both visible numbers/dates, follow or skip Guther's eight spoken lines, and test the three mutually exclusive route actions (test fixtures/unit tests cover alternate branches without resetting a real character). Check exactly one +1 Major Skill increment on the single saved branch, Stage 4 transition, no fake council inspector mark, and 401/404 for signed-out/foreign-character requests. No optional Guther conversation may mutate the saved Stage 3 revision.

**Build/QA status:** Commits have been source-checked against approved dialogue, but this connector environment cannot run a local Svelte build, PostgreSQL migration or browser playtest. Treat this as an implementation candidate until local commands pass.


### M1.5 owner correction — artwork and gameplay unlock (2026-10-27)

This update **supersedes the earlier Stage 3 content-gate section above**. Stage 2 stamping is a reusable work interaction, not a number-entry/matching game. The returned plate and cancellation slip are new owner-supplied transparent assets. Their identifying details are shown through text in the compact CRPG popup, not painted into the images. Both evidence inspections are persisted in any order; after both, the relative death/inspection-date contradiction appears and **Show Guther the papers** becomes available even when no exact worker number or date has been authored. Previously saved Stage 3 characters at `READY_TO_SPEAK` can continue with no reset.

The interface expects two real cutouts at:
- `apps/web/static/workshop/returned-reference-plate.webp`
- `apps/web/static/workshop/cancellation-slip.webp`

The companion art ZIP contains those two files under `apps/web/static/workshop/`. Extract the archive from the `platform` directory (keep folder paths); **the GitHub code commit alone does not install these binary assets locally**. The WebP files preserve transparency and the owner's artwork. No new database migration or character reset is needed beyond the existing Stage 3 tables. Restart both servers after `git pull --ff-only` and extraction; run `npm run test:unit`, `npm run check:api`, `npm run check:web` and `npm run build -w @the-pall/web` before browser QA. Ensure the user can now proceed to the Stage 4 boundary and that the +1 Major Skill is only committed once at route selection.

### Windows dependency install recovery — Vite/pg not found (2026-10-27)

The Windows errors `'vite' is not recognized` and `ERR_MODULE_NOT_FOUND: pg` both mean npm dependencies are not available to the relevant workspace/script. `vite` is a web workspace **devDependency**, so production-only installs omit it. Root migration scripts import `pg` directly; `platform/package.json` now declares `pg` as a root dependency and `platform/package-lock.json` is synchronised. Node 24 is within the supported engines range.

**Use Windows PowerShell, with the dev servers stopped, from the `platform` directory:**

```powershell
git pull --ff-only
npm ci --include=dev
if ($LASTEXITCODE -ne 0) { throw "npm ci failed. Do not run builds or migrations until installation succeeds." }
node -e "console.log(require.resolve('pg'))"
npm run build -w @the-pall/web
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed. Stop here and inspect this error." }
npm run missing-stamp:migrate
```

Run `npm run test:unit`, `npm run check:api` and `npm run check:web` after a successful install to diagnose actual code errors separately. This is a **dependency recovery**, not a request to reset the database. The npm warning about `_email` is unrelated.

If `npm ci` fails, capture its **first meaningful ERROR and the exit code**. Do not repeatedly run `vite build` or the migration after installation has failed. If it succeeds but web tooling still cannot be found, inspect `npm config get omit`, `npm config get workspaces` and `npm config get registry` without making global changes.

### M1.5 Stage 3 workshop positioning correction — owner screenshots (2026-10-27)

The owner reported that the two evidence cutouts looked like boxed menu tiles, were not resting naturally on the tabletop, and were covered by the CRPG dialogue panel; expanding **Review journal** enlarged the panel until it swallowed the scene. These are layout defects, not new game-design requirements.

**Fix:** `apps/web/src/lib/MillhandMissingStampScene.svelte` now uses two independent desktop grid rows: compact upper-right dialogue and lower tabletop evidence. The real transparent returned plate and cancellation slip are unframed artwork with small name labels, similar to Stage 2's prop tags; keyboard focus stays visible. On narrow viewports, art and evidence share the illustrated area, and dialogue follows beneath the illustration. There is no longer a rectangular visual card around the evidence. The journal opens in its own **normal document-flow section below the workshop scene**, with an explicit Close button; clicking Review journal scrolls the page to it. Journal expansion cannot resize the NPC panel or rearrange the prop positions. The page, not the popup, handles additional content height. All saved stage/skill logic, dialogue wording and character data are unchanged.

**Local acceptance:** `git pull --ff-only`, `npm run check:web`, `npm run build -w @the-pall/web`, restart the web server, and reload the saved Stage 3/4 character. Check the longest Guther response, all three route-choice buttons, both inspected objects, journal opened/closed repeatedly, and screenshots at desktop widths approximately 1440px and 1024px and phone width around 390px. No dialog/asset collision, boxed-image background or independent journal scrollbar is acceptable. Since this is UI-only, no database migration, new worker ID, asset reinstall or character reset is needed. Builds/browser QA still require a local run; source-level verification is included in `verify:canonical-copy`.

### Seamless Millhand workshop handoff and first greeting (2026-10-27)

**Owner request:** Do not end the stamped-plates job with an out-of-character Stage 3 notice and a hard-to-see footer link. After the character selects **Return the work paper**, the existing authenticated, idempotent work command saves Stage 2 COMPLETE / Stage 3 NOT_STARTED. **Only on successful confirmation**, the frontend immediately navigates to the authenticated Stage 3 workshop route. It does not call a second work action or award anything. Reloading/opening the old Stage 2 URL after saved completion likewise goes directly to Stage 3.

**Stage 3 starts with Guther talking in the compact workshop popup**, not a chapter-complete overlay. New introduction: “All finished, are you? Good. Leave the work paper here. There's a returned plate and a folded slip in with this lot. Have a look at them before I send anything off.” The foreground objects remain separately inspectable in either order. Guther's later approved conversation about the contradictory records stays unchanged. Stage 2's completed-work status text is now in-world narration, not an instruction to change pages.

**Stage 1 first encounter:** Owner requested a proper teasing first greeting, using the saved character's name instead of a cold “What do you want?” formulation. The original Guther opening is replaced with: “Hey, [player name]. I see you standing idle. Feels good, does it? Not to me! Come here. I've got work for you. The council's sent more plates. Worker numbers again.” The `[player name]` token is rendered from the actual saved character as in the existing wage dialogue. The approved wage exchange, work instructions, skills, stage transitions and optional Guther talk remain unchanged. `docs/05-gameplay/onboarding/millhand/opening-dialogue.md` (Revision 03) and `stage-3-approved-script.md` match the playable sources.

**QA:** Run `npm run verify:canonical-copy`, `npm run check:web`, `npm run build -w @the-pall/web`. On a saved character still in Stage 2, select the council work paper and **Return the work paper**. Expect an automatic scene change to Guther's opening Stage 3 line, with no additional Continue page or OOC notice. Refresh the old Stage 2 URL and check it goes to the Stage 3 route. From a fresh Stage 1 character, verify the greeting contains the correct name. Test after failed work POST that no navigation occurs; saved Stage 3 records need not be reset. No schema or image changes.

### Local developer tool — replay the previous Millhand stage (2026-10-27)

The owner can now replay stages with the **same character**, rather than repeatedly creating new characters. On the local developer API only, the shared workshop header shows **← Back to Stage N** from saved Millhand stages 2, 3 and 4. The button displays a confirmation explaining what resets. There is no button at Stage 1. The tool is **not normal gameplay**.

**Gating:** `apps/api/src/millhand-stage-rewind-routes.ts` registers GET/POST `/api/characters/:id/dev/rewind-stage` only when `NODE_ENV !== 'production'` and `API_HOST` is loopback (default `127.0.0.1`). It requires an authenticated, email-verified session and an account-owned Millhand; POST requires JSON and a valid same-origin request. The request carries `expectedStage` (2, 3 or 4). Within one PostgreSQL transaction the server locks the character row, checks current stage, and rejects duplicate/stale-tab commands, ensuring one click cannot rewind twice.

- **Stage 4 → Stage 3:** Replays *The Missing Stamp* from the first Guther handoff and evidence. Stage 2 remains completed. Clears Stage 3 saved choices/evidence/receipts and **removes exactly the +1 Major Skill earned from the chosen Stage 3 route**.
- **Stage 3 → Stage 2:** Replays *Marking the Plates* from `READ_PAPER`, revision 0. Clears Stage 3 state/receipts and Stage 2 action receipts. Also removes the Stage 3 skill award if the restamp route had already been selected but the final restamp had not been committed.
- **Stage 2 → Stage 1:** Replays the original Guther greeting and Stage 1 dialogue. Deletes Stage 2 work state/receipts. Since Stage 1 never mutates the server until taking the work paper, this restarts the introduction cleanly.

**Character identity, name, attributes, starting major skill, health, coins and starter equipment requirements are never rewritten.** The planner refuses unexpected extra skill bonuses or unrecognised work states rather than risk removing unrelated progression. No database schema changes, character deletion, or developer test-fixture numbers are required. Rewinding does intentionally discard the target stage's current progress and later-stage progress. Stage 5+ is not yet supported; the control stays hidden there rather than incorrectly deleting future data.

**To use:** In local development run `git pull --ff-only`, `npm run test:unit`, `npm run verify:dev-rewind`, `npm run check:api`, `npm run check:web` and restart API/web. On a Millhand Stage 4 boundary screen, click **← Back to Stage 3** in the header; after replaying Stage 3, click **← Back to Stage 2**; then **← Back to Stage 1**. Each click asks for confirmation, performs one guarded server save and navigates to the restarted stage. To repeat Stage 3, just rewind 4 → 3 again.

**QA:** Confirm the second branch selection adds exactly one +1 skill after a rewind; a stale tab's old `expectedStage` returns 409 and cannot double rewind. Signed-out and foreign-character reads/writes return 401/404. Verify normal Stage 2 → 3 and Stage 3 → 4 saves continue working. **Local database and browser integration remain unrun from the GitHub connector environment.**

### M1.6 — Millhand Stage 4: three approved second jobs (2026-10-27)

**Implementation candidate, awaiting local compile and owner visual review.** The complete approved [Stage 4 Revision 01](../docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md) is now represented by a branch-specific server state machine, player-controlled NPC conversations, conditional personal journals, and owned PostgreSQL action saves. Stage 4 is **not one repeated paperwork screen**: each of the three skill routes has different required work.

- **Industry / Hauling → Depot Intake Run:** Stage 3 already committed the one additional worker-number mark; the same stamp is **not** performed again. Stage 4 checks the load, chooses between securing all plates and smaller loads, compares the erroneous `workers` delivery-list category against physical plates, speaks with the Depot Clerk (all 5 approved lines), chooses either a truthful direct plate receipt or a requested correction, and completes delivery. Actual time/damage probabilities are unapproved, so there are **no invented rolls, elapsed durations, or damage**.
- **Commerce / Contracts → Disputed Docket:** Examine the work paper, compare the sealed death-for-compensation and active-for-contract-charge records, speak with the Contracts Clerk (all 7 approved lines), choose a seal check or documented written complaint, then submit. Neither record is silently rewritten.
- **Scholarship / Investigation → Ledger Reconciliation:** Read the death register, check the later wage records, examine the scraped line, speak with the Archive Assistant (all 4 approved lines), compare either neighbouring lines or the shift book against the wage record, and record the finding. Who damaged the record and why remain unknown.

The Stage 3 selected route is obtained **only from the database**, never from a browser-provided branch or skill. Stage 4 awards **no second +1**, no coins, no ordinary XP and no loot; the Stage 3 one-time award stays intact. The council's inconsistent records remain unexplained. Completion saves Stage 4 `DONE` and enters Stage 5 `NOT_STARTED`; Flint's Stage 5 scene is **not yet wired**, so do not invent his dialogue or start his fight here.

**Data/technical files:** `packages/game-core/src/millhand-second-job.ts`, `apps/api/src/millhand-second-job-routes.ts`, `apps/web/src/lib/approved-stage-four.ts`, `apps/web/src/lib/MillhandSecondJobScene.svelte`, `apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte`. Run the **new additive** migration `npm run second-job:migrate` once after installing dependencies. It creates `player_character_second_job` and the idempotent receipt table; it does **not** erase old character, platework or Missing Stamp saves.

**Stage 3 → Stage 4 continuity:** After Guther finishes his approved final response, the in-dialogue, route-specific next action takes the player to the corresponding job. The action for the restamp branch appears only after the single extra worker-number mark is committed. Saved Stage 4 players reach that job directly through the shared chapter navigation or character screen. The three Stage 4 NPCs use their own approved words, not Guther's optional dialogue. Long journal entries stay outside the active work popup.

**Developer replay:** The local-only, signed-in `← Back to Stage` tool is extended to **Stage 5 → 4**, removing Stage 4 data and receipts but **preserving the chosen Stage 3 +1 skill**. From Stage 4 → 3 it also removes Stage 4 data and the selected Stage 3 skill, so a different branch can be tested. Stage 3 → 2 and Stage 2 → 1 behave as previously documented; future Stage 5 combat/health/currency systems remain outside rewind scope. No new schema is required for the rewind change itself.

**Visual gate:** No owner-approved depot, Contracts-office or records-room backgrounds/transparent prop art are in this integration. The Stage 4 scene uses restrained **schematic functional staging**, not final game artwork. The locations have separate palettes and object arrangements, but their visual presentation is **not signed off**. When the owner supplies those assets, replace only the scene art/hotspots and preserve the interaction/state/reward contract. Do not claim that text labels or schematic shapes satisfy the physical-world UX benchmark.

**Local rollout from `The-Pall\platform`:**

```powershell
git pull --ff-only
npm ci --include=dev
npm run build:packages
npm run test:unit
npm run verify:stage-four
npm run verify:dev-rewind
npm run check:api
npm run check:web
npm run build -w @the-pall/web
npm run second-job:migrate
```

Run the migration only after the build checks succeed; stop at the first failure. Restart the API and frontend afterward, then revisit your already saved Stage 4 character. Test each branch and both alternative methods, the route-specific journal, the 5/7/4 distinct spoken lines, account ownership, stale-request rejection, Stage 5 boundary and the developer rewind. **These checks have not been run against the owner's local PostgreSQL or browser from the connector environment.**

### Owner UI Kit v1 — restrained visual integration (2026-10-27)

The owner supplied `The-Pall-UI-Kit-v1.zip`, a separate transparent sidebar illustration and a city panorama matching `resources/TheCityVista.png` in the ZIP. Rather than saturate every screen, pass 01 integrates only the owner's compact logo, unobtrusive city-banner artwork, footer illustration, typography and **real saved Health bar**. Dialogue stays in the small workshop popup. New Standard is applied to work, dialogue and ordinary prose; Bebas Neue is used for restrained small labels. Beyond Wonderland is installed but is not applied broadly.

**Licensing:** New Standard and Bebas Neue include SIL OFL licenses; Beyond Wonderland's readme permits commercial use. CF Industrial Fabrics is labeled **non-commercial**, and Stranger Friz **personal-use only**. The local installer excludes both restricted fonts. It copies the included licenses for the three permitted fonts. Full details and art handoff: [Owner UI Kit v1](../docs/00-vision/owner-ui-kit-v1-integration.md).

**Run from Windows PowerShell inside `The-Pall\platform`**, with the uploaded files in your Downloads folder (change the paths to wherever you actually saved them):

```powershell
git pull --ff-only
powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-ui-kit.ps1 `
  -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip" `
  -SidebarImage "$env:USERPROFILE\Downloads\the_pall_sidebar_illustration_transparent.png"
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

Restart the frontend. No database migration, quest reset or new character is required. The original ZIP is the local source for the binary art and font files; the GitHub source commit contains the installer and styling, **not the binary fonts or images**. The standalone City image need not be copied again because it is identical to the ZIP's `TheCityVista.png`. If the source files are in another directory, point the installer there.

Stamina and Fatigue fill textures, buttons and dialogue frame are available as static source assets for later review. No fictitious stamina/fatigue readings, city navigation, inventory buttons or unrelated new interactions have been implemented. Check the artwork and typography at mobile and desktop before authorizing more decoration or a universal dialogue-frame replacement. Local browser rendering remains to be verified by the owner.

### Owner UI screenshot follow-up — Stage 4 500s, font decode, four meters, city vista (2026-10-27)

The Stage 4 GET and local developer rewind POST were returning HTTP 500. Both routes query Stage 4's second-job tables. In particular, if `0005_millhand_second_job.sql` has **not** been applied to the local PostgreSQL database, the `42P01` missing-table error explains both. API routes now map that specific SQLSTATE to HTTP 503 with `second_job_schema_missing` and `setup: npm run second-job:migrate`. Other errors still require the API's terminal logs; screenshot console alone does not prove the cause.

**Required local database fix**, from `The-Pall\platform` (after a successful dependency install):

```powershell
git pull --ff-only
npm run second-job:migrate
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

Restart **both** the API and web server. The migration is additive and keeps existing characters, progress, XP, equipment and coins. If 500 remains, copy the **API terminal error**; do not reset or delete the database.

**Visual changes:** The panorama now has enough vertical room for the Grand Cylinder and the workshop/location strip is a smaller 43px row. The Stage 4 route can display its actual current location instead of 'Smithing workshop'. Header resource tracks are Health, Stamina, Fatigue and Focus. **Health is the only currently persistent measured value** in the saved character API; other tracks show ‘—’ (not loaded / not yet tracked), never invented percentages. When combat persistence is added, those three can be populated without changing the shared HUD arrangement.

**Font repair:** Chromium rejected the supplied New Standard OTF with an invalid CFF CharStrings INDEX. Browser CSS no longer loads that binary (so it stops generating OTS console warnings). Georgia is temporarily used for body text; the supplied open-licensed Bebas Neue remains used for compact labels. Keep New Standard in the original kit and request a validated export before re-enabling it. No arbitrary fonts substituted or shared.

**Verification status:** Changes are committed and checked against source references; the developer's local database, API and browser have not been executed from this GitHub integration.

### M1.7 — Owner-supplied dialogue frame, all button states and origin-independent avatars (2026-10-27)

The owner observed that the prior UI kit pass did not actually display `frames/dialogue-frame.png`, `buttons/button-{normal,hover,pressed}.png` or a real avatar portrait. The assets **do exist in the supplied UI ZIP**, except portraits (the ZIP contains no avatar library).

- `apps/web/src/lib/pall-owner-ui.css` now uses CSS nine-slice border image for the **existing compact NPC/work dialogues** and normal/hover/pressed skins for **playable conversation/quest action choices**. This works across Stages 1–4, Guther's optional talk and all Stage4 branches without adding fullscreen dialogue or changing any story/mechanics. Nameplate and evidence prop hit targets are intentionally unskinned.
- Bebas Neue now styles compact speaker and work headings. Beyond Wonderland styles the city title only; the original New Standard font remains disabled because of the browser OTS CFF parsing error. Georgia remains the readable fallback. Restricted fonts are still excluded.
- `apps/web/src/lib/CharacterAvatar.svelte` is used by the **shared** TutorialShell header. It accepts an optional saved character `avatarId` selecting a WebP or PNG file from a universal `static/ui-kit/avatars` directory. **No origin-specific avatar assignment is permitted**. The character API currently has no saved avatar ID and the supplied kit contains no portraits, so the previous initial-letter fallback remains until the owner supplies their separate avatar files and portrait-selection persistence is implemented. This is not a completed portrait-selection system.
- The local asset installer accepts optional `-AvatarDirectory "<local-directory>"` for simple-named WebP/PNG portraits, for all backgrounds. This doesn't fabricate names, silently select an avatar or modify the database.

**Local update:** After `git pull --ff-only`, the previously installed frame/button PNGs are available without reinstall. From `platform`, run `npm run verify:owner-ui-kit`, `npm run check:web`, `npm run build -w @the-pall/web`; restart the web server and refresh. The extended verification checks actual CSS references to the three button states, dialogue frame and universal avatar slot. No migration required for these changes.

**Review gate:** User must confirm desktop/mobile text, corner proportions and button readability. No browser/device rendering is verified by the GitHub connector. **Avatar art is still required**: obtain the owner portrait ZIP/directory (image IDs and format), then add a global selection/persistence workflow shared by every origin. Do not use Millhand default avatars for other backgrounds or pretend the character initial is approved avatar artwork.

### UI frame screenshot correction — remove white gutters and preserve button endcaps (2026-10-27)

The original owner frame/button artwork had substantial transparent padding. The first CSS pass treated the uncropped PNGs as nine-slice sources, then drew a solid beige rectangular backdrop behind the translucent corners. It also squeezed decorated button caps into too-narrow borders. This has been corrected in `apps/web/src/lib/pall-owner-ui.css`.

**Asset requirement:** Source CSS now references four **alpha-trimmed** siblings of the existing supplied PNGs: `frames/dialogue-frame-trim.png` and `buttons/button-{normal,hover,pressed}-trim.png`. The user has a companion ZIP **The_Pall_UI_Cropped_Frames_Patch.zip**, generated directly from the uploaded original kit with no stylistic changes. From `platform`, extract the patch ZIP (preserving `apps/web/static/ui-kit` relative paths), or rerun the updated `scripts/install-owner-ui-kit.ps1` with the original ZIP to generate the same files on Windows using System.Drawing. The originals remain installed and unmodified.

**Visual corrections:** The dialogue image now has a transparent CSS backing, calibrated nine-slice cuts and physical content insets. Button caps have reserved border widths and keep all three source states without stretching their ends. The city heading returns to plain, readable serif; Bebas Neue remains for the compact game labels. No character, quest or SQL changes occur.

**Local steps from `platform`:**

```powershell
git pull --ff-only
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\The_Pall_UI_Cropped_Frames_Patch.zip" -DestinationPath "." -Force
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

Restart Vite or refresh with cache bypass. The owner has indicated a **single portrait collection for all origins**. Actual avatar images have not been provided in the kit/project uploads, so the topbar currently shows the initial fallback. Once the avatar ZIP is available, wire a shared portrait catalogue and persistent avatar selection independent of origin; don't fabricate or silently select a portrait. The visual corrections above were simulated using the owner's cropped PNGs, but still require real browser review and narrow/mobile QA.

### Millhand workshop reading pace and fixed character scale (2026-10-28)

The owner identified a Stage 3 UX defect: the unpaged evidence inspection stacked (1) initial narration, (2) the council record details, and (3) the whole contradiction plus decision, causing the nine-slice dialogue frame to grow vertically. The scene used auto-sized grid rows and a percentage-sized Guther image, so the entire workshop and NPC grew with that text. Stage 3 route labels were also too faint against the pale button skin.

**Implemented:** `apps/web/src/lib/MillhandMissingStampScene.svelte` now presents an inspected object as **author-controlled, local reading pages**:
1. The existing narration about the inspected item, then `Continue`.
2. The existing numbered/dating record details. After inspecting the second item, `Continue` becomes available.
3. Only after both evidence objects have been saved as inspected: the existing contradiction and the server-authoritative `Show Guther the papers` action.

Page 1 → 2 → 3 is **local UI only**: it does not change the Stage 3 database revision, grant an award, repeat stamping, skip the confrontation or rewrite any approved wording. A resumed Stage 3 character whose evidence was already inspected gets a concise finding and can proceed immediately. The optional conversation and confrontation remain independent. The accepted route choices have a high-contrast dark discipline tag (Industry / Hauling, Commerce / Contracts, Scholarship / Investigation) within the supplied nine-slice buttons.

**Stage composition:** Stage 1, Stage 2 and Stage 3 workshop scenes now use stable desktop heights `clamp(700px,76vh,810px)`, independent of the length of dialogue, and the Guther cutout ends at the painted workbench edge through a crop mask. This keeps the original workshop and table assets untouched. The compact dialogue has an exceptional overflow fallback for extremely small desktop heights; on mobile, the illustrated workshop and popup stack vertically rather than being forcibly clipped. Physical props remain independently clickable and journals still open below the scene.

**Safe owner copy edits:** For Millhand wording, the primary runnable sources are `apps/web/src/lib/approved-stage-one.ts`, `apps/web/src/lib/millhand-work-copy.ts`, `apps/web/src/lib/approved-stage-three.ts` and `apps/web/src/lib/approved-stage-four.ts`. Do not edit `MillhandMissingStampScene.svelte` to alter the prose of `PLATE_NARRATION` or `stageThreeFinding` unless intentionally changing the structure. Keep the matching approved scripts in `docs/05-gameplay/onboarding/millhand/` in sync. `npm run check:web` includes `verify:canonical-copy` and warns about mismatches, then checks Svelte/TypeScript. Characters and stage saves need no migration or reset.

**Owner QA:** After `git pull --ff-only`, `npm run check:web`, `npm run build -w @the-pall/web`, restart the web dev server. Revisit Stage 3 and inspect plate then slip (and vice versa on replay). Observe narration → record → contradiction as separate beats with no oversized panel, and the unchanged `Show Guther` choice after both. Try the three route choices and check their discipline tags can be read. Check Guther stops at the bench edge and does not grow when dialogues change. Stage 1 and 2 should remain at the same visual scale. Compilation/browser rendering has **not** been run in this GitHub connector context.

### Workshop prop clicks and Guther behind the bench (2026-10-28)

Owner feedback: Stage 2's four illustrated props were only clickable through their lower nameplates, which also had redundant icons and pins. The returned plate and cancellation slip in Stage 3 were already full-image buttons, but lacked comparable hover feedback. The previous attempt to stop Guther clipping at the table used a crude horizontal `clip-path` on the character cutout, visibly severing his hands/apron.

**Now implemented in the existing Millhand Stage 1–3 scenes:** Each Stage 1/2 illustrated prop has a transparent accessible button over the **full corresponding tabletop image bounds**, with the same inspection/selection actions as before. The labels now contain **text only**; the decorative icons and little selection pins are removed. Hover/keyboard focus grows only the *art* by **1.8%**, using a 160ms transition, without moving the prop, changing layout or disabling object selection. Stage 3's two physically clickable evidence images receive the same 1.8% feedback. The transparent image layer remains noninteractive; the aligned accessible button on top owns the action.

**Bench depth / Guther correction:** The scene already has an approved transparent Guther image and the original workshop environment including the painted workbench. Every Stage 1–3 scene now renders **the same environment again, identically aligned, clipped to its lower tabletop area (70%–100%)**. This is a foreground depth layer above Guther, below interactive table props and below the dialogue. Therefore, Guther is genuinely occluded by the existing painted bench instead of being vertically truncated with a crude character mask. No different Guther portrait, workshop asset redraw, new sprites or database changes are required. The 70% depth threshold is an initial match for the existing approved desktop framing; owner screenshots at varying resolutions remain the visual acceptance test. On mobile, the overlay inherits the same `object-position:39% center` as the base environment.

**QA:** `git pull --ff-only` then `npm run check:web` and `npm run build -w @the-pall/web`, restart frontend and hard-refresh. In Stage 1–2 directly click Number stamps, Metal plates, Council order and Hammer on their **images**, with and without their label visible; confirm the same observations/actions as before. Hover just barely scales the prop and leaves the label fixed. In Stage 3 check the Returned plate and Cancellation slip image hover/click; both inspection orders must work. Check Guther's torso/hands at the painted table line and ensure the table occludes him without making a horizontal cutoff across his apron. Verify desktop and mobile. Browser integration remains to be confirmed on the owner's running game.


### Millhand Stage 4 Depot — owner background integration, 2026-10-28

The owner supplied a new receiving-yard background `depot_background.png`. The Industry / Hauling branch now renders a dedicated `apps/web/src/lib/MillhandDepotScene.svelte`, replacing the four large schematic glyph tiles. The real numbered plate and council work paper cutouts are separately clickable with 1.8% hover scaling, and the approved Depot Clerk conversation, route choices, server actions and journal remain intact. The delivery list and receiving record are interactive paper *descriptions/actions*, not invented icons. Contracts and Investigation routes are untouched.

To respect the approved task order, the Industry branch uses the existing workshop environment until the player completes the load check and chooses secured versus smaller loads; it then changes to the supplied depot panorama and updates the scene heading to Municipal depot. The new art is delivered as a **separate ZIP** for the user to install, not as a binary committed to GitHub. The ZIP's contents, extracted relative to `platform`, are:
`apps/web/static/locations/depot/depot-background.webp` (WebP, 1774×887; faithful conversion of the user's original PNG).

**Local commands, from `The-Pall\platform`:**

```powershell
git pull --ff-only
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\The_Pall_Stage4_Depot_Asset_Patch.zip" -DestinationPath "." -Force
npm run verify:depot-art
npm run verify:stage-four
npm run check:web
npm run build -w @the-pall/web
```

The separate ZIP must be downloaded first from the assistant's attachment; do not attempt to install the original PNG at a different path than the component expects. Restart Vite and hard-refresh afterward. No schema, character, Stage 3 or API edits were needed.

**Stage 2 duplicate text:** A poor-quality stamp observation was shown both as the saved action result and the identical phase instruction. `MillhandWorkScene.svelte` now suppresses the second rendering and its separator when the strings match. **No owner-edited source copy was overwritten.**

**Visual limitations:** The Depot Clerk portrait/transparent cutout is not supplied. If later desired, request it from the owner's art workflow. Until then, dialogue is in the standard CRPG popup without inventing a face or character design. The Contracts and records-room locations still require artwork. Browser and database testing must be confirmed locally; the GitHub edits alone do not validate the runtime.


### Owner Stage 3 record art + locally repaired New Standard — 2026-10-28

The owner supplied **CancellationSlipText.png** and **ReturnedPlate_Text.png** to replace the Stage 3 beige information boxes. The approved text, progression and three-page inspection pacing are unchanged. `MillhandMissingStampScene.svelte` now shows the owner-created slip or plate on page 2 of the correct inspection, within the same restrained frame. The images are not added to the table; the existing transparent tabletop props remain clickable. Display size is constrained by `max-height:min(34vh,325px)` to keep Guther and the table from stretching. When the server eventually has a real worker number or calendar date, live record text takes precedence over the generic wording baked into the owner image.

**Image installation:** `The_Pall_Stage3_Record_Art_Patch.zip` contains two original-appearance, lossless WebP conversions:
`apps/web/static/workshop/cancellation-slip-record.webp` and `apps/web/static/workshop/returned-reference-plate-record.webp`. Unzip relative to `platform`. No image binaries are embedded in repository source. Verify via `npm run verify:stage3-record-art`.

**Fonts:** The owner asked to activate the permitted typefaces from `The-Pall-UI-Kit-v1.zip`. The original New Standard OTF contains broken CFF outlines for Chromium; `scripts/convert-owner-new-standard.py` locally draws the same outlines as quadratic TrueType glyphs and saves a WOFF2 that the shared CSS now loads as `Pall New Standard`. This conversion was exercised against the supplied 2,151-glyph source and the produced WOFF2 was parsed and checked for Latin text. **The end user's browser build remains untested**; keep Georgia as CSS fallback. `scripts/install-owner-fonts.ps1` reads the owner ZIP, copies SIL-OFL New Standard and Bebas Neue and the commercially permitted Beyond Wonderland, retains licenses and produces this font on the local machine. Two restricted-license faces (CF Industrial Fabrics and Stranger Friz) remain excluded. The old corrupted main UI installer is repaired and delegates its font section to this separate installer. It requires Python 3 and may install `fonttools` and `brotli` through pip if unavailable; no font binaries are published through chat/GitHub.

**Install from `The-Pall\platform`:**

```powershell
git pull --ff-only
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\The_Pall_Stage3_Record_Art_Patch.zip" -DestinationPath "." -Force
powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip"
npm run verify:stage3-record-art
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

Install Python 3 if the font installer reports that it is missing; the converter is designed to run only on the owner-supplied font file. Stop on a failed install; do not hide a failing converter by silently loading the original malformed OTF. Restart the web server and refresh. **No database migration or character reset is needed.**

**Upcoming audio gate:** Once the owner's depot scene / this Stage 3 presentation is accepted in the running browser, start a small first sound batch: workshop forge ambience, metal-stamp/hammer impacts, paper interactions and depot machinery/yard ambience. Prefer clean, loopable WAV source (or OGG if already mastered) with separate action cues. Do not wire global music or voiced NPC dialogue without their own design approval.

### Owner fonts — direct WOFF2 installation (supersedes Python conversion, 2026-10-28)

**Current requirement:** The owner can supply **New Standard Regular as a genuine TrueType-outline WOFF2**. The originally supplied `NewStandard-Regular.otf` is OpenType/CFF and fails Chromium's OTS `CFF CharStrings INDEX` validation. Repacking that same broken CFF in a WOFF2 wrapper will not fix it. The corrected export must have TrueType quadratic outlines (WOFF2 header signature `wOF2`, sfnt flavor `0x00010000`). The supplied Bebas Neue archive already has working TTF choices; Beyond Wonderland is permitted under its supplied readme. CF Industrial Fabrics and Stranger Friz are not included because the supplied licenses restrict commercial use.

**The previous Python/fonttools converter installation instructions are obsolete.** The replacement `scripts/install-owner-fonts.ps1` accepts `-NewStandardWoff2` directly and performs no font conversion or Python/pip installation.

Once the owner provides `NewStandard-Regular.woff2` and saves it to Downloads, run this from `The-Pall\platform`:

```powershell
git pull --ff-only
powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-fonts.ps1 `
  -NewStandardWoff2 "$env:USERPROFILE\Downloads\NewStandard-Regular.woff2"
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

**If the Bebas/Beyond fonts need reinstalling too**, add `-KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip"` to that same font installer command. The full UI kit installer also accepts `-NewStandardWoff2` and passes it through. The install script checks that the file is actually a TrueType-outline WOFF2 rather than a renamed/CFF OTF. A browser rendering check is still needed to confirm the font looks correct.

Until the corrected WOFF2 is supplied, the game's reading font falls back to Georgia. This is safe, but `verify:owner-ui-kit` will report the missing font file rather than claiming installation success. No Python, character reset or database migration is needed for typography changes.


### New Standard from the owner's original OTF — Node-only path (2026-10-28, latest)

The owner supplied the original `NewStandard-Regular.otf` again alongside the other decorative fonts. Inspection confirmed OpenType/CFF outlines and the embedded New Standard SIL OFL 1.1 notice; this is **not** a browser-ready WOFF2 and merely renaming it would reproduce the Chromium error. This supersedes the earlier instructions to install Python or obtain a new WOFF2 export.

**Implemented:** `scripts/install-owner-fonts.ps1` now accepts the owner's **original UI-kit ZIP** (which already contains this OTF) or `-NewStandardOtf` as input. When only an OTF is supplied, it uses the existing Node.js/npm installation to temporarily install pinned `fonteditor-core@2.6.3` outside the repository, converts CFF to real TrueType outlines, encodes WOFF2 and checks the resulting header/glyphs. The original binary and resulting WOFF2 remain **local only**. No Python/pip, project dependency changes, lockfile edits or uploaded font binaries. Conversion requires npm registry access once, and remains unverified against the owner's local Windows/browser environment.

From `The-Pall\\platform`, using the ZIP you already had:

```powershell
git pull --ff-only
powershell -ExecutionPolicy Bypass -File .\\scripts\\install-owner-fonts.ps1 `
  -KitZip "$env:USERPROFILE\\Downloads\\The-Pall-UI-Kit-v1.zip"
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

Restart Vite afterward. An equivalent alternative is `-NewStandardOtf "C:\\path\\to\\NewStandard-Regular.otf"` when only the font file is available. `-NewStandardWoff2` remains available if the owner supplies a genuine TrueType-outline WOFF2. The UI-kit-wide installer delegates to this script and also uses Node, not Python. If conversion fails, do not load the broken CFF OTF; the CSS still falls back safely to Georgia.

**Licensing:** New Standard embeds SIL OFL 1.1; the original Bebas Neue archive also includes OFL, and Beyond Wonderland is permitted by its supplied readme. The newly uploaded CF Industrial Fabrics TTF explicitly says *free for personal use, commercial use requires purchase* in its name metadata. The Stranger Friz family was accompanied by a *personal use only* notice in the original ZIP. Neither restricted family is imported into a build without the owner's appropriate commercial licenses.

The font binaries supplied to the chat are only inspected, **not distributed** as downloadable artifacts or committed to GitHub.


### Fonts without the original UI kit ZIP — standalone OTF workflow (2026-10-28)

The owner no longer has the original `The-Pall-UI-Kit-v1.zip`, but supplied `NewStandard-Regular.otf` directly in the conversation. **The ZIP is not required** for updating New Standard. Save that exact owner-uploaded attachment to a Windows directory (such as Downloads), then run from `The-Pall\\platform`:

```powershell
git pull --ff-only
powershell -ExecutionPolicy Bypass -File .\\scripts\\install-owner-fonts.ps1 `
  -NewStandardOtf "$env:USERPROFILE\\Downloads\\NewStandard-Regular.otf"
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

The script converts the original OpenType/CFF file to a TrueType-outline WOFF2 with Node/npm in a Windows temporary directory; **no Python or original ZIP needed**. It leaves the already installed UI logo, frames, buttons, Bebas Neue and Beyond Wonderland unchanged. If the entire UI kit was deleted (not just the ZIP), these other assets must be restored separately—this standalone-font command cannot recover missing artwork or missing Bebas files.

The other uploaded standalone fonts do not replace the New Standard source. CF Industrial Fabrics and Stranger Friz remain excluded because of their supplied personal/non-commercial licenses. Do not share font binaries through GitHub or the conversation. The converted WOFF2 is installed only in the owner's local static asset directory; full browser success awaits local testing. On a conversion error, stop and return the installer output so the converter itself can be corrected.

### Stage 3 compact records and Stage 4 colder depot (2026-10-28)

The owner provided a screenshot showing Stage 3's printed **Returned Reference Plate / Cancellation Slip** evidence making the iron dialogue frame so tall that it overlapped the interactive props and generated an internal scrollbar. The layout now constrains **only those two printed record pages** to a maximum illustration height of 240px (300px when the scene stacks on mobile), centres them and makes the record-specific frame fit its content without a scrollbar. The **Review journal** control has moved to a separate compact strip below the workshop illustration, outside the frame. Other conversation pages keep their independent tall-copy safeguard. Both tabletop objects remain separately clickable; no dialogue, choice, journal entry or reward text changed.

The owner also supplied `depot_background_cold.png` to replace the prior warm depot image. It has been losslessly converted to a pixel-identical WebP with its original 1774×887 composition. The new file is **not** baked into the code repository: download `The_Pall_Stage4_Cold_Depot_Background.zip` from this conversation and unpack from `The-Pall\\platform` to create `apps/web/static/locations/depot/depot-background-cold.webp`. The Stage 4 scene now explicitly references this new file so cached warm assets aren't reused.

Run from `platform` after downloading the attached ZIP:

```powershell
git pull --ff-only
Expand-Archive -LiteralPath "$env:USERPROFILE\\Downloads\\The_Pall_Stage4_Cold_Depot_Background.zip" -DestinationPath "." -Force
npm run verify:depot-art
npm run verify:stage3-record-art
npm run check:web
npm run build -w @the-pall/web
```

Then restart Vite and refresh. This change does not require re-installing the owner fonts, a database migration, or creating a new character. Stage 3 reading page checks and Stage 4 art checks are updated. Source assertions and image pixel comparison were performed; runtime Svelte compilation and browser layout still require the owner's local verification.

### Millhand Stage 4 — Commerce / Contracts physical office (2026-10-28)

Owner confirmed the Commerce branch had already been approved and supplied **two** book images and the previously uploaded Commerce location background. The approved [Disputed Docket route](../docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md) is not reauthored.

`apps/web/src/lib/MillhandContractsScene.svelte` now renders the owner's painterly office background plus **only** two independently clickable physical book cutouts: `death-register.webp` and `wage-record.webp`. They have text-only labels and a restrained 1.8% hover response. The previous four schematic tile placeholders are not shown. The scene retains all server-saved actions and the approved seven-line Contracts Clerk dialogue, the seal-check/written-complaint choice, and personal journal. No client-side click bypasses the approved action sequence. `MillhandSecondJobScene.svelte` now routes Commerce explicitly to this component and Depot to its own previously approved scene. Investigation remains the other unchanged branch.

The three images are provided as the separate ZIP `The_Pall_Stage4_Commerce_Asset_Patch.zip`, with pixel-identical lossless WebP conversions. The archive contains exactly:

- `apps/web/static/locations/contracts/contracts-office.webp` — shared Commerce location background
- `apps/web/static/locations/contracts/death-register.webp`
- `apps/web/static/locations/contracts/wage-record.webp`

**Install from `The-Pall\platform` after saving that attached ZIP in Downloads:**

```powershell
git pull --ff-only
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\The_Pall_Stage4_Commerce_Asset_Patch.zip" -DestinationPath "." -Force
npm run verify:commerce-art
npm run verify:stage-four
npm run check:web
npm run build -w @the-pall/web
```

Restart the frontend and refresh your existing Commerce-route character; no database migration or new character is needed.

**Editorial distinction:** The artwork is explicitly titled *Death Register* and *Wage Record*. The approved Commerce dispute's two sealed records are **compensation** and **contract-charge** entries, not those two book titles. The physical books are shown under their real visual names, and the approved comparison is presented in dialogue without changing its lore. The owner can decide later whether these are the permanent visual objects for this route; do not invent replacement record types or change the approved script to make the images fit.

Static source and artwork pixel checks have been performed. A local Svelte compile, API transaction and browser layout test have not been run through the GitHub connector.
