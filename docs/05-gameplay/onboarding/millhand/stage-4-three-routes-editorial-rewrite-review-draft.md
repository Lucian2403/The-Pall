# Millhand Stage 4 — Three Second Jobs: full editorial rewrite, Revision 01

**STATUS: EDITORIAL PROPOSAL FOR PLAYER REVIEW — NOT APPROVED, NOT IN THE PLAYABLE BUILD (2026-10-22).** This document proposes every principal Stage 4 scene, work instruction, NPC exchange, choice/result, error response and journal entry for all three routes. The [original approved Stage 4 document](second-task-branches.md) remains authoritative for gameplay flow, three task families, skills and constraints. This follows approved [Stage 1](opening-dialogue.md), [Stage 2](stage-2-platework-editorial-rewrite-review-draft.md) and [Stage 3](stage-3-missing-stamp-editorial-rewrite-review-draft.md) editorial versions.

## Editorial diagnosis of the former Stage 4

- **“The manifest says workers.”** The meaning is clear, but referring to a document as a speaker is against the user's explicit no-personification rule. Use **“They've written ‘workers’ here.”** A worker points out what another person entered.
- **“Then put down plates. I receive what's here.”** A tidy, slogan-like answer that Guther or any clerk could give. The depot clerk should care about what physically arrived and what they can personally record.
- **“One says he died. The other says he's still on the books.”** Vague about the real conflict. The two records have distinct uses: one records death for compensation, another records active status for contract charges.
- **“Both have a seal.” / “You can put that in writing.”** Both facts remain, but the clerk needs an ordinary reason not to amend a sealed entry. The player must choose between requesting a check of both seals and entering a written challenge.
- **“Someone scraped this out.” / “Don't rub the page. It tears.” / “I don't know.”** A plausible short exchange, but by itself it leaves the Investigation task as another bland document click. Context and the user's actual comparison matter more.
- The scene interface should **not** disguise Hauling, Contracts and Investigation as the same selectable form, invent a worker ID/date, or show the correct next object through highlighting.

## Common presentation rules

- Scene narration and wrong-object feedback use **second person**; selected player dialogue and the personal Journal use **first person**, with factual accuracy.
- Use accessible plain English in instructions. Specialist terms can be visible on a real paper with an explanation nearby (manifest = delivery list; register = official record).
- No metaphor or personification, including paperwork “saying”, tools “wanting”, a line of writing “accusing” or a room “holding its breath”.
- No autoplay and no automatic skipping of NPC dialogue. The 1.2-second reveal follows a committed player action only.
- On branch selection in Stage 3, **Industry +1, Commerce +1 or Scholarship +1 was already awarded once**. Stage 4 does not award it again.
- Neither the first nor second scripted job pays coins or ordinary XP or puts workshop/council objects into personal inventory.
- Scene contents and object focus must be appropriate to the actual route/location. Objects not relevant to a current action remain available for simple inspection when credible; wrong selections do not advance state or cost a turn.
- `[WORKER_NUMBER]` and dates are placeholders for identical future authored values and **not** literal production text; never invent numbers now.

---

# Route A — Depot Intake Run
**Skill family:** Industry / Hauling
**Entry condition:** Chose to restamp the worker number in Stage 3.

### Scene A01 — One more mark

*Guther leaves the council work paper beside the plates. You put a plate in place and set the number stamps to the worker number you have just checked.*

**Instruction:** Stamp the worker number once more. Do not touch the council inspector's mark.

**Action:** Stamp the worker number.

*You make one more number mark. You check that it can be read. The council inspector's mark has not been changed.*

**Next instruction:** Check the plates before moving them to the depot.

### Scene A02 — Preparing the delivery

*The finished plates are together with the council work paper. You look over the load before moving it.*

**Action:** Check the load.

*You count the plates and compare the load with the work paper. The number of plates matches the delivery entry. You check whether any are loose or damaged.*

**Instruction:** Decide how to move the plates.

**Choice 1: Secure the plates together.**

