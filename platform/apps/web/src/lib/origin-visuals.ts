/** Only approved owner-supplied location art is identified as that origin's hub.
 * Other origins use the Grand Cylinder City panorama, not an unrelated scene.
 * Avatars are independent of these visual locations.
 */
export const ORIGIN_VISUALS:Record<string,{src:string;name:string;hubArt:boolean}> = {
  Millhand:{src:'/workshop/environment.webp',name:'Smithing workshop',hubArt:true},
  Inkbound:{src:'/locations/records/records-room.webp',name:'Council records room',hubArt:true},
  Bellrunner:{src:'/ui-kit/resources/TheCityVista.png',name:'Grand Cylinder City',hubArt:false},
  Squatter:{src:'/ui-kit/resources/TheCityVista.png',name:'Grand Cylinder City',hubArt:false},
  Stitcher:{src:'/ui-kit/resources/TheCityVista.png',name:'Grand Cylinder City',hubArt:false},
  Scrapper:{src:'/ui-kit/resources/TheCityVista.png',name:'Grand Cylinder City',hubArt:false}
};
export function originVisual(origin:string){
  return ORIGIN_VISUALS[origin]??ORIGIN_VISUALS.Millhand;
}
