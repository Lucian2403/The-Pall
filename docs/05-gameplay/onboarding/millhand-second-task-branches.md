# Millhand — Stage 4: Three Second-Major-Skill Tasks (APPROVED)

**STATUS: STAGE 4 FLOW AND DIALOGUE APPROVED/LOCKED (2026-10-15).** The user approved all three route-specific job interactions and the spoken lines as reviewed, alongside the already locked task names, Major Skills, core revelations, zero tutorial coin/XP/loot and +1 different Major Skill upon route commitment. **Exact durations, probability formulas, asset details and implementation IDs remain TBD.** No new personal NPC names, currency values, factions or crime flags are introduced.

Previous approved scenes:
- [Stage 1 — Guther Anvil opening (LOCKED)](millhand-opening-dialogue.md)
- [Stage 2 — platework (LOCKED)](millhand-platework-interaction.md)
- [Stage 3 — The Missing Stamp (LOCKED)](millhand-missing-stamp-discovery.md)

Other constraints: [Millhand master story](millhand.md), [Global Spoken Dialogue Standard](../interactions/dialogue-style-guide.md), [Jobs and Time](../jobs/jobs-and-time.md), [Interaction Generation](../interactions/interaction-generation.md).

## Shared Stage 4 contract

- The player commits to one of the three already-approved Stage 3 lines; award +1 exactly once in **Industry**, **Commerce** or **Scholarship** corresponding to that chosen route; character-creation +3 **Craftsmanship** is unchanged. Other skills receive no tutorial level.
- **Zero coins, zero ordinary XP, zero personal loot** throughout each scripted second task; worksite materials, documents, cart/packaging and inspected metal remain employer/council/quest property. Equivalent ordinary non-tutorial jobs can use the same reusable modules and their standard rewards. The unresolved council contract blocks wage settlement; the player is resolving a disputed lot, not taking a new guaranteed-paying commission.
- Distinct reusable work: **Industry / Hauling** handles safe load movement and delivery verification; **Commerce / Contracts** handles inconsistent authorized categories/attestations; **Scholarship / Investigation** cross-checks source documents and detects altered entries.
- All mandatory interactions occur early under the existing first-two-minute rule; world-time clocks continue. No twitch tests, repeated tapping, abstract fake puzzles or late unannounced prompts. Exact time values/risk percentages, job assets, formal data IDs, map geometry, and skill thresholds remain TBD. Failure causes limited rework/extra time, **not a route lockout or extra payment demand**.
- Minor supporting NPCs use role labels only: **Depot Clerk**, **Contracts Clerk**, **Archive Assistant**. No personal names required.
- Each branch ends with its own legible piece of evidence and one local closed task. **No branch resolves the entire underlying fraud or turns this into the central campaign.** After resolution, the routes converge on the existing **The Wage Claim → Cornered → Flint fight**; Flint's route-specific knowledge and dialogue are authored separately in Stage 5.
- No tutorial payment and no new items to the player's inventory; the surviving **worker number / document discrepancy** can be stored in the existing quest state/journal.

## Route A — Depot Intake Run (Industry / Hauling)

**Locked setup:** the player chose **Restamp it**, authorized one corrective worker-number marking action using Stage 2's existing Smithing module (not the inspector's stamp, not a second full work shift), and Guther sends the disputed lot to the municipal depot **without certifying it clear**.

**Work goal:** move the finished plate lot and its docket safely to the municipal depot; obtain an accurate receipt of **what was physically delivered**. Not a Smithing mini-game disguised as Hauling.

**Approved reusable flow (exact balance TBD):**

1. **[Check the load]** — read bundle count/condition and compare with dispatch docket; shop-owned materials only. The branch's already-approved worker-number correction has occurred before departure.
2. **Choose handling method:** **[Secure the plates together]** (less handling, risk of misalignment/damage if carelessly stacked) or **[Carry them in smaller loads]** (more handling time, less concentrated damage risk). This must change the duration/damage-risk trade-off when numerical systems exist. No free bags, strapping item or route unlock.
3. **[Deliver and compare the manifest]** — at intake, the printed manifest classifies the consignment as a transfer of **workers**, while the player has delivered only numbered **plates**. A simple two-source matching module exposes the discrepancy without a timed skill roll.
4. **Choose how to document the mismatch:** **[Enter “plates” in the received-goods record]** or **[Request a corrected manifest before signing]**. The former records the true cargo immediately; the latter triggers an ordinary nonblocking intake dispute/check (additional time) and then the same physically accurate receipt. **Never force the player to falsely certify that living workers were delivered** just to progress.
5. **Complete delivery** — municipal staff take custody of plates; the receipt reflects plates, not people. The manifest's printed category remains unexplained. The task does not pay (disputed council lot); no XP/loot.

