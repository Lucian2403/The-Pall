# Six-origin onboarding consistency audit — 2026-10-19

## Final clinic policy decision — 2026-10-19

**P0-01 is now RESOLVED IN DESIGN.** The user declined a minor pre-combat injury, asked whether making the enemy's *second* attack hit every time was a simpler alternative, then chose the fallback examination-only solution because a guaranteed second hit cannot reliably occur or cause damage in fair combat. **No first or second attack is forced to hit.** [Shared Stage 7 clinic policy](../shared-clinic-examination-policy.md) is **LOCKED**: every character pays exactly 10 coins for a real post-fight assessment; a healthy fighter is examined, shown “No injuries found. No treatment needed,” and receives **no fake treatment or restoration**. Genuine wounds are treated appropriately within the same fee. All six clinic documents, the shared state contract and common home document now reflect this rule. Implementation and QA are pending; the **remaining P0 combat/nonlethal/Health numerical design** is still open.

## Remediation update — user approved fixes, 2026-10-19

The user approved the audit's recommended **continuity, source-tracking, literal-dialogue and shared state/QA fixes**. These changes have been entered into the approved story documents and [shared implementation contract](../shared-state-implementation-contract.md). **This is documentation/specification, not evidence of shipped code or successful playtests.** Previous findings below are preserved as the initial audit snapshot; this section records their updated disposition.

