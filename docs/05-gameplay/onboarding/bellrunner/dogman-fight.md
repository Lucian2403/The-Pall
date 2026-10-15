# Bellrunner — Stage 6: Dogman's Turn-Based Fight (APPROVED ENCOUNTER)

**Status: APPROVED AND LOCKED AT ENCOUNTER LEVEL (2026-10-15).** The user approved the readable club attack, tactical entry differences, movement obstacle, nonlethal narrow victory, witnessed interruption on defeat, and onward medical handoff. Exact combat mechanics, numerical balance and Health effects remain TBD. The opponent, physical threat, gate setting and three pre-fight approaches were already approved in [Stage 5](dogman-confrontation.md).

Related canonical context: [Bellrunner overview](README.md), [approved Stage 4](second-task-branches.md), [approved Stage 3](wrong-bell-discovery.md), [shared onboarding](../shared-structure.md), [Millhand Stage 6 fight as encounter design reference](../millhand/flint-fight.md), [game-wide dialogue guide](../../interactions/dialogue-style-guide.md).

## The fight is over passage, not money

Dogman is a single **human hired security man**, working informally for the Shift Marshal, outside the condemned block's service gate. He wants the courier's route sheet and other information, and has blocked the way home. The courier wants to get out with their property and story knowledge intact. The Shift Marshal stays off-screen.

Dogman **reached for the bag and drew a short club in Stage 5**. Stage 6 begins immediately after the player's choice to step back toward the street, use the work cart or stand their ground protecting the bag. Do not repeat the Stage 5 conversation or add a speech to delay the encounter.

This is a **genuine, short, turn-based PvE fight** using the common battle system. Dogman is not a special raid boss, an official guard, a supernatural enemy or a player-PvP flag. The threat is physical and local, not an opportunity to resolve the wider wrong-shift affair by beating one man.

## S06-A — Combat begins

**Visual cue (proposed non-spoken direction):** *Dogman comes forward with the club held low. The service lane is narrow, with a work cart to one side and the public street beyond.*

**Enemy display:** **Dogman — Hired Security** (working UI role label, exact final combat label TBD). One opponent. No invented combat level or health value.

The initial tactical state comes **directly from the approved Stage 5 selection**:

| Stage 5 choice (exact approved wording) | Combat starting condition to implement with common rules |
| --- | --- |
| **[Step back toward the open street]** | Slightly more room between courier and Dogman, with an available path to reposition. Exact distance, movement rules and initiative effects TBD. |
| **[Move behind the work cart]** | Cart temporarily separates the characters. Dogman must navigate around the obstruction rather than ignoring it. Exact cover/line-of-movement rules TBD. |
| **[Stand your ground and protect the bag]** | Courier begins ready for close-range defence, but has less immediate space. Exact guard/defence state TBD. |

The starting position cannot be cosmetic. **Every option must produce a visibly different tactical circumstance**, rather than three flavour strings leading to the same numbers. If the eventual shared combat system lacks one of these concepts, revise its translation openly before production rather than sneaking in an origin-only modifier.

**Starter fairness:** The player has no issued weapon, special armour or combat skill bonus. This must still be winnable with the normal **unarmed attack, defence and movement capabilities** of a new character under the common combat system. Do not force a cart weapon pickup, scripted club theft, new combat consumable or shop purchase.

## S06-B — Recognise what Dogman is about to do

Dogman uses an ordinary human close-range style: advance, threaten with the club and try to crowd the courier against the gate or cart. His **first committed heavy club strike is telegraphed in the turn interface** before it lands.

**Proposed UI intent wording:** *Dogman draws his club back for a hard swing.* This is not spoken dialogue.

The player can respond with whatever **defend / reposition / unarmed attack** actions the global combat rules ultimately provide. Defending or stepping clear of a declared heavy attack should generally be sensible, but the system must calculate the outcome honestly. There is **no reflex timer, automatic guaranteed miss, instant full parry, cinematic counterattack or fixed three-click win**.

Unlike Flint's wage-collector clash, Dogman is interested in **getting close enough to control the courier and take the papers**, not collecting a debt. Later combat presentation may show his attention shifting to the bag when the courier is pinned, but **the paper seizure must never be a hidden irreversible inventory-steal mechanic**. Only implement an explicit grapple/disarm threat if a reusable version exists in the common combat rules. Otherwise keep it as physical staging.

## S06-C — Turn the encounter around

An ordinary opening can arise when Dogman commits too much to a club swing, spends a turn moving around the cart, or is held off by a successful guard. The player should be able to respond with normal legal combat choices:
- **Defend** against a threatened blow, then make an unarmed counter when the shared action system permits.
- **Reposition** to avoid being pinned along the service gate, and make Dogman cross the lane again.
- **Attack unarmed** when Dogman leaves an opening or comes close enough to strike.

These are **action families, not locked button names or guaranteed results**. The particular outcome comes from the later common combat calculations. A less effective choice may cost Health or stamina and require recovery, but does not instantly hard-lock the tutorial. Dogman must actually be capable of defeating the player.

