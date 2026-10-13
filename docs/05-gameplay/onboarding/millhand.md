# Millhand — Starting Location and Opening Tutorial

**Status: Partially locked (2026-10-13).** Only Millhand has been specified in this detail. Other backgrounds will be addressed individually, not assumed from these choices.

## Locked setup

- **Background:** Millhand, associated Major Skill **Craftsmanship +3 levels** at creation. All four attributes STR / DEX / INT / RES start at 5, Health maximum starts at 50.
- **Portrait:** one of the two hardcoded **Millhand Male / Millhand Female** portraits, as chosen in character creation. Equipment overlays may change what appears.
- **Starting location:** a **noisy Smithing workshop in Grand Cylinder City**. This same workshop is the **generic hub for all Smithing jobs**, not a one-use tutorial backdrop. Its exact in-world name, layout and neighborhood are TBD.
- **First interaction:** **talk to the recurring Smithing job NPC** at the workshop. This NPC is the regular Smithing-work giver and pays coins and relevant job XP when the job is completed, including tutorial work. NPC name, appearance, pay formula and precise XP figures are TBD.
- **Starting inventory (LOCKED universally):** **Basic Clothes**, **one Crude Small Bag**, **20 coins**. These replace earlier Millhand-specific working labels *Worker Clothes* and *cheapest Bag*. Every background begins with exactly this same kit. The clothing and bag still need exact item IDs, equip slots, weights, capacity, protection and condition data; no unique origin loot is included.
- **Introductory tutorial:** one **self-contained end-to-end (E2E) Millhand episode**: a generic Smithing job with a special discovery; a choice-dependent second job in a different Major Skill; **two further story interactions**; a compulsory, manageable **PvE street fight**; **healing/patching at a city care provider**; **return home with little money**, where the character sees **rent due**. Only then does the Millhand tutorial end. This is **not** the start of the overarching main story.
- **LOCKED tutorial interaction order:** perform reusable Smithing interactions → Missing Stamp decision → first job's normal payment/XP → one of three **different-Major-Skill** second jobs with its normal interactions and payment/XP → **two additional interactive beats** → **mandatory introductory PvE fight** → **medical treatment/patching** → **return home** → **rent due / tutorial complete**. Earlier 2–5 and 6–9 minute targets are superseded: timing must be re-estimated once combat, care and travel are specified. Standard job/travel timers apply; avoid passive waiting.

## The Missing Stamp — opening job and agreed second-job branches

The Smithing foreman gives the player ordinary piecework on identification plates for a municipal labour contract. During normal workshop work, the player inspects a plate, chooses a reasonable technique/tool, and resolves a normal Smithing complication. These should be **reusable interaction templates** also available in regular Smithing jobs, not bespoke tutorial-only minigames.

**After** the generic interaction sequence resolves, the tutorial-only event fires: the plate's identifying mark belongs to a worker officially recorded as deceased in a locked-door workshop fire, but the inspection mark is fresh. The contradiction introduces a second job **within the same introductory quest**, whose task and skill depend on the first choice. The second job settles its own contract, but the tutorial episode continues through the two encounters, street fight, medical care and rent notice at home; it is not chapter one of the main campaign. The deeper explanation of the discrepancy is not yet canon.

### Locked quest architecture, proposed scene specifics

1. **First job: Smithing / Craftsmanship.** Talk to the regular workshop foreman, accept visible pay and time, complete ordinary reusable inspection / preparation / smithing interactions.
2. **Tutorial-only event (guaranteed once).** After ordinary Smithing interactions, notice that an identification plate carries the number of a worker officially killed in a workshop fire, yet its inspection stamp is fresh.
3. **First choice (locked set):** **Restamp it**, **Question the foreman**, or **Record the number**.
4. **First-job closure:** Resolve the Smithing wage and XP through the normal job system. **Do not end the Millhand tutorial quest and do not reveal rent yet.**
5. **Second job (choice-dependent):** Each response logically sends the character to **one normal, playable job belonging to a different Major Skill**; generic work interactions first, any route-specific discovery/conversation afterwards. Each second job grants its normal coins and applicable Major Skill XP.
6. **After the second job, tutorial continues:** two additional player interactions lead to a short PvE fight with an in-world credible opponent. Afterwards, the injured character must access a city treatment or patching interaction, return home with limited coins, and **only then** encounter the rent-due notice. This ends the tutorial; it is **not** the main storyline.

Job timers continue during interactions under the general [Jobs and Time](../jobs/jobs-and-time.md) rules. Both job segments use reusable mechanics that also work outside onboarding.

