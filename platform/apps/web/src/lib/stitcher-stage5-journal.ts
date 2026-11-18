/** Approved 18 November Stage V journal prose.
 * Added progressively from saved story state; never invent the route finding.
 * The Stage IV finding is kept separately by the existing ward journal. */
export type Stage5JournalInput={
 stage:number;phase:string;stage5Line?:number;
 stage5Choice?:'papers'|'claudia'|'evidence'|null;
 stage5Witnessed?:boolean;stage5Hold?:boolean;
 stage5Preparation?:'reason'|'cart'|'brace'|null;
 branch?:'trolley'|'consent'|'notes'|null;
};
const EVIDENCE:Readonly<Record<'trolley'|'consent'|'notes',string>>={
 trolley:"I told the attendant what happened at the receiving door. They wanted the man's contract number, and I refused to sign him over.",
 consent:'I told the attendant about the disputed consent form. The clerk had already written down the objection.',
 notes:"I told the attendant what I'd found in the surgeon's notes. The operation is for teaching, not treatment."
};
export function stage5JournalEntries(s:Stage5JournalInput):string[]{
 if(s.stage!==5)return [];
 const lines=[
  "I came back to the side ward, and the man's bed was empty. The sheets were still warm."
 ];
 const pastAttendant=!['exited'].includes(s.phase)&&
  (s.phase!=='attendant'||(s.stage5Line??0)>=1);
 if(pastAttendant)lines.push(
  "For a moment, I thought they'd already taken him. Then an attendant told me he was still on the trolley near the night door."
 );
 const patientSpoke=s.phase==='witness'
  ?(s.stage5Line??0)>0
  :!['exited','attendant','investigate'].includes(s.phase);
 if(patientSpoke)lines.push(
  "I found him at the service passage. He was awake and told us again that he wasn't going anywhere. He'd never agreed to the operation."
 );
 if(s.stage5Witnessed)lines.push(
  "This time, the attendant heard him too. He promised not to let anyone move the trolley until the matter was settled.",
  'At least someone else is standing up for him now.'
 );
 if(s.stage5Choice==='papers')lines.push(
  "I checked the transfer papers. Nobody had signed the man over yet. That gives us a little time, though I don't know how much."
 );
 if(s.stage5Choice==='claudia')lines.push(
  "I went to get Claudia. She wasn't happy about the trouble, but she ordered them to leave the trolley where it was."
 );
 if(s.stage5Choice==='evidence'&&s.branch)lines.push(EVIDENCE[s.branch]);
 if(['door','prepare_door','door_reply','fight_ready'].includes(s.phase)){
  lines.push("Then Owler turned up at the night door. He'd been paid to take the man to the school, and he wanted the papers.");
  if(s.phase!=='door'||(s.stage5Line??0)>1)lines.push(
   "I told him the patient wasn't going anywhere.",
   "He didn't like that one bit."
  );
 }
 if(s.stage5Preparation==='reason')lines.push(
  "I tried explaining that the man had refused and that the attendant heard him. Owler didn't care. He'd been paid to finish the job."
 );
 if(s.stage5Preparation==='cart')lines.push(
  "I pushed an empty ward cart across the doorway. It wasn't much, but at least Owler couldn't walk straight past me."
 );
 if(s.stage5Preparation==='brace')lines.push(
  "I stood in the doorway to keep Owler from getting through. He's a strong man. This could get ugly."
 );
 return lines;
}
