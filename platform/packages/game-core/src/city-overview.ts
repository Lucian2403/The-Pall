import type {ActivityRun,NotificationInbox} from './activity.js';

/** All coordinates use the original map's normalized space, never the viewport. */
export type CityCoordinates=Readonly<{x:number;y:number}>;
export type CityPointOfInterest=Readonly<{
  id:string;name:string;description:string;icon:string;symbol:string;
  position:CityCoordinates;displayOrder:number;
} & ({availability:'available';destination:string}|{availability:'unavailable';destination:null})>;
export type CityTravelConfig=Readonly<{
  width:number;height:number;distanceScale:number;walkingSpeed:number;
  minimumSeconds:number;roundingSeconds:number
}>;
export type CityCatalogue=Readonly<{
  cityId:string;name:string;pointsOfInterest:readonly CityPointOfInterest[];
  config:CityTravelConfig
}>;
export type CityJourney=Readonly<{originId:string;destinationId:string;startedAt:string;arrivesAt:string}>;
export type CityTravelState=Readonly<{currentLocationId:string;revision:number;journey:CityJourney|null}>;
export type CityOverviewSnapshot=CityCatalogue&CityTravelState&Readonly<{serverNow:string;arrived:boolean;activity?:ActivityRun|null;notifications?:NotificationInbox|null;stamina?:number}>;
/** Distance scale is distance units per original image pixel; speed is units/sec. */
export function cityWalkingSeconds(from:CityCoordinates,to:CityCoordinates,config:CityTravelConfig):number{
  if([from.x,from.y,to.x,to.y].some(v=>!Number.isFinite(v)||v<0||v>1)||
     Object.values(config).some(v=>!Number.isFinite(v)||v<=0))throw Error('invalid_city_geometry');
  const distance=Math.hypot((to.x-from.x)*config.width,(to.y-from.y)*config.height)*config.distanceScale;
  if(distance===0)return 0;
  return Math.ceil(Math.max(config.minimumSeconds,distance/config.walkingSpeed)/config.roundingSeconds)*config.roundingSeconds;
}
export function settleCityJourney(state:CityTravelState,now:Date):CityTravelState{
  if(!state.journey||now.getTime()<Date.parse(state.journey.arrivesAt))return state;
  return {currentLocationId:state.journey.destinationId,revision:state.revision+1,journey:null};
}
export function startCityJourney(state:CityTravelState,catalogue:CityCatalogue,destinationId:string,now:Date):CityTravelState{
  if(state.journey)throw Error('travel_in_progress');
  const from=catalogue.pointsOfInterest.find(p=>p.id===state.currentLocationId);
  const to=catalogue.pointsOfInterest.find(p=>p.id===destinationId);
  if(!from)throw Error('invalid_current_location');
  if(!to||to.availability!=='available'||!to.destination)throw Error('destination_unavailable');
  if(from.id===to.id)throw Error('already_at_destination');
  const seconds=Math.max(catalogue.config.minimumSeconds,cityWalkingSeconds(from.position,to.position,catalogue.config));
  return {...state,revision:state.revision+1,journey:{originId:from.id,destinationId:to.id,
    startedAt:now.toISOString(),arrivesAt:new Date(now.getTime()+seconds*1000).toISOString()}};
}