**Distinctive environment use:** the work cart has a tactical purpose in this fight: it is a movement obstruction, not an endlessly reusable defence multiplier, improvised weapon or magic shield. A player who chooses it at Stage 5 should see Dogman go around it or otherwise deal with the obstacle rather than walk through it. The streetward option should create space, not grant a free scripted escape that bypasses combat.

## S06-D — Win condition: make Dogman let the courier through

The local victory happens when the common combat system resolves Dogman as **unable or unwilling to continue blocking passage**: pushed back, driven to retreat or put down long enough for the player to cross into the public street. How normal Health, morale, position and combat-ending conditions encode this is **TBD**. This encounter should not invent a unique “escape meter” or a compulsory fatal finishing blow.

**Proposed non-spoken victory sequence:**

*Dogman stumbles back and lowers the club. After a look toward the public street, he gets out of the way.*

*The courier keeps hold of the bag and walks past him.*

He does **not** hand over a named Shift Marshal, reveal who ordered the condemned shift or submit to lawful arrest. His attempt to seize the courier's papers **fails this time**. The site remains closed on paper, its wider disputes unresolved. The win feels concrete because the player stood up to a man physically blocking their path, not because combat caused a citywide reform.

Avoid a second triumphant insult or slick movie one-liner from either character. Stage 5 already established their conflict.

## S06-E — Defeat condition: escape remains possible

A defeat must be **shown as a defeat**: Dogman knocks the courier down or leaves them unable to defend the lane; the UI records that the player lost. The encounter cannot switch to a fake victory because the origin story has to continue.

**Proposed non-spoken defeat sequence:**

*The courier goes down by the gate. Dogman reaches for the bag, but voices and footsteps come from the nearby street. The workers who had been gathering at the block have noticed the fight.*

*Dogman lets go and moves away before they reach the passage. An unnamed passerby helps the courier toward the ordinary city clinic.*

Dogman withdraws **because witnesses are arriving** and he has no official right to be assaulting a courier at a public workplace gate, not because the courier suddenly defeated him. He does not steal the route sheet, sealed notice if still held, coins, clothes, bag or medical payment, and he is not revealed to have a secret source of law-enforcement power. Do not invent a named rescuer or additional quest giver.

**Trade-off:** the player lost the fight and may suffer the ordinary combat/Health consequences when those systems are defined. Do not impose an additional permanent crime status, scripted financial penalty or repeat-the-encounter requirement. This defeat cannot leave the player too badly immobilised to reach the clinic: assistance/transition must follow.

**Physical continuity:** workers gathering outside the condemned gate already appeared in Stage 3, so witnesses are not an invented rescue squad. Exact choreography and whether they are near enough at combat's end are presentation details; don't teleport an absent named NPC into the lane.

## S06-F — Clinic handoff and no fake injury

Both outcomes feed the shared subsequent care scene. A victory leaves the player free to walk; a defeat needs assistance. **Do not apply unexplained guaranteed damage after a flawless combat victory** solely to justify treatment. If the care system later requires a damaged Health value to offer the mandatory tutorial consultation, resolve that in the shared clinic/Health design rather than silently overriding the combat record.

The actual clinic conversation, service rules and return-home scene belong to Stages 7 and 8. Stage 6 does not invent a treatment item, illness, new fee or housing detail.

The already-established tutorial reward/progression and starter-item rules apply here unchanged; there is no need to repeat them as dialogue or in every encounter beat.

## State / continuity

- Stage 6 starts exactly once after the two approved Stage 5 interactions; preserve the selected pre-fight stance in the combat setup.
- Use the common **one-on-one turn-based PvE** engine, not an origin-specific minigame, timer dodge test or PvP permission exception.
- Persist **Dogman encounter outcome: player victory or player defeat** in local story state and completed-quest recap (working identifier TBD). This is a proposed persistence detail, **not a promise of a future Dogman quest**.
- Preserve the chosen Stage 3 route and Stage 4 discovery. Dogman must not acquire the other branches' knowledge or confiscate quest-journal state.
- Neither victory nor defeat transforms the Shift Marshal into an on-screen boss or identifies those responsible for every discrepancy.
- Recovery, combat disconnects and save/resume use later shared combat rules. Do not duplicate fight rewards or reset the branch by refreshing a browser; exact offline/timeout behavior TBD.
- Combat numbers, enemy behaviour weights, initiative, exact club stats, animation durations, player injury effects, potential off-hand stance, tactical distance and clinic post-fight Health state remain unresolved.

## Approval boundary

**LOCKED BEFORE THIS STAGE:** Dogman's identity and employer relationship; Stage 5 exact words, bag-grab/club escalation and the three pre-fight physical stances; a short normal turn-based encounter; fair entry with the universal kit; defeat-safe onward route to the common care and housing ending.

**APPROVED IN STAGE 6:** readable heavy-club warning, meaningful opening stances, work-cart obstacle, broad close-range encounter structure, narrow nonlethal victory, witnesses interrupting a defeat before papers are taken, and storing the outcome. Exact combat effects remain deferred.

**LATER / TBD:** exact combat rules and values, Dogman's numerical kit, whether grappling exists globally, Health/injury integration and Stages 7–8.
