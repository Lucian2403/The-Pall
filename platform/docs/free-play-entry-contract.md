# Step 1: tutorial completion to Free Play entry

This PR establishes **the boundary, not the playable city**. The approved
Stage VIII notice, closing line, saved home phase, rent amount and journal task
are unchanged. No time progression, wages, XP, jobs, travel or player economy
is enabled.

## Routes

- `/characters/:id/home`: physical rented room; its bed, chest and Journal
  still work after Stage VIII.
- `/characters/:id/overview`: the city overview, using the existing HUD and Inventory/Journal.
  The temporary Home entry panel is removed; the approved announcement is the only first-entry modal.
- `/characters/:id`: independent Character record and skills.
- Character selection defaults to `/overview` only for saved `Stage VIII +
  COMPLETED` characters; all others still use the Character sheet.

The overview page loads `GET /api/characters/:id/free-play` and may render
the city entry only after a successful owner-scoped 200. The API requires a playable
origin, Stage VIII COMPLETE status, and an exact saved home phase/identifier/
origin match. It returns `409 free_play_not_unlocked` for unfinished or
rewound characters. A missing or non-owned ID returns 404 without exposing an
existing character. Authentication failures return 401.

No browser-supplied "tutorial completed" bit can open Free Play.

## One-time Free Play announcement

The optional `free_play_intro_seen_at` is on `player_characters`. GET
reports `announcementSeen`, initially false for all existing completed saves.
The server exposes an idempotent `POST /api/characters/:id/free-play/announcement`
accepting JSON `{}`. The overview displays the owner-approved “You're on your own now.” modal when GET reports `announcementSeen: false`. **Enter the City** posts the acknowledgement; the modal remains open until the server confirms success. Refreshes or later visits after acknowledgement skip the modal. After acknowledgement the city overview mounts directly, without a second welcome panel. The announcement does not enable ordinary gameplay.

## City overview foundation

- `GET /api/characters/:id/free-play/city` uses the same owner, origin and saved Stage VIII gate as Free Play GET, plus a persisted announcement acknowledgement. An unseen announcement returns 409 `free_play_announcement_required`.
- The shared `CityOverviewSnapshot` / `CityPointOfInterest` types separate stable POI IDs, display names, availability, and supported page destinations.
- The server-owned `city-poi-catalogue.ts` currently exposes only the existing rented room (`starter-rented-room`). Adding a POI requires an approved location, availability and working route; unknown destinations are not navigable.
- `CityOverview.svelte` is a replaceable, design-neutral list. It fetches only after acknowledgement, handles loading/errors/retry, and aborts stale requests on character changes.
- Opening the rented-room route preserves its existing behaviour. It is page navigation, **not** a new travel action, timer, relocation or economy mutation.
- Map coordinates, districts, art, travel graph, additional POIs and future rules are deliberately unspecified until owner design approval. No additional migration is required.

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

Later work: owner-approved city overview design and additional POIs, Help access to the announcement, then travel clocks. Those future features must not invent
saved location, wages, XP or rent deadlines at this step.