### Branch A — Restamp it → Industry / Hauling (AGREED DIRECTION)

**Foreman's response:** "You put your mark on the lot. Best see it delivered."

- **Next job: Depot Intake Run.** Carry the stamped lot to the municipal depot as ordinary paid **Industry → Hauling** work. Route/load choice, checking manifest against delivery and resolving a loading discrepancy use general Hauling templates.
- **Local sting:** The delivery manifest classifies the shipment as a transfer of *workers*, but the only cargo contains numbered identification plates. The depot clerk accepts the docket without surprise and demands a delivery signature.
- **Immediate consequence:** The player helped the paperwork move and signs off on what was actually delivered. They may feel complicit, but **no permanent fraud-liability flag is agreed**. The local shipment is complete; the player is paid for hauling.
- **Possible deeper reading, not locked:** ghost wages / phantom workforce accounting. Do not establish these as canon without the complete quest script.

### Branch B — Question the foreman → Commerce / Contracts (AGREED DIRECTION)

**Foreman's response:** "You want to argue with a council seal? Take the docket to Contracts. Bring back a clearance."

- **Next job: Disputed Docket.** At a municipal contracts counter, take a short paid **Commerce → Contracts** task, reviewing mismatched figures and handling a clerk's demand for a clean certificate. Use routine verification/terms/dialogue work templates.
- **Local sting:** The clerk offers two categories for this person: *deceased for compensation* and *active for contractual billing*. Both entries carry apparently valid seals. A frightened copyist says nothing.
- **Immediate consequence:** The player gains an explanation of how bureaucracy permits the contradiction but cannot overturn the city office in one morning. The docket is administratively processed and the paid task ends. Ordinary Smithing remains available.
- **Scope:** This is a tense contracts interaction, not an automatic investigation quest, new faction system, or part of the campaign.

### Branch C — Record the number → Scholarship / Investigation (AGREED DIRECTION)

**Player reasoning:** Keep quiet at the forge; learn what the digits actually refer to.

- **Next job: Ledger Reconciliation.** Visit the municipal records room and earn ordinary piecework pay under **Scholarship → Investigation** by comparing damaged shift books, tally sheets and registry entries. Use generic cross-reference/inspection/reasoning templates.
- **Local sting:** A death register and a later wage tally both list the identical identification number. An inked correction has been neatly scraped away. The archive assistant says, "Those corrections are already counted."
- **Immediate consequence:** The number is saved as a completed-quest journal entry, **not an inventory item or promise of a future investigation**. The discrepancy is established, paid records work finishes, and the character leaves with unsettling knowledge.
- **Scope:** No further archive quest is required for the tutorial to feel finished.

## Shared climax after the second job — opponent LOCKED, encounter specifics under design

All three second-job routes return toward the same residential workshop district, with their regular wages already received. The brief encounter ties together the episode: a subcontractor who handles municipal labour papers also uses private muscle to collect unofficial "processing charges" from workers. A lone **contractor's wage enforcer / collector** intercepts the player. **The same wage enforcer as the opponent across all three routes is LOCKED (approved 2026-10-13)**; his exact methods and dialogue still require design. This is an ordinary, local shakedown, not the start of a sprawling investigation or main plot.

**Why the collector singles out each branch:**
- **Restamp:** The player stamped and signed for the numbered lot; the collector recognizes the worker's mark and demands a supposed release fee.
- **Question:** The player disputed the docket at Contracts; the collector heard about the complaint and arrives to shut it down, demanding a collection fee.
- **Record:** Someone noticed the player's interest in a payroll number; the collector wants the number/note, then demands cash. No physical quest item is needed.

### Two new interactions (both playable, before combat)

**Interaction 1 — The Wage Claim:** The collector presents a contractor-issued demand for a portion of wages, hinting that the city quietly permits the charges. The player can **inspect the demand or challenge its authority**, revealing a branch-specific inconsistency. This teaches reading a hostile NPC's intent and using a noncombat interactive choice, not yet another Smithing minigame.

**Interaction 2 — Cornered:** The collector blocks the way home, grips a short club and makes clear he is not allowing the player past. The player chooses a **tactical stance**—brace and defend, keep moving and exploit an opening, or take an improvised nearby obstacle as cover. These are genuine combat setup differences (defence, initiative or environment), not fake peaceful exits: **all three lead into a fight**, as required by the tutorial. Exact combat rules and outcomes still TBD.

### Mandatory fight — contractor's wage enforcer (opponent LOCKED; mechanics PROPOSED)

