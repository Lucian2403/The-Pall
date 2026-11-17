/** The Night Trolley moves out of the ward. All Stage IV alternatives stay
 * inside it; Stage V reunites every route at the Night Door. */
export function stitcherUsesServiceCorridor(stage:number,branch:string|null):boolean{
  return stage===5||(stage===4&&branch==='trolley');
}
