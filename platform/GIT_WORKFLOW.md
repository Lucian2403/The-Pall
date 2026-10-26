# The Pall — Git workflow after the M0.2 ZIP prototype

**Source of truth:** `Lucian2403/The-Pall`, branch `main`, folder `platform/`. The older `The_Pall_Platform_M0_2_Guided_Setup` ZIP is an independent download, **not** automatically a Git checkout. The first move requires one clone; subsequent changes use `git pull --ff-only`.

## One-time move to tracked source (Windows PowerShell)

1. Keep the working ZIP folder as a backup. In its API and web terminals, use **Ctrl+C** to stop those two app servers. **Keep the existing Docker PostgreSQL container running**; this avoids a second Docker Compose project trying to bind port **5433**.
2. Open PowerShell in the parent folder where you want your Git checkout. Run:
   `git --version` (if missing, install Git for Windows) and then `git clone https://github.com/Lucian2403/The-Pall.git`. If it asks for authorization, authenticate to your own GitHub account. If this directory already contains a tracked `The-Pall` checkout, **do not clone on top of it**: enter it and use `git pull --ff-only` instead.
3. Enter the application root: `cd The-Pall\platform`.
4. **Local-only config:** if you customized the old ZIP's `.env`, copy that file into `The-Pall\platform\.env`. Otherwise run `Copy-Item .env.example .env`. **Never commit `.env`.**
5. `npm install` (the repository does not yet contain a verified `package-lock.json`; the lockfile still needs review/commit as a separate M0 gate).
6. `npm run test:unit`.
7. First terminal: `npm run dev:api` (leave open).
8. Second terminal, also in `The-Pall\platform`: `npm run dev:web` (leave open).
9. Third terminal in `The-Pall\platform`: `npm run verify:api`.
10. Verify the test page still responds at `http://127.0.0.1:5173`. **No database reset or re-migration is required if the existing Docker database and schema remain running from the ZIP setup.**

If the old database is stopped and you intentionally want the **new Git checkout to own its own separate disposable fixture database**, ensure the old container no longer binds port 5433 before running `npm run db:up`, then `npm run db:migrate`. This starts a new Docker Compose project and may show a **new fixture count**. Do not use `docker compose down -v` on the old project unless you explicitly want to delete that database volume.

## Normal updates after the first clone

In PowerShell, from the Git repository root `The-Pall` (one level above `platform`):

```powershell
git status --short
git pull --ff-only
cd platform
npm run verify:api
```

If package files changed, run `npm install` before starting the app. Check for a new required migration before running it. `git pull` **does not automatically restart** already running Node servers; restart them with Ctrl+C then `npm run dev:api` / `npm run dev:web`.

Always keep local data/config outside Git and avoid `git reset --hard` or deleting the old folder as a troubleshooting shortcut.

## Fix in this commit

The M0.2 verifier now compares the original and retried responses using structural object equality (`node:assert/strict`) instead of `JSON.stringify` byte order, then independently queries PostgreSQL to ensure the counter **and revision** have not advanced twice. The real API code and database schema remain unchanged.

**Validation boundary:** the repaired verifier was tested against a mocked response with reordered JSON properties, and the GitHub copy was compared byte-for-byte to the patched local source. The owner's actual Docker-backed run after pulling is the remaining verification step.
