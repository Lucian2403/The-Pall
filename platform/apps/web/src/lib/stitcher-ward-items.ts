/** Persistent Clinic supplies and the separate phase-dependent uses.
 * These are ward-owned examination props, never character inventory.
 * Server actions remain authoritative for progress and supplies. */
export type StitcherWardItemKey='shears'|'basin'|'dressings'|'register';
export type StitcherWardItem={
  readonly key:StitcherWardItemKey;
  readonly image:string;
  readonly label:string;
  readonly observation:string;
};
export const STITCHER_WARD_ITEMS:readonly StitcherWardItem[]=[
  {
    key:'shears',image:'/locations/stitcher/linen-shears.webp',label:'Linen Shears',
    observation:'These shears can cut clean linen to fit a dressing or remove a soiled end.'
  },
  {
    key:'basin',image:'/locations/stitcher/wash-basin.webp',label:'Wash Basin',
    observation:'Clean water has been set aside for the ward dressing round.'
  },
  {
    key:'dressings',image:'/locations/stitcher/clean-dressings.webp',label:'Clean Dressings',
    observation:'The ward keeps clean linen here, including ready-cut dressings.'
  },
  {
    key:'register',image:'/locations/stitcher/ward-register.webp',label:'Ward Register',
    observation:'This book is used to record which beds received care and how much linen was used.'
  }
];
export type StitcherItemAction={
  readonly key:StitcherWardItemKey;readonly action:string
};
const ACTIONS_BY_PHASE:Readonly<Record<string,readonly StitcherItemAction[]>>={
  prepare:[{key:'shears',action:'prep_cut'},{key:'dressings',action:'prep_ready'}],
  linen_fix:[{key:'shears',action:'trim_end'},{key:'dressings',action:'discard_end'}],
  record:[{key:'register',action:'record_linen'}]
};
/** Non-relevant tools stay inspectable. This list only hides old text buttons. */
export function stitcherItemActions(stage:number,phase:string,allowed:readonly string[]):readonly StitcherItemAction[]{
  return stage===2?(ACTIONS_BY_PHASE[phase]??[]).filter(item=>allowed.includes(item.action)):[];
}
/** Never show the ward tray in corridors, records or Stages IV–V. */
export function stitcherWardSuppliesVisible(stage:number,environment:string):boolean{
  return stage>=1&&stage<=3&&environment==='ward';
}
