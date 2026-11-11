/** Owner-approved 2026-11-11 Bellrunner Stage 3 dialogue. Do not paraphrase. */
export const WRONG_BELL_ENTRY=[
  'An official closure notice is nailed to the gate. The block was shut after workers were overcome by dangerous fumes. Several men wait outside, their faces covered with dirty cloth. One is bent over, coughing so hard that another worker has to hold him upright.',
  'The night-shift bell rings from inside the closed building.'
] as const;
export const WATCHMAN_LINES=[
  {speaker:'Watchman',text:'That the night notice?'},
  {speaker:'Player',text:'Aye. But this place is shut. They closed it because the fumes were making men sick.'},
  {speaker:'Watchman',text:"I know. I've been told to let the night crew through anyway."},
  {speaker:'Player',text:"Look at that poor bastard. He can barely breathe. And you're sending them back in?"},
  {speaker:'Watchman',text:"I'm not sending anyone anywhere. My orders are to open the gate when the bell rings."},
  {speaker:'Player',text:"Then why the hell is it still ringing?"},
  {speaker:'Watchman',text:"I don't know. And nobody's bothered to tell me."},
  {speaker:'Player',text:'Well, I need someone to mark my route sheet.'},
  {speaker:'Watchman',text:"Office is shut. I'll take the notice, but I can't sign for them."},
  {speaker:'Player',text:"So I deliver it, and I've nothing to show for it?"},
  {speaker:'Watchman',text:"You can put down that I took it. That's all I can give you."}
] as const;
export const WRONG_BELL_AFTER_WATCHMAN=[
  'The coughing worker tries to straighten up but struggles to catch his breath. The others watch him. Nobody moves toward the gate.',
  'The bell rings again.'
] as const;
export const WRONG_BELL_BRANCHES={
  contracts:{
    name:'Deliver the notice as ordered',action:'choose_contracts' as const,
    lines:[
      {speaker:'Player',text:"All right. Here's your notice. But I'm putting down that the office was shut."},
      {speaker:'Watchman',text:"Fine by me. I'll see it gets inside."}
    ],
    end:'The watchman takes the sealed order. He cannot provide the authorized receiving mark.',
    next:'Attendance Certificate · Commerce / Contracts'
  },
  trauma:{
    name:'Warn the waiting crew',action:'choose_trauma' as const,
    lines:[
      {speaker:'Player',text:"Don't go in there. Look at him, he can barely breathe. You want to end up the same way?"},
      {speaker:'Worker',text:"You think we want to go in? They've rung the bell. We're supposed to be working."},
      {speaker:'Player',text:'The place is shut for a reason. Someone needs to get him looked at.'}
    ],
    before:'One of the workers looks at the coughing man, then back at the gate.',
    end:'The worker hesitates, then helps the coughing man away from the gate.',
    next:'First Aid Line · Medicine / Trauma'
  },
  machinery:{
    name:'Inspect the bell controls',action:'choose_machinery' as const,
    lines:[
      {speaker:'Player',text:"That poor bastard can barely breathe, and the shift bell's still ringing. I'm going to find out why."}
    ],
    end:"From outside the sealed work area, you can see where to access the bell's mechanical linkage and the ventilation controls. The bell continues ringing as the workers wait at the gate.",
    next:'The Bell Linkage · Mechanics / Industrial Machinery'
  }
} as const;
export const HECTOR_DEFERRED=[
  {speaker:'Hector',text:"No mark from the last office. Council won't clear the round without it."},
  {speaker:'Player',text:"The bloody place is shut! They've got men coughing their lungs out at the gate, and they're still calling them in for work."},
  {speaker:'Hector',text:"I know it's shut. That's the problem. Nobody there can give you the proper mark."},
  {speaker:'Player',text:'You sent me there.'},
  {speaker:'Hector',text:"I sent you where the council told me to send you. I've put in that the office was closed. What else do you want me to do?"},
  {speaker:'Player',text:'Pay me for the work I\'ve done, for a start.'},
  {speaker:'Hector',text:"Out of my own pocket? I don't get paid for that round either, you know."},
  {speaker:'Player',text:'So I do the whole bloody round, and get nothing?'},
  {speaker:'Hector',text:"That's what they're saying. I've marked it as disputed, but I can't make them pay. There's other work on the board, if you want it."}
] as const;
