import type {CityCatalogue,CityPointOfInterest} from '@the-pall/game-core';
import {HOME_ID} from './shared-home-state.js';

/** Owner reference confirms these nine names. Coordinates and distance scale
 * are provisional until the clean map artwork and complete roster arrive.
 * Only actual post-introduction scenes may be marked available. */
const poi=(id:string,name:string,description:string,symbol:string,x:number,y:number,displayOrder:number,destination:string|null=null):CityPointOfInterest=>({
  id,name,description,symbol,icon:'/locations/city/poi/'+id+'.webp',position:{x,y},displayOrder,
  ...(destination===null?{availability:'unavailable',destination:null}:{availability:'available',destination})
});
export const CITY_OVERVIEW:CityCatalogue={
  cityId:'grand-cylinder-city',name:'Grand Cylinder City',
  config:{width:1400,height:1000,distanceScale:0.02,walkingSpeed:1.4,minimumSeconds:2,roundingSeconds:1},
  pointsOfInterest:[
    poi(HOME_ID,'Home','Your rented room, bed and personal chest.','⌂',.23,.65,1,'home'),
    poi('job-board','Job Board','Find paid work in the city.','▤',.43,.33,2),
    poi('city-board','City Board','City notices.','▦',.14,.44,3),
    poi('marketplace','Marketplace','Buy and sell goods.','▥',.48,.52,4),
    poi('clinic','Clinic','Medical services.','✚',.21,.26,5),
    poi('weapons-trader','Weapons Trader','Weapons and related goods.','⚒',.71,.65,6),
    poi('clothing-trader','Clothing Trader','Clothing and equipment.','♜',.61,.23,7),
    poi('herbalist','Herbalist','Herbs and herbal supplies.','❧',.45,.75,8),
    poi('materials-merchant','Materials Merchant','Materials and supplies.','▧',.86,.43,9)
  ]
};
