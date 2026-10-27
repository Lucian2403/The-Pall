/**
 * OWNER-APPROVED 2026-10-27 — Guther Anvil's optional conversations.
 * Spoken lines are reproduced verbatim from the owner's four revised exchanges.
 * The prose is intentionally not normalized: Guther is abrasive, evasive and
 * sometimes imprecise. Do not silently restore the earlier proposed biography.
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
    id: 'background',
    prompt: 'How did you come to run this place?',
    exchanges: [
      {
        reply: "Ha! Do you think I run this place? This isn't my smithing, you dumbass. I just supervise here so that the decided share it's achieved.",
        followUp: 'Who is deciding that?'
      },
      {
        reply: 'This is beyond you. Go back to your work!',
        followUp: "You think I can't understand what's beyond me?"
      },
      {
        reply: "I don't care what you think. Your opinion is small stone, beside the Cylinder. Let's work now."
      }
    ]
  },
  {
    id: 'city',
    prompt: 'What do you think of the City?',
    exchanges: [
      {
        reply: "There's work here. Foundries, shops, factories. But it's not enough for all the people that are trying to survive. So, be thankful that you have a job.",
        followUp: 'And the Grand Cylinder?'
      },
      {
        reply: "What about it? It gives the city heat and power, you know that. Men work in that place every day. I can't tell you how they run it.",
        followUp: 'The whole Cylinder is just for heat and power?'
      },
      {
        reply: "Just for? Do you know how big this City is? The whole energy system that powers all this machines, lights, industries are located in the Cylinder. That's a lot of people and process to handle."
      }
    ]
  },
  {
    id: 'lore',
    prompt: 'What do you know about the Plume?',
    exchanges: [
      {
        reply: "Only what I've heard. The ground broke open, bad fumes and dust spread, and people had to leave their homes. That was long before my time.",
        followUp: 'And you believe that?'
      },
      {
        reply: "Eh... That's a hard one to believe, to be honest with you. But I don't know any other story, so... what's done, it's done. Now we live in it.",
        followUp: 'Does anyone know what caused it?'
      },
      {
        reply: "I've heard different answers. I don't know which, if any, is right."
      }
    ]
  },
  {
    id: 'work',
    prompt: 'What else do you make here?',
    exchanges: [
      {
        reply: "Why? You don't have enough work? We do here repairs, fittings, whatever ironwork comes through. Today it's council plates. I don't get to choose when the inspector comes.",
        followUp: 'Is it always this hard to get paid?'
      },
      {
        reply: "Not every job. This lot needs the council's signature, and we haven't got it yet. That's all I can tell you."
      }
    ]
  }
];
