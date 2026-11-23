/** Version 1 approved first-person journal copy.
 * Shared by gameplay UI, the authenticated archive writer and migrations.
 * A stored snapshot is never recomputed after completion. */
import type {PlateworkState} from './millhand-platework.js';
import type {SecondJobState} from './millhand-second-job.js';
export type ReadableMissingStampEvidence = Readonly<{
 workerNumber:string|null;recordedDeathDate:string|null;inspectionDate:string|null;
}>;
export function stageTwoJournal(s:PlateworkState):readonly string[]{
  const entries:string[]=[
    "Guther's put me on the council's worker plates. Got to check the numbers and set the stamps first. I can manage that."
  ];
  const afterStamps=['HANDLE_BENT_PLATE','STAMP','INSPECT','CORRECT',
    'REVIEW','RETURN_PAPER','COMPLETE'].includes(s.phase);
  if(afterStamps){
    entries.push("Got the number from the work paper and set the stamps. One plate has a bent corner. I'll have to deal with that before the lot's finished.");
  }
  if(s.handling==='straighten'){
    entries.push("I straightened the corner and used the same plate. Took more work, but I didn't waste the metal.");
  }else if(s.handling==='replace'){
    entries.push("Put the bent plate aside and took another. Quicker than fixing the old one.");
  }else if(s.handling==='stamp_as_is'&&['INSPECT','CORRECT','REVIEW',
    'RETURN_PAPER','COMPLETE'].includes(s.phase)){
    entries.push("I stamped the plate with its corner still bent. I knew it wasn't lying flat.");
  }
  if(s.markQuality==='POOR'||s.correction!==null){
    entries.push("Part of that number was too faint to read. Had to fix it before handing the work in.");
  }
  if(s.correction==='fix_mark'){
    entries.push("Set the plate steady and stamped the faint part again. The number's clear now.");
  }else if(s.correction==='replace_marked_plate'){
    entries.push("Put the badly marked plate aside and used another. This one's clear.");
  }
  if(s.phase==='RETURN_PAPER'||s.phase==='COMPLETE'){
    entries.push("The plates are marked and checked. I'd like to be paid for this, but the inspector still has to approve the lot.");
  }
  return entries;
}

export function missingStampJournal(
  state: { slipRead: boolean; plateRead: boolean; phase: string; branch: string | null },
  evidence: ReadableMissingStampEvidence | null,
  slip: { workerNumber: string | null; recordedDeathDate: string | null } | null,
  plate: { workerNumber: string | null; inspectionDate: string | null } | null
): readonly string[] {
  const entries: string[] = [
    'I returned the finished work paper to Guther. A returned plate and a folded cancellation slip were with the council\'s papers.'
  ];
  if (slip && state.slipRead)
    entries.push('I read the cancellation slip. The council recorded a worker as dead after a fire in a locked workshop.' +
      (slip.workerNumber ? ' The worker number was ' + slip.workerNumber + '.' : '') +
      (slip.recordedDeathDate ? ' The recorded death date was ' + slip.recordedDeathDate + '.' : ''));
  if (plate && state.plateRead)
    entries.push("I examined a returned plate with a council inspector's mark." +
      (plate.workerNumber ? ' The worker number was ' + plate.workerNumber + '.' : '') +
      (plate.inspectionDate ? ' The mark was dated ' + plate.inspectionDate + '.' : ''));
  if (evidence && state.slipRead && state.plateRead)
    entries.push('Both records carry the same worker number as a plate I stamped. The inspection date is later than the recorded death.');
  if (state.phase === 'DECISION' || state.branch !== null)
    entries.push('I showed Guther the records. He could not explain the dates. He would not approve the disputed lot, and the council had not paid us.');
  if (state.branch === 'restamp')
    entries.push('I chose to stamp the worker number again and deliver the lot to the depot. The inspector\'s mark is not part of my work.');
  if (state.branch === 'contracts')
    entries.push('I chose to take the disputed work paper to the council\'s Contracts office.');
  if (state.branch === 'records')
    entries.push('I wrote down the worker number and chose to check the council\'s records.');
  return entries;
}

