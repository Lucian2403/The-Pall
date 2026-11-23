/** First-person Stage VII diary. One pure source for Current and archival copy.
 * Do not assume a wound, treatment, victory or payment before it is saved. */
import type {FinaleOrigin} from './shared-finale-origins.js';
export type ClinicJournalInput={
 paid:boolean;outcome:'player_victory'|'player_defeat';
 conditionType:'unhurt'|'cut'|'other'
};
export type ClinicJournalPhase='ARRIVAL'|'EXAMINED'|'SPOKEN'|'PRICED'|'PAID'|'LEFT';
export function clinicJournal(origin:FinaleOrigin,clinic:ClinicJournalInput):string{
 if(origin==='Stitcher'){
  return clinic.paid
   ?clinic.conditionType==='unhurt'
     ?"The clinician found no injuries after Owler. I work at Cinder Row, but I still had to pay ten coins just to be examined. The patient remains in ordinary care."
     :"The clinician examined me after the fight with Owler and gave the care I needed. I paid ten coins, even though I work here. The patient is still safe in ordinary care."
   :clinic.outcome==='player_defeat'
     ?"Owler knocked me down, and a ward worker helped me into the infirmary's treatment area. The patient is safe. I ought to have myself checked."
     :"Owler didn't get the patient through the door. The patient remains in ordinary care. I'm at the infirmary's treatment area now to have myself checked.";
 }
 if(origin==='Bellrunner'){
  return clinic.paid
   ?clinic.conditionType==='unhurt'
     ?"After Dogman, the clinician found no injuries. Ten coins for the examination, even though I needed no treatment. My papers are safe, and I've ten coins left."
     :"The clinic examined the injuries I took in the fight with Dogman and provided the basic care I needed. It cost ten coins. I've still got my bag and papers."
   :clinic.outcome==='player_defeat'
     ?"After Dogman knocked me down, a passerby helped me reach the city clinic. I've still got my papers. I'd better have my condition checked."
     :"I got past Dogman and walked to the city clinic. He didn't take my papers. I'll have myself checked before going home.";
 }
 return clinic.paid
  ?clinic.conditionType==='unhurt'
    ?"They couldn't find anything wrong with me. Good. Still cost ten coins just to be examined. Half my money gone, and I haven't earned a thing today."
    :clinic.conditionType==='cut'
      ?"The clinician checked me over and treated what they could. Ten coins for the examination and care. I needed the help, but that's half my money gone. Still nothing paid for the council work."
      :"The clinician examined what the fight had done to me. Ten coins for the examination and getting me fit to leave. Half my money gone, and still nothing earned from the council."
  :"Made it to the clinic after the fight with Flint. I've not got much money left, but I ought to get checked.";
}
const PHASES:readonly ClinicJournalPhase[]=[
 'ARRIVAL','EXAMINED','SPOKEN','PRICED','PAID','LEFT'
];
export function clinicJournalEntries(
 origin:FinaleOrigin,clinic:ClinicJournalInput&{phase:ClinicJournalPhase}
):string[]{
 const reached=(phase:ClinicJournalPhase)=>PHASES.indexOf(clinic.phase)>=PHASES.indexOf(phase);
 const entries=[clinicJournal(origin,{...clinic,paid:false})];
 if(reached('EXAMINED')){
  entries.push(clinic.conditionType==='unhurt'
   ?"The examination found no injuries. I don't need any treatment."
   :clinic.conditionType==='cut'
     ?"The examination found a cut that needs basic care."
     :"The clinician checked the condition the fight left me in.");
 }
 if(reached('PRICED'))entries.push("The clinician told me the examination costs ten coins. Any basic care I actually need is included.");
 if(reached('PAID')&&clinic.paid)entries.push(clinicJournal(origin,{...clinic,paid:true}));
 if(reached('LEFT')&&clinic.paid)entries.push(origin==='Stitcher'
   ?"I left the treatment area and headed for my rented home. The patient's transfer is still cancelled."
   :"I left the clinic and headed for my rented home.");
 return entries;
}
