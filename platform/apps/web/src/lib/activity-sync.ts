/** One deadline request, not one request per countdown tick.
 * Call update after every successful snapshot; call dispose when leaving the page.
 * The server still decides whether the activity has completed. */
export function createActivitySync(load:()=>Promise<boolean>){
 let timer:ReturnType<typeof setTimeout>|undefined;
 let deadline:number|null=null;
 let busy=false,disposed=false,lastRequest=-Infinity;
 const clear=()=>{if(timer!==undefined)clearTimeout(timer);timer=undefined;};
 function schedule(){
  clear();
  if(disposed||deadline===null||document.hidden)return;
  // Avoid a hot loop if the server has not yet confirmed completion.
  const wait=Math.max(1000,deadline-performance.now()+150);
  timer=setTimeout(()=>{void refresh();},Math.min(wait,2147483647));
 }
 async function refresh(){
  if(disposed||busy||document.hidden)return;
  if(performance.now()-lastRequest<750){schedule();return;}
  clear();busy=true;lastRequest=performance.now();
  try{
   const ok=await load();
   if(!ok&&!disposed&&deadline!==null&&!document.hidden){
    clear();timer=setTimeout(()=>{void refresh();},5000);
   }
  }finally{busy=false;}
 }
 function update(serverNow:string|undefined,endsAt:string|null|undefined){
  const remaining=endsAt?Date.parse(endsAt)-Date.parse(serverNow??new Date().toISOString()):NaN;
  deadline=Number.isFinite(remaining)?performance.now()+Math.max(0,remaining):null;
  schedule();
 }
 const resume=()=>{if(document.hidden)clear();else void refresh();};
 window.addEventListener('focus',resume);
 document.addEventListener('visibilitychange',resume);
 return {update,refresh,dispose(){
  disposed=true;clear();window.removeEventListener('focus',resume);
  document.removeEventListener('visibilitychange',resume);
 }};
}
