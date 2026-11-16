# Bellrunner Stage VII — Shared Clinic Integration

**Scope:** The approved Bellrunner [clinic script](clinic-treatment.md), shared [examination policy](../shared-clinic-examination-policy.md) and existing Millhand clinic implementation. No new medical mechanic, clinic NPC, fee, treatment item or combat change.

## Handoff from Dogman

The saved **victory** or **defeat** from Stage VI is the sole authority for the opening. The battle result shows a **Continue to the city clinic** action using the **same owner-provided primary nine-slice frame** as every other narrative choice, not a custom rectangle.

The first panel, already over the **clinic background**, is about arriving in the clinic rather than escaping Dogman:

- **Victory:** *You arrive at the city clinic on your own, still carrying your bag and papers. There is a place to sit, and a clinician is available to see you.*
- **Defeat:** *The passerby helps you through the city clinic door. You are unsteady on your feet, but you keep hold of your bag and papers. There is a chair nearby.*

Bellrunner then displays **one beat per Continue**:

> *The clinician looks up as you approach.*

> CLINICIAN: “What happened?”

> PLAYER: “A man tried to take my bag. He came at me with a club.”

> CLINICIAN: “Sit down. I'll have a look.”

The approved **Examine condition** action follows. Medical findings depend on the *actual* saved Dogman Health, wounds and bleeding, not on a scripted blow. The existing clinician assessment shows no injuries for a flawless victory, a dressing only for an actual cut, or a factual nonspecific finding for other injuries.

The existing **Speak to clinician / Review the price** state sequence is used under the hood; Bellrunner's player-facing clinician step is **Let the clinician examine you** to avoid repeating the introduction. The approved Bellrunner price exchange is:

> PLAYER: “How much will it cost?”

> CLINICIAN: “Ten coins. That covers the examination and any basic treatment you need.”

> PLAYER: “All right. Go ahead.”

The payment slip is revealed before the **Pay 10 coins** action.

## Shared code and economy

- The **same** `player_character_clinic` and `player_character_clinic_receipts` tables serve both origins. No new clinic schema or separate billing mechanism.
- `registerSharedClinicRoutes` in `millhand-clinic-routes.ts` accepts an allowlisted origin, selects that origin's completed combat row, and uses the same reducer, atomic 10-coin charge, Health discharge, revised request receipts and owner authentication. Existing Millhand endpoint remains intact; Bellrunner adds `GET/POST /api/characters/:id/bellrunner/clinic`.
- The original full Dogman battle remains immutable. A **0-Health defeat** is a valid arrival. After payment, restore the shared tutorial starting condition: Health 50/50, default Stamina/Composure, zero fatigue/stress/momentum/bleeding and no active wounds. No invented injuries are ever inserted into the saved combat record.
- The clinic background, ambience, readable dialogue, examination record, coin sound and journal are rendered by a **single shared Svelte component**, `SharedTutorialClinic.svelte`, mounted from separate Millhand and Bellrunner routes.
- Bellrunner's journal mentions Dogman and preserves the existing branch finding. No visit to Hector is added.
- A visible **← Back to Stage 6** button is retained in the sticky chapter header of every playable Stage VII clinic phase in the loopback/local testing environment. The server-authoritative developer-only rewind restores exactly recorded pre-fight Health, refunds an already paid 10-coin examination once, clears only Dogman combat and clinic state, and restarts Stage VI. The confirmation correctly names Dogman (not Flint). Earlier stage choices, skill gains and evidence stay intact. The control is not exposed on a production server; the later Stage VIII rewind belongs with the Stage VIII implementation.

## Stage VIII boundary

On **Leave the clinic**, Stage VII is saved as `LEFT`, the character advances to Stage VIII and the correct balance (normally 10 coins) is retained. **The shared home route still supports Millhand only.** Until the separately approved Bellrunner Stage VIII integration is implemented, Bellrunner returns to Character Home rather than navigating into a broken home route. No home rent dialogue has been invented or duplicated. The approved universal closing speech belongs to the later shared home implementation.

## Verification

`npm run verify:bellrunner-stage7` verifies approved dialogue, Medical reducer, exact fee, no false injuries, shared UI/code and stage transitions. The real PostgreSQL suite covers **all three Stage IV branches × both Dogman outcomes**, unhurt victory, zero-Health defeat, owner isolation, concurrent payment, original fight immutability, 20→10 coins, post-care Health and local paid rewind. API type-check, production Svelte build and existing Millhand clinic regressions also run in CI.

**Owner acceptance:** review the Bellrunner arrival phrasing, the price exchange, clinic journal and shared presentation. Stage VIII home remains the next separate PR.
