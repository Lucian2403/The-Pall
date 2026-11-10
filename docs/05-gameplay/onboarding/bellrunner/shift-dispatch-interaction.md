# Bellrunner — Shift Dispatch courier work (Stage 2)

**Owner-approved Stage 2 narrative revision: 2026-11-09.** This
supersedes the redundant bundle-check, sorting and separate "Make
deliveries" panels of the initial implementation. It keeps the
established Bellrunner quest, honest receiving-mark incident,
idempotent work records and sealed-notice handoff.

## Work and boundaries

The ordinary Dispatch House courier assignment is the first example
of the future repeatable **Industry / Hauling** job family. Stage 1
Hector's conversation ends at **Take the Route Sheet**. Clicking the
Route Sheet object on the Depot counter, rather than another dialogue
button, commits Stage 2 exactly once and immediately offers a road choice.
No redundant second "check the round" or sorting button appears.

Quantified travel time, reputation currency, total wages and the
possibility of theft/bandit encounters on a shorter route are planned
for ordinary Hauling jobs **after the tutorials**. Here both roads
have only scripted RP and a saved route choice. Do not simulate or
invent numerical costs, combat, hidden reputation or wages. The
tutorial round gives zero coins, ordinary XP and loot; its disputed
payment is explained only by Stage 3. The universal starter
equipment, bag, coins, and Industry +3 remain unchanged.

## Painted locations and reusable Hauling props

The courier now travels through **three different real scenes**, using
the owner-supplied location backgrounds rather than remaining at Hector's
counter throughout the delivery. Scenes are selected from shared
`apps/web/src/lib/hauling-scenes.ts`, not hard-coded Bellrunner-only
display URLs:

- **Dispatch House:** the existing depot artwork, Hector and all issued
  papers. Here the player accepts the round and selects a road. Existing
  Depot ambience is only active while this location is visible.
- **Short Route:** `/locations/hauling/freight-yard-backstreet.webp`
  illustrates the industrial backstreets during the owner's exact
  first-person journey monologue.
- **Long Route:** `/locations/hauling/grand-cylinder-main-street.webp`
  illustrates carts and crowds along the main roads. Short and Long
  remain aliases of saved `direct` and `quieter` work values.
- **Receiving Desk:** `/locations/hauling/municipal-receiving-desk.webp`
  is a **shared Hauling destination background**, including future
  paid deliveries. The receiver speaks through the existing framed
  text dialogue; no character portrait or Receiver NPC sprite is
  required or generated.

**Receiving Desk is dialogue-only.** This tutorial does not overlay
any floating paper cutouts, framed object labels or clickable hotspots
on the destination painting. The receiver remains an off-screen speaker;
all actions, including **Check their receiving book** and taking the
final sealed order, are offered in the parchment dialogue. The ledger
painted into the background is scenery, not an extra click target.

The existing `HaulingReceivingBookHotspot.svelte` and painting-coordinate
metadata remain as unused reusable library resources for possible future
dynamic Hauling or record-verification jobs. They are **not mounted in
this tutorial's Receiving Desk**. The painting and its bottom counter
remain fully visible on wide monitors. The player's starting Route
Sheet object in Stage 1 is the deliberate interactive prop that accepts
the round, unlike the static destination setting.

## Immersive Hector workstation and reusable document cards (PR #46)

At desktop widths the Bellrunner UI is organized around **what the
player can act upon**, not around an oversized backdrop. Both stages
use the shared **scene** mode of `ActivityLayout.svelte`
([Game shell and activity layouts](../../../07-technology/game-shell-and-activity-layouts.md)).
When the activity container is at least 880px wide, the illustrated
workstation is on the left. The nine-slice parchment dialogue and, at
the Depot, the document tray share the reading column on the right.

At the Dispatch House, Hector and his clickable nameplate fill the
illustration. The three owner-supplied job items are in a framed
**Round Documents** tray directly below the dialogue in the reading
column: Council Notices, Sealed Council Order and Route Sheet. Each
card combines the full cutout, framed caption and action label into
one accessible button. Inspecting an item updates the adjoining
parchment. The Route Sheet changes from Inspect to **Take Route
Sheet** only at the canonical Stage 1 handoff, when clicking it
executes the existing idempotent `take_round` command. No extra
Review Route button duplicates that object-driven progression.

