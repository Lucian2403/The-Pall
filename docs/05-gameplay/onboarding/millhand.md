# Millhand — Starting Location and Opening Tutorial

**Status: Partially locked (2026-10-13).** Only Millhand has been specified in this detail. Other backgrounds will be addressed individually, not assumed from these choices.

## Locked setup

- **Background:** Millhand, associated Major Skill **Craftsmanship +3 levels** at creation. All four attributes STR / DEX / INT / RES start at 5, Health maximum starts at 50.
- **Portrait:** one of the two hardcoded **Millhand Male / Millhand Female** portraits, as chosen in character creation. Equipment overlays may change what appears.
- **Starting location:** a **noisy Smithing workshop in Grand Cylinder City**. This same workshop is the **generic hub for all Smithing jobs**, not a one-use tutorial backdrop. Its exact in-world name, layout and neighborhood are TBD.
- **First interaction:** **talk to the recurring Smithing job NPC** at the workshop. This NPC is the regular Smithing-work giver and pays coins and relevant job XP when the job is completed, including tutorial work. NPC name, appearance, pay formula and precise XP figures are TBD.
- **Starting inventory:** **Worker Clothes**, **the cheapest available Bag**, **20 coins**. These item labels are role descriptions only until the equipment/items sheet defines exact item IDs, quality, weights, capacity, protections and durability. No extra unique origin loot is required.
- **Introductory tutorial:** one short Millhand-related job/story segment. Its completion **reveals rent coming due**, bringing the player to the shared opening motivation. The character already belongs to this world; dialogue introduces lore to the player without amnesia/exposition.
- **LOCKED tutorial interaction order:** first perform the **same generic Smithing job phases and interaction modules used in ordinary Smithing work**; **only after those normal interactions**, inject the **one-time background-specific event**; then resolve the job, award coins/XP, and reveal that rent is due. The tutorial event must not substitute for general Smithing gameplay. Target a short opening of roughly 2–5 minutes and do not create a passive waiting task.

## The Missing Stamp — approved premise, branch design in review

The Smithing foreman gives the player ordinary piecework on identification plates for a municipal labour contract. During normal workshop work, the player inspects a plate, chooses a reasonable technique/tool, and resolves a normal Smithing complication. These should be **reusable interaction templates** also available in regular Smithing jobs, not bespoke tutorial-only minigames.

**After** the generic interaction sequence resolves, the tutorial-only event fires: the plate's identifying mark belongs to a worker officially recorded as deceased in a locked-door workshop fire, but the inspection mark is fresh. The question is whether this is innocent reuse, tampered paperwork, or something worse. The complete explanation is deliberately unresolved at introduction.

### Playable event order

1. **Talk to the recurring foreman** and accept this ordinary low-tier Smithing contract; pay/time/requirements visible.
2. **Regular preparation** — inspect the workpiece and choose work method or suitable tools from general Smithing interactions.
3. **Regular job interaction** — resolve the same type of inspection, technique or risk/reward decision found in normal Smithing work. The system applies ordinary quality, time, resource and condition rules; ensure inexperienced characters can resolve it.
4. **Tutorial-only interruption** — discovery of the contradictory identification plate. This must follow the normal interaction(s); event is guaranteed exactly once for a Millhand's first tutorial and never used as a random regular Smithing event.
5. **Choose one of three responses** (below), then close out the contract.
6. **Common resolution** — foreman pays ordinary Smithing coins and XP (exact values TBD) and the character receives news that rent is coming due. All routes converge on the shared city opening; rent amount, deadline and penalties remain TBD.

Real-time job rules apply: interaction timers do not pause while a decision is read, but job completion waits for mandatory responses. Normal mandatory prompts appear early enough that the player need not babysit a countdown.

### Tutorial-only response branches — PROPOSED, not yet locked

| Choice | Immediate fiction and outcome | Possible mechanical state | Potential later callback |
| --- | --- | --- | --- |
| **Restamp it** | The player quietly completes the plate without confronting anyone. The foreman treats this as another clean piece of work. | Record `millhand_stamp_choice=restamp`; regular wage/XP, no special clue added. | The workshop may offer an early routine follow-up, or the same mark resurfaces under different circumstances. This is not an exclusive permanent advantage. |
| **Question the foreman** | The player asks why a dead worker's number has a fresh mark. The foreman grows guarded and gives an evasive, potentially revealing answer: the office certified the number, not the worker. | Record `millhand_stamp_choice=question` and `heard_foreman_evasion=true`; normal wage/XP. | An alternate dialogue route to the labour register or foreman's prior knowledge. The foreman continues offering ordinary Smithing work; no opening soft-lock. |
| **Record the number** | The player quietly memorizes or writes down the number and finishes the plate. The foreman does not realize it was noticed. | Record `millhand_stamp_choice=record`; create a **journal clue**, not a new item. Regular wage/XP. | A future records/worker-history check can recognize the saved number, giving the player an evidentiary rather than conversational lead. |

**Fairness guardrail:** All three options always finish the tutorial with ordinary payment, XP and the rent reveal. The choice may affect dialogue, minor access and *how* the clue is pursued, but must not grant a unique permanent item, deny any profession or cut players off from the underlying mystery. Any later callback must be authored before advertising it as a shipped feature.

**Twist design direction:** The opening suggests possible identity reuse, falsified death records or exploitation by labour contractors, but does not yet establish which explanation is canon. The foreman may be complicit, frightened or simply following a bureaucratic order. Avoid revealing the answer in the tutorial.

### Data/engine requirements

- Regular Smithing job definition, reusable preparation and interaction templates, standard payment/XP resolution and generic Smithing job NPC.
- Separate tutorial event definition with `trigger: background=millhand, tutorial_state=normal_interactions_resolved, not_seen_before`.
- Persist the chosen response and optionally a journal clue or a dialogue fact. Once resolved, the scripted event cannot be replayed on future jobs.
- Rejoining the normal outcome should be independent of branch; do not award workshop XP twice, and do not consume an undefined physical proof item.

## Implementation boundaries / remaining work

1. **Review and approve the proposed three branch outcomes**, including whether each deserves a future callback. The core mystery and generic-job-before-tutorial structure are agreed.
2. Define the generic Smithing workshop, recurring NPC and repeatable low-tier Smithing jobs, including which normal interaction templates are used in this opening.
3. Define exact Worker Clothes and cheapest Bag item records and their equipped/inventory presentation; **20 coins** is the only exact starter-currency figure confirmed so far, for Millhand.
4. Set job pay/XP and timing, and specify the common end-of-tutorial rent notice without imposing unapproved fines or offline deadlines.

