> **Historical archive.** Superseded planning or prototype record; see [active documentation](https://github.com/Lucian2403/The-Pall/tree/main/docs) for current rules.

# The Pall Millhand v0.3 — executable rebuild plan and acceptance gates

**Status: ACTIVE DEVELOPMENT PLAN (2026-10-22).** The approved global visual doctrine is [Documentary Industrial Art Direction](../../../../../00-vision/art-direction.md) (correct repository-relative path: `../../../00-vision/art-direction.md`). This file is an implementation contract, not a claim that v0.3 is already complete. v0.2 UI was rejected as an artistic dashboard; preserve v0.2 functioning gameplay, not its presentation.

## Scope
Rebuild runnable local Millhand **Stages 1–2** as a persistent browser-game interface with a genuine spatial workshop and separate destination pages. Do **not** implement Stage 3–8 yet; do not change the approved narrative, underlying world/economy or the standalone combat v0.5.1 module.

**Use the proven v0.2 source ZIP as the starting codebase.** Server-side `millhand.mjs`, `store.mjs` and combat v0.5.1 remain unchanged. Browser `public/index.html`, `public/app.js`, `public/styles.css`, UI tests and art slots may evolve. Keep the existing `pall-millhand-first-local-save-v01` localStorage key to resume test characters.

## M1 — browser game shell and full destinations (first code increment)
- Responsive shell: desktop left navigational rail, restrained approved-resource top bar, central activity view; mobile header and bottom navigation.
- **Real destinations only**: Workshop, Journal, Inventory, Character and Conversation History; no fake City, Market, Contracts, Home or Expedition navigation before corresponding gameplay exists.
- Full-page Journal, Inventory and Character, never side drawers; back/forward browser navigation where feasible; return from records to the exact workshop scene without losing progress.
- Journal gives current objective and ordinary work history from actual server state; must not reveal Stage 3 clue or developer acceptance information.
- Use only actual starter stats and items, not Focus/Ash currencies or mockup names.

**Acceptance:** all actual links work; record pages support keyboard/screenreader/mobile; old saves resume; original test suite unaffected.

## M2 — scene-first interaction
- Workshop occupies centre. Display meaningful spatial entities: Guther, docket, die set, blanks, hammer/stamping location and completed lot. Physical hot zones must map to legal actions from `state.choices`; never expose unauthorised actions.
- Stage 1 opens a **focused NPC conversation in the workshop** with one current utterance, spoken choices separately styled from actions, history on its dedicated route. Returning from records should not replay dialogue or charge a game action.
- Stage 2 selects physical objects through mouse/touch or equivalent accessible keyboard/list. Objects change visual or annotation state after actual straighten/replace/stamp/rework. Do not require memorised number keys.
- Single legal object action can be committed directly upon selection; multi-choice object offers only its legal alternatives. No mandatory extra `Continue` where it adds no gameplay.
- Keep approved Guther wording exactly as stored in the server dialogue.

**Acceptance:** each of the three bent blank outcomes is fully playable using spatial object interaction; Stage 2 return-docket path works; accessibility action list is equivalent; Stage 3 boundary never spoiled.

## M3 — deliberate action cadence and audio hooks
- A meaningful committed dialogue/work action responds instantly to input (pressed/busy), but its *new result presentation* arrives after a target ~1.2 seconds, with an event hook for future sound (dialogue / paper / metal / rework / completion).
- Navigation, records reading, browsing, cancellation and resume are instant. Do not artificially charge 1.2 seconds to interface-only viewing.
- Lock duplicate submission while busy, keep server request IDs/revisions authoritative, and show canonical state after refresh. Delay is a **UI reveal**, not in-world elapsed time, worktimer, resource cost or latency assumption.
- Respect reduced motion and a clearly labelled instant feedback preference, accessible busy/complete announcements; media must not autoplay unexpectedly.

**Acceptance:** verify action reveal timing, duplicate submit resistance, back/refresh during staged reveal and no extra rewards.

## M4 — documentary asset proof set
- Prototype 5 canon-safe image/graphic slots: urban context, workshop, Guther, plate/dies plus documentary UI graphic system.
- Soft practical lighting, working-class attire, credible process, clean mobile crop. Only slight print/engraving influence in records and labels.
- Avoid literal new municipal worker identifiers, specific dates, previously unapproved workshop location names, stylised propaganda slogans or invented game stats in images.
- Asset manifest lists replaceability, dimensions/aspect, fallback, semantics, provenance/rights and mobile crop.
- Later final-asset handoff triggers: ask user for Guther reference when portrait needs canon lock; workshop / city references when geography and production background are fixed; logos/archival pieces when brand/document polish begins; sound clips only after stable named event hooks. No request for all assets now.

## M5 — regression and package
- Baseline: `npm test` v0.2 had 42/42, `npm run test:combat` 49/49 untouched. Extend browser tests for M1–M4 and ensure all pass before calling the new version tested.
- Tests: all legal dialogue routes, 3 blank handling paths, rework/discard, Stage 3 boundary, local persistence/revision/retries, hotspot keyboard/mobile alternatives, Journal spoiler, 1.2s feedback, and no browser JS errors.
- Package runnable ZIP including source, replaces/fallbacks, docs and screenshots, excluding local saves.
- Commit individual source files to a dedicated GitHub prototype directory/branch (pending) and verify a clean checkout as a separate synchronization gate. Design documentation alone does not equal source synchronization.

## Visual/interaction constraints
- Current UI art/design is **not canon**. Nothing from the October 22 user screenshots grants approval to their locations, meters, professions, city labels or event data.
- Avoid all-purpose card dashboards, always-visible work sidebars, typed-number-only interaction, transcript-as-main-scene, overlay/drawer records, dramatic lighting and decorative gear imagery.
- Practical scene/subject interactions and documentary credibility first. Presentation should survive replacement of visual assets.
- Do not make an unimplemented panel into a clickable promise. If a game system is unavailable, omit it or clearly mark it non-interactive.

## First implementation move
Build M1 on copied local v0.2 source while retaining server rules and tests, then proceed with M2/M3. Defer asking user for production assets until the actual asset slot sizes, world framing and event list are demonstrably stable.

### Exact accepted world invariants
One Millhand creates 5/5/5/5 attributes, max Health 50, Craftsmanship +3, Basic Clothes + one Crude Small Bag and 20 coins. Stages 1–2 keep Guther's exact approved lines, ordinary platework and no wages/XP/loot. Stage 3's reveal, irreversible branch, second +1 Major Skill and all later combat/clinic/home mechanics remain unimplemented in this increment. v0.5.1 combat code remains unchanged.

**Project owner is the sole visual-content approver.** Developer is ChatGPT; no external developer is assumed.