export function secondJobJournal(s: SecondJobState): readonly string[] {
  const result: string[] = [];
  if (s.branch === 'restamp') {
    result.push("I stamped the worker number once more at Guther's bench. I did not touch the council inspector's mark.");
    if (s.revision > 0) result.push('I checked the plates and compared the load with the work paper.');
    if (s.transport === 'secured') result.push('I secured the plates together and carried them to the depot as one load.');
    if (s.transport === 'smaller_loads') result.push('I carried the plates in smaller groups. It took more trips, but each load was easier to handle.');
    if (s.phase === 'SPEAK_DEPOT' || s.phase === 'DEPOT_DIALOGUE' || s.phase === 'CHOOSE_RECEIPT' || s.phase === 'COMPLETE_DELIVERY' || s.phase === 'DONE' || s.phase === 'EXITED')
      result.push("Delivered metal plates to the depot. Someone had entered “workers” on the delivery list. Workers! The clerk could see what I'd brought.");
    if (s.receipt === 'recorded_plates') result.push('I recorded the received goods as plates.');
    if (s.receipt === 'requested_correction') result.push('I asked the depot clerk to check the incorrect entry before I signed.');
    if ((s.phase === 'DONE' || s.phase === 'EXITED')) result.push("The depot recorded the goods as plates in the end. I've got a receipt, but I still don't know why that other entry was wrong. No pay for this job, either.");
  }
  if (s.branch === 'contracts') {
    if (!['EXAMINE_PAPER', 'COMPARE_RECORDS'].includes(s.phase))
      result.push('One entry treats the man as dead for compensation. In the other they still charge for him as if he were alive. Both have council seals. How can they accept both?');
    if (s.challenge === 'seal_check') result.push('I asked the clerk to check both seals. Both entries had been accepted. Still no explanation.');
    if (s.challenge === 'written_complaint') result.push('I marked what was wrong on the work paper. The clerk recorded my complaint.');
    if ((s.phase === 'DONE' || s.phase === 'EXITED')) result.push("Got the complaint recorded, but the clerk couldn't change either entry or approve the plate lot. Still the same question, and still no wages.");
  }
  if (s.branch === 'records') {
    if (!['READ_DEATH_REGISTER', 'READ_WAGE_RECORD'].includes(s.phase))
      result.push('Found the worker in the death register. Then I found the same number in later wage records. They were still using it after he died.');
    if (s.phase === 'SPEAK_ARCHIVE' || s.phase === 'ARCHIVE_DIALOGUE')
      result.push('Someone had scraped part of an entry from the page. I could not tell what was written there.');
    if (['CHOOSE_SOURCE', 'RECORD_FINDING', 'DONE','EXITED'].includes(s.phase))
      result.push("Someone scraped writing from an entry. The archive assistant didn't know who had done it. I wasn't going to damage the page any further.");
    if (s.source === 'neighbouring_entries') result.push('I compared the entries around the damaged one. The number is still there in the later wage record.');
    if (s.source === 'shift_book') result.push('I checked the shift book against the wage record. Both have that number after the recorded death.');
    if ((s.phase === 'DONE' || s.phase === 'EXITED')) result.push("Wrote down what I found. Death, wages afterward, and that scraped line. No idea who changed it. I doubt anyone in that room will explain it to me.");
  }
  return result;
}

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
 if(s.stage5Choice==='claudia'&&s.stage5Witnessed)lines.push(
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
 if(s.stage5Preparation==='reason'&&
   (s.phase==='fight_ready'||s.phase==='door_reply'&&(s.stage5Line??0)>0))lines.push(
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

export type BellrunnerJournalState={
  branch:'contracts'|'trauma'|'machinery';
  phase:string;
  openingLine:number;
  registerLine?:number;
  method:string|null;
  observation:string|null;
  priority:'urgent'|'corrected'|null;
  journalFact:string|null;
};

export function bellrunnerStageFourJournal(s:BellrunnerJournalState):readonly string[]{
  const entries:string[]=[];
  const completed=s.phase==='done'||s.phase==='exited';

  if(s.branch==='contracts'){
    entries.push("The works receiving office was shut. The watchman took the letter, but I couldn't get a mark to show they'd received it. I've brought the dispatch slip to the shift office instead.");
    if(s.phase!=='opening'||s.openingLine>=4){
      entries.push("The clerk can write down what happened. He can't pretend the closed works signed for anything.");
    }
    if(s.observation==='matching_closed_work_block'||s.journalFact){
      entries.push("The night crew's still listed in the shift book for the very block that was shut because of the fumes.");
    }
    if(s.journalFact){
      entries.push("They've marked a worker 'Absent by choice' because he wouldn't go inside. That means no wages for him. What sort of choice is that?");
    }
    if(s.method==='request_attendance_basis'){
      entries.push("I asked the clerk what gives them the right to call it a voluntary absence. I want the closure notice taken into account.");
    }else if(s.method==='enter_written_objection'){
      entries.push("I put my objection in writing. The place was shut, and the man was there at the gate. That ought to count for something.");
    }
    if(completed){
      entries.push("The clerk recorded the certificate as disputed, but he couldn't change the man's wage entry. The works still haven't given me a receiving mark.");
    }
  }else if(s.branch==='trauma'){
    entries.push("I saw two workers brought to the first-aid point. The attendant's trying to look after both of them.");
    if(s.phase!=='opening'||s.openingLine>=1){
      entries.push("One man can still walk and talk, though he's coughing. The other's got to stop for breath every time he tries to speak.");
    }
    if(s.priority==='urgent'){
      entries.push("I went to the man who could barely get his words out. He needed the attendant first.");
    }else if(s.priority==='corrected'){
      entries.push("I went for the man still on his feet, but the attendant stopped me. She was right — the other one could barely breathe.");
    }
    if(s.method==='take_observations'){
      entries.push("I asked the other worker what happened outside the factory and wrote it down for the attendant.");
    }else if(s.method==='bring_next_worker'){
      entries.push("When the attendant was ready, I helped the other man over. She asked him what happened and wrote it down herself.");
    }
    const registerSeen=(s.phase==='confirm'&&(s.registerLine??0)>=3)||
      s.phase==='choose'||s.phase==='revelation'||s.phase==='finish'||completed;
    if(registerSeen){
      entries.push("I looked in the medical register. Someone's put 'Non-work illness' beside the entry.");
    }
    if(s.journalFact){
      entries.push("The factory was shut because of the fumes, but the register still leaves the men paying for treatment. I don't see how that's right.");
    }
    if(s.observation==='ask_about_classification'){
      entries.push("I asked why they've called it a non-work illness. It doesn't add up.");
    }
    if(completed){
      entries.push("The attendant said she can't change the charge unless someone with the authority does it. She's got two sick men to look after. I've done what I can here.");
    }
  }else{
    entries.push("The City-Works mechanic stopped me before I got too close to the moving bell linkage. Told me to keep my hands back.");
    if(s.observation==='shutoff_engaged_bell_moving'||s.method||
      s.journalFact){
      entries.push("The ventilation shutoff's engaged, yet the shift bell keeps going. How can it still be working?");
    }
    if(s.method==='trace_bell_rod'){
      entries.push("I followed the bell rod with my eyes. Someone's moved the retaining pin past the safety stop.");
    }else if(s.method==='compare_linkage_marks'){
      entries.push("I compared the linkage marks with the stop. The retaining pin's been shifted, keeping the bell connected.");
    }
    if(s.observation==='mark_pin_position'){
      entries.push("I marked where the pin sat on the work sketch. Didn't touch the moving mechanism.");
    }else if(s.observation==='request_second_check'){
      entries.push("I asked the mechanic to check it again. I'm not putting my hands near that thing while it's moving.");
    }
    if(completed){
      entries.push("The mechanic's got the fault on record. The bell's still linked with the safety shutoff down. We left the machinery alone and stayed outside the closed works.");
    }
  }
  return entries;
}

export type StitcherJournalState={
 stage:number;phase:string;first:'a'|'b'|null;prepared:'cut'|'ready'|null;
 correction:'discard'|'trim'|null;chartRead:boolean;patientHeard:boolean;
 branch:'trolley'|'consent'|'notes'|null;
 stage5Line?:number;stage5Choice?:'papers'|'claudia'|'evidence'|null;
 stage5Witnessed?:boolean;stage5Hold?:boolean;stage5Preparation?:'reason'|'cart'|'brace'|null;
};
export function stitcherWardJournal(s:StitcherJournalState,branchFinding?:string):string[]{
    const entries:string[]=['I went to Cinder Row Infirmary for my shift. Claudia put me to work straight away. Two patients by the door needed fresh bandages, and she wanted them done properly.'];
    if(s.stage>=2)entries.push('No pay for this round, of course. One patient had a small bleeding cut, and the other needed a dirty bandage changed. Nothing too serious, thankfully. Still, I had to be careful.');
    if(s.first)entries.push(s.first==='a'?'I started with the bleeding cut. Seemed better to deal with that first.':'I dealt with the dirty bandage first. The other patient could wait a little.');
    if(s.prepared)entries.push(s.prepared==='cut'?'I cut the clean linen to fit each wound. Took longer, but we haven\'t got much to spare.':'I used the ready-cut bandages. Quicker that way, though I used more linen.');
    if(s.correction)entries.push(s.correction==='trim'
      ?'A clean bandage brushed against the dirty bed rail. Damn nuisance. I cut off the touched end before using it. Couldn\'t put that against someone\'s wound.'
      :'One of the clean bandages touched the dirty bed rail. I had to throw it out and get another. More wasted linen, but I wasn\'t going to risk an infection.');
    if(s.stage>=3){
      entries.push('I found a man lying awake in one of the side rooms. His wrists were strapped to the bed, and someone had drawn blue lines across his skin for an operation. I didn\'t like the look of it.');
      if(s.chartRead)entries.push('I checked his chart. It said: CHARITY PATIENT. TEACHING DEMONSTRATION, DAWN. A teaching demonstration? On a man strapped to his bed? What the hell is going on here?.');
      if(s.patientHeard)entries.push('The man told me they gave him something to make him sleep, then took his thumbprint. He says he never agreed to another operation. I haven\'t checked the papers yet, but I can\'t just ignore what he\'s telling me.');
      if(s.phase==='choose'||s.stage>=4)entries.push("I confronted Claudia. She knows about the operation. The school pays for the fever ward's coal, and she won't give up that money just because the man says no.");
    }
    if(s.branch)entries.push(s.branch==='trolley'
      ?'I decided to follow the trolley. I wanted to see where they were taking the man, and whether I could stop them from handing him over.'
      :s.branch==='consent'
        ?'I went to check the consent form. There\'s a thumbprint on it, but the man says he was asleep when they took it. I wanted to find out what really happened.'
        :"I went to look through the surgeon's notes. I needed to know why they wanted another operation when the man's wound had already been treated.");
    if(s.stage===5){
      if(branchFinding)entries.push(branchFinding);
      entries.push(...stage5JournalEntries(s));
    }
    return entries;
}

