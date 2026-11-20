/** One source of owner-approved Cinder Row diary prose, shared by the
 * live scene and server-confirmed immutable task snapshots. */
import {stage5JournalEntries,type Stage5JournalInput} from './stitcher-stage5-journal.js';
import {STITCHER_ROUTE_UI} from './stitcher-ward-copy';

export type StitcherJournalState=Stage5JournalInput & {
 first?:'a'|'b'|null;prepared?:'cut'|'ready'|null;
 correction?:'trim'|'discard'|null;chartRead?:boolean;patientHeard?:boolean;
};

export function stitcherStageJournal(s:StitcherJournalState,stage:number):readonly string[]{
 const entries:string[]=[];
 if(stage===1){
  entries.push('I went to Cinder Row Infirmary for my shift. Claudia put me to work straight away. Two patients by the door needed fresh bandages, and she wanted them done properly.');
 }
 if(stage===2&&s.stage>=2){
  entries.push('No pay for this round, of course. One patient had a small bleeding cut, and the other needed a dirty bandage changed. Nothing too serious, thankfully. Still, I had to be careful.');
  if(s.first)entries.push(s.first==='a'?'I started with the bleeding cut. Seemed better to deal with that first.':'I dealt with the dirty bandage first. The other patient could wait a little.');
  if(s.prepared)entries.push(s.prepared==='cut'?"I cut the clean linen to fit each wound. Took longer, but we haven't got much to spare.":'I used the ready-cut bandages. Quicker that way, though I used more linen.');
  if(s.correction)entries.push(s.correction==='trim'
   ?"A clean bandage brushed against the dirty bed rail. Damn nuisance. I cut off the touched end before using it. Couldn't put that against someone's wound."
   :"One of the clean bandages touched the dirty bed rail. I had to throw it out and get another. More wasted linen, but I wasn't going to risk an infection.");
 }
 if(stage===3&&s.stage>=3){
  entries.push("I found a man lying awake in one of the side rooms. His wrists were strapped to the bed, and someone had drawn blue lines across his skin for an operation. I didn't like the look of it.");
  if(s.chartRead)entries.push("I checked his chart. It said: CHARITY PATIENT. TEACHING DEMONSTRATION, DAWN. A teaching demonstration? On a man strapped to his bed? What the hell is going on here?.");
  if(s.patientHeard)entries.push("The man told me they gave him something to make him sleep, then took his thumbprint. He says he never agreed to another operation. I haven't checked the papers yet, but I can't just ignore what he's telling me.");
  if(s.phase==='choose'||s.stage>=4)entries.push("I confronted Claudia. She knows about the operation. The school pays for the fever ward's coal, and she won't give up that money just because the man says no.");
  if(s.branch)entries.push(s.branch==='trolley'
    ?'I decided to follow the trolley. I wanted to see where they were taking the man, and whether I could stop them from handing him over.'
    :s.branch==='consent'
      ?"I went to check the consent form. There's a thumbprint on it, but the man says he was asleep when they took it. I wanted to find out what really happened."
      :"I went to look through the surgeon's notes. I needed to know why they wanted another operation when the man's wound had already been treated.");
 }
 if(stage===4&&s.stage>=5&&s.branch){
  entries.push(STITCHER_ROUTE_UI[s.branch].finding);
 }
 if(stage===5&&s.stage===5){
  entries.push(...stage5JournalEntries(s));
 }
 return entries;
}

export function stitcherFullJournal(s:StitcherJournalState):readonly string[]{
 return [1,2,3,4,5].flatMap(stage=>stitcherStageJournal(s,stage));
}
