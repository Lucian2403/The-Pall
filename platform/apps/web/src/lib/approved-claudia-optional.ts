/**
 * Owner-approved Claudia Cyka optional conversations, for Stitcher Stages I–II.
 * The question is spoken by YOU when its choice is clicked; the next visible
 * beat is Claudia's answer. The question itself is never replayed as a line.
 *
 * Purely local dialogue: never advances ward actions, progression, inventory,
 * coins or skills. The Teaching Bed incident is not discussed before Stage III.
 * Wording is reproduced verbatim from the owner's 2026-11-18 specification.
 * Presentation follows approved-guther-optional.ts / NpcConversation.svelte.
 */
export const CLAUDIA_WORK_SKIP_LINE = 'Enough talk. Back to work.' as const;

export type ClaudiaTopicId='infirmary'|'claudia'|'city'|'pall'|'plume';
export type ClaudiaExchange=Readonly<{reply:string;followUp?:string}>;
export type ClaudiaTopic=Readonly<{
  id:ClaudiaTopicId;
  prompt:string;
  exchanges:readonly ClaudiaExchange[];
}>;

export const APPROVED_CLAUDIA_OPTIONAL_DIALOGUE:readonly ClaudiaTopic[]=[
  {
    id:'infirmary',
    prompt:"Why's this place always so full?",
    exchanges:[
      {
        reply:"Because people keep getting sick, and I've nowhere else to put them. We've already got beds out in the hall.",
        followUp:"Can't we get more beds?"
      },
      {
        reply:"And where would you put them? We can barely get through the ward as it is.",
        followUp:"What about the clean linen? We're always short of that too."
      },
      {
        reply:"I know we're short. We wash what we can and use it carefully. Now stop worrying about the whole ward and see to your two patients."
      }
    ]
  },
  {
    id:'claudia',
    prompt:"Why are you always so hard on everyone?",
    exchanges:[
      {
        reply:"Because when someone makes a mistake, I'm the one who has to answer for it.",
        followUp:"You could be a little kinder about it."
      },
      {
        reply:"Would that get the work done any better? I've asked you to change two dressings. Go and change them properly."
      }
    ]
  },
  {
    id:'city',
    prompt:"What do you think of the city?",
    exchanges:[
      {
        reply:"Too many people, not enough room. You've seen how crowded this ward is. It's not just us.",
        followUp:"At least we've got the Grand Cylinder keeping things running."
      },
      {
        reply:"Yes, we've got heat and power. Still need coal for the stove, though. And clean linen. The Cylinder doesn't provide everything.",
        followUp:"Do you think things will ever get better?"
      },
      {
        reply:"Perhaps, if we had more money and a few more people willing to work. Until then, we'll manage with what we've got."
      }
    ]
  },
  {
    id:'pall',
    prompt:"What do you know about the Pall?",
    exchanges:[
      {
        reply:"Not much worth telling you. It's dangerous land, and a lot of it hasn't even been properly mapped.",
        followUp:"But people still go out there?"
      },
      {
        reply:"Of course they do. Some come back with things worth selling. Others come back hurt, if they come back at all.",
        followUp:"Can you tell if someone got sick out there?"
      },
      {
        reply:"I can't say what caused it just because they've been to the Pall. I'd need more than that."
      }
    ]
  },
  {
    id:'plume',
    prompt:"What do you know about the Plume?",
    exchanges:[
      {
        reply:"Only what I've been told. The ground split open, and fumes and dust spread across the land. People lost their homes. It was long before my time.",
        followUp:"Do they know what caused it?"
      },
      {
        reply:"No. You'll hear all sorts of stories about it, but I wouldn't trust half of them.",
        followUp:"Do you think we're still suffering because of it?"
      },
      {
        reply:"Of course people are still dealing with what happened. But don't blame every illness on the Plume. That's how you became a fanatic."
      }
    ]
  }
];