The reading column holds the **owner-approved nine-slice parchment**,
sized to its content. It has more spacious narration, larger legible
speech, native metal-framed buttons and a bottom Previous line control
in Stage 1. The progress choice uses the existing highlighted button
state. Equal RP choices (short/long road, three receipt remedies and
Hector's optional questions) intentionally remain visually equal; the
tutorial does not secretly reward a purportedly correct answer.

In Stage 2, the Depot reuses the same Hector-and-paper workstation.
Once travelling, the illustration shows the selected Short/Long
street artwork only; at the Municipal Receiving Desk, it shows
the office artwork only. **No Receiver sprite, floating task paper,
separate book hotspot or unnecessary props are generated.** The
action sequence, receipt proof and all previously approved text
remain in the parchment dialogue. Backgrounds keep their full
source aspect ratio and never overlap the parchment.

The **Grand Cylinder City panorama and title remain visible above
the stage header** on both Bellrunner stages, using the same artwork
as elsewhere in the introduction. It was mistakenly hidden to save
screen height in an earlier iteration; this was rejected. Every
scene now uses one version of that banner (88–136px), which
also carries the City map gateway (locked during the introduction).
The workstation is sized from the measured space below it so that
Hector, the parchment and its first choice share the first screen.

The reference's secondary choice treatment is also implemented:
pale parchment-like buttons, dark carved edges and restrained
line-icons (conversation, route, receipt, book, back). The Continue
buttons have a contrasting dark brass finish. These are visual
states, not mechanical hints: the two roads and three incident
options retain equal prominence. Keyboard focus, disabled state,
hover and reduced-motion support are preserved; other jobs'
button styles are not modified.

When the activity container is narrower than 880px (tablets and
phones, or a narrow window with a dock), the order is illustration →
dialogue → documents. There are no forced scrollbars *inside* the
parchment; the page scrolls normally if content cannot fit above the
fold.

Reusable code: `ActivityLayout.svelte`, `BellrunnerDocumentTray.svelte`,
`pall-story-landscape.css` and the existing owner frame/button kit.
Gameplay, loot, money, progression, SFX, migrations and art binaries
remain unchanged.

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

**Step 1 — Arrival narration:** Display only the two narrative paragraphs above, with one **Continue** button. This avoids crowding the parchment frame and gives the player time to understand what happened.

**Step 2 — Receiver conversation:**

**Receiver:**

"There. That's yours."

"Ah, damn it. Ink's gone everywhere. Well, you've seen me take the notice."

Only here display **Ask for a fresh mark / Check their receiving book /
Note the spoiled mark and go on**.

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

The delivery incident is saved as two distinct phases:
`receiving_arrival` displays the spoiled-mark narration and
**Continue**; `spoiled_mark` then displays the receiver's two lines
and three choices. The player cannot select a receipt response before
the Continue action is committed.

After making a choice, the server saves the receipt proof and enters
two more RP beats:

1. **Player's spoken line** — Continue.
2. **Receiver's response and narrated consequence** — Continue to the
   final notice. The receiving-book branch additionally shows the
   player's concluding notation in the second beat.

The previous compulsory **round report** added no new narrative event
or mechanical consequence; route and receipt were already saved and
visible. It has been removed from the normal tutorial progression.
When repeatable paid Hauling is implemented, a real work ledger may
show actual travel time, wages and reputation outcomes. Do not display
a mandatory empty audit in this introductory story.

**The final notice** presents the last sealed council order, which
is still unread. After **Take the final notice**, the completion panel
uses this exact owner-revised text:

> The usual deliveries are done, and the receiving marks are recorded.
>
> One sealed council order remains. It still needs to be delivered to the address marked on the route sheet.

No silent Stage 3 progression occurs before *The Wrong Bell* exists.

The saved work phases are `issued` (route choice), `checked`
(legacy route choice), `road_chosen` (journey), `receiving_arrival`
(new incident narration), `spoiled_mark` (receiver's lines and
choices), `receiver_reply` (player line), `receiver_result`
(receiver line and result), `final_notice` and
`final_notice_taken`. Existing `book_checked` and `round_report`
states can still finish safely, but the new flow never enters them.
Older API action `continue_to_report` resolves to the final notice
rather than recreating the removed report screen. Request receipts
and recorded route/proof values remain intact across updates.

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
