# The Pall — Stage 4 art handoff (PROPOSED ASSET LIST; NOT VISUAL APPROVAL)

**Purpose:** Replace the *temporary schematic* location staging for the three now-implemented Millhand Stage 4 second-job routes with owner-directed, individually clickable transparent artwork. This document requests no new lore, speech, rewards, NPC biographies or invented official symbols. Route mechanics and dialogue are already approved in [Stage 4 Revision 01](stage-4-approved-script.md).

## Global production contract

- Each location is a **separate background**, styled consistently with the existing Guther workshop (the owner's painterly, readable, Albion Online / Warcraft-like reference). Do not recycle the workshop background and falsely call it the depot, council office or archive.
- Each required physical prop and NPC is a **separate transparent PNG/WebP** on a full, tightly framed canvas, without large black/opaque rectangle, fake square UI tile, label plaque or hover glow in the image. Object names, focus rings and player interactions are implemented by the web client, not painted into the art.
- Text that must vary by game state (worker ID, dates, disputed goods category, handwritten corrections) belongs in the small in-scene CRPG examination popup. Do not try to make legible AI-generated tiny text on the texture, or invent fixed numbers, historical dates, council ranks, seals or signatures.
- Use a physically credible surface for laid-out props and a small, player-controlled NPC speech popup. No fullscreen dialogue section and no journal expansion over assets.
- This is **request scope** for the owner's separate asset-production workflow; nothing here is automatically canon-approved artwork.

## A. Depot Intake Run — Industry / Hauling

**Environment:** Municipal depot receiving counter with a credible surface where a load of numbered metal plates can be put down. The depot should clearly differ from Guther's workshop. Avoid fabricated depot banners, emblems or machinery that assert new lore.

**Transparent reusable cutouts:** Stack/load of numbered metal plates (council-owned, same visual identity as Stage 2 metal plates), council work paper/delivery list (identifiers illegible or blank for UI overlay), receiving record / receipt, and a **Depot Clerk** character whose visual identity is not yet established. If needed, the prior approved plate asset can be reused rather than re-illustrated. Two transport methods, plates secured together and plates in smaller groups, may share the same base stack with composited ropes/groups only if owner approves; do not depict an unapproved damage outcome.

**Functional interactions:** Check load, choose transport, inspect manifest mismatch, speak to clerk, record what arrived. Stage 3 already did one corrective number stamp; do not draw a second extra stamping step into this scene.

## B. Disputed Docket — Commerce / Contracts

**Environment:** Council Contracts office counter, distinctive from the depot. Only generic records work is justified; do not draw a named inspector or unapproved city council symbols.

**Transparent cutouts:** Disputed work paper, compensation record, contract-charge record and two sealed entries. The same worker is entered dead for compensation and active for charges; this contradiction is readable via popup, not printed as fake fixed text. A **Contracts Clerk** NPC (new appearance requires owner sign-off).

**Functional interactions:** Examine work paper, compare two sealed records, question clerk, either ask to check seals or mark conflicting entries, submit paper. The office does **not** resolve or correct either entry during Stage 4.

## C. Ledger Reconciliation — Scholarship / Investigation

**Environment:** Council records room/archive with a surface for examining an actual ledger and paper books; not the Guther bench.

**Transparent cutouts:** Death register (open page), wage records, a **scraped/damaged line** detail on a paper page, shift book, and an **Archive Assistant** NPC. The damaged writing must remain unreadable. Do not depict who scraped it or reveal what was removed.

**Functional interactions:** Examine death register, compare later wage record, inspect altered entry, speak to assistant, choose neighbouring entries versus shift book, write down findings. The original books are not inventory loot.

## Naming convention suggestion (not yet an asset contract)

- `stage4-depot-environment.webp`, `stage4-depot-clerk.webp`, `stage4-plate-load.webp`, `stage4-delivery-list.webp`
- `stage4-contracts-environment.webp`, `stage4-contracts-clerk.webp`, `stage4-compensation-record.webp`, `stage4-contract-charge-record.webp`
- `stage4-archive-environment.webp`, `stage4-archive-assistant.webp`, `stage4-death-register.webp`, `stage4-wage-record.webp`, `stage4-scraped-page.webp`, `stage4-shift-book.webp`

**Review gate:** Owner approves the art and physically plausible object placements before this temporary Stage 4 layout becomes visual canon. Do not turn placeholder cards into a permanent game scene.


## Depot background received and wired — 2026-10-28

**Owner asset received:** Municipal depot receiving-yard panorama (`depot_background.png`, 1774×887). A faithful WebP conversion (`depot-background.webp`, 263 KB) is packaged in `The_Pall_Stage4_Depot_Asset_Patch.zip` under `apps/web/static/locations/depot/`. It is used only for the **Industry / Hauling** branch, after the player chooses a transport method and reaches the depot.

**Location continuity:** Before the delivery, Stage 4 still uses the existing Guther workshop environment for `CHECK_LOAD` and `CHOOSE_TRANSPORT`, matching the approved A02 sequence. After the transport choice, the depot artwork replaces that background for `COMPARE_DELIVERY`, `SPEAK_DEPOT`, `DEPOT_DIALOGUE`, `CHOOSE_RECEIPT`, `COMPLETE_DELIVERY` and `DONE`. The chapter location heading changes accordingly. No premature travel or additional work-stage state mutations occur.

**Props now:** The existing individually transparent `metal-plates.webp` and `council-work.webp` are reused as clickable objects laid on the supplied workbench / receiving counter. Their labels contain text only. The depot action list and CRPG popup handle the separate delivery list and receiving record; **new illustration assets for those two papers are not necessary for the current playable route**. The four schematic glyph tiles have been removed from the Industry scene. The Depot Clerk still speaks via approved dialogue without a made-up portrait; a distinct owner-approved clerk asset would improve later visual polish, but does not block this implementation. No fabricated names, worker numbers, calendar dates, goods categories, seals or loot.

**Installation gate:** GitHub commits contain the Svelte components and verification only; large user-supplied artwork binaries are not in the repository. Extract the generated owner asset ZIP into the local `The-Pall/platform` directory (not `platform/apps/web`) preserving the `apps/web/static/locations/depot/depot-background.webp` path. Verify with `npm run verify:depot-art`. The scene cannot display its image until the static file is locally installed.

**Preserved user copy:** The owner pushed small dialogue edits. This update did not replace `approved-stage-four.ts` or its canonical script. Stage 2's repeated poor-stamping observation is corrected only by suppressing an instruction when identical to the saved action result; all source strings remain unchanged.


## Depot art revision — colder palette (2026-10-28)

The owner approved the Stage 4 Industry/Hauling transition and supplied `depot_background_cold.png` (1774×887) to replace the warmer depot yard panorama. This new supplied image is stored as a **pixel-identical lossless WebP**, `apps/web/static/locations/depot/depot-background-cold.webp`, delivered in `The_Pall_Stage4_Cold_Depot_Background.zip`.

`MillhandDepotScene.svelte` now requests the **new filename** so previously cached warm artwork cannot persist. The workshop preparation scene, transport handoff, depot interactive props, Depot Clerk dialogue, journal and saved route actions are unchanged. The prior `depot-background.webp` file can remain on disk without being used.

Install: extract the ZIP into `The-Pall/platform`, retaining `apps/web/static/locations/depot/depot-background-cold.webp`; run `npm run verify:depot-art`, then restart the frontend. No database migration or character reset.

This revision supersedes the background filename and artwork noted above. No new assets are required for the delivery list or receiving record.
