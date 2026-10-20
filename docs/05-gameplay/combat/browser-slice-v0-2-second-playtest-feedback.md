# Combat Browser Slice v0.2 — Second Player Playtest, Difficulty and Information

**Status: PLAYER FEEDBACK CONFIRMED / NEXT REVISION REQUIREMENTS PROPOSED, 2026-10-20. NOT A NEW APPROVAL OF NUMERIC STATS, ENEMY ABILITIES, UI OR SCRIPTED OUTCOMES.** This note tracks hands-on gameplay reports and targeted inspection of the actual v0.2 ZIP source code; it is a backlog and design proposal, **not an implementation claim or a commit of source code**.

## What the player observed

1. The three fights are now **too easy**.
2. NPC intent disclosure feels like a **cheat code**: when to Guard, Attack and Move can be deduced with almost 100% certainty.
3. The injured boar is **the same trivial move-aside → boar withdraws** every playthrough.
4. Narrative logs are improved over v0.1 but **repeat too predictably for the same attack**.
5. **Approved UX direction to retain:** select an action (e.g. Move), then a context-specific form (e.g. Back Away). This structural affordance is liked. The final UI artwork/style is not thereby approved.
6. The user asks whether Health/damage/Stamina etc. numbers are already locked. **No, except canonical starting maximum Health 50 and the approved resource design principles.** All opponent HP, attack ranges, odds, recovery costs, stamina/composure actual maximum and AI weights in the ZIP are prototype-only. Momentum +10/+8/+5 is an accepted **trial configuration**, not final balance.

## Verified concrete v0.2 code causes

Inspection of v0.2's delivered `combat.mjs`:

- `makeIntent()` serializes a nearly literal enemy decision into `tell`: Flint visibly announces attack direction, Guard, withdraw and a strongly distinct special; boar telegraphs a charge, then specifically announces withdrawal. The AI is genuinely precommitted, but **intent presentation leaks too much**.
- In `perform(... move ...)`, **every player movement option except Close** sets `pathOpen=true` in the boar scene. At the next `makeIntent()`, `scene === 'boar' && state.pathOpen` immediately returns an unconditional withdrawal. This is the reproducible trivial boar pattern, **not player balance or human skill**.
- The event narrator uses `choose(state, [two or three short text strings])`, selected per hit/miss from a tiny fixed phrase table, with **no contextual memory or repetition limit**. It is expected to repeat quickly even though the descriptions vary.
- The damage/Health/Stamina are spike constants, not item canon: player default `hp 50`, `stamina 90`, `composure 80`, unarmed base 6 (range roughly 4–8), Flint `hp 24` club base 10 (range 7–13), boar `hp 20` charge base 12 (roughly 8–16), Silas `hp 22` hook base 8 (roughly 5–11); basic attack cost 8, Guard cost 5, Move cost 6, Catch Breath +16, and +10/+8/+5 Momentum in working build. **None of these test fixtures silently becomes permanent game data.**
- Prior automated 500-seed Flint simulation found **447/500 wins by attack spam**, confirming weakness even without using the enemy's intent UI. The next tuning pass must improve meaningful counterplay and AI, not just conceal telegraphs.
- The prototype's 28 green unit/API checks validated code invariants but did **not** guarantee a good difficulty curve, varied conditions, a satisfying narrative, or genuine human win-rate fairness.

## Recommendation for v0.3 — honest partial information, never psychic AI

**Retain the accepted fixed rule:** the NPC selects and commits its action **before** the player chooses; no reaction to a user's current input or secret retarget. Change **what the player is told**, not when the NPC commits.

- Telegraph **observable cues / threat class / rough urgency**, not a free exact-action prediction for every turn. A wind-up can still be clear (e.g. a large overhead swing); other cues may reveal movement or imminent aggression without the exact zone, attack-vs-feint or Guard being automatically explicit.
- Telegraph clarity can vary by **actual technique**, enemy competence, stance, distance, cover and player condition, and should still provide at least two defensible responses; never devolve into pure opaque coin-flip attacks.
- Special attacks must be **readable as more dangerous** (the opponent has Momentum and shows the necessary wind-up) but not automatically reveal every effect/counter in advance. **No dishonest UI**: a displayed guaranteed Head attack must not resolve as a surprise limb hit.
- Player has a credible fallback when uncertain: a basic Guard, Move to genuine cover, or Attack with opportunity cost. More uncertainty **must not** mean every encounter becomes unguardable.

## Recommendation for v0.3 — boar without a one-bit victory switch

