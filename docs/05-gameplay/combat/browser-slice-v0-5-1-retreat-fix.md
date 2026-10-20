# Browser Combat v0.5.1 — Premature Human Retreat Fix

**Status: TESTED LOCAL PATCH (2026-10-20), NOT FINAL ENCOUNTER BALANCE.** Companion `The_Pall_Combat_Browser_Slice_v0_5_1.zip` is delivered through the project conversation; source ZIP is **not committed to this repository**. This is a narrow fix to the standalone v0.5 test harness.

## Human playtest evidence

A Flint encounter log showed a premature withdrawal on Round 7 when Flint retained **18/50 Health**, while the unarmed player retained **2/50 Health**. The 18 comes from recorded player hits of **6 + 8 + 7 + 5 + 6 = 32**; the player reached 2 from Flint's hits of **14 + 15 + 19 = 48**. Flint had already landed a Driving Blow and was positioned to finish the exchange. The log said he relaxed his grip and withdrew despite this advantage.

**Cause (confirmed in the v0.5 `combat.mjs` code):** `shouldHumanYield()` used the human opponent's own remaining percentage and inferred pressure from old player actions/Momentum/wounds, but did not test the player's current condition. Flint could therefore roll a retreat after taking 45% or more of his own Health damage while the player was nearly downed.

## v0.5.1 change

- Before voluntary nonlethal human retreat, check **relative effective Health fractions and remaining enemy Stamina**. If the player is nearly down (trial ≤25% of effective Health ceiling), the enemy is materially healthier (trial relative condition advantage ≥8 percentage points, with greater absolute current Health) and can keep pressing (trial ≥10 Stamina), it **does not choose voluntary Withdraw at that point**.
- Preserve previously established human-specific retirement probabilities **outside that clear-dominance gate**. The fix does **not** automatically trigger a fatal attack, grant perfect accuracy, change committed enemy actions, force a player loss, or remove genuine nonlethal surrender when the opponent is outmatched.
- The same basic consistency condition applies to **Flint and Silas**; the boar's real geometry/withdrawal motivation remains separate and unchanged.
- **No new combat ability, damage range, Stamina expenditure, Focus/accuracy, description, Health, Momentum amount or UX timing was changed or made final.** The user's latest note explicitly reiterates that action values and descriptions are not yet locked.

## Verification

- Updated standalone Node harness: **49/49 automated tests PASS** (prior 46 plus three regressions):
  1. Across 300 seeds, Flint at 18/50 against player 2/50 does not commit Withdraw.
  2. Across 120 seeds for each of Flint and Silas, a human at 21/50 against player 6/50 does not give up despite player Momentum.
  3. Both Flint and Silas **can still** voluntarily withdraw in a genuinely outmatched 8/50 versus 44/50 state.
- **500 seeded simulation runs per strategy per opponent** after the minimal fix:
  - Flint: repeated Strike **233/500**; Guard/Strike **311/500**; scripted read/respond **317/500**.
  - Silas: repeated Strike **344/500**; Guard/Strike **304/500**; scripted read/respond **359/500**.
  - Boar: unchanged behavior; correct escape route succeeds reliably.
- **Compare to recorded v0.5 baseline:** Flint **270/500**, **333/500**, **337/500** respectively, and Silas **378/500**, **311/500**, **362/500**. Removing premature yield can lower scripted win rates, particularly for careless aggression. These are **not human win rates** or final tuning. Tutorial balance remains open.
- ZIP integrity and full Node tests were verified after packaging.

## Design concern for later

This narrow gate prevents obviously irrational surrender, but the long-term approved AI design still requires a **single objective-driven evaluator** considering relative Health, actual wounds, weapon reach, available exits, bystander pressure, Momentum, Fatigue, initiative, and the opponent's reason to fight. It must make a **credible choice with fair precommitment and partial telegraph**, not select Withdraw on a single Health threshold. In the present prototype, a true nonlethal human victory can occur with remaining Health when the relative situation justifies it. No permanent character death rules are introduced.

**Next human playtest:** verify Flint does not flee while comfortably winning; check he remains beatable through mixed decisions. No changes to the compact UI, delayed impact or numeric ability tooltip in this maintenance patch.

Related: [v0.5 baseline](browser-slice-v0-5-pacing-and-ability-details.md), [Enemy AI approved principles](enemy-ai-decision-system-proposal.md), [Part 9 wounded/downed](wounds-bleeding-incapacitation-treatment-proposal.md).
