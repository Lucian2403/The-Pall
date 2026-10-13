# Millhand — Starting Location and Opening Tutorial

**Status: Partially locked (2026-10-13).** Only Millhand has been specified in this detail. Other backgrounds will be addressed individually, not assumed from these choices.

## Locked setup

- **Background:** Millhand, associated Major Skill **Craftsmanship +3 levels** at creation. All four attributes STR / DEX / INT / RES start at 5, Health maximum starts at 50.
- **Portrait:** one of the two hardcoded **Millhand Male / Millhand Female** portraits, as chosen in character creation. Equipment overlays may change what appears.
- **Starting location:** a **noisy Smithing workshop in Grand Cylinder City**. This same workshop is the **generic hub for all Smithing jobs**, not a one-use tutorial backdrop. Its exact in-world name, layout and neighborhood are TBD.
- **First interaction:** **talk to the recurring Smithing job NPC** at the workshop. This NPC is the regular Smithing-work giver and pays coins and relevant job XP when the job is completed, including tutorial work. NPC name, appearance, pay formula and precise XP figures are TBD.
- **Starting inventory:** **Worker Clothes**, **the cheapest available Bag**, **20 coins**. These item labels are role descriptions only until the equipment/items sheet defines exact item IDs, quality, weights, capacity, protections and durability. No extra unique origin loot is required.
- **Introductory tutorial:** one short, **self-contained end-to-end (E2E) Millhand quest**. Its completion **reveals rent coming due** as a shared practical pressure, **not the beginning of the game's overarching main storyline**. The character already belongs to this world; dialogue introduces lore to the player without amnesia/exposition.
- **LOCKED tutorial interaction order:** first perform the **same generic Smithing job phases and interaction modules used in ordinary Smithing work**; **only after those normal interactions**, inject the **one-time background-specific event**; then resolve the job, award coins/XP, and reveal that rent is due. The tutorial event must not substitute for general Smithing gameplay. Target a short opening of roughly 2–5 minutes and do not create a passive waiting task.

## The Missing Stamp — approved premise, self-contained quest; branch design in review

The Smithing foreman gives the player ordinary piecework on identification plates for a municipal labour contract. During normal workshop work, the player inspects a plate, chooses a reasonable technique/tool, and resolves a normal Smithing complication. These should be **reusable interaction templates** also available in regular Smithing jobs, not bespoke tutorial-only minigames.

**After** the generic interaction sequence resolves, the tutorial-only event fires: the plate's identifying mark belongs to a worker officially recorded as deceased in a locked-door workshop fire, but the inspection mark is fresh. The contradiction gives this **one job** a grim, distinctive turn. Its short story should be understandable and concluded within the tutorial; it must not secretly function as chapter one of the main campaign. What actually caused the contradiction is still to be decided.

### Playable event order

1. **Talk to the recurring foreman** and accept this ordinary low-tier Smithing contract; pay/time/requirements visible.
2. **Regular preparation** — inspect the workpiece and choose work method or suitable tools from general Smithing interactions.
3. **Regular job interaction** — resolve the same type of inspection, technique or risk/reward decision found in normal Smithing work. The system applies ordinary quality, time, resource and condition rules; ensure inexperienced characters can resolve it.
4. **Tutorial-only interruption** — discovery of the contradictory identification plate. This must follow the normal interaction(s); event is guaranteed exactly once for a Millhand's first tutorial and never used as a random regular Smithing event.
5. **Choose one of three responses** (below), then close out the contract.
6. **Common resolution** — foreman pays ordinary Smithing coins and XP (exact values TBD), the brief Millhand job/quest is marked **complete**, and the character receives news that rent is coming due. This is a shared early economic hook, **not the main story kickoff**; rent amount, deadline and penalties remain TBD.

Real-time job rules apply: interaction timers do not pause while a decision is read, but job completion waits for mandatory responses. Normal mandatory prompts appear early enough that the player need not babysit a countdown.

### Tutorial-only response branches — PROPOSED, not yet locked

**Design requirement:** This is a short, complete tutorial quest, not an ongoing conspiracy investigation. Branches may deliver different immediate dialogue, tone and insight. **Do not promise delayed payoffs, persistent guilt, special jobs, major reputation changes or future investigation arcs unless a later playable scene is explicitly authored and approved.**

| Choice | Immediate reaction and local payoff | Quest state |
| --- | --- | --- |
| **Restamp it** | The player finishes without asking questions. The foreman accepts the plate, perhaps with a revealing remark about how the city counts its workers. Whether the player knowingly participated in fraud is **left undecided**, not an established character fact. | Standard wage and XP; quest complete |
| **Question the foreman** | He gives an uncomfortable answer that reveals something specific about workshop hierarchy, contracts or bookkeeping, without opening an extra quest chain. His attitude in this conversation changes, but regular Smithing work remains available. | Standard wage and XP; quest complete |
| **Record the number** | The player quietly preserves the contradictory number as a **completed-quest journal note**, not as a physical item or automatic promise of a future investigation. | Standard wage and XP; quest complete |

**Fairness guardrail:** All routes close the task, pay ordinary wages and XP, and trigger the separate rent notice. Choices should feel distinct in the scene itself; their impact need not stretch across the game. The specific wording and end-of-quest explanation of the number are still to be authored.

**Conditional future possibility, NOT locked:** If a later, fully designed quest deliberately uses the forged plate, the **Restamp it** player might face evidence of their own participation. Without that designed payoff, **do not add a permanent complicity flag or frame this as a consequential fraud choice**.

**Twist design direction:** A harsh suggestion of falsified labour records, identity reuse or callous contractor practice can serve the self-contained grim atmosphere. The larger truth and whether there is anything to investigate later are not canon yet.

### Data/engine requirements

- Regular Smithing job definition, reusable preparation and interaction templates, standard payment/XP resolution and generic Smithing job NPC.
- Separate tutorial event definition with `trigger: background=millhand, tutorial_state=normal_interactions_resolved, not_seen_before`.
- Persist quest completion and the chosen response only if needed for the quest log or immediate dialogue consistency; a completed-quest journal entry is fine. **Do not implement durable fraud/complicity flags or future quest dependencies at this stage.** Once resolved, the scripted event cannot be replayed on future jobs.
- Rejoining the normal outcome should be independent of branch; do not award workshop XP twice, and do not consume an undefined physical proof item.

## Implementation boundaries / remaining work

1. **Review and approve the three immediate branch outcomes**, then give this E2E quest a satisfying local ending. Any future callback or fraud-complicity consequence requires separate approval and content design.
2. Define the generic Smithing workshop, recurring NPC and repeatable low-tier Smithing jobs, including which normal interaction templates are used in this opening.
3. Define exact Worker Clothes and cheapest Bag item records and their equipped/inventory presentation; **20 coins** is the only exact starter-currency figure confirmed so far, for Millhand.
4. Set job pay/XP and timing, and specify the common end-of-tutorial rent notice without imposing unapproved fines or offline deadlines.

