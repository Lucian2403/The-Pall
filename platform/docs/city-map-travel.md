# Grand Cylinder City map and local travel

## Installation
From `platform` run `npm run city-travel:migrate` against the same local database as the API, then restart API and web. Migration 0025 is additive and idempotent. It also applies 0024 if needed.

The separately supplied runtime asset pack must be extracted at the repository root. It contains `platform/apps/web/static/locations/city/map.webm` (original VP9, 1920 × 1080, 29.97 sec), `map.webp` (optimized 4096 × 2304 still from the 9600 × 5400 clean master), and 16 transparent WebP icons in `poi/`. Do not put the annotated map or the CoK project file in the runtime directory. The asset pack is not committed by the code-only connector. Without the pack, the existing schematic and glyph fallbacks remain functional.

## Map and catalogue
`apps/api/src/city-poi-catalogue.ts` is the authoritative 16-entry registry, in the supplied numbered order. The normalized anchor for each POI was measured from the midpoint of its red handwritten number on the annotated map; final gate and forest positions are provisional. Only Home has an implemented post-tutorial scene. Other locations are selectable but cannot initiate travel. Do not map them to tutorial scenes.

`apps/web/src/lib/city-map-assets.ts` centralizes map/image/video/icon references. Animated playback is muted, inline, looping and stationary. It shares the image and marker camera transform, is disabled for reduced-motion users by default, stops when the page is hidden or unmounted, and can be paused manually. A video failure falls back to the clean static map; an absent static image falls back to the schematic. No gameplay depends on decoding video. Zoom is 1–4× fitted view; panning clamps to artwork edges. Letterbox space at fitted zoom is intentional where aspect ratios differ.

For replacement artwork keep the same aspect ratio and camera framing; if geometry changes, recalibrate with the development-only Calibrate tool. Set source width/height to the reference master dimensions and adapt the distance scale to keep game travel independent of export resolution.

## Travel
The source geometry is 9600 × 5400. Scale is provisionally 28/9600 distance units per source pixel, maintaining the former 28-unit map width; walking speed 1.4 units/sec, minimum 2 sec, rounding up to 1 sec. No road pathfinding or wall collision. Geometry and distances are independent of camera zoom/pan and artwork file resolution.

GET /api/characters/:id/free-play/city returns the catalogue, server time, current location, revision and active journey; it reconciles due arrivals under the character row lock. POST .../city/travel requires explicit destination, expected revision and request UUID. Home access checks physical presence. Developer Stage VIII rewind resets the selected character's travel state. No travel fee, stamina loss, rewards or new encounters.

## Audio
City and walking ambience are disabled until supplied. Expected files are `static/audio/city/city-ambience.mp3` and `walking-ambience.mp3`.

## Validation
The Free Play workflow runs entry and geometry tests, API and Svelte checks, Chromium smoke tests at desktop, 390 and 320 px, and real PostgreSQL travel lifecycle tests using a test-only destination. The actual supplied video and icons require local browser testing after extracting the asset pack.

## City workspace visual pass
The city workspace uses its own scalable engraved nine-slice frame and procedural parchment grain in `static/ui-kit/city/`. No shared HUD or map/travel geometry is changed. Desktop panels use a 20:55:23 proportion with aligned heights; the directory scrolls internally, tablet details move below the map, and phone panels stack. The announcement review action remains accessible beneath the workspace. Map controls have compact beveled parchment styling and visibly disabled zoom-limit buttons. The browser fixture now checks layout at 1600, 1440, 1024, 390 and 320 pixels, and saves diagnostic screenshots. Actual owner map/video/icon assets remain local until committed separately.
