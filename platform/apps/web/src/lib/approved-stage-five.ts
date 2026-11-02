/**
 * Approved Stage 5 Revision 01. Keep the player's actual branch only.
 * UI dialogue is authored copy, separate from game-core state transitions.
 */
import type {WageClaimState} from '@the-pall/game-core';
type Beat={speaker:string|null;text:string};
export const OPENING_BEATS:readonly Beat[]=[
  {speaker:null,text:'You enter the narrow passage on your way home. A man steps into your path. He has a short club at his side and a folded paper in one hand.'},
  {speaker:'Flint',text:'You did the plate work for Anvil?'},
  {speaker:'You',text:'Yes.'},
  {speaker:'Flint',text:"They've stopped that lot. The contractor wants money for the delay. They've got you down for the job."},
  {speaker:'You',text:"I haven't been paid for that work."},
  {speaker:'Flint',text:"I wasn't sent to pay you."},
  {speaker:null,text:'Flint holds out the folded paper.'}
];
export const DEMAND_RESPONSES:{
  read:readonly Beat[];challenge:readonly Beat[];
}={
  read:[
    {speaker:null,text:"You read the contractor's paper. You find the disputed plate lot reference and the same cancelled worker number you found in the council's records. The contractor has entered a processing charge against you as the worker assigned to the lot. There is no record of wages being paid to you."},
    {speaker:'You',text:'Why have they put the charge on me?'},
    {speaker:'Flint',text:"They've got you down for the work. The contractor sent me to collect it."}
  ],
  challenge:[
    {speaker:'You',text:'Who gave you the right to take money from me? The council?'},
    {speaker:'Flint',text:'The contractor sent me. I work for him.'},
    {speaker:null,text:'Flint holds the paper where you can read it. You find the lot reference, the cancelled worker number and the charge entered against you. There is no record of wages paid to you.'}
  ]
};
export const COMMON_BEATS:readonly Beat[]=[
  {speaker:'You',text:'That worker number was cancelled. The man died in the fire.'},
  {speaker:'Flint',text:"I didn't put it on there."},
  {speaker:'You',text:'Who did?'},
  {speaker:'Flint',text:"Don't know. They don't tell men like us."},
  {speaker:'You',text:'And you still want me to pay?'},
  {speaker:'Flint',text:'Yes.'}
];
export const ROUTE_EVIDENCE:{
  restamp:readonly Beat[];contracts:readonly Beat[];records:readonly Beat[];
}={
  restamp:[
    {speaker:'You',text:"I took metal plates to the depot. The clerk recorded them as plates. I've got the receipt."},
    {speaker:'Flint',text:"They've written ‘workers’ on mine."},
    {speaker:null,text:'Flint keeps his paper. He gives no explanation for the difference.'}
  ],
  contracts:[
    {speaker:'You',text:'I went to Contracts. They recorded the man as dead in one place and active in another. The clerk took my complaint.'},
    {speaker:'Flint',text:'Nobody told me.'},
    {speaker:null,text:'Flint has no reply to the two council entries. His demand is still from the contractor, not the Contracts clerk.'}
  ],
  records:[
    {speaker:'You',text:'I checked the records. They kept putting that number in the wage books after the man died.'},
    {speaker:'Flint',text:"Then go and tell them. I don't keep the books."},
    {speaker:null,text:'Flint does not know who altered the records.'}
  ]
};
export const CORNERED_BEATS:readonly Beat[]=[
  {speaker:null,text:'Flint folds the paper. He moves farther across the passage, leaving too little room for you to pass without going around him.'},
  {speaker:'Flint',text:"Not till I've got the money."},
  {speaker:'You',text:"They didn't pay me a coin."},
  {speaker:'Flint',text:'I heard you.'},
  {speaker:null,text:'Flint takes hold of his club. A work cart stands to one side of the passage.'},
  {speaker:'You',text:'Move.'},
  {speaker:'Flint',text:'No.'}
];
export const POSITION_RESULTS={
  brace:'You plant your feet and raise your arms to protect your head and body.',
  moving:'You move to the side, trying to get past Flint before he closes the space.',
  cart:'You move behind the nearby work cart, keeping it between you and Flint for the beginning of the fight.'
} as const;
export const WAGE_CLAIM_LABELS={
  continue_dialogue:'Continue',
  read_demand:'Read the demand',
  ask_who_sent:'Ask who sent him',
  share_route_evidence:'Tell Flint what you found',
  tell_going_home:"I'm going home.",
  brace_and_defend:'Brace and defend',
  keep_moving:'Keep moving',
  use_cart_cover:'Use the cart as cover'
} as const;
export function wageClaimJournal(s:WageClaimState):string[]{
  const result=[
    "I was heading home when Flint stopped me in the passage. The contractor wants money because the council held up Anvil's plates. What a fine business. They haven't paid us, and now they want me to pay them."
  ];
  if(s.demandChoice)result.push(
    "I checked the contractor's paper. They've put the charge against me, and there's that same dead worker's number again. Flint wasn't sent by the council. The contractor sent him. He came for money, nothing else."
  );
  if(s.evidenceShared){
    if(s.branch==='restamp')result.push(
      "I told Flint I delivered metal plates. The depot clerk recorded them properly, and I have the receipt. The contractor's paper had workers written on it. Still no answer for that."
    );
    if(s.branch==='contracts')result.push(
      "I told him about the two council records and the complaint I made. Nobody had told him. Seems he was only given enough information to collect the money."
    );
    if(s.branch==='records')result.push(
      "I told him about the wages entered after the man's death. Flint didn't know who made those entries. I don't think he much cared, either."
    );
  }
  if(['CORNERED','CHOOSE_POSITION','FIGHT_PENDING'].includes(s.phase))
    result.push("I told him I was going home. He wouldn't move. Took hold of his club instead. I had to decide how to get past him.");
  if(s.stance==='brace')result.push('I braced myself.');
  if(s.stance==='moving')result.push('I tried to move around him.');
  if(s.stance==='cart')result.push('I used the nearby work cart as cover.');
  return result;
}
