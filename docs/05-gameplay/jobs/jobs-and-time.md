# Jobs and Time System

## Core rule

The Pall has no universal Action Point / Energy system.

Actions consume context-specific resources such as:
- Stamina
- Composure
- Hunger
- Thirst
- tools, fuel, ammunition, ingredients or equipment durability

Most meaningful actions also consume real time.

## Job duration

Most personal actions should resolve in seconds to tens of minutes. Typical examples: pistol repair ~10 seconds, research sample ~2 minutes, construction shift ~20 minutes.

Time is part of the cost, but the player should not normally:
1. click a job;
2. wait;
3. collect a reward.

Jobs should be interactive work sessions.

## Reusable job structure

A job is built from reusable phases:

1. **Accept / Prepare**
   - choose tools or equipment;
   - choose supplies;
   - choose work approach;
   - see expected duration and risks.

2. **Work Phase**
   - consumes time and resources;
   - may contain one or more interaction modules;
   - may create incidents or opportunities.

3. **Checkpoint / Incident**
   - player makes a decision;
   - skill, attribute, equipment and condition alter available choices and outcomes;
   - failure should usually create cost or complication rather than a binary 'job failed'.

4. **Resolution**
   - pay, materials, reputation, skill progress, injuries, discoveries or follow-up opportunities.

## Interaction modules

Do not create a unique minigame for every job. Jobs should combine a library of reusable modules.

Examples:
- precision/timing window;
- resource allocation;
- route or sequence choice;
- risk/reward choice;
- matching/assembly;
- inspection and anomaly spotting;
- dialogue/negotiation;
- tool selection;
- prioritization under a time or resource limit;
- incident response;
- simple puzzle;
- skill check with contextual choices.

These should be mobile-friendly and low-twitch. The game is a persistent browser MMO, not an arcade game.

## Short jobs

Jobs around 1–5 minutes may be fully interactive from start to finish.

Example: unloading a damaged coal cart:
- inspect cargo;
- decide how much to move per trip;
- react to a broken wheel;
- choose whether to finish quickly or safely.

## Medium jobs

Jobs around 1–10 minutes should include several short phases or at least one meaningful interaction.

Illustrative workflow example, not yet a canonical named Phase One job: repairing a public steam pump:
- diagnose fault;
- select parts;
- begin repair;
- encounter pressure instability;
- choose shutdown, bypass or risky live repair.

## Longer jobs

Jobs around 10–30 minutes should be semi-active rather than passive waiting.

Example: a construction shift may last around 20 minutes, with setup choices and one or two incidents/checkpoints.

Missing a checkpoint should not normally destroy the job. A safe/default outcome should resolve automatically, usually less efficiently than active intervention.

Travel should generally be short enough to preserve momentum. A typical route may take around 3–5 minutes and should usually guarantee at least one encounter or meaningful event, so travel itself becomes gameplay rather than dead time.

## Design goal

A job should answer:
- What am I doing?
- What can go wrong?
- What decision do I make?
- What does my character/build change about this?
- Why might I choose a different approach next time?

If the only interesting answer is 'wait for the timer', the job is not finished design.

## Examples by profession

### Hauling
Weight planning, route choice, equipment wear, accidents, load balance.

### Construction
Material choice, sequence, tool quality, structural mistakes, injury risk.

### Research
Hypothesis selection, sample allocation, anomaly interpretation, Composure management.

### Medicine
Diagnosis, treatment choice, supply use, procedure risk.

### Workshop
Machine setup, tolerances, component quality, fuel/noise trade-offs.

### Guard work
Observation, suspicious events, questioning, escalation choices.

## Progression

Jobs can provide:
- money;
- reputation;
- skill XP;
- small attribute-growth opportunities;
- materials;
- discoveries;
- contacts;
- unlocks;
- injuries or conditions.

Jobs themselves do not need a separate universal Job XP system unless a later profession-specific mastery design justifies it.

## Locked direction

- No universal AP/Energy bar.
- Time is a real cost.
- Jobs are interactive, not simple timers.
- Long jobs remain compatible with asynchronous browser play.
- Reusable interaction modules keep the system feasible for a solo developer.


## Continuous world time during interaction

Timers do not pause when an encounter, incident, dialogue, puzzle or job interaction appears.

The timer represents elapsed world time, not a UI countdown that freezes while the player thinks.

### Travel example

A route has a base travel time of 3 minutes.

- The player departs.
- An encounter appears after 20 seconds.
- The travel timer continues running while the player reads and resolves the encounter.
- If the player resolves it quickly, the remaining route continues normally.
- If the encounter takes longer than the original 3-minute route time, arrival is blocked until the encounter is resolved.

Therefore, 3 minutes is a base travel duration, not a guaranteed completion time.

The actual journey may take 3 minutes, 5 minutes, or longer depending on encounters and player decisions.

### Job example

A construction shift has a base duration of 20 minutes.

An incident appears during the shift. The job timer keeps running while the player handles it.

If the nominal 20 minutes expires while an unresolved interaction is still open, the job does not magically complete through the incident. Completion waits for resolution, then applies the outcome.

Waiting longer at a prompt does not improve rewards or progress. It only consumes real time.

### Design rule

Interactive events are part of elapsed time, not pauses between chunks of elapsed time.

This keeps the game moving and avoids the artificial feeling of:
timer → pause → interaction → resume timer.


## Early interaction window

For player-controlled travel and jobs, mandatory encounters, incidents, puzzles, dialogues and other interactive prompts should normally appear within the first **2 minutes** after the activity starts.

The player should never feel forced to watch a 20-minute timer because an important prompt might appear at minute 18.

### Travel

For a 3–5 minute route:
- an encounter should appear early, usually within the first 20–120 seconds;
- the route timer continues during the encounter;
- once the required encounter is resolved, the remaining travel time may complete passively;
- if resolving the encounter takes longer than the nominal route time, arrival waits for resolution.

### Jobs

For a 20-minute construction shift:
- preparation and any required incident/interactivity happen within roughly the first 2 minutes;
- after those interactions are resolved, the remaining work time can safely run in the background;
- the player can leave the screen or close the browser without worrying that a mandatory prompt will appear later.

Late random events may exist only if they resolve automatically and do not punish the player for being absent. They must not require babysitting.

### Design intent

The player engages first, then commits time.

Longer durations represent the character continuing the work, not the player being required to stare at the countdown.
