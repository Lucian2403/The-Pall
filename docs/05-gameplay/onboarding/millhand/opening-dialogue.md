# Millhand — Stage 1: The Workshop — APPROVED Revision 02

**Status: APPROVED BY PROJECT OWNER (2026-10-22), EDITORIAL CANON.** Supersedes the October 14 Guther dialogue previously recorded here; that older version remains recoverable in Git history. **This text has not yet been installed into the runnable v0.4.1 client/server.** Its gameplay action IDs and mechanics remain the same except that the new optional “Leave it there” response requires a small after-pay conversation-path addition in the next implementation pass.

## Character entry

**Location:** Grand Cylinder City
**Origin:** Millhand
**Title:** The smithing workshop

Your work begins at a council plate lot laid out on Guther Anvil's bench.

**Player action:** Enter the workshop.

## Scene 01 — The Foreman

*Steel rings at the far benches, two sharp blows and a third that comes late. The air carries hot scale and damp cloth. Guther sets a folded work paper beside a tray of metal plates. His thumb leaves a dark mark along the edge.*

**GUTHER:**

“The council's sent more plates. Worker numbers again. Read that paper before you touch the stamps.”

**PLAYER RESPONSES:**
1. “When do we get paid?”
2. Listen to the work instructions.

## Optional conversation — The Wages

**PLAYER:**

“When do we get paid?”

**GUTHER:**

“Listen, [player name]. The inspector signs for the plates first. Then we get paid. That's what the council told us, and that's what they'll keep saying. So don't worry about it. And don't blame me.”

**PLAYER RESPONSES:**
1. “And you believe them?”
2. Leave it there.

**If pressed, PLAYER:**

“And you believe them?”

**GUTHER:**

“No. They didn't ask me. But you should believe me.”

*Guther slides the paper back toward the plates. He has finished talking about the pay.*

## Scene 02 — The Work (common route)

**GUTHER:**

“Read the numbers on the paper. Set the number stamps to match. If a plate is bent, decide what to do with it before you use the hammer. Check your work, then bring the paper back to me.”

**PLAYER ACTION:** Take the work paper.

*You pull the paper closer. The numbers are clearly written. The metal plates, number stamps and hammer are laid out on the bench.*

**Stage 2 begins: Worker Plate Smithing.**

## Display labels and continuity

For first use in accessible player-facing speech/UI: **work paper** (technical docket), **metal plate** (blank), **number stamps** (numbering dies), **stamped mark** (impression). Technical terms are permitted in object details once introduced, but not required to understand the instructions.

The approved stage keeps Guther Anvil as recurring Smithing Foreman, optional wage conversation, one council plate lot, identical Stage 2 entry and no early Stage 3 reveal. Beginning attributes, skill, inventory, payment/XP rules and worksite ownership remain unchanged. No automatically advancing dialogue. The 1.2-second delay only stages the result after an actual action.

**Editorial note:** This exact approved version replaces the earlier shorter pay exchange; do not silently revert to it when implementing future stages.
