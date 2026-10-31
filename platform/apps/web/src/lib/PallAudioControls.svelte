<script lang="ts">
  import {pallAudioSettings,setPallAudioSettings} from '$lib/pall-audio';
  let open=$state(false);
</script>

<div class="audio-controls" data-pall-audio-control>
  <button class="audio-trigger" type="button" aria-haspopup="true"
    aria-expanded={open} aria-controls="pall-sound-settings"
    onclick={()=>{open=!open;}}>
    Sound {$pallAudioSettings.enabled?'on':'off'}
  </button>
  {#if open}
    <div class="audio-panel" id="pall-sound-settings"
      role="group" aria-label="Sound settings">
      <p>Sound settings</p>
      <label class="toggle">
        <input type="checkbox" checked={$pallAudioSettings.enabled}
          onchange={e=>setPallAudioSettings({enabled:e.currentTarget.checked})}/>
        Sound enabled
      </label>
      <label>
        <span>Music <output>{Math.round($pallAudioSettings.musicVolume*1000)/10}%</output></span>
        <input type="range" min="0" max="0.12" step="0.005"
          value={$pallAudioSettings.musicVolume}
          aria-label="Background music volume"
          oninput={e=>setPallAudioSettings({musicVolume:Number(e.currentTarget.value)})}/>
      </label>
      <label>
        <span>Effects <output>{Math.round($pallAudioSettings.sfxVolume*100)}%</output></span>
        <input type="range" min="0" max="1" step="0.05"
          value={$pallAudioSettings.sfxVolume}
          aria-label="Sound effects volume"
          oninput={e=>setPallAudioSettings({sfxVolume:Number(e.currentTarget.value)})}/>
      </label>
      <small>The theme rests between playthroughs. Audio starts after a click.</small>
    </div>
  {/if}
</div>

<style>
  .audio-controls{position:relative;display:flex;align-items:center;flex:none;z-index:42;
    font-family:var(--pall-font-reading,Georgia,serif)}
  .audio-trigger{min-height:38px;padding:7px 9px;white-space:nowrap;
    border:1px solid #80613e;background:#302419;color:#ecd0a5;
    font:600 13px/1.2 var(--pall-font-reading,Georgia,serif);cursor:pointer}
  .audio-trigger:hover{border-color:#c7a372;background:#473321}
  .audio-trigger:focus-visible,.audio-panel input:focus-visible{outline:2px solid #e9be7e;outline-offset:3px}
  .audio-panel{position:absolute;right:0;top:calc(100% + 6px);width:270px;max-width:calc(100vw - 20px);
    padding:15px 17px;background:#2a211a;color:#f0dfc8;border:1px solid #a77f4d;
    box-shadow:0 10px 27px #000b}
  .audio-panel p{margin:0 0 12px;color:#f2d3a8;font:600 18px/1.2 var(--pall-font-reading,Georgia,serif)}
  .audio-panel label{display:flex;flex-direction:column;gap:7px;margin:10px 0;font-size:14px}
  .audio-panel label>span{display:flex;justify-content:space-between;gap:10px}
  .audio-panel .toggle{flex-direction:row;align-items:center;gap:9px}
  .audio-panel input[type="range"]{width:100%;accent-color:#b18a56}
  .audio-panel input[type="checkbox"]{accent-color:#b18a56}
  .audio-panel small{display:block;line-height:1.45;color:#c2aa89;margin-top:12px}
  @media(max-width:760px){
    .audio-trigger{padding:7px 8px;font-size:12px}
    .audio-panel{top:calc(100% + 7px)}
  }
</style>
