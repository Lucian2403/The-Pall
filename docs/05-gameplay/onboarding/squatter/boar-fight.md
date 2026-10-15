# Squatter — Stage 6: The Injured Boar Fight (PROPOSED)

**Status: PROPOSED FOR USER APPROVAL (2026-10-15); NOT LOCKED.** The player has completed one [approved Stage 4 route](second-task-branches.md) and both [approved Stage 5 encounters](boar-confrontation.md). The foe is an ordinary **young, injured wild boar**, not a monster or a hunting reward. This draft proposes the encounter's tactical teaching beats and two endings. Combat formulas, injury types and AI values belong to the unfinished shared turn-based system.

## What actually needs to happen

The Squatter stands on a narrow public approach beside an unstable drainage bank. The frightened boar favours one leg and has trouble reaching firm ground. The player is **unarmed**, with only the shared Basic Clothes and Crude Small Bag. An adult boar should be dangerous; a wounded youngster is still capable of hurting somebody badly. This isn't a fair fistfight, and it shouldn't play like one.

**The encounter objective is to survive the rush and open a safe passage.** The player may get clear or drive the animal away without killing it, chasing it or trying to nurse it. This remains a real turn-based PvE encounter: moving, defending and timing must matter, the player can be hurt or defeated, and there is no automatic three-turn win. No PvP flags, hunting loot or new origin-only combat currency.

## C01 — Entry: use the ground already chosen

Keep both approved Stage 5 inputs in the encounter state:

| Previous interaction | What the combat scene can visibly honour |
| --- | --- |
| **The Rustling Bank — Inspect the tracks** | The Squatter recognizes the animal's awkward gait and can read the likely line of its approach a little earlier; any actual warning/initiative consequence uses shared combat rules |
| **The Rustling Bank — Take the raised path** | The player approaches along slightly higher, firmer ground with more room to shift sideways |
| **The Rustling Bank — Look at the fresh tear in the ground** | The unstable edge is already identified and clearly marked as unsafe terrain |
| **Nowhere to Step — Hold your ground** | Shorter range and a protective ready stance on the firm centre of the narrow path |
| **Nowhere to Step — Move behind the broken fence** | Fence between boar and player; it can be damaged or gone around, not treated as indestructible protection |
| **Nowhere to Step — Move toward the stone embankment** | Slightly higher, firmer footing and a different approach angle, but not a total escape from the arena |

These are grounded, visible distinctions. The later common combat system must implement real effects or author a justified replacement; do not apply arbitrary fixed percentage buffs or quietly make all choices identical. An environmental obstruction must affect both sides honestly.

**Scene direction:** *The boar stands with its weight off one leg. Its head stays low. It watches the narrow way past the player and snorts when the player moves.*

**On-screen opponent:** `Young Injured Wild Boar`. No name, exaggerated level or implied Pall alteration. The cause of its existing injury is unknown.

## C02 — Read the first charge

The boar's threatened movement is telegraphed through the normal turn interface, not a reaction-time minigame.

**Proposed combat intent text (not animal speech):** *The boar lowers its head and gathers itself to rush forward.*

If the player stands directly in the line of a charge without defending, they are exposed to a meaningful hit. Taking shelter behind the fence, shifting across the line or guarding with the ordinary shared defensive action should give them a sensible way to mitigate it. The actual damage, accuracy, stamina, status conditions and defence resolution are TBD, and **guarding is not magically equal to stopping a boar with bare hands**.

A player who makes a poor choice may be knocked back or injured. A player who reads the threat should see why they fared better. No attack is required solely to teach the Attack button.

## C03 — Give the animal room to leave

After a rush, the boar may overshoot onto firmer ground, hesitate behind the broken fence or stop short when the player gets out of its path. The Squatter should have an actionable opportunity to create distance and **leave a clear route for the animal**, rather than standing over it and beating it senseless.

- **Reposition:** move laterally or behind the fence/stone edge, rather than toward the crumbling bank or into the boar's head.
- **Defend:** brace for a threatened strike if there is no safe lateral move.
- **Counter/strike:** ordinary unarmed action remains available under the shared system, but **an unarmed novice should not be expected to knock out a wild boar through repeated punches**. A strike might keep it back if the rules support that; it must carry real risk.
- **Withdrawal outcome:** after the animal has space, the shared combat resolution may mark the opponent as disengaged. Don't invent a boar-only “kindness meter”, automatically end combat for clicking “Be nice”, or guarantee that a position choice bypasses all danger.

