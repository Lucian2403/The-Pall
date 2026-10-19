# Squatter — Stage 2: Yarrow Cut, Ordinary Foraging Work (APPROVED)

**Status: APPROVED AND LOCKED (2026-10-15).** The job **Yarrow Cut**, Fieldcraft → Foraging, Benny Ben's Hedge Shelter and his [approved Stage 1 opening](opening-dialogue.md) are already canonical. This document defines a reusable ordinary plant-harvesting interaction before the story's *Warm Patch* reveal. Do not make this a bespoke timed clicking game or reveal the poorhouse outfall while the player is still learning to gather.

## S02-A — Check the order, go to the public patch

The player has accepted Benny's yarrow order. **[Check the order board]** opens the normal Foraging work details: assigned quantity, target plant, marked route, work estimate, the need to preserve regrowth, and the job's **buyer acceptance still pending**. Exact count and duration remain TBD. The initial order is for **usable cut stems**, not roots or an entire uprooted plant.

**[Follow the marked path]** takes the player to a familiar yarrow patch in the protected outskirts near Hedge Shelter. **User-approved audit correction (2026-10-19):** record the specific source section of every harvested work-order bundle **without** revealing why the lower edge later becomes suspect. The work area includes a **dry upper public section** and another clearly separately marked section nearer the old drainage boundary; the later [Warm Patch](warm-patch-discovery.md) reveal stays hidden until after the routine job is done. The job remains doable with Basic Clothes and a Crude Small Bag. No starter knife or special gathering tool is assumed. The ordinary Foraging system must offer a supported hand-harvesting/available-site-tool method rather than create a free permanent knife.

## S02-B — Identify yarrow

**[Identify the plants]** shows a few candidates in the field, with the actual in-game yarrow reference and visible identifying features accessible in the work UI. One plant is the intended yarrow; the player can check a specimen against the job board's reference. Do not turn this into a hidden botanical trivia test. On an uncertain pick, **[Check again]** corrects it at a small time cost.

This should be a standard **Fieldcraft/Foraging identification module** that also works in later paid harvests, with difficulty appropriate to a starting Squatter who already knows the area.

## S02-C — Decide how to cut

After identifying the herb, the player chooses a harvest approach. Both use the same patch population and regrowth rules already planned for general herbal harvesting.

| Player option | Action in the world | Real distinction |
| --- | --- | --- |
| **[Take a few stems from each plant]** | Cut mature stems from several healthy plants, leaving roots and enough growth behind | A little more movement and harvesting time; gentler on the patch and its regrowth |
| **[Cut from the thickest clump]** | Take the needed stems from one dense section, still leaving roots intact | Faster, but puts more harvest pressure on that section; Benny can observe the difference at a later routine job inspection |

Neither is a permanent morality label or secret faction reputation. A poor choice can affect time/patch condition under standard systems but cannot destroy the only required tutorial source or make the player unable to complete the job. The offered harvest is no more than the patch can reasonably supply; actual quantity and regrowth mathematics remain TBD.

**Provenance handling, approved:** both harvest approaches allow normal gathering from the mapped upper section; a quicker dense-clump choice may concentrate harvesting pressure but does **not** erase source labels. The tutorial records an actually gathered, separately bundled **upper-section portion** in both variants, sufficient for later buyer inspection, alongside potentially questionable stems from the rest of the working bed. Neither portion is announced as contaminated or medically safe at this stage. The future buyer needs positive source evidence and condition checks before accepting stock, not an assumption that healthy-looking herbs are clean.

**No extra voiced lesson from Benny here.** He gave the job instruction in Stage 1; repeating his love of nature at every click would cheapen it.

## S02-D — Sort a mixed bundle

On completing the cut, the normal quality-sorting panel shows acceptable yarrow stems and a few stems damp or muddied through ordinary field handling. **Keep a source-section marker on each bundle** through the sorting, handover and later buyer inspection: `upper_dry_public` or `near_drain_edge` (working data values, not finalized item IDs). Sorting by dampness cannot erase where the stems came from. This is **not yet the medical refuse or outfall revelation**.

**[Check the cuttings]** presents one representative quality decision:

