# Scrapper — Stage 2: Strip a Condemned Pump (SIMPLIFIED PROPOSAL)

**Status: REVISED PROPOSAL (2026-10-16); NOT LOCKED.** The previous Stage 2 buried an easy hands-on job under technical vocabulary. This rewrite shows the player exactly **what they see, what they remove, why each choice matters, and what finishing the job looks like**. It does not change the [locked Scrapper story](README.md), Mechanics +3 or the later [Stage 3 — The Last Dry Floor](README.md).

## The job in one sentence

**Take two old metal plates off a pump's outside stand, deal with a rusty bolt, and sort the pieces into “keep” and “scrap.”** Leave the large water pipe alone.

*The pump stands beside a water drain at Rust Yard. A couple of old metal plates are bolted to its iron stand. Ignatius has marked those outer plates for removal; they are not part of the moving machine.*

This is the physical object shown in the job screen. The character uses the **yard's tools** and doesn't get a new tool or weapon.

## S02-A — See what you're working on

**[Read the work slip]**

> **Strip a Condemned Pump — Mechanics**
>
> Remove the old metal plates from the pump's stand.
>
> **Keep:** straight, usable metal pieces and bolts.  
> **Scrap:** pieces too bent or broken to use again.  
> **Leave alone:** the large pipe and the pump's working parts.  
> **This yard clean-up job is unpaid.**

A little UI subtitle can say **“Condemned = marked for scrap.”** Don't ask the player to know the word in advance.

**[Look at the metal plates]**

The player can see the two plates, the bolts holding them, and the pipe that must stay untouched. A small highlighted area marks **only the parts safe to remove**. This is just a clear visual boundary, not an invented mechanic.

The game should not ask a player to make a technically expert diagnosis. Basic visual differences—straight metal, badly bent metal, a rusty bolt—are enough.

## S02-B — Take the first plate off

**[Pick up the yard spanner]**

*The plate is held to the stand with bolts. If they all come loose at once, the plate might slip and hit the ground.*

Choose one:

| Player action | What happens |
| --- | --- |
| **[Hold the plate steady while loosening the bolts]** | Takes a little longer, but the plate is less likely to be bent |
| **[Undo the bolts right away]** | Quicker, but the plate may slip and get dented |

Both are ordinary, legal work choices. Neither makes the large pipe burst, and neither forces a failure. If the plate gets dented, the game shows that condition before sorting it; it never invents an injury to the player or people nearby.

**[Lift the plate free]**

*The plate is off. The pipe is untouched.*

## S02-C — One rusty bolt on the second plate

*The second plate is harder. One bolt is rusted tight and will not turn.*

**[Look at the stuck bolt]**

Choose one:

| Player action | What the player understands |
| --- | --- |
| **[Put some oil on it and try slowly]** | Safer for the old bolt, but takes time |
| **[Try reaching it from the other side]** | Takes extra work to get a better grip with the yard tools |
| **[Pull harder]** | Quicker, but the bolt might snap or the plate might bend |

The **oil is a little of the yard's working supply**, not a new inventory item, recipe or permanent consumable. The other side must be visibly reachable; don't offer a choice that geometry cannot support.

If the player breaks the bolt, show it breaking. The broken metal goes into the scrap pile later; the second plate is still removable with ordinary work/rework. It is **not** a surprise permanent failure or a reason the pump stops working.

**[Take off the second plate]**

At the end of this step, the player has **two removed outer plates and their bolts** to examine. Only those nonessential pieces have been taken off.

## S02-D — Keep the good parts; scrap the bad ones

**[Look over the pieces]** — the game shows clearly which are straight and still usable, and which are cracked, badly bent or broken. Exact item IDs, condition ratings, prices and yield formulas are for the shared Mechanics/economy systems later.

For each piece the player selects either:

- **[Put with the good pieces]** — if still useful at the yard.
- **[Put in the scrap pile]** — if too damaged.