Replace global `pathOpen` flip with **small actual geometry/objective facts**:
- Player's location relative to boar's charge lane (still occupying it / moved clear);
- Whether there is a reachable **firm safe exit** for the animal (may depend on prior approved Stage 5 positioning, unstable bank, fence gap, distance);
- Whether a move finishes before a committed charge can connect; and
- Whether the injured animal's current condition/fear/risk makes retreat rational, if that route is truly open.

**Do not force exactly three rounds** or make a player punch the boar. A genuinely superb first Move *can* still open the route and lead to withdrawal. But **the three Move subtypes must not all be equivalent instant win buttons**. Depending on grounded position, Back Away might leave the charge lane open but place the player on unstable ground; Side Step might clear the animal's line but not yet open an adequate gap; Cover could protect the player while the fence remains blocking the boar. Animal choice must remain motivated and its charge the normal zero-Momentum action, and the already approved nonlethal victory/defeat must remain reachable.

## Recommendation for v0.3 — procedural, state-aware battle chronicle

Use **events-first narration**, not just a larger random synonym dictionary:
1. Store the true structured event: actor, committed technique, zone, physical weapon, miss reason, realized damage, Guard absorption, positional movement, momentum, injury and resulting enemy reaction.
2. Render a short 19th-century industrial combat sentence that depends on real context: prior action, new or repeated defense, approach angle, whether the attacker is overextended, target posture and current wound. **Don't invent a fracture, broken fence or bleeding** unless engine state recorded it.
3. Apply a short **no-repeat window** to the exact wording/template when suitable alternatives exist; rare exact repeats are allowed for truly identical states instead of artificial verbosity.
4. Give pivotal events (first actual wound, special wind-up, route opened, defeat, yielding) richer descriptions; suppress repetitive routine resource accounting unless a user opts into numbers.
5. Render distinct factual status info on demand, without hiding mechanically important outcomes under excessive prose. Preserve logged RNG/events so reconnect generates the same narrative rather than rerolling adjectives.

## Recommendation for v0.3 — actual difficulty not just opacity

- Keep the selected-action-then-subtype UX: **Move → Side Step / Back Away / Cover**; similarly Attack → Head/Torso/Limbs and Recover → mode.
- Improve Flint's **actual** AI decision quality: attack-only wins too often; train behavior against predictable aggression without permanent Guard, cheating, arbitrary Health/damage inflation or reaction to the current submitted move.
- Evaluate if basic hit probabilities, defense opportunity costs and nonlethal surrender threshold make unarmed attack-spam too effective. Prefer clear tactical trade-offs.
- Record results from three starter encounters at multiple pre-fight positions, plus endgame hypothetical stress tests. 500-seed basic/defense/movement/reactive strategies and actual human plays; do not optimize for 50/50 randomness as a measure of fun.
- Ask for player feedback before locking NPC combat stats, intent opacity rules, injury rates or UI theme.

### Beginner encounter tests (3)

1. **Flint:** a partial club wind-up indicates credible danger, not always exact Torso hit; repeated novice aggression becomes tactically vulnerable without Flint secretly knowing the user's click. Guard/Move/Attack should each be rational in some real states.
2. **Boar:** player picks Side Step, Cover or Back Away; each changes different grounded route/charge facts. Boar escape may occur at once only when there truly is a safe line; the animal can still charge and knock down a player who misjudges timing.
3. **Silas:** preserve the comparatively dynamic reach/Guard/box role; don't flatten him into the same pattern as Flint. More ambiguous hook preparation and a few genuine spatial decisions, without mandatory injury or seizure of notes.

### Hypothetical endgame tests (3; NOT NEW CANON)

1. **Veteran rifle opponent:** telegraph whether they're sighting/advancing/reloading in realistically observable terms; clear cover and reading ammunition matter without exposing every exact target zone or yielding a guaranteed dodge.
2. **Two veteran opponents:** each commits individually and visibly, but overlapping intents create choice without one perfect answer; actor-specific Momentum and ammo constraints still apply.
3. **Pressure-workshop struggle:** equipment/steam hazards can be detected by audible/physical cues, not always exact imminent outcome; player can choose cover, attack or valve interaction with real exposure risk, no compulsory mystery debuff.

**Approval boundary:** User approved **Part 1–9 core principles** but has NOT approved the current enemy HP, weapon damage ranges, 70% hit baseline, AI percentages, intent-display precision, boar one-bit path shortcut, or final UI/UX art. This document is **recorded feedback and proposed next revision**, not locked rules and not a shipped v0.3.
