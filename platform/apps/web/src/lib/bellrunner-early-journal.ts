/** Bellrunner first-person diary for the two early witnessed tasks.
 * Lines only appear after the corresponding server-saved decision or inspection. */
export type DispatchJournalState={
 phase:string;route:'direct'|'quieter'|null;noticesOrdered:boolean;
 receipt:'clear'|'book_confirmed'|'noted_unclear'|null
};
export type WrongBellJournalState={
 phase:string;closureRead:boolean;slipRead:boolean;compared:boolean;
 watchmanLine:number;branch:'contracts'|'trauma'|'machinery'|null
};
export function dispatchJournal(s:DispatchJournalState):readonly string[]{
 const lines:string[]=[];
 if(s.phase!=='issued')
  lines.push("Hector gave me a round of council notices to deliver. I took the route sheet with me.");
 if(s.route==='direct')
  lines.push("I chose the direct road to deliver the notices.");
 if(s.route==='quieter')
  lines.push("I took the quieter road with the notices.");
 if(s.receipt==='clear')
  lines.push("The receiving mark was spoiled. I asked for a fresh mark rather than pretend the damaged one would do.");
 if(s.receipt==='book_confirmed')
  lines.push("The mark was unclear, so I checked the receiving book. It confirmed the delivery.");
 if(s.receipt==='noted_unclear')
  lines.push("The receiving mark was unclear. I wrote down what happened instead of claiming to have a good receipt.");
 if(s.phase==='final_notice_taken')
  lines.push("I finished the round and took the final sealed notice. The last delivery was still ahead of me.");
 return lines;
}
export function wrongBellJournal(s:WrongBellJournalState):readonly string[]{
 const lines:string[]=[];
 if(s.closureRead)
  lines.push("The factory gate had a closure notice. The works were shut after men were overcome by dangerous fumes.");
 if(s.slipRead)
  lines.push("I checked the notice for the night shift. The worksite was still meant to receive it.");
 if(s.compared)
  lines.push("The night bell was ringing inside a building that was officially closed. Men were waiting outside, one coughing so hard he could barely stand.");
 if(s.phase==='choice'||s.phase==='committed')
  lines.push("The watchman agreed to take the notice but couldn't give me an official receiving mark. He said the gate would open when the bell rang.");
 if(s.branch==='contracts')
  lines.push("I chose to deliver the notice as ordered and write down that the office was shut. The watchman took it without an authorized receipt.");
 if(s.branch==='trauma')
  lines.push("I warned the crew not to enter the closed factory. One of the men helped the coughing worker away from the gate.");
 if(s.branch==='machinery')
  lines.push("I chose to look at the bell linkage from outside the sealed work area. The bell kept ringing, and I wanted to find out why.");
 return lines;
}
