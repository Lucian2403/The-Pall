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

Jobs may last from roughly one minute to two hours.

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

Jobs around 5–30 minutes should include several phases with short interactive checkpoints.

Example: repairing a public steam pump:
- diagnose fault;
- select parts;
- begin repair;
- encounter pressure instability;
- choose shutdown, bypass or risky live repair.

## Long jobs

Jobs around 30–120 minutes should be semi-active.

The player starts the work, makes meaningful setup choices, and may receive one or more checkpoints.

Missing a checkpoint should not normally destroy the job. A safe/default outcome should resolve automatically, usually less efficiently than active intervention.

This prevents the game from demanding alarms or constant checking.

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
