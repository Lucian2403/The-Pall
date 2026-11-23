<script lang="ts">
  import {clinicHref,type FinaleOrigin} from '$lib/shared-finale-origins';

  // Every finished Stage VI encounter uses the same next-stage control.
  // The saved character's origin selects its registered Clinic route.
  let {characterId,origin}:{characterId:string;origin:FinaleOrigin}=$props();
</script>

<div class="pall-story-dialogue-section combat-outcome-actions">
  <div class="actions">
    <strong><a class="pall-framed-button primary-choice clinic-transition"
      href={clinicHref(characterId,origin)}>Continue to medical care</a></strong>
  </div>
</div>

<style>
  .combat-outcome-actions{position:relative;z-index:1;margin-top:16px;pointer-events:auto}
  .actions{width:100%}
  .clinic-transition{position:relative;z-index:1;max-width:100%;pointer-events:auto}
</style>
