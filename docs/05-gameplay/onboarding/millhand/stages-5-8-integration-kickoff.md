# Millhand — Stages 5–8 integration kickoff

**Status:** Implementation plan only, 2026-11-02. This file neither revises approved story/dialogue nor claims the remaining stages are playable.

## Current production boundary

The current authenticated SvelteKit/Fastify/PostgreSQL implementation handles Millhand Stages 1–4, including all three Stage 4 job outcomes. Stage 4 ends in a durable `DONE` state, and the running UI explicitly reports that Flint's Wage Claim has not yet been connected. The source of the historical **v0.6 eight-stage local playtest** was delivered separately as `The_Pall_Millhand_v0_6_Complete_Playtest.zip`; the archive note explicitly says its runnable package was **not** committed to the current GitHub application. Do not mistake that prototype for a production integration.

The **canonical content is already approved** for all four remaining stages. Source order:
1. [Stage 5 Revision 01](stage-5-approved-script.md), mechanics [Flint confrontation](flint-confrontation.md).
2. [Stage 6 Revision 02](stage-6-approved-script.md), encounter [Flint fight](flint-fight.md). Existing combat v0.5.1 event/log language and actual engine behavior are authoritative; do not replace with scripted victory or a different combat system.
3. [Stage 7 Revision 01](stage-7-approved-script.md), [clinic mechanic](clinic-treatment.md), and [shared examination rule](../shared-clinic-examination-policy.md).
4. [Stage 8 Revision 01](stage-8-approved-script.md) with the [**one shared home/rent ending**](../shared-home-rent-ending.md) for every background.

## Ordered production milestones

| Milestone | Interactive scene | Server-owned condition to finish | Canonical constraints |
| --- | --- | --- | --- |
| **5A — The Wage Claim** | One industrial service passage; Flint, folded contractor demand; examine the demand **or** challenge Flint's authority | Player has learned the lot reference, cancelled worker number, contractor's unquantified charge and absence of paid wages | Flint works for a contractor, not the council. Charge applies to the player; the deceased worker does not owe it. No fee actually collected |
| **5B — Cornered** | Actual selected Stage 4 evidence offered as an explicit speech option; Flint then blocks the passage; club and nearby work cart are observable | Exactly one of brace/keep moving/cart cover is selected and saved | No phantom choices, route spoilers, scripted extra threat after Flint's final **“No.”** |
| **6 — Flint encounter** | Same service passage and cart, existing turn-based combat UI and event Chronicle | Engine-authoritative victory or defeat saved exactly once; carry real Health/injury state onward | Opening stance must have honest corresponding combat behavior; no automatic win, fake guard bonuses, forced injury, Arms XP, loot, or coins |
| **7 — City clinic** | Shared working-class clinic, clinician conversation, actual condition examination, 10-coin service confirmation | Idempotent 10-coin debit once, medically truthful service result, transition home | Unhurt character pays for exam but receives no invented dressing. Defeat-safe access. If stabilization is needed, keep the historical v0.6 local one-Health rule clearly **provisional**, not silently canonized |
| **8 — Shared home** | Same rented home for all six backgrounds, physical rent notice; read then set down | One-time tutorial completion after identical shared closing speech | Notice says only `RENT — 150 coins owing`; provisional 150 rent, 10 coins in hand, no due date/penalty/payment feature; Millhand Journal conditional on real route and fight outcome |

## Minimum art and composition contract

The three completed Stage 4 screenshots establish the current visual language: owner-painted wide environmental backgrounds, separately reusable transparent prop cutouts, short parchment/metal-framed CRPG conversation windows, framed object nameplates and independent first-person personal Journal. Preserve this system and its interaction scale instead of using full-page dialogue sections or generic schematic cards.

**Stages 5 and 6 share one location:** a wide industrial service passage inside Grand Cylinder City, with room for Flint to block the player's path and the work cart to serve as an actual position/cover choice. Prepare reusable layers: the empty passage; Flint as a transparent standing/hostile character asset (variants only as needed by the existing battle UI); folded contractor demand; and work cart. Do not paint interactive text, names or choices into the background.

**Stage 7:** a modest working-class clinic background, a transparent clinician character, and only service props required by the approved examine/pay/care interactions. Do not prepaint wounds onto the player or assume every combat outcome needs bandaging.

**Stage 8:** **shared**, not a Millhand-exclusive home asset. The rent notice should be an interactive, reusable paper cutout; the notice itself has no fabricated seal, date, landlord or payment demand beyond the approved text. Reuse one shared home scene in later background integrations.

Art production can follow the owner's separate no-background layer workflow. Exact sprite filenames, safe crop, dimensions and placement must be decided against actual source assets, not fabricated here. Background music and environmental ambience are separate audio channels.

## Handoff and persistence rules

- Stage 4 `DONE` is the only legal entrance to Stage 5. Preserve the chosen `restamp` / `contracts` / `records` branch, the existing evidence, Stage 3 one-time skill bonus and personal Journal. The other branches' evidence must never leak into Stage 5.
- Use API-owned `revision` and idempotent `requestId` actions as in current Stages 2–4. Store Stage 5 bill inspection/speech progress and stance; do not store those decisive facts in volatile UI-only state.
- Enter the fight at most once per saved confrontation. Stage 6 writes only actual engine outcome, Health/injury state and an appropriate Journal recollection. The battle Chronicle is **not** the private Journal and remains mechanically unchanged.
- The real saved combat outcome determines the Stage 7 opening and any medical care. The 10-coin examination/debit must not repeat on a reload or duplicate request.
- Stage 8 uses the universal home/rent data and exact spoken ending; no six copies of the scene, invented eviction timer or duplicate tutorial-completion award.
- Never add extra tutorial wages, ordinary XP, arbitrary penalties, debt balance, permanent fraud flag, inventory object or a forced sequel to the municipal record mystery.

## Integration gates

1. **Content and state machine:** Stage 4 completion → appropriate Stage 5 dialogue and only its route's evidence → a saved stance → Stage 6. Test replays, denied actions and reloads.
2. **Combat compatibility:** Locate/restore the **approved** combat engine/event log from the historical v0.5.1/v0.6 code before integrating Stage 6; the active repository's Stage 1–4 gameplay core does not itself provide that old playable combat engine. No substitute combat calculations or narrated scripted fight should be inserted merely to connect screens.
3. **Economy and health:** Test a real victory, a real defeat and a clean uninjured victory where supported; inspect only real medical conditions; debit 10 once; leave with 10 starting coins assuming no separately approved transactions.
4. **Home:** Read/re-read notice, put it down, hear shared exact spoken line, finish tutorial once, reload completed home, and retain branch, combat outcome and first-person Journal.
5. **Visual review:** Desktop and mobile CRPG popups, readable object labels, staged cutouts and correct journal placement; a small popup must not expand into a second full-width gameplay panel.

## First executable slice

Start with **Stage 5 — The Wage Claim / Cornered** in the existing authenticated server/browser architecture. Implement source-of-truth actions, saved state, approved words, route-specific lines, choice-driven inspections and three persistent stances, but do **not** silently begin a fake Stage 6 battle. The next integration boundary must explicitly require the approved combat engine.

**Do not restart editorial approval of the already accepted Stage 5–8 script.** User review is needed for actual scene assets, visual positioning and any newly introduced mechanical rule, not for existing canonical dialogue.