| Original finding | Current status | Implemented design correction / remaining requirement |
| --- | --- | --- |
| **P1-01 Inkbound physical papers** | **RESOLVED IN APPROVED NARRATIVE DOCS** | [Stage 4](../inkbound/second-task-branches.md) now closes every route with two ordinary handwritten **non-loot quest notes**, Stage 5 [confirms they are held](../inkbound/sealed-stove-confrontation.md), and [Stage 6](../inkbound/silas-pumpard-fight.md) preserves them across win/defeat. Actual engine props and UI still need implementing. |
| **P1-02 Inkbound returned books twice** | **RESOLVED IN APPROVED NARRATIVE DOCS** | [Stage 2](../inkbound/winter-register-interaction.md) gives Erwin the clean copy, hears his return-book instruction, **then** returns the books; [Stage 3](../inkbound/acceptable-losses-discovery.md) no longer gives a duplicate return order, while the loose loss-sheet still falls from a different winter volume. One approved Erwin line was changed under this new user authorization. |
| **P1-05 Squatter harvest source** | **RESOLVED IN APPROVED WORK DESIGNS** | [Yarrow Cut](../squatter/yarrow-cut-interaction.md) records per-bundle source section and condition for either harvest method without an early clue; [Apothecary's Weighing](../squatter/second-task-branches.md) uses source records and ordinary verification for partial acceptance. Data/asset implementation remains. |
| **P2-01 Figurative approved Inkbound examples** | **THREE FLAGGED LINES CORRECTED** | Removed personification/figurative wording in the [Stage 3 cart decision](../inkbound/acceptable-losses-discovery.md), [Stage 4 coal-cart dialogue](../inkbound/second-task-branches.md) and [Stage 5 resident reply](../inkbound/sealed-stove-confrontation.md). The new 2026-10-19 literal-language standard applies to further edits; this is not certification that every historical line across the entire repository has been exhaustively cleaned. |
| **P1-03 state and duplicate transactions** | **SHARED SPECIFICATION APPROVED; NOT CODED** | [State/QA contract](../shared-state-implementation-contract.md) covers once-only +1, clinical debit, fight result, branch exclusivity and Stage 8 completion. Engine implementation and reconnect tests remain. |
| **P1-04 exceptional work acceptance** | **SHARED SPECIFICATION APPROVED; NOT CODED** | Origin-by-origin acceptance semantics are in the [contract](../shared-state-implementation-contract.md); no amounts changed. |
| **P1-06 job/time/solvency** | **TEST REQUIREMENTS ACCEPTED; NUMBERS TBD** | Comparable route effort, early interaction, job payout checks and rent shortfall tests are now explicit in the [contract](../shared-state-implementation-contract.md). Actual tuning remains. |
| **P0-01 clinic / uninjured victory** | **RESOLVED IN APPROVED DESIGN (2026-10-19); NOT CODED** | The user considered making the enemy's second hit guaranteed, but selected the fallback: normal combat, no forced hit/injury, then a **10-coin paid examination for everyone**. When unhurt, the clinician confirms no treatment is needed. [Central clinic rule](../shared-clinic-examination-policy.md) and all six Stage 7 files updated. |
| **P0-02 nonlethal combat** | **DESIGN/TEST DIRECTION APPROVED; MECHANICS TBD** | One shared withdrawal/disengagement and nonlethal combat system is specified, without inventing enemy statistics or asserting that an engine exists. |

**Important (updated 2026-10-19):** The 10-coin clinic charge and common 20 → 10 balance remain locked. **The injury guarantee is now explicitly rejected**: no guaranteed first/second enemy hit, no compulsory injury, and a healthy player receives an examination without needless treatment. Combat/injury numerical rules are still TBD. The one +1 Major Skill on choice and single shared home remain locked.


**Audit type:** deep narrative, cross-origin, economy, skill, timing, NPC knowledge, combat/defeat, prop ownership, state transition and documentation consistency review.
**Result:** **all six E2E origin narratives approved** (six eight-stage paths, counting the canonical shared Stage 8 once); **NOT YET IMPLEMENTATION-READY**. All 18 optional Stage 4 routes have narrative design. **Do not reinterpret a finding as permission to rewrite user-approved spoken dialogue.**
**Scope of evidence:** [global onboarding structure](../shared-structure.md), [canonical shared Stage 8](../shared-home-rent-ending.md), [game-wide job/time rules](../../jobs/jobs-and-time.md), six [origin overview documents](../README.md), their individual Stage 1–7 scenario docs, [speech standards](../../interactions/dialogue-style-guide.md) and project indexes. This audits authored repository documents and design consistency; it is **not code testing, simulation, or a complete economic balance of all game systems**. Independent full-repository / Excel data-model verification is **not claimed**.

## Executive conclusion

- **PASS — shared framework:** +3 starting Major Skill, Basic Clothes + Crude Small Bag + 20 coins, normal first-skill work before a unique discovery, exactly one of three different-Major-Skill jobs with +1 level awarded at Stage 3 choice, two pre-fight interactions, a real non-blocking PvE fight, ordinary 10-coin medical visit, identical home/rent notice/closing line. This structure is the approved target for all six; content files preserve it at narrative level.
- **PASS — branch identity:** 18 route narratives remain logically distinct; no route authorizes one player to obtain evidence from all three.
- **PASS — antagonist roles:** Flint, Dogman, boar, Owler, Barnaby Rusk and Silas Pumpard each have an in-world motive and a safe defeat continuation; they are not randomly interchangeable combat encounters.
- **PASS WITH CONDITIONS — money:** scripted first and second jobs plus the fight grant 0 coins, normal XP or loot, and a single 10-coin clinical charge should leave 10; **the unresolved uninjured clinic visit makes the fixed charge questionable**.
- **BLOCKED — mechanical implementation:** shared nonlethal combat / animal retreat, start-unarmed balance, Health/clinic edge case, atomic persistence, real job times and rewards still require design and testing.
- **ACTION NEEDED — two Inkbound continuity gaps:** repeated book-return directions across Stages 2/3 and unguaranteed physical papers that Silas tries to confiscate.
- **DOCUMENTATION CLEANUP PARTLY COMPLETED DURING AUDIT:** [Millhand overview](../millhand/README.md) and [Squatter overview](../squatter/README.md) had older forced-injury / proposal-status claims and have been updated editorially to point to later approved rules. Their approved scene dialogue was not changed.

## Coverage matrix — all six origins

| Background | Major Skill at creation | Stage 2 ordinary work | Stage 3 reveal | Stage 4 different-skill options (choose ONE; +1 once) | Stage 5 & 6 opponent | Stage 7 | Stage 8 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Millhand](../millhand/README.md) | **Craftsmanship +3** | Worker Plates / Smithing | **The Missing Stamp** | **Industry/Hauling — Depot Intake Run**; **Commerce/Contracts — Disputed Docket**; **Scholarship/Investigation — Ledger Reconciliation** | **Flint**, wage enforcer | [Approved clinician](../millhand/clinic-treatment.md) | One shared |
| [Bellrunner](../bellrunner/README.md) | **Industry +3** | **Shift Dispatch** / Hauling | **The Wrong Bell** | **Commerce/Contracts — Attendance Certificate**; **Medicine/Trauma — First Aid Line**; **Mechanics/Industrial Machinery — The Bell Linkage** | **Dogman**, Shift Marshal's unofficial man | [Approved clinician](../bellrunner/clinic-treatment.md) | One shared |
| [Squatter](../squatter/README.md) | **Fieldcraft +3** | **Yarrow Cut** / Foraging | **The Warm Patch** | **Commerce/Trading — The Apothecary's Weighing**; **Medicine/Herbalism — Suspect Cuttings**; **Industry/Construction — Clear the Outfall** | **Young injured wild boar** | [Approved clinician](../squatter/clinic-treatment.md) | One shared |
| [Stitcher](../stitcher/README.md) | **Medicine +3** | **Morning Dressings** / Trauma | **The Teaching Bed** | **Industry/Hauling — The Night Trolley**; **Commerce/Contracts — The Signed Consent**; **Scholarship/Investigation — Notes for the Living** | **Owler**, Night Porter | [Approved clinician](../stitcher/clinic-treatment.md) | One shared |
| [Scrapper](../scrapper/README.md) | **Mechanics +3** | **Strip a Condemned Pump** | **The Last Dry Floor** | **Industry/Construction — The Brace Shift**; **Fieldcraft/Navigation — The Low Passage**; **Commerce/Logistics — The Spare Line** | **Barnaby Rusk**, piece-rate breaker | [Approved clinician](../scrapper/clinic-treatment.md) | One shared |
| [Inkbound](../inkbound/README.md) | **Scholarship +3** | **The Winter Register** / Investigation | **The Acceptable Losses** | **Commerce/Contracts — The Coal Waiver**; **Fieldcraft/Navigation — The Door Count**; **Industry/Hauling — The Short Cart** | **Silas Pumpard**, Fuel Watchman | [Approved clinician](../inkbound/clinic-treatment.md) | One shared |

