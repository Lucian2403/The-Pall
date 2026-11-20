# Stitcher — Stage 5: The Empty Sheet / The Night Door (STORY AND NOVEMBER DIALOGUE APPROVED)

> **Editorial approval — 2026-11-16:** The owner approved this natural-dialogue revision for implementation. Earlier plot, clinical safeguards, evidence, branch skills and zero-wage introductory economy remain unchanged.

**Status: APPROVED AND LOCKED (2026-10-16).** The user approved both pre-combat interactions, their dialogue, player approaches and patient-witness hold. This follows approved [Stage 4](second-task-branches.md) and leads to approved-at-encounter-level [Stage 6](owler-fight.md), the fight with **Owler, the Night Porter**. Exact combat values remain TBD.

## Stage V — journal entries (owner-provided 2026-11-18)

These are first-person entries shown progressively after the corresponding saved event. The three initial investigatory responses and three doorway preparations are **mutually exclusive choices**; only the chosen optional entry appears. Stage IV contributes only the selected proof.

### Returning to the ward

I came back to the side ward, and the man's bed was empty. The sheets were still warm.

For a moment, I thought they'd already taken him. Then an attendant told me he was still on the trolley near the night door.

### The patient's refusal

I found him at the service passage. He was awake and told us again that he wasn't going anywhere. He'd never agreed to the operation.

This time, the attendant heard him too. He promised not to let anyone move the trolley until the matter was settled.

At least someone else is standing up for him now.

### Optional — checked the transfer papers

I checked the transfer papers. Nobody had signed the man over yet. That gives us a little time, though I don't know how much.

### Optional — fetched Claudia

I went to get Claudia. She wasn't happy about the trouble, but she ordered them to leave the trolley where it was.

### Optional — used the Stage IV evidence

**Night Trolley:** I told the attendant what happened at the receiving door. They wanted the man's contract number, and I refused to sign him over.

**Signed Consent:** I told the attendant about the disputed consent form. The clerk had already written down the objection.

**Notes for the Living:** I told the attendant what I'd found in the surgeon's notes. The operation is for teaching, not treatment.

### Meeting Owler

Then Owler turned up at the night door. He'd been paid to take the man to the school, and he wanted the papers.

I told him the patient wasn't going anywhere.

He didn't like that one bit.

### Optional — reasoned with Owler

I tried explaining that the man had refused and that the attendant heard him. Owler didn't care. He'd been paid to finish the job.

### Optional — moved the cart

I pushed an empty ward cart across the doorway. It wasn't much, but at least Owler couldn't walk straight past me.

### Optional — braced at the door

I stood in the doorway to keep Owler from getting through. He's a strong man. This could get ugly.

**Stage V background transition:** The Empty Sheet, investigation and witnessed hold use the infirmary ward artwork. Once Owler appears at the night door, the painting changes to **Infirmary service corridor** (`/locations/stitcher/service-corridor.webp`) and the existing standing Owler sprite appears (`/locations/stitcher/owler.webp`). The defeated sprite is reserved for the later Stage VI outcome; Stage V does not simulate combat or determine its result.

## Interaction I — The Empty Sheet

*The Stitcher returns to the side ward. The bed is empty. Its sheets are still warm, with the straps hanging loose from the frame. A ward attendant is coming back from the service passage.*

**PLAYER:** “Where've they taken him?”

**ATTENDANT:** “Down to the night door. He's still on the trolley in the passage.”

The man is **alive**. Staff have moved him within the hospital, not completed his delivery to the teaching theatre. If the player selected *The Night Trolley*, they recognize the same trolley from its pending handover, not a separate transfer invented for the scene.

The player chooses one ordinary investigatory response:

- **[Check the trolley seal and ward record]** — confirms the transfer is not signed over to the receiver. On the Industry route this uses the exact receiving mark recorded earlier; other routes see only the uncompleted release.
- **[Fetch Claudia]** — brings the Matron from the nearby ward rather than teleporting a remote official; she is furious the commotion has reached the patients. This does not cause her to become kind.
- **[Use what you learned]** — the player tells the attendant **only the fact proven in their Stage 4 branch**:
  - **Industry / Hauling:** “They wanted his contract number, not his name. I didn't sign him over.”
  - **Commerce / Contracts:** “His consent's marked disputed in the ward book.”
  - **Scholarship / Investigation:** “The surgeon's notes say it's for teaching. There's no treatment listed.”

