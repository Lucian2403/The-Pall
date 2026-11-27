import type {CityCatalogue,CityPointOfInterest} from '@the-pall/game-core';
import {HOME_ID} from './shared-home-state.js';

/** Owner-approved 16-POI roster, calibrated from the red numbered annotations
 * on GrandCylinder-Map-with-POI.png. Gates and Forest art remains provisional.
 * Only actual post-introduction scenes may be marked available. */
const poi=(id:string,name:string,description:string,symbol:string,x:number,y:number,displayOrder:number,destination:string|null=null):CityPointOfInterest=>({
  id,name,description,symbol,icon:'/locations/city/poi/'+id+'.webp',position:{x,y},displayOrder,
  ...(destination===null?{availability:'unavailable',destination:null}:{availability:'available',destination})
});
export const CITY_OVERVIEW:CityCatalogue={
  cityId:'grand-cylinder-city',name:'Grand Cylinder City',
  config:{width:9600,height:5400,distanceScale:28/9600,walkingSpeed:1.4,minimumSeconds:2,roundingSeconds:1},
  pointsOfInterest:[
    poi(HOME_ID,'Home','Your rented room, bed and personal chest.','⌂',.52092,.33675,1,'home'),
    poi('inn','Inn','Lodging and hospitality.','⌂',.82868,.52209,2),
    poi('job-board','Job Board','Find paid work in the city.','▤',.30685,.36476,3),
    poi('city-board','City Board','City notices.','▦',.23135,.59483,4),
    poi('marketplace','Marketplace','Buy and sell goods.','▥',.45967,.45959,5),
    poi('clothing-trader','Clothing Trader','Clothing and equipment.','♜',.65797,.36476,6),
    poi('weapons-trader','Weapon Trader','Weapons and related goods.','⚒',.22013,.87231,7),
    poi('materials-merchant','Materials Merchant','Materials and supplies.','▧',.39933,.63739,8),
    poi('herbalist','Herbalist','Herbs and herbal supplies.','❧',.83020,.23491,9),
    poi('clinic','Clinic','Medical services.','✚',.44330,.18157,10),
    poi('blacksmith','Blacksmith','Smithing services.','⚒',.13008,.45905,11),
    poi('depot','Depot','Goods handling and storage.','▧',.62280,.13739,12),
    poi('mechanical-yard','Mechanical Yard','Mechanical work.','⚙',.17617,.15625,13),
    poi('workshop-repairs','Workshop & Repairs','Workshop and repair services.','⚒',.78836,.69127,14),
    poi('city-gates','City Gates','Access to the city outskirts.','▥',.93572,.06735,15),
    poi('forest','Forest','Woodland beyond the city.','❧',.05397,.87985,16)
  ]
};
