# Food and Survival Economy

## Purpose

Cheap food keeps the player functioning. Good food improves recovery. Excellent food is preparation for a specific plan.

## Supply

NPCs may sell basic provisions and ingredients such as:

- bread;
- vegetables;
- chicken meat;
- pork;
- beef;
- game meat;
- eggs;
- milk;
- flour.

Fishing and fish-based food are **LATER**. Fruit is also deferred unless later cooking design gives it a distinct economic role.

The city tavern serves roughly 5–10 proper meals. Tavern food is deliberately more expensive than equivalent player-cooked food so kitchens and Cooking have economic value.

## Fullness

Eating raises Fullness.

There is no separate overeating penalty. At the Fullness cap, the player simply cannot eat more.

## Food effects

Food may:

- restore Hunger;
- multiply Stamina recovery for a duration;
- rarely multiply Composure recovery;
- provide situational effects.

## Recovery trade-off

Stamina recovery multipliers may range approximately from **x2 to x10**.

Durations may range approximately from **10 minutes to 5 hours**.

A dominant food combining maximum multiplier and maximum duration should not exist.

Valid shapes include:
- x10 for 10 minutes;
- x2 for 5 hours;
- x6 for a medium duration.

Exact values remain balance data rather than hard-coded rules.

## Food variety

A simple rule based only on consecutive identical meals is easy to exploit.

Instead, the game remembers a recent meal window. Repeating the same food or food family within that window progressively reduces its recovery benefit.

Initial tuning placeholders:

- first occurrence: 100%;
- second: 85%;
- third: 65%;
- fourth and later: 45%.

The exact window size and whether memory applies by recipe or food family remain tunable.

## City versus expedition survival

Inside safe cities:
- Hunger matters.
- Thirst is abstracted and automatically maintained.
- Stamina and Composure remain relevant.

Outside:
- Hunger matters.
- Thirst becomes active.
- Stamina and Composure matter.
- equipment and environmental protection become expedition logistics.
