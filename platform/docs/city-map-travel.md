# Grand Cylinder City map and local travel

## Installation
From `platform` run `npm run city-travel:migrate` against the same local database as the API. Restart the API and web development server. Migration 0025 is additive and idempotent; it also applies 0024 if needed. No coin, XP, combat or onboarding data is modified.

## Catalogue and artwork
`apps/api/src/city-poi-catalogue.ts` is the source of truth: ID, name, description, icon, normalized position, display order, availability and relative character scene destination. Nine names are confirmed by the owner's screenshot; the three remaining names are not present in the existing registry or supplied location workbook. Only Home has a usable post-introduction scene. Clinic and other tutorial-only scenes are not normal Free Play destinations. Do not map unavailable POIs to those tutorial routes.

`apps/web/src/lib/city-map-assets.ts` centralizes the asset switches and paths:
- `apps/web/static/locations/city/map.webp` — final artwork; enable `useFinalMap`. The separate `map-placeholder.svg` is the fallback.
- `apps/web/static/locations/city/poi/<poi-id>.webp` — individual transparent icons; enable `useFinalIcons`. Unicode symbols remain the fallback.
- `apps/web/static/audio/city/city-ambience.mp3` and `walking-ambience.mp3` — enable `enableAmbience` only after the assets arrive. The map uses global sound/volume settings and a single scene-owned loop with sequential fade-out and fade-in (450 ms each). Missing files are non-blocking.

For final positioning set config width/height to the artwork's actual pixel dimensions. Open the map in the dev server, enable Calibrate, click the marker's building anchor, copy its normalized x/y and edit the POI entry. The calibration control is excluded from production. Markers stay screen-size and coordinates never use browser viewport dimensions.

## Travel
The provisional configuration uses 1400 × 1000 source pixels, 0.02 distance units/pixel, 1.4 units/sec, 2 sec minimum, and round up to 1 sec. Distance uses Euclidean original-image geometry; no street path is drawn. Update the global scale/speed rather than per-pair times.

`GET /api/characters/:id/free-play/city` returns the catalogue, server time, current location, revision and active journey. It reconciles due arrivals under the existing character row lock. `POST .../city/travel` requires an explicit destination, expected revision and request UUID. No client clock authorizes arrival; the timer is presentation only. A duplicate request cannot start a second journey. Arrival persists exactly once on the next authorized read/command, even after closing the browser. The current scene resolver uses the saved physical location; direct Home access and Home actions are blocked while away or walking. Developer Stage VIII rewind clears only the selected character's travel state.

No travel fee, stamina use, random encounters or rewards. Future destination scene APIs must enforce physical presence before performing gameplay actions; no non-Home scene is enabled in this increment. A journey can be exercised with test-only POIs in the PostgreSQL and browser harnesses.

## Validation
`npm run verify:free-play-entry` includes pure geometry, timing and entry contracts. The Free Play GitHub workflow runs API and Svelte typechecks, build, real PostgreSQL lifecycle and city travel concurrency tests and a Chromium smoke test at 1440, 390 and 320 px with a test-only route. Actual owner asset audio and artwork calibration are pending.
