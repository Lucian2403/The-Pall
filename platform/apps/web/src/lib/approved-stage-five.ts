/** Approved Millhand Stage 5 R03 (owner-revised Read the demand exchange and common dialogue). No fabricated debt amount or combat results.
 * docs/05-gameplay/onboarding/millhand/stage-5-approved-script.md
 */
import type {WageClaimState,WageClaimPhase,WageClaimAction} from '@the-pall/game-core';
type Beat={speaker:'Flint'|'Player'|'Narration';text:string};

export const WAGE_CLAIM_OPENING=
  'Flint steps into your way and shoves a folded paper towards you.';

export const WAGE_CLAIM_DIALOGUE:{
  OPENING:readonly Beat[];
  COMMON_EXCHANGE:readonly Beat[];
  CORNERED_EXCHANGE:readonly Beat[];
}={
  OPENING:[
    {speaker:'Flint',text:"You worked on Anvil's plates?"},
    {speaker:'Player',text:'Yeah. What of it?'},
    {speaker:'Flint',text:"Lot's been stopped. Boss wants his money. Says you're paying."},
    {speaker:'Player',text:"Paying for what? I ain't even got my wages!"},
    {speaker:'Flint',text:"Don't care. I came to collect."}
  ],
  COMMON_EXCHANGE:[
    {speaker:'Player',text:"But that number's been cancelled. The man's dead. Died in the fire."},
    {speaker:'Flint',text:"Well, I didn't put it there."},
    {speaker:'Player',text:'Who did, then?'},
    {speaker:'Flint',text:"How should I know? They don't tell us that stuff."},
    {speaker:'Player',text:"So you know it's wrong, and you still want me to pay?"},
    {speaker:'Narration',text:'Flint scratches his chin, then looks back at you.'},
    {speaker:'Flint',text:'Yeah.'}
  ],
  CORNERED_EXCHANGE:[
    {speaker:'Player',text:"I'm going home."},
    {speaker:'Narration',text:'Flint folds the paper. He moves farther across the passage, leaving too little room for you to pass without going around him.'},
    {speaker:'Flint',text:"Not till I've got the money."},
    {speaker:'Player',text:"They didn't pay me a coin."},
    {speaker:'Flint',text:'I heard you.'},
    {speaker:'Narration',text:'Flint takes hold of his club. A work cart stands to one side of the passage.'},
    {speaker:'Player',text:'Move.'},
    {speaker:'Flint',text:'No.'}
  ]
};
const APPROACH={
  read:[
    {speaker:'Narration',text:"You snatch the paper and unfold it. There's the plate lot number. And that worker number again. The same one the council had marked as cancelled.\n\nYou read further. They've put a charge against your name for the delay. But your wages? Not a word about those.\n\nBloody hell. They haven't paid you a penny, and now they want money from you."},
    {speaker:'Player',text:"Why's this on me?"},
    {speaker:'Flint',text:"You did the job, didn't you? Boss wants his money."}
  ],
  challenge:[
    {speaker:'Player',text:'Who gave you the right to take money from me? The council?'},
    {speaker:'Flint',text:'The contractor sent me. I work for him.'},
    {speaker:'Narration',text:'Flint holds the paper where you can read it. You find the lot reference, the cancelled worker number and the charge entered against you. There is no record of wages paid to you.'}
  ]
} as const satisfies Record<'read'|'challenge',readonly Beat[]>;

const EVIDENCE={
  restamp:[
    {speaker:'Player',text:"I took metal plates to the depot. The clerk recorded them as plates. I've got the receipt."},
    {speaker:'Flint',text:"They've written ‘workers’ on mine."},
    {speaker:'Narration',text:'Flint keeps his paper. He gives no explanation for the difference.'}
  ],
  contracts:[
    {speaker:'Player',text:'I went to Contracts. They recorded the man as dead in one place and active in another. The clerk took my complaint.'},
    {speaker:'Flint',text:'Nobody told me.'},
    {speaker:'Narration',text:'Flint has no reply to the two council entries. His demand is still from the contractor, not the Contracts clerk.'}
  ],
  records:[
    {speaker:'Player',text:'I checked the records. They kept putting that number in the wage books after the man died.'},
    {speaker:'Flint',text:"Then go and tell them. I don't keep the books."},
    {speaker:'Narration',text:'Flint does not know who altered the records.'}
  ]
} as const satisfies Record<WageClaimState['branch'],readonly Beat[]>;

