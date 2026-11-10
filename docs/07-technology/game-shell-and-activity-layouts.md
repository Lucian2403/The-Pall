# Game shell and activity layouts

**Status:** implemented on branch `feature/game-shell-activity-layouts-20261110`
(awaiting owner review). It covers layout and architecture only. No mechanic,
price, recipe, POI, map route, chat or notification service is approved or
implemented by this document.

Every in-game page renders inside one shell, `TutorialShell.svelte`. Each
activity then picks one of three layout modes from `ActivityLayout.svelte`.
This keeps every page recognisably the same game while letting the central
work area change its proportions. New systems must use these slots rather
than redesigning the frame.

## 1. Shell regions

| Region | Contents | Rules |
| --- | --- | --- |
| Navigation rail | Logo, current scene, character, roster, locked post-introduction sections | Fixed token width (216px), not a share of the window. 72px icon rail below 1200px; bottom navigation at ≤760px. Sticky, with its own scroll on short windows. |
| Game frame | The rail, the column and the optional dock | Fills the window up to **1680px**. Wider windows centre the **whole** game (sidebar included) with equal dark gutters (owner direction, 2026-11-10). |
| HUD (one band) | Avatar, name, origin; Health and Stamina; only the **measured** extra values the server supplies (Fatigue/Focus are hidden when absent, never shown as placeholders); coins; introduction progress; **Notifications**, **Chat**, Sound, Account | Reflows according to the activity column's real width (`@container pall-shell`), so a dock or the rail changes it exactly as a narrower window would. |
| City header | `TheCityVista.png`, "Grand Cylinder City", context line, **City map gateway** | 88–136px tall (`8.5cqi`; 66px on phones). It is the future map entry point, not decoration (§3). |
| Activity row (sticky) | Location, stage, dev-only rewinds, **Review/Close journal**, Character selection | The only sticky strip. The journal control has the same position on every page. |
| Activity area | The page's `ActivityLayout` | §2 |
| Dock column (optional) | `dock` snippet prop | Its own grid column (`clamp(280px,22vw,360px)`). Never rendered on phones. Activities reflow because their layouts are container-driven. |

**Overlays:** every HUD menu (Sound, Notifications/Chat status) uses
`anchored-popover.ts`. The Popover API places it in the browser top layer,
anchored to its trigger. It flips above the trigger when that side has more
room, is clamped to the viewport, has a bounded height with internal
scrolling, and closes on Escape (focus returns to the trigger), outside
click, focus leaving it, the trigger scrolling away, or navigation. Modal
content (inventory, skills, welcome, fatigue help) keeps using native
`<dialog>.showModal()`. **Do not fix stacking with z-index.**

## 2. Activity layout modes

`<ActivityLayout mode stage panel? supplement? stageAspect?>` is a size
container. Columns depend on the width the activity actually has after the
rail, dock and padding, never on the raw window width. Each region is also a
named container (`activity-stage`, `activity-panel`, `activity-supplement`),
so its contents adapt to the slot they get.

| Mode | Two columns when the container is | Wide arrangement | Narrow order | Used by |
| --- | --- | --- | --- | --- |
| `scene` | ≥880px (art ≥460, reading ≥380) | Art on the left. Dialogue, then contextual documents, share the reading column (preferred 38%, 380–600px, ≤44%). | art → dialogue → documents | Bellrunner Stage 1 and all Stage 2 locations |
| `workspace` | ≥1380px (the battlefield keeps ≥1000px, the width its overlays were tuned for) | Encounter/bench on the left; tools, log or abilities in a 360–460px column | stage → tools | Millhand Stage 6 combat |
| `management` | ≥760px | Details/filter panel (230–340px) first, then the dominant list/table/ledger | panel → list | Character record (attributes + skills) |

Scene-mode rules:

- `stageAspect` (for example `1672/941`) lets the layout measure the real
  space below the HUD and size the art so that Hector, the parchment and its
  first choice share the first screen. Spare width becomes **symmetrical
  gutters**, never an empty strip on one side.
- The reading panel is **as tall as its content**. Do not stretch the
  parchment to match the art column. Documents follow the dialogue in the
  same column, so neither column is padded to match the other.
- **One fixed reading scale** for dialogue (`--dialogue-text` 17px,
  `--dialogue-title` 21px, `--dialogue-label` 15px in
  `pall-story-landscape.css`). Every narration, NPC line, player line,
  inspection and choice is the same size; nothing scales with the window.
  The scene art supports the text, documents and menus. It is not the
  focus of the screen.
- Spacing can be tuned per activity with `--activity-gap` and
  `--activity-padding` on an ancestor (combat uses 0 for a full-bleed
  battlefield).

## 3. City map gateway

`TutorialShell` exposes `cityMap?: {href}` and `travelLocked?: boolean`. The
gateway is a real link **only** when all of the following are true:

1. The server reports the introduction complete (`tutorial.stage >= 8` and
   `tutorial.status === 'COMPLETED'`).
2. The current activity does not set `travelLocked` (active combat sets it).
3. A page passes a real, routable `cityMap.href`.

Otherwise the gateway is a `button` with `aria-disabled="true"` and a
readable status: "Opens after the introduction", "Travel is locked during
this activity" or "Not available yet". Nothing here guesses a map URL or
lists POIs. The workbook's structured locations (`loc_cylinder`,
`loc_grey_marches`, `loc_ashlands`) remain the source when a map is built.

## 4. Notifications and Chat

`services?: {notifications?: ShellService; chat?: ShellService}` where
`ShellService = {open(): void; active?: boolean; unread?: number}`.

- **Omitted (current state):** a dashed control with a small lock. It
  announces "(not available yet)" and opens a short top-layer status note.
  It has no badge, no feed and no input box.
- **Supplied:** a normal button that calls `open()`. `unread` must be a
  server-confirmed count. Chat should then open in the `dock` column or a
  drawer, and notifications in their own centre. Neither may cover combat
  targets, document hotspots, primary actions or dialogue choices.

## 5. Adapters for systems that do not exist yet

These are the slots to use. They are not implementations.

| Future system | Mode | Stage | Panel | Supplement |
| --- | --- | --- | --- | --- |
| NPC conversation / story location | `scene` | Location art + NPC hotspots | Dialogue/decisions | Contextual papers or props |
| Combat | `workspace` | Battlefield and its overlays | Chronicle + own condition | — |
| Manual crafting | `workspace` | Modular bench with stateful props (no painted-in tools) | Recipe steps, materials, compact NPC line | Output / queue |
| Expedition | `workspace` | Route board / scene | Supplies, party, risks | Log |
| Market / selling / contracts / recipes / inventory | `management` | Table or grid with prices, quantities and slots | Filters + selected-item details | Totals / confirm bar (only when wired to the backend) |

## 6. Verification

- `npm run verify:bellrunner-layout-browser`: 45 Bellrunner page/viewport
  combinations (1024–3440px and 768/390px), interactions, the Route Sheet
  handoff, and the top-layer Sound settings at 1280×720, 1280×575 and
  390×600.
- `npm run verify:game-shell-browser`: workspace (combat), management
  (Character page), dock reflow, map gateway states and the
  Notifications/Chat status popovers.
- Both write screenshots to `platform/test-artifacts/` (git-ignored).
