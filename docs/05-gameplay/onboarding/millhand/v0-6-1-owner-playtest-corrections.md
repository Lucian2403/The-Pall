# Millhand v0.6.1 — Owner playtest correction pass

**Date:** 2026-10-23. **Status:** Local ZIP created and tested; not final UX and not a full GitHub source commit.

The owner rejected four aspects of the earlier v0.6 playable tutorial: (1) Flint introduced by name without telling a new player his role; (2) unclear next-action controls in the Contracts scene; (3) loss of the accepted compact combat interface; (4) weak, mechanical rent notice and incomplete clinic restoration. The correction package **`The_Pall_Millhand_v0_6_1_Playtest_Corrections.zip`** was created in the conversation, not yet committed as individual executable source files.

## Changes

1. **Flint introduction.** At first appearance the scene identifies him as a contractor's collector working on the Anvil plate lot; the dialogue role label likewise identifies him. Avoid inventing Flint's history or implying he personally altered the records.
2. **Scene clarity.** Stage 4 work actions, including **Submit the disputed docket**, are now explicit controls **above** the interactive object scene. The original inspectable props remain. No “correct object” halo is introduced.
3. **Combat UI and approved log.** The integrated v0.6 interface erroneously replaced the accepted **Action → subtype → Commit** pattern with one-click actions and showed a large empty workshop/scene frame. The correction restores a compact dual-actor panel, real Health and resource bars, enemy intent, family/subtype selection, cost next to Commit, and a collapsible Chronicle. Use/Withdraw are unavailable during this forced opening encounter; legal actions are checked by the authoritative server. **This is a faithful interaction-pattern restoration, not a pixel-perfect replacement for the old standalone demo's visual source, which is not included in the current package.** The combat engine and its persisted original event text are unchanged.
4. **Shared rent notice.** The previous sterile notice is replaced in v0.6.1 with an addressed warning, using the actual selected player name:

   > **FINAL NOTICE**  
   > [player name], you have to pay 150 coins in rent, or you are out. No discussion.

   The exact approved spoken line after setting down the notice stays unchanged. The 150-coin amount is still provisional. The letter now threatens the tenant, but there is **no implemented rent deadline, eviction timer or removal mechanic**.
5. **Clinic restores starting condition.** The 10-coin clinic still examines all players, even if unhurt. On completing the fee, the **active character** has **50/50 Health**, Stamina 90, Composure 80, Fatigue/Stress/Momentum/bleed 0, active wounds cleared, and keeps skills/equipment/10 remaining coins. These are v0.5.1 prototype defaults, not a declaration of permanent global combat maxima. Finished Flint fight history is preserved unmodified, including winner and original wounds. A zero-Health defeat no longer exits the clinic at 1 Health.

## Verification

- **89/89** Millhand and feedback regression tests pass.
- **49/49** isolated combat tests pass.
- Unchanged combat engine SHA-256: `4d7b2c958611c8b564113a9c8825b7346461516e02d237b09fce331ba3e5ef89`.
- Source JavaScript syntax checks pass.
- Chromium **static-state** screenshots were rendered for Contracts and combat with no page JavaScript errors. The complete v0.6.1 browser-click-to-live-server flow was **not** certified in this environment: direct browser localhost navigation is blocked.
- The deliverable ZIP contains source, tests and README; **no local playtest character tokens or session database are included**.

## Remaining necessary work

The illustrated Stage 4 props and general world UI are temporary and still need proper interaction/art production. The compact integrated combat interface needs human playtesting and final visual comparison against the earlier standalone UI before claiming visual sign-off. The final housing mechanics must be defined if a nonpayment/eviction threat is to become an actual game rule. A full production healing/medical system is not implemented; the guaranteed post-tutorial reset is an owner-directed onboarding exit rule.

The next milestone is testing this corrective ZIP on the owner's local machine, collecting actual usability and gameplay observations, and **preserving approved decisions** rather than silently substituting another UI design.

Related: [owner-directed shared rent warning](../shared-home-rent-ending.md), [owner-directed full-condition clinic exit](../shared-clinic-examination-policy.md), and [v0.6 integration notes](../../../archive/history/05-gameplay/onboarding/millhand/v0-6-complete-playtest-integration.md).
