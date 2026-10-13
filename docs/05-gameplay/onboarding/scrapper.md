# Scrapper — Rust Yard Opening

**Status (2026-10-13):** Rust Yard, named Yard Foreman **Ignatius Smog** and his specified characterization, plus first regular paid Mechanics job **Strip a Condemned Pump**, are **LOCKED by user**. The unique twist **The Last Dry Floor**, second Major Skill job branches, and the rival breaker confrontation are **new story proposals** for review, **not yet locked**. Mechanics +3, universal starter kit and [shared tutorial sequence](shared-structure.md) are locked.

## Locked start and regular NPC

- **Background:** Scrapper, a demolition/salvage-yard worker. At character creation gains **+3 levels in Mechanics** (Major Skill, not a subskill), starting STR / DEX / INT / RES at 5 and maximum Health 50.
- **Starting location:** **Rust Yard** (exact spelling and capitalization LOCKED), an industrial salvage/scrap yard associated with condemned steam equipment, broken pumps, boilers, iron and salvage work. This is a **persistent regular Mechanics job hub**, not a temporary onboarding-only set. Precise map area/layout and visual assets still TBD.
- **Recurring NPC / regular work issuer:** **Ignatius Smog, the Yard Foreman** (full name and role LOCKED). He issues ordinary scrap/Mechanics jobs, and job resolution pays coins and skill XP via the standard job rules. His personal manner, authority and pay formulas remain for later design.
- **Locked voice and characterization:** **You can hear him coughing from three blocks away.** He refers to fresh air as **"that elitist bourgeois luxury."** These are intentional details of his characterization, not hints at a currently designed medical condition/quest or hidden health stats. Preserve the line exactly when scripting his voice.
- **Universal starter loadout:** **Basic Clothes, one Crude Small Bag, 20 coins**, exactly like every other background; no free starter tools, weapons or special Scrapper loot.

## First regular paid job — Strip a Condemned Pump (LOCKED)

Ignatius Smog assigns the player to inspect and dismantle a condemned industrial pump and sort salvageable pieces from scrap, using ordinary reusable **Mechanics** interactions, yard-owned tools as needed, and regular wage/XP settlement. This job is available outside the tutorial, with ordinary different machinery/condition content; it is not just an introductory quest in disguise. The **first tutorial occurrence** concerns a condemned auxiliary drainage pump on Rust Yard's old culvert wall, so it can conceal the unique incident. Exact duration, wear, yields, coins and skill XP are TBD.

**Reusable job phases:** accept the scrap docket and see the normal wage/risk; isolate a work section and identify reusable parts; choose removal order/tool to protect valuable fasteners or linkage; sort recovered pieces by condition and submit ordinary work. Crucially, **the initial safe strip only removes external guards and nonessential hardware**—it does not disconnect the pump's working drainage connection before the tutorial discovery. This keeps the machine and its dependent households physically viable. Beginner work must be possible with workshop-supplied tools, not a forbidden free starter item.

The **story twist must follow the regular job interactions**, not substitute for them. One consequential choice will then lead to a paid second job in a **different Major Skill**; subsequent story interactions lead to an appropriate beginner **turn-based PvE** fight, medical treatment and a return home where rent is revealed. See [Shared Tutorial Structure](shared-structure.md). **The Last Dry Floor, its branches and Barnaby Rusk are newly proposed below and are NOT yet approved.**

## Proposed unique twist — The Last Dry Floor

**Trigger:** only after the normal Mechanics interactions are done, on the first Scrapper tutorial; it is not a random event in all pump jobs.

The player clears the outer housing of a **condemned auxiliary drainage pump**, mounted above an old runoff culvert passing under Rust Yard. Smog's salvage docket lists it as **abandoned**, ready to disconnect for copper and fittings. Yet the pressure dial rises and falls under real load. From a hidden service pipe the player finds a strip of packing cloth, recently scratched with a warning:

> **DON'T STOP IT. WATER REACHES THE BEDS.**

There is another sign: three deliberate knocks from beneath the iron floor. The pump is still keeping a sealed, officially deserted under-yard lodging dry. Several families have been living in old flood cellars without lawful tenancy. To the city's salvage books, the pump is dead metal; to them, it is the last dry floor.

The presence of tenants is a local social and industrial fact, **not** a promised main-story mystery, hidden new faction, or proof of Pall mutation. Smog need not have planned this. His scrap order may be authentic but dangerously uninformed, and his response should be developed without turning him into a one-dimensional villain.

### Three proposed first-event responses and paid second jobs

| Player response | Second job, using a different Major Skill | Immediate discovery / meaningful outcome |
| --- | --- | --- |
| **Keep the water back** — refuse to sever the pump until a physical stopgap exists | **Industry → Construction — The Brace Shift.** A municipal drain gang pays the player for a basic culvert shoring / outlet clearing shift. Reusable worksite safety, material choice and sequence/checkpoint modules; no Mechanics work disguised as a second skill. | The cracked culvert wall is beginning to leak around the foundation. Shoring buys a safe window for the people below, but cannot permanently rescue their homes. |
| **Find a way out for the occupants** — answer the three knocks and trace the service passage | **Fieldcraft → Navigation — The Low Passage.** A regular low-tier canal-way survey route pays for checking accessible maintenance paths, marking a safe return route and assessing obstacles; reusable navigation/route and environment-reading modules. | The occupied flood cellars are reachable through a dry side passage, allowing the people to leave if the pump must be removed. A few refuse to abandon their possessions—no magical mass rescue, only a practical exit. |
| **Challenge the salvage order** — try to redirect replacement stock before copper is cut | **Commerce → Logistics — The Spare Line.** A yard dispatch clerk pays for arranging a routine pump-parts delivery or substitute drainage hose; the player reconciles destination, allocation and delivery routing using ordinary Logistics/dispatch interactions. | The old pump cannot just be reclassified as expendable without imposing emergency drainage costs on a district the city says is empty. A temporary substitute can be directed there, but nobody has agreed to pay for a lasting solution. |

