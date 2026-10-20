# Combat Browser Slice v0.3 — Health Parity, Intent, Boar Terrain, Defensive Openings

**Status: WORKING STANDALONE LOCAL PROTOTYPE (2026-10-20); 37/37 Node unit / HTTP integration tests PASS.** The companion `The_Pall_Combat_Browser_Slice_v0_3.zip` is provided in the associated project conversation, not yet committed as source to this GitHub repository. All source, runnable HTTP server, browser assets and tests live inside that ZIP. **This is not a production or hosted MMO.** Review against [user feedback](browser-slice-v0-2-second-playtest-feedback.md).

## Binding user decision: injured boar 30/65

**USER-APPROVED SPECIFIC VALUE:** The young, ordinary, already-injured boar enters the Squatter tutorial fight with **30 current Health out of 65 base maximum Health**. This is now recorded in [the canonical boar encounter](../onboarding/squatter/boar-fight.md). Its existing leg injury is present in encounter state and does not automatically impose an extra unseen bleeding wound. A newly incurred qualifying injury can still affect state normally. Boar starting 30/65 is distinct from full Health 65/65 and the superseded v0.2 20/20 fixture.

**APPROVED TEST DIRECTION, NUMERIC PARITY NOT A GLOBAL NPC STAT:** Flint and Silas Pumpard now start with **50/50 Health** as ordinary, not-presently-wounded human opponents; the novice player remains **50/50**. This replaces v0.2's arbitrary Flint 24 and Silas 22. **No universal identical Health for all future humans or animals is implied.** Combat damage bands (unarmed 4–8, Flint club 7–13, Silas hook 5–11, boar charge 8–16), hit odds, Guard mitigation, action costs, enemy AI weights and proposed technique abilities remain **provisional test values**, not locked lore/item data.

## Changes in engine and UX

1. **Honest partial telegraphs:** the enemy still chooses a concrete legal action before the player input, but the client receives a **coarse observable stance/threat category** and contextual prose rather than raw `attack`, `guard` or `withdraw` action types and exact zone. Strong Momentum attacks remain visibly dangerous rather than wholly hidden. No hidden enemy retargeting after the player's selection.
2. **Boar terrain is no longer one boolean shortcut:** `laneClear`, `mouthClear`, actor position, contact/near/far and actual target spot are tracked. The boar needs a credible path onto safe ground to withdraw. One Sidestep / Cover / Back Away action from the default narrow path **does not automatically win**. A later Move can clear the mouth; the boar may momentarily hesitate. At Near distance the boar can commit a shorter, quicker charge at the *old* player spot, so a late Move can still suffer a real hit. A Guard against charging mass has a trial 30% instead of 50% mitigation. The boar's ordinary charge consumes **zero Momentum**.
3. **Approved pre-fight boar positions:** local selection supports `Hold ground on narrow path`, `Behind broken fence` and `Firm stone embankment`, following already-approved Stage 5 choices. They affect starting position; embankment +1 readiness is test-only, not approved skill balance. Full origin Stage 5 history remains not integrated.
4. **Human AI:** evaluates observed **prior** player action history (not the current choice) to sometimes Guard against repeated strikes; spends actually earned Momentum; NPC retreat follows credible Health pressure rather than the arbitrary prior 8-Health yield gate. Retreat decision weights remain provisional and must be improved before final balance.
5. **Short-lived tactical opening:** a genuine effective Guard, committed heavy miss, or successful Move that invalidates an attack can create an opportunity for a subsequent attack. **Test-only** opening bonus: **+20 percentage points contact probability and +5 raw impact**; no extra per-turn action and no new reserve meter. This deliberately improves defensive tactics, but the magnitude should be stress-tested.
6. **More contextual chronicle:** narrative choice avoids very recent exact templates, describes actual Guard mitigation, realistic body locations, relevant terrain and previous action; special events, wounds and openings are separate factual logs. Replay remains deterministic and cannot create a fake fracture just for prose. **This is an incremental improvement, not a complete DF-style procedural narrator.**
7. **Preserved desired UX:** choose Action → choose subtype (Move direction, aim zone, recovery type) → Commit. Boar route status shown explicitly without revealing the future committed NPC action. Existing file-backed session/revision/idempotency protection stays intact; browser v0.3 uses new localStorage keys rather than silently migrating v0.2 saves.

## Verification evidence

- `npm test` **37/37 passing** on Node.js 22: engine rules, changed Health fixtures, boar 30/65 and pre-existing injury, boar sidestep/escape differences, short lunge, honest telegraph categories, Momentum spending and defensive opportunities, Stamina/Fatigue, real bleeding, idempotent revisions, server authentication boundary, server restart/resume and selectable boar staging.
- `npm run demo` produced consistent three-encounter transcripts with Flint/Silas at 50 Health and boar at 30/65.
- `npm run simulate`: **500 seeds per policy per opponent**; Flint Basic Strike wins **367/500**, Guard/Strike **390/500**, simplified reactive policy **396/500**. Silas Basic Strike **343/500**, Guard/Strike **373/500**, reactive **353/500**. The boar survival-route strategy **500/500**, because clearing a real safe route is still a reliable intro victory; other strategies fail often. **These are scripted decisions, not human win rates or proof of balanced difficulty.** They do indicate Guard/Strike no longer underperforms spam against Flint in this prototype.
- Local HTTP `/` returned 200 and `/api/health` confirmed demo-only mode; Chromium localhost screenshot attempt was **unsuccessful in execution environment**, so no end-to-end browser click or visual QA is claimed. The user should test v0.3 on their machine.

