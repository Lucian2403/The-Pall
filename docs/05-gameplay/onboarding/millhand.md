# Millhand — Starting Location and Opening Tutorial

**Status: Partially locked (2026-10-13).** Only Millhand has been specified in this detail. Other backgrounds will be addressed individually, not assumed from these choices.

## Locked setup

- **Background:** Millhand, associated Major Skill **Craftsmanship +3 levels** at creation. All four attributes STR / DEX / INT / RES start at 5, Health maximum starts at 50.
- **Portrait:** one of the two hardcoded **Millhand Male / Millhand Female** portraits, as chosen in character creation. Equipment overlays may change what appears.
- **Starting location:** a **noisy Smithing workshop in Grand Cylinder City**. This same workshop is the **generic hub for all Smithing jobs**, not a one-use tutorial backdrop. Its exact in-world name, layout and neighborhood are TBD.
- **First interaction:** **talk to the recurring Smithing job NPC** at the workshop. This NPC is the regular Smithing-work giver and pays coins and relevant job XP when the job is completed, including tutorial work. NPC name, appearance, pay formula and precise XP figures are TBD.
- **Starting inventory:** **Worker Clothes**, **the cheapest available Bag**, **20 coins**. These item labels are role descriptions only until the equipment/items sheet defines exact item IDs, quality, weights, capacity, protections and durability. No extra unique origin loot is required.
- **Introductory tutorial:** one **self-contained end-to-end (E2E) Millhand quest containing two jobs**: (1) shared generic Smithing work with a scripted discovery; (2) a **choice-dependent follow-on job in a different Major Skill**. The quest **does not complete when the first Smithing job ends**. After the second job, reveal rent due as ordinary economic pressure, **not the beginning of the overarching main storyline**. The character already knows their circumstances; the player learns the lore through events.
- **LOCKED tutorial interaction order:** perform **normal reusable Smithing interactions first**, trigger **The Missing Stamp** tutorial-only event next, choose one of three answers, complete the first paid job, then continue to **one of three different, narrative-driven paid jobs using a different Major Skill**. After the follow-on job resolves, finish the tutorial quest and reveal the rent notice. Second jobs also use reusable interaction templates. **Pacing target under review** (roughly 6–9 minutes total after creation is a proposal); no passive waiting or timer-freeze exception.

## The Missing Stamp — first job and three proposed second-job branches

The Smithing foreman gives the player ordinary piecework on identification plates for a municipal labour contract. During normal workshop work, the player inspects a plate, chooses a reasonable technique/tool, and resolves a normal Smithing complication. These should be **reusable interaction templates** also available in regular Smithing jobs, not bespoke tutorial-only minigames.

**After** the generic interaction sequence resolves, the tutorial-only event fires: the plate's identifying mark belongs to a worker officially recorded as deceased in a locked-door workshop fire, but the inspection mark is fresh. The contradiction introduces a second job **within the same introductory quest**, whose task and skill depend on the first choice. The small local episode must resolve after that second job; it is not chapter one of the main campaign. The deeper explanation of the discrepancy is not yet canon.

### Locked quest architecture, proposed scene specifics

1. **First job: Smithing / Craftsmanship.** Talk to the regular workshop foreman, accept visible pay and time, complete ordinary reusable inspection / preparation / smithing interactions.
2. **Tutorial-only event (guaranteed once).** After ordinary Smithing interactions, notice that an identification plate carries the number of a worker officially killed in a workshop fire, yet its inspection stamp is fresh.
3. **First choice (locked set):** **Restamp it**, **Question the foreman**, or **Record the number**.
4. **First-job closure:** Resolve the Smithing wage and XP through the normal job system. **Do not end the Millhand tutorial quest and do not reveal rent yet.**
5. **Second job (choice-dependent):** Each response logically sends the character to **one normal, playable job belonging to a different Major Skill**; generic work interactions first, any route-specific discovery/conversation afterwards. Each second job grants its normal coins and applicable Major Skill XP.
6. **Quest completion:** A locally satisfying conclusion for the chosen route; **then and only then** the shared rent-due notice arrives. It starts a practical money concern, **not the main storyline**.

Job timers continue during interactions under the general [Jobs and Time](../jobs/jobs-and-time.md) rules. Both job segments use reusable mechanics that also work outside onboarding.

### Branch A — Restamp it → Industry / Hauling (PROPOSED)

**Foreman's response:** "You put your mark on the lot. Best see it delivered."

