# Shared onboarding implementation contract — approved guardrails, 2026-10-19

**Status: USER-APPROVED IMPLEMENTATION DIRECTION, NOT IMPLEMENTED CODE.** Derived from the [six-origin consistency audit](audits/2026-10-19-six-origin-consistency-audit.md), [common narrative framework](shared-structure.md), [shared home](shared-home-rent-ending.md) and [Jobs and Time](../jobs/jobs-and-time.md). This is a design contract for a single reusable onboarding state machine. Exact database fields, job rewards, enemy attributes, actual service pricing outside onboarding, map geometry and timing parameters are TBD; they are **not** set by this document.

## Single canonical sequence

Character creation → Stage 1 briefing → Stage 2 ordinary-work interaction → Stage 3 unique discovery and one irrevocable branch choice → Stage 4 exactly one emergency/verification work session in a **different** Major Skill → Stage 5 exactly two pre-combat interactions → Stage 6 real, short turn-based PvE fight with separately recorded **victory/defeat** → Stage 7 regular clinician service with **one** payment → **single shared** Stage 8 home/rent sequence → normal paid work/crafting.

Only the **content** varies by origin. The same stage-completion service, idempotency and financial logic runs six times with different configured scenes and 18 possible Stage 4 work paths.

### Character creation constraints

- Standard 4 attributes STR/DEX/INT/RES = 5, base max Health = 50.
- One origin Major Skill at +3 at creation, before any job actions:
  - Millhand Craftsmanship; Bellrunner Industry; Squatter Fieldcraft; Stitcher Medicine; Scrapper Mechanics; Inkbound Scholarship.
- Basic Clothes + one Crude Small Bag + 20 coins, no free combat weapon, no background-specific starter item or alternate rented room.
- No stage action may repeat the creation +3 or create more starter cash.

## Persistent state (conceptual schema; names are NOT finalized code IDs)

| Field | Allowed meaning | Save and validation rule |
| --- | --- | --- |
| `origin` | one of six approved origins | immutable after creation |
| `stage` | one ordered stage transition 1–8 plus completed | only advance after actual interaction; no skip via reload |
| `routine_job_status` | interactions complete, acceptance/payment **pending/rejected/internal-unpaid** as appropriate | separate labour done from employer/buyer acceptance; never award unearned wages |
| `incident_discovered` | unique Stage 3 clue | once, only after Stage 2 work interaction completes |
| `chosen_route` | exactly one of three origin-specific Stage 4 routes | write **once** at Stage 3 commitment; reject contradictory later choices |
| `awarded_second_skill` | granted skill Major ID and one +1 | **atomic** with first route commit; never award again on retry/refresh |
| `work_progress` | Stage 4 job phase and corrections | interruption-safe; no second-job payout/XP |
| `route_finding` | one selected route's local evidence | always branch-scoped; other route data inaccessible to dialogue |
| `narrative_flags` | origin-specific justified context (e.g. Squatter told Benny) | never infer conversation with an absent NPC |
| `precombat_position` | choice/obstacle/starting stance recorded in Stage 5 | passed into shared combat, must affect real geometry/rules or be explicitly revised |
| `combat_result` | NOT_STARTED, IN_PROGRESS, PLAYER_VICTORY, PLAYER_DEFEAT | save true combat outcome exactly once; defeat cannot become a narrative win |
| `health_after_fight` | actual current Health and statuses | don't manufacture injuries to justify clinic |
| `clinic_status` | PENDING, EXAMINED, PAID_AND_COMPLETED | **atomic debit + service + completion**; duplicate request has no extra charge |
| `home_notice_status` | not entered, entered, read, dismissed/completed | single shared home, single rent notice and closing line; no replay after completed |
| `recorded_work_props` | non-loot per-scene custody/notes/consignment labels | never add to normal tradeable inventory |

**USER DECISION LOCKED 2026-10-19:** The [common clinic examination policy](shared-clinic-examination-policy.md) adopts an ordinary 10-coin post-fight examination even if the player is unhurt, with actual basic care only when needed. **No first- or second-hit 100% accuracy override, scripted wound or pre-fight injury.** All regular attacks obey combat rules. Persist actual Health and do not award medical effects where none are required.

## Per-origin acceptance rules

| Origin | First work and its payment condition | Do not collapse into… |
| --- | --- | --- |
| Millhand | Council plate lot work completed; inspector/council acceptance disputed and wages not cleared | normal fully paid smithing completion |
| Bellrunner | Courier round actions completed; final legally closed recipient cannot sign authorized receipt, so route payment refused | all route sheets signed / player choosing wrong road |
| Squatter | Foraging cuttings weighed by Benny; **buyer acceptance still pending**; only verified partial stock may be credited to Benny | completed sale of every bundle, or direct player payment |
| Stitcher | Charity-bed cover round explicitly advertised unpaid | ordinary paid Trauma shift |
| Scrapper | Yard's own old-metal clearance explicitly advertised unpaid | normal paid customer Mechanics job |
| Inkbound | Office's own record correction, explicitly advertised unpaid | normal paid copying commission |

**Common:** Stage 4 emergency/checking task pays 0 coins and 0 ordinary XP; tutorial fight 0 coins, ordinary XP, combat XP and loot. The one +1 different Major Skill is granted at **Stage 3 choice**, never on second-job completion. Normal copies of these work types remain paid and grant normal XP outside onboarding.

