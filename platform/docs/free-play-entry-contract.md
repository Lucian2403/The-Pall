# Step 1: tutorial completion to Free Play entry

This PR establishes **the boundary, not the playable city**. The approved
Stage VIII notice, closing line, saved home phase, rent amount and journal task
are unchanged. No time progression, wages, XP, jobs, travel or player economy
is enabled.

## Routes

- `/characters/:id/home`: physical rented room; its bed, chest and Journal
  still work after Stage VIII.
- `/characters/:id/overview`: separate normal Home **entry**, using the existing
  HUD and Inventory/Journal; ordinary activities are explicitly unavailable.
- `/characters/:id`: independent Character record and skills.
- Character selection defaults to `/overview` only for saved `Stage VIII +
  COMPLETED` characters; all others still use the Character sheet.

The overview page loads `GET /api/characters/:id/free-play` and may render
normal Home only after a successful owner-scoped 200. The API requires a playable
origin, Stage VIII COMPLETE status, and an exact saved home phase/identifier/
origin match. It returns `409 free_play_not_unlocked` for unfinished or
rewound characters. A missing or non-owned ID returns 404 without exposing an
existing character. Authentication failures return 401.

No browser-supplied "tutorial completed" bit can open Free Play.

## Announcement prepared for Step 2

The optional `free_play_intro_seen_at` is on `player_characters`. GET
reports `announcementSeen`, initially false for all existing completed saves.
The server exposes an idempotent `POST /api/characters/:id/free-play/announcement`
accepting JSON `{}`. The next PR will add owner-approved copy and call this
when the announcement is explicitly acknowledged. There is **no pop-up yet**.

### Migration

From `platform` with the same `.env` / `DATABASE_URL` as the API, run:

```powershell
npm run free-play:migrate
```

The script applies only the additive `0024_free_play_entry.sql` column, inside
a transaction. It preserves older characters, tutorial history, belongings,
coin balances, rent notice, and all receipts. Before migrating, Free Play GET
returns a clear `503 free_play_schema_missing` response. Stage VIII itself is
unaffected.

### Validation

```powershell
npm run verify:free-play-entry
npm run verify:stage-eight
npm run verify:character-home
npm run check:api
npm run check -w @the-pall/web
```

The dedicated GitHub Actions job also runs all Stage VI–VIII real-PostgreSQL
integration tests against a disposable `pall_stage6_test` database. Do **not**
point this test harness at a personal or production character database.

Later PRs: approved freedom announcement, normal Home dashboard, normalized
city map/locations, then travel clocks. Those future features must not invent
saved location, wages, XP or rent deadlines at this step.
