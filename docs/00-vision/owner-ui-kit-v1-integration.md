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

## Owner correction — actual dialogue/button kit and universal avatars (2026-10-27)

The first owner UI-kit pass used the logo and HUD, but failed to use the supplied dialogue frame and normal/hover/pressed button artwork. This was not the owner's requested integration. This correction now **uses the original ZIP assets**, with CSS nine-slice (`border-image-slice … fill`) for the compact CRPG dialogue panels and the playable dialogue/work-action buttons in Stages 1–4. Nine-slice preserves decorative corners while permitting long text, localization and compact mobile widths; letters and numeric data remain in HTML, not in images. Journal panels, object labels, NPC interaction hotspots and side navigation remain restrained rather than heavily ornamented.

The allowed fonts now have visibly separate jobs:
- **Bebas Neue** for dialogue headings/speaker labels and small navigation/HUD labels.
- **Beyond Wonderland** used *only* for the Grand Cylinder City display title, not across ordinary sentences.
- **New Standard** is still included in the owner source archive, but its original CFF OpenType file was rejected by Chromium's OTS parser. It is not requested from CSS; reading text currently uses Georgia. A valid New Standard WOFF2 or repaired OTF, supplied by the owner, can later replace this fallback.
- **CF Industrial Fabrics** and **Stranger Friz** remain excluded due to the licenses bundled with the ZIP; do not ship or reference them for a commercial game without appropriate permissions.

**Avatar contract:** User states that the game's portrait collection is shared by **all origins/backgrounds**. `CharacterAvatar.svelte` is now the shared header portrait component. Its optional `avatarId` comes from the character (not the origin, sex or home area) and selects `static/ui-kit/avatars/<avatarId>.webp` or `.png`. If there is no avatar selection or an asset is missing, the existing letter fallback remains; **the owner's avatar collection has not been uploaded in this ZIP and no portrait is invented**. Once supplied, avatar names must be stable and chosen/persisted for the player regardless of origin. The owner can install existing portrait files from a local directory with the installer optional `-AvatarDirectory` parameter. This is asset plumbing, **not yet a persistent avatar-selection UI or database migration**.

For the owner's local browser, no database migration is necessary for frame/button/font changes. Do not reinstall any existing assets if they are already present; the original installer already copied the frame and all three button-state PNGs. Update the code, validate and refresh:

```powershell
git pull --ff-only
npm run verify:owner-ui-kit
npm run check:web
npm run build -w @the-pall/web
```

If avatar assets are later supplied in a dedicated folder, invoke `scripts/install-owner-ui-kit.ps1 -KitZip <your-original-zip> -AvatarDirectory <your-portrait-folder>`; WebP or PNG names must match `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$` before the extension.

**Acceptance:** On all early Millhand workshop stages, the actual brass/iron-edged parchment *dialogue frame* appears around the small NPC conversation, while the owner's beige metal-trimmed button images change with hover/press and support keyboard focus. The transparent props remain visually on the table; expanding the journal still happens separately. The city panorama, resource HUD and logo remain unchanged by this focused correction. Evaluate on desktop and mobile before extending ornamental treatment to the rest of the shell.

## Screenshot correction — alpha margins and distressed font (2026-10-27)

The owner reviewed Stage 1 and identified a **white rectangular strip behind the dialogue frame**, poorly proportioned buttons and an overly distressed Grand Cylinder City heading. These were implementation defects, not problems with the supplied imagery.

**Cause:** The original `dialogue-frame.png` is 2032×774 but its visible artwork occupies a smaller region, with a large transparent gutter at the top/bottom. The previous border-image slicing included that gutter, used an opaque CSS beige fallback behind the entire frame, and allowed the image border to intrude into dialogue text. Button PNGs likewise have transparent margins and had too-small endcap widths. The decorative Beyond Wonderland typeface introduced texture noise in the city heading.

**Fix:** The original owner PNGs are preserved. A companion asset patch / updated Windows installer provides four new alpha-trimmed versions:
- `ui-kit/frames/dialogue-frame-trim.png` (1936×551, cropped from the owner's original, no stylistic alteration)
- `ui-kit/buttons/button-normal-trim.png` (1261×203)
- `ui-kit/buttons/button-hover-trim.png` (1261×205)
- `ui-kit/buttons/button-pressed-trim.png` (1261×207)

`pall-owner-ui.css` now references these images, uses nine-slice settings calibrated for the cropped source, removes the opaque rectangular backing and reserves sufficient border width for button endcaps and framed dialogue text. Keyboard focus remains visible, and NPC/object click targets stay unskinned. The city title returns to a readable serif; Bebas Neue stays on small labels. There is no need to change the logo or panoramic City art.

**Install:** From the `platform` working directory, after `git pull --ff-only`, unpack `The_Pall_UI_Cropped_Frames_Patch.zip` **into the platform directory**, preserving `apps/web/static/ui-kit/...`. Alternatively, rerun the updated `scripts/install-owner-ui-kit.ps1` with the original full UI kit ZIP; the installer now generates the same four trimmed images automatically using Windows System.Drawing. Then run `npm run verify:owner-ui-kit` and `npm run check:web` and restart the frontend.

**Avatars:** The owner has a universal portrait set, but it is **not present** in any conversation/project uploads or the source UI-kit ZIP. The shared `CharacterAvatar` component already supports a saved `avatarId`, but the API does not yet persist it. Do **not** assign a random, Millhand-specific or inferred portrait. Once the owner uploads the portrait pack, implement a common avatar catalogue and persist each player's selection independently of origin. Until then, the character initial remains an explicit fallback, not final portrait artwork.

**Acceptance:** No pale/white rectangle visible outside the iron frame. All three button states retain full endcaps without covering labels. Workshop objects remain on the physical workbench, and opening a journal doesn't enlarge its NPC popup. The City title is readable without decorative noise. The universal portrait remains pending actual owner files. Local responsive screenshots are still needed for visual signoff.


## Font handoff correction — 2026-10-28

User supplied the five fonts individually. New Standard is the same 2,151-glyph OpenType/CFF original and still needs **outline conversion**, not a renamed file. CF Industrial Fabrics explicitly indicates a personal-use-only license; Stranger Friz was supplied under personal-use terms. Neither will be used in the commercial game unless licensed.

**Updated implementation:** `platform/scripts/install-owner-fonts.ps1` takes `-KitZip` (the original owner's archive) or `-NewStandardOtf`, uses the installed Node/npm runtime and a pinned temporary `fonteditor-core` tool to convert OTF CFF → actual TTF outlines → WOFF2. It does not require Python, and it does not change the app's npm lockfile or share the owner's font binaries. A direct WOFF2 remains optional. The CSS and permitted font roles are unchanged.

Use `npm run verify:owner-ui-kit` after installing; browser output is not certified until the owner runs it. The earlier Python and manually prepared WOFF2 export steps are superseded.