A straight plate can be kept for yard reuse. A broken bolt cannot. If the player puts something in the wrong place, **[Look again]** allows them to correct it.

**[Count the pieces]** — the work slip shows plain words:

> **Good pieces:** [count from actual work]  
> **Scrap pieces:** [count from actual work]  
> **Pump pipe:** Not touched.

Do **not** invent fixed counts beyond the two visible plates, a coin value, or an extra stock item for the player. Bolts and any damaged pieces use normal work-prop quantities when the actual job data exists. All metal belongs to the yard.

## S02-E — Tell Ignatius you're done

*Ignatius looks at the two piles. He coughs.*

**SMOG:** “All done?”

**PLAYER:** “Just the plates. Didn't touch the pipe.”

**SMOG:** “Good. Put the tools back.”

**[Put the yard tools back] → [Finish the job]**

The job screen shows **“Pump exterior cleared. Metal sorted.”** If the player broke a bolt, the work record reflects that. If they worked carefully, it reflects that too. This is the end of a normal, reusable Mechanics task, not a reward animation handing out free metal.

The scripted first job pays **0 coins and 0 ordinary Mechanics XP**, made clear before accepting. Regular Rust Yard jobs outside onboarding remain normally paid and award skill XP. The player still has the universal Basic Clothes, Crude Small Bag and **20 coins**, plus the already-granted Mechanics +3.

## S02-F — Only now: the different story begins

After the player has done the ordinary job and put the yard tools away, **Stage 3 — The Last Dry Floor** can start. The player then notices that this supposedly useless pump still seems to be working, sees a cloth warning and hears three knocks from below. That's when they discover the pump is keeping occupied underground rooms dry.

**No early hints in Stage 2:** no moving pressure dial, no warning cloth, no knocks, no cellar residents, no Barnaby Rusk and no choice of second Major Skill. The player has not removed the big pipe or shut off the machine.

## Rules for making this believable and easy to understand

- **Safety:** the two removable plates belong to the pump's *outside stand* and are not covers shielding moving gears, water-pressure joints or the main pipe. The production art must show a separate, accessible area. If the machine art cannot support this safely, put those spare outer pieces on a detached adjacent casing while keeping the job's core actions and later discovery.
- **Reusable Mechanics work:** look at parts → choose care or speed → loosen bolts → handle a stuck one → separate reusable metal from scrap → show the foreman what was done.
- **Readable options:** names like **[Pull harder]** and **[Count the pieces]** belong on buttons. “Corroded fastener,” “quality grading,” “docket reconciliation,” “auxiliary drainage pump” and “removal order” are development vocabulary, **not required player vocabulary**.
- **Beginner-friendly:** yard tools provided, no hidden skill test, no forced late click after a timer, no fatal mistake. Choice affects time and whether the metal remains useful, not whether people are drowned before the story begins.
- **Continuity:** this is ordinary first work, so no wages or ordinary XP, no loot, no extra skill grant and no hidden repeatable cellar-quest trigger. Stage 3's later branch choice alone grants +1 in Industry, Fieldcraft or Commerce.

## Approval boundary

**Already LOCKED:** Rust Yard and Ignatius, official job name *Strip a Condemned Pump*, first task uses Mechanics +3, no tutorial wages/XP/loot, the connection to the still-running drainage pump, and Stage 3's later reveal.

**REVISED PROPOSAL:** two clearly identified plates on the stand, simple remove/hold choices, three ways to handle a rusty bolt, keep/scrap sorting, count, Ignatius's plain sign-off and a clearly separate later story twist.

**TBD:** how the physical pump stand looks, exact bolt/part counts and conditions, time and material-quality formulas, normal paid job rewards, item/animation definitions and shared job interface.

Related: [Stage 1 simplified dialogue](opening-dialogue.md), [Scrapper master](README.md), [Jobs and Time](../../jobs/jobs-and-time.md), [spoken dialogue standard](../../interactions/dialogue-style-guide.md).
