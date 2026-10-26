> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# Millhand v0.6 — Complete local playtest integration

**Status: a runnable, local eight-stage preproduction prototype created 2026-10-23, NOT the final UI/UX or a production release.** The actual runnable package is attached in the conversation as `The_Pall_Millhand_v0_6_Complete_Playtest.zip`. This documentation commit records QA and the integration boundary; **it is not itself a GitHub commit containing the full prototype source**.

## Approved editorial content

The owner expressly approved all eight Millhand stage rewrites, including Stage 7 clinic, Stage 8 common home, and the more personal Stages 1–4 Journal update on 2026-10-23.

- [Stage 1 — Guther opening](../../../../../05-gameplay/onboarding/millhand/opening-dialogue.md) Revision 02
- [Stage 2 — Smithing](../../../../../05-gameplay/onboarding/millhand/stage-2-approved-script.md) Revision 03
- [Stage 3 — The Missing Stamp](../../../../../05-gameplay/onboarding/millhand/stage-3-approved-script.md) Revision 01
- [Stage 4 — All three second-job routes](../../../../../05-gameplay/onboarding/millhand/stage-4-approved-script.md) Revision 01
- [Stage 5 — Flint's contractor charge](../../../../../05-gameplay/onboarding/millhand/stage-5-approved-script.md), including revised Journal
- [Stage 6 — Flint's fight](../../../../../05-gameplay/onboarding/millhand/stage-6-approved-script.md) Revision 02, explicitly retaining the existing combat-log system
- [Stage 7 — Clinic](../../../../../05-gameplay/onboarding/millhand/stage-7-approved-script.md) Revision 01
- [Stage 8 — Shared home](../../../../../05-gameplay/onboarding/millhand/stage-8-approved-script.md) Revision 01
- [Stages 1–4 — personal Journal](../../../../../05-gameplay/onboarding/millhand/stages-1-4-approved-journal.md)

The official [game-wide spoken and interaction standard](../../../../../05-gameplay/interactions/dialogue-style-guide.md) governs perspective, literal descriptions, no personification and the diary-versus-combat-log separation.

## What the v0.6 local build demonstrates

- Persisted, server-authoritative Stages 1–8, including all three second jobs, all three bent-plate actions and repair, Stage 3 evidence inspection in either order, route-locked knowledge, one-time secondary-skill +1 and unpaid tutorial tasks.
- Stage 5 Flint interactions and three tangible entry postures.
- Actual Flint fighting using the existing untouched combat v0.5.1 module and its original log messages, displayed in an independent combat panel.
- Valid victory and defeat, a clinic examination for 10 coins even when unhurt, one-time payment, and the shared exact rent notice and spoken closing line.
- Character diary personal voice separate from the combat history. Explicit manual advance for story exchanges.
- All baseline Millhand automated tests pass: **84/84**, including 14 new complete-flow and idempotency checks; separate combat-suite tests pass **49/49**. Chromium UI bridge smoke reached the completed home scene via a real Flint defeat, with no page JavaScript errors. Direct browser navigation to localhost was blocked by execution environment policy, so local human testing is still required.
- Approved combat source `prototypes/combat-v0.5.1/combat.mjs` remained byte-for-byte identical: SHA-256 `4d7b2c958611c8b564113a9c8825b7346461516e02d237b09fce331ba3e5ef89`.

## Unfinished and explicitly provisional

The original worker-number and date values are still unspecified; do not invent them. Stage 5–8 scene art is deliberately plain/placeholder, and some earlier secondary instructions and Journal nuance remain simpler than the full approved drafts. The three Stage 5 postures map to prototype readiness/distance adjustments but their **numeric impact is NOT canon**.

**Clinic defeat bridge** is likewise temporary: a player on 0 Health receives a clearly described minimum **1-Health stabilization** so they can travel home in this local demonstration. This is **not an approved general healing formula**. Injury-specific restorative effects have not been authored into a mature Health service and must be designed and tested later. Do not replace health mechanics with silently invented free full healing.

The ending offers no built ordinary paid job, live property management, landlord, rental deadline, crafting market, sound, production deployment or multiplayer support. The local source has not yet been synchronized to GitHub. The canonical story documents are approved, but the playable integrated application needs user playtesting and further implementation review.

## Proposed next action

Test the ZIP on the user's machine with Node 20+: `npm start`, open `http://127.0.0.1:8790`, try at least one route with a Flint victory and another with a defeat. Check manual dialogue, the Journal, combat log, 10-coin examination, no duplicate skill levels, and the provisional 150-coin home notice. Gather concrete issues before editing any other background tutorial. Preserve the v0.5.1 approved combat log.
