/**
 * PROPOSED, NOT APPROVED — optional recurring NPC conversations.
 * Source of factual boundaries: docs/05-gameplay/interactions/dialogue-style-guide.md,
 * docs/02-world/the-plume-and-regions.md and six origin opening-dialogue.md files.
 * No quest branching, rewards or historical facts are established by this draft.
 * The owner must approve each character's wording before removing draft labels.
 */
export type NpcTopic = Readonly<{id:'work'|'city'|'lore';prompt:string;reply:string}>;
export type NpcDialogue = Readonly<{npc:string;role:string;topics:readonly NpcTopic[]}>;
export const NPC_DIALOGUE_STATUS = 'DRAFT — AWAITING OWNER APPROVAL' as const;
export const PROPOSED_NPC_DIALOGUE: Readonly<Record<string,NpcDialogue>> = {
  "Millhand": {
    "npc": "Guther Anvil",
    "role": "Smithing Foreman",
    "topics": [
      {
        "id": "work",
        "prompt": "What other work comes through here?",
        "reply": "Council plates today. Repairs another day. The benches don't stand empty for long. Getting the council to sign for the work, that's another matter."
      },
      {
        "id": "city",
        "prompt": "What's work like in Grand Cylinder City?",
        "reply": "There's heat and power from the Grand Cylinder, and plenty that needs making or mending. Doesn't mean the men doing it get paid when they ought to."
      },
      {
        "id": "lore",
        "prompt": "What do you know about the Plume?",
        "reply": "There were ruptures. Bad air, dust, people driven out of their homes. That's what I've been told. I can't tell you why it happened."
      }
    ]
  },
  "Bellrunner": {
    "npc": "Hector D. Smoke",
    "role": "Dispatch Master",
    "topics": [
      {
        "id": "work",
        "prompt": "What do you handle at the Dispatch House?",
        "reply": "I sort the rounds and record when the runners take them. The notices go out, the receiving marks come back. If something's late, I want to know where it was held."
      },
      {
        "id": "city",
        "prompt": "Does every part of the city send notices here?",
        "reply": "Not every part. We've enough with shift notices and the rounds given to this house. A workshop changes its hours, somebody has to tell the workers."
      },
      {
        "id": "lore",
        "prompt": "Do the runners go into the Pall?",
        "reply": "Not on these rounds. The roads beyond the protected land get harder to follow. I deal with routes I can send somebody along and check when they return."
      }
    ]
  },
  "Squatter": {
    "npc": "Benny Ben",
    "role": "Herb Dealer",
    "topics": [
      {
        "id": "work",
        "prompt": "Why are you so particular about the herbs?",
        "reply": "Because I want some growing next year. Take every stem and root now, and what do you expect me to sell when the next season comes?"
      },
      {
        "id": "city",
        "prompt": "Where can plants still grow near the city?",
        "reply": "Out in the protected land there are farms and little patches that people haven't cleared. Some herbs still grow there. We ought to look after them."
      },
      {
        "id": "lore",
        "prompt": "What about the living things farther out?",
        "reply": "I worry about them. The plants and animals can't do anything about what happened to the land. I don't know what's survived beyond the Grey Marches, but I hope some of it has."
      }
    ]
  },
  "Stitcher": {
    "npc": "Claudia Cyka",
    "role": "Matron",
    "topics": [
      {
        "id": "work",
        "prompt": "What do you expect from someone working here?",
        "reply": "Change the dressings properly. Watch the wounds. Tell me when something is wrong. I can examine the patient, but I can't do your work and mine."
      },
      {
        "id": "city",
        "prompt": "Are the other city infirmaries like this one?",
        "reply": "I don't run the other infirmaries. Here, we have patients to attend and not enough clean linen. If you'd rather compare buildings, do it after the ward round."
      },
      {
        "id": "lore",
        "prompt": "Can you tell when an illness comes from the Pall?",
        "reply": "I can examine a patient. I can tell you what I find. I'm not putting a cause to it merely because somebody mentions the Pall."
      }
    ]
  },
  "Scrapper": {
    "npc": "Ignatius Smog",
    "role": "Yard Foreman",
    "topics": [
      {
        "id": "work",
        "prompt": "What's worth keeping from old machinery?",
        "reply": "Good metal. Plates, fittings, anything we can use again. The broken pieces go on the heap. Don't mix the two, or I'll have to sort it myself."
      },
      {
        "id": "city",
        "prompt": "Does the city send much machinery to this yard?",
        "reply": "Enough old iron to keep us busy. Pumps, stands, broken fittings. People still need the metal once the machines are finished with."
      },
      {
        "id": "lore",
        "prompt": "What do you know about the land beyond the walls?",
        "reply": "Not enough to tell you where to walk. I've got machines to strip here. Ask somebody who makes those journeys, not a man standing in a scrap yard."
      }
    ]
  },
  "Inkbound": {
    "npc": "Erwin Buro",
    "role": "Senior Copy Clerk",
    "topics": [
      {
        "id": "work",
        "prompt": "What does a senior copying clerk do?",
        "reply": "I check that the books are copied properly and that the work is fit to send out. A mistake costs paper, and paper costs money. That's rather more than merely writing neatly."
      },
      {
        "id": "city",
        "prompt": "What do you think of the city's offices?",
        "reply": "Some have fine rooms and proper furnishings. Ours is rather more modest. Still, the books must be right. Respectability isn't a matter of having a grand desk."
      },
      {
        "id": "lore",
        "prompt": "Do the records explain what caused the Plume?",
        "reply": "I've heard several explanations. None that I'd care to enter in a proper record without proof. We don't copy rumours here."
      }
    ]
  }
};
