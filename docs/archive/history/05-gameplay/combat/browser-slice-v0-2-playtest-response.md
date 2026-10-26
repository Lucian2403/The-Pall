> **Historical archive.** Superseded planning or prototype record; see [active documentation](../../../../README.md) for current rules.

# Browser Combat Slice v0.2 — Playtest Feedback, Corrections and Open Balance

**Status: IMPLEMENTED IN A SEPARATE LOCAL PROTOTYPE (2026-10-20); NOT APPROVED FINAL BALANCE.** This is a development note following the user's hands-on test of v0.1. The **standalone source ZIP** is delivered in the corresponding project conversation, not stored in GitHub by this documentation change. No major combat rules, named special attacks, damage values, NPC stats or visual style are automatically locked by this iteration.

## Player's first hands-on findings — quoted sense, not dismissed

1. **Flint seemed always to hit**, producing the exact repeated line “Flint lands a torso strike for 10 Health damage,” unless the player Moved.
2. **Player damage felt fixed at 6**, and it looked as if Flint were Guarding every time.
3. **Flint accumulated up to 70 Momentum but never used it.**
4. **Silas felt the most dynamic** of the three fixtures.
5. **The initial UI/UX was disliked wholesale** despite prototype status.
6. **The mechanical/identical combat logs were disliked.** The user requested a more dynamic descriptive battle chronicle inspired by Dwarf Fortress, but not nearly as elaborate.

These are actual player-observed deficiencies and warrant changing the engine and interface, not merely inserting flavor text.

## Diagnosed v0.1 implementation defects

- Flint's AI was near-hardcoded: at Contact range it selected a basic Attack repeatedly, no valid NPC special-technique branch existed, and the underlying fixture club damage was fixed at 10.
- The basic player weapon profile had fixed damage 6. The v0.1 event suffix **“after Guard”** described the target's Guard effect, which could be mistaken for Flint constantly defending. New logs explicitly name who Guarded and how much of the **rolled** impact they absorbed.
- Enemy intent/event lines repeated identical templated sentences even when situations differed.
- The old UI exposed unrelated target/move/recovery controls simultaneously and permitted instant action submission from clicking any action.

## What v0.2 actually changes (PROVISIONAL TEST RULES)

- **Meaningful chance to miss remains** the existing one-roll contact mechanic: Flint does **not** receive guaranteed hit. Across seeded tests, club attacks both connect and miss.
- **Variable test damage:** club **7–13** unguarded base, unarmed **4–8**, Silas work hook **5–11**, boar charge **8–16**. These ranges are calculated from the temporary base fixtures, are not copied from approved weapon item data and are **not locked balance**. Guard mitigates the resulting impact once, if relevant.
- **Earned enemy Momentum is spent:** at **20+** Momentum Flint can commit a telegraphed **Driving Blow**, and Silas a temporary **Hook and Draw**. At 30+ they currently prioritize one; otherwise trial conditional choice. Technique costs **20**, adds **+4 provisional impact**, has a small contact penalty, can miss, and doesn't grant hit Momentum by self-refund. Boar's opening charge remains ordinary zero-Momentum.
- **AI behaviour changes:** Flint can target torso or limbs, choose Guard occasionally under real threat, select special attacks only with enough earned Momentum, close position, or Withdraw after valid nonlethal pressure. The player receives one action and the enemy remains committed before player input.
- **Narrative event system:** seeded variant descriptions for both ordinary hits and misses, actual anatomical hit location, credible motion, explicit Guard absorption, wound/bleed events and round-by-round grouping. Routine Momentum lines are hidden in the reader-friendly UI unless the player enables **Show numbers**. The event data persists real numerical results for QA and reconnect.
- **New UI:** industrial dark, restrained visual style replacing v0.1. Distinct combatant bars, prominent enemy threat, one selected action at a time with **Commit** confirmation, context-only option chips for target/movement/recovery, and grouped Combat Chronicle. This is a **new direction for player evaluation**, not a signed-off final visual identity.

## Verification performed

- **28/28 automated Node tests pass** (previously 23), including new seeded hit/miss variability, rolled damage bands for player and Flint, actual Flint ability spend, no same-technique Momentum refund, and distinct descriptions with real impact records.
- **500 seeded simulations per strategy per opponent** via `npm run simulate`. Example Flint results: Basic Strike spam **447 wins / 500**, Guard/Strike alternating **284 / 500**, scripted response policy **439 / 500**. These are **not human player win rates** and prove only that trial balancing remains open; strong tactical play is not reliably superior to attack spam yet.
- A Chromium browser did render the static interface and passed a DOM action-selection-and-commit smoke test using a **mocked API response**. Automated **direct navigation to the actual localhost server was blocked by environment administrator restrictions**; therefore do **not** claim the complete browser-to-real-server flow was machine-verified here. The 23 baseline+5 additional Node tests do cover server HTTP and persistence separately. The player should run v0.2 locally to evaluate it end to end.
- No cloud/live MMO deployment, production authentication, cross-process database transactions, complete skill/equipment/medicine integration, multi-foe AI, real clinic payment or six-origin story wiring has been completed.

## Open design issues for next hands-on test

1. **Flint difficulty and agency.** Can the player discern when he is winding up the Driving Blow? Are misses, cover and reactions satisfying? Is Attack spam still too effective? Should he parry occasionally more/less often?
2. **Player physical impact.** Do 4–8 provisional fist strikes feel coherent, and does the current 50 Health baseline create fights of an appropriate duration? Calibrate with weapon/armour data, not by quietly hardcoding results.
3. **AI readability.** Is it obvious Flint isn't permanently Guarded, and when his special is available? Watch whether his choice is too predictable at exactly 30 Momentum.
4. **Narrative log style.** Short, concrete 19th-century physical descriptions rather than debug output, but avoid excessive verbosity, humorous anachronisms, repetitive templates or fake injury reports.
5. **UI/UX acceptance.** User disliked **all** of v0.1, so v0.2 must be treated as a fundamentally revisable prototype. Solicit specific comments on hierarchy, action confirmation, placement of enemy intent, resource bars, contrast, and battle log.
6. **Balance metrics.** Instrument actual human runs and subsequent broader seed simulation. Do not lock Head/Torso/Limbs chance bands, wound thresholds, NPC technique frequency or bleeding damage from this build.

**Follow-up direction:** improve gameplay feeling and decision quality before continuing to design new combat systems or declaring browser-MMO implementation complete. Avoid changing locked six-origin story consequences or the one-time 10-coin clinic examination policy.

Related: [Part 10 contract](combat-integration-and-prototype-contract.md), [Browser v0.1 status](browser-slice-implementation-status.md), [approved combat foundation](../../../../05-gameplay/combat/approved-combat-foundation.md), [Momentum](../../../../05-gameplay/combat/momentum-generation-and-spending-proposal.md).
