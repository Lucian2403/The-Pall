# Bellrunner Stage VIII — Shared Rented Home and Skill Display

**Status:** implementation for owner acceptance, on a branch stacked atop the still-open Bellrunner Stage VII clinic PR. The final stage reuses the **existing Millhand rented-home scene, background, overlays, rent notice, storage, bed/rest controls, payment-free completion and universal closing speech**; it is not an origin-specific home.

## Stage VII → VIII

After the real 10-coin clinic payment, **Leave the clinic** now goes directly to `/characters/:id/home` for Bellrunner as it does for Millhand. Character Home resumes the same route after reload. The shared home service accepts the account-owned Bellrunner character only once Stage VII has saved **LEFT** and paid. It verifies the chosen Stage III Bellrunner route (contracts/trauma/machinery) against the completed Stage IV second job, and persists the route and Dogman victory/defeat outcome in the existing `player_character_tutorial_home` row. No new home identifier or database migration is needed.

Both origins use the identical room illustration `/locations/home/rented-room.webp`, the common notice prop, normal storage and personal Journal, the saved bed/rest interaction, and the **identical Stage VIII steps**:

1. Enter the existing rented room and find the notice.
2. Read **FINAL NOTICE** and its shared, data-driven 150-coin warning addressed to the actual character. This is provisional rent, *not* a new rent payment or eviction system.
3. Put the notice down.
4. Speak **exactly**: “Ah, hell. Need a place of my own. First I've got this rent to pay. More jobs... or I could make something to sell.”
5. Complete onboarding **exactly once**. The regular home view remains available for this character and is the same scene as Millhand, with no forced job, XP, coins or loot.

At completion, the only Bellrunner-specific text is the **completion heading** and a first-person Journal that includes **only the one route-specific local fact** (unpaid absence / non-work illness / moved retaining pin), and the **actual saved Dogman outcome**. The closed site's culpability remains unresolved. No Hector scene, alternate rent notice or modified universal speech is introduced.

## Back to Stage VII — all Stage VIII phases

A developer-only **← Back to Stage 7** is available from the rented room, including after the shared closing speech. The shared home rewind is reused for Bellrunner: delete only the home row and its receipts; reopen the paid Stage VII clinic (`LEFT → PAID`); preserve the already charged ten coins, saved Dogman battle/Health, Stage III branch and one-time +1 skill. It never refunds the clinic at this point or reruns the combat. An unstarted home record (the final clinic `LEFT` screen at saved stage 8) still uses the already-implemented **Back to Stage 6** reset, while a started home row uses the **Stage 8 → Stage 7** path. Production does not show development-only rewind controls.

## Industry / Hauling and chosen second skill

The approved Bellrunner origin remains **Industry 3 / 100**. The existing Stage III transactional branch-commit already grants exactly one stored **+1** in **Commerce** (Contracts), **Medicine** (Trauma) or **Mechanics** (Industrial Machinery). The former character display forgot to apply the provisional **1 / 100 + saved grant** rule to Bellrunner, so the chosen skill appeared as **1 / 100**. It now shows **2 / 100**, without repeating or modifying the stored grant.

**Hauling I** is now shown in the origin's expanded Industry subskill list and all-skills modal as **“I · starting”**, matching the existing Smithing I entry preview for Millhand. The API still has **no persisted specialization ledger or rank-training rules**, so this is explicitly labelled a starting preview, not an invented permanent rank, XP gain or second reward. Unrelated subskills remain untrained and display a dash.

## Verification

- `npm run verify:bellrunner-stage8`: shared home phases and fixed speech; three one-time route Major Skill displays; Hauling I preview; correct Bellrunner home, journal and rewind contracts.
- Real PostgreSQL integration: three branch routes × both Dogman outcomes; owned home admission, start/notice/put-down/finish, exact 150 rent and 10 coins, replay-safe completion, saved branch/outcome, immutable earlier work/combat, Stage VIII **Back to Stage VII** even after completion with no fee refund or duplicated skill grant.
- Chromium: same rented-room art, backdrop and stage/panel geometry at four widths; active and completed Bellrunner Stage VIII; visible Back to Stage 7; first-person journal with only the selected machinery finding, Dogman outcome, no Flint or unchosen branches.
- Existing Millhand Stage VIII, clinic, Bellrunner Stage VII and prior-stage regressions must remain green.

**Scope boundary:** Repeatable paid Hauling jobs, formal specialization rank persistence/training, the final rent payment/eviction system, post-onboarding home dashboard and new Hector work are separate, unimplemented systems; this finale does not invent them.
