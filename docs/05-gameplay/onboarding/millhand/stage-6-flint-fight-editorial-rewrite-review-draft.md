# Millhand — Stage 6: The Fight with Flint — Editorial Revision 02

**STATUS: APPROVED EDITORIAL CANON — STAGE 6 REVISION 02 (2026-10-23).** The project owner approved the encounter framing and personal Journal revision. **Not yet integrated into the playable Millhand build.** This rewrite covers only the **encounter opening, post-fight story, and personal Journal**. The already-approved standalone combat log and combat v0.5.1 system—including every combat-event message, turn record, move name, telegraph, damage result, opponent behaviour and test—are **out of scope and must not change**. The inherited [Stage 6 encounter contract](flint-fight.md) remains mechanically authoritative. No new combat rules, numeric values or scripted hit are proposed.

## Editorial correction requested by the owner

The old Stage 6 draft tried to write alternative combat-log text. That was wrong: **the combat log has already been defined and approved as a separate system.** The script must use its existing event messages exactly; this editorial exercise does not touch them. Only prose outside the log and the first-person personal Journal are candidates for review.

The other defect was the Journal entry, which read like a report: “I defeated Flint and got past him. He did not collect the contractor's charge.” The character's own recollection should have uncertainty, relief, annoyance and an irregular spoken rhythm. It must still report the actual winner and avoid claiming specific wounds or hits that never occurred.

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

## Scene 6B — The approved combat system (UNMODIFIED)

**No newly authored combat actions, log lines, telegraphs, hit/miss descriptions, guard outcomes, turn-control messages or engine rules in this Stage 6 editorial draft.** The entire combat exchange uses the pre-existing approved combat log, UI and rules without alteration. Neither the personal Journal nor this scene's noncombat framing replaces that system or tries to replay its chronology. The encounter outcome supplied by combat determines which of the two following story scenes becomes available.

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

## Journal — a personal recollection (Revision 02)

The character writes this in **first person after the fight**, not in the middle of the combat log. A journal may be tired, surprised, sarcastic or embarrassed. It is not required to sound like an official report. Any broad comment about Flint's reputation is the **character's personal impression** inspired by the owner's example; it is **not** new proof that every citizen of Grand Cylinder City knows Flint. This wording remains reviewable.

**On encounter entry:**

*Flint blocked the way home with his club. I told him to move. He wouldn't. So we fought.*

**Victory — for a difficult or frightening fight (the owner's preferred emotional direction):**

*I beat Flint and got past him. That was tough. For a moment I didn't think I'd manage it, not with that club of his. Everybody knows how hard he is to beat. Well, he didn't get a coin out of me. And after all that, the council still hasn't paid us for those plates.*

**Victory — if the actual fight went comparatively well:**

*I beat Flint and got past him. That club could've done some damage, but I managed to keep him off me. He didn't get a coin out of me. The council still owes us for the plates, of course.*

Use the first text only when a **difficult-fight condition already supported by recorded combat results** exists; do not invent a new numeric “difficulty score” or assert a near-defeat if the player won without trouble. The second line is safer after a clear win; it also must not suggest Flint withdrew if he was actually knocked down. If that qualification cannot be grounded yet, keep one non-specific account rather than pretend the game assessed the player's emotions mechanically.

**Defeat:**

*Flint beat me. Damn it. I thought I could get past him, but I couldn't. Other workers came when they heard the fight, and he left without taking my money. One of them helped me get to medical care. Still not a coin from the council for those plates. A fine day I've had.*

**Only if actual Health or injury data warrants it:** A later Journal note may mention real pain, wounds or a serious hit, but **do not invent** broken bones, cuts, bleeding, loss of consciousness, lowered Health or a particular combat move. Nor should a player who lost be described as the winner.

**Route knowledge:** The selected Stage 4 evidence remains recorded in that route's Journal. Do not reveal other branches. The final defeat/victory state is saved for any future Flint encounter, but there is no authored return quest yet.

## Continuity and acceptance requirements

- **No new Flint speech after Stage 5's “No.”**
- Three Stage 5 entry postures must be visibly distinct *and* genuinely reflected in the combat system; their exact mechanical modifiers are not invented in a narrative document.
- One human opponent, real turn-based combat, rational opponent behaviour, a fair victory route and a defeat-safe recovery path; no forced miss, scripted blow, scripted fatigue or automatic victory.
- Persist **player victory vs defeat** in canonical saves for possible future dialogue. No actual future encounter is created or promised here.
- **Never revise or replace the existing approved combat log.** Maintain original action/event text, Health/stamina/fatigue rules and combat v0.5.1 baseline. The fight is **not yet integrated** into the available Millhand Stage 1–4 playable archive.
- No money, loot, XP or additional Major Skills granted; Flint cannot take the 20 coins needed to pay the Stage 7 clinic.
- Both outcomes reach the clinic and, after Stage 7, the shared home/rent scene; those scenes remain separately approved and under future editorial review.
- No personification or false factual knowledge in dialogue, scene narration or the Journal. The character's first-person diary may include their own doubts, annoyance, relief and candid remarks; keep the language accessible to non-native English readers.
- This document is a **review draft**, not approval or completed implementation.