All six have 3 unique second-Major-Skill options, for **18 designed branches**. Minimum content acceptance set is **6 origins × 3 second routes × 2 true combat outcomes = 36 end-to-end route/outcome runs**, not counting stance, error correction, refresh or unhurt variations.

## Implementation blockers (P0 — resolve before playable integration)

### P0-01 — Fixed clinic bill versus a genuinely unhurt character

**Evidence:** [shared structure](../shared-structure.md) mandates the clinic and exactly **10 coins** for all origins; [shared Stage 8](../shared-home-rent-ending.md) requires the post-clinic balance of **10**. [Millhand clinic](../millhand/clinic-treatment.md), [Scrapper clinic](../scrapper/clinic-treatment.md) and [Inkbound clinic](../inkbound/clinic-treatment.md) explicitly forbid invisible guaranteed wounds and do not invent a treatment for perfect victories. A character may have full Health and no injury yet be required to spend half their savings on care.

**Impact:** a perceived unfair mandatory expense or fake injury; cannot honestly script the medical service without one design decision.

**Decision needed:** either approve a genuinely useful and clearly priced **examination-only service at 10 coins** for healthy players, or revise the universal economic/home sequence with explicit user approval. **Do not** slip in a forced wound, make a flawless fight secretly cause harm, or silently waive the fee on one origin only. Keep real, injury-appropriate care.

### P0-02 — One shared nonlethal combat resolution and beginner balance

**Evidence:** [boar fight](../squatter/boar-fight.md) needs a **safe disengagement / animal withdrawal victory**, not a lethal HP grind. The [Flint](../millhand/flint-fight.md), [Dogman](../bellrunner/dogman-fight.md), [Owler](../stitcher/owler-fight.md), [Barnaby](../scrapper/barnaby-fight.md) and [Silas](../inkbound/silas-pumpard-fight.md) fights need a genuine win, a genuine loss and a non-killing way to repel a working human. **All players begin without a combat weapon**, and encounter movement/guard/stamina/range/injury formulas remain TBD.

**Impact:** cannot demonstrate reachable moderate-difficulty wins and defeats; boar-specific retreat cannot be faked with a cutscene if the real combat engine only understands HP defeat.

**Decision needed:** define shared **defend, reposition, unarmed attack, obstacle, morale/disengagement, surrender/withdrawal, defeat, injury** and recovery interfaces before assigning stats. Test the boar and five humans from the actual universal starter kit with zero extra loot.

## High-priority continuity and state issues (P1)

### P1-01 — Inkbound's physical paper is not guaranteed across branches

