# Optional recurring NPC conversations — editorial proposal 01

**Status: PROPOSED / NOT APPROVED (2026-10-27).** This file defines candidate dialogue and a reusable interaction contract. It does not supersede approved origin dialogue, authorize biography, change game data, or claim implementation. Owner approval is required for any new character-history fact and every spoken line before removing draft markers.

## Why now

The first persistent Millhand platework pass has been playtested through Stage 2. Recurring job-givers must remain people the player can speak with after receiving a job, not dialogue dispensers that vanish once a tutorial starts. The same pattern will be reused in the six origins.

Canonical grounding: [spoken style](dialogue-style-guide.md); [Millhand approved Stage 1](../onboarding/millhand/opening-dialogue.md); [Stage 2 approved script](../onboarding/millhand/stage-2-approved-script.md); [world introduction](../onboarding/world-introduction.md); [Plume lore](../../02-world/the-plume-and-regions.md); [NPC naming policy](../onboarding/npc-dialogue-backlog.md).

## Interaction contract

1. Clicking the visible NPC opens a small, in-scene CRPG conversation. It must remain possible throughout the NPC's available hub scene, including in the middle of Stage 2 work, unless the NPC is physically absent in a later authored scene. This is **not** a new full-screen panel.
2. A selected **spoken** player response is already speech. On click, go **directly to the NPC's reply or consequential narration**. Do not present the player's selected sentence once again as a separate main dialogue beat. Keep it in optional history only. **Physical/work choices** continue to show physical results.
3. Scripted utterances after a selection remain under user-controlled Continue actions. Never skip entire two-person exchanges or auto-advance by timer.
4. Optional small talk is read-only: no work-phase mutation, stage changes, rewards, resource spend, inventory additions, quest completion or surprise journal entries. Opening and closing it does not reset the selected work object or unsaved UI selection. The persisted work state remains authoritative.
5. A small list of four topic families: **Guther / their past**, **the work**, **the city**, **the world beyond**. Topic order and exact number of follow-ups vary by character; NPCs should not all deliver the same four-part lecture. A Return to work option must always be available.
6. Avoid unapproved biographical facts, city districts, numbers, dates, technological explanations, or causation of the Plume. NPC knowledge is partial and situated. Stage 1-2 talk must not foreshadow the Missing Stamp dispute.
7. Approved Stage 1 and eventual Stage 3 plot conversations outrank this optional system. While a conversation is interrupted by optional talk, reopening it returns to the same authored line; quest dialogue does not silently disappear.
8. Distinguish two user interactions: **spoken reply** (choosing an actual line) versus **UI action** (e.g. Return to work). This prevents “Return to work” being displayed as if spoken aloud.

## Guther Anvil — editorial candidate

**Role:** recurring Smithing Foreman. **Available initially:** stages 1 and 2 in the workshop. **Character-history detail in section A is a NEW PROPOSAL, not established canon.** Exact greeting and timing are candidates.

**Click, while work is ongoing:**
- **GUTHER:** “Need something? I've got work here.”
- Choices: “How did you come to run this place?” / “What else do you make here?” / “What do you think of the city?” / “What do you know about the Plume?” / [Return to work].

### A. His background — new biography proposed

- **PLAYER:** “How did you come to run this place?”
- **GUTHER:** “I learned at a bench, same as the rest. Spent a good many years working iron before they put me in charge of other men doing it.”
- Follow-up choice: “Do you miss working at the bench?”
- **GUTHER:** “I still work when I can. Most days I've orders to check and men asking about their wages.”
- [Ask something else] / [Return to work].

**Approval boundary:** learning smithing at a bench, years as a working smith before promotion and occasionally still working are reasonable candidate history, but are **not canon** until approved.

### B. The workshop

- **PLAYER:** “What else do you make here?”
- **GUTHER:** “Repairs, fittings, whatever ironwork comes through. Today it's council plates. I don't get to choose when the inspector comes.”
- Follow-up choice: “Is it always this hard to get paid?”
- **GUTHER:** “Not every job. This lot needs the council's signature, and we haven't got it yet. That's all I can tell you.”
- [Ask something else] / [Return to work].

### C. Grand Cylinder City

- **PLAYER:** “What do you think of the city?”
- **GUTHER:** “There's work here. Foundries, shops, factories. More people after that work than there are places for them, some days.”
- Follow-up choice: “And the Grand Cylinder?”
- **GUTHER:** “It gives the city heat and power. Men work in that place every day. I make ironwork down here. I can't tell you how they run it.”
- [Ask something else] / [Return to work].

**Approval boundary:** Guther's impression that there are sometimes more workers than openings is personal opinion, not a canonical employment statistic.

### D. The Plume and the outside

- **PLAYER:** “What do you know about the Plume?”
- **GUTHER:** “Only what I've heard. The ground broke open, bad fumes and dust spread, and people had to leave their homes. That was long before my time.”
- Follow-up choice: “Does anyone know what caused it?”
- **GUTHER:** “I've heard different answers. I don't know which, if any, is right.”
- Follow-up choice: “What about the land outside the walls?”
- **GUTHER:** “There's protected land beyond the city. Farther out are the Grey Marches. I haven't any work for you out there, if that's what you're after.”
- [Ask something else] / [Return to work].

