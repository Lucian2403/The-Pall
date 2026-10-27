# The Pall — Owner UI Kit v1, restrained integration pass

**Status: OWNER-SUPPLIED ART / PROVISIONAL INTEGRATION (2026-10-27).**
The owner supplied `The-Pall-UI-Kit-v1.zip`, a separate transparent sidebar illustration and a Grand Cylinder City image (the latter is pixel-identical to `resources/TheCityVista.png` in the archive). The reference composition is an **art-direction sample**, not permission to replace all screens with an illustrated dashboard. Explicit user direction: **“Don't saturate much everything.”**

The currently approved game illustration approach is the hand-painted Guther/workshop art in [Art Direction](art-direction.md). This is a narrow visual identity pass, **not** mechanical or layout approval for the complete UI kit.

## Pass 01 — intentionally limited

- **Sidebar branding:** use the owner's compact The Pall logo instead of a plain text placeholder. The existing words `A CITY ENDURES` remain a quiet tagline. The separate `Within the Walls We Remain` illustration is a subdued rail-footer accent, with text laid over a dark wash.
- **City panorama:** use `resources/TheCityVista.png` as a **decorative city banner**, not as a clickable map or claim about travel routes, districts, landmarks or unlocked city navigation. Allow a taller city panorama so the Grand Cylinder remains visible, with a compact workshop/location strip beneath it and legible text.
- **Typography:** use Bebas Neue for restrained small UI labels. The supplied New Standard OTF fails Chromium's OTS CFF CharStrings validation, so the browser temporarily uses Georgia for readable dialogue and body text instead; its original OTF remains in the kit for a corrected export. Beyond Wonderland is installed as an optional decorative face but should be used sparingly after reviewing actual screenshots; the painted logo already establishes the strong display identity. Do not plaster multiple fonts across a single dialogue.
- **Health:** empty bar + health-fill are composited with CSS over the character's **real saved `health.current / health.maximum`**. Do not create a separate fake 100-point HP state. Stamina, Fatigue and Focus tracks are visible, but they explicitly show ‘—’ until server-owned resource data exists; no placeholder numerical values are claimed. Stamina and Fatigue fill textures are ready for activation once the API supplies their measurements.
- **Other artwork:** the dialogue-frame PNG and three button images are copied to the local static asset directory but intentionally **not applied globally yet**. Their source art is warm and decorative; indiscriminate use would dominate scenes and risk obscuring the tabletop, props, long conversations and mobile layouts.

## Font and asset provenance

The ZIP contains nested font archives. The local installer expands only fonts whose **included license materials** permit commercial use or redistribution with software:

| Supplied archive | Licensing evidence | Action |
| --- | --- | --- |
| `new-standard.zip` | `OFL.txt` (SIL OFL 1.1) | Install New Standard Regular |
| `bebas-neue-2014-font.zip` | `misc/OFL-58d7.txt` (SIL OFL 1.1) | Install Bebas Neue Regular and Bold |
| `beyond-wonderland.zip` | `readme.txt` states free for commercial use | Install but keep display usage rare |
| `cf-industrial-fabrics-font.zip` | `info.txt`: Freeware, **Non-Commercial** | **Do not install/bundle** without a suitable license |
| `stranger-friz.zip` | `Readme!!.pdf`: **free for personal use only; commercial license required** | **Do not install/bundle** without a commercial license |

Font binaries remain inside the owner's original supplied archive or the owner's local checkout. They are **not uploaded as font files through this chat**. Keep included copyright and license text with shipped font software. The project must not advertise either restricted font as part of the commercially distributable build without evidence of licensing.

## Local installation (Windows PowerShell, platform working directory)

Run `git pull --ff-only`. Stop the web dev server, then:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-owner-ui-kit.ps1 `
  -KitZip "$env:USERPROFILE\Downloads\The-Pall-UI-Kit-v1.zip" `
  -SidebarImage "$env:USERPROFILE\Downloads\the_pall_sidebar_illustration_transparent.png"

npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

If these files are in another directory, supply their real absolute paths. The independent city file `Steampunk Citadel Beneath Golden Skies.png` does **not** need separate copying: it matches `TheCityVista.png` inside the kit.

**Where the script installs:** `platform/apps/web/static/ui-kit/{branding,buttons,frames,resources,fonts,licenses}` and `sidebar-illustration.png`. The script creates only local/static artwork and font resources; it does not touch the database, saves, wallet, combat or quest phases. Restart the frontend afterward.

**QA acceptance:** Check Stage 1–4 workshop at desktop and phone width, with particularly long Guther/Flint future dialogue, health at varying current values, first-name overflow, small navbar labels, sidebar footer and city-banner contrast. The workshop remains the main illustration. No UI text becomes unreadable and no frame/button art overlays a clickable prop. Confirm the city banner is decorative and the health bar uses the real character value.

**Next art gate:** Only after screenshot feedback should the supplied frame and button states be considered for a **single** dialogue popup/button family. The user may approve a nine-slice frame later. Do not apply blanket nine-slice CSS now. Full HUD resources and interactive city overview remain separate future milestones.


## Owner browser correction — missing Stage 4 tables / expanded skyline / resource tracks

The owner's screenshot showed a Chromium OTS failure for `NewStandard-Regular.otf`, two API 500 errors on Stage 4 and developer rewind, and a panorama too shallow to feature the Cylinder. This follow-up fixes browser-side font requests and layout, and makes API errors actionable when PostgreSQL reports SQLSTATE `42P01` (missing Stage 4 table). **The local PostgreSQL server cannot be changed through a GitHub source commit.** The required additive Stage 4 migration is still `npm run second-job:migrate` on the owner's machine, followed by an API restart.

- Four compact top resource tracks: **Health** is from the saved-character API; **Stamina**, **Fatigue**, **Focus** are explicitly marked as not tracked (display ‘—’ and neutral empty tracks) until there are real fields. Do not depict 0 or 100 or claim fabricated combat numbers.
- Taller city vista (`clamp(245px,26vw,335px)` desktop, 205px mobile), positioned to show the central Cylinder, with a slimmer 43px workshop location strip.
- Stage 4's location caption follows the saved route (depot, Contracts office, records room) rather than falsely saying the character remains inside Guther's workshop.
- New Standard's invalid OpenType `CFF` is **not requested** by browser CSS; original source stays in the owner's UI kit. No repaired font binary is distributed. Use a newly validated OTF/WOFF2 export in future. Bebas Neue stays in use for labels; text uses Georgia fallback.
- A missing `player_character_second_job` or receipt table now yields a clear HTTP 503 migration instruction instead of opaque HTTP 500. Other 500s still need server logs; do not assume a missing table without SQLSTATE confirmation.

**Local recovery:** `git pull --ff-only`, `npm run second-job:migrate`, restart the API, `npm run verify:owner-ui-kit`, `npm run check:web`, `npm run build -w @the-pall/web`, restart frontend. No data reset, asset reinstallation or font replacement necessary.
