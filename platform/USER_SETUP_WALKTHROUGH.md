# The Pall — Beginner's setup checklist (M0.2)

This is only a local development test. No MMORPG accounts, market, combat, characters or payments exist here.

## What you need
- Docker Desktop (already installed): it runs the PostgreSQL database. Keep it open while testing.
- Node.js 24 LTS: executes our API, installs the dependencies and runs the test page. npm comes with Node.
- The M0.2 ZIP: the source and configuration.
- A terminal: PowerShell on Windows, Terminal on macOS.

## Do the steps in this order
**1. Install Node:** https://nodejs.org/en/download. Choose the Node 24 LTS installer for your system. Restart the terminal after installation.

**2. Verify:** type `node --version` (must start `v24.`), `npm --version` (a number) and `docker compose version` (a version). Start Docker Desktop first. If any command fails, stop and send the output.

**3. Unzip and open folder:** extract ZIP, enter `The_Pall_Platform_M0_2_Guided_Setup`, and open a terminal there. Confirm you can see `package.json` and `compose.yaml`.

**4. Create local settings:** on Windows `Copy-Item .env.example .env`; on macOS `cp .env.example .env`. This saves the local database address and app ports.

**5. Install project tools:** `npm install`; this downloads exact packages declared by the project, including Svelte/TypeScript/Fastify. Do not install them individually.

**6. Start PostgreSQL:** `npm run db:up`; you should eventually see a running `postgres` service. Use `npm run db:status` to confirm status.

**7. Create test table:** `npm run db:migrate`; expected final line: `M0 test database initialized.`

**8. Run simple tests:** `npm run test:unit`; expect all tests pass. If the number changes after code updates that's fine; there should be zero failures.

**9. API:** `npm run dev:api` in Terminal A. Keep it running. Visit http://127.0.0.1:8788/health; expect status `ok`.

**10. Web page:** open Terminal B in the same folder, run `npm run dev:web`, keep it running, browse http://127.0.0.1:5173. It is a plain connection-test page, not the approved workshop. Click its button and check value rises once.

**11. API safety:** open Terminal C in the same folder, run `npm run verify:api`. Expect several `PASS:` lines, ending with `Local API + DB verification passed.`

**12. Restart test:** record value, stop API (Ctrl+C), restart with `npm run dev:api`, refresh browser and check value persisted.

**13. Stop services:** Ctrl+C on both development terminals; optionally `npm run db:stop`. Data persists unless intentionally deleted.

## What to send back
Send: operating system; outputs of steps 2, 7, 8 and 11; whether step 10 increased the value; whether step 12 retained the value. Screenshots are optional unless something fails.

## Errors
- `node` not recognized: install Node 24, close/reopen terminal.
- Cannot connect to Docker: open Docker Desktop, wait until Engine shows running.
- `Missing env file`: step 4 was skipped; ensure you're in the project folder.
- Database not found: repeat steps 6 and 7; confirm port 5433 isn't occupied.
- `EADDRINUSE`: ports 8788 (API), 5173 (web) or 5433 (database) may already be in use; send error before changing ports.
- `API unavailable` on the page: check Terminal A and the `/health` URL.
- `npm install` fails: copy the full error, and do not keep guessing versions.
