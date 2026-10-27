/**
 * OWNER-DIRECTED EDITORIAL REVISION 2026-10-27 — Guther's optional conversations.
 * Owner-originated exchanges copyedited for natural English and period-compatible vocabulary.
 * Guther remains abrasive, evasive and sometimes imprecise. Do not restore
 * the earlier invented biography or the uncorrected wording.
 *
 * A topic prompt or followUp is spoken by the player when clicked, so the next
 * visible main-dialogue line is Guther's reply. No extra Player speech beat.
 *
 * Read-only: no game work actions, quest mutations, money or XP.
 * Source: docs/05-gameplay/onboarding/millhand/guther-optional-conversation.md
 */
/** Player-selected optional speech to leave the conversation immediately. */
export const GUTHER_WORK_SKIP_LINE = "Enough talk. Let's work." as const;

export type GutherTopicId = 'background' | 'city' | 'lore' | 'work';
export type GutherExchange = Readonly<{reply:string; followUp?:string}>;
export type GutherTopic = Readonly<{
  id:GutherTopicId;
  prompt:string;
  exchanges:readonly GutherExchange[];
}>;

export const APPROVED_GUTHER_OPTIONAL_DIALOGUE: readonly GutherTopic[] = [
  {
    id: "background",
    prompt: "How did you come to run this place?",
    exchanges: [
      {
        reply: "Ha! You think I own this place? It's not my workshop, you idiot. I just make sure their orders get done.",
        followUp: "Then who's giving the orders?"
      },
      {
        reply: "That's above your station. Get back to work!",
        followUp: "You think I'm too stupid to understand?"
      },
      {
        reply: "I don't care what you think. Next to the Cylinder, your opinion counts for nothing. Now get back to work."
      }
    ]
  },
  {
    id: "city",
    prompt: "What do you think of the city?",
    exchanges: [
      {
        reply: "There's work here. Foundries, shops, factories. But not enough for everyone trying to get by. So be thankful you've got a job.",
        followUp: "And the Grand Cylinder?"
      },
      {
        reply: "What about it? You know it gives the city heat and power. Men work there every day. I couldn't tell you how they run it.",
        followUp: "The whole Cylinder is just for heat and power?"
      },
      {
        reply: "Just for? Do you know how big this city is? The whole system that supplies its heat and power is housed in the Cylinder. Factories, machines, lights—they all depend on it. Takes a lot of people to keep it running."
      }
    ]
  },
  {
    id: "lore",
    prompt: "What do you know about the Plume?",
    exchanges: [
      {
        reply: "Only what I've heard. The ground broke open, bad fumes and dust spread, and people had to leave their homes. That was long before my time.",
        followUp: "And you believe that?"
      },
      {
        reply: "Eh... Hard to believe, if you ask me. But I've no better answer. Whatever happened, we're living with it now.",
        followUp: "Does anyone know what caused it?"
      },
      {
        reply: "I've heard different answers. I don't know which, if any, is right."
      }
    ]
  },
  {
    id: "work",
    prompt: "What else do you make here?",
    exchanges: [
      {
        reply: "Why? Haven't you got enough work? We do repairs, fittings—whatever ironwork comes through. Today it's council plates. I don't get to choose when the inspector comes.",
        followUp: "Is it always this hard to get paid?"
      },
      {
        reply: "Not every job. This lot needs the council's signature, and we haven't got it yet. That's all I can tell you."
      }
    ]
  }
];
