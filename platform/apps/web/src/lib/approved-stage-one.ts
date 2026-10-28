/**
 * M1.3 — Non-mutating, character-specific Stage 1 scene handoff.
 * Every narrative and spoken line is transcribed from its canon:
 * docs/05-gameplay/onboarding/{origin}/opening-dialogue.md
 * "Continue", "Your response" and "Work not yet connected" are UI controls/status,
 * not dialogue. Editing canon requires matching updates plus parity verification.
 * Do not advance tutorial stage or award XP/coins from this read-only scene.
 */
export type StageOneBeat = {
  readonly kind: 'narration' | 'speech' | 'choice' | 'handoff';
  readonly text: string;
  readonly speaker?: string;
  readonly next?: string;
  readonly choices?: ReadonlyArray<{readonly label: string; readonly next: string; readonly ui?: boolean}>;
};
export type StageOneScene = {
  readonly location: string;
  readonly npc: string;
  readonly source: string;
  readonly start: string;
  readonly nodes: Readonly<Record<string, StageOneBeat>>;
};
/**
 * A selected player response is already visible on its choice button.
 * Advance directly to the consequence rather than displaying that same
 * sentence a second time as its own spoken beat.
 * Only skip a Player speech node when reached by an actual choice.
 */
export function resolveStageOneChoice(scene: StageOneScene, choiceNext: string): string {
  const node = scene.nodes[choiceNext];
  if (node?.kind === 'speech' && node.speaker === 'Player' && node.next && scene.nodes[node.next]) {
    return node.next;
  }
  return choiceNext;
}