- **[Clean and sort the cuttings]** — spend additional work time separating dirt from potentially usable stems. If the general resource system says a wet stem is unfit, cleaning cannot magically make it medicinal.
- **[Set doubtful stems aside]** — quicker conservative rejection, less usable weight available at handover.

If a sufficient usable quantity is not obtained, **[Gather the shortfall]** returns to a safe adjacent patch section through the same job system. Avoid forcing a restart or special medical hazard. Record usable/rejected quantity as job data, not free herb inventory for the player.

## S02-E — Return to Benny, weigh and finish the ordinary work

**[Return to Hedge Shelter]** brings the cuttings to the familiar communal scale. **[Weigh the usable stems]** compares the work order to the accepted sorted quantity; if it is short, show the difference and allow an ordinary small correction. Benny's ordinary receipt records total usable weight **and bundled source sections**, retained with his custody of the consignment. No new player-owned yarrow item is created. Benny may check the roots/stems visually, but this is not another multi-paragraph speech.

**Approved brief receipt exchange (spoken only after the job quality check):**

*Benny looks through the yarrow, then sets the bundle on the scale.*

**BENNY:** “These are good. You've left enough in the ground, I hope?”

**PLAYER:** “Yes. There'll be plenty left growing.”

**BENNY:** “Good. I'll put the weight down. The buyer still has to take the order.”

**[Finish the gathering report]** closes the everyday Foraging actions. The cuttings become a **work-order consignment under Benny's custody**, not a stack of owned herbs or a guaranteed paid market sale. The buyer's acceptance was already shown as pending on the job board, and the next stage addresses why the source is questionable. Do not promise a cash wage that will be silently reversed; the specific fate of payment should be resolved against Stage 3 and the later selected Stage 4 route.

## Stage 2 → Stage 3 boundary

With identification, harvesting, sorting and weigh-in finished, the character leaves Hedge Shelter along the established outskirts path toward the main road near the city gate. **Only then** does the one-time *Warm Patch* incident trigger at the edge of the yarrow ground. The patch was ordinary to work in; something beside the drainage outfall becomes visible on the later pass. The locked discovery is not revealed by the job board, Benny's ordinary instructions or a prematurely suspicious crop-quality popup.

Stage 3 must not be framed as Benny sending the Squatter into a suspected hazardous outfall; the player notices the disturbed edge from the public path after the job is complete.

## Implementation notes

- Work phases are **inspect → identify → harvest approach → quality sort → weigh/report**. The player learns real reusable Foraging mechanics rather than a scripted herb puzzle.
- Mandatory input is offered early, following the shared first-two-minute interaction requirement. World time continues through normal work and travel.
- False plant ID or inadequate count prompts a fair correction/recollection path, never an irreversible failure or exposure to danger zones.
- No new bespoke Yarrow tier, plant equipment, inventory item, recipe, new named NPC or permanent injury is defined.
- Any saved patch pressure uses global environmental resource rules; tutorial access to common yarrow remains reliable despite shared-world depletion.
- **Harvest provenance is mandatory work data:** each consignment section retains source area, separated bundle and condition flags. The upper/dry portion is eligible for later verification, **not automatically declared clean**. The near-drain section is put on hold when the Stage 3 evidence is discovered. This must work for either Stage 2 harvest approach.
- The first job's pending acceptance is **not** a final ruling that the whole load is safe, nor a secret assumption about the eventual contaminated patch.

## Approval boundary

**ALREADY LOCKED:** Benny Ben's speech and ethos in Stage 1; Yarrow Cut as a Fieldcraft/Foraging job; existing generic resource/patch harvesting principles; *Warm Patch* only later.

**APPROVED IN STAGE 2:** the five work phases, two cutting choices, one sorting correction, buyer-pending receipt logic, the brief Benny exchange and the return-to-path transition.

**TBD:** exact quantities, source patch geometry, identification UI art, handling times, work-quality/patch math, and how pending consignment payment resolves after Stage 3/Stage 4. All ordinary paid Foraging sessions continue to use their proper pay/XP rules.

Related: [Squatter master](README.md), [Stage 1](opening-dialogue.md), [herbs and harvesting](../../../03-resources/raw/herbs-and-harvesting.md), [jobs and time](../../jobs/jobs-and-time.md), [spoken dialogue guide](../../interactions/dialogue-style-guide.md).
