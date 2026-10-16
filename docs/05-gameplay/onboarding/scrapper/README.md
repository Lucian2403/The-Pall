# Scrapper — Rust Yard Opening

**Tutorial economy / housing rule (LOCKED 2026-10-14):** The first and second opening work tasks are **unpaid (0 coins) and award no ordinary XP**; the scripted introductory fight also awards 0 XP, coins and loot. On committing to a second-task choice, gain **+1 level once** in that branch's *different* Major Skill, alongside the initial +3 Major Skill granted at character creation. All origin characters begin with 20 coins, spend 10 on the standard tutorial clinic service, and return to the same shared rented home with 10 coins. Its rent notice is **150 coins PROVISIONAL**, due date/penalties TBD. Ordinary repeatable jobs outside these six exceptional tutorials still pay coins and XP. Precise in-world reasons each tutorial task is unpaid should be written into the eventual dialogue.

**Status: Scrapper E2E storyline LOCKED (2026-10-13).** Rust Yard, named Yard Foreman **Ignatius Smog** (cough and exact fresh-air quotation), regular Mechanics job **Strip a Condemned Pump**, **The Last Dry Floor**, three choice-dependent unpaid tutorial second tasks, **The Copper Claim**, **The Red Lever**, and **Barnaby Rusk** as the common street-fight opponent were approved by the user. Shared starter kit, Mechanics +3 and [shared tutorial structure](../shared-structure.md) apply. Combat implementation, dialogue, numbers and remaining NPC personal names are TBD.

**Stages 1–2 APPROVED AND LOCKED (2026-10-16):** [Ignatius Smog's plain-language opening](opening-dialogue.md) and [the simple pump-strip Mechanics work](condemned-pump-interaction.md) were explicitly approved after rewriting complicated jargon into clear actions. **Stage 3 — [The Last Dry Floor scene and three choices](last-dry-floor-discovery.md) and Stage 4 — [The Brace Shift / The Low Passage / The Spare Line](second-task-branches.md) are APPROVED AND LOCKED (2026-10-16)**. **Stage 5 — [The Copper Claim / The Red Lever](barnaby-confrontation.md) and Stage 6 — [Barnaby Rusk's fight](barnaby-fight.md) are PROPOSED (2026-10-16)**; exact dialogue and encounters await approval. Global combat numbers remain TBD. The overall story structure remains locked.

**Universal Stage 8 (LOCKED 2026-10-15):** After the 10-coin clinic visit, use the identical [shared rented home, rent notice and exact Millhand-origin closing speech](../shared-home-rent-ending.md) that applies to all six backgrounds. Do not draft a different closing speech for this origin.

## Locked start and regular NPC

- **Background:** Scrapper, a demolition/salvage-yard worker. At character creation gains **+3 levels in Mechanics** (Major Skill, not a subskill), starting STR / DEX / INT / RES at 5 and maximum Health 50.
- **Starting location:** **Rust Yard** (exact spelling and capitalization LOCKED), an industrial salvage/scrap yard associated with condemned steam equipment, broken pumps, boilers, iron and salvage work. This is a **persistent regular Mechanics job hub**, not a temporary onboarding-only set. Precise map area/layout and visual assets still TBD.
- **Recurring NPC / regular work issuer:** **Ignatius Smog, the Yard Foreman** (full name and role LOCKED). He issues ordinary scrap/Mechanics jobs, and job resolution pays coins and skill XP via the standard job rules. His personal manner, authority and pay formulas remain for later design.
- **Locked voice and characterization:** **You can hear him coughing from three blocks away.** He refers to fresh air as **"that elitist bourgeois luxury."** These are intentional details of his characterization, not hints at a currently designed medical condition/quest or hidden health stats. Preserve the line exactly when scripting his voice.
- **Universal starter loadout:** **Basic Clothes, one Crude Small Bag, 20 coins**, exactly like every other background; no free starter tools, weapons or special Scrapper loot.

## First regular job — Strip a Condemned Pump (LOCKED; unpaid tutorial occurrence)

The [approved Stage 2 scene](condemned-pump-interaction.md) is simple to picture: take two old metal plates off the pump's outer stand, free a rusty bolt, sort good pieces from broken ones and count what was done. The [approved Stage 1 opening](opening-dialogue.md) tells the worker exactly that. All **player-facing choices and dialogue use familiar words**, though the fixed job title remains *Strip a Condemned Pump*. The player leaves the main pipe untouched; **the later cellar reveal is not shown early**.


Ignatius Smog assigns the player to inspect and dismantle a condemned industrial pump and sort salvageable pieces from scrap, using ordinary reusable **Mechanics** interactions, yard-owned tools as needed, and normal wage/XP settlement **outside onboarding**, but 0 coins/ordinary XP in this exceptional tutorial. This job is available outside the tutorial, with ordinary different machinery/condition content; it is not just an introductory quest in disguise. The **first tutorial occurrence** concerns a condemned auxiliary drainage pump on Rust Yard's old culvert wall, so it can conceal the unique incident. Exact duration, wear and yield mechanics and non-tutorial coins/XP are TBD; tutorial returns 0.

