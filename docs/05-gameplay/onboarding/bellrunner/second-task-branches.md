# Bellrunner — Stage 4: Three Second-Major-Skill Tasks (APPROVED)

**Status: APPROVED AND LOCKED (2026-10-15).** User approved the revised, natural spoken dialogue in all three branches, including supporting exchanges, plus the proposed gameplay sequences and their already agreed route revelations. Preserve approved player/NPC wording unless further changes are specifically agreed. Numerical implementation details remain TBD.

## Common Stage 4 contract

**Stage 3 is the branch-commit point.** The first-round payment dispute was resolved there. Stage 4 presents one follow-up work session according to the selected route; no new paid commission is created.

| Stage 3 action | Stage 4 job | Different Major Skill | Distinct working activity | Locked local discovery |
| --- | --- | --- | --- | --- |
| Deliver notice as ordered | **Attendance Certificate** | **Commerce → Contracts** | Reconcile a night-shift list, check an acknowledgment and register an objection | Workers refusing the condemned site are listed **voluntarily absent** and lose wages |
| Warn the crew | **First Aid Line** | **Medicine → Trauma** | Sort coughing workers by urgency, assist the attendant, record observations | Exposure-related complaints are registered as **non-work illness**, so workers pay |
| Investigate the bell | **The Bell Linkage** | **Mechanics → Industrial Machinery** | Inspect the accessible external linkage, compare safety stop against the bell drive, document interference | The shift bell was deliberately kept operational after the safety shutoff |

**Scope rules:**
- Workplace documents, supplies and machinery remain with the relevant institution. No new collectible components, skill gates, recipes, consumables or personal NPC names.
- Reuse established generic modules: document/category comparison and dispute record (Contracts); patient-priority sorting and observation recording (Trauma); mechanism inspection and discrepancy recording (Industrial Machinery). Normal paying jobs later use the same modules with usual economy and XP. These are not three skins for a dialogue minigame.
- Practical errors cost extra time or require correction; no quality choice conceals the locked discovery, punishes the worker with a bill, or blocks the story. All mandatory input appears early under the existing first-two-minute rule, with world time continuing during interaction.
- The watchman only holds the sealed packet; he cannot grant the closed worksite's final authorized receiving mark. The **separate shift-office records counter** in the Contracts route cannot retroactively validate the courier's first job. No route can make that original round payable.
- Each route yields a narrow **local fact**, not a named mastermind or the explanation of every other branch. The Shift Marshal remains off-screen. The later **Dogman** encounter begins only after the chosen work session is complete.
- The player stays outside the condemned interior. No unprotected fume exposure, unsupervised dangerous machinery operation or medical treatment requiring expertise is mandatory. Ordinary workplace staff retain responsibility for their own professional procedures.

## Route A — Attendance Certificate (Commerce → Contracts)

**Entry:** The courier handed the sealed night-shift order to the site watchman and now follows up at the still-functioning **shift-office records counter**. It maintains shift lists, but is **not** the shuttered workplace receiving office that refused to mark the original delivery.

**Goal:** reconcile the site notice with the attendance sheet and record the truth of the delivery and the crew's refusal, rather than pretending an authorized worksite mark was obtained.

### A01 — Inspect the office's shift book

**[Compare the notice and attendance sheet]** brings up an ordinary shift roster (worker entries, scheduled shift, attendance category) and the notice's dispatch details. The entries show the closed site's night shift. The player can identify the same work block without finding a concealed mark or guessing at missing data.

**Short exchange (APPROVED):**

*The Shift-Office Clerk takes the dispatch slip but leaves the sealed-site receiving space blank.*

**CLERK:** “Where's the mark from the receiving office?”

**PLAYER:** “The office was locked up. The watchman took the letter.”

**CLERK:** “Then I can't say the works received it.”

**PLAYER:** “So what do I put on the form? I didn't just throw it in the street.”

**CLERK:** “Write down what happened. I'll record that much.”

The clerk can acknowledge **presentation of the contested papers at this counter**; this does not amount to a site receipt or clear the courier's wages.

### A02 — Process one disputed attendance entry