**Approved short exchange — spoken, role-labelled minor NPC:**

*The Depot Clerk reads the manifest.*

**CLERK:** “Leave the lot here. I need your mark.”

**PLAYER:** “The manifest says workers.”

**CLERK:** “What have you brought?”

**PLAYER:** “Plates.”

**CLERK:** “Then put down plates. I receive what's here.”

**Editorial check:** the clerk is occupied with an immediate receiving task and does not claim to know the fraud. No neat quip or thematic monologue. If the line “I receive what's here” is too repetitive with Guther's practical evasion, shorten it, don't add humour.

**Specific locked sting preserved:** printed manifest's **worker-transfer** classification conflicts with actual **metal plates**. Player involvement can feel compromising, but **no automatic crime/reputation flag** or permanent liability. Reusable Hauling modules: load check, carrying method, delivery verification, short intake-discrepancy response.

**End state:** `millhand_route=depot`, delivered plate lot, journal records mismatch (“workers” printed vs plates received). Ready to converge toward Flint later. No payment.

## Route B — Disputed Docket (Commerce / Contracts)

**Locked setup:** player chose **Question the foreman**, Guther directs them to the municipal Contracts counter with the disputed docket. Goal is administrative processing/clearance, **not further Smithing**.

**Work goal:** inspect the authority/terms behind the identification number and make a defensible challenge on the existing contract form.

**Approved reusable flow (exact balance TBD):**

1. **[Examine the contract docket]** — identify worker number, seal and authority field. Do not invent a new legal profession, trade item or council-wide compensation system beyond the two already approved categories.
2. **[Compare the entries]** — the same number has two accepted classifications: **deceased for compensation** and **active for contractual billing**. Both entries bear apparently valid seals, as established in the locked narrative.
3. **Choose how to contest the record:** **[Request the basis for both seals]** (verification module; clerk confirms both are officially entered but cannot reconcile them immediately) or **[Mark the conflicting classifications on the docket]** (contract-dispute module; records an objection and a counter acknowledgement). Both use the ordinary Contracts family. Neither implies a forged seal or requires specialist skill.
4. **[Submit the disputed docket]** — the clerk marks the paperwork processed **with a discrepancy unresolved**, without issuing an all-clear or paying the player. The copyist's silence may appear as an observed beat; it does not establish a named character or secret informant.

**Approved short exchange:**

*The Contracts Clerk sets two entries on the counter.*

**CLERK:** “Which entry are you disputing?”

**PLAYER:** “One says he died. The other says he's still on the books.”

**CLERK:** “Both have a seal.”

**PLAYER:** “Then one of them's wrong.”

**CLERK:** “You can put that in writing.”

**Editorial check:** the clerk has authority over intake, not truth. “You can put that in writing” is a practical nonanswer, not a polished joke; the player must actually do it. Avoid proclaiming that council fraud is universal or claiming the clerk knows who falsified what.

**Specific locked sting preserved:** same number can be treated as **deceased for compensation** and **active for billing** under seemingly valid entries. A dispute note is a local processed document, **not proof of a citywide scheme** or a permanent Court/Faction mechanic.

**End state:** `millhand_route=contracts`, local dispute noted, no clearance of the wage lot; the second task gives 0 coins/ordinary XP. Ready to converge toward Flint later.

## Route C — Ledger Reconciliation (Scholarship / Investigation)

**Locked setup:** player chose **Record the number**. The character keeps only the number in quest-state notes and consults the municipal records room; **no permanent physical evidence item** is granted.

**Work goal:** compare historical documents to determine whether the cancelled number also appears in later wage accounting, and see whether someone altered a source record.

**Approved reusable flow (exact balance TBD):**

