> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# Millhand v0.2 — user playtest UI/UX review and v0.3 direction (2026-10-22)

**Status: USER FEEDBACK RECORDED. v0.2 PRESENTATION NOT APPROVED. Proposed v0.3 direction is NOT yet an art-style lock or implemented feature.** This explicitly supersedes any interpretation that the local v0.2 visual presentation was accepted because 42/42 new tests and 49/49 unchanged combat tests passed. Those results establish function/integrity only.

## Verbatim design intent from player feedback
- The character/workshop interface is still an **artistic dashboard**, not a felt-in-world workshop. The existing right-hand workshop UI is weak; interacting primarily by typing/choosing 1–9 is inadequate. Number shortcuts may stay as convenience but must not be the primary interaction.
- Dialogue with Guther and smithing are only slightly differentiated. More substantial diegetic / spatial / contextual gameplay interaction is needed, not a prettier set of numbered choices.
- Basic clarity is nearly acceptable; **Journal is unacceptable** and side-sheet drawers for Inventory / Journal / Character must be replaced with real destinations/full pages.
- **Pacing is currently good**; do not add unnecessary steps. The player requests around **1.2 seconds of deliberate presentation delay for nearly every meaningful dialogue/work/interaction action**, leaving an interval for later sound effects.
- The two user-provided visual references (a **THE PALL** city overview / mobile mockup and an **Iron & Ash** city overview / mobile mockup) communicate preferred **structural layout and browser-game UI hierarchy**, **not a selected art style, game-system schema, NPC names, resources, buildings, currency or canonical quest content**. Do not import invented Focus/Ash meters, day number, lodging ID, report-to-Registrar quest, level, marketplace notices or other placeholder details.

## External references checked
- **Torn**: persistent navigable area list (city, jobs, items, property, etc), quick entry to dedicated destinations; responsive desktop/mobile navigation. Main lesson = stable wayfinding with real functional destinations, NOT Torn's specific appearance and NOT turning every in-world scene into an account dashboard. Source: https://wiki.torn.com/wiki/Sidebar and https://www.torn.com/ .
- **The Realm of Tidefall** at https://www.playtidefall.com/ : public material demonstrates emphasis on a persistent browser MMO with time-persistent production, trade, building and return-session decisions. Public site available, but no claim to have comprehensively inspected authenticated internal gameplay UI. Distinguish this maritime MMO from the separate solo RPG at tidefall.gg.

## Proposed structural correction — NOT art locked
A. **One persistent navigation system**: desktop left rail and slim top condition bar; compact mobile header + bottom navigation. Preserve location/scene as the visual center. Destinations must represent actual implemented mechanics. Avoid fake links and invented economy systems.

B. **Scene-first primary region**:
- Tutorial begins in approved Grand Cylinder City smithing workshop, not invented hub/home/registrar.
- Major illustrated workspace acts as a live scene. Docket, die rack, damaged blank, plate and tool/workbench can be spatial hotspots with real mouse/touch target (plus accessible text alternative and optional number shortcuts).
- Click a present scene object → inspect a focused object/detail → choose only lawful state-dependent actions; state engine remains authoritative. Visual variants reflect bent/straightened/replaced/flawed/verified work. No false interactive hotspots.
- Guther dialogue must be a coherent in-scene conversation distinct from tool work, with one current utterance, visually separated speech and physical actions. History remains accessible but not the main transcript. Avoid slide-out dashboard-style drawers.

C. **Dedicated pages, not side drawers**:
- Journal: full readable page with active job, completed entries, discoveries, dates only when canonical, and origin-specific knowledge; no state/debug field dump and no spoilers before Stage 3.
- Inventory: full page with actual starting Basic Clothes / Crude Small Bag and legitimate inventory slots, no fictitious objects.
- Character: full page using confirmed 5/5/5/5 attributes, 50 Health, 20 starting coins, Craftsmanship +3; don't invent bars from illustrative screenshots.

D. **Action feedback cadence**:
- Meaningful game-action commit: give immediate pressed/busy acknowledgement, let the existing server validate/commit as before, then reveal result after target **~1,200 ms** with a named future sound/visual cue slot.
- Navigation, journal/character browsing, accessibility interactions, undoable inspection/focus if noncommittal, refresh/reconnect should remain immediate. Avoid giving every tab change 1.2 seconds. Preserve originally approved work/job/world time mechanics; a CSS reveal delay is not invented in-world elapsed time or extra Stamina/cost.
- Prevent double-clicks while reveal pending; idempotent requestId + expectedRevision remain owned by the server. Display fresh canonical state after refresh without replaying rewards. Provide an accessible reduced-motion/reveal-skip mode and clear status announcements. Avoid disorienting mandatory blank waits.
- No sound files or approved sound palette yet; expose replaceable audio event hooks (dialogue response, work action, poor result, success, page navigation) without autoplay assumptions.

E. **Responsive**:
- Desktop: left game nav, top restrained approved stats, immersive central scene. Secondary contextual actions exist near actual subject, not a permanent generic status table.
- Mobile: no squeezed desktop sidebar, clear bottom tabs with subnavigation, large tappable hotspots and object detail/full pages.

## Art decision must be separate and deliberate
**No art style is approved yet.** Compare three art directions using the exact same canon-safe scene kit:
1. Industrial-naturalist / painterly realism (working recommendation): believable worn materials and practical 19th-century-influenced labour, subdued soot/iron/paper, restrained brass, atmospheric but readable lighting, no ornamental fantasy cliché.
2. Hand-inked/engraved documentary: etched prints, numbered ledger plates, restrained limited-palette illustrations; expressive but may reduce human realism/detail.
3. Stylised cinematic industrial: stronger light/drama and silhouettes, risks generic steampunk and over-gilding.

Evaluate each on: lore accuracy, consistent characters between scenes, UI legibility, manufacturing/crafting object clarity, mobile crops, cost/replaceability of assets, palette and brightness discipline. Produce a compact proof set (city panorama, smithing interior, Guther bust, bent stamped blank, functional UI components) before declaring a winning asset production convention. User visuals are architecture references only.

## Invariant contract
Retain the exact approved Guther words, Stage 1–2 choices and server-side states, the once-only character creation grants, actual Smithing consequences, 0 tutorial wages/XP/loot, no early Missing Stamp reveal, existing save semantics and tests, and untouched combat v0.5.1 baseline. The Stage 3 boundary remains the v0.2 implementation endpoint. The proposed changes above are UI and interaction affordances, not authorization for new lore, currency, jobs, talent numbers, early reveals, time mechanics, sound files or world-map travel.

## v0.3 review gates
- Person can complete the Smithing tutorial with mouse/touch by directly engaging meaningful work-scene objects, and with keyboard/screen-reader alternatives, without being forced to memorize numbers.
- Dialogue *looks and behaves* different from workplace labour while preserving same approved spoken lines.
- Journal, Character and Inventory are full destinations with no fabricated content.
- Desktop and mobile both maintain a stable game shell while the current activity is dominant.
- Significant actions have truthful approximately 1.2 s result staging, no unnecessary added gameplay clicks, sound event hooks, and no double-commit/reload regressions.
- 42/42 existing Millhand and 49/49 combat tests stay green, plus new UI tests for navigation, object hotspots, action-reveal timing, keyboard/mobile and resume.
- Style not treated as approved until the small cross-scene visual study is reviewed.

This is a **design review**, not a declaration that the requested v0.3 changes have already been coded.