The sheet lists a worker who will not enter the fume-closed block. The standard category shown beside the worker is **“Absent by choice”** (illustrative UI translation; formal register language TBD); the wage column shows a **forfeit / not payable** consequence. The player sees this in the register itself; the clerk does not have to deliver a monologue on workers' rights.

**[Examine the attendance category]** opens its source clause/annotation: a refusal to enter is treated as voluntary absence **even though a separate closure notice exists**. This is the route's locked revelation.

### A03 — Make an honest entry: choose an ordinary Contracts method

| Player action | What it does | Trade-off |
| --- | --- | --- |
| **[Request the basis for the absence entry]** | Clerk identifies the applicable printed attendance category. Player notes that the closure order conflicts with treating refusal as voluntary. | More checking time; a clearer record of the stated basis, but **no automatic change to wage status** |
| **[Enter a written objection]** | Submit a short disagreement citing the closure notice and the entry. The clerk acknowledges receipt of the objection at this counter. | More direct challenge; the worker's wage entry remains unchanged until someone with authority reviews it |

Both are normal **Commerce / Contracts** verification and dispute methods, not forgeries. Both allow an accurate disputed certificate. Neither forces the player to endorse an unsafe shift or falsify attendance to continue.

**Revelation exchange, after inspecting the category (APPROVED):**

**PLAYER:** “But he was there. I saw him waiting by the gate. Why have you marked him absent?”

**CLERK:** “He didn't go inside when the bell rang.”

**PLAYER:** “The place is shut. There's a notice on the gate telling people not to go in.”

**CLERK:** “I can note that. I can't change how he's marked.”

This is one understated refusal to own the rule. The clerk is not revealed as the author of the policy or as a conscious villain.

### A04 — Submit the Attendance Certificate

**[Submit the disputed certificate]** records that the shift notice was presented, the site receiving mark was unavailable and the workers' attendance entry was challenged or its basis recorded. **The certificate is marked disputed, not cleared.** The **attendance consequence remains** the local sting, not a universal ruling. No wages are cleared by this certificate.

**End-state:** a quest-journal note of the attendance category and forfeited wages, the selected ordinary Contracts method, and the unresolved worksite closure. Future Dogman may object to the courier having questioned or carried this paperwork, but Stage 4 does not script his lines.

**Job context:** The clerk can log a disputed attendance entry, but cannot authorize the closed site's receiving mark.

## Route B — First Aid Line (Medicine → Trauma)

**Owner revision — 12 November 2026.** The conversations and player
choices below replace the earlier short opening, worker cards and
documentary register prompts. They are authoritative for the currently
requested First Aid Line sequence. The rest of this route remains open
for a subsequent owner dialogue review.

**Setting:** a staffed first-aid point using the existing clinic art.
The player is an unqualified helper. A trained attendant, not the player,
handles the medical assessment. No diagnosis, drug, treatment
procedure, new item, timer or death is invented. The worker's charge is
still disputed without being reversed.

### B01 — Two workers, one attendant

Show the scene in short saved narrative beats, not as one large parchment
block or a pair of abstract patient status cards:

*Two workers have been brought to the first-aid point.*

*One is coughing badly, but he's on his feet, telling the attendant what
happened at the factory. The other is leaning against the wall. He tries
to speak, manages a few words, then stops to catch his breath.*

**ATTENDANT:** “Give me a hand here. I've got two men waiting, and I can
only see one at a time. Bring me the one who needs me first.”

Under this final line, without another interim screen, the player gets
two actions:

1. **Help the man struggling to breathe.**
2. **Help the man who's still walking and talking.**

**If the player helps the man struggling to breathe:**

**YOU:** “This one's having trouble getting a word out.”

**ATTENDANT:** “I can see that. Don't force it. Bring him here.”

*You help the worker over to the attendant.*

**If the player helps the man who can still walk:**

**ATTENDANT:** “No, leave him a moment. The other one's having trouble
breathing. Help me get him over here first.”

*You turn to the other worker and help him over to the attendant.*

Both responses have their own short Continue beats and converge on the
same safe staff-led first-aid scene. A wrong first choice causes no
invented medical injury or penalty.

