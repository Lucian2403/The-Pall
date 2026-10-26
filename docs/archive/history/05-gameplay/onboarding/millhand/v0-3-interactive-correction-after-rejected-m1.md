> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# Millhand v0.3 — Interactive Correction after rejected M1 (2026-10-22)

**Status: RUNNABLE CORRECTIVE LOCAL PROTOTYPE; USER HAS NOT APPROVED ITS UX OR ART.** Owner rejected the preceding navigation-only v0.3 M1 release as the same artistic dashboard with small layout changes. The M1 documentation is now explicitly marked rejected. This corrective build is a separate local source archive `The_Pall_Millhand_v0_3_Interactive_Correction.zip`; individual executable source files are **still not committed to GitHub**.

## Implemented correction
The permanent right-hand work panel was removed. A new click-targeted workshop scene contains a physically selectable council docket, metal blanks, numbering dies, stamping hammer and Guther hotspot. Clicking a relevant single-action object commits exactly its currently authorised state-machine command. A multi-choice plate reveals only the real legal straighten/replace/stamp-as-is or repair/reject alternatives. Nonrelevant objects can be inspected without advancing work. Guther's conversation is initiated by selecting him and uses current-line/response formatting, not a combat-style transcript.

Visible provisional plate layers distinguish bent edge, uninspected impression, weak crooked impression and corrected/acceptable states without inventing worker IDs. Full-page Journal/Inventory/Character/Conversation destinations remain; the journal is rewritten as a structured work record rather than a backwards debug event list. Desktop persistent navigation and mobile tabs remain as ordinary routing, not the purported heart of the redesign.

Meaningful server-committed actions now reveal results after approximately **1,200 ms**, with immediate busy indication, retry protection, reduced-motion/instant preference, and replaceable `pall:audio-cue` CustomEvents for later sound integration. Interface-only page changes or free object inspection remain instant. The result delay does not change game time or resources.

## What was actually tested
- `npm test`: **52/52**, including 6 new scene/authority/feedback/visual-state assertions.
- `npm run test:combat`: **49/49** unchanged v0.5.1 tests.
- Chromium bridge-assisted full browser walkthrough: create, select Guther, approved pay/trust dialogue, take docket, physical docket → dies → plate choice → hammer → mark inspection → plate rework → lot review → return to Guther; Journal full page and 390px mobile routing. No JS exceptions. Direct localhost browser navigation remains blocked by the runner; do not claim same-origin E2E.

## Unchanged canon and rules
Original `millhand.mjs`, persistence and combat rules are untouched; approved Guther words unchanged; universal kit 20 coins/50 Health/Craftsmanship +3; Stage 1–2 only; no Smithing wages/XP/loot; no Stage 3 evidence before permitted. Existing local saves remain compatible.

## Honest artistic limit
The workshop scene currently uses a **purpose-drawn, diagram-like SVG spatial placement graphic** and the previous Guther test portrait, **not production-quality documentary realism**. This does not fulfil the approved final artistic requirement. Sound files and final workshop, city or NPC artwork are not included. The owner must separately evaluate whether actual scene interaction is directionally right. Only after positions and viewpoint are reviewed should canonical grounded scene assets and Guther likeness be requested and integrated. No approval is inferred by test success.

References: [v0.2 rejection](2026-10-22-v0-2-ui-playtest-review-and-v0-3-direction.md), [v0.3 plan](v0-3-executable-ui-rebuild-plan.md), [approved art doctrine](../../../../../00-vision/documentary-industrial-art-direction.md).
