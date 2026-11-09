/** Owner-approved, optional Hector dialogue. Pure presentation data:
 * topics do not advance a stage, write to the API, award XP or alter a round.
 * Every turn is shown once; the UI advances only on an explicit click.
 */
export type HectorTopicId='work'|'marks'|'routes'|'payment'|'city'|'pall';
export type HectorLine={readonly speaker:'Player'|'Hector';readonly text:string};
export type HectorTopic={readonly id:HectorTopicId;readonly label:string;
  readonly lines:ReadonlyArray<HectorLine>};
export const APPROVED_HECTOR_TOPICS:ReadonlyArray<HectorTopic> = [
  {
    "id": "work",
    "label": "About the work",
    "lines": [
      {
        "speaker": "Player",
        "text": "Always this much running about?"
      },
      {
        "speaker": "Hector",
        "text": "Some days worse. Half the city can't start a shift till somebody hands them a piece of paper."
      },
      {
        "speaker": "Player",
        "text": "And they can't send it themselves?"
      },
      {
        "speaker": "Hector",
        "text": "They could. But then what would they need us for?"
      }
    ]
  },
  {
    "id": "marks",
    "label": "About the receiving marks",
    "lines": [
      {
        "speaker": "Player",
        "text": "What if somebody won't sign for it?"
      },
      {
        "speaker": "Hector",
        "text": "Then you write down where you went and who took it. Don't go making marks yourself."
      },
      {
        "speaker": "Player",
        "text": "And if they give me trouble?"
      },
      {
        "speaker": "Hector",
        "text": "Bring it back to me. I'll deal with the paperwork."
      }
    ]
  },
  {
    "id": "routes",
    "label": "About the routes",
    "lines": [
      {
        "speaker": "Player",
        "text": "Which way's quicker today?"
      },
      {
        "speaker": "Hector",
        "text": "Short road's usually packed with carts. Other way takes longer, but you'll have more room."
      },
      {
        "speaker": "Player",
        "text": "So which one?"
      },
      {
        "speaker": "Hector",
        "text": "Up to you. You're the one walking it."
      }
    ]
  },
  {
    "id": "payment",
    "label": "About the payment",
    "lines": [
      {
        "speaker": "Player",
        "text": "When's this round getting paid?"
      },
      {
        "speaker": "Hector",
        "text": "When the council clears it. They want every stop accounted for first."
      },
      {
        "speaker": "Player",
        "text": "So nothing till then?"
      },
      {
        "speaker": "Hector",
        "text": "That's how they do it. I send the work out. I don't hold the purse."
      }
    ]
  },
  {
    "id": "city",
    "label": "About Grand Cylinder City",
    "lines": [
      {
        "speaker": "Player",
        "text": "Does this city ever get a quiet day?"
      },
      {
        "speaker": "Hector",
        "text": "Quiet? With that great Cylinder burning day and night? Not a chance. Heat, power, factories going day and night. Always somebody working"
      },
      {
        "speaker": "Player",
        "text": "Suppose it keeps the city alive."
      },
      {
        "speaker": "Hector",
        "text": "Aye, it does. Heat, power, work for half the city. Trouble is, some folk get rich off it, and the rest get up before dawn to keep the damn thing running."
      },
      {
        "speaker": "Player",
        "text": "Sounds about right."
      },
      {
        "speaker": "Hector",
        "text": "Been that way longer than you or me. Don't see it changing by supper."
      }
    ]
  },
  {
    "id": "pall",
    "label": "About the Plume and the Pall",
    "lines": [
      {
        "speaker": "Player",
        "text": "You ever send runners beyond the walls?"
      },
      {
        "speaker": "Hector",
        "text": "Outskirts, sure. Grey Marches, very rarely. But the Pall? No. I've enough trouble getting letters across this city without sending poor sods into that mess."
      },
      {
        "speaker": "Player",
        "text": "What's it actually like out there?"
      },
      {
        "speaker": "Hector",
        "text": "Bad ground, strange growth, things you don't want to meet on a lonely road. Been like that since the Plume, near a hundred years now."
      },
      {
        "speaker": "Player",
        "text": "What do you reckon caused it?"
      },
      {
        "speaker": "Hector",
        "text": "Ah, heard the lot. Earth splitting open, something men dug up, punishment from above. Every old fool's got a different story."
      },
      {
        "speaker": "Player",
        "text": "And yours?"
      },
      {
        "speaker": "Hector",
        "text": "Mine? Haven't got one. Nobody knows what happened, and I'm not about to pretend I do. I've got enough trouble with places that are still on the bloody map."
      }
    ]
  }
];
