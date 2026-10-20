# Combat Browser Slice v0.5 — Easier Flint, Attack-Spam Trade-Off, Delayed Impact and Ability Details

**Status: EXECUTABLE LOCAL PROTOTYPE PREPARED (2026-10-20); PLAYER PLAYTEST NOT YET APPROVED.** Companion ZIP: `The_Pall_Combat_Browser_Slice_v0_5.zip` provided as a conversation artifact, **not a source-code commit in GitHub**. This development note follows the user's hands-on v0.4 playtest: all fights harder, Flint especially punitive for newcomers, repeated Basic Strike seeming more successful than thoughtful decisions, desire for a **1–1.5-second impact delay**, reserved room for future combat levels/abilities and numeric descriptions for even basic actions. Player finds **Silas the most natural/engaging** so his distinct design should not be artificially flattened.

## What's implemented in the v0.5 standalone browser ZIP

1. **Flint's basic blunt impact stays 14–17 raw damage**; test club accuracy lowered from **70% to 49%** before special/aim/opening modifiers. The club remains powerful but less reliable, justifying a slower, committed swing. This is a trial novice balance value, not a permanent item stat. Flint rarely Guards and still earns/spends Momentum.
2. **Basic Strike Stamina cost goes from 8 to 11** (trial). After **two consecutive ordinary Strikes**, the next one costs **14** and each continued consecutive Strike retains the surcharge; changing to Guard, Move, Recover, etc. breaks the Strike chain. Normal ≤20-Stamina Fatigue rule still applies.
3. **Visible overcommitted stance** after **at least two successive** ordinary strikes: other combatant can exploit a limited **+18 percentage-point accuracy opening** on its next committed attack without extra raw damage. Both player and NPC can become exposed through repeated attacks; no new meter and no hidden automatic Health damage. Intent is committed before the current player choice, never cheating against the current click. The HUD visibly warns when the player's repeated strikes leave this opening.
4. **Defending a genuine Flint club blow is more useful**: trial **68% Guard mitigation**, attached to the relevant club's attack profile (not a player-only exemption). An actual boar charge retains trial 30%, and Silas's hook trial 50%. The already accepted useful Guard Momentum/opening and legal movement remain important.
5. **Action/ability details appear in a small collapsible inspector**. Its compact summary always displays meaningful current server-provided numeric values: e.g. selected aim contact chance, current rolled damage band, target Guard mitigation, action Stamina/Momentum cost, plus recover effects. Expanding it reveals a larger plain-language description. It does not add permanent space-hungry slots for abilities that don't exist yet. Future levels and skills can extend the same panel; the v0.5 build does **not** implement skill levels or a complete ability catalogue.
6. **1.25-second visual reveal** for *any committed standard/technique action*: controls lock, an action-appropriate pending cue appears, and a minimum 1250-ms interval from the request start elapses before Health/log changes appear. The **server saves and resolves immediately**; there is no sleep in the authoritative resolver and no re-roll. It respects `prefers-reduced-motion` and includes no sound yet.
7. **v0.4 compact UI and chronicle, three fixtures, state persistence, idempotency, user-locked injured boar 30/65 and human 50/50 remain intact.** No fixed new player stat or final enemy item attribute is locked here.

## Testing evidence

- `npm test`: **46/46 PASS** on Node.js 22, including additional tests for strike cost/surcharge, visible stance only after two Strikes (a single Strike is **not** enough), Flint test weapon values, per-action numeric metadata and presentation-delay UI markers; prior rule/HTTP persistence tests remain.
- 500 scripted seed trials per tactic, NOT human win rates:

| Fixture | Strike spam | Alternating Guard/Strike | Scripted tactical responses |
| --- | ---: | ---: | ---: |
| **Flint** | 270/500 | 333/500 | 337/500 |
| **Boar** | 84/500 | 33/500 | 500/500 true-route policy |
| **Silas** | 378/500 | 311/500 | 362/500 |

- **Flint v0.4 comparison:** Strike spam 193/500; Guard/Strike 205/500; tactical 220/500. Revised outcomes ease novice lethality while giving varied actions an actual advantage.
- **Silas remains an open balance issue**: a basic scripted Attack spam still outperforms the simple alternative scripts, and the player previously enjoyed Silas's natural difficulty. Do **not** claim the spam problem is fully solved game-wide.
- Local HTTP endpoint `/api/health` returned 200. Chromium direct navigation to localhost was **blocked by the execution environment**. A DOM smoke test using Chromium `set_content` and an injected bridge to the real local Node HTTP API exercised encounter selection, expanded numerical details, Commit, pending cue and timed result reveal with **no JavaScript errors**. The end-to-end same-origin browser connection still needs actual user local testing.
- No production deployment, MMO authentication/database, 36-onboarding-branch integration, actual extra combat levels/abilities, sound assets, medical/farming/world systems or final combat balance.

## Next hands-on review request

- Flint: Is a heavy 14–17 blunt strike still intimidating, but misses and Guard now make an unarmed tutorial fight comprehensible? Compare a few repeated-Strike attempts with deliberate Guard/Move decisions.
- Silas: preserve personality and difficulty, but identify whether the best strategy is still repeat-Strike; check whether the exposed-stance warning helps.
- **All three:** Does the minimum **1.25 s** impact anticipation improve feel or drag out a longer fight? Does the collapsed inspector show enough numbers while allowing full description when wanted? Can future ability levels fit without adding bulky permanent UI?

**Approval boundary:** The user has asked to build/test these proposals, but has **not permanently approved trial Flint 49% accuracy, Guard 68%, 11/14 Stamina costs, +18pp overcommit vulnerability, or 1.25 s as the final production cadence**. The boar's starting **30/65** is already user-approved and unchanged.

Related: [v0.4 build](browser-slice-v0-4-compact-ui-and-flint-playtest.md), [Part 8 Stamina/Focus](stamina-fatigue-composure-stress-focus-proposal.md), [Part 9 wounds](wounds-bleeding-incapacitation-treatment-proposal.md), [Combat integration](combat-integration-and-prototype-contract.md).
