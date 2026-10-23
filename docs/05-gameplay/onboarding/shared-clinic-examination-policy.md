# Common Stage 7 — Post-Fight Clinic Examination (LOCKED 2026-10-19)

## Owner correction — full post-clinic readiness for regular play (2026-10-23)

The owner explicitly rejected the v0.6 test behaviour that left a character at their post-fight Health (or artificially stabilised at 1 Health). The new **onboarding exit requirement** is that immediately after the paid 10-coin examination/basic care, the player begins ordinary play with **full 50/50 Health and default starting combat condition**. Restore default Stamina/Composure, clear Fatigue/Stress, Momentum, bleeding and active wounds or other combat-only penalties. The values are the character's normal starting values, not necessarily 100 for every reserve. **Preserve base attributes, acquired skills, items, coins, route decisions and the historical original combat log.** 

The Millhand v0.6.1 test integration currently resets Health to 50, Stamina 90, Composure 80, Fatigue 0, Stress 0, Momentum 0, bleed 0, wounds []. These are **prototype defaults** inherited from the combat fixture, not new universally locked numeric maxima. When the shared persistent Health system is completed, restore from its actual default character state, not literal per-origin values.

The ten-coin fee is still paid **once**. Unhurt characters receive an examination without a fabricated injury or wound dressing, although the tutorial transition resets spent combat-only reserves. The historic fight outcome and injuries remain inspectable in the retained combat chronicle. This supersedes earlier paragraphs suggesting a wounded player should leave this tutorial with uncleared combat Health or a 1-Health floor. It does **not** introduce a general free-healing service for normal gameplay without separate design approval.

**Status: USER-APPROVED GAME-WIDE RULE (2026-10-19).** The user rejected a compulsory minor pre-combat injury and asked whether a guaranteed second enemy hit would be simpler. Because the second hit is not certain to occur (the player may finish the fight or the enemy may be unable to attack) and because a guaranteed hit would bypass normal hit/defence play, the user explicitly chose **option three: fair, ordinary combat followed by the normal clinic even when unhurt**. Applies identically to all six background origins; it supersedes all old “healthy fight handling TBD” statements.

## Locked rule

1. **Never manufacture an injury:** no scripted injury before combat; no first-hit or second-hit accuracy override; no unavoidable damage, forced status effect, mandatory wound or hidden reduction in Health. All attacks use the regular shared combat rules when implemented.
2. **Record actual results:** a clean player victory can mean full Health and zero injury; victory may also include real wounds, and defeat has real Health/defeat consequences. Do not rewrite loss as victory to satisfy Stage 7.
3. **Every origin visits the SAME standard clinic service after Stage 6:** whether the player won or lost, and whether hurt or entirely unhurt. Reuse the existing **[Examine condition] → [Review the price] → [Pay 10 coins] → [Leave]** workflow. No extra fight, separate minigame, scripted medical event or origin-exclusive provider.
4. **The flat tutorial fee is 10 coins**, clearly shown **before payment**. It covers the examination **and basic care if the character actually requires it**. It is **10 even when unhurt**, so the player pays for an examination, not an unnecessary treatment. For this fixed introductory service, there is no additional charge for basic care.
5. **Unhurt branch:** show true Health/status and a clear result such as UI text **“No injuries found. No treatment needed.”** The service still checks condition and confirms the character can leave. Apply **zero Health restoration, zero wound-removal effects and zero fake bandage** when there is nothing to treat. Do not pretend the examination grants bonuses or diagnoses a hidden illness.
6. **Hurt branch:** use ordinary injury-appropriate care; show what is actually treated and the real system result. Healing amount, injury-specific effects and recovery time remain global Health-system TBD; the fee and service structure are already locked. Don't promise full restoration until mechanics are specified.
7. **Pay once:** server-side atomic transaction confirms examination/care and charges 10 coins **exactly one time**, taking the universal 20 starting coins to **10** when no unrelated purchase has been made. Double clicks, reloads, defeat and retries cannot charge twice or create a duplicate service reward.
8. **Continue to the canonical shared Stage 8** with the same rented home, provisional 150-coin rent notice and exact already approved closing speech. No changed rent, payment, loot or XP.
9. **NPC dialogue:** approved clinic dialogue remains intact on paths where it is medically appropriate. For a perfectly unhurt character, omit/gate any injury-only statement (for example “Needs cleaning. I'll dress it.”) and show the plain result through the shared medical UI. Do not invent an alternative named clinician, medical mini-quest, diagnostic finding or unapproved mandatory spoken lines.

## Why not guarantee the enemy's second hit?

- The fight might end before the opponent makes a second attack; the player may guard, evade, interrupt, withdraw or disable the opponent.
- A 100% *accuracy* roll does not guarantee actual Health damage when the common defensive or armour rules apply.
- Forcing a second successful hit regardless of earlier combat outcomes requires special combat logic, contradicts the design goal of ordinary player-controlled turn-based fighting and discourages good defence.
- A fair examination-only branch is simpler and applies to all origins without modifying enemy AI, movement rules, scripted scenes or damage tables.

## Acceptance checks

| Scenario | Expected result |
| --- | --- |
| Victory, Health full, no injury | Clinic UI says no injuries, no healing, price 10, pay once, balance 10, Stage 8 |
| Victory, actual mild injury | Care is injury-appropriate, price 10, pay once, Stage 8 |
| Defeat, actual injury | Defeat remains recorded; ordinary clinic evaluates actual state and treats, price 10, Stage 8 |
| Player wins before enemy attacks twice | Win remains valid; no forced hit added; clinic still works |
| Player blocks all damage | Defence counts; no disguised wound; valid paid examination |
| Double-click / disconnect / restart during payment | Idempotent single charge, single completed clinic stage |
| Every origin and every Stage 4 branch | Same fee and medical policy, no unique Stage 7 balance or rent dialogue |

## Scope

**Locked:** policy to forgo guaranteed hits and injuries, mandatory **10-coin post-fight examination** regardless of injury, actual-injury care when needed, no fake treatment, one-time payment, common home.

**Still TBD:** normal combat formulas and enemy balance (including human/boar nonlethal win/withdrawal), injury categories and restoration effects, clinic service duration and non-tutorial pricing. None of these are silently approved by this rule.

Related: [shared onboarding](shared-structure.md), [shared state contract](shared-state-implementation-contract.md), [shared home](shared-home-rent-ending.md), [audit](audits/2026-10-19-six-origin-consistency-audit.md).
