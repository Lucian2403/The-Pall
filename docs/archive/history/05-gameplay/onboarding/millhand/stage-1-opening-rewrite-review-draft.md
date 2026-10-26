# Millhand Stage 1 — Opening at Guther's bench (complete editorial rewrite, review draft)

**Status: PROPOSED REPLACEMENT — NOT APPROVED, NOT MERGED INTO EXECUTABLE CODE (2026-10-22).** Stage 1 only. Historical `opening-dialogue.md` stays unchanged for comparison. The quest stage, starting kit, reward rules, Guther's job and the Stage 2 Smithing action sequence are not rewritten here. This proposal applies the [new narrative voice direction](../../interactions/2026-10-22-narrative-voice-reset.md).

## Why the old Stage 1 writing needed revision
- **“Council wants another lot of worker plates. Docket's on the bench.”** is factual, but provides no human sense of why Guther is directing the job. It has the rhythm of a task notification.
- **“When their inspector accepts the lot.”** is correct information but sounds like a shortened tooltip. The new response should sound like a foreman reporting terms he does not set.
- **“No. You can ask him.”** provides deliberate friction, but seems scripted to end on a clever line. Less neat refusal and more ordinary impatience suit the scene.
- **“Check the number before you strike. If one doesn't match, leave it for me.”** is serviceable; the replacement must retain practical usefulness without becoming a step-by-step tutorial.
- **“Continue”, “Creating character…”, “Guther Anvil has platework ready...”** and other Stage 1 interface/journal text are often debug grammar, not world-facing writing. Revise them too.
- The Stage 1 portrait and workshop do not establish the final art design; text cannot invent final appearances, neighborhood or exact plate numbers.

## Full replacement script — Stage 1

### Character entry screen (before server-side creation)
**Small heading:** MILLHAND / GRAND CYLINDER CITY

**Title:** The smithing workshop

**Description:** Your work begins at a council plate lot laid out on Guther Anvil's bench.

**Form labels:** Name; Portrait (temporary); Male; Female

**Primary action:** Enter the workshop

**Technical aside (not part of scene prose):** Placeholder portraits and local saves are used in this test build.

### First scene: foreman and work
**Location label:** Grand Cylinder City / Smithing Workshop

**Scene heading:** Guther Anvil

**Scene narration:**

> Steel rings at the far benches, two sharp blows and a third that comes late. The air carries hot scale and damp cloth. Guther sets a folded council docket beside a tray of plate blanks and opens it with a thumb dark from work. The numbering dies are within reach.

**GUTHER:**
> "Council's brought more plates. Worker numbers this time. See that docket? Don't touch the dies till you've read it."

**Player choices (mutually available):**
- **Spoken:** "When do we get paid?"
- **Non-spoken:** Listen to the work instructions.

### Optional wages exchange
**PLAYER:**
> "When do we get paid?"

**GUTHER:**
> "Inspector signs for the lot first. Then they pay. That's what the council says."

**Player choices:**
- **Spoken:** "And you believe them?"
- **Non-spoken:** Leave it there.

If the player presses:

**PLAYER:**
> "And you believe them?"

**GUTHER:**
> "No. But they didn't ask me."

**Narration:**
> Guther slides the docket back toward the plates. He has finished talking about the pay.

The branch converges on the same work instruction. If the player chooses “Leave it there”, the conversation also converges. If the player skips wages from the start, none of the optional lines appear.

### Common work instruction (after either dialogue path)
**GUTHER:**
> "Match what's written. If a blank won't lie flat, sort it before you swing. Look over the marks, then bring me the docket."

**Player action:** Take the council docket.

**Action result:**
> You draw the docket across the bench. The figures are plainly written. The blanks, dies and hammer are laid out for the council's work.

**Transition:** Stage 2 — Worker Plate Smithing begins. No early Missing Stamp references, character awards, new items or unpaid-job resolution.

## World-facing UI copy during Stage 1
| Context | Proposed text |
| --- | --- |
| Scene prompt before Guther is selected | Guther is at the bench beside the council docket. |
| Person hotspot | Guther Anvil |
| Speaker label | Guther Anvil / Smithing Foreman |
| Job cue | Council plate lot |
| Primary optional speech label | “When do we get paid?” |
| Optional press label | “And you believe them?” |
| Skip-wages action | Listen to the work instructions |
| Drop-wages topic action | Leave it there |
| Take-job action | Take the council docket |
| Action in progress (1.2s presentation interval) | Taking the docket… |
| Scene-to-work transition | The council plates |
| First Journal heading | Council platework |

## Journal copy, Stage 1 only
**Before taking the docket:**
> Guther Anvil has laid out another lot of worker plates for the council. The docket is on his bench. I have not taken the work yet.

**Optional factual note, only if the player asked about wages:**
> Guther says the inspector must accept the lot before anyone is paid.

**Optional additional note, only if the player pressed Guther:**
> He does not trust the arrangement.

**After taking the docket:** the separate Stage 2 rewrite will supply all work progress, inspection and object-interaction copy. Avoid revealing the disputed identity or treating employer stock as personal possessions.

## Implementation mapping — proposed, no code yet
| Existing or proposed command | New appearance / rule |
| --- | --- |
| `ask_pay` | Spoken “When do we get paid?” |
| `skip_pay` | Non-spoken “Listen to the work instructions” → common Guther line |
| `ask_trust` | Spoken “And you believe them?” |
| `finish_talk` | Non-spoken “Leave it there” (now also permitted directly after hearing the pay response; minor UI flow improvement) |
| `take_docket` | “Take the council docket” → unchanged Stage 2 state transition |

**Interaction discipline:** No autoplay. Spoken lines remain until the player makes a deliberate choice; for noninteractive continued speech use an explicit user-operated progression control. Do not add a mandatory “Continue” between adjacent sentences spoken together in this draft. The ~1.2-second cadence follows a committed player action, not a self-running script.

## Story/canon invariants
- Guther Anvil is a recurring Smithing Foreman at the generic Smithing workshop in Grand Cylinder City.
- The first council lot is ordinary worker-plate marking. First task yields 0 coins, 0 ordinary XP and no inventory addition; regular repeatable jobs still pay.
- Every origin retains the universal starter kit. Millhand has +3 Craftsmanship from character creation, four attributes at 5 and maximum Health 50.
- No worker serial, date, council crime mastermind, personal history, new faction or new district is invented here.
- Stage 3 reveals the Missing Stamp only **after** Stage 2 work concludes; this draft contains no clue about deaths or recent inspection marks.
- Revised dialogue is **not** canonical until owner review, and source tests need updating only when implementation is expressly approved.

## Editorial note
This is not an attempt to make every line darkly quotable. Most of the language is ordinary labour speech. The pressure resides in whose wages are conditional and who is empowered to decide. The atmosphere belongs mainly in the opening observation, not Guther's mouth.