*You fasten the plates together for transport. You can move them with less handling, although a heavy load can shift and damage plates if you do not keep them steady.*

**Choice 2: Carry the plates in smaller loads.**

*You divide the plates into smaller groups and move them separately. You spend more time handling the load, but there is less weight to manage each time.*

Both choices complete the move to the municipal depot. They preserve their distinct handling-time/damage-risk trade-offs when those values are implemented; this script establishes **no numbers, random outcome or guaranteed damage**.

### Scene A03 — At the municipal depot

*You bring the numbered plates to the receiving counter. A clerk examines the work paper and the delivery list.*

**Action:** Compare the delivery list with the plates.

*You check the delivery list. Under the type of goods, someone has written **“workers”**. You have delivered metal plates. No workers have arrived with you.*

**Instruction:** Speak to the Depot Clerk about the delivery.

**DEPOT CLERK:** “Put the plates there. I need your mark for the delivery.”

**PLAYER:** “They've written ‘workers’ here. I've brought plates.”

*The clerk looks at the goods column, then at the metal plates.*

**DEPOT CLERK:** “Aye. I can see that.”

**PLAYER:** “Are you going to record it like that?”

**DEPOT CLERK:** “No. I'll record what you've brought. But I can't change the council's other papers.”

The clerk knows what arrived at the counter; their words neither explain the incorrect category nor claim authority over the other records.

### Scene A04 — The receiving record

**Instruction:** Decide how to record the delivery.

**Choice 1: Record the goods as plates.**

*You enter **“plates”** in the received-goods record. The clerk confirms that the depot received the metal plates.*

**Choice 2: Ask for the delivery list to be corrected before signing.**

*You point out the incorrect goods entry and ask for it to be checked. The clerk reviews the delivery papers before acknowledging that the depot received metal plates. The extra check takes more time; the original entry is not explained.*

**Action:** Complete the delivery.

*The depot staff take the plates. The receipt records metal plates, not workers. The delivery list you examined had the wrong category. You have not received any wages.*

**Stage result:** The physical goods were recorded truthfully; why the original delivery list classified them as workers remains unknown.

### Depot: optional inspections and wrong objects

- **Select number stamps after the corrective mark:** “You have finished the extra number mark. The plates still need to reach the depot.”
- **Select the papers before checking the physical load:** “You can examine the papers, but you have not checked the plates for this delivery yet.”
- **Select the plates after reaching the counter, before checking the delivery list:** “You have brought the plates to the depot. The clerk needs the delivery recorded.”
- **Return to the load after seeing the goods mismatch:** “You have already checked what you delivered. The receiving record still needs your choice.”
- **Try to leave before finishing the receipt:** “The depot has not yet recorded the delivery as complete.”

All statements are second-person/factual observations; no server work action occurs for an incorrect click.

### Journal — Depot Intake Run

- **After corrective stamp:** *I stamped the worker number once more. I did not change the council inspector's mark.*
- **After checking the load:** *I checked the plates and compared the load with the work paper.*
- **If secured together:** *I secured the plates together for transport.*
- **If smaller loads:** *I moved the plates in smaller groups.*
- **After comparing the delivery list:** *The depot's delivery list had “workers” entered under the goods. I had brought numbered metal plates.*
- **If recorded directly:** *I recorded the received goods as plates.*
- **If correction requested:** *I asked the depot clerk to check the incorrect entry before I signed.*
- **On completion:** *The depot received the plates and recorded them as plates. I was not paid. I still do not know why the other entry listed workers.*

---

# Route B — Disputed Docket
**Skill family:** Commerce / Contracts
**Entry condition:** Chose to ask the council's Contracts office in Stage 3.

### Scene B01 — The Contracts counter

*You enter the council's Contracts office with the disputed work paper. A clerk is working at the counter.*

**Instruction:** Read the council work paper and find the worker number and seals.

**Action:** Examine the work paper.

*You find the worker number, the council seal and the entry identifying the office responsible for the contract. You keep the paper open while the clerk brings out the related records.*

