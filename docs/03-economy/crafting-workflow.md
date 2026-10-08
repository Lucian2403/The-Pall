# Crafting Workflow

Status: PROVISIONAL / implementation-ready direction.

## Core principle

Crafting is a timed work activity, not an instant menu action and not an idle-game queue.

The player should make meaningful decisions before and near the start of the process. After the required interaction is resolved, the remaining process time may continue in the background.

Crafting follows the same world-time rules as other jobs:
- timers continue while interactions are open;
- unresolved mandatory interactions can delay completion;
- most mandatory interactions should occur early, usually within the first ~2 minutes;
- no premium time skipping.

## 1. Preparation

The player chooses:
- recipe;
- quantity/batch size;
- intended quality tier;
- materials/components;
- allowed substitutions where the recipe supports them;
- facility/workstation;
- tools;
- fuel or consumables;
- optional maintenance/preparation;
- production method where more than one is known.

The UI previews:
- required materials;
- expected material waste;
- estimated time;
- expected fuel use;
- possible quality/result range;
- relevant skill/specialization;
- major risks or deficiencies.

The server reserves or consumes inputs according to the recipe rules when work begins.

## 2. Early work interaction

A crafting job should normally contain one meaningful interaction near the beginning rather than several tedious checkpoints.

Reusable interaction patterns:
- inspect incoming materials;
- choose heat/pressure/process setting;
- select which defect to correct;
- calibrate a mechanism;
- choose between speed and material efficiency;
- allocate extra fuel;
- choose a substitute component;
- identify a bad material batch;
- decide whether to rework or accept an imperfection.

These should be text/UI decisions, not twitch minigames.

Higher skill reveals better information and additional choices.

Example:
A novice sees:
- Increase heat
- Continue
- Stop job

An experienced smith may see:
- Raise temperature gradually; current metal is underworked
- Add flux and preserve the billet
- Continue at current setting; likely higher waste

Skill therefore changes understanding, not merely a hidden +success percentage.

## 3. Processing time

After the required interaction, the job continues for its remaining base time.

Typical direction:
- simple consumable/component: 10-60 seconds
- basic equipment/component assembly: 1-3 minutes
- substantial finished equipment: 3-10 minutes
- heavy industrial/base component: 10-20 minutes

Longer industrial processes may later be delegated to machinery/workers rather than requiring the player's character to remain occupied.

Only one major personal timed activity runs at once.

## 4. Outcome

Crafting should not be binary unless the recipe genuinely requires it.

Possible process outcomes:
- Poor
- Acceptable
- Good
- Excellent

Outcome affects things such as:
- material waste;
- fuel consumed;
- starting durability;
- reliability;
- defect chance;
- salvage/byproduct recovery;
- whether the intended quality tier is achieved.

Quality tier and process outcome are related but not identical.

The player chooses an intended quality tier that they are qualified and equipped to attempt.

Example:
A crafter attempts a Fine respirator.

Possible result:
- Excellent/Good: Fine item
- Acceptable: Fine item with lower starting durability or small defect, or a Well-made fallback depending on recipe
- Poor: downgraded result, recoverable components, or failed assembly

Exact fallback rules are recipe data.

Masterwork should never appear as a lucky random upgrade from a low-tier attempt.

## 5. Batch crafting

Batch production is allowed for suitable goods such as:
- ammunition;
- food;
- filters;
- bandages;
- fasteners;
- common components.

Batching should reduce repetitive clicking but not give free efficiency.

A batch may:
- take proportionally longer;
- consume inputs in bulk;
- produce a shared process outcome or several grouped outcomes;
- increase consequences if the player makes a poor early process choice.

Large batches may require larger facilities or machinery.

Finished complex equipment such as rifles or advanced respirators should normally be crafted as individual jobs.

## 6. Material quality and source

High-tier output requires suitable inputs.

A player's skill alone cannot turn poor scrap into Masterwork equipment.

Recipes may check:
- material type;
- minimum processed-material quality;
- component quality;
- contamination state;
- provenance/source tags where relevant;
- facility level;
- tool quality;
- blueprint understanding.

Materials can be economically different without every resource having five universal quality tiers.

## 7. Skill and specialization effects

Relevant crafting skill can improve:
- information revealed during the job;
- material efficiency;
- fuel efficiency;
- crafting time;
- quality ceiling;
- failure tolerance;
- defect detection;
- salvage recovery;
- repairability and durability of output.

Specializations unlock:
- recipes;
- alternative production methods;
- substitutions;
- advanced diagnostics;
- higher quality tiers;
- specialized facilities or tools.

Attributes may gate training or certain physical/technical methods, but should not dominate finished-item power.

## 8. Facilities

Examples:
- crude hut workbench;
- kitchen;
- forge;
- carpenter's bench;
- precision mechanics bench;
- chemistry station;
- medical preparation bench;
- industrial furnace;
- pressure-work station.

Facility requirements create economic specialization.

Limited base space means one player cannot efficiently host every advanced production chain at once.

Facilities themselves may require:
- fuel;
- maintenance;
- replacement parts;
- upgrades;
- room/module capacity.

## 9. Crafting contracts

A future player-facing production contract system should allow:
- customer supplies all materials;
- crafter supplies all materials;
- mixed contribution;
- requested item and minimum quality;
- payment;
- deadline;
- collateral/deposit if needed.

This supports professional crafters without forcing trust-based item handoffs.

Not required for the earliest vertical slice, but the item/economy architecture should not prevent it.

## 10. Design guardrails

Avoid:
- repetitive reaction/timing minigames;
- mandatory attention every few seconds;
- arbitrary daily crafting XP caps;
- random Masterwork jackpots;
- crafting every item personally being optimal;
- recipes that ignore component specialization;
- instant mass production.

The intended feeling is:
**prepare carefully -> make one informed process decision -> let the work run -> receive an outcome shaped by skill, inputs and choices.**