- **Enemy:** one human **contractor's wage enforcer** with a short club; ordinary street thug, not a monster, supernatural foe or major villain.
- **Where:** a service passage on the route back through Grand Cylinder City, without implying PvP rules have changed. A scripted **PvE** incident inside the industrial city is distinct from voluntary player-vs-player combat.
- **Player:** starts without a purchased weapon or firearm (the universal kit is Basic Clothes, Crude Small Bag and 20 coins). The encounter should support **unarmed defence and/or using a nearby worksite object as a temporary environmental advantage**; no free permanent weapon or new inventory item is presumed.
- **Difficulty:** novice wins through understandable attack/guard/read-the-opponent choices; **easy but not trivial**, with visible cost in Health and/or a minor wound. Do not assume starting Arms level above the common baseline. Include sensible fail-safe for defeat (e.g. knocked down and helped to care rather than dead/locked out); precise system design and damage bands TBD.
- **Rewards:** if fighting grants Arms experience, it uses ordinary combat XP rules (not an extra automatic +3 starting level). Do not promise confiscated thug coins or powerful dropped loot.

### First combat interaction draft — PROPOSED

**LOCKED combat format (2026-10-13):** **turn-based**. The actual combat system, turns, attack/defence rules, resources, enemy AI and damage balance will be designed separately later. This section is an illustrative encounter, **not** a combat system specification. The first two story interactions already set up the confrontation: **Wage Claim**, then **Cornered**. After the player picks a stance/position, the same combat rules used outside tutorials take over.

- **Start:** the enforcer raises a short club and crowds the player in a passage. The character has no permanent weapon from creation. They can defend unarmed; an environmental option such as backing around a cart should act as positioning, not as a free loot item. Don't secretly hand out a firearm.
- **Enemy intent preview:** show an intelligible tell such as **"preparing a heavy swing"** or **"recovering from a missed strike"** before the player's choice. Teach recognition of attack patterns without a long text tutorial.
- **Player actions (illustrative categories):** **Strike** (deal damage when there is an opening); **Guard** (reduce incoming damage / endure the swing); **Reposition** (trade immediate offence for an opening or safer next exchange). Exact Stamina costs, hit probabilities and numbers depend on the general combat design.
- **Suggested sequence:** defend or reposition against an obvious swing; exploit a short recovery window; finish the staggered enforcer with a couple of sensible exchanges. Wrong decisions cause noticeable extra harm, not an automatic defeat. **Avoid a fixed "press three buttons to win" script**; enemy choices, guard and position should matter.
- **Outcome:** the enforcer backs away, drops the demand or is subdued. The character remains alive but has a **visible minor injury or Health deficit** needing patching. The antagonist's retreat should resolve the street conflict locally—no forced killing, execution animation or crime/reputation system. Award ordinary Arms practice/XP if the chosen combat rules reward it.
- **Defeat safety:** if the player loses, the encounter still advances to the medical scene via an appropriate narrative rescue or aid, with a worse injury and possibly a larger treatment expense. Do not make the opening loop unwinnable, force a character reset, or confiscate indispensable starting items.

**Difficulty target:** an attentive new player should win and need care; reckless attacks should leave the player substantially worse off. The exact injury bands, Health values and enemy tuning remain **unapproved** and must be tested using starting 50 maximum Health and baseline Arms skill.

### First healing interaction draft — PROPOSED

- Following victory or defeat, the player is directed toward a **small, working-class city infirmary** (name/NPC TBD); it is an ordinary future Medicine/Trauma or NPC treatment service, not a one-time story-only healing button.
- **Inspect condition** to see remaining Health, injured area and the price of treatment. Then choose/confirm a **basic patch-up** from the clinician. Use the normal NPC treatment/service flow; avoid requiring the untrained player to have crafting recipes or a special healing item.
- Healing restores enough Health and addresses the minor wound to let the player walk home and continue ordinary play. No permanent disability, lengthy recovery timer or debut medical bill that can bankrupt the new character.
- **Economic rhythm:** the two standard jobs pay coins, and the clinic costs a noticeable part of those earnings; the character returns home with **little available money**, just as rent is revealed. Exact wage, initial 20-coin reserve, clinic fee and rent need balancing *together* rather than inventing independent prices.
- If the character lost the fight, care remains accessible. Avoid a punitive medical fee that blocks the tutorial or strands an incapacitated player.

### Design choices not locked here

- **Turn-based combat is locked.** Exact turn sequencing, action choices and mechanics remain undefined and are not locked by this onboarding design.
- Exact mechanics of **Strike / Guard / Reposition**, NPC AI, how positioning changes outcomes, enemy HP, combat damage, death/defeat handling and total encounter length.
- Injury severity and costs, whether basic patch-up can be done personally or only through an NPC, and whether a guaranteed wound is appropriate without making damage feel arbitrary.

