# Millhand — Stage 2: Marking the Worker Plates

**Status: COMPLETE EDITORIAL REWRITE DRAFT FOR REVIEW (2026-10-22), NOT YET APPROVED OR IN THE GAME BUILD.** Follows the newly approved [Stage 1 Revision 02](opening-dialogue.md) and the established [platework mechanics](platework-interaction.md). This proposes replacement of Stage 2's player-facing words, not its Smithing rules, number values, ownership, payouts or Stage 3 discovery.

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
*The paper shows the worker number to stamp on the plates. The stamps must be set to match it.*

The actual number comes from future authored data and must be displayed consistently, not invented for this draft.

### Step 2 — Set the number stamps
**Instruction:** Set the number stamps to match the paper.

**Player action (number stamps):** Set the number stamps.

**Result:**
*The number is set. You pull a plate from the pile. One corner is bent, and the plate rocks when you press it against the bench.*

### Step 3 — The bent plate
**Instruction:** The plate will not lie flat. Decide what to do with it.

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
*The plate moved under the stamps. Part of the number is too faint to read. It needs more work.*

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
| Work paper | The council's work order. It shows which number to put on the plates. |
| Metal plates, before handling | Plain pieces of metal, ready for stamping. |
| Bent plate | One corner is out of shape. The plate rocks on the bench. |
| Number stamps | Small metal tools with numbers on their ends. Together they make the number on a plate. |
| Hammer | Heavy enough to press the stamps into the metal. |
| Guther | Guther is busy with the workshop. He has told you to finish the plates. |
| Finished plate | The number is clear and matches the paper. |
| Poor plate | Part of the number is hard to read. |

## Wrong-object responses — authored by circumstance, not random insults

Each entry is a possible **player observation**, not unseen NPC speech. Use each only in the phase that makes it true. Variations should rotate without repeating the same line immediately; repeated errors remain harmless and do not alter server work state, coin or time.

| Situation | Candidate remarks |
| --- | --- |
| Hammer before reading the paper | “No use swinging yet. You don't know which number to make.” / “The hammer's ready. You're not.” |
| Plate before reading the paper | “A plate without a number is just metal. Read the order first.” / “It looks like every other plate on the bench. For now.” |
| Hammer before setting the stamps | “Those stamps still need setting. A hard blow won't fix the wrong number.” / “You could hit it now. Then you could explain the mess to Guther.” |
| Paper after the stamps are already set, while dealing with the bent plate | “The number's right. It's the plate that's giving trouble.” / “Reading it again won't flatten that corner.” |
| Hammer while the plate is bent | “That corner won't stay down. Hitting it now is asking for more work.” / “You can make a bad mark quickly, but you'd still have to fix it.” |
| Hammer immediately after stamping, before checking | “You've struck it once. See what the metal looks like before doing more.” / “More hammering won't tell you if the number can be read.” |
| Work paper while a poor mark needs fixing | “The number on the paper hasn't changed. The one on the plate needs attention.” |
| Metal plate while the lot is ready for final review | “This one is marked. Look over the work before you hand it in.” |
| Hammer after the lot is complete | “The work's done. Put that bloody thing down.” / “No one is paying you for another blow.” |

**Humour guideline:** occasional dry annoyance; no stand-up routine, cynical proverb, modern insult or mockery of a player's English. Guther is not claimed to say these lines. Prefer three accurate contextual lines over thirty interchangeable quips. The game may display the expected task in the written instruction, but must not highlight the correct clickable object.

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
*The stamped number was hard to read. I had to correct the mark or use another plate.*

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
