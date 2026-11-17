/** Stage II's three tool-choice beats. The server remains the sole authority on
 * which action is available; no new persistent items or gameplay branches. */
export type StitcherWardItem={readonly action:string;readonly image:string};
const ITEM_BY_PHASE:Readonly<Record<string,readonly StitcherWardItem[]>>={
  prepare:[
    {action:'prep_cut',image:'/locations/stitcher/linen-shears.webp'},
    {action:'prep_ready',image:'/locations/stitcher/clean-dressings.webp'}
  ],
  linen_fix:[
    {action:'trim_end',image:'/locations/stitcher/linen-shears.webp'},
    {action:'discard_end',image:'/locations/stitcher/clean-dressings.webp'}
  ],
  record:[
    {action:'record_linen',image:'/locations/stitcher/ward-register.webp'}
  ]
};
export function stitcherItemActions(stage:number,phase:string,allowed:readonly string[]):readonly StitcherWardItem[]{
  return stage===2?(ITEM_BY_PHASE[phase]??[]).filter(item=>allowed.includes(item.action)):[];
}