1. **[Open the death register]** — locate the worker number in the fire/death record, including its recorded date; ordinary record search.
2. **[Cross-check the later wage tally]** — compare the same number with the wage tally and shift book. The number appears in a later wage entry despite the death cancellation; this is the approved story contradiction. No new numeric serial values are invented here.
3. **[Inspect the corrected entry]** — an ink correction was scraped away. Player chooses **[Compare with the neighbouring entries]** (pattern/context verification) or **[Cross-check the shift book]** (independent-source verification). Both methods expose the inconsistency and let the player record the finding; consequences may vary in time/clarity but **never prevent discovering the locked evidence**.
4. **[Record the discrepancy]** — quest journal notes the death entry, later wage number and removed correction; no new item, free Scholarship XP or special unsolved quest.

**Approved short exchange:**

*The Archive Assistant sees the damaged line in the register.*

**PLAYER:** “Someone scraped this out.”

**ASSISTANT:** “Don't rub the page. It tears.”

**PLAYER:** “Who changed it?”

**ASSISTANT:** “I don't know.”

**Editorial check:** a dry refusal to speculate without adding a catchphrase. The assistant is more concerned with preserving the record than explaining the case. The last line is deliberately plain: no atmospheric omen. The previously proposed phrasing “Those corrections are already counted” is **not reused** because it sounds like an engineered cryptic proverb rather than a credible answer.

**Specific locked sting preserved:** death register and later wage tally share the number, with a scraped correction in an official record. What exactly was corrected, by whom and why remains unconfirmed.

**End state:** `millhand_route=ledger`, verified three-part document inconsistency stored as a completed local journal note, second task yields 0 coins/ordinary XP. Ready to converge toward Flint later.

## Shared results, important edge cases

| Concern | Rule |
| --- | --- |
| Level change | +1 chosen **other Major Skill** on **Stage 3 branch commitment** only; none from Stage 4 outcomes |
| Money / XP | 0 coins, 0 ordinary XP, 0 personal loot for all three scripted tasks |
| Workplace tools and papers | Employer/council/worksite props, not inventory additions |
| Missing interactions | A routine task can cost extra time or require correction, but it cannot omit the route's necessary evidence or softlock tutorial |
| Future repeatability | Load methods + receipt matching; contract dispute/verification; registry cross-check/alteration checks all reuse normal authored interaction modules |
| Job timer | Real time continues during prompts; all required inputs front-loaded early; exact duration TBD |
| Narrative continuity | The Stage 4 discovery differs by route, but each leaves a clear reason for **Flint** to approach the character in **Stage 5** |
| Later scenes | Do not trigger Wage Claim, Cornered, fight, clinic or rent before the chosen Stage 4 task is complete |
| Characterization | Supporting NPCs are role-labelled and not individually named; neither they nor Guther must be declared villains by this scene |
| Persistence | Save chosen route and completed task exactly once, with journal data for the one discovered discrepancy; no new lasting crime/system flag |

## Editorial and approval notes

- The three supporting exchanges deliberately differ: **depot** describes physical receiving, **Contracts** formal authority, **archive** handling written evidence. They must not all become Guther-style clever nonanswers.
- There is a risk of excess paperwork despite three different Major Skills; counter it with **real Hauling load/handling choices** in Depot Intake Run, genuine **Contracts challenge/attestation** at the counter, and true **Investigation source comparison** in the archive. If the gameplay is visually indistinguishable, Stage 4 is not finished.
- Do not insist on further NPC dialogue to teach exact mechanics. The interface can display counts, entries, category mismatch and rework alternatives.
- Dialogue is written for speaking: single ideas per sentence, no gratuitous slang, faux-period quips or preachy speeches. Keep discomfort subtle; a plainly answered question can be stronger than forced banter.
- **APPROVED:** all three interactive routes and the exact Depot Clerk, Contracts Clerk and Archive Assistant dialogue lines, as presented, are canon. Exact times, risks, inventory representations and UI assets remain TBD. Preserve spoken lines until an explicit revision is agreed.

Related: [Millhand](millhand.md), [Missing Stamp scene](millhand-missing-stamp-discovery.md), [Stage 2 Smithing](millhand-platework-interaction.md), [Spoken Dialogue Standard](../interactions/dialogue-style-guide.md), [NPC Dialogue Backlog](npc-dialogue-backlog.md).
