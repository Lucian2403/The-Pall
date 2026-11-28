import {readable} from 'svelte/store';

/** One presentation clock for every mounted activity indicator. No network IO. */
export const activityClock=readable(0,set=>{
  if(typeof window==='undefined')return;
  const tick=()=>set(performance.now());
  tick();
  const timer=window.setInterval(tick,250);
  return ()=>window.clearInterval(timer);
});
