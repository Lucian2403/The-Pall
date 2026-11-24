/** UI-only state. The server never receives positions, focus or window IDs.
 * Only the inventory and home_chest types are live; future types are contracts. */
import {writable,get} from 'svelte/store';

export type GameWindowType='inventory'|'storage'|'loot'|'npc_trader'|'marketplace'|
 'crafting'|'repair'|'player_trade'|'job_delivery'|'cargo'|'organisation_storage'|'mail';
export type ActiveWindowType='inventory'|'storage';
export type GameWindowRecord={
 id:'inventory'|'storage:home_chest';kind:ActiveWindowType;
 x:number;y:number;z:number;width:number;
};
export type WindowSession={
 characterId:string|null;windows:GameWindowRecord[];mobileActive:string|null;
};
const empty=():WindowSession=>({characterId:null,windows:[],mobileActive:null});
export const gameWindows=writable<WindowSession>(empty());
export function selectWindowCharacter(characterId:string){
 gameWindows.update(value=>value.characterId===characterId?value:
  {...empty(),characterId});
}
export function resetGameWindows(){gameWindows.set(empty());}
function position(kind:ActiveWindowType,viewportWidth:number){
 const width=600,storageWidth=420,gap=14;
 const group=width+gap+storageWidth;
 const centered=Math.round((viewportWidth-group)/2);
 const x=Math.max(12,viewportWidth>=1200?Math.max(215,centered):centered);
 return kind==='inventory'?{x,y:76,width}:
  {x:x+width+gap,y:98,width:storageWidth};
}
export function openGameWindow(characterId:string,kind:ActiveWindowType){
 selectWindowCharacter(characterId);
 const id=kind==='inventory'?'inventory':'storage:home_chest';
 gameWindows.update(value=>{
  const exists=value.windows.find(w=>w.id===id);
  const z=value.windows.reduce((n,w)=>Math.max(n,w.z),0)+1;
  if(exists)return {...value,mobileActive:id,windows:value.windows.map(w=>
   w.id===id?{...w,z}:w)};
  const width=typeof window==='undefined'?1280:window.innerWidth;
  const p=position(kind,width);
  return {...value,mobileActive:id,windows:[...value.windows,{id,kind,...p,z}]};
 });
}
export function closeGameWindow(id:GameWindowRecord['id']){
 gameWindows.update(value=>{
  const windows=value.windows.filter(w=>w.id!==id);
  return {...value,windows,mobileActive:windows.length?
   windows.reduce((a,b)=>a.z>b.z?a:b).id:null};
 });
}
export function closeContextWindows(){closeGameWindow('storage:home_chest');}
export function frontGameWindow(id:GameWindowRecord['id']){
 gameWindows.update(value=>{
  if(!value.windows.some(w=>w.id===id))return value;
  const z=value.windows.reduce((n,w)=>Math.max(n,w.z),0)+1;
  return {...value,mobileActive:id,windows:value.windows.map(w=>w.id===id?{...w,z}:w)};
 });
}
export function positionGameWindow(id:GameWindowRecord['id'],x:number,y:number){
 gameWindows.update(value=>({...value,windows:value.windows.map(w=>
  w.id===id?{...w,x,y}:w)}));
}
export const isGameWindowOpen=(id:GameWindowRecord['id'])=>
 get(gameWindows).windows.some(w=>w.id===id);
