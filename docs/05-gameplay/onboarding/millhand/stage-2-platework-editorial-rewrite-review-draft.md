# Millhand — Stage 2: Marking the Worker Plates

**Status: EDITORIAL REWRITE REVISION 02 FOR REVIEW (2026-10-22), NOT YET APPROVED OR IN THE GAME BUILD.** Follows the newly approved [Stage 1 Revision 02](opening-dialogue.md) and the established [platework mechanics](platework-interaction.md). This proposes replacement of Stage 2's player-facing words, not its Smithing rules, number values, ownership, payouts or Stage 3 discovery.

## Specific problems in current Stage 2
- “Inspect the docket and blanks”, “Match the dies to the docket”, “Check the impression”, “Rework the mark” are correct metalworking vocabulary, but needlessly hard as first-use tutorial verbs.
- “The uneven seat risks a shallow impression” is a mechanical explanation that an English learner might not understand and that spoils the outcome before inspection.
- “Council platework · Mark matching / Quality check / Batch review” and “Normal XP” resemble debug reporting, not workplace language.
- Current job text often tells the player the correct tool instead of making the player read Guther's instruction; the game should not add halos or answer highlighting.
- A pool of interchangeable wrong-object quips does not guarantee context, quality or an honest in-character response.

## Full Stage 2 replacement — every main player-facing beat

### Entry, immediately after the approved Stage 1
**Location:** The smithing workshop
**Work title:** Marking the plates

*The work paper lies open beside a pile of unmarked metal plates. Number stamps stand in a small rack. The hammer is beside them. The council has asked for a number on each plate.*

**Current instruction:** First, find out which number belongs on the plates.

**Available scene objects:** Work paper; Metal plates; Number stamps; Hammer; Guther Anvil.

**Player action (work paper):** Read the work paper.

**Result:**
*The paper shows the worker number to stamp on the plates. You must arrange the number stamps to match the number on the paper.*

The actual number comes from future authored data and must be displayed consistently, not invented for this draft.

### Step 2 — Set the number stamps
**Instruction:** Set the number stamps to match the paper.

**Player action (number stamps):** Set the number stamps.

**Result:**
*The number is set. You pull a plate from the pile. One corner is bent, and the plate rocks when you press it against the bench.*

### Step 3 — The bent plate
**Instruction:** One corner is bent. Decide whether to straighten the plate, take another or stamp it as it is.

**Player action (metal plate):** Look at the bent plate.

**Choices and corresponding results:**

1. **Straighten the corner.**
   *You work the corner flat against the bench. The plate sits steady now.*
   **Consequence:** same plate, more work, less wasted metal.
2. **Put it aside. Take another.**
   *You put the bent plate with the rejected pieces and take another from the workshop pile.*
   **Consequence:** less handling of the damaged plate, but one more plate used.
3. **Stamp it anyway.**
   *You leave the plate as it is. It still rocks under your hand, but you mean to stamp it anyway.*
   **Consequence:** the mark will be poor and must be dealt with after checking. Do not reveal that hidden result in the option's pre-choice description.

All three options remain valid. The first two lead to a clear mark on inspection in the current prototype; the third creates an inspectable poor mark, not a softlock.

### Step 4 — Stamp the plate
**Instruction:** The stamps are ready. Mark the plate with the hammer.

**Player action (hammer):** Stamp the number.

**Result:**
*The hammer comes down. A number is left in the metal. You put the hammer down to check it.*

### Step 5 — Check the number
**Instruction:** Look at the number on the plate. Can you read it clearly?

**Player action (metal plate):** Check the stamped number.

**Good result (straightened or replaced plate):**
*The number is clear. It matches the work paper.*

**Poor result (stamped while bent):**
*The plate moved under the stamps. Part of the number is too faint to read. You need to correct it before handing the plate in.*

**If poor, choose one of two ways forward:**

1. **Fix the mark.**
   *You set the plate steady and stamp the weak part again. The number is clear enough now.*
2. **Put the bad plate aside. Use another.**
   *You leave the bad plate with the rejected pieces and mark another from the workshop pile. This one is clear.*

No new player-owned item, permanent tool or crafting resource is created by these options.

### Step 6 — Finish checking the lot
**Instruction:** Check that the plates are ready to be sent for approval.

**Player action:** Finish checking the plates.

**Result:**
*The plates are marked. The numbers can be read. The council has not approved the work yet.*

**Payment note, only where relevant:** No wages have been paid. The council has yet to accept the lot.

Do not prominently display developer copy such as “Tutorial wages: 0”, “Normal XP: 0” or “Batch quality state: passed”. The server still awards exactly 0 coins and 0 ordinary XP during this scripted task.

### Step 7 — Return to Guther
**Instruction:** Take the work paper back to Guther.

**Player action (Guther or work paper, whichever is spatially clear):** Return the work paper.

**Result:**
*You hand the work paper back to Guther.*

**Transition:** Stage 3 begins **after** this action. No death record, returned reference plate, date contradiction or other Missing Stamp information appears while ordinary work is ongoing.

## Contextual object observations — optional, read-only

These details may be shown when the player examines objects outside a required choice. They must not advance work or reveal later evidence.