## Work prop and evidence rules

- Millhand: disputed worker number/receipt and only the one selected route finding; Flint's demand is contractor-issued, not proof of legal city debt.
- Bellrunner: route sheet reliably remains available; the original sealed final letter's custody differs by route, **as explicitly stated in its approved Stage 5**. Dogman must not demand an impossible handed-over letter.
- Squatter: preserve per-bundle `harvest_section`, `bundle_group`, quality/handling condition and actual quantity from Stage 2 through buyer check. Treat the clean dry upper section as **eligible for verification**, not automatic medical clearance; flagged drain-edge stems cannot silently be sold.
- Stitcher: patient's real witnessed refusal, contested handover and only the one selected Stage 4 document/transfer finding. No off-camera patient abduction.
- Scrapper: track separate old plates removed at Stage 2 and later active pump pipe. The pump **continues running** in both combat outcomes; spare hose is **not** automatically fitted and not personal property.
- Inkbound: Stage 2 old books returned **after** Erwin instructs; Stage 3 Erwin opens a **different** winter volume. Stage 4 always provides **two small handwritten quest-only notes**: one about the common Ward Six coal/loss finding and one containing only the selected route evidence. Original official documents stay with their custodians. Silas physically demands these two notes, not an unavailable signed council sheet. No tradable inkbound item.
- All routes converge in Stage 5 without transferring another branch's evidence into the player journal.
- Never manufacture a major reveal before Stage 3; in particular no Ward Six coal/death annex during Inkbound ordinary copying.

## Timing and safe correction

- Respect continuous world-time while dialogue or work interactions remain open.
- Mandatory active interaction should normally occur **within the first 2 minutes** of beginning a job/travel activity; no late required click while the player is absent.
- Choose, inspect, prepare and resolve incident via reusable modules rather than bespoke mini-games. A wrong number, blurred mark, less usable material, wrong route or cargo shift should permit an ordinary visible **correction path**, not a hidden irreversible failure.
- Job-specific duration/cost/skill parameters remain TBD. Tune the 18 Stage 4 branches for accessible difficulty and comparable effort; don't assume equal total time without measuring.
- Do not generate a 150-coin rent deadline or eviction consequence; the notice's amount is **PROVISIONAL** and the shared job economy has not yet proved the 140-coin deficit can be earned in the desired session length.

## Stage 6 / clinic / home transactional rules

1. The fight records **a legitimate win or legitimate loss**, using a shared nonlethal/disengagement model that also supports the boar's withdrawal. No guaranteed scripted win, forced confiscation or invented weapon rewards.
2. **Win and lose** both lead to the same normal care service with actual current Health and injuries. Defeat-safe bystanders must have a grounded presence and may not overwrite a defeat into victory.
3. **LOCKED:** the canonical onboarding medical **examination** costs exactly 10 coins (20 → 10). With no actual injury, show **“No injuries found. No treatment needed.”** and provide no unwarranted healing; if injured, include appropriate basic treatment in the same fixed fee. There is no guaranteed first/second combat hit, and the [shared clinic policy](shared-clinic-examination-policy.md) replaces the former open edge case.
4. Treat clinic payment and completion as **one idempotent server transaction**; retries/reloads must not double-charge.
5. Use the **same home identifier, same rent-notice asset and same stored closing speech** regardless of origin. Rent notice is provisionally “RENT / 150 coins owing.” Rent is not charged at the tutorial; no due date/eviction.
6. Dismissal of the notice atomically marks onboarding completed. Another reload should not replay the speech or reapply skill, combat or clinic changes.
7. Origin-specific journals and future reappearing antagonist acknowledgement may persist, but the rent line and home are never origin-specific. Future Flint dialogue must consider his recorded combat result if a future quest is written.

## Minimum acceptance tests

- 6 character-creation tests (skill +3, attributes, kit, coins, shared home).
- 6 Stage 2 jobs complete with no normal wages/XP; verify acceptance rules and stage boundaries.
- 18 distinct Stage 3/4 branches — exactly one +1 each, different Major Skill, one unique fact, no route leakage.
- **36 full E2E route/outcome combinations** = 6 origins × 3 choices × 2 legitimate fight outcomes, including one shared clinician and common home.
- Repeat tests for Stage 5 stances, job mistake correction, **one genuine unhurt victory and wounded victory/defeat under the locked 10-coin examination policy**, 2× client click, and reload/disconnection immediately before and after skill award, combat resolution, care debit and notice dismissal.
- Verify the young boar can **withdraw as a genuine PvE win**, humans can stop fighting without mandatory murder, all characters are beatable as unarmed beginners, and pre-fight positions give real effects.
- Validate earned money via actual paid jobs after Stage 8; the tutorial's 140-coin rent shortfall must be serviceable once normal wages and rent terms are designed.
- Validate that game dialogue uses concrete period-appropriate words, not metaphors/personification newly introduced after 2026-10-19, and character-specific speech approved by the user is preserved unless an approved correction supersedes it.

**Change control:** The user approved the audit repairs, shared implementation direction and **post-fight clinic examination for genuinely unhurt characters** on 2026-10-19. This document **does not** approve combat/medical balancing, a compulsory first/second hit, an invented injury, specific non-tutorial wage amounts, final rent terms or new mandatory NPC dialogue.
