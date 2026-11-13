/** Approved S05-A Show Your Papers / S05-B Gate Barred, verbatim spoken script.
 * Source: docs/05-gameplay/onboarding/bellrunner/dogman-confrontation.md.
 */
export type DogmanBranch='contracts'|'trauma'|'machinery';
export type DogmanPhase='arrival'|'papers'|'reply'|'demand'|'gate'|'done';
export type DogmanReply='ask_orders'|'keep_sheet'|'tell_him';
export type DogmanStance='street'|'cart'|'defend';
export type DogmanAction='continue'|DogmanReply|'step_street'|'use_cart'|'protect_bag';
export type DogmanLine={speaker:'Narration'|'Player'|'Dogman';text:string};

export const DOGMAN_ASSETS={
  background:'/locations/bellrunner/industrial-alley.webp',
  standing:'/characters/dogman/dogman-standing.webp',
  defeated:'/characters/dogman/dogman-defeated.webp',
  ambience:'/audio/the-pall/night-alley-ambience.mp3'
} as const;
export const DOGMAN_ARRIVAL:DogmanLine={
  speaker:'Narration',text:'Dogman steps away from the service gate and stops the courier.'
};
export const DOGMAN_PAPERS:readonly DogmanLine[]=[
  {speaker:'Dogman',text:"You're the runner who brought the night notice?"},
  {speaker:'Player',text:'Yes. What do you want?'},
  {speaker:'Dogman',text:"Let's see your papers. The route sheet, and anything you've written down."},
  {speaker:'Player',text:'Who are you working for?'},
  {speaker:'Dogman',text:'The Shift Marshal.'},
  {speaker:'Player',text:'Are you one of his guards?'},
  {speaker:'Dogman',text:"No. I work for him. Now let me see what you've got."}
];
export const DOGMAN_ANSWERS={
  ask_orders:[
    {speaker:'Player',text:'Have you got anything in writing that says I have to give them to you?'},
    {speaker:'Dogman',text:"No. I've told you who I work for."},
    {speaker:'Player',text:"That's not the same thing."}
  ],
  keep_sheet:[
    {speaker:'Player',text:"You can look at the route sheet while I hold it. I'm not handing it over."},
    {speaker:'Dogman',text:"I don't need you to read it to me. I want to know what you've been doing here."}
  ],
  tell_him:{
    contracts:[
      {speaker:'Player',text:"I took the letter to the watchman. Then I went to the shift office. They're marking men absent for refusing to go into a closed building."},
      {speaker:'Dogman',text:"You were sent to deliver a letter. You didn't need to go asking about the shift book."}
    ],
    trauma:[
      {speaker:'Player',text:'The gate says the place is closed, and men were standing there coughing. I told them not to go in. Then I helped at the infirmary.'},
      {speaker:'Dogman',text:"You shouldn't have told them to stay out. They can make up their own minds."}
    ],
    machinery:[
      {speaker:'Player',text:'The safety shutoff was down, but the bell was still working. I went with the mechanic to see why.'},
      {speaker:'Dogman',text:'Then you should have left it to the mechanic. You had a delivery to make.'}
    ]
  }
} as const;
export const DOGMAN_DEMAND:readonly DogmanLine[]=[
  {speaker:'Dogman',text:"You're finished here. Give me the papers and go."},
  {speaker:'Player',text:"I'm leaving. I'm not giving you my papers."}
];
export const DOGMAN_GATE:readonly DogmanLine[]=[
  {speaker:'Narration',text:'Dogman steps into the way. The courier turns toward the open street, but Dogman moves to block it. A work cart stands nearby.'},
  {speaker:'Player',text:"I'm done talking. Let me go home."},
  {speaker:'Dogman',text:'Put the papers down.'},
  {speaker:'Player',text:"No. They're not yours."},
  {speaker:'Dogman',text:"Then I'll take them off you."},
  {speaker:'Narration',text:"Dogman reaches toward the courier's bag. The courier pulls back. He draws a short club."},
  {speaker:'Player',text:"Don't touch my bag."},
  {speaker:'Dogman',text:'Then stop pulling away.'}
];
export const DOGMAN_ACTION_LABELS:Record<DogmanAction,string>={
  continue:'Continue',
  ask_orders:'Ask to see his orders',
  keep_sheet:'Keep hold of the route sheet',
  tell_him:'Tell him what happened',
  step_street:'Step back toward the open street',
  use_cart:'Move behind the work cart',
  protect_bag:'Stand your ground and protect the bag'
};
export const DOGMAN_STANCE_NOTES:Record<DogmanStance,string>={
  street:'You move back toward the open street, making room between you and Dogman.',
  cart:'You move behind the work cart, keeping the obstruction between you and Dogman.',
  defend:'You stand your ground, pulling the bag close and watching the club.'
};
export type DogmanViewState={
  branch:DogmanBranch;phase:DogmanPhase;line:number;
  reply:DogmanReply|null;stance:DogmanStance|null
};
export function dogmanLine(s:DogmanViewState):DogmanLine|null{
  if(s.phase==='arrival')return DOGMAN_ARRIVAL;
  if(s.phase==='papers')return DOGMAN_PAPERS[s.line]??null;
  if(s.phase==='reply'){
    if(s.reply==='tell_him')return DOGMAN_ANSWERS.tell_him[s.branch][s.line]??null;
    if(s.reply==='ask_orders'||s.reply==='keep_sheet')return DOGMAN_ANSWERS[s.reply][s.line]??null;
  }
  if(s.phase==='demand')return DOGMAN_DEMAND[s.line]??null;
  if(s.phase==='gate')return DOGMAN_GATE[s.line]??null;
  return null;
}
export function dogmanJournal(s:DogmanViewState):readonly string[]{
  const entries:string[]=[
    "I was heading back through the outside service passage when a man stepped away from the gate and stopped me."
  ];
  if(s.phase==='arrival')return entries;
  entries.push("He calls himself Dogman. Says he works for the Shift Marshal, but he isn't one of the city guards. He wants my route sheet and anything I've written down.");
  if(s.reply==='ask_orders')entries.push("I asked him for an order in writing. He couldn't show me one.");
  if(s.reply==='keep_sheet')entries.push("I kept hold of my route sheet. I wasn't about to hand it over to a man who couldn't say what right he had to it.");
  if(s.reply==='tell_him'){
    if(s.branch==='contracts')entries.push("I told him about the workers marked absent because they wouldn't enter the closed factory. He said it wasn't my business.");
    if(s.branch==='trauma')entries.push("I told him about the men coughing outside the closed factory and how I'd helped at the infirmary. He didn't like the warning I'd given them.");
    if(s.branch==='machinery')entries.push("I told him the shutoff was down but the bell still worked. He said I should have left it to the mechanic.");
  }
  if(s.phase==='gate'||s.phase==='done')
    entries.push("Dogman blocked the street, reached for my bag and drew a club. I pulled away. He wouldn't let me through.");
  if(s.stance){
    const move=s.stance==='street'?'stepped back toward the street'
      :s.stance==='cart'?'moved behind the work cart':'stood my ground and held my bag close';
    entries.push("I "+move+". The fight hasn't been settled.");
  }
  return entries;
}