**Reusable job phases:** accept the scrap docket and see the normal wage/risk; isolate a work section and identify reusable parts; choose removal order/tool to protect valuable fasteners or linkage; sort recovered pieces by condition and submit ordinary work. Crucially, **the initial safe strip only removes external guards and nonessential hardware**—it does not disconnect the pump's working drainage connection before the tutorial discovery. This keeps the machine and its dependent households physically viable. Beginner work must be possible with workshop-supplied tools, not a forbidden free starter item.

The **story twist must follow the regular job interactions**, not substitute for them. One consequential choice will then lead to an unpaid tutorial second task in a **different Major Skill**; subsequent story interactions lead to an appropriate beginner **turn-based PvE** fight, medical treatment and a return home where rent is revealed. See [Shared Tutorial Structure](../shared-structure.md). **The Last Dry Floor, all three branches and Barnaby Rusk are approved narrative elements; exact implementation is still to be designed.**

## Locked unique twist — The Last Dry Floor

The [Stage 3 discovery dialogue, simple inspection and three player choices](last-dry-floor-discovery.md) are **APPROVED AND LOCKED (2026-10-16)**. The discovery's underlying facts, exact warning text and three Major Skill destinations are already locked independently of these proposed spoken lines.


**Trigger:** only after the normal Mechanics interactions are done, on the first Scrapper tutorial; it is not a random event in all pump jobs.

The player clears the outer housing of a **condemned auxiliary drainage pump**, mounted above an old runoff culvert passing under Rust Yard. Smog's salvage docket lists it as **abandoned**, ready to disconnect for copper and fittings. Yet the pressure dial rises and falls under real load. From a hidden service pipe the player finds a strip of packing cloth, recently scratched with a warning:

> **DON'T STOP IT. WATER REACHES THE BEDS.**

There is another sign: three deliberate knocks from beneath the iron floor. The pump is still keeping a sealed, officially deserted under-yard lodging dry. Several families have been living in old flood cellars without lawful tenancy. To the city's salvage books, the pump is dead metal; to them, it is the last dry floor.

The presence of tenants is a local social and industrial fact, **not** a promised main-story mystery, hidden new faction, or proof of Pall mutation. Smog need not have planned this. His scrap order may be authentic but dangerously uninformed, and his response should be developed without turning him into a one-dimensional villain.

### Three locked first-event responses and unpaid tutorial second tasks

The [Stage 4 playable tasks and dialogue](second-task-branches.md) are **APPROVED AND LOCKED (2026-10-16)** and use accessible, non-technical speech. The table's three existing job identities, skills and outcomes remain locked at outline level.


| Player response | Second job, using a different Major Skill | Immediate discovery / meaningful outcome |
| --- | --- | --- |
| **Keep the water back** — refuse to sever the pump until a physical stopgap exists | **Industry → Construction — The Brace Shift.** The player helps a municipal drain gang with a basic culvert shoring / outlet clearing shift; this tutorial work is unpaid. Reusable worksite safety, material choice and sequence/checkpoint modules; no Mechanics work disguised as a second skill. | The cracked culvert wall is beginning to leak around the foundation. Shoring buys a safe window for the people below, but cannot permanently rescue their homes. |
| **Find a way out for the occupants** — answer the three knocks and trace the service passage | **Fieldcraft → Navigation — The Low Passage.** A regular low-tier canal-way survey route pays for checking accessible maintenance paths, marking a safe return route and assessing obstacles; reusable navigation/route and environment-reading modules. | The occupied flood cellars are reachable through a dry side passage, allowing the people to leave if the pump must be removed. A few refuse to abandon their possessions—no magical mass rescue, only a practical exit. |
| **Challenge the salvage order** — try to redirect replacement stock before copper is cut | **Commerce → Logistics — The Spare Line.** The player helps a yard dispatch clerk arrange a routine pump-parts delivery or substitute drainage hose, unpaid during onboarding; the player reconciles destination, allocation and delivery routing using ordinary Logistics/dispatch interactions. | The old pump cannot just be reclassified as expendable without imposing emergency drainage costs on a district the city says is empty. A temporary substitute can be directed there, but nobody has agreed to pay for a lasting solution. |

**Contract credibility:** the second tutorial tasks reuse **normally paid job templates** sourced from city drainage, canal survey and logistics work, with a story-specific incident. Do not award coins merely for clicking a humanitarian choice. All three scripted routes award 0 coins/ordinary XP; choosing one grants exactly +1 level in its different Major Skill once. The first Mechanics task is also unpaid. Equivalent jobs outside tutorial pay normally. No starter-only gear. Its stage does **not** immediately end the E2E tutorial.

### Two further interactions → one shared opponent (LOCKED narrative)

