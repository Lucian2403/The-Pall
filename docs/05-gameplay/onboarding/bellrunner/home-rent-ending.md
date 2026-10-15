# Bellrunner — Stage 8: Home and Rent Notice (APPROVED)

**Status: APPROVED AND LOCKED (2026-10-15).** The user approved the final Bellrunner onboarding scene: ordinary return to the same rented starter home, provisional rent notice, read/put-down interaction, exact self-directed spoken line, and branch-aware local journal closure. The shared housing, rent and clinic rules remain unchanged.

Related approved scenes: [Stage 6 fight](dogman-fight.md), [Stage 7 clinic](clinic-treatment.md), [Bellrunner overview](README.md). Shared reference: [Millhand home ending](../millhand/home-rent-ending.md), [universal onboarding](../shared-structure.md), [dialogue standard](../../interactions/dialogue-style-guide.md).

## B08-A — Back home

The courier leaves the clinic and travels home through the usual city interface. The Dogman fight has ended, whether the player won or lost. Do not stage another ambush, bring in Hector without a natural player visit, or force the courier to settle the site's paperwork first.

**[Enter home]**

*There is a rent notice waiting at home.*

**[Read the rent notice]**

> **RENT**
>
> **150 coins owing.**

The 150-coin rent remains **PROVISIONAL** in game design, as in every other background. It is not a new Bellrunner-specific charge. No due date, landlord signature, eviction threat or automatic rent collection is invented here.

The ordinary UI, *separate from the in-world paper*, can show the existing 10 coins in hand and the amount still needed. The notice itself should remain a simple in-world document.

## B08-B — Put down the notice

**[Put the notice down]**

*The courier sets the notice down.*

**PLAYER (quietly, to themselves):** “Oh, come on. I didn't even get paid for that last round, and now this. Better see if Hector's got another job.”

This is a short, everyday reaction to the courier's actual experience, not a new quest. It gives a natural reason to return to the existing Dispatch House and try ordinary paid work. The dialogue must not become a lesson about job rewards, contracts or skill levels.

After this, **Bellrunner opening complete**. Normal work and travel are available.

## B08-C — Keep what the character learned

The completed introduction records the selected **one** Stage 4 finding:

| Branch played | Journal takeaway |
| --- | --- |
| **Attendance Certificate** | Workers who stayed out of the unsafe building are recorded as voluntarily absent and lose wages. |
| **First Aid Line** | The medical register classes the affected workers' complaints as non-work illness, leaving them with the charges. |
| **The Bell Linkage** | Someone left the night bell connected after the ventilation safety shutoff; the responsible person remains unknown. |

It also retains the Dogman **victory or defeat** outcome. No future Dogman mission is promised. The wider cause behind the shift notices remains unresolved; the courier has finished one personal incident, not the main story.

The Dispatch House remains available for normal courier jobs. Hector's approved **optional** follow-up dialogue about the rejected council round belongs to the player's next natural visit, *if* they make one; it does not interrupt the final home scene or require replaying the tutorial.

## Implementation boundaries

- Ordinary clinic exit → ordinary travel → same shared home → read rent notice → put it down → one brief self-directed line → complete tutorial once.
- Stage 7 care must have finished. The ending does not create or resolve the still-open shared medical question of an unharmed fighter's examination.
- Do not change the player's housing, starter gear, the clinic charge, or the provisional rent framework. Do not introduce a second rental home, new permanent NPC, deadline, eviction countdown, immediate payment demand or mandatory job.
- A reload must not replay the line, reopen Dogman's encounter, charge clinic care twice, or restart the chosen branch.
- This is a local closure: Dogman no longer blocks the way, but the unsafe-site records have not magically been corrected.

## Approval boundary

**ALREADY LOCKED:** shared rented home, provisional rent notice, return after medical care, no surprise payment or invented landlord. The chosen branch and Dogman result persist.

**APPROVED AND LOCKED THIS STAGE (2026-10-15):** exact home narration and player line, read/put-down interaction, tutorial-complete boundary, short route-aware journal recap and Hector's optional exchange staying outside the mandatory ending. Preserve the approved spoken line verbatim unless the user requests a revision.

**TBD:** exact common room asset, rent frequency/due date/penalties, formal UI identifiers and global combat/Health numerical details.
