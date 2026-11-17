# Stitcher — Cinder Row Infirmary, Stages I–IV

**Status:** draft implementation for owner review. The 16 November natural-dialogue revision has been approved; no alternate script is introduced. No separate patient/teaching-bed illustration is needed. The approved Cinder Row medical scene, Claudia Cyka and three branch work tasks retain their original stories.

## Shared scene and bed hotspots

- Same `TutorialShell`, `ActivityLayout mode="scene"`, owner-supplied nine-slice dialogue border, nine-slice primary/secondary buttons, journal typography and medical ambience as the accepted Bellrunner/Millhand scenes.
- **Stage I:** Claudia's cold linen-clerk introduction; optional linen objection shown as separate spoken beats; convergence; an honest unpaid round briefing. This tutorial job pays **zero** and uses facility materials.
- **Stage II:** the existing clinic painting `/locations/clinic/clinic-workshop-cold.webp` contains **two keyboard-focusable, accessible clickable bed regions**. They are positioned as percentages on the painting, not viewport coordinates, so their hit zones track the actual beds at every width. They carry legitimate inspection and dressing commands. Both safe care orders, both linen preparation methods and both safe correction methods work. Only one patient is treated at a time; each is cared for; no invented Health or stock quantity. Claudia's sign-off responds correctly to trimming versus discarded linen.
- **Stage III:** one clickable hotspot on the original main bed triggers the Teaching Bed discovery, **without a second bed asset or patient illustration**. Chart inspection and patient testimony are separate saved actions; the exact charity entry and fever-ward coal line appear before the three second-job choices. The patient is an adult; no graphic treatment.
- **Stage IV:** one scripted follow-up job from **Industry/Hauling**, **Commerce/Contracts** or **Scholarship/Investigation**. Each includes meaningful work-order steps and the complete approved dialogue in separate Continue beats. Only the chosen local finding is written to the personal journal. The unfinished transfer proceeds toward Stage V, **without** fabricating a playable Owler scene in Stage IV.

## Economy and character skills

- The `player_character_stitcher_ward` and request-hash receipt tables (`0020_stitcher_ward.sql`) serialize every authenticated, account-owned command on the character row, check revisions, and prevent concurrent/replayed skill awards.
- **Medicine +3** remains the creation grant. The branch-choice transaction awards **exactly one +1** to Industry, Commerce or Scholarship. There is no Stage IV repeat award, wages, ordinary XP, loot, supply item or scripted medical healing.
- The character sheet now displays the saved branch Major Skill +1 as **2/100**, with the provisional 1/100 baseline. **Trauma I · starting** appears under Medicine as an explicitly labelled preview, not a persisted specialization rank.

## Rewind

- In local development only, `← Back to Stage 1/2/3/4` appears on the corresponding Stage II–V header and uses the shared button and confirmation.
- Stage II → I reopens Claudia; Stage III → II reopens the ward report without discarding earlier legitimate treatment; Stage IV → III returns to branch decision and **reverses exactly the chosen +1**; Stage V → IV returns to final second-job sign-off while preserving the one-time +1.
- In each case, delete old request receipts and update the stage/skills in a single database transaction; never replay wages/XP, delete property or reset Health.

## Attached artwork and installation boundary

The supplied `Clinic_Workshop_cold.png` corresponds to the artwork already present at `/locations/clinic/clinic-workshop-cold.webp`; the playable bed hotspots use that repository image directly. The owner's newly supplied Claudia front/back, Ward Register, Wash Basin and Owler standing/defeated images were optimized into an external asset pack at the correct static paths (`platform/apps/web/static/locations/stitcher/*.webp`), but **the GitHub connector does not transfer local image bytes**. Those files must be installed from the companion pack before Claudia's new sprite can render. Missing Claudia artwork falls back to the intact ward painting without a broken-image indicator; all other work remains functional. The register and basin are optional props, not additional hotspots. Owler imagery is reserved for Stage V–VI.

## Validation

- `npm run stitcher:migrate` applies only the additive 0020 schema.
- `npm run verify:stitcher-stages1-4` checks the reducer, safe permutations, approved script and UI contracts.
- The existing real PostgreSQL suite exercises both care orders, all three branch jobs, replay-safe rewards, and local rewinds against the shipping Fastify handlers.
- Existing Millhand/Bellrunner regressions, API typecheck, web build and browser suites must remain green.
- Owner visual review remains necessary for precise hotspot geometry over each bed, Claudia's portrait scale once the static art is installed, and the intended treatment pacing.

Stage V The Empty Sheet / The Night Door and later Owler combat remain a separate PR; no fake combat or clinic resolution is inserted into Stage IV.

## Night Trolley environment (owner corridor, 2026-11-17)

The supplied Cinder Row Infirmary service-corridor image is stored as `platform/apps/web/static/locations/stitcher/service-corridor.webp`, keeping its original 1672 × 941 aspect ratio. Stage IV switches to that scene **only** for the Night Trolley route, from choosing that job until it finishes. The Signed Consent and Notes for the Living remain in the existing infirmary ward. The saved Stage V `exited` handoff preview uses the same corridor for all routes, preparing the Night Door; Stage V gameplay itself is not yet implemented. No new bed sprites, props or scene overlays are introduced. The shared `clinicBackdrop` flag intentionally stays on for both locations, preserving the existing `medical-clinic-ambience.mp3` stream without restarting it or replacing it with alley audio.