The detailed [Stage 5 Barnaby / red lever confrontation](barnaby-confrontation.md) and [Stage 6 fight with win/defeat outcomes](barnaby-fight.md) are **PROPOSED (2026-10-16)** for the user's review. They preserve the locked story but add actual spoken lines, a believable work-stop order and a defeat-safe intervention by workers who were already present. **Do not mark these new dialogues locked until approved.**


The story converges beside a pipe-cutting gantry at Rust Yard, after the second unpaid tutorial task has delivered its distinct physical or administrative leverage.

**Interaction 1 — The Copper Claim:** **Barnaby Rusk** (LOCKED personal name), a competing **piece-rate breaker**, arrives to sever the abandoned pump's copper branch. He has already been promised a bonus for the weight. He sees the Scrapper as someone obstructing his paid salvage. Depending on the chosen branch, the player can show the shoring gang's work order, point out an evacuation path, or produce a redirected logistics docket. Barnaby dismisses the warning because acknowledging residents would cost him his shift earnings. This is a brutal economic choice, not a secret top-level official ordering a murder.

**Interaction 2 — The Red Lever:** Barnaby reaches for the isolation lever / cutting gear that would stop the auxiliary pump. The player can block the walkway, take cover behind an iron scrap bin, or try one last verbal warning. A fight follows regardless; positioning and intent may influence the eventual common turn-based combat system, which is **not yet being defined**.

**Common beginner PvE opponent:** **Barnaby Rusk, a fellow salvage breaker**, not Ignatius Smog, not a city authority. An individual used to ironwork and physical intimidation, equipped with a modest improvised hand implement; exact weapon, AI, enemy stats, damage and costs **TBD**. The clash should be moderately challenging but survivable for a player starting with Basic Clothes, Crude Small Bag and no free weapon. No forced fatality: driving him off is enough. Losing should not permanently strand the tutorial or kill trapped NPCs as a tutorial softlock.

**Local closure:** Barnaby retreats / is forced away, and the pump is not cut *during this episode*. The player's second-job choice changes what is temporarily secured: shoring, exit route, or replacement drainage. The displaced residents and the city's neglect remain a grim practical dilemma, but **this is a complete local E2E episode, not chapter one of the main campaign**. Do not promise that every trapped household is housed or that a permanent new public works system has been built.

### Treatment, home and rent (narrative sequence LOCKED; numbers TBD)

The brawl leaves the Scrapper with a credible minor injury—battered ribs, split knuckles or a forearm abrasion are possible flavors; exact conditions and Health effects TBD. The player pays **10 coins** to a working-class city clinician to patch them up, learns the reusable healing interface, and returns to the same shared starter home with 10 coins remaining. The **rent-due notice appears at home, after care**. This completes Scrapper onboarding.

**Pacing and parity:** all three second jobs must be within a comparable beginner time envelope (tutorial payouts are all zero). Encounter remains a single grounded short turn-based PvE conflict, not a machine boss or a second forced fight. No early Pall-zone expedition, long rescue quest, specialized parts gate or hidden fraud/crime/reputation flag.

## Locked versus to be detailed

**LOCKED:** Rust Yard permanent Mechanics hub; Ignatius Smog as named recurring Yard Foreman, cough and exact quotation; **Strip a Condemned Pump** repeatable first Mechanics job; **The Last Dry Floor** twist; three unpaid follow-up tutorial tasks (**Industry/Construction — The Brace Shift**, **Fieldcraft/Navigation — The Low Passage**, **Commerce/Logistics — The Spare Line**); **The Copper Claim** and **The Red Lever** pre-combat story interactions; **Barnaby Rusk**, named fellow salvage breaker, as common PvE foe; keeping the pump running long enough for a short-lived reprieve, medical treatment, return home and rent notice. Mechanics +3 and universal starting kit apply. This is self-contained, not the main campaign.

**Still TBD:** precise locations, non-tutorial wages/XP, salvage yields, effects and medical outcomes, named NPCs for secondary jobs, dialogue, timing, plus all deferred turn-based combat systems/values. No further permanent story systems are implicit.

## NPC naming rule (LOCKED for all six origins)

**Revised NPC rule (2026-10-14):** only important recurring/major story characters require approved personal names or recognizable monikers. **Ignatius Smog** and **Barnaby Rusk** are locked. Minor supporting NPCs such as drain-gang leads, surveyors or dispatch clerks may remain **unnamed occupational roles**, including when they give routine instructions. Do not invent additional names just to fill a list.

## Remaining production tasks

1. Keep drain-gang, canal-surveyor and dispatch-clerk NPCs as role-labelled minor characters; no names required unless they become important later.
2. Author reusable interactions, dialogue and scene geometry while preserving three second tasks with identical 0-coin/0-XP rewards and a one-time +1 level in the chosen other Major Skill.
3. Define item props, numerical rewards, non-tutorial clinic costs (tutorial care is fixed at 10 coins) and durations later; global turn-based combat system remains deferred.