### Scene B02 — Two sealed entries

**Instruction:** Compare the two official records.

**Action:** Compare the entries.

*Both records use worker number `[WORKER_NUMBER]`. In the compensation record, the council entered the worker as **dead**. In the contract-charge record, the council entered the same worker as **active**. Both records have council seals.*

**Visible finding:** The council recorded the same worker as dead for compensation and active for contract charges.

**Instruction:** Ask the clerk how the two entries can both be accepted.

### Scene B03 — The clerk

*The clerk puts the two records next to one another on the counter.*

**CONTRACTS CLERK:** “Which entry have you come about?”

**PLAYER:** “Both. Here they've recorded the man as dead. In this one they're still charging for him.”

**CONTRACTS CLERK:** “Both entries were accepted. Both have council seals.”

**PLAYER:** “Who checked them?”

**CONTRACTS CLERK:** “I can look up how they were entered. I can't change them myself.”

**PLAYER:** “Then I want the difference recorded.”

**CONTRACTS CLERK:** “You can ask for the seals to be checked, or put your complaint on the work paper. Either way, I can't approve the lot here.”

The clerk explains the authority they actually hold. Neither entry is declared forged, and neither is corrected by this conversation.

### Scene B04 — How to challenge the record

**Instruction:** Decide how to challenge the two entries.

**Choice 1: Ask the clerk to check both seals.**

*The clerk checks how the two records were entered. Both entries appear in the council's records with their seals. The clerk cannot explain why the same worker was recorded as dead and active.*

**Choice 2: Mark the two conflicting entries on the work paper.**

*You mark the two entries and the difference between them. The clerk notes that you have made a formal complaint, but does not change either record.*

**Action:** Submit the disputed work paper.

*The clerk records that the complaint has been received. The two entries remain unchanged. The council has not approved the plate lot, and you are not paid.*

**Stage result:** You have challenged the two sealed records. The council has not resolved the disagreement.

### Contracts: optional inspections and wrong objects

- **Select the clerk before checking the work paper:** “You have not examined the worker number and contract entry yet.”
- **Select only one record, before comparing them:** “You can see the details of this record. You have not compared it with the other one.”
- **Select the seals after completing the comparison:** “You have checked the two seals. You must decide how to challenge the conflicting entries.”
- **Try to submit before choosing a challenge:** “You have not asked for a seal check or recorded the disagreement yet.”
- **Try to edit the sealed original record:** “You cannot change an official entry at this counter. You can request a check or record a complaint.”

### Journal — Disputed Docket

- **After examining the paper:** *I checked the worker number, council seal and contract entry on the work paper.*
- **After comparison:** *The council entered the worker as dead for compensation and active for contract charges. Both entries had official seals.*
- **If seals checked:** *I asked the clerk to check both seals. Both entries were recorded, but the clerk could not explain the difference.*
- **If complaint marked:** *I marked the two conflicting entries on the work paper. The clerk noted my complaint.*
- **On completion:** *I submitted the disputed paper. The council has not corrected the entries or approved the lot. I was not paid.*

---

# Route C — Ledger Reconciliation
**Skill family:** Scholarship / Investigation
**Entry condition:** Chose to keep the worker number and check council records in Stage 3.

### Scene C01 — The records room

*You enter the council's records room and ask for the records connected with worker number `[WORKER_NUMBER]`. An archive assistant brings out the death register. The pages show wear along the edges from repeated handling.*

**Instruction:** Find the worker number in the death register.

**Action:** Read the death register.

*You find the worker number beside the entry for a fire in a locked workshop. The council recorded that worker as dead on `[RECORDED_DEATH_DATE]`.*

### Scene C02 — The later wage record

**Instruction:** Compare the death entry with the later wage records.

**Action:** Check the wage record.

*You find the same worker number in a wage entry made after the recorded death. The related shift records also contain that number. The council kept entering wages under it after the worker was recorded dead.*

