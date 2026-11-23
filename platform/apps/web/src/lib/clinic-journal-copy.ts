/** Established Stage VII first-person Journal text, shared with immutable snapshots. */
export type ClinicJournalInput={
 paid:boolean;outcome:'player_victory'|'player_defeat';
 conditionType:'unhurt'|'cut'|'other'
};
export function clinicJournal(origin:'Millhand'|'Bellrunner',clinic:ClinicJournalInput):string{
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