**Contract credibility:** the second jobs are short paid **normal job templates** sourced from city drainage, canal survey and logistics work, with a story-specific incident. Do not award coins merely for clicking a humanitarian choice. All three paths pay ordinary wages and appropriate second-Major-Skill XP, comparable net income, no starter-only gear. The first Mechanics job pays normally too. Its stage does **not** immediately end the E2E tutorial.

### Two further interactions → one shared opponent (PROPOSED)

The story converges beside a pipe-cutting gantry at Rust Yard, after the second paid job has delivered its distinct physical or administrative leverage.

**Interaction 1 — The Copper Claim:** **Barnaby Rusk** (proposed name), a competing **piece-rate breaker**, arrives to sever the abandoned pump's copper branch. He has already been promised a bonus for the weight. He sees the Scrapper as someone obstructing his paid salvage. Depending on the chosen branch, the player can show the shoring gang's work order, point out an evacuation path, or produce a redirected logistics docket. Barnaby dismisses the warning because acknowledging residents would cost him his shift earnings. This is a brutal economic choice, not a secret top-level official ordering a murder.

**Interaction 2 — The Red Lever:** Barnaby reaches for the isolation lever / cutting gear that would stop the auxiliary pump. The player can block the walkway, take cover behind an iron scrap bin, or try one last verbal warning. A fight follows regardless; positioning and intent may influence the eventual common turn-based combat system, which is **not yet being defined**.

**Common beginner PvE opponent:** **Barnaby Rusk, a fellow salvage breaker**, not Ignatius Smog, not a city authority. An individual used to ironwork and physical intimidation, equipped with a modest improvised hand implement; exact weapon, AI, enemy stats, damage and costs **TBD**. The clash should be moderately challenging but survivable for a player starting with Basic Clothes, Crude Small Bag and no free weapon. No forced fatality: driving him off is enough. Losing should not permanently strand the tutorial or kill trapped NPCs as a tutorial softlock.

**Local closure:** Barnaby retreats / is forced away, and the pump is not cut *during this episode*. The player's second-job choice changes what is temporarily secured: shoring, exit route, or replacement drainage. The displaced residents and the city's neglect remain a grim practical dilemma, but **this is a complete local E2E episode, not chapter one of the main campaign**. Do not promise that every trapped household is housed or that a permanent new public works system has been built.

### Treatment, home and rent (structurally locked, specifics proposed)

The brawl leaves the Scrapper with a credible minor injury—battered ribs, split knuckles or a forearm abrasion are possible flavors; exact conditions and Health effects TBD. The player pays an affordable working-class city clinician to patch them up, learns the reusable healing interface, and goes home with little money left. The **rent-due notice appears at home, after care**. This completes Scrapper onboarding.

**Pacing and parity:** all three second jobs must be within a comparable beginner time/pay envelope. Encounter remains a single grounded short turn-based PvE conflict, not a machine boss or a second forced fight. No early Pall-zone expedition, long rescue quest, specialized parts gate or hidden fraud/crime/reputation flag.

## What is locked versus awaiting approval

**LOCKED:** Rust Yard permanent Mechanics hub; Ignatius Smog as named recurring Yard Foreman and his cough / exact quote; **Strip a Condemned Pump** as the regular first Mechanics job; Mechanics +3; the global common starter kit; shared two paid jobs → two interactions → turn-based combat → paid healing → home rent reveal structure.

**PROPOSED, pending user approval:** **The Last Dry Floor** as unique industrial twist; three player choices and paid jobs (**Industry / Construction**, **Fieldcraft / Navigation**, **Commerce / Logistics**); **The Copper Claim**, **The Red Lever**, **Barnaby Rusk** as the common antagonist; local rescue/temporary reprieve and aftercare narrative. Barnaby's proposed personal name follows the rule that all NPCs eventually have a name but is **not canon until approved**. Other second-job NPC names remain TBD, to be defined with the user.

**TBD even after story approval:** exact locations, costs, wage/XP values, parts and salvage yields, medical outcomes, NPC character sheets, dialogue, time targets, and all turn-based combat mechanics/balancing.

## NPC naming rule (LOCKED for all six origins)

Every NPC must ultimately have a **personal in-world name**, not merely an occupational label such as Yard Foreman, Matron or Herb Dealer. Roles/titles remain useful UI descriptors, but canonical personal names are approved separately. Do **not** automatically invent canon names for other NPCs while authoring Scrapper.

## Open design steps

1. Review **The Last Dry Floor**, its three proposed second-skill jobs and whether the old drainage pump/occupied cellars feel like the right kind of Scrapper horror.
2. Confirm or alter **Barnaby Rusk** as the personal name/role of the shared beginner opponent and the two pre-combat interactions.
3. Name the drain gang lead, canal surveyor and dispatch clerk **with the user** as their jobs are finalized; Ignatius Smog is already locked.
4. Define numerical rewards, item props, care costs and durations later; the global **turn-based combat system remains deferred**.