### Healing / first medical interaction (PROPOSAL)

- After the fight, the player is **hurt enough to need a patch-up**, even though the encounter is survivable; introduce Health, a minor treatable injury, and the city healing service. This must teach a reusable **Medicine / Trauma or NPC care** pathway, not a tutorial-exclusive miracle.
- A cheap **city infirmary, surgeon or clinic attendant** treats the character for a **small but meaningful fee** so the earned wages are partly consumed. The exact clinician, injury type, cost, heal amount and how a defeated player reaches treatment are TBD.
- Avoid permanent loss, long convalescence or a service price that makes onboarding impossible. A self-patch alternative is not required unless explicitly approved.

### Home and rent reveal (LOCKED SEQUENCE; CONTENT TBD)

- The character **returns home after getting patched up**, carrying **little money** relative to coming expenses. This is the first tutorial's natural final location and the point at which the player learns about rent due.
- The rent notice must appear **at home, after treatment**, not at the foreman's workplace or immediately after the second job. Exact rented accommodation, amount, deadline, rental authority and any penalties remain to be designed.
- The episode ends here. It does **not** initiate the whole game's overarching story. The city's indifference and cost of basic survival are established through work, violence, health expense and rent.

### Story and fairness checks

- Ensure every branch's collector motive is grounded, so the common climax does not feel randomly pasted in.
- Both jobs are completed and paid normally. The fight/clinic create a small economic sink without wiping out the new player's only coins.
- Every branch teaches **Craftsmanship + a second Major Skill + Arms/defence + medical recovery**. Exact XP and reward values TBD.
- A fight is required by this **tutorial episode**, not imposed on every routine Smithing job or every future city errand.
- No persistent fraud/complicity flag, hidden main-story faction commitment, lengthy follow-up quest or guaranteed weapon acquisition is implied.

### Fairness and implementation guardrails

- **Three different second-job Major Skills:** Restamp → **Industry** (Hauling), Question → **Commerce** (Contracts), Record → **Scholarship** (Investigation). These match the currently agreed skill tree.
- **Normal job economics:** Every route pays standard Smithing coins / XP for the first job and normal appropriate coins / XP for the second job. Currency, timing and experience should be balanced for comparable onboarding value; XP legitimately accrues to different Major Skills. Exact numbers TBD.
- **Self-contained local outcome:** These routes differ in what the player **did**, **learned**, and **helped authorize**. Do not fake an indefinite conspiracy arc or attach unimplemented long-term consequences. The municipal mystery is background world texture unless later separately developed.
- **Avoid forced consumable creation:** Shipment, forms and identification tags may be represented as quest-owned work objects, not freely tradeable player inventory items. No extra starting item required.
- **Data-driven:** Set the response choice as the second-job route selection. Each second job must have generic job interactions before its distinctive conclusion. Persist completion / choice sufficient to prevent repeat tutorial and show quest recap; no permanent complicity system is agreed.
- **Not a tutorial-only minigame:** Smithing, Hauling, Contracts and Investigation interaction templates are reusable for normal jobs; their scripted lore beats are quest-specific.

### Approval status

**LOCKED by user:** generic Smithing interactions before the unique stamp scene; three approved second-job paths using **Industry, Commerce and Scholarship**; **two additional interactions after the second job; short mandatory, moderately challenging PvE fight; medical treatment; return home with little money; only then reveal rent due and end the Millhand E2E tutorial**. Not the main story.

**STILL PROPOSED / TBD:** two pre-fight interactions' precise options, **all combat mechanics and balancing (to be designed separately)**, medical service and fees, rented home details, durations, dialogue and all job reward values. **Turn-based format and wage enforcer identity are locked**.

## Implementation boundaries / remaining work

1. Confirm how the **locked wage enforcer** is introduced by the two proposed pre-combat interactions; tune how each approved second job feeds naturally into the confrontation. No longer-lived fraud/complicity system without separate approval.
2. Define the generic Smithing workshop, recurring NPC and repeatable low-tier Smithing jobs, including which normal interaction templates are used in this opening.
3. Define the **global** Basic Clothes and Crude Small Bag records, equipment slots and inventory presentation; **20 coins for every background** is already locked.
4. Specify both jobs' pay, XP and duration, Hauling / Contracts / Investigation job NPCs, basic combat mechanics, medical provider and expense, the return-home location, and **after-healing-at-home** rent notice. Do not invent unattended payment penalties or offline rent deadlines.