**Evidence:** [Stage 4](../inkbound/second-task-branches.md) records a Contracts objection at the fuel office, hands Navigation route notes to the worker, and records Hauling arrival/shortage with the receiver; no branch awards a document to the player's personal inventory. [Stage 3](../inkbound/acceptable-losses-discovery.md) leaves official records in the office. Yet [Stage 5](../inkbound/sealed-stove-confrontation.md) begins with **papers the Inkbound carries**, and Silas demands them; [Stage 6](../inkbound/silas-pumpard-fight.md) treats these as a physical object he tries to seize. Compare [Bellrunner Stage 5](../bellrunner/dogman-confrontation.md), which explicitly guarantees the courier's route sheet and handles differently retained sealed letters.

**Impact:** a player selecting Door Count or Short Cart may be asked to show/defend an object they were never given. Journal state alone doesn't establish visible paper in hand.

**Proposed resolution, NOT approved:** specify **one ordinary non-loot work sheet / personal note** reliably present in all three Inkbound branches, backed by the relevant journal finding, or rewrite Silas's attempted seizure as an attempt to silence the player. The second option changes approved dialogue. Obtain approval before changing the physical staging or spoken lines. No tradable item, equipment reward or extra investigation.

### P1-02 — Inkbound repeats the instruction to put away finished books

**Evidence:** [Stage 2](../inkbound/winter-register-interaction.md) currently scripts **[Put the books back] → [Give Erwin the copy]**, then Erwin says **“Put them back, carefully.”** [Stage 3](../inkbound/acceptable-losses-discovery.md) begins after this normal work is completed; Erwin opens a *different* winter volume to file the copy, but later says **“Put the other books away.”**

**Impact:** the books appear already returned, yet Erwin orders the same action again, in both the Stage 2 sign-off and Stage 3 argument. This is a definite sequence error, not a lore mystery.

**Proposed resolution, NOT approved:** reorder Stage 2's physical return until **after** Erwin says to put the books back; then in Stage 3 replace the second return order with a line only about keeping the private sheet. **Because the spoken Erwin dialogue is approved, request approval for any exact line change.** Do not place the secret page back into Stage 2.

### P1-03 — Stable branch/stance/outcome state across reconnects

**Evidence:** [shared Stage 8](../shared-home-rent-ending.md) requires once-only completed stages, while all six Stage 3 choices award **+1 immediately upon commitment**, not when the task finishes. Stage 5 tactical preparations influence Stage 6, and each fight must retain the **player's real win or defeat**. User choices may occur in continuously running world-time jobs and travel ([Jobs and Time](../../jobs/jobs-and-time.md)).

**Impact:** partial saves or repeated clicks could grant the +1 twice, consume 10 coins twice, replay combat, show a second choice's unique evidence, or open the rent notice before clinical payment.

**Implementation requirement:** server-authoritative state machine with **idempotent stage/choice/care/rent operations** and atomic currency/skill updates. Persist origin, first-job resolution (including pending/rejected acceptance), chosen branch and one +1, branch-only finding, Stage 5 positions, Stage 6 exact outcome, Health/care result and common Stage 8 completion. Test reconnect at *every* transition.

### P1-04 — First-job acceptance states differ; don't collapse them