export const APPROVED_STAGE_ONE: Readonly<Record<string, StageOneScene>> = {
  "Millhand": {
    "location": "Smithing workshop",
    "npc": "Guther Anvil",
    "source": "millhand",
    "start": "entry",
    "nodes": {
      "entry": {
        "text": "Your work begins at a council plate lot laid out on Guther Anvil's bench.",
        "next": "setting",
        "kind": "narration"
      },
      "setting": {
        "text": "The clang of steel on steel echoed from the far benches, two sharp impacts followed by a third, slightly delayed one. The air hung thick with the smell of hot scale and damp cloth. Guther placed a folded work paper next to a tray filled with metal plates. As he did, his thumb left a dark smudge along the edge of the paper.",
        "next": "opening",
        "kind": "narration"
      },
      "opening": {
        "text": "Hey, [player name]. I see you standing idle. Feels good, does it? Not to me! Come here. I've got work for you. The council's sent more plates. Worker numbers again.",
        "next": "options",
        "kind": "speech",
        "speaker": "Guther"
      },
      "options": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "When do we get paid?",
            "next": "payQuestion"
          },
          {
            "label": "Listen to the work instructions.",
            "next": "instructions"
          }
        ]
      },
      "payQuestion": {
        "text": "When do we get paid?",
        "next": "payAnswer",
        "kind": "speech",
        "speaker": "Player"
      },
      "payAnswer": {
        "text": "Listen, [player name]. The inspector signs for the plates first. Then we get paid. That's what the council told us, and that's what they'll keep saying. So don't worry about it. And don't blame me.",
        "next": "payOptions",
        "kind": "speech",
        "speaker": "Guther"
      },
      "payOptions": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "And you believe them?",
            "next": "press"
          },
          {
            "label": "Leave it there.",
            "next": "instructions"
          }
        ]
      },
      "press": {
        "text": "And you believe them?",
        "next": "pressAnswer",
        "kind": "speech",
        "speaker": "Player"
      },
      "pressAnswer": {
        "text": "No. They didn't ask me. But you should believe me.",
        "next": "slidesPaper",
        "kind": "speech",
        "speaker": "Guther"
      },
      "slidesPaper": {
        "text": "Guther slides the paper back toward the plates. He has finished talking about the pay.",
        "next": "instructions",
        "kind": "narration"
      },
      "instructions": {
        "text": "Read the numbers on the paper. Set the number stamps to match. If a plate is bent, decide what to do with it before you use the hammer. Check your work, then bring the paper back to me.",
        "next": "take",
        "kind": "speech",
        "speaker": "Guther"
      },
      "take": {
        "text": "Take the work paper",
        "kind": "handoff"
      }
    }
  },
  "Bellrunner": {
    "location": "Dispatch House",
    "npc": "Hector D. Smoke",
    "source": "bellrunner",
    "start": "setting",
    "nodes": {
      "setting": {
        "text": "Hector takes a bundle of council shift notices from the sorting shelf. A duty bell sounds across the hall.",
        "next": "opening",
        "kind": "narration"
      },
      "opening": {
        "text": "Council notices. That round should've gone with the last runners.",
        "next": "objection",
        "kind": "speech",
        "speaker": "Hector"
      },
      "objection": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "So they'll say I'm late.",
            "next": "playerObjection"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "playerObjection": {
        "text": "So they'll say I'm late.",
        "next": "hectorReply",
        "kind": "speech",
        "speaker": "Player"
      },
      "hectorReply": {
        "text": "I wrote down when you got them. They can come here if they want to argue.",
        "next": "instructions",
        "kind": "speech",
        "speaker": "Hector"
      },
      "instructions": {
        "text": "Take the route sheet. Bring back the marks from whoever takes them.",
        "next": "take",
        "kind": "speech",
        "speaker": "Hector"
      },
      "take": {
        "text": "Take the round",
        "kind": "handoff"
      }
    }
  },
  "Squatter": {
    "location": "Hedge Shelter",
    "npc": "Benny Ben",
    "source": "squatter",
    "start": "setting",
    "nodes": {
      "setting": {
        "text": "At the Hedge Shelter, Benny Ben sorts a bundle of yarrow. He straightens a bent stem before setting it on the scale.",
        "next": "opening",
        "kind": "narration"
      },
      "opening": {
        "text": "Got a yarrow order today. There's a good patch along the marked path. Just don't strip it bare.",
        "next": "remark",
        "kind": "speech",
        "speaker": "Benny"
      },
      "remark": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "You worry more about the patch than the order.",
            "next": "remarkPlayer"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "remarkPlayer": {
        "text": "You worry more about the patch than the order.",
        "next": "remarkAnswer",
        "kind": "speech",
        "speaker": "Player"
      },
      "remarkAnswer": {
        "text": "I worry about both. Look after the plants, and there's medicine to sell and work to be had next season. Pull them all up now, and what are we left with?",
        "next": "follow",
        "kind": "speech",
        "speaker": "Benny"
      },
      "follow": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "You worry about the plants out in the danger zones too?",
            "next": "followPlayer"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "followPlayer": {
        "text": "You worry about the plants out in the danger zones too?",
        "next": "followAnswer",
        "kind": "speech",
        "speaker": "Player"
      },
      "followAnswer": {
        "text": "Of course I do. And the animals. Poor things, out there with nobody to look after them. I can't do much for those, but we can take care of what's left here.",
        "next": "instructions",
        "kind": "speech",
        "speaker": "Benny"
      },
      "instructions": {
        "text": "Take the good stems. Leave the roots and some plants standing. The amount's on the board. Bring the cuttings back here.",
        "next": "take",
        "kind": "speech",
        "speaker": "Benny"
      },
      "take": {
        "text": "Check the order board",
        "kind": "handoff"
      }
    }
  },
  "Stitcher": {
    "location": "Cinder Row Infirmary",
    "npc": "Claudia Cyka",
    "source": "stitcher",
    "start": "setting",
    "nodes": {
      "setting": {
        "text": "At Cinder Row Infirmary, Claudia's hair and dress are immaculate despite the cramped ward and smoky coal stove. The linen clerk objects to how many clean dressings she has taken. Claudia turns a beautiful smile on him and asks him to check the count again. He goes back to his books. The smile vanishes when he leaves.",
        "next": "opening",
        "kind": "narration"
      },
      "opening": {
        "text": "Two dressings by the door. Get them changed.",
        "next": "remark",
        "kind": "speech",
        "speaker": "Claudia"
      },
      "remark": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "We're nearly out of clean linen.",
            "next": "remarkPlayer"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "remarkPlayer": {
        "text": "We're nearly out of clean linen.",
        "next": "remarkAnswer",
        "kind": "speech",
        "speaker": "Player"
      },
      "remarkAnswer": {
        "text": "I can count. Let them complain. Just don't waste the clean linen.",
        "next": "instructions",
        "kind": "speech",
        "speaker": "Claudia"
      },
      "instructions": {
        "text": "Look at the wounds first. If one's worse than it should be, fetch me. I'm not fixing your mistakes as well.",
        "next": "take",
        "kind": "speech",
        "speaker": "Claudia"
      },
      "take": {
        "text": "Check the ward round",
        "kind": "handoff"
      }
    }
  },
  "Scrapper": {
    "location": "Rust Yard",
    "npc": "Ignatius Smog",
    "source": "scrapper",
    "start": "setting",
    "nodes": {
      "setting": {
        "text": "Rust Yard is full of broken iron and old machines. At the edge of the yard sits a large water pump beside an open drain. Its outer stand has a couple of old metal plates attached.",
        "next": "cough",
        "kind": "narration"
      },
      "cough": {
        "text": "A rough cough comes from behind a pile of scrap. Ignatius Smog walks over with a work slip.",
        "next": "opening",
        "kind": "narration"
      },
      "opening": {
        "text": "That old pump by the drain. Take the metal plates off its stand. Leave the big pipe alone.",
        "next": "remark",
        "kind": "speech",
        "speaker": "Smog"
      },
      "remark": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "You ought to get away from this smoke awhile.",
            "next": "remarkPlayer"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "remarkPlayer": {
        "text": "You ought to get away from this smoke awhile.",
        "next": "remarkAnswer",
        "kind": "speech",
        "speaker": "Player"
      },
      "remarkAnswer": {
        "text": "Fresh air? I've no time for that elitist bourgeois luxury.",
        "next": "instructions",
        "kind": "speech",
        "speaker": "Smog"
      },
      "instructions": {
        "text": "Keep the good pieces. Broken ones go in the scrap heap. I'll check when you're done.",
        "next": "take",
        "kind": "speech",
        "speaker": "Smog"
      },
      "take": {
        "text": "Take the work slip",
        "kind": "handoff"
      }
    }
  },
  "Inkbound": {
    "location": "Civic Copying Office",
    "npc": "Erwin Buro",
    "source": "inkbound",
    "start": "setting",
    "nodes": {
      "setting": {
        "text": "Inside the Civic Copying Office, two open books lie on Erwin Buro's desk. The windows are stained dark with soot. The small brass stand for his inkpot is polished; the cuff showing beneath his coat is frayed.",
        "next": "cuff",
        "kind": "narration"
      },
      "cuff": {
        "text": "Erwin pulls the cuff into place and motions the Inkbound over. One of the books has corrections written in the margin.",
        "next": "opening",
        "kind": "narration"
      },
      "opening": {
        "text": "Ah, there you are. Come, I've a little work requiring a careful hand.",
        "next": "what",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "what": {
        "text": "What needs doing?",
        "next": "reply",
        "kind": "speech",
        "speaker": "Player"
      },
      "reply": {
        "text": "Two winter lists. One's been corrected, but I won't have us sending out a dirty copy. We are a respectable office.",
        "next": "backStreet",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "backStreet": {
        "text": "We're in a back street.",
        "next": "streetReply",
        "kind": "speech",
        "speaker": "Player"
      },
      "streetReply": {
        "text": "A respectable office in a back street. There's no shame in that.",
        "next": "turn",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "turn": {
        "text": "He turns the corrected book towards the player.",
        "next": "direction",
        "kind": "narration"
      },
      "direction": {
        "text": "Check where the numbers differ, then write them out neatly. The good paper's on the desk.",
        "next": "pay",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "pay": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "And the pay?",
            "next": "payPlayer"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "payPlayer": {
        "text": "And the pay?",
        "next": "payReply",
        "kind": "speech",
        "speaker": "Player"
      },
      "payReply": {
        "text": "Regrettably, there's no separate fee for putting our own books right.",
        "next": "follow",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "follow": {
        "text": "Your response",
        "kind": "choice",
        "choices": [
          {
            "label": "So nothing?",
            "next": "followPlayer"
          },
          {
            "label": "Continue",
            "next": "instructions",
            "ui": true
          }
        ]
      },
      "followPlayer": {
        "text": "So nothing?",
        "next": "followReply",
        "kind": "speech",
        "speaker": "Player"
      },
      "followReply": {
        "text": "Aye, nothing. You think I'm pleased about it?",
        "next": "instructions",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "instructions": {
        "text": "If a number's hard to read, mark it for me. Don't go guessing and waste a good sheet.",
        "next": "take",
        "kind": "speech",
        "speaker": "Erwin"
      },
      "take": {
        "text": "Take the work sheet",
        "kind": "handoff"
      }
    }
  }
};