### B02 — Helping the Attendant

Show the subtitle **First Aid Line — Helping the Attendant**.

*The attendant takes the man struggling to breathe over to a treatment
bench. The other worker waits nearby, still coughing.*

**ATTENDANT:** “I've got him now. There's still that other fellow waiting,
and I've got my hands full.”

**YOU:** “What can I do?”

**ATTENDANT:** “I need to know where he was working and what's happened
to him. Or you can bring him over when I'm ready. Either way, don't leave
him standing there all day.”

Under the last Attendant line, offer:

1. **Ask the worker what happened and write it down.**
2. **Help the next worker over to the attendant.**

Both keep medical responsibility with the attendant and lead to the
same documented register discovery. The first choice produces the
owner-authored notes narration below. The second begins with a short
contextual variation about helping the worker over; it must not falsely
say the player wrote down testimony.

### B03 — The Medical Register

Show the subtitle **First Aid Line — The Medical Register**.

After choosing to write observations:

*You finish writing down what the workers told you. Both had been
waiting outside the closed factory. The attendant takes your notes
and enters the details in the medical register.*

**ATTENDANT:** “Right. That's enough for now. I'll take it from here.”

*As the attendant turns to the next patient, you look over the entry.*

*Under the illness category, someone has written **“Non-work illness.”**
The worksite and symptoms have been recorded correctly. But despite
the factory being closed for dangerous fumes, the illness is classified
as unrelated to work. The worker is listed as responsible for paying
the medical charges.*

**YOU:** “Hang on. You're charging them as if they got sick somewhere else?”

**Single player action:** **Ask the attendant why the illness is classified
as non-work-related.**

These paragraphs are separated into small Continue beats; the ill-health
category is a discovery made inside the scene, not a technical UI card.
The attendant neither diagnoses the cause nor changes the bill.

### B04 — The attendant's response and handover

*The worker on the treatment bench starts coughing again. The attendant
glances over at him, then turns back to you.*

**ATTENDANT:** “Look, I've written down where they came from and what's
wrong with them. But I can't say for certain what's made them sick. Not yet.”

**YOU:** “Then why the hell does it say ‘Non-work illness’?”

**ATTENDANT:** “That's how it's been entered.”

**YOU:** “The factory's shut because of the fumes! That man's barely
breathing, and now you're telling me he's got to pay for his own
treatment? Can't you change it?”

**ATTENDANT:** “No. I've put your observations down, but the charge
stays unless someone with the authority changes it.”

*The worker starts coughing harder. The attendant turns toward him.*

**ATTENDANT:** “Listen, I've got two sick men here. I need to see to them.
You've done what I asked.”

*She goes back to the treatment bench.*

The final narration beat carries the one action:

**Finish the handover.**

**Persistent outcome:** the worksite and observed symptoms are recorded;
the register retains the **Non-work illness** classification and the
treatment charge remains with the worker. There are no coins, loot,
new diagnoses, personal medical items or additional Major Skill levels.

**Implementation behavior:** the story beat index, patient priority,
chosen assistance method and register finding are server-persisted and
safe to reload. The shared local-only **Back to Stage 3** control remains
available throughout Stage 4, including these new dialogue steps.

## Route C — The Bell Linkage (Mechanics → Industrial Machinery)

**Entry:** After the player chose to investigate the bell, an unnamed **City-Works Mechanic** supervises a check from the **accessible service side** of the industrial block. The posted fume closure is still in force. No entering the contaminated interior, reopening the works or summoning an unapproved machine is required.

**Goal:** determine why the shift bell still responds after a safety shutoff, document the physical condition and leave the unsafe system alone pending authorized handling. The scene uses actual moving-part inspection, not another paperwork mismatch disguised as Mechanics.

### C01 — Check the safety condition

At the outside service panel, the **ventilation safety shutoff is set to the closed position**, while movement from the calling linkage is still visible during the bell's intermittent ringing. The player is shown the position of the fixed stop and the line leading toward the bell pull, as prepared by the mechanic.

**[Inspect shutoff and linkage]** presents the obvious comparison with no invented Mechanics skill gate: shutoff engaged / bell linkage still actuating.

