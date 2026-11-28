<script lang="ts">
  import {activityClock} from './activity-clock';
  import {activityRemainingSeconds, activityProgress, type ActivityRun} from '@the-pall/game-core';
  let {activity, serverNow, compact=false}: {activity: ActivityRun; serverNow: string;compact?:boolean} = $props();
  let anchor=$state(0);
  $effect(()=>{void serverNow;anchor=performance.now();});
  const now=$derived(Date.parse(serverNow)+Math.max(0,$activityClock-anchor));
  const remaining = $derived(activityRemainingSeconds(activity, now));
  const progress = $derived(activityProgress(activity, now));
</script>

<div class="activity-progress" class:compact>
  <p aria-live="off">{remaining > 0 ? remaining + ' sec remaining' : 'Confirming completion…'}</p>
  <progress max="100" value={progress} aria-label={activity.label + ' progress'}></progress>
</div>

<style>
  .activity-progress{margin:12px 0}
  .activity-progress p{margin:6px 0}
  .activity-progress.compact{margin:0;min-width:85px}
  .compact p{font-size:12px;margin:0 0 3px;white-space:nowrap}
  .compact progress{height:5px}
  progress{display:block;width:100%;height:12px;accent-color:#9d743d}
</style>
