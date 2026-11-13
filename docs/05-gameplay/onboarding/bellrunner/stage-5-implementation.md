# Bellrunner Stage V — Dogman at the Service Gate (implementation, 13 November 2026)

**Status:** feature branch and owner/CI acceptance pending. Stage V uses the **approved/locked** spoken and narrated text in [dogman-confrontation.md](dogman-confrontation.md). No invented Hector visit, Shift Marshal scene, skill check, money, reputation flag or alternative resolution has been introduced.

## Authored encounter

1. Enter **after** a completed and exited Stage IV (Attendance Certificate, First Aid Line or The Bell Linkage), with the branch read from server-owned saved evidence. The first screen is **The Service Passage**, a single journey-and-encounter narration with only the alley background; Dogman's sprite and nameplate are not shown. **Continue** reveals Dogman and starts the existing first spoken line of **Show Your Papers**.
2. **Show Your Papers:** first narration and seven spoken beats, ending with the three approved choices: ask for Dogman's orders, keep hold of the sheet or tell him what happened. Only the last choice reveals a specific Stage IV job. No documents or items are confiscated.
3. Dogman's branch-specific response is saved with the selected conversation path; the two common replies follow. Dogman still cannot claim unseen information.
4. **Gate Barred:** eight approved narration/spoken beats, ending on the last spoken line with three defensive positions. No new encounter between the dialogue and this choice.
5. The selected **street / cart / defend** position is saved; Stage V ends and hands off to Stage VI. Combat has not been simulated in the Stage V reducer. Stage VI requires its own shared-engine combat implementation and balancing.

The player does not return to Hector, enter the condemned building or earn an additional skill level.

## Owner-supplied artwork

The original uploads have been converted to compressed WebP and committed in full as Git blobs. They are derived from the owner's exact images, not generated replacements:

| Source upload | Committed asset | Use |
| --- | --- | --- |
| IndustrialAlley_Background.png | platform/apps/web/static/locations/bellrunner/industrial-alley.webp | Stage V scene and Stage VI setup |
| Dogman.png | platform/apps/web/static/characters/dogman/dogman-standing.webp | Dogman while threatening and blocking passage |
| Dogman_Defeat.png | platform/apps/web/static/characters/dogman/dogman-defeated.webp | Reserved for actual Stage VI player victory, not used during Stage V |

The existing soundscape **/audio/the-pall/night-alley-ambience.mp3** is activated by passing \`alleyBackdrop={true}\` into the shared \`TutorialShell\`. It therefore uses the same \`claimNightAlleyAmbience()\` / volume / pause / release logic as Flint's alley. No duplicate track or ambient sound controller has been created.

## State, API, migrations and UI

- Additive SQL: \`0018_bellrunner_dogman.sql\` with \`player_character_bellrunner_dogman\` and idempotent request receipts.
- The \`bellrunner:migrate\` command includes this migration.
- Routes: \`GET/POST /api/characters/:id/bellrunner/dogman\`. A committed Stage IV \`exited\` state and matching branch are mandatory; credentials and owner-scoping, request IDs, optimistic revision checks and receipt hashes prevent crossed accounts and duplicate progress.
- Server state records \`branch\`, \`phase\`, \`line\`, \`reply\`, \`stance\` and \`revision\`. Stage V is no XP, coins, inventory, Health or new Major Skill.
- UI: \`/characters/[id]/bellrunner/dogman\`, shared \`ActivityLayout mode="scene"\` with owner art and the existing Millhand primary/secondary choice skin. Dialogue is one beat per Continue. The common upper journal control opens the first-person personal journal.
- Stage IV's final service-gate button navigates into Stage V; Character Home and shell chapter navigation resume the correct saved chapter.
- Stage VI has a **truthful handoff boundary only**, not a counterfeit turn-based fight. The encounter awaits a separate Stage VI combat PR; the defeated Dogman image must appear only upon a confirmed combat victory.
- Local-only developer rewind from an unfinished Stage V deletes only Dogman state/receipts, preserving Stage IV's finding and Stage III's +1 skill. The unstarted Stage VI boundary can be rewound to the saved final stance choice.

## Verification

\`npm run verify:bellrunner-stage5\` covers all three Stage IV branches, all Dogman reply combinations, each stance, exact approved copy and SHA-256 of the supplied artwork. PostgreSQL integration verifies authenticated routing, wrong-phase rejection, idempotency, persisted branch reply, stance and Stage VI transition without duplicate skill or coin changes. Production TypeScript/Svelte builds and existing browser scenes run in CI.

**Owner visual acceptance:** inspect the composition at desktop and narrow widths, the Dogman sprite scale and gate/cart placement, and Flint's Night Alley soundscape. **Do not merge** before this review.