**Proposed short exchange:**

*The City-Works Mechanic stops the courier's hand short of the moving linkage.*

**MECHANIC:** “Keep your hands back. See that little stop there?”

**PLAYER:** “Yes. It's already shut.”

**MECHANIC:** “Right. Now look at the rod leading up to the bell.”

The mechanic knows what part to inspect but has not yet explained the cause. The player is not told to work on a moving mechanism.

### C02 — A real inspection choice

The player chooses one of two standard Industrial Machinery checks. Both are **passive visual inspections of accessible, guarded components** while the trained mechanic oversees the panel.

| Player action | What it reveals | Work difference |
| --- | --- | --- |
| **[Trace the bell rod]** | Follow the motion back to a small **retaining pin holding a secondary link past the safety stop**. | Direct physical path, more inspection time |
| **[Compare the stop and its linkage marks]** | The stop itself sits in its proper shut position, but the bell connection is held clear of it by the same **repositioned retaining pin**. | Faster comparison using position marks, requiring more careful visual checking |

**The locked revelation is unequivocal:** the bell has been **deliberately left mechanically connected despite the safety shutoff**. A retaining pin cannot be found in its secured bypass position by an ordinary shift of the bell linkage alone. **Do not identify who moved it, invent a motive beyond the ability to summon workers, or reveal a citywide plan.** The exact dimensions, machine blueprint, energy source and hardware nomenclature are engineering implementation TBD; the movable stop/pin relationship is a proposed physical concept, not a new craftable item.

### C03 — Record the condition instead of repairing the condemned site

**[Show the mechanic the held-open link]** confirms the physical observation.

*The mechanic takes a closer look at the pin.*

**MECHANIC:** “Aye, someone's moved it. Leave it alone. We need to write down exactly how we found it.”

Then choose:

| Player action | Practical outcome |
| --- | --- |
| **[Mark the pin on the sketch]** | Document where the connection is held; leave physical apparatus untouched |
| **[Ask the mechanic to check again]** | Mechanic independently verifies the stop and pinned connection, costing more work time; then the same accurate condition is documented |

The ordinary non-destructive **Industrial Machinery** task ends in a recorded safety defect. Neither branch magically repairs the closed ventilation machinery, removes evidence, stops the bell as an unapproved world effect or consumes a personal tool.

**Revelation exchange (APPROVED):**

**PLAYER:** “Wait. Is that pin what's keeping the bell ringing?”

**MECHANIC:** “Yes. Someone moved it so the bell would work even with the shutoff down.”

**PLAYER:** “Can't we just pull it out?”

**MECHANIC:** “Not while it's moving. Leave it alone till we've checked everything.”

The last instruction is immediate workplace caution, not a maxim. The mechanic does not claim to have seen the saboteur.

### C04 — Finish The Bell Linkage

**Final handover:** *You hand the completed report to the mechanic. He takes responsibility for passing it to the authorized repair crew. The mechanism is left untouched.*

**[Head back to the service gate]** is the **only final dialogue choice**. It saves the documented safety defect and advances from Stage 4 directly to Stage 5; there is no separate **[Record the inspection]** or repeated completion screen. Store: safety shutoff engaged, bell linkage bypassed/held, inspection method, location of pinned connection, defect noted. The mechanism remains **untouched**, and the building is not legally reopened.

**Job context:** The mechanic supervises an inspection and records the problem; there is no authorized repair work.

## Convergence to Stage 5: do not collapse the discoveries

Each task is short and self-contained, with its own work-resolution view:

| Route | Locally established fact | What Dogman can plausibly object to later |
| --- | --- | --- |
| Attendance Certificate | Refusers classed voluntarily absent; wages forfeited | A courier questioning or carrying disputed shift-office papers |
| First Aid Line | Workers' symptoms noted; charge classed non-work | A courier warning people and helping them seek care |
| The Bell Linkage | Safety stop engaged, bell kept connected deliberately | A courier inspecting/recording the unauthorized bell connection |

