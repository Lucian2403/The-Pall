/** Version 1 approved first-person journal copy.
 * Shared by gameplay UI, the authenticated archive writer and migrations.
 * A stored snapshot is never recomputed after completion. */
import type {PlateworkState} from './millhand-platework.js';
import type {SecondJobState} from './millhand-second-job.js';
import type {WageClaimState,WageClaimPhase} from './millhand-wage-claim.js';
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


/** Shared canonical Stitcher findings used in UI and frozen journal snapshots. */
export const STITCHER_STAGE_FINDINGS={
  trolley:'At the receiving door, the clerk wanted the man\'s contract number. Didn\'t even ask his name. I refused to sign him over. He\'s still in the infirmary\'s care, but I doubt that\'s the end of it.',
  consent:'The records show that the man was asleep when they took his thumbprint. Someone also heard him say he never agreed to the operation. For now, they can\'t move him.',
  notes:'I\'ve checked the man\'s treatment notes against the teaching schedule. He doesn\'t need another operation. The doctors want to use him to teach their students. They\'re planning to cut him open for a lesson. And Claudia knows about it. I haven\'t signed him over, but they could still come for him.'
} as const;

/** Completion text for saved Stage V encounters (readable before combat). */
const WAGE_STAGES=[
  'APPROACHING','OPENING','CHOOSE_APPROACH','APPROACH_EXCHANGE','COMMON_EXCHANGE',
  'CHOOSE_EVIDENCE','EVIDENCE_EXCHANGE','LEAVING','CORNERED_EXCHANGE','CHOOSE_STANCE','DONE'
] as const;
const STAGES:WageClaimPhase[]=WAGE_STAGES.slice();
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