This should be a **short, real, survivable encounter**. Its winning condition is **safe separation / boar withdrawal**, which must be supported as an ordinary nonlethal resolution by the future common combat system. If that system is only HP-to-zero, address the missing shared capability openly rather than staging the boar's escape behind the UI.

## C04 — Player victory

**Proposed non-spoken sequence:**

*The Squatter gets clear of the boar's path. For a moment it stands still, breathing hard. Then it limps across the firm ground and disappears into the reeds farther from the crumbling bank.*

*The path toward the gate is open again.*

The result is a **player victory**, because the threat has passed and the Squatter gets homeward without being forced to harm or hunt the animal. The boar survives; it is neither a new follower nor a tame creature. The player doesn't learn who hurt it or promise to come back and cure it. If the boar was struck defensively, the end still shows withdrawal, not an implausible friendly reconciliation.

Do not automatically wound a player who executed the encounter without taking damage just to prepare Stage 7.

## C05 — Player defeat

The boar may strike the Squatter before they can get clear. If the shared combat system resolves a defeat, **show that defeat honestly**.

**Proposed non-spoken sequence:**

*The boar knocks the Squatter down beside the firm edge of the path. As the player stops blocking the way ahead, the animal runs past, limping toward the open ground. It does not circle back to finish somebody lying still.*

*After it has gone, an unnamed traveller coming along the road finds the injured Squatter and helps them toward the ordinary city clinic.*

This is not an unexplained animal act of mercy. The frightened boar wants to get out of the narrow space; **once the person is no longer in its way, it has a route through**. The nearby public path plausibly sees other travellers, but do not teleport Benny, a named doctor, city guards or the Stage 4 ditch crew into the encounter.

The player records a **loss**, may sustain actual wounds according to combat and Health rules, but is not stranded, killed for failing the tutorial, robbed of the 20 starter coins or forced into an unarmed rematch. A defeat must be mechanically reachable in testing, not just a cinematic shown after a timer.

## C06 — Clinic handoff

Both outcomes advance to the same ordinary medical-service stage. Following victory, the player can reach it through standard city travel. Following defeat, the passerby helps them. The clinic sees the **actual Health and conditions** after combat. No free boar trophies, meat, hide, experience, forced cure of the animal or separate first-aid branch appears.

The shared tutorial keeps its existing economy and progression; the fight itself cannot be farmed for rewards and cannot retroactively grant or change the chosen second Major Skill.

A no-damage player still cannot be assigned an invisible scratch just to justify a mandatory visit. The universal clinic and 10-coin examination question remains open in the shared Health/service system, exactly as it does for other origins.

## State and QA

- **Entry:** one Stage 4 route complete; both approved Stage 5 interactions complete, and their separate observation and positioning choices recorded.
- **Encounter:** one animal, real turn-based state and readable threat. Environmental options must do something physically intelligible. Avoid special boar-only movement rules that can't be supported globally.
- **Resolution:** `squatter_boar_outcome=player_victory|player_defeat` (illustrative persistent field, not confirmed implementation ID). Keep the origin route finding and any voluntary Benny disclosure independent of the fight.
- **Victory** does not mean the boar died; **defeat** does not mean the boar took the player's belongings. Either way the path to care opens once.
- Disconnect/reload follows eventual common combat-save rules. No duplicated fight, XP, loot, money or skill grant; no automatic victory for a stalled instance.
- Exact Health damage, wound categories, distance, guard action, knockback, movement costs, injured-leg AI behaviour, terrain geometry and time remain TBD.

## Approval boundary

**Already locked:** young injured boar opponent; two preceding Stage 5 interactions with three approach choices apiece; unarmed starter kit; no kill requirement; ordinary shared turn-based PvE; clinic/home continuation.

**Proposed for Stage 6:** clear charge telegraph, defensive movement-focused encounter, ordinary disengagement as a nonlethal victory, boar leaving once it can get through, defeat through a charge followed by aid from a passerby, and persistence of win/loss.

**Later / TBD:** all shared combat formulae, animal attack data, precise Health/injury effects, final UI terminology, and any future wildlife behaviour outside this one tutorial encounter.

Related: [Stage 5 approved](boar-confrontation.md), [Squatter master](README.md), [world wild boar notes](../../../02-world/ecology/animals-livestock-and-hunting.md), [Millhand reference](../millhand/flint-fight.md).
