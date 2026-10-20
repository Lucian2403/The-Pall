# Browser Combat v0.4 — Compact Interface, Readable Costs, Stronger Flint

**Status: BUILT AS STANDALONE LOCAL DEMO (2026-10-20); USER PLAYTEST PENDING.** The source is delivered as the separate conversation ZIP `The_Pall_Combat_Browser_Slice_v0_4.zip`, **not** as source files committed by this documentation change. This note follows [v0.3 implementation](browser-slice-v0-3-implementation-status.md), the user's 2026-10-20 hand-on UI screenshot annotations, and their explicit direction to reduce footprint because combat will coexist with other MMO sections. The local program is **not an MMO server or production-ready UI**.

## Explicit UI/UX changes implemented

- **More compact on desktop and mobile**. Header, round title, character panels, four resource bars per actor, committed opponent cue, action controls and Chronicle are vertically denser. The overall combat UI uses a restrained **1080 px maximum shell** and two columns when space allows, stacked on smaller screens. Desktop mocked fixture renders around **579 px tall at 1260 px viewport** (mock screenshot, not a live-server play session). This is a standalone laboratory UI, not embedded in the eventual world view.
- **All requested red-zone copy removed** from the live compact combat screen: **“READ THE OPPONENT · OBSERVABLE INTENT”**, the generic terrain-reading advice (not actual boar location information), “One action. Make it count.”, “03 / COMBAT CHRONICLE”, “What happened”, Chronicle explanatory paragraph, action-button helper subtitles, and routine “Turn resolved and saved.” success text.
- **Critical green-zone information is emphasized**: enemy's **actual observable cue** is a substantial main line within a compact warning strip; action resource cost is **large amber type immediately beside Commit**, not small fine print. When Recover mode changes, the displayed gain responds to the selected reserve.
- **Action → subtype → Commit remains as accepted by user** (Strike/Guard/Move/Technique/Recover/Withdraw, plus Bandage conditionally). Aim and movement choices appear only for the selected action. There is no new mandatory action button.
- **Chronicle is condensed**: capped to 250px on desktop / 130px on narrow mobile, with **Expand / Collapse** for full history. Low-value repetitive intent and Momentum text is hidden from the collapsed reader's view, not removed from the persisted event ledger. The “Numbers” checkbox remains for verification.
- **End-of-fight breakdown**: generated from **structured event data**, not text parsing; rounds, player damage dealt/taken, successful Guard absorption, actual bleeding loss, player and enemy hits/attempts, and enemy Momentum spent. Only appears after a true resolved victory/defeat/escape. Stored JSON/revision/receipt replay semantics are preserved.
- Layout was rendered in Chromium for **desktop and mobile mock game state**. Direct browser navigation to localhost is blocked by execution environment administration; a real end-to-end browser play check is left to the user's machine. HTTP/browser asset tests do pass.

## Flint — player-requested changes, NOT permanent item balance

**User request:** Flint should be imposing, blunt club attacks around **14–17 damage**, and **rarely Guard**.

- Trial ordinary Flint club impact now rolls within **14–17 unguarded raw damage** before protection/Guard. Critical or special attacks and tactical openings can exceed that basic range, and attacks may still **miss**.
- Flint still starts **50/50 Health**; player **50/50**, Silas **50/50**, boar **30/65** (the boar Health is specifically user-locked).
- Flint NPC Guard decision frequency greatly reduced, currently around **5.5% of committed actions** in a scripted 200–500 seed repeated-Attack test, not literally zero. He retains his Momentum-spending **Driving Blow** and simple aggressive character. Silas's defensive logic was intentionally not changed.
- The very high damage would otherwise have caused a **serious wound on nearly every 15+ raw club hit** with the previous prototype threshold. For this trial, blunt serious-wound eligibility now starts at **19 net Health damage**, after Guard. That remains **provisional**, subject to approved conditional wound mechanics.
- No special opponent privileges: no forced hit, no instant weapon execution and no guaranteed player wound.

## Balance regression is substantial — avoid signing off without playtesting

`npm run simulate` generated 500 seeds per policy per encounter. Flint results, v0.3 → v0.4:

| Scripted player policy | v0.3 wins | v0.4 wins |
| --- | ---: | ---: |
| Basic Strike repeated | 367/500 | **193/500** |
| Guard / Strike alternating | 390/500 | **205/500** |
| Simple intent-aware responses | 396/500 | **220/500** |

These outcomes are not human player win rates. They show Flint is now considerably more dangerous, **potentially too punishing as an unarmed beginner fight**. It must be evaluated for risk/reward and whether meaningful Guard, movement, retreat and tactical openings remain viable. Don't compensate by arbitrarily lowering his Health or forcing misses. Additional mechanics (bleeding, Stamina costs, injury thresholds, Momentum) remain test settings.

The **boar** remains a 30/65 injured animal with real position/exit logic; **Silas** remains 50/50 and can apply actual bleed under his qualifying hook logic. Nothing in this revision declares their previous difficulty balance final.

## Verification

- **40/40 Node automated tests PASS**: inherited rule/HTTP/persistence coverage, added CSS asset serving, absence of redundant combat-copy strings, end-of-encounter breakdown present and stable on reconnect, new 14–17 blunt impact, lack of automatic serious wounds from ordinary Flint blows, and rare Flint Guard under an aggressive-player sample.
- `node --check` passes for all local server/client/engine JS modules.
- Sample desktop and mobile layouts rendered via Chromium's `set_content()` with **mock encounter state**, not connected to server; this verifies responsive rendering but not complete click-to-API flow.
- The ZIP can be extracted and run with Node.js 20+: `npm start` → `http://127.0.0.1:8787`, `npm test` or `npm run simulate`.
- Local-only JSON persistence, no real MMO world or authenticated production database; pricing, Stage 7 clinic, Stage 8 home, real armor and full medicine systems not integrated.

**Next priority:** collect hands-on evidence for Flint's first-encounter lethality and the compact action/intent scan hierarchy; revise **his AI or ability pacing** if the fight becomes punishing even to good tactical play. The compact UI is a direction to evaluate, not permanent visual approval.

References: [Part 10 integration contract](combat-integration-and-prototype-contract.md), [v0.3](browser-slice-v0-3-implementation-status.md), [approved boar Health](../onboarding/squatter/boar-fight.md).
