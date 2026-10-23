# The Pall — Close the Editorial Loop, Begin Playable Production

**Working decision — 2026-10-23.** This is the assistant's recommended production route, not a new change to previously locked quest mechanics or a claim of owner approval for every future implementation choice.

## What is approved and what is not built

- **Millhand Stages 1–6** have fresh approved editorial rewrites. Stage 5 Revision 01 (with the new personal Journal) and Stage 6 Revision 02 were explicitly approved by the owner on 2026-10-23. The **combat log and separate combat v0.5.1 system are already approved and must not be rewritten** during story editing.
- **Millhand Stages 7–8** have approved story/service structures, but the new editorial pass has not reviewed their final dialogue, personal Journal and interface wording. Stage 8's rent/home scene is shared among all six backgrounds; do not make six divergent versions.
- **Bellrunner, Squatter, Stitcher, Scrapper, Inkbound:** Existing GitHub README files document complete approved eight-stage **narrative structures**. These are not yet proven production-ready or newly audited against the later October 22–23 language rules. Do **not** restart them wholesale or assume historical approvals imply no writing defects.
- The last locally packaged Millhand playable browser slice covers **Stages 1–4**; approved rewritten copy is not yet fully integrated. Stage 5–8 and combat integration are implementation work rather than merely manuscript polishing. A visually provisional UI should not be mistaken for final artwork or UX.

## Recommended order

### 1. Finish the remaining shared-facing copy, not another six-origin rewrite
Complete **Millhand Stage 7 (clinic)** and **Stage 8 (shared rented home/rent notice)** editorial review. Align Stage 1–8 personal Journal entries with the approved **natural, personal, first-person** voice, preserving actual recorded choices. The official combat log remains separate and unchanged. Treat Stage 8 as shared content; where an origin needs a legitimate different response, authorize the difference explicitly rather than copy-pasting a universal diary line.

### 2. One executable Millhand vertical slice
Integrate *already approved* text and stages, not more speculative prose. Connect existing battle system v0.5.1 to real Flint entry stances, win/loss persistence, Stage 7 care and Stage 8 rent. Preserve v0.4.1 deliberate manual dialogue progression. No auto-advance or wrong-object highlighting. Verify exactly-one skill-level reward, 0 tutorial money/XP/loot, 20→10 coin clinic accounting, state resumes, outcomes and journal accuracy. Keep documentary industrial art direction, with temporary assets clearly flagged.

### 3. Test with actual players before polishing five more manuscripts
Run a small structured external usability playtest involving both genre-literate and unfamiliar players, including people who are not native English speakers. Observe:
- Where players cannot understand an instruction or object.
- Whether choices feel genuine and their consequences are clear.
- Whether Flint feels hard but fair, and whether a loss still makes sense.
- Whether players feel curious to take a regular job after the rent notice.
- Whether players can tell the Journal apart from the combat log.
- Whether players enjoy the experience enough to continue voluntarily.

Log concrete observations, severity and reproduction steps. Do not fabricate conversion or retention targets or assume good prose alone guarantees sales.

### 4. Five-origin targeted editorial and implementation audit
Audit **Bellrunner, Squatter, Stitcher, Scrapper, Inkbound** against the latest standard, in gameplay order, with distinct voices preserved. Each stage receives one disposition:
- **KEEP** — already readable, grounded and consistent.
- **EDIT** — precise bad phrases, unclear instructions, wrong perspective, impersonal Journal or incorrect object feedback.
- **REWORK** — actual scene or interaction fails agency, stakes, causality or game-state correctness.

Review critical problems and required gameplay implications with the owner; avoid requesting full reapproval of every unchanged line. Reuse shared medical, housing, Journal, UI and combat systems, but keep origin-specific story beats genuinely different. An approved text draft does not imply a built, tested gameplay stage.

### 5. Production gates
Treat the game as ready for broader origin implementation only when the Millhand E2E slice can be completed/replayed without softlocks, both Flint fight outcomes work, saves and journal state remain coherent, all three Stage 4 routes converge correctly, and test-player feedback identifies no blocking comprehension or agency defect.

Continue toward broader release when other origins pass the same gates, performance is acceptable, scope/production budget is controlled, and real-world playtests support the game's enjoyment and return-play loop. Commercial viability additionally needs distribution, operating costs, monetization fit and retention validation; it cannot be inferred from writing polish.

## Nonnegotiable content rules

- Second-person scene and interaction narration; deliberately chosen first-person player speech; **first-person natural personal Journal**, which may express relief, annoyance or doubt without inventing unseen facts.
- No personification or metaphor shortcuts, no showy bureaucratic diction, no forced humour, no NPC all-knowing exposition. Spoken lines must suit the individual person's job and knowledge.
- Combat log is **approved and separate**; do not rewrite/replace event messages, turn history or mechanics.
- Maintain period grounding, industrial naturalism, live player choices, manual dialogue steps, 1.2-second post-action pacing when needed and realistic document/object interactions.
- The Millhand story and every other origin's already-approved core stages, opponents, choices, currency and skill rules remain canon unless the owner expressly changes them.

## Immediate next work item

**Draft Millhand Stage 7 and the shared Stage 8 closing scene for a final editorial review, including more human Journal entries.** Then implement the entire Millhand tutorial in the playable browser vertical slice and test it before individually revisiting five more manuscripts.
