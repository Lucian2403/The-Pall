# M1.2 — Approved introductory screens and read-only background selection

**Status (2026-10-26): implementation candidate committed; browser/API build and owner visual QA pending.** This does **not** authorize character creation or any game-design rule that remains open.

## Owner QA result — 2026-10-26

The owner confirmed that login, the approved universal world introduction, six-background selection and selected background's character-preview section **render and function locally**. **Browser presentation/flow: PASS (owner-reported).**

The `npm run verify:character-catalogue` command exited with `FAILED: fetch failed`. This is a **transport/connection failure**, not a result of the anonymous or forged-identity assertions; the API auth-negative test is therefore **NOT YET VERIFIED**. The unrelated npm warning `Unknown user config "_email"` does not explain a Node `fetch` connection failure.

**Troubleshooting:** The verifier calls `http://127.0.0.1:8788` directly (the same target as Vite's `/api` proxy). The owner should keep `npm run dev:api` running in a separate terminal, verify `http://127.0.0.1:8788/health`, then run `npm run verify:character-catalogue` from a third terminal. Commit `e12b9a7d25e238609e2b5a2ea0463e2e8b4a92de` adds diagnostic error codes and an explicit health check. Do not claim this security smoke test passed until the output confirms it.

## Source of truth

- `docs/05-gameplay/onboarding/world-introduction.md`: approved universal world opening following first authentication.
- `docs/05-gameplay/onboarding/background-selection-introduction.md`: approved six-origin headings, descriptions, advantage lines and closing copy.
- `docs/01-player/character-creation.md`: six origins, Male/Female portrait choice, four attributes 5, max Health 50, +3 origin Major Skill, Basic Clothes, Crude Small Bag, 20 coins.
- `docs/05-gameplay/onboarding/millhand/INDEX.md` and the other five origin folders: approved post-selection Stage 1, **not** rendered by this read-only preview.
- `docs/00-vision/art-direction.md`: current hand-painted, restrained detail, small in-scene dialogue direction; these screens remain **provisional presentation**.

The typed UI copy in `apps/web/src/lib/approved-introductions.ts` was generated from the **exact approved Markdown text**. `npm run verify:canonical-copy` reconstructs the Markdown and fails if anything drifts. It was independently compared against current GitHub documents at commit creation.

## What is implemented (read-only)

- After a **successful sign-in**, `/account` routes to `/introduction`.
- `/introduction` checks `/api/me` before rendering the approved world introduction; unauthenticated visitors see a sign-in prompt; the full text is displayed with original paragraph order and emphasis.
- Continue to `/backgrounds`: shows all six approved selection descriptions **verbatim**, and background buttons for an unsaved preview.
- `/api/characters/catalogue` is a read-only, **Better Auth session-protected** route; starting attributes, coins, items (display names only) and Major Skill bonus come from `@the-pall/game-core`, not fabricated in the browser.
- A selected origin reveals Male/Female **portrait variant choice** and approved starting facts. **No portrait art file is treated as final**; pending assets are explicitly labelled. No database table or `POST /characters` is added.
- The M0 fixture and M1.1 authentication flows remain separate.

**Temporary behaviour:** every new successful sign-in routes to the world introduction. Whether first-intro completion is persisted, skipped or replayed remains **open**. Current buttons permit revisiting the world and background screens without fabricating a durable flag. These pages are not production security boundaries for any secret lore; however, their UI waits for account authorization, and the API endpoint rejects anonymous callers.

## QA steps on the owner's Windows workstation

From the **Git checkout** `The-Pall\platform`, not the old ZIP:

1. Stop old API/web watchers with Ctrl+C; keep PostgreSQL and Docker running.
2. `git pull --ff-only`
3. `npm run test:unit`
4. `npm run check:web` — **first** checks exact intro-copy parity and **then** Svelte/TypeScript diagnostics.
5. `npm run build -w @the-pall/web`
6. Start `npm run dev:api` in Terminal A; start `npm run dev:web` in Terminal B.
7. Third terminal: `npm run verify:character-catalogue` — expect PASS for anonymous and forged identity requests; no game or DB modifications.
8. Open `http://127.0.0.1:5173/account`, sign in with your existing verified test account. Expect navigation to `http://127.0.0.1:5173/introduction`.
9. Read the world introduction, compare paragraph order/wording with source Markdown; continue to `/backgrounds`.
10. Confirm **six** origin descriptions, each Advantage paragraph and closing text. Click each origin; chosen preview matches origin +3 Major Skill. Switch Male/Female; text/portrait-variant tag changes, underlying starting stats do not.
11. Refresh the background page. Confirm it checks session again, then offers read-only preview; no character created or grant repeated. The selection itself need not persist.
12. In an incognito browser window with **no session**, visit `/introduction` and `/backgrounds`; expect sign-in prompts. Check `/api/characters/catalogue` there returns HTTP **401**.
13. Optional M0/M1.1 regression: `npm run verify:api` (will increment the **test** counter), `npm run verify:auth-unauthenticated`.

**No `npm install` or database migration is required** for this M1.2 UI-only source change. If `npm ci` is run to validate lockfile portability, stop watchers first, and don't delete Docker volumes. The installed dependency tree should remain reproducible.

## Report back

- Unit / exact-copy / Svelte / build results.
- Successful login → `/introduction`, introduction → `/backgrounds`.
- Six backgrounds shown, correct Male/Female preview, right starting stats.
- Anonymous UI/API denied.
- Any screenshot or console error, **without cookies or credentials**.

**Gate remains open** until these checks and owner visual review pass.

## Still open; not implicitly approved

- Character slots, naming/uniqueness, deletion and recovery, duplicate origins and staged availability of as-yet-unintegrated origin chapters.
- How to persist the first-read status and whether/when it can be skipped or replayed.
- Portrait art, equipment-layer files and final item IDs/weights/durabilities.
- Authenticated character creation DB transaction, ownership, slot-concurrency and idempotency tests (next milestone).

The implementation must not replace an approved original sentence with a gameplay-oriented summary or infer a definitive cause for the Plume.
