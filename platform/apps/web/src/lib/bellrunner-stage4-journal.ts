/** Bellrunner Stage 4 diary, following the owner-approved Millhand journal.
 *
 * Canon: docs/05-gameplay/onboarding/millhand/stages-1-4-approved-journal.md.
 * Personal, first-person observations only; no Work/Status/Method ledger.
 * Each entry must be justified by a persisted Stage 4 choice or discovery.
 * This is presentation copy, not a source of gameplay rewards or state.
 */
import type {StageFourBranch,StageFourPhase} from '$lib/bellrunner-stage4-copy';

export type BellrunnerJournalState={
  branch:StageFourBranch;
  phase:StageFourPhase;
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