export function wageClaimBeat(s:WageClaimState):Beat|null {
  let beats:readonly Beat[]=[];
  switch(s.phase){
    case 'OPENING':beats=WAGE_CLAIM_DIALOGUE.OPENING;break;
    case 'APPROACH_EXCHANGE':beats=s.approach?APPROACH[s.approach]:[];break;
    case 'COMMON_EXCHANGE':beats=WAGE_CLAIM_DIALOGUE.COMMON_EXCHANGE;break;
    case 'EVIDENCE_EXCHANGE':beats=EVIDENCE[s.branch];break;
    case 'CORNERED_EXCHANGE':beats=WAGE_CLAIM_DIALOGUE.CORNERED_EXCHANGE;break;
    default:return null;
  }
  return beats[s.dialogueIndex]??null;
}
export const WAGE_CLAIM_INSTRUCTIONS:Record<WageClaimPhase,string>={
  OPENING:'Speak with Flint.',
  CHOOSE_APPROACH:'Check the demand or ask who sent Flint.',
  APPROACH_EXCHANGE:'Speak with Flint.',
  COMMON_EXCHANGE:'Speak with Flint.',
  CHOOSE_EVIDENCE:'Tell Flint what you found in your second job.',
  EVIDENCE_EXCHANGE:'Speak with Flint.',
  LEAVING:'Tell Flint you are leaving.',
  CORNERED_EXCHANGE:'Flint will not let you pass.',
  CHOOSE_STANCE:'Choose your position before Flint comes at you.',
  DONE:'Your position is chosen. The fight begins in Stage 6.'
};
export const WAGE_CLAIM_ACTION_LABELS:Record<WageClaimAction,string>={
  continue_dialogue:'Continue',
  read_demand:'Read the demand',
  challenge_authority:'Ask who sent Flint',
  share_route_evidence:'Tell Flint what you found',
  say_going_home:"I'm going home.",
  brace_and_defend:'Brace and defend',
  keep_moving:'Keep moving',
  use_cart_as_cover:'Use the cart as cover',
  previous_dialogue:'← Previous dialogue'
};
export const WAGE_CLAIM_STANCE_OUTCOMES={
  brace:'You plant your feet and raise your arms to protect your head and body.',
  moving:'You move to the side, trying to get past Flint before he closes the space.',
  cart:'You move behind the nearby work cart, keeping it between you and Flint for the beginning of the fight.'
} as const;

export const WAGE_CLAIM_DEMAND_INSPECTION=
  "The contractor's paper names the disputed plate lot and the cancelled worker number. A processing charge is assigned to you. No wages have been recorded as paid to you. The amount of the charge is not given.";
/** Visual-only description derived from the owner-provided standing Flint cutout. */
export const WAGE_CLAIM_FLINT_INSPECTION=
  'Flint is a broad, thickset man in a battered brimmed hat and an eyepatch. Leather braces cross his worn, rolled-sleeve shirt. His trousers are patched, his boots heavy, and he grips a metal-banded wooden club.';
export const WAGE_CLAIM_CLUB_INSPECTION=
  'Flint has a short club at his side. You cannot take it from him by examining it.';
export const WAGE_CLAIM_CART_INSPECTION=
  'A work cart stands against one side of the passage. Flint is blocking the way ahead.';

const STAGES:WageClaimPhase[]=[
  'OPENING','CHOOSE_APPROACH','APPROACH_EXCHANGE','COMMON_EXCHANGE',
  'CHOOSE_EVIDENCE','EVIDENCE_EXCHANGE','LEAVING','CORNERED_EXCHANGE','CHOOSE_STANCE','DONE'
];
export function wageClaimJournal(s:WageClaimState):string[]{
  const entries:string[]=[];
  const reached=(phase:WageClaimPhase)=>STAGES.indexOf(s.phase)>=STAGES.indexOf(phase);
  if(reached('CHOOSE_APPROACH'))
    entries.push("I was heading home when Flint stopped me in the passage. The contractor wants money because the council held up Anvil's plates. What a fine business. They haven't paid us, and now they want me to pay them.");
  if(s.approach && reached('COMMON_EXCHANGE'))
    entries.push("I checked the contractor's paper. They've put the charge against me, and there's that same dead worker's number again. Flint wasn't sent by the council. The contractor sent him. He came for money, nothing else.");
  if(reached('LEAVING')){
    entries.push(s.branch==='restamp'
      ?"I told Flint I delivered metal plates. The depot clerk recorded them properly, and I have the receipt. The contractor's paper had workers written on it. Still no answer for that."
      :s.branch==='contracts'
      ?"I told him about the two council records and the complaint I made. Nobody had told him. Seems he was only given enough information to collect the money."
      :"I told him about the wages entered after the man's death. Flint didn't know who made those entries. I don't think he much cared, either.");
  }
  if(reached('CHOOSE_STANCE'))
    entries.push("I told him I was going home. He wouldn't move. Took hold of his club instead. I had to decide how to get past him.");
  if(s.stance)entries.push(s.stance==='brace'?'I braced myself.'
    :s.stance==='moving'?'I tried to move around him.':'I used the nearby work cart as cover.');
  return entries;
}