The player moves toward the **outside service gate** as the route finishes, either from the nearby shift office, first-aid point or machinery panel. The later Dogman scene may catch the courier at that common exterior location. Stage 4 does **not** trigger the confrontation until the chosen task is marked complete. The Shift Marshal does not appear.

Do not have Dogman casually know the precise contents of unseen attendance books, patient registers or machine logs. In Stage 5, his objections should be based on what a hired security man could have been told or witnessed, not omniscience.

## Data / fair play / unresolved implementation

- **Economy/progression:** follow the already locked shared tutorial rules; repeatable non-tutorial jobs use their normal rewards. Do not repeat the tutorial reward explanation in every branch.
- **Save/resume:** persistent branch selection; per-route task steps; one finished-state flag and a local evidence note. A reconnect cannot switch major skill or collect another +1.
- **Clock:** all mandatory player choices presented early (normally within two minutes of starting each activity); real time runs through prompts and traversal; unresolved required interactions prevent premature completion.
- **Low-skill accessibility:** no subskill tier assumptions, hidden checks, mandatory specialist equipment, medical supply purchases or dangerous site entry. Experienced characters may eventually see more diagnostics in ordinary repeatable jobs, but no threshold is canonized here.
- **Failure:** correction, extra staff check or more time. Do not withhold the fixed route revelation, impose a harm/death penalty on a newly created character or require false attestations.
- **Ownership:** shift books, office forms, first-aid records/supplies and machinery parts are institutional fixtures or quest data. Evidence is recorded to the quest journal, not the player's ordinary market inventory.
- **Technical TBD:** formal interaction IDs, patient clinical attributes/conditions, mechanical design diagram, attendance form asset, route geometry, base work/travel duration, inspection success probabilities, equipment detail, UI copy and all skill-efficiency multipliers.
- **Next:** Stage 5 — two Dogman interactions, *Show Your Papers* then *Gate Barred*; numerical combat design and later healing/housing still separate.

## Editorial review of the approved spoken text

- **Contracts:** The earlier “That's no choice” was an abstract retort, and “I don't make the categories” sounded like modern office shorthand. The replacement asks why a man seen at the gate is counted absent. The clerk answers with what the attendance book records, without making a speech.
- **Trauma:** “You wrote it wasn't from work” sounded like a scripted accusation and “They've been coughing outside a closed works” was awkward everyday English. The replacement asks directly about the claim in the book and the charge. The attendant distinguishes her observations from a diagnosis.
- **Machinery:** “Someone's pinned the link past the stop” forced the courier to speak technical shorthand. “It didn't get there on its own” was a stock dramatic reply. The replacement uses the courier's plain question about why the bell still rings and the mechanic's clear caution about the moving equipment.
- **Openers revised too:** The clerk argues about proof of delivery rather than paraphrasing a form; the attendant deals with the worker struggling to speak; the mechanic points the courier toward a visible part without jargon-heavy instruction. These are work conversations, not tutorial questionnaires. No added catchphrases or self-conscious period slang.

## Approval boundary

**LOCKED BEFORE THIS DRAFT:** all three job names, chosen Major Skills, core category/medical/mechanical revelations, character-creation +3 Industry, second-task selection +1 (exactly once), tutorial zero-wage/XP/loot rules, the later unofficial opponent Dogman, the 10-coin clinic and universal rented home.

**APPROVED IN STAGE 4 (2026-10-15):** the three playable work flows and the rewritten, simpler conversations; clerk attendance challenge methods, staffed low-risk patient triage and medical-register note, external supervised linkage inspection and retaining-pin explanation, evidence states and natural convergence near the service gate.

**NOT YET DEFINED:** exact durations/skill modifiers/quantities, clinical balance, worksite mechanism art/specifications, confrontation and fight text, treatment/home details. Exact numerical mechanics and implementation details are still deferred.

Related: [Bellrunner story](README.md), [Stage 3 discovery](wrong-bell-discovery.md), [Stage 2 courier work](shift-dispatch-interaction.md), [Shared structure](../shared-structure.md), [Jobs and Time](../../jobs/jobs-and-time.md), [Game-wide dialogue style](../../interactions/dialogue-style-guide.md).