## Open engineering/experience issues

1. **Balance isn't locked:** the Guard → opening payoff is intentionally large as a first trial and may overreward defence; trial enemy retreat is still simple; boar escape remains learnable.
2. **Boar position remains relative, not real geometric coordinates or collision system**; no actual destructible fence yet. Its two-step mouth clearance is a shared-action prototype, not a new origin-only minigame.
3. **Logs may still feel templated.** Need state-memory richer than just phrase reuse suppression, while retaining deterministic honest factual events.
4. **The browser UI direction is still a test.** Only the Action → subtype → Commit interaction was expressly liked; typography, layout, hierarchy, palette and logs are not final approvals.
5. **Full server concerns remain:** no proper multiplayer database/auth, complete six-origin narrative state, Stage 7 clinic 10-coin transaction, real market/equipment integration, firearm activation, world time, death/wilderness extraction or PvP.
6. **Three beginner acceptance scenes:** Flint (equal Health, credible retreat and attacks that can miss), Silas (equal Health, actual guard/weapon context and sealed box), injured boar (30/65, path/charge and nonlethal escape). No new story rewards or invented wounds.
7. **Three hypothetical endgame stress cases (NOT canon):** human rifle duelist with equal biological Health progression but real armor; two opponents with independently committed intentions/Momentum; industrial pressure hazard plus bleeding/limb injury. These are **not implemented** in v0.3 and remain integration tests for later.

**Change control:** user-approved boar Health **30/65** remains fixed until expressly revised. Flint/Silas **50/50** are approved as a fair prototype starting configuration, not permanent NPC lore beyond this slice. Everything else in v0.3 remains measured, tested and adjustable. No claim of production readiness.


## First actual human playtest of v0.3 — 2026-10-20

**Player feedback (observed, not inferred):**
- The new version is **better**.
- Flint remains **easy to defeat**.
- The player **lost twice to Silas Pumpard** but believes the encounter is beatable. Two losses are not proof that Silas is statistically overpowered; neither do the seeded tests establish that he is balanced.
- The boar's prior trivial-exit problem is **considered solved in the player's tested difficult-exit setup/preset**. Do not reopen that encounter solely because a scripted bot can solve a correct route reliably.

**Grounded engine explanation:** Silas uses a **sharp** work-hook profile with 68% trial accuracy and a provisional sharp wound rule: an actual landed hit causing at least 6 net Health harm can create **Light Bleeding**, subsequently ticking once per round. Silas also has Guard and an earned-Momentum **Hook and Draw**, and his baseline human Health is 50/50. Flint uses a blunt club, so the elementary bleed branch cannot trigger from his basic strikes. This difference may help explain why Silas is tougher in human play, but the actual cause of the two losses was **not logged or reported** and should not be asserted.

**Scripted verification reference:** the existing `npm run simulate` on the available v0.3 archive reports for 500 seeds per strategy: **Flint** 367/500 Basic Strike, 390/500 Guard/Strike, 396/500 scripted react; **Silas** 343/500 Basic Strike, 373/500 Guard/Strike, 353/500 scripted react. These are only simulation-policy outcomes, not human win rates or proof of appropriate difficulty. They show a smaller difference than the player's small two-attempt sample might suggest. **Do not change balance numbers on the basis of two Silas losses alone.**

**Recommended next iteration priority (not a committed code change):**
1. **Keep v0.3 boar difficult-exit movement** unchanged pending additional contradictory player evidence. Maintain locked boar 30/65.
2. **Tighten Flint's tactical AI**, not his human 50 Health: investigate overexposure after failed heavy attacks, retreat too early, defensive responses and whether blunt club threats remain meaningful. Do not inflate raw damage solely to force defeats.
3. **Instrument Silas losses** with end-of-fight summaries: actions, incoming net damage, bleeds/ticks, effective Guard use, Momentum technique hits, starting position and remaining enemy Health. Use this to separate tactical difficulty from punishing bleed arithmetic.
4. **Preserve differences in NPC identity**: Flint should be imposing and straightforward; Silas can be guarded and opportunistic. They need not have identical player win rates, but both should reward genuine informed decisions over click-spam.
5. **Avoid new mechanic expansion** until more human playtest data identifies actual balance bottlenecks. No new numeric canon established here.

**Approval status:** This section records player experience and suggests targeted testing. The player has not approved or requested changing Flint/Silas damage, bleed, AI percentages or earned Momentum brackets from v0.3 in this exchange.
