# Millhand Stage 3 — The Missing Stamp: editorial rewrite, Revision 01

**Status: PROPOSED WRITING / UX COPY FOR USER REVIEW (2026-10-22). NOT APPROVED OR INSTALLED IN THE PLAYABLE BUILD.** Supersedes **none** of the prior locked facts or mechanics. It is an explicit proposal to replace the historical Stage 3 spoken and descriptive words in [the approved original](missing-stamp-discovery.md); that file remains the mechanical/source reference until this rewrite is approved. This follows approved [Stage 1 Revision 02](opening-dialogue.md), approved [Stage 2 Revision 03](stage-2-platework-editorial-rewrite-review-draft.md), and the [game-wide writing standard](../../interactions/dialogue-style-guide.md).

## Precise editorial critique of the previous wording

1. **“This number was cancelled. Dead in the fire.”** A very abrupt bit of compressed factual dialogue that sounds like the player presenting a report. Give the actor a natural reason to draw Guther's attention and say what they discovered.
2. **“The inspector marked his plate afterward.” / “I see the date.”** The second line is a generic acknowledgement that contributes little to the social exchange. Guther should visibly check the dates and identify that the number matches, without pretending to know why.
3. **“Can't sign it. No pay till the council clears the lot.”** Good stakes, but currently delivered so abruptly that it feels like a payment-state tooltip. Keep Guther's attention on what he can and cannot authorise, with his defensive voice established in Stage 1.
4. **“That wasn't my question.” / “I know.”** The neat closing beat is conspicuously written. Give the characters a more natural disagreement that leads straight into the three choices.
5. **“Then I'll mark it again. Send it through.” / “I've nothing here that'll answer you.”** These are too compressed for readers with limited English. The new choices must clearly mean delivery, Contracts and checking the records, without technical jargon.
6. The older scene and the v0.4 presentation must not compress multiple spoken lines into the latest NPC utterance, conceal dialogue, auto-advance or use the 1.2-second action reveal as a speech autoplay timer.

## Full replacement scene

### Scene 01 — The returned papers

**Location:** Smithing workshop, Grand Cylinder City
**Scene heading:** The Missing Stamp

*You hand the work paper back to Guther. On the bench, beside the council papers, are a metal plate returned with the paperwork and a folded slip. The plate is not one of the new plates you have just worked on.*

**Current instruction:** Examine the returned plate and the folded slip.

**Objects:** Returned plate; Cancellation slip; Guther Anvil; remaining workshop tools.

The player can inspect the plate and slip **in either order**. Neither target receives a “correct object” highlight. Any previous Stage 2 quality choice leads here.

#### Action — Read the cancellation slip

*You unfold the small paper. A worker number has been cancelled. The council recorded the worker as dead after a workshop fire in which the doors were locked.*

**CANCELLATION SLIP (readable record, not spoken dialogue)**
- **Worker number:** `[WORKER_NUMBER]`
- **Recorded as:** Dead after workshop fire
- **Recorded death date:** `[RECORDED_DEATH_DATE]`

The bracketed fields are placeholders for future authored **consistent** values. Do not print placeholder text as a game-world number or invent dates in the art.

**If this was the first document inspected:** *You fold the slip back. The returned plate is still on the bench.*

#### Action — Turn the returned plate

*You turn the metal plate over. A worker number has been pressed into the metal. Near it is a separate mark made by a council inspector. A date is stamped beside that mark.*

**RETURNED REFERENCE PLATE (readable record, not spoken dialogue)**
- **Worker number:** `[WORKER_NUMBER]`
- **Council inspector's mark:** Present
- **Inspection date:** `[INSPECTION_DATE]`

The inspection mark is already on the returned plate. **The player did not make it and never has the option to forge it.**

**If this was the first item inspected:** *You set the plate down. The cancellation slip is still folded beside it.*

### Scene 02 — Compare what you found

**Trigger:** Both objects have been inspected, in either order. This is a natural state-based reveal, **not** another compulsory Compare button, roll or skill check.

*You place the slip beside the returned plate. The worker number on both is the same as one of the numbers you stamped today. The council recorded the worker as dead on `[RECORDED_DEATH_DATE]`. The inspector's mark is dated `[INSPECTION_DATE]` — after the recorded death.*

**Visible finding:** The same worker number was recorded as dead before the council inspection date.

The user-facing result shows **both actual dates** and the worker number after authored values exist; it is not based on guessing how old the mark looks.

**Available action:** Show Guther the papers.

### Scene 03 — Guther and the two dates

*You put the returned plate and the cancellation slip in front of Guther.*

**PLAYER:** “Guther, the council says this worker died in the fire. It's the same number we stamped.”

**GUTHER:** “Let me see.”

*Guther reads the slip and turns the returned plate to check the number and date.*

**PLAYER:** “Look at the inspector's date. It's after the man's death.”

**GUTHER:** “Aye. Same number, and that date is later.”

**PLAYER:** “Then why were we told to stamp his number?”

**GUTHER:** “I don't know. And I can't sign this lot, not after seeing those dates. The council won't pay us till they settle it.”

**PLAYER:** “So that's all we're going to do?”

**GUTHER:** “I didn't write those records. What do you want me to do?”

No speech autoplays, and no following interaction begins while this conversation is still on screen. Show the current full utterance with deliberate player-controlled progression; don't hide the exchange behind a history transcript. All protagonist dialogue above is a scripted spoken exchange that must be advanced by the user, not by a timer.

### Scene 04 — Three ways forward

**Player instruction:** Choose what you will do next.

The following three alternatives appear together after the preceding conversation. The **spoken sentence is the clickable choice**; the route name can be shown below it as a descriptive label, not as diegetic speech.