- **Next job: Depot Intake Run.** Carry the stamped lot to the municipal depot as ordinary paid **Industry → Hauling** work. Route/load choice, checking manifest against delivery and resolving a loading discrepancy use general Hauling templates.
- **Local sting:** The delivery manifest classifies the shipment as a transfer of *workers*, but the only cargo contains numbered identification plates. The depot clerk accepts the docket without surprise and demands a delivery signature.
- **Immediate consequence:** The player helped the paperwork move and signs off on what was actually delivered. They may feel complicit, but **no permanent fraud-liability flag is agreed**. The local shipment is complete; the player is paid for hauling.
- **Possible deeper reading, not locked:** ghost wages / phantom workforce accounting. Do not establish these as canon without the complete quest script.

### Branch B — Question the foreman → Commerce / Contracts (PROPOSED)

**Foreman's response:** "You want to argue with a council seal? Take the docket to Contracts. Bring back a clearance."

- **Next job: Disputed Docket.** At a municipal contracts counter, take a short paid **Commerce → Contracts** task, reviewing mismatched figures and handling a clerk's demand for a clean certificate. Use routine verification/terms/dialogue work templates.
- **Local sting:** The clerk offers two categories for this person: *deceased for compensation* and *active for contractual billing*. Both entries carry apparently valid seals. A frightened copyist says nothing.
- **Immediate consequence:** The player gains an explanation of how bureaucracy permits the contradiction but cannot overturn the city office in one morning. The docket is administratively processed and the paid task ends. Ordinary Smithing remains available.
- **Scope:** This is a tense contracts interaction, not an automatic investigation quest, new faction system, or part of the campaign.

### Branch C — Record the number → Scholarship / Investigation (PROPOSED)

**Player reasoning:** Keep quiet at the forge; learn what the digits actually refer to.

- **Next job: Ledger Reconciliation.** Visit the municipal records room and earn ordinary piecework pay under **Scholarship → Investigation** by comparing damaged shift books, tally sheets and registry entries. Use generic cross-reference/inspection/reasoning templates.
- **Local sting:** A death register and a later wage tally both list the identical identification number. An inked correction has been neatly scraped away. The archive assistant says, "Those corrections are already counted."
- **Immediate consequence:** The number is saved as a completed-quest journal entry, **not an inventory item or promise of a future investigation**. The discrepancy is established, paid records work finishes, and the character leaves with unsettling knowledge.
- **Scope:** No further archive quest is required for the tutorial to feel finished.

### Fairness and implementation guardrails

- **Three different second-job Major Skills:** Restamp → **Industry** (Hauling), Question → **Commerce** (Contracts), Record → **Scholarship** (Investigation). These match the currently agreed skill tree.
- **Normal job economics:** Every route pays standard Smithing coins / XP for the first job and normal appropriate coins / XP for the second job. Currency, timing and experience should be balanced for comparable onboarding value; XP legitimately accrues to different Major Skills. Exact numbers TBD.
- **Self-contained local outcome:** These routes differ in what the player **did**, **learned**, and **helped authorize**. Do not fake an indefinite conspiracy arc or attach unimplemented long-term consequences. The municipal mystery is background world texture unless later separately developed.
- **Avoid forced consumable creation:** Shipment, forms and identification tags may be represented as quest-owned work objects, not freely tradeable player inventory items. No extra starting item required.
- **Data-driven:** Set the response choice as the second-job route selection. Each second job must have generic job interactions before its distinctive conclusion. Persist completion / choice sufficient to prevent repeat tutorial and show quest recap; no permanent complicity system is agreed.
- **Not a tutorial-only minigame:** Smithing, Hauling, Contracts and Investigation interaction templates are reusable for normal jobs; their scripted lore beats are quest-specific.

### Approval status

**LOCKED by user:** the first Smithing job must play its normal interactions before the special discovery; the tutorial **continues after** the choice into **three possible different jobs in different Major Skills**; tutorial is an E2E episode separate from the main storyline; rent arrives when the tutorial finishes.

**STILL PROPOSED:** choosing Industry/Commerce/Scholarship as the three skills, location/NPC details, dialogue, manifest and ledger revelations, exact in-world resolution, timings and rewards.

## Implementation boundaries / remaining work

1. Review the three proposed second jobs, verify their narrative logic and approve the specific local endings. Any longer-lived fraud/complicity consequence requires a separate design decision.
2. Define the generic Smithing workshop, recurring NPC and repeatable low-tier Smithing jobs, including which normal interaction templates are used in this opening.
3. Define exact Worker Clothes and cheapest Bag item records and their equipped/inventory presentation; **20 coins** is the only exact starter-currency figure confirmed so far, for Millhand.
4. Specify both jobs' paid rewards, XP and timing, the new Hauling / Contracts / Investigation NPCs and reusable job templates, and the common **after-second-job** rent notice without unapproved fines or offline deadlines.

