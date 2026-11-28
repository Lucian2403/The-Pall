<script lang="ts">
  import {onMount} from 'svelte';
  import {activityRemainingSeconds, activityProgress, type ActivityRun} from '@the-pall/game-core';
  let {activity, serverNow}: {activity: ActivityRun; serverNow: string} = $props();
  let now=$state(Date.parse(serverNow));
  let base=0,anchor=0;
  $effect(()=>{
    base=Date.parse(serverNow);anchor=performance.now();now=base;
  });
  onMount(()=>{
    const timer=setInterval(()=>{now=base+performance.now()-anchor;},250);
    return ()=>clearInterval(timer);
  });
  const remaining = $derived(activityRemainingSeconds(activity, now));
  const progress = $derived(activityProgress(activity, now));
</script>

<div class="activity-progress">
  <p role="status">{remaining > 0 ? remaining + ' sec remaining' : 'Confirming completion…'}</p>
  <progress max="100" value={progress} aria-label={activity.label + ' progress'}></progress>
</div>

<style>
  .activity-progress{margin:12px 0}
  .activity-progress p{margin:6px 0}
  progress{display:block;width:100%;height:12px;accent-color:#9d743d}
</style>
