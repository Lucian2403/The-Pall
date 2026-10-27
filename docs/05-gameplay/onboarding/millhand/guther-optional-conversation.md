# Guther Anvil — Optional workshop conversations

**Status: OWNER-APPROVED SPOKEN TEXT (2026-10-27).** Replaces earlier proposed Guther optional-dialogue wording. The lines below are reproduced exactly as provided by the owner; do not silently correct or soften his speech. These optional conversations supplement, but do not replace, the already approved Stage 1 opening or Stage 3 Missing Stamp dialogue.

**Location:** Grand Cylinder City — smithing workshop. **Speaker:** Guther Anvil, Smithing Foreman. **Availability:** clickable during the current Stage 1 introduction and Stage 2 platework. The final permanent hub NPC availability after onboarding is a separate future integration.

## 1. His position at the workshop

**PLAYER:** “How did you come to run this place?”

**GUTHER:** “Ha! Do you think I run this place? This isn't my smithing, you dumbass. I just supervise here so that the decided share it's achieved.”

**PLAYER:** “Who is deciding that?”

**GUTHER:** “This is beyond you. Go back to your work!”

**PLAYER:** “You think I can't understand what's beyond me?”

**GUTHER:** “I don't care what you think. Your opinion is small stone, beside the Cylinder. Let's work now.”

## 2. Grand Cylinder City

**PLAYER:** “What do you think of the City?”

**GUTHER:** “There's work here. Foundries, shops, factories. But it's not enough for all the people that are trying to survive. So, be thankful that you have a job.”

**PLAYER:** “And the Grand Cylinder?”

**GUTHER:** “What about it? It gives the city heat and power, you know that. Men work in that place every day. I can't tell you how they run it.”

**PLAYER:** “The whole Cylinder is just for heat and power?”

**GUTHER:** “Just for? Do you know how big this City is? The whole energy system that powers all this machines, lights, industries are located in the Cylinder. That's a lot of people and process to handle.”

## 3. The Plume

**PLAYER:** “What do you know about the Plume?”

**GUTHER:** “Only what I've heard. The ground broke open, bad fumes and dust spread, and people had to leave their homes. That was long before my time.”

**PLAYER:** “And you believe that?”

**GUTHER:** “Eh... That's a hard one to believe, to be honest with you. But I don't know any other story, so... what's done, it's done. Now we live in it.”

**PLAYER:** “Does anyone know what caused it?”

**GUTHER:** “I've heard different answers. I don't know which, if any, is right.”

## 4. Other smithing work

**PLAYER:** “What else do you make here?”

**GUTHER:** “Why? You don't have enough work? We do here repairs, fittings, whatever ironwork comes through. Today it's council plates. I don't get to choose when the inspector comes.”

**PLAYER:** “Is it always this hard to get paid?”

**GUTHER:** “Not every job. This lot needs the council's signature, and we haven't got it yet. That's all I can tell you.”

## Gameplay and canonical boundaries

- Guther is **not the owner of the workshop**. He says he is a supervisor; he does not identify who actually makes the decisions. Do not invent the proprietor, employer, share scheme or governance from this exchange.
- His statements about the city's work shortages, the Grand Cylinder's infrastructure and the Plume are **his in-character words**. His doubts about the Plume's account do not establish an alternative cause.
- The player's chosen spoken line is the action of speaking it. Immediately display the corresponding Guther reply, **not a second isolated player speech beat**.
- Each follow-up is a separately clicked line. No autoplay. At every topic menu and after **every** Guther reply (including the final reply), the player can choose **“Enough talk. Let's work.”** to stop speaking immediately; no second screen repeats that player line. `Ask something else` remains available to continue exploring optional topics.
- During Stage 1 the same player response is shown on every dialogue beat, including the opening narration and wage exchange. Selecting it skips directly to the **Take the work paper** handoff UI; it does not send the handoff itself. The player must still choose to take the paper and save the transition. During Stage 2 the response closes optional talk and restores the current platework phase and any selected object.
- The same small CRPG-style dialogue popup remains in the workshop scene; it must not open a separate conversation screen.
- Optional dialogue changes **no** tutorial stage, work step, quest flags, item selection, payout, inventory, stamina, experience, or server revision. Closing the conversation restores the same work controls. Dialogue remains readable if Stage 2 is paused at an unresolved bent-plate branch.
- Stage 1 approved dialogue and Stage 3 discovery retain their own authored lines. Stage 3 evidence and event details do not bleed into optional Stage 1-2 discussion.
- User-authored emphatic expressions and rough grammar are intentional source text. Do not mechanically apply the general no-metaphor/no-strong-language writing preference to override these specifically approved utterances.
- **The other five origins are deferred.** Their job-giver optional conversations will be written afresh when each background is tackled. None of the earlier draft biographies or proposed wording for them is approved by this decision.

**Implementation source:** `platform/apps/web/src/lib/approved-guther-optional.ts`. The shared presentation is `platform/apps/web/src/lib/NpcConversation.svelte`.