**Approval boundary:** No explanation of the catastrophe becomes true by NPC declaration; avoid asserting Guther's travels, exposure history or relatives' recollections.

### Stage-sensitive return lines (candidates, not plot progression)

- Before taking the paper: **GUTHER:** “Now, have a look at that work paper.” [Return to Stage 1 where it was interrupted].
- During platework: **GUTHER:** “All right. Back to those plates.” [Resume unchanged Stage 2].
- After returned paper / Stage 3 boundary: **no new optional plot comment**; continue using the approved Stage 3 exchange when implemented.

## Extension to the other five backgrounds

The repository already contains a **draft**, unapproved set of work/city/lore conversations in `platform/apps/web/src/lib/proposed-npc-dialogue.ts` for **Hector D. Smoke, Benny Ben, Claudia Cyka, Ignatius Smog and Erwin Buro**. Preserve those as proposals, not proof of approved lines. Introduce a fourth, individual background/past topic only after confirming the particular character's facts or approving newly proposed history.

- **Hector** speaks as the Dispatch Master. Work is rounds, notices and recorded returns; no fabricated previous command or family history.
- **Benny** is interested in herbs and the remaining natural world; avoid inventing personal adventures beyond protected land.
- **Claudia** is an effective, hard Matron who is conscious of her social leverage; no additional origin story unless approved.
- **Ignatius** runs the scrapyard and has an established dramatic cough and one specific remark about fresh air; do not invent its cause.
- **Erwin** aspires to upper-class manners despite little money; no supposed noble origin, inheritance or private patron.

Each receives distinct, unforced responses—not one interchangeable script with names swapped. The existing three draft topics remain usable review starting points.

### Candidate personal-background topics for the other recurring job-givers

All five replies below are **NEW BIOGRAPHICAL PROPOSALS, NOT CANON**. They are intended to complement the existing three-topic drafts. Their tone and facts require separate owner approval; none should be displayed as established character history yet.

**Hector D. Smoke — Dispatch Master**
- **PLAYER:** “Did you ever run the routes yourself?”
- **HECTOR:** “I carried notices before I was put in charge of sending them. So when a runner says a route takes longer than the clerk allows, I listen.”
- Optional follow-up: “And do you change the time?” / **HECTOR:** “If the runner can show me where he was held up, I'll put it in the book. I won't put down a time he never made.”

**Benny Ben — Herb Dealer**
- **PLAYER:** “How did you get into gathering herbs?”
- **BENNY:** “Started by learning which plants were useful, and which patches would grow back after cutting. There's no sense selling every last root and having nothing next season.”
- Optional follow-up: “Did someone teach you?” / **BENNY:** “Some things I was shown. Others I had to learn by looking properly. You can do harm if you pull up a plant without knowing what it is.”

**Claudia Cyka — Matron**
- **PLAYER:** “Have you been in charge here long?”
- **CLAUDIA:** “Long enough to know exactly what gets left undone when nobody checks. I have patients to examine and staff to keep working.”
- Optional follow-up: “Were you always a matron?” / **CLAUDIA:** “No. And I remember what ward work requires. Now get on with yours.”

**Ignatius Smog — Yard Foreman**
- **PLAYER:** “Have you always worked with scrap?”
- **IGNATIUS:** “I've worked on machines when they could still be used. Now I see what can be taken from them when they're finished. Good metal's still good metal.”
- Optional follow-up: “Would you rather repair them?” / **IGNATIUS:** “If somebody pays for the repair, yes. If they send it here for breaking, I take out what we can use.”

**Erwin Buro — Senior Copy Clerk**
- **PLAYER:** “How did you become the senior clerk?”
- **ERWIN:** “By copying the entries properly and finding mistakes before our books went out. After some years they gave me charge of the other clerks.”
- Optional follow-up: “Was that what you wanted?” / **ERWIN:** “A sound position is worth having. I did hope it might come with a somewhat finer office.”

These topics are intentionally tied to work and authority rather than manufactured revelations. If approved, they should occupy a short conversation branch alongside each character's distinct work, city and lore branches, not a shared biography questionnaire.

## Acceptance checks

- Choosing “How did you come to run this place?” immediately shows Guther's answer without a second player-line screen.
- Clicking Guther during an unresolved bent-plate choice leaves its server phase and all options intact; returning restores the pending action view.
- Stage 2 persists across refresh before and after optional talk. Read-only NPC traffic sends no work-mutation requests.
- A single click can always exit optional talk back to the workshop (without needing to complete the topic).
- No Stage 3 evidence, worker number, inspection dates, cause of the Plume or new NPC biography is unintentionally treated as approved.
- Existing approved Stage 1 lines and the Stage 2 poor-mark recovery are unchanged.

**Next editorial gate:** owner reviews Guther's actual spoken lines and the proposed backstory. Only then replace the draft dialogue for him and extend the same standard to other recurring NPCs.
