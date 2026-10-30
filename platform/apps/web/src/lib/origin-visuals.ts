/** Origin scenes approved and supplied by the owner. These backgrounds are
 * reused by character creation and roster cards, never inferred from sex or
 * avatar choice. The matching static assets must be installed with the branch.
 */
export const ORIGIN_VISUALS:Record<string,{src:string;name:string;hubArt:boolean}> = {
  Millhand:{src:'/workshop/environment.webp',name:'Smithing workshop',hubArt:true},
  Inkbound:{src:'/locations/records/records-room.webp',name:'Council records room',hubArt:true},
  Bellrunner:{src:'/locations/origins/bellrunner-depot.webp',name:'Bellrunner depot',hubArt:true},
  Squatter:{src:'/locations/origins/squatter-outskirts.webp',name:'Squatter outskirts',hubArt:true},
  Stitcher:{src:'/locations/origins/stitcher-clinic.webp',name:'Stitcher clinic',hubArt:true},
  Scrapper:{src:'/locations/origins/scrapper-yard.webp',name:'Scrapper yard',hubArt:true}
};
export function originVisual(origin:string){
  return ORIGIN_VISUALS[origin]??ORIGIN_VISUALS.Millhand;
}
