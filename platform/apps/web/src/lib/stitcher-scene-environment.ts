/** Branch-specific locations inside Cinder Row Infirmary.
 * Stage V returns all three Stage IV routes to the corridor.
 * The audio remains owned by the existing clinicBackdrop shell. */
export type StitcherSceneEnvironment='ward'|'corridor'|'records';
export const STITCHER_SCENE_ART:Readonly<Record<StitcherSceneEnvironment,{
  image:string;alt:string;place:string;
}>>={
  ward:{
    image:'/locations/clinic/clinic-workshop-cold.webp',
    alt:'A working-class infirmary ward. Two cots stand beside curtains, with clean linen and medicine cupboards nearby.',
    place:'Cinder Row Infirmary'
  },
  corridor:{
    image:'/locations/stitcher/service-corridor.webp',
    alt:'Cinder Row Infirmary service corridor, with medicine shelves, linen crates and an arched passage to the receiving door.',
    place:'Infirmary service corridor'
  },
  records:{
    image:'/locations/stitcher/notes-for-the-living-room.webp',
    alt:'The infirmary records room, lined with medical ledgers and paper files. An open register and handwritten notes lie beneath a desk lamp.',
    place:'Infirmary records room'
  }
};
export function stitcherSceneEnvironment(stage:number,branch:string|null,phase?:string):StitcherSceneEnvironment{
  // Empty bed and witness hold take place back in the ward. Owler's arrival
  // switches to the existing service-passage painting, not before.
  if(stage===5)return phase&&['exited','attendant','investigate','witness','hold'].includes(phase)
    ?'ward':'corridor';
  if(stage===4&&branch==='trolley')return 'corridor';
  // Both Contracts (The Signed Consent) and Investigation (Notes for the Living)
  // use the same approved infirmary records-room painting.
  if(stage===4&&(branch==='consent'||branch==='notes'))return 'records';
  return 'ward';
}
/** Backwards compatible helper for earlier corridor-only checks. */
export function stitcherUsesServiceCorridor(stage:number,branch:string|null):boolean{
  return stitcherSceneEnvironment(stage,branch)==='corridor';
}