Whichever route the player takes, the attendant accompanies them to the waiting trolley. The patient is awake and speaks in front of them.

**PATIENT:** “I'm not going with them. I never said yes.”

**ATTENDANT:** “I heard you. Nobody moves him until this is sorted.”

The attendant keeps the trolley **inside the ward-side service passage** while the dispute is recorded. This is a limited, believable interruption, not an automatic legal victory or a special skill reward. The three Stage 4 findings remain separate; the patient's own refusal is something everyone in the scene can hear.

Claudia can arrive because the player fetched her **or** because the night door dispute calls for the Matron's authority. Her concern is protecting her ward and avoiding an indefensible handover, rather than newly discovered affection:

**CLAUDIA:** “Leave the trolley where it is. I've got enough trouble without an argument in front of the whole ward.”

A temporary in-house stop is now visibly in place **before combat**. Stage 6 will determine how the player fares against Owler, not whether a silent patient can be carried off while the camera is elsewhere.

## Interaction II — The Night Door

*The trolley stands behind the ward attendant on the infirmary side of the service doorway. Owler blocks the exit, holding the transfer paper. He is worn down from night work, but strong enough to shove past someone.*

**OWLER:** “Give me the papers. I'm here to take him over.”

**PLAYER:** “He's not going anywhere.”

**OWLER:** “I've already been paid to take him.”

### One preparatory response

**[Reason with Owler]**

**PLAYER:** “He said no. The attendant heard him.”

**OWLER:** “Then take it up with the school. I've got a job to finish.”

The player faces him without a barrier; his insistence is motivated by the paid transfer, not secret knowledge of the consent records.

**[Move the empty cart across the doorway]**

*The player pushes an unused supply cart across the narrow approach. The patient remains behind the attendant.*

**OWLER:** “Move that cart.”

This creates a plausible small obstruction to be carried into Stage 6. It is **an empty ward cart**, not the patient's trolley and not a free player weapon.

**[Brace against the door frame]**

*The player takes firmer footing to keep Owler from reaching the ward passage.*

**OWLER:** “Move. I'm not saying it again.”

This establishes close defensive spacing, not an automatic victory.

### Convergence

*Owler tries to push through toward the trolley and the papers. When the player refuses to move, he raises a hand to strike.*

The same **short turn-based PvE fight** starts after any one preparatory response. Owler is a tired porter doing a paid and increasingly disreputable job; he is not secretly the school surgeon, the Matron or a superhuman boss.

His weapon remains **TBD** between the already outlined leather strap and short truncheon; do not introduce another item into the player's starter inventory. Exact player defensive effects depend on global combat implementation.

## Continuity and constraints

- The Stage 5 state records **the Stage 4 route and one proved finding**, the patient's spoken refusal before a witness, the in-house transfer stop, and the chosen doorway preparation.
- Seeing warm sheets is not proof of surgery or death. The transfer is still **interceptable** at the ward-side night door; no patient is handed over by a hidden timer.
- The ward attendant and receiving worker are **unnamed occupational NPCs**. Don't add a conveniently named rescuer, a faction reputation point or an automatic legal precedent.
- Claudia remains harsh, self-protective, and low in empathy. She can object to transfer because the witnesses make it dangerous for the infirmary to ignore, not because she has become sentimental.
- If the player fetched Claudia, she is present earlier; otherwise she joins when the dispute reaches the ward authority. The single shared hold occurs either way.
- Do not grant a second +1 Major Skill, coins, XP, medical supplies or weapons here.
- Stage 6 still has **real victory and defeat outcomes**. The patient will be protected by the witnessed pause and ward staff even if the player is knocked down; *how* that protection becomes final is authored in the next stage.

**Already locked:** two named beats, Owler as the one common opponent, three preparatory approaches in principle, patient's eventual rescue, one route finding and the shared nonlethal PvE rule.

**Approved in Stage 5 (October story approval):** warm-sheet investigation choices, patient/attendant witness hold, Claudia's self-protective intervention, physical doorway blocking and fight handoff. Spoken lines in this branch are a November editorial revision awaiting owner review.

**TBD:** service-passage geometry, true official transfer authority, any exact obstruction/defense modifiers, world clock and combat action data.

Related: [Stitcher overview](README.md), [Stage 3 approved](teaching-bed-discovery.md), [Stage 4 approved](second-task-branches.md), [shared rules](../shared-structure.md).
