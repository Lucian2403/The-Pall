# M1.2 — Persistent account-owned characters: local QA

**Status (2026-10-26): IMPLEMENTATION CANDIDATE COMMITTED, NOT YET RUN/APPROVED ON OWNER'S POSTGRESQL ENVIRONMENT.** The existing M1.1 auth flows and approved intros remain unchanged.

## Boundary and approved content

- Initial policy carried forward from the owner's agreement to proceed: **six slots per account**, normalized globally unique names **3–24 grapheme characters** with letters and internal spaces, apostrophes or hyphens; no renaming or deletion in M1.2; multiple same-origin characters allowed.
- Exactly six origins, two sexes, STR/DEX/INT/RES = 5, max/current Health 50, **20 coins**, +3 **one starting Major Skill**. Other Major Skills are not assumed to have levels or XP; the record stores only the approved origin bonus.
- **Basic Clothes ×1** and **Crude Small Bag ×1** are recorded *once* as non-tradable **starter item requirements**, not actual usable equipment. Their game item IDs/slots/capacity/durability are not authored, so no fictional inventory item rows exist. This is a consciously incomplete inventory gate before playable jobs.
- Each character is persisted with its own correct origin starting hub and tutorial Stage 1 **NOT_STARTED**, but no Stage 1 dialogue or reward is executed. All six origins can be saved for tests even while their live tutorial implementations are pending; the UI warns that occupied slots cannot yet be deleted.
- The world introduction and all six background descriptions still come from user-approved canonical Markdown; `npm run verify:canonical-copy` catches drift.
- These policies are **local-development starting rules**, not an irrevocable public release/billing/privacy decision.

## 1 — Pull, compile and migrate (PowerShell, `The-Pall\platform`)

Keep Docker Desktop and the **existing Postgres container** running. Stop only old API and web Node dev watchers first (`Ctrl+C`); don't touch Docker volumes or issue `down -v`.

```powershell
git status --short
git pull --ff-only
npm run test:unit
npm run check:api
npm run check:web
npm run build -w @the-pall/web
npm run characters:migrate
```

**Important:** `npm run characters:migrate` is additive and connects through **the same `DATABASE_URL` in ignored `.env` as the API**; it is not Docker Compose based. No need to start another PostgreSQL container. Expect all three `player_character*` tables and a **PASS** line. It is safe to run again but **does not** alter existing character rows or remove accounts. The script will **fail before migration if Better Auth `user` table isn't available**. If any check fails, do not continue and report the exact error (redact secrets).

## 2 — Start one API and one web process

In two separate PowerShell terminals, both at `The-Pall\platform`:

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

Don't start duplicate API processes on port 8788. In a third terminal run:

```powershell
npm run verify:characters-unauthenticated
npm run verify:character-catalogue
npm run verify:auth-unauthenticated
npm run verify:api
```

`verify:api` increments **only** the old development fixture counter by design. The character verifier performs **no account-owned mutations**; it checks HTTP 401 for anonymous roster/detail/create and forged headers/cookie.

## 3 — Create and select a real local test character

1. Sign in at `http://127.0.0.1:5173/account`. Read the approved world introduction. Continue to **Your characters** at `/characters`; it should be empty for an account with no existing M1.2 character records.
2. Click **Create a character**. On `/backgrounds`, choose one of the six backgrounds, select Male/Female and supply a unique test name (for example `Mara Ashford`). Click **Create character** **only once**.
3. The app returns to **Your characters**, now with **1 of 6** occupied slots. Click **Select character**. Confirm name/sex/origin, four attributes at 5, Health 50/50, **20 coins**, **one +3 Major Skill**, **Basic Clothes ×1 and Crude Small Bag ×1 requirement**, origin-correct job hub, tutorial Stage 1 NOT_STARTED.
4. Refresh the character page and restart the API, then refresh again: the character should still be present and unchanged. Confirm no extra coins or +3 bonus from refreshing/selecting.
5. Duplicate names: on another character preview try the **same name with different capitalization**. Expect `name_taken`; no new slot consumed. Try an invalid name or append invented `coins`/skills using devtools only if familiar with API testing: no server grant should be possible.
6. Open an incognito browser window with **Account B**, verify its roster does **not** show Account A's character. Opening A's known `/characters/<id>` URL while signed in as B should return a generic **Character not found**. Account A must still see its own character.
7. Creating two different characters from the same account in two browser tabs with the same **stale roster revision** should create at most one; the other must report `stale_revision`. A fresh attempt after reloading should succeed if there is capacity. **Do not test six-slot overflow by filling slots unless willing to retain those six test characters. Deletion is intentionally not enabled.**

### Idempotent replay QA (optional, advanced)

If testing HTTP directly from your logged-in browser's developer console, make one `POST /api/characters` request with a single `requestId` (UUID) and `expectedRevision` obtained from `GET /api/characters`; repeat **the identical request**. Both return the **same character ID and grant data**, the account revision increases once, and only one slot is consumed. A changed request using the same ID returns `409 idempotency_key_reuse`. All mutation testing permanently consumes a slot; **do not test blindly**. Never paste personal auth cookies, passwords or tokens into chat.

### M1.2 post-creation outcomes

- Character selection is per-request / per-URL, **not a global "active character" flag** shared across tabs.
- Unavailable Stage 1 scenes are **explicitly labelled as not integrated**. Do not assume the proper approved narration was somehow executed or that a non-Millhand was redirected to Guther.
- Intro seen-once/skip/replay policy remains open; the current intro is replayable.
- Full 12 real portraits and usable equipped item instances remain a separate visual/item-definition gate.
- Existing M0 fixture tests are technical only and cannot grant coins or skills to player characters.

## Report

```text
Unit tests: PASS/FAIL
API typecheck: PASS/FAIL
Web typecheck: PASS/FAIL
Build: PASS/FAIL
Migration: PASS/FAIL
Anonymous API tests: PASS/FAIL
Create and select one character: PASS/FAIL
Persistence after restart: PASS/FAIL
Duplicate name blocked: PASS/FAIL
Account A/B isolation: PASS/FAIL
```

**Do not mark M1.2 persistent character creation complete until these owner-run checks pass.** This is local development, not a public production release security acceptance.