**Evidence:** [Millhand's Missing Stamp](../millhand/missing-stamp-discovery.md) holds the council lot's acceptance; [Bellrunner Wrong Bell](../bellrunner/wrong-bell-discovery.md) has a route that fails its final official receipt only at the unusual stop; [Squatter Warm Patch](../squatter/warm-patch-discovery.md) has weighed herbs awaiting **buyer acceptance**. In contrast Stitcher, Scrapper and Inkbound disclose their scripted internal / charity work as unpaid before starting.

**Impact:** if code assumes Stage 2 always has a fully closed paid-work contract before Stage 3, it may accidentally pay the disputed job or fail to trigger the story. The discrepancy is **intentionally authored, not a plot contradiction**.

**Implementation requirement:** separate **routine interactions completed** from **commercial acceptance / wage clearance**. Always display the pending/unpaid terms honestly; never show an earned wage and later confiscate it. Preserve the three unique causal explanations. Stage 4 in the incident remains its own unpaid emergency/checking task.

### P1-05 — Squatter's clean-herb sorting needs provenance data

**Evidence:** [Stage 2 Yarrow Cut](../squatter/yarrow-cut-interaction.md) allows different harvesting approaches; [Stage 3 Warm Patch](../squatter/warm-patch-discovery.md) discovers suspicious materials by one edge of the patch after the original cut; [Stage 4 Trading](../squatter/second-task-branches.md) permits sale of only a **verifiably separate clean upper-ground portion**, not simply stems that look healthy. Stage 4 explicitly acknowledges this needs source notes.

**Impact:** without harvest-source labels the buyer cannot consistently certify the clean subset and the Trading route's promised discovery breaks, or appears to approve unsafe medicinal herbs.

**Requirement:** store and present source section plus condition for each tutorial bundle, regardless of the earlier harvest method. Define buyer-check outcomes without requiring a fixed item tier, special disease system or a poisoned-herb reward.

### P1-06 — Difficulty, job duration and post-tutorial solvency not tested

**Evidence:** [Jobs and Time](../../jobs/jobs-and-time.md) requires early interactions (normally within two minutes), non-twitch prompts, continuous world time and modest active travel. All **18** second-job activities are authored but have no verified production durations or equivalent challenge. Rent is **150 provisional** and the player has **10** coins after care; normal paid job wages/XP are still unspecified.

**Impact:** one route may take considerably longer than another for the same +1; players could be shown a 140-coin rent shortfall without a credible earning path; long jobs could require a late interaction contrary to shared rules.

**Requirement:** map each Stage 4 branch to a real reusable job definition and a numeric configuration; ensure meaningful prompt early, safe unattended completion after interactions, similar difficulty and duration within reasonable range, accessible unarmed fights and reliable paid jobs immediately after Stage 8. **Do not invent earnings, timers or debt deadlines here.**

## Medium-priority design/clarity debt (P2)

### P2-01 — Later no-metaphors/no-personification rule versus older locked dialogue

The user locked the no-metaphors/no-personification wording rule on 2026-10-19 in the [dialogue guide](../../interactions/dialogue-style-guide.md). Some *previously approved* dialogue predates it. Three concrete examples are:

1. [Inkbound Stage 3](../inkbound/acceptable-losses-discovery.md): **“The numbers on this page don't heat a room.”**
2. [Inkbound Stage 4 Short Cart](../inkbound/second-task-branches.md), driver: **“Paper's got a lot of coal on it. Shame we can't burn that.”**
3. [Inkbound Stage 5](../inkbound/sealed-stove-confrontation.md), resident: **“Will a number open that lock?”**

These are figurative/rhetorical rather than literal explanations, and thus conflict with the newly stated forward-looking stylistic preference. The three **specifically requested Stage 5 player-line revisions** were applied and approved, but these older approved lines have **not** been silently overwritten. Suggest an optional, user-approved literal-language cleanup across locked content, preserving meaning and voice. This is **style debt**, not a plot failure. New writing should obey the rule immediately.

### P2-02 — Legacy master documents contained stale status and injury directives

The [Millhand master](../millhand/README.md) retained older “must suffer visible injury” and “Stage 8 wording proposed” suggestions despite later approved no-forced-wound and common-ending rules. The [Squatter master](../squatter/README.md) called Stages 6–7 proposals and assumed a boar wound after combat. **During this audit those master statements were updated and marked superseded**; no approved dialogue or scene decisions were overwritten. Other long master documents still include some historic proposal/TBD discussion for already-authored sequences; consult the stage-specific approved files and index first.

### P2-03 — Two per-origin Stage 8 documents remain as legacy references

[Millhand's Stage 8](../millhand/home-rent-ending.md) is the source of the user's exact approved spoken line; [Bellrunner's Stage 8 wrapper](../bellrunner/home-rent-ending.md) explicitly delegates to the [single canonical shared Stage 8](../shared-home-rent-ending.md). **No active contradictory Bellrunner dialogue was found**. The origin index still links to these wrappers for provenance, which is fine, but production code must call **one** shared home scene, not duplicate it six ways.

### P2-04 — Ward Six delivery and the locked communal coal box are different destinations

[Inkbound Short Cart](../inkbound/second-task-branches.md) confirms a **smaller consignment reaches the ward's receiving point**. [Sealed Stove](../inkbound/sealed-stove-confrontation.md) retains a **padlocked communal box** with no authority to release fuel. There is **no contradiction**, but art and UI should make the two distinct: receiving depot versus sealed neighbourhood ration stock, so players don't reasonably ask why the coal they delivered cannot be used. The missing sacks and the author of “AUTHORIZED” remain unknown by design.

### P2-05 — NPC characterization and local scope

**Pass:** [Guther](../millhand/opening-dialogue.md) and blunt [Flint](../millhand/flint-confrontation.md), [Hector](../bellrunner/opening-dialogue.md), nature-minded [Benny](../squatter/opening-dialogue.md), harsh [Claudia](../stitcher/opening-dialogue.md), direct coughing [Ignatius](../scrapper/opening-dialogue.md) and class-aspiring [Erwin](../inkbound/opening-dialogue.md) have distinct approved presentation. Minor occupational NPCs remain unnamed. The six incidents stay local, without falsely establishing a main-story conspiracy or guaranteeing broader institutional reform. Future Flint speech must acknowledge his stored win/loss outcome if he reappears in a separately approved quest.

## Minimum QA acceptance matrix (before declaring the tutorials playable)

1. **Creation ×6:** all four stats 5; Health max 50; starter Major Skill +3; Basic Clothes + Crude Small Bag + 20 coins; no starter weapon or origin-exclusive home.
2. **Routine work ×6:** visible correct tool/skill flow before the unique reveal, safe incorrect-choice correction, advertised zero tutorial pay/normal XP/loot and the origin-appropriate pending/unpaid explanation; regular equivalent jobs *outside* onboarding pay and award ordinary XP.
3. **Discovery and branches ×18:** show only correct fixed clue, offer all three Stage 4 choices, award +1 exactly once on selecting one different Major Skill, store only that route's evidence, never allow another branch grant via reload/retreat.
4. **Stage 5 ×18 (minimum):** two meaningful pre-fight interactions and route-specific callbacks. Validate **physical props** handed between scenes; in Inkbound, paper possession must be resolved.
5. **Combat ×36 minimum end-to-end route/outcome runs:** for each 3-route background test a genuine win and a genuine loss from the actual unarmed kit; position/obstacles matter, animal disengagement works, no one is robbed, killed as a forced tutorial finish or rewarded with weapon/XP/coins; correct named NPC and observer intervention.
6. **Medical ×6 plus injury variations:** defeat and victory both reach same normal service; show real Health and medically appropriate care, charge 10 once, leave 10; additionally test **perfectly unhurt victory** when the shared decision is approved.
7. **Housing ×6:** identical **same physical home ID**, rent notice **RENT / 150 coins owing** from provisional common source, no due date/penalty invented, shared player's *exact* “Ah, hell...” line and read/put-down order, normal jobs/crafting available afterward.
8. **Persistence:** reconnect before and after Stage 3 bonus, Stage 4 resolution, Stage 6 outcome, care debit and notice dismissal. No duplicate currency/skill changes or branch evidence leaks.
9. **Time/travel:** early mandatory prompts normally within 2 minutes, continuous world time, no late mandatory unattended click, routes/clinics/home geographically reachable and no urgent scene requiring an impossible teleport.
10. **Presentation/language:** plain actionable directions; literal dialogue without new metaphors/personification; conditional medical dialogue depends on *actual* injury, and origin personality is maintained without changing approved spoken lines.

## Recommended order of next work

**First (revised after user decision):** The [perfectly unhurt clinic policy](../shared-clinic-examination-policy.md) is now LOCKED: a paid ten-coin examination for uninjured and injured characters, with treatment only when needed and no forced first/second strike. **Next design priority is the shared turn-based nonlethal win/loss and injury/defeat mechanisms** and their real numerical balance.

**Second:** resolve Inkbound's physical papers and repeated book-return staging **with user approval of any modified dialogue**, and specify Squatter herb provenance as a real work-data field. These are targeted continuity repairs, not new story arcs.

**Third:** write one small authoritative onboarding state-machine schema for all six origins, then map 18 job configurations and six enemies to common jobs/combat/Health systems. Balance 36 route × result variants and test client reconnection.

**Finally:** implement one shared clinic service and the single Stage 8 home/rent scene. After the mechanics are validated, perform a short literal-dialogue pass and consolidate stale master notes.

## Audit change policy

**No approved NPC speech, scene options, route rewards or in-world outcomes were rewritten by this audit.** Only Inkbound Stage 7's already granted approval and archival master/index wording were synchronized; the report identifies further changes that must be reviewed. Numeric combat balance, rent timing, medical treatment and normal job economics are **not** silently made canonical here.
