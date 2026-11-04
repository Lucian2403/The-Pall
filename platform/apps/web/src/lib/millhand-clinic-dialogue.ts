/**
 * Stage 7 clinician presentation, derived solely from the authenticated
 * saved combat condition. The medical engine does not diagnose unnamed
 * illnesses or invent specific wounds/care.
 */
export type ClinicWound={type:string;zone?:string;severity:string};
export type ClinicObservation={
  hp:number;hpMax:number;stamina:number;fatigue:number;
  bleed:number;wounds:readonly ClinicWound[];
};
export type ClinicFinding='unhurt'|'cut'|'other';

/** Spoken only after the player has chosen to speak to the clinician. */
export function clinicianAssessment(
  before:ClinicObservation, finding:ClinicFinding
):string{
  if(finding==='unhurt'){
    return 'No injuries found. No treatment needed.';
  }
  if(finding==='cut'&&before.wounds.some(w=>w.type==='cut')){
    return "Needs cleaning. I'll dress it.";
  }
  if(before.bleed>0){
    return "You're still bleeding. Let me see what needs attention.";
  }
  if(before.wounds.length>0){
    return "The fight has left you hurt. I'll examine what I can see.";
  }
  if(before.hp<before.hpMax){
    return "You've taken a beating. I don't see a cut to dress.";
  }
  return "I've examined you. There's no cut here to dress.";
}

/** Optional physical exhaustion observation, never a fabricated injury. */
export function clinicianFatigue(before:ClinicObservation):string|null{
  return before.fatigue>=25||before.stamina<=30
    ?"You've worn yourself out as well. Sit and rest a moment."
    :null;
}

/** Short RP discharge wording; the server handles all actual care. */
export function clinicianDischarge(finding:ClinicFinding):string{
  return finding==='unhurt'
    ?"The examination's done. No treatment needed. You're free to go."
    :"That's done. You're fit to get back on your feet.";
}
