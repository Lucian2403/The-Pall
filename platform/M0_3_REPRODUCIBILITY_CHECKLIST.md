# M0.3 — Reproducible installation and build gate

**Status:** Node 22 run passed build/tests, but Node 24 runtime parity is **still required** to close M0.  
**Context:** M0.2 API/DB, browser action/refresh and API restart all passed locally and are documented in [M0_2_QA_EVIDENCE.md](M0_2_QA_EVIDENCE.md). This gate adds *no game rules* or UI redesign.

## Execution evidence — 2026-10-26 (owner-reported)

**Four command sequence completed successfully** on Windows PowerShell:
- `npm ci`: installed 173 packages; no installation failure.
- `npm run test:unit`: 4/4 contracts and 2/2 game-core tests passed.
- `npm run check:web`: Svelte reported zero errors and zero warnings.
- `npm run build -w @the-pall/web`: Vite client and SSR builds succeeded. `adapter-auto` displayed its expected informational notice because no hosting platform is selected.

**Repository check:** `platform/package-lock.json` is present in the GitHub default branch (lockfile v3). This establishes repository tracking, not necessarily a full fresh-clone test.

**Blocking runtime discrepancy:** the command output reports **Node v22.20.0 and npm 11.6.1**, but `platform/package.json` requires **Node >=24 <27**. `npm ci` reports `EBADENGINE`; it remains a warning, so the tests pass, but full M0.3 acceptance is **not met** until repeated under Node 24. Do **not** loosen the engine range simply to hide this warning.

**Separate non-blocking warning:** npm config `_email` is obsolete; it does not cause the test or build failures. Do not advise removing unrelated npm config blindly.

**Remaining action:** use Node 24 in a new terminal and rerun `npm ci`, `npm run test:unit`, `npm run check:web`, `npm run build -w @the-pall/web`; confirm the prior local API/browser checks remain valid under that runtime. No game rules or new features are part of this gate.

## A. Capture and publish the dependency lockfile

**One-time:** open PowerShell in the already working **Git checkout** folder `The-Pall\platform`. Do not use the old ZIP folder.

```powershell
git pull --ff-only
node --version
git status --short
Test-Path .\package-lock.json
```

`node --version` must report `v24.*`. `Test-Path` prints `True` if `npm install` previously generated the lockfile.

If `Test-Path` reports `False`, generate the lockfile (internet required, no application startup required):

```powershell
npm install --package-lock-only
```

**Review & publish:** only the package lockfile should be staged. Check that no `.env`, secrets or `node_modules` are staged.

```powershell
git add package-lock.json
git diff --cached --stat
git commit -m "Lock platform M0 dependencies"
git push origin main
```

If the lockfile was already tracked and unchanged, a commit may say `nothing to commit`; that is fine **only if** the file is already visible at `platform/package-lock.json` on GitHub. If `git push` is rejected because main changed remotely, do not force push; report the error.

## B. Prove the lockfile makes a clean installation

Stop **both** `npm run dev:api` and `npm run dev:web` with `Ctrl+C` before `npm ci`. **Leave Docker PostgreSQL running**; do not delete/initialize volumes or reset the counter.

From `The-Pall\platform` run:

```powershell
npm ci
npm run test:unit
npm run check:web
npm run build -w @the-pall/web
git status --short
```

Required: zero failures; `npm ci` must use the committed lockfile without regenerating or modifying it. `git status --short` should not show surprising tracked-code changes. `check:web` typechecks Svelte; `build -w @the-pall/web` checks production client compilation. Deployment-specific adapter warnings may be non-fatal and require later hosting choices.

In two terminals, restart applications from the same checkout:

```powershell
npm run dev:api
```
```powershell
npm run dev:web
```

Refresh `http://127.0.0.1:5173` and confirm the persisted value is still present. From a third terminal, optionally run `npm run verify:api` again (this deliberately increments the *test* counter). The Postgres fixture is not live player data.

## PASS criterion and handoff

M0.3 passes only when:
- The lockfile is committed to GitHub.
- `npm ci`, pure tests, Svelte check and web build all succeed from it under Node 24.
- The API/web app still start, with the previously persisted fixture state intact.

After passing, record the observed outputs and commit hash; mark **full M0 as technical foundation passed (local development only)**. That does *not* certify production auth, deployment, scale, economy, completed Millhand gameplay or operational backup/restore.

**Next:** M1 integrates the already-approved Guther dialogue and Gate 02 platework into a persistent, server-authoritative flow without inventing still-open game mechanics.
