# M0.3 — Reproducible installation and build gate

**Status:** awaiting owner verification on local Node.js 24 + Windows PowerShell.  
**Context:** M0.2 API/DB, browser action/refresh and API restart all passed locally and are documented in [M0_2_QA_EVIDENCE.md](M0_2_QA_EVIDENCE.md). This gate adds *no game rules* or UI redesign.

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
