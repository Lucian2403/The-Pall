# Bellrunner — Shift Dispatch courier work (Stage 2)

**Owner-approved Stage 2 narrative revision: 2026-11-09.** This
supersedes the redundant bundle-check, sorting and separate "Make
deliveries" panels of the initial implementation. It keeps the
established Bellrunner quest, honest receiving-mark incident,
idempotent work records and sealed-notice handoff.

## Work and boundaries

The ordinary Dispatch House courier assignment is the first example
of the future repeatable **Industry / Hauling** job family. Stage 1
Hector conversation ends with **Take the round**. That acceptance
commits Stage 2 exactly once and immediately offers a road choice.
No redundant second "check the round" or sorting button appears.

Quantified travel time, reputation currency, total wages and the
possibility of theft/bandit encounters on a shorter route are planned
for ordinary Hauling jobs **after the tutorials**. Here both roads
have only scripted RP and a saved route choice. Do not simulate or
invent numerical costs, combat, hidden reputation or wages. The
tutorial round gives zero coins, ordinary XP and loot; its disputed
payment is explained only by Stage 3. The universal starter
equipment, bag, coins, and Industry +3 remain unchanged.

## Choose the road

The route sheet offers two paths that reach the same routine
receiving desk. Labels visible to the player are **Take the Short
Route** and **Take the Long Route**. The stable saved internal keys
remain `direct` and `quieter` to preserve existing character data.

### After selecting: Take the Short Route

I slip through the back streets behind the freight yards. Saves me a good bit of walking, though these alleys aren't exactly pleasant.

Tight corners, barely room for two men to pass. And there's always some bastard looking for an easy bag to snatch.

Better keep moving. Got enough trouble without losing the council's papers.

### After selecting: Take the Long Route

I stick to the main roads. Takes longer, sure, but there's people about, carts passing, and enough light to see where I'm going.

Trouble is, half the city's out here. Carts blocking the way, workers crossing everywhere. Hard to get anywhere quickly.

Still, I'd rather lose a little time than have someone make off with my notices.

**Action:** Continue to the delivery. This is the one deliberate
narrative step after choosing a route, not a duplicate "Start the
journey?" confirmation. It takes the player to the same routine
receiving incident, independent of road choice.

## Receiving desk: a spoiled mark

*After completing the routine stops, you reach another receiving
desk. The clerk takes the council notice, checks its heading and
presses a receiving mark onto your route sheet.*

*The ink smears across two lines as the clerk slides the paper back.*

**Receiver:**

"There. That's yours."

"Ah, damn it. Ink's gone everywhere. Well, you've seen me take the notice."

**Choice:** Ask for a fresh mark / Check their receiving book /
Note the spoiled mark and go on.

The player must know where they are and what went wrong before
making that choice. No named clerk, fabricated street address,
compulsory fight or missing inventory is involved.

### Ask for a fresh mark

**You:** "That mark's no good. Mind putting another one beside it?"

**Receiver:** "Aye, give it here. Ink's still wet, that's all. Hold it steady this time."

*The clerk makes a second, clear mark. You check the address against
the route sheet before putting it away.*

**Recorded proof:** `clear`. Future paid jobs may spend more time
here, but the tutorial does not calculate a cost.

### Check their receiving book

**You:** "Could I see your receiving book? Need something to confirm the delivery."

**Receiver:** "It's here. Look under today's entries. My name's beside the notice."

*You find the entry and compare its details with your route sheet.
The record matches.*

**You:** "Right. I'll note the book entry beside the spoiled mark."

**Recorded proof:** `book_confirmed`. The entry matches in this
scripted teaching encounter; do not introduce an unsupported
extra success roll or another redundant confirmation button.

### Note the spoiled mark and go on

**You:** "I'll note the delivery myself. Just need your name for the sheet."

**Receiver:** "Fair enough. It's on the desk ledger. And don't go writing that I refused it. I took the bloody thing."

*You record the recipient and note that the receiving mark was
unclear. The notice was delivered, but Hector will have to make do
with your written account.*

**Recorded proof:** `noted_unclear`. No faked mark or punitive
tutorial reputation adjustment.

## Interaction and persistence contract

After one of the three choices, the game saves its receipt proof
and enters a two-beat RP exchange:

1. **Player's spoken line** — Continue.
2. **Receiver's response and narrated consequence** — Continue to
   the round report. The receiving-book branch additionally shows
   the player's concluding notation in that second panel.

Only then does **The round report** show the saved road and receipt
condition; no fake duration or sorting score appears. **Finish the
ordinary circuit** presents the final sealed council order.
**Take the final notice** saves the handoff boundary; it does *not*
silently advance to the unimplemented Stage 3. The sealed document
stays unread until the Wrong Bell scene actually exists.

The current work phases are `issued` (route choice), `checked`
(legacy route choice), `road_chosen` (first-person journey),
`spoiled_mark` (receiver incident), `receiver_reply` (player line),
`receiver_result` (receiver line and consequence),
`round_report`, `final_notice`, and `final_notice_taken`.
`book_checked` remains supported for previously saved rounds,
but new players selecting the receiving book go directly to RP.
Previous `sort_notices` and `check_round` API actions remain
accepted only for older in-flight clients; no new UI offers those
actions. Existing receipt values and internal route keys are not
rewritten or discarded.

All state transitions run through authenticated,
owner-scoped, phase-checked, revision-checked and idempotent
`/api/characters/:id/bellrunner/dispatch/work` commands.
Narrative choices persist across refresh, logout, server restart
and developer rewind/replay. No migration beyond the already
installed `0014` and `0015` schema is needed for this revision.

Future hauling jobs may use clock time, road risk, weather,
congestion, thievery, combat, wages and reputation. Those features
must be implemented and balanced separately, not implied by
the current tutorial roleplay.

Related: [Bellrunner overview](README.md),
[Hector opening](opening-dialogue.md),
[implementation](stage-1-implementation.md),
[Jobs and Time](../../jobs/jobs-and-time.md).
