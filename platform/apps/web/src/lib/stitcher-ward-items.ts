/** Item-only interface for the three approved Stage II dressing beats.
 * The API reducer still determines which action is available and what it saves. */
export type StitcherWardItem={
  readonly action:string;
  readonly image:string;
  readonly label:string;
};
const ITEM_BY_PHASE:Readonly<Record<string,readonly StitcherWardItem[]>>={
  prepare:[
    {action:'prep_cut',image:'/locations/stitcher/linen-shears.webp',label:'Linen Shears'},
    {action:'prep_ready',image:'/locations/stitcher/clean-dressings.webp',label:'Clean Dressings'}
  ],
  linen_fix:[
    {action:'trim_end',image:'/locations/stitcher/linen-shears.webp',label:'Linen Shears'},
    {action:'discard_end',image:'/locations/stitcher/clean-dressings.webp',label:'Clean Dressings'}
  ],
  record:[
    {action:'record_linen',image:'/locations/stitcher/ward-register.webp',label:'Ward Register'}
  ]
};
export function stitcherItemActions(stage:number,phase:string,allowed:readonly string[]):readonly StitcherWardItem[]{
  return stage===2?(ITEM_BY_PHASE[phase]??[]).filter(item=>allowed.includes(item.action)):[];
}
