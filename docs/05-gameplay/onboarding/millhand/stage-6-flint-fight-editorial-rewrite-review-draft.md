# Millhand — Stage 6: The Fight with Flint — Editorial Revision 01

**STATUS: WRITING / PRESENTATION PROPOSAL — NOT APPROVED OR INTEGRATED INTO THE PLAYABLE MILLHAND BUILD (2026-10-22).** This rewrite proposes scene narration, interface feedback, health/consequence language, local result text, harmless observations and factual journal entries. The inherited [Stage 6 combat encounter](flint-fight.md) and the existing independently tested combat v0.5.1 rules remain the mechanical authorities. No combat attributes, numbers, effects, target probabilities, AI behaviour or scripted hit are newly approved here.

## Editorial diagnosis

1. **“Flint grips his club and comes forward”** is factually fine but gives little information for the first combat decision. Describe an actual visible preparation for an attack when the combat engine exposes it, without manufacturing a guaranteed enemy miss.
2. Older combat prototype event logs are too technical as primary prose. The player should see the current threat, action results and Health/Stamina data in a readable interface, with mechanical logs available separately if useful.
3. Do not narrate a “successful guard”, a “clean hit” or a player “outmanoeuvring” Flint when the combat engine reports a miss, a blocked attack or a different outcome. Every combat sentence must follow actual committed results.
4. Victory and defeat require two genuinely different short endings. Neither can be flattened into “encounter complete”, and losing must never be falsely described as making Flint surrender.
5. The previous healing transition raised an unresolved edge case: a character who takes no damage must not acquire a fabricated injury. The already approved clinic stage still charges **10 coins for examination** even if there is no condition to treat. Do not introduce a wound merely to justify the fee.

## Scene 6A — The passage

**Entry:** Immediately after the selected Stage 5 stance. Flint's last line is **“No.”** Do not add extra pre-fight speech or a new player choice before the real combat opens.

*Flint raises the short club and moves toward you. The passage is narrow. The work cart is still where it stood when he blocked your way.*

**Opponent label:** Flint — Contractor's Collector

**Encounter heading:** The passage

**UI information:** Show the true player and opponent state supplied by the combat engine, including Health and the resources currently used in combat. Do not invent a Flint level, a fake “recommended” strike or false numeric values.

**Initial position, determined by the selected Stage 5 choice:**

- **Brace and defend:** *You raise your arms and brace yourself as Flint approaches.*
- **Keep moving:** *You move along the side of the passage, looking for space to get past Flint.*
- **Use the cart as cover:** *You begin the fight with the work cart between you and Flint.*

These lines describe the selected intention/position. The combat engine must actually support a corresponding guard, movement/initiative or cover distinction before displaying a specific mechanical bonus. If a posture cannot be represented honestly, mark that aspect as pending implementation; do not falsely claim that it reduced damage.

## Scene 6B — Combat actions and visible intent

**If the engine signals Flint is preparing a heavy strike:**
*Flint draws his arm back and raises the club for a hard swing.*

**Instruction:** Choose what to do before Flint strikes.

The actual available legal action set comes from the combat engine. The names below are human-readable examples of its already-established action families, **not newly authorised combat moves or free equipment**:

- **Attack:** Strike at Flint.
- **Guard:** Protect yourself from his next attack.
- **Move / change position:** Try to put more space between you and Flint.

No correct-action glow, forced “tutorial guard”, hidden reaction timer or automatic strike. The threat may be read from Flint's physical preparation, and the player may choose freely.

**Example result text, selected ONLY from real outcomes:**

| Source of committed outcome | Text available to the presentation |
| --- | --- |
| Player attacks and actually hits | “You strike Flint. He loses his footing for a moment.” **Only if the engine or animation confirms loss of footing; otherwise use:** “You hit Flint.” |
| Player attacks and misses | “You swing at Flint and miss.” |
| Player attack is blocked | “Flint stops your strike with his guard.” |
| Player guards; engine reports reduced incoming damage | “You raise your arms and take the blow on your guard.” Then report the true damage or status, if any. |
| Player guards; Flint misses completely | “You keep your guard up. Flint's swing misses you.” |
| Player moves successfully | “You move to the side before Flint reaches you.” Only when supported by the new actual position. |
| Player tries to move but is blocked | “You try to move past Flint, but he is still blocking the way.” |
| Flint's club hits | “Flint hits you with the club.” Pair with true Health or injury changes. |
| Flint swings and misses | “Flint swings the club and misses.” |
| Flint pulls back after a heavy attack | “Flint draws his arm back after the swing.” Do not promise the player a guaranteed free hit; show a recovery opening only if combat state supports it. |
| A visible fatigue/stamina effect occurs | Report the actual stamina/fatigue change in concise mechanical UI, with a literal body observation only if the engine actually supports it. |
| Action is unavailable | “You cannot do that from your current position.” If the real reason is low stamina, unavailable target or a turn rule, show that actual reason. |

**Important:** The conditional lines above are **templates**, not unconditional narrative beats. Avoid assigning invented face wounds, blood, fractures, leg injuries, panic, surrender, club dropping, or lost consciousness. Do not force a dramatic environmental event to guarantee victory. If Flint rationally backs away or yields according to enemy AI, use the actual persisted fight outcome; do not label a defeat a win.

