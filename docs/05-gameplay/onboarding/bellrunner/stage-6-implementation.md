# Bellrunner Stage VI — Dogman Combat Integration (13 November 2026)

**Status:** implementation under review. The encounter uses the [approved Stage VI outcome and staging](dogman-fight.md) and the same deterministic shared v0.5.1 combat engine, responsive combat HUD, battle chronicle, sound effects, Health persistence and one-time idempotent commands as Millhand's Flint fight.

## Continuity from Stages IV and V

Stage IV's last service-gate choice transitions to Stage V without an extra confirmation screen. Stage V's saved final position (`street`, `cart`, `defend`) immediately advances the character to Stage VI and opens the Dogman combat route. The combat API obtains that stance exclusively from `player_character_bellrunner_dogman`; no client-selected combat starting position is trusted.

| Saved Stage V stance | Shared Stage VI mechanic |
| --- | --- |
| Step back toward the open street (`street`) | `near` distance, ability to reposition / close |
| Move behind the work cart (`cart`) | `far` distance; Dogman must navigate around the cart before striking |
| Stand your ground and protect the bag (`defend`) | `contact` range, +2 existing Readiness to the courier (not free Guard) |

Dogman's first heavy strike is telegraphed in the existing intent display. The player retains the ordinary unarmed Attack, Guard, Reposition, Recover, Press Advantage and Focused Stance actions. The work cart is an obstacle, not a weapon or a perpetual damage shield.

## Trial encounter tuning

The original Flint profile is **unchanged**. Dogman's quicker, thinner club receives:

| Trial statistic | Flint | Dogman |
| --- | --- | --- |
| Ordinary club damage range | 14–17 | **12–15** |
| Base club accuracy | 49% | **49%**, unchanged |
| Enemy Health | 50 | **50**, unchanged |
| Guard chance if player has at least 10 Momentum | 4% | **12%** |
| Guard response after two consecutive player attacks | 10% | **18%** |
| Additional evasive sidestep at contact, after Round 1 | None | **8%** conditional trial roll |

Dogman's defensive choice is a **committed, telegraphed action**, not a passive increased Dodge chance. On a rare sidestep, the original engine resolves Move speed 7 and the real reach difference: a slower fist attack may fall short; a courier can close the gap on subsequent turns. Dogman's ordinary swing speed is 3 (Flint 1) to convey quicker handling without increasing club damage. These are prototype tuning figures, **not final MMO balance**. Existing Flint, Silas and boar calculations have been preserved.

## Persistence and outcome

New additive SQL migration: `0019_bellrunner_dogman_combat.sql`, included in `npm run bellrunner:migrate`. The authenticated `GET/POST /api/characters/:id/bellrunner/combat` adapter performs owner checks, verified sessions, canonical stance prerequisites, server-selected seeds, character-row locking, revision validation, immutable request receipts and atomic Health/historical event updates.

The original engine outcome (`player_victory` or `player_defeat`) is saved without any fabricated win, loss, random post-fight wound, skill level, coin, item or inventory loss. On victory, Dogman gives way to the public street and keeps no paper. On defeat, he is interrupted by the workers approaching from the road; an unnamed passerby helps the courier. The route sheet, bag and Stage IV evidence remain. The defeated Dogman art appears only if the **player** wins. The journal is in first person and records the actual saved outcome.

Rewind to the Stage V position choice is permitted only **before** combat has initialized. It is rejected as soon as the first combat row exists, avoiding undoing damage or replaying a victory. Stage VI is retained as **COMPLETED** after the fight. Bellrunner Stage VII clinic is not yet implemented, so no invalid clinic URL, charge or fake cure is shown.

## Verification and acceptance

- `npm run verify:bellrunner-stage6`: baseline Flint weapon unchanged, Dogman damage, unarmed starter, staging, deterministic Guard/sidestep behavior, UI and persistence contract.
- Real PostgreSQL integration tests: all three stances, account isolation, idempotency, stale commands, concurrent-minded transaction locks, actual saved victory or defeat, current Health, stage status and irreversible combat rewind protection.
- Existing shared engine and Flint combat tests, Svelte compilation and Chromium workshop regressions run in CI.

**Visual acceptance** remains before merging the PR. The owner should review Dogman's proportions in the shared battle HUD, the placement of the work cart, real club intent text, Dodge/Guard frequency and the two aftermath depictions.