**Visible finding:** The number appears in wage records dated after the recorded death.

### Scene C03 — A damaged line

**Instruction:** Examine the altered entry.

**Action:** Examine the scraped entry.

*Part of a handwritten entry has been scraped from the paper. Some ink remains in the damaged area. You can see where the surface was cut.*

*The Archive Assistant notices which part of the page you are examining.*

**PLAYER:** “Someone scraped the ink off this line.”

**ARCHIVE ASSISTANT:** “Don't rub it. The paper's thin there.”

**PLAYER:** “Do you know who changed it?”

**ARCHIVE ASSISTANT:** “No. I wasn't told.”

The assistant confirms only their lack of knowledge. They do not imply they witnessed the alteration or know its purpose.

### Scene C04 — Check another source

**Instruction:** Use another record to check the damaged entry.

**Choice 1: Compare the entries above and below it.**

*You examine the writing around the scraped area. The neighbouring entries give you enough information to confirm that the removed writing was part of the same set of wage records. The worker number still appears in the later tally.*

**Choice 2: Compare the shift book with the wage record.**

*You check the shift book against the wage entry. The same worker number appears in both, after the death recorded in the register. The scraped section does not remove that contradiction.*

Both methods establish the same necessary evidence; neither requires a skill roll. They represent different checks, not different plots. No claim is made about who scraped the record or what words were removed.

### Scene C05 — Record the finding

**Instruction:** Write down what you found.

**Action:** Record the difference.

*You note the worker number, the recorded death, the later wage entries and the scraped correction. You put the records back in order. The assistant takes the pages.*

**Stage result:** You have established that the number continued to be used in wage records after the recorded death. Someone scraped part of an entry. Who did it and why remain unknown.

### Records room: optional inspections and wrong objects

- **Select the wage records before opening the death register:** “You have not yet checked the recorded death date for this number.”
- **Select the scraped line before comparing the wage and death records:** “You can see that part of the paper was scraped. You have not yet checked whether this number appears in later wage records.”
- **Select the death register again after comparing dates:** “You have already found the recorded death. The later wage entry still needs checking.”
- **Try to record the conclusion before checking another source:** “You have found the scraped entry, but you have not finished checking the surrounding records.”
- **Try to take an original book:** “The council's records stay in the records room. You can write down what you found.”

### Journal — Ledger Reconciliation

- **After the death register:** *I found worker number `[WORKER_NUMBER]` in the death register. The council recorded the worker as dead after the workshop fire.*
- **After the wage comparison:** *The same number appeared in a wage record made after that death.*
- **After examining the alteration:** *Someone had scraped part of an entry from the page. I could not tell what had been written there.*
- **If neighbouring entries compared:** *I checked the entries around the scraped line and confirmed that the later wage record still contained the number.*
- **If shift book compared:** *I checked the shift book against the wage record. Both contained the number after the recorded death.*
- **On completion:** *I recorded the death entry, later wage entry and scraped correction. I do not know who changed the record or why.*

---

## Handoff and state rules

All three branches end only **after** their substantive job is completed. The user may review the completed journal entry from the chosen route. The other routes' findings are not secretly discovered or entered in the journal. The **next playable stage is the Wage Claim with Flint**; it does not begin before Stage 4 ends. Stage 4 does not introduce Flint early.

| Route | Already awarded at Stage 3 | Stage 4 task evidence | Completion |
| --- | --- | --- | --- |
| Depot | Industry +1 | “workers” listed; plates actually received | Truthful plate receipt |
| Contracts | Commerce +1 | Same worker dead for compensation, active for contract charges; both sealed | Dispute recorded, no clearance |
| Records | Scholarship +1 | Same number in death/wage records; scraped correction | Findings recorded |

**No new IDs, calendar dates, item ownership, wages, standard XP, loot, criminal/reputation flags or mystery resolution.** All player-facing text remains under review until the project owner expressly approves Revision 01. The currently playable Stage 4 remains older and is not updated by the documentation commit.