**During every turn:**
- Preserve real choice and player agency. No timed autoplay advancing the combat.
- Show Flint's current visible action preparation when it is genuinely telegraphed. Guard, attack and movement need to be real decisions.
- Apply the 1.2-second post-action reveal staging only for committed choices, without letting it advance the next turn or cause double submissions.
- Show the result in the world/encounter view first; a separate technical history may be available but must not be the only source of information.

## Scene 6C — Victory: Flint withdraws

**Trigger:** The authoritative combat result is **player victory** (including an authorised Flint retreat or surrender outcome, as applicable). No scripted automatic victory.

*Flint steps aside. You wait until there is room to pass, then leave.*

**Encounter result:** You defeated Flint.

**Next action:** Continue to medical care.

*You leave the passage with the Health and injuries you actually have. Flint did not collect the contractor's charge.*

**Variant where Flint was actually knocked down, not withdrawn:**

*Flint is on the ground and cannot stop you. You move past him and leave the passage.*

Only select this variant if the combat outcome supports it. Flint is not killed or looted in either result.

## Scene 6D — Defeat: Workers intervene

**Trigger:** The authoritative combat result is **player defeat**.

*You are knocked down and cannot get past Flint. Voices come from the far end of the passage. Other workers have heard the fight.*

*Other workers enter the passage. Flint looks toward them, then moves away. He leaves without collecting any money.*

*One of the workers comes over and helps you get to a place where you can receive medical care.*

**Encounter result:** Flint defeated you. Other workers interrupted him.

**Next action:** Continue to medical care.

A loss is retained and shown as a loss. No restart, money confiscation, invented constable, named rescuer or forced winning outcome. The narration must not invent a wound type: injuries and current Health are read from the actual fight result.

## Scene 6E — After the fight

Both outcomes lead to the **same approved ordinary clinic visit**, but retain their separate stored battle results. A future encounter with Flint may refer to that stored result only when such a quest is separately written and approved.

**After-fight observation:** Your Health and any injuries remain exactly as recorded by the encounter. You can review your condition before or at the care service.

**Clinic boundary:** The next stage is an examination costing **10 coins**. If genuinely injured, treatment may address the actual condition. If not injured, the clinician can still examine the character and charge the established examination fee. Never silently inflict damage to create a wound and never promise full recovery outside the supported health rules.

**No reward:** There is no coin payment, ordinary XP, Arms XP, loot, new item or skill level from this forced fight. Flint retains his club and paperwork. The starting 20 coins remain available for the clinic fee, yielding 10 coins afterward.

## Read-only or wrong-interaction feedback

These messages must correspond to the actual combat state and must not spend a turn merely because the player inspected something.

| Situation | Player-facing text |
| --- | --- |
| Inspect the cart | “The work cart is beside the passage. You can move around it if the current combat position allows.” |
| Inspect Flint | “Flint has a short club and is blocking the passage.” Only while he is actually blocking it. |
| Open the Journal | Open full Journal immediately; returning keeps the current turn and actor states. |
| Select unavailable combat option | State the real mechanical reason (position, turn, stamina, incapacitation), not a general “Wrong choice.” |
| Attempt to take the club | No loot action exists. Do not present an unavailable inventory item as a clickable reward. |
| Revisit a completed fight | Show the persisted victory or defeat, never rerun the encounter or issue another clinic transition. |

## Journal — factual first-person entries

**On encounter entry:**
*Flint blocked the passage home and threatened me with a short club. We fought.* Only record the actually selected pre-fight stance in the separate Stage 5 entry.

**After victory:**
*I defeated Flint and got past him. He did not collect the contractor's charge. The council has still not paid for the plates.*

**After defeat:**
*Flint defeated me. Other workers interrupted the fight, and he left without collecting money. A worker helped me reach medical care. The council has still not paid for the plates.*

**Health and injuries:** Display actual recorded combat state independently of the prose; avoid fixed statements such as “I suffered a cut” when the engine did not report one. The selected Stage 4 route finding stays in its own journal entry.

## Continuity and acceptance requirements

- **No new Flint speech after Stage 5's “No.”**
- Three Stage 5 entry postures must be visibly distinct *and* genuinely reflected in the combat system; their exact mechanical modifiers are not invented in a narrative document.
- One human opponent, real turn-based combat, rational opponent behaviour, a fair victory route and a defeat-safe recovery path; no forced miss, scripted blow, scripted fatigue or automatic victory.
- Persist **player victory vs defeat** in canonical saves for possible future dialogue. No actual future encounter is created or promised here.
- Maintain original Health/stamina/fatigue rules and combat v0.5.1 baseline. The fight is **not yet integrated** into the available Millhand Stage 1–4 playable archive.
- No money, loot, XP or additional Major Skills granted; Flint cannot take the 20 coins needed to pay the Stage 7 clinic.
- Both outcomes reach the clinic and, after Stage 7, the shared home/rent scene; those scenes remain separately approved and under future editorial review.
- No metaphors, personification, heroic moral commentary or false knowledge added to player dialogue, narration, UI or Journal. Language remains accessible to non-native English readers.
- This document is a **review draft**, not approval or completed implementation.

