<script lang="ts">
  import {onMount} from 'svelte';
  import {beforeNavigate} from '$app/navigation';
  import {openAnchoredPopover} from '$lib/anchored-popover';
  import {
    pallAudioSettings,pallAudioPlayback,setPallAudioSettings,previewPallEffect,previewPallMusic
  } from '$lib/pall-audio';
  let open=$state(false);
  let hydrated=$state(false);
  let trigger=$state<HTMLButtonElement>();
  let panel=$state<HTMLDivElement>();
  let placement=$state<'below'|'above'>('below');
  onMount(()=>{hydrated=true;});
  const MAX_MUSIC_VOLUME=0.5;
  const musicPercent = $derived(Math.round($pallAudioSettings.musicVolume * 1000) / 10);
  // Top-layer, trigger-anchored and viewport-clamped: the sticky journal row,
  // scene overlays and short windows can no longer hide or clip the settings.
  $effect(()=>{
    if(!open||!panel||!trigger)return;
    return openAnchoredPopover({trigger,panel,
      onDismiss:()=>{open=false;},
      onPlacement:(value)=>{placement=value;}});
  });
  beforeNavigate(()=>{open=false;});
</script>

<div class="audio-controls" data-pall-audio-control data-hydrated={hydrated}>
  <button class="audio-trigger" type="button" aria-haspopup="true" bind:this={trigger}
    aria-expanded={open} aria-controls="pall-sound-settings"
    onclick={()=>{open=!open;}}>
    Sound {$pallAudioSettings.enabled?'on':'off'}
  </button>
  {#if open}
    <div class="audio-panel" id="pall-sound-settings" bind:this={panel}
      popover="manual" data-placement={placement}
      role="group" aria-label="Sound settings">
      <p>Sound settings</p>
      <label class="toggle">
        <input type="checkbox" checked={$pallAudioSettings.enabled}
          onchange={e=>setPallAudioSettings({enabled:e.currentTarget.checked})}/>
        Sound enabled
      </label>
      <label>
        <span>Music <output>{musicPercent}%</output></span>
        <input type="range" min="0" max={MAX_MUSIC_VOLUME} step="0.005"
          value={$pallAudioSettings.musicVolume}
          aria-label="Background music volume"
          oninput={e=>setPallAudioSettings({musicVolume:Number(e.currentTarget.value)})}/>
      </label>
      <div class="effects-test-row">
        <small class="playback-state">{$pallAudioPlayback.music}</small>
        <button type="button" class="effects-test" onclick={previewPallMusic}
          disabled={!$pallAudioSettings.enabled||$pallAudioSettings.musicVolume<=0}>
          Play theme
        </button>
      </div>
      <label>
        <span>Ambience <output>{Math.round($pallAudioSettings.ambienceVolume*100)}%</output></span>
        <input type="range" min="0" max="1" step="0.05"
          value={$pallAudioSettings.ambienceVolume}
          aria-label="Environmental ambience volume"
          oninput={e=>setPallAudioSettings({ambienceVolume:Number(e.currentTarget.value)})}/>
        <small class="playback-state">{$pallAudioPlayback.ambience}</small>
      </label>
      <label>
        <span>Effects <output>{Math.round($pallAudioSettings.sfxVolume*100)}%</output></span>
        <input type="range" min="0" max="1" step="0.05"
          value={$pallAudioSettings.sfxVolume}
          aria-label="Sound effects volume"
          oninput={e=>setPallAudioSettings({sfxVolume:Number(e.currentTarget.value)})}/>
      </label>
      <div class="effects-test-row">
          <small class="playback-state">{$pallAudioPlayback.effects}</small>
          <button type="button" class="effects-test" onclick={previewPallEffect}
            disabled={!$pallAudioSettings.enabled||$pallAudioSettings.sfxVolume<=0}>
            Test click
          </button>
      </div>
      <small class="audio-footnote">Music rests between playthroughs. Environmental ambience follows the illustrated workshop, depot, council offices, Flint's alley and the medical clinic.</small>
    </div>
  {/if}
</div>

<style>
  /* No z-index here: the open panel lives in the browser top layer, so the
     HUD must not create a stacking context that a fallback would inherit. */
  .audio-controls{position:relative;display:flex;align-items:center;flex:none;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .audio-trigger{min-height:40px;padding:7px 10px;white-space:nowrap;
    border:1px solid #80613e;background:#302419;color:#ecd0a5;
    font:600 13px/1.2 var(--pall-font-reading,Georgia,serif);cursor:pointer}
  .audio-trigger:hover{border-color:#c7a372;background:#473321}
  .audio-trigger[aria-expanded="true"]{border-color:#d2a96f;background:#4a3522}
  .audio-trigger:focus-visible,.audio-panel input:focus-visible,
  .audio-panel button:focus-visible{outline:2px solid #e9be7e;outline-offset:3px}
  /* Override UA [popover] centring; position is written by position(). */
  .audio-panel{position:fixed;inset:auto;margin:0;z-index:1000;
    box-sizing:border-box;width:min(280px,calc(100vw - 16px));
    overflow-y:auto;overscroll-behavior:contain;
    padding:12px 15px 13px;background:#2a211a;color:#f0dfc8;border:1px solid #a77f4d;
    box-shadow:0 10px 27px #000b;scrollbar-color:#947651 #30281f;scrollbar-width:thin}
  .audio-panel p{margin:0 0 8px;color:#f2d3a8;font:600 17px/1.2 var(--pall-font-reading,Georgia,serif)}
  .audio-panel label{display:flex;flex-direction:column;gap:5px;margin:8px 0;font-size:14px}
  .audio-panel label>span{display:flex;justify-content:space-between;gap:10px}
  .audio-panel .toggle{flex-direction:row;align-items:center;gap:9px;min-height:32px;margin:4px 0}
  .audio-panel input[type="range"]{width:100%;min-height:24px;margin:0;accent-color:#b18a56}
  .audio-panel input[type="checkbox"]{width:18px;height:18px;margin:0;accent-color:#b18a56}
  .audio-panel small{display:block;line-height:1.4;color:#c2aa89}
  .audio-panel .playback-state{margin:0;color:#d4b78f;font-size:12px}
  .audio-panel .effects-test-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .effects-test{
    min-height:32px;padding:5px 10px;border:1px solid #9b7851;
    background:#453120;color:#f2dab6;cursor:pointer;
    font:600 12px/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .effects-test:hover:not(:disabled){background:#634629}
  .effects-test:disabled{opacity:.45;cursor:default}
  .audio-panel .audio-footnote{margin-top:10px;font-size:12px}
  @media(pointer:coarse){
    .audio-trigger{min-height:44px}
    .effects-test{min-height:40px}
  }
  @media(max-width:760px){
    .audio-trigger{padding:7px 8px;font-size:12px}
  }
</style>