export type DogmanViewState={
 branch:'contracts'|'trauma'|'machinery';
 phase:'arrival'|'papers'|'reply'|'demand'|'gate'|'done';line:number;
 reply:'ask_orders'|'keep_sheet'|'tell_him'|null;
 stance:'street'|'cart'|'defend'|null;
};
export function dogmanJournal(s:DogmanViewState):readonly string[]{
  const entries:string[]=[
    "I turned back toward the public street and met a rough-looking man at the service gate. The worksite hands call him Dogman."
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


/** Immutable combat diary text, shared by completion writers and live scenes. */
export type JournalCombatView={
 outcome:'player_victory'|'player_defeat'|null;
 player:{hp:number;hpMax:number;wounds:readonly {severity:string}[]};
};

export function flintOwlerCombatJournal(snapshot:JournalCombatView,isOwler:boolean):string{
 const toughVictory=snapshot.player.hp<=snapshot.player.hpMax/2||
   snapshot.player.wounds.some(wound=>wound.severity==='serious');
 return isOwler
    ?snapshot.outcome==='player_defeat'
      ?"Owler was stronger than I expected. I went down at the night door. The attendant pulled the trolley back, and the ward staff would not let Owler take the man. Claudia told him to leave. I lost the fight, but the man's transfer was cancelled."
      :"Owler tried to force his way past me. I held him off until he backed away. He said he would tell the school I stopped the transfer. I told him to tell them the patient refused. Claudia cancelled this one transfer, and the man stayed in the ward."
    :snapshot.outcome === 'player_defeat'
    ? "Flint beat me. Damn it. I thought I could get past him, but I couldn't. Other workers came when they heard the fight, and he left without taking my money. One of them helped me get to medical care. Still not a coin from the council for those plates. A fine day I've had."
    : toughVictory
      ? "I beat Flint and got past him. That was tough. For a moment I didn't think I'd manage it, not with that club of his. Everybody knows how hard he is to beat. Well, he didn't get a coin out of me. And after all that, the council still hasn't paid us for those plates."
      : "I beat Flint and got past him. That club could've done some damage, but I managed to keep him off me. He didn't get a coin out of me. The council still owes us for the plates, of course.";
}

export function dogmanCombatJournal(snapshot:JournalCombatView):string{
 const toughVictory=snapshot.player.hp<=snapshot.player.hpMax/2||
   snapshot.player.wounds.some(wound=>wound.severity==='serious');
 return snapshot.outcome === 'player_defeat'
    ? "He beat me badly. I went down by the service gate, and the bastard tried to get into my bag. Luckily, some people were coming down the street, and he cleared off before they got too close. Someone helped me towards the clinic. I could barely stand, but at least I still had my route sheet. \nWhatever's going on at that factory, it isn't over yet."
    : toughVictory
      ? "I got past him, but he landed a few good hits. Bastard was quicker than he looked. He finally backed off when he realised he couldn't stop me. At least I kept my papers.\nThe factory's still shut, the night shift's still being called in, and I've no idea who's going to answer for any of it."
      : "Dogman tried to stop me with that thin club. I managed to drive him back and get through the passage. I've still got my bag and route sheet. I don't imagine the Shift Marshal will be pleased, but that doesn't make Dogman a city guard.";
}

/** Original clinic diary copy shared by client and authoritative completion. */
export type ClinicJournalView={paid:boolean;conditionType:'unhurt'|'cut'|'other';outcome:'player_victory'|'player_defeat'};
export function clinicJournal(origin:'Millhand'|'Bellrunner',clinic:ClinicJournalView|null):string{
 return origin==='Bellrunner'
    ?clinic?.paid
      ?clinic.conditionType==='unhurt'
        ?"After Dogman, the clinician found no injuries. Ten coins for the examination, even though I needed no treatment. My papers are safe, and I've ten coins left."
        :"The clinic examined the injuries I took in the fight with Dogman and provided the basic care I needed. It cost ten coins. I've still got my bag and papers."
      :clinic?.outcome==='player_defeat'
        ?"After Dogman knocked me down, a passerby helped me reach the city clinic. I've still got my papers. I'd better have my condition checked."
        :"I got past Dogman and walked to the city clinic. He didn't take my papers. I'll have myself checked before going home."
    :clinic?.paid
      ?clinic?.conditionType==='unhurt'
        ?"They couldn't find anything wrong with me. Good. Still cost ten coins just to be examined. Half my money gone, and I haven't earned a thing today."
        :clinic?.conditionType==='cut'
          ?"The clinician checked me over and treated what they could. Ten coins for the examination and care. I needed the help, but that's half my money gone. Still nothing paid for the council work."
          :"The clinician examined what the fight had done to me. Ten coins for the examination and getting me fit to leave. Half my money gone, and still nothing earned from the council."
      :"Made it to the clinic after the fight with Flint. I've not got much money left, but I ought to get checked.";
}

/** Exact saved home diary copy, shared with completed Stage VIII archive. */
export type HomeJournalView={origin:'Millhand'|'Bellrunner';branch:'restamp'|'contracts'|'records'|'trauma'|'machinery';outcome:'player_victory'|'player_defeat'};
export function homeJournal(home:HomeJournalView|null){
 const routeEntry=home?.origin==='Bellrunner'
    ?home.branch==='contracts'
      ?"The register called workers who refused the condemned building voluntarily absent. They lost their wages for staying out."
      :home.branch==='trauma'
        ?"The medical register called the workers' complaints non-work illness. They were left paying for their own treatment."
        :home.branch==='machinery'
          ?"The safety shutoff was engaged, but the bell linkage was left connected. Someone moved that retaining pin. I don't know who."
          :null
    :home?.branch==='restamp'
      ?'The depot recorded metal plates, though the original manifest called them a transfer of workers.'
      :home?.branch==='contracts'
        ?'Two contradictory official classifications were sealed for the same dead worker number. I lodged an objection.'
        :home?.branch==='records'
          ?'The cancelled worker number appears in a later wage tally. A correction in the records had been scraped away.':null;
 const combatEntry=home?.origin==='Bellrunner'
    ?home.outcome==='player_victory'
      ?"Dogman tried to take my papers, but he backed off when I got past him. I've still got them."
      :"Dogman knocked me down by the service gate and tried to get into my bag. Luckily, some workers came down the street, and the bastard cleared off. A passerby helped me to the clinic. At least I've still got my route sheet."
    :home?.outcome==='player_victory'
      ?'Flint backed away from the passage after our fight.'
      :home?.outcome==='player_defeat'
        ?'Flint beat me. Another worker helped me get to the clinic.':null;
 const homeJournalIntro=home?.origin==='Bellrunner'
    ?"Home at last. Ten coins left after the clinic, and now I've got a rent notice demanding a hundred and fifty. Two jobs done, not a bloody coin earned. And after everything that's happened today, I'm lucky to be home at all. I need to find work that actually pays."
    :"Home at last. Ten coins left after the clinic, and now the rent is a hundred and fifty. Lovely. Two jobs, no wages, and a fight with Flint on top of it. Need to find some work that actually pays.";
 return {routeEntry,combatEntry,homeJournalIntro};
}