| Object | Observation |
| --- | --- |
| Work paper | The council's work order, with the number to stamp on each plate written on it. |
| Metal plates, before handling | Plain pieces of metal, ready for stamping. |
| Bent plate | One corner is out of shape. The plate rocks on the bench. |
| Number stamps | Small metal tools with numbers cut into their ends. Workers arrange them and strike them with a hammer to stamp metal. |
| Hammer | A heavy hammer used to strike the number stamps against a metal plate. |
| Guther | Guther is busy with the workshop. He has told you to finish the plates. |
| Finished plate | The number is clear and matches the paper. |
| Poor plate | Part of the number is hard to read. |

## Wrong-object responses — literal, contextual player observations

The selected object and work phase determine which remarks are eligible. These are observations from the player's viewpoint, **not dialogue spoken by workshop objects or unseen NPCs**. A wrong selection is harmless: no server action, reward change, resource cost or work advancement. Text variation comes from a real difference in the situation, not a quota of jokes.

**Strict no-personification policy:** The text must never attribute speech, thought, intent, feeling, judgement or human action to a tool, paper, metal part or other nonliving object. Also avoid figurative shortcuts such as “asking for trouble”, “the hammer's ready”, “the number's giving trouble”, and “reading won't flatten it”. Describe what the player has or has not done, what they can see and what will physically happen.

| Situation | Candidate player observations |
| --- | --- |
| Hammer before reading the paper | “I haven't checked the work paper yet. I don't even know which number to stamp.” / “I need to read the number before I start.” |
| Plate before reading the paper | “I can't mark this plate until I know the correct number.” / “The plate has no number on it yet. I should read the work paper.” |
| Hammer before setting the stamps | “I haven't set the correct number on the stamps. If I use the hammer now, I'll mark the plate incorrectly.” / “I need to arrange the number stamps before I strike.” |
| Work paper while handling the bent plate | “I've already checked the number. Now I need to straighten this plate or take another.” / “I know which number to use. One corner of the plate is bent.” |
| Hammer while deciding what to do with the bent plate | “The plate is bent. If I stamp it like this, part of the number might come out badly.” / “I should decide whether to use this plate or replace it before striking.” |
| Hammer after stamping but before inspection | “I've stamped the number once. I should check it before I use the hammer again.” / “I should see whether the whole number can be read.” |
| Work paper while the mark needs fixing | “The work paper has the correct number. I need to fix the weak mark on the plate.” |
| Plate when all marks are ready for final review | “The number on this plate is clear. I need to check the whole lot before handing in the work.” |
| Hammer after the lot is complete | “I've finished marking the plates. I need to return the work paper to Guther.” / “I don't need the hammer again for this lot.” |

**Humour guideline:** Do not force jokes into inspection/error text. Mature humour is acceptable when grounded in a person saying or doing something credible, and does not require giving tools human traits. The expected task may appear as a plain written instruction; the interface must not visually highlight the correct object.

## Journal copy — Stage 2

**Title:** Council platework

**After taking the paper:**
*Guther has given me the council's plate job. I need to set the number stamps, mark the plates and check them.*

**After discovering the bent corner:**
*One plate has a bent corner. I need to decide whether to fix it, use another or stamp it as it is.*

**After choosing a handling method (branch-specific):**
- Straighten: *I straightened the bent plate and kept it in use.*
- Replace: *I set the bent plate aside and took another from the workshop stock.*
- Stamp anyway: *I used the bent plate without straightening it.*

**If the impression was poor:**
*I could not read the whole stamped number. I corrected it or used another plate.*

**Once the lot is reviewed:**
*The plates are marked. They still need council approval before anyone is paid.*

**After returning the work paper:**
*I gave the work paper back to Guther.* (The actual Stage 3 journal entries replace or supplement this when that scene plays; do not insert their facts early.)

## Clear terms and internal mapping (not main-screen copy)

| Existing internal action / word | New first-use display |
| --- | --- |
| `inspect_docket` / docket | Read the work paper |
| `match_dies` / numbering dies | Set the number stamps |
| `bent_blank` / bent blank | Bent plate |
| `straighten` | Straighten the corner |
| `replace` | Put it aside. Take another. |
| `stamp_as_is` | Stamp it anyway |
| `strike_mark` | Stamp the number |
| `check_impression` | Check the stamped number |
| `rework_mark` | Fix the mark |
| `set_aside` | Put the bad plate aside. Use another. |
| `complete_batch` | Finish checking the plates |
| `return_docket` | Return the work paper |

“Docket”, “blank”, “die”, “impression” and “rework” may appear in advanced descriptions later, when their meaning has been demonstrated. Players should not have to know them to complete the opening job.

## Gameplay boundaries

This edit proposes **new words only**, not a new puzzle or recipe. Keep the source of truth on the server, one representative plate episode per lot, all three choices, deterministic prototype poor-mark outcome for stamping as-is, ordinary correction, 0 tutorial wages/ordinary XP/inventory reward, no new skill award and no death-related clue until after the docket's return.

The 1.2-second action-feedback cadence remains presentation-only. No automatic dialogue progression, no correct-object halos, no mock penalty for harmless examination. Exact numbers, work timings, material counts and economic probabilities remain open.

**Editorial note:** Stage 1 was approved in Revision 02. This Stage 2 rewrite is **awaiting separate user approval** and has not replaced the original Stage 2 design document or any executable copy.