**A. Restamp — Industry / Hauling**

**PLAYER:** “I'll stamp the worker number again. Then I'll take the plates to the depot.”

**GUTHER:** “Only the worker number. Leave the inspector's mark alone. Take the lot to the depot when you're done. I won't sign to say the lot is approved.”

*You return to the bench for one more worker-number mark before taking the lot to the depot.*

**Follow-up:** One corrective/reissued *worker-number* stamp using the existing work interaction; then the **Depot Intake Run**. This is not another whole Smithing shift, and never alters the council inspection mark.

**B. Ask Contracts — Commerce / Contracts**

**PLAYER:** “Then I want to know why they sent us a dead man's number.”

**GUTHER:** “Go to the council's Contracts office. They sent the work paper. Ask them.”

*You take the disputed work paper to the council's Contracts office.*

**Follow-up:** **Disputed Docket**. This route challenges the basis of the paperwork and its two classifications; it does not confer a clearance or payment.

**C. Check the records — Scholarship / Investigation**

**PLAYER:** “I'll write down the number and check the records myself.”

**GUTHER:** “All right. I've got no other records here.”

*You keep a note of the worker number and prepare to look through the council's records.*

**Follow-up:** **Ledger Reconciliation**. The number is retained in quest/journal state, not turned into a new carried item. No one reveals who changed the documents here.

### Object inspection and incorrect-action feedback

All optional feedback is **second-person narration or directly observable physical fact**, never first-person inner monologue or words spoken by objects. It must never advance server state, spend a turn or produce rewards. Each entry has only modest variation, and it appears solely where its stated condition is true.

| Situation | Possible player-facing text |
| --- | --- |
| Select the hammer while the returned evidence is unexamined | “You have finished marking the plates. The hammer is not needed for the returned papers.” / “You have already completed the metalwork for this lot.” |
| Select the number stamps before choosing Restamp | “You do not need to set the stamps again to examine the council's papers.” |
| Select Guther before examining both items | “You have not examined both items from the council's papers yet.” / “You can examine the returned plate and the folded slip before speaking to Guther about them.” |
| Select the returned plate after inspecting only the slip | **Perform the authorised plate inspection**, not a wrong-object remark. |
| Select the cancellation slip after inspecting only the plate | **Perform the authorised slip inspection**, not a wrong-object remark. |
| Revisit either item after both have been read, before branching | Display the actual previously discovered record again, without changing state or replaying the discovery. |
| Select workshop stock during Guther's conversation | Do not allow the conversation to be skipped. “Finish speaking to Guther before returning to the workbench.” |
| Select the hammer after choosing the Contracts or Records branch | “You have finished the workshop work. You have chosen to check the council's papers elsewhere.” |

Avoid generic “wrong object” popups, jokey anthropomorphism or an insult following every click. The player should understand what they are examining, not be forced into obvious choices by visual highlights.

### Journal — The Missing Stamp (factual first person)

**After returning the work paper:**
*I returned the finished work paper to Guther. A returned plate and a folded cancellation slip were with the council's papers.*

**After reading the slip (only if actually inspected):**
*I read a cancellation slip for worker number `[WORKER_NUMBER]`. The council recorded the worker as dead after a fire in a locked workshop. The date was `[RECORDED_DEATH_DATE]`.*

**After turning the returned plate (only if actually inspected):**
*I examined a returned plate with worker number `[WORKER_NUMBER]`. It had a separate council inspector's mark dated `[INSPECTION_DATE]`.*

**After examining both:**
*The two records have the same worker number as one of the plates I stamped. The inspection date came after the recorded death.*

**After speaking to Guther:**
*I showed Guther the records. He could not explain the dates. He would not approve the disputed lot, and the council had not paid us.*

**After branch choice — only the selected line:**
- **Restamp:** *I chose to stamp the worker number again and deliver the lot to the depot. The inspector's mark is not part of my work.*
- **Contracts:** *I chose to take the disputed work paper to the council's Contracts office.*
- **Records:** *I wrote down the worker number and chose to check the council's records.*

The actual second-job findings belong in Stage 4 and must **not** appear here.

## Implementation/continuity contract

- Return Stage 2 work paper → two inspectable council evidence objects → after **both** inspections reveal the contradiction → explicit Guther conversation → all three spoken choices on one screen.
- The two inspections work in either order and are always accessible regardless of work quality.
- The worker number is **identical** on the returned reference plate, cancellation slip and plate stamped by the player. Inspector date is **later** than recorded death. Both values remain TBD and must be consistent when implemented. No fabricated digits/dates.
- First job: 0 coins, 0 ordinary XP and no player-owned metal/papers; council acceptance is suspended.
- Route **Restamp → Industry +1**, **Contracts → Commerce +1**, **Records → Scholarship +1**, awarded **once on route commitment**, never on reloading or rereading evidence; other initial Major Skills remain unchanged.
- The three corresponding Stage 4 jobs remain distinct and unchanged in design; none is a second paid commission.
- The player's approved portrayal is via chosen first-person spoken responses; narrator and object feedback use second person; journal is first person factual. No metaphors/personification, no mandatory humour, plain comprehensible English and plausible industrial-period speech.
- About 1.2 s after a **committed action**, reveal its result; never auto-advance spoken lines, and allow re-reading the records without submitting duplicate state changes.
- No new role/NPC, world law, legal document category, crime flag, compensation, loot, conspiracy solution or early Flint encounter is created by this rewrite.
- **This is a review draft.** The currently runnable v0.4.1 / v0.4 interfaces still contain earlier story text until a separately verified implementation update.

The old Stage 3 words are deliberately reopened for editorial consideration by the owner. Mechanical evidence, irreversible three-way decision and stage boundaries are still preserved.
