<script lang="ts">
  import type {PlateworkState, PlateworkAction} from '@the-pall/game-core';
  import {WORK_ACTION_OBJECT} from '@the-pall/game-core';
  import WorkshopObjectIcon from '$lib/WorkshopObjectIcon.svelte';
  import {PHASE_INSTRUCTION, ACTION_LABEL, resultCopy, observeObject, type ObjectKey} from '$lib/millhand-work-copy';

  let {work, available, pending, errorMessage, perform}: {
    work: PlateworkState;
    available: readonly PlateworkAction[];
    pending: boolean;
    errorMessage: string;
    perform: (action: PlateworkAction) => Promise<void>;
  } = $props();

  const objects = [
    {key:'stamps' as const, label:'Number stamps', image:'/workshop/number-stamps.webp'},
    {key:'plates' as const, label:'Metal plates', image:'/workshop/metal-plates.webp'},
    {key:'paper' as const, label:'Council order', image:'/workshop/council-work.webp'},
    {key:'hammer' as const, label:'Hammer', image:'/workshop/hammer.webp'}
  ];
  let selected = $state<ObjectKey | null>(null);
  const contextualActions = $derived(selected ? available.filter(a => WORK_ACTION_OBJECT[a] === selected) : []);
  const result = $derived(resultCopy(work));
  const instruction = $derived(PHASE_INSTRUCTION[work.phase]);
  const observation = $derived(selected ? observeObject(selected,work) : null);

  async function commitAction(action: PlateworkAction) {
    if (!available.includes(action) || pending) return;
    await perform(action);
    selected = null;
  }
</script>

<section class="workshop" aria-label="Millhand Stage 2 platework">
  <div class="scene">
    <div class="illustration">
      <img class="environment" src="/workshop/environment.webp" alt="Smithing workshop with a forge and the city outside" />
      <img class="guther" src="/workshop/guther-front.webp" alt="Guther Anvil standing by the workbench" />
      {#each objects as object (object.key)}
        <img class="object-art {object.key}" src={object.image} alt="" aria-hidden="true"/>
      {/each}
      <div class="targets" aria-label="Workshop objects">
        {#each objects as object (object.key)}
          <button type="button" class="target {object.key}" class:selected={selected===object.key}
            aria-pressed={selected===object.key}
            aria-label={'Inspect ' + object.label}
            onclick={() => {selected = selected===object.key ? null : object.key;}}>
            <span class="pin" aria-hidden="true"></span>
            <span class="label"><WorkshopObjectIcon kind={object.key}/>{object.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <aside class="work-card" aria-label="Council platework">
      <p class="heading">MARKING THE PLATES</p>
      <p class="story">{result}</p>
      {#if work.phase !== 'COMPLETE'}
        <div class="rule"></div>
        <p class="instruction">{instruction}</p>
        {#if selected}
          <div class="inspection">
            <strong>{objects.find(o=>o.key===selected)?.label}</strong>
            <p>{observation}</p>
          </div>
          <div class="actions">
            {#each contextualActions as action}
              <button type="button" disabled={pending} onclick={() => {void commitAction(action);}}>{ACTION_LABEL[action]}</button>
            {/each}
          </div>
        {:else}
          <p class="small">Select an object on the workbench to examine it.</p>
        {/if}
      {:else}
        <p class="instruction">The work paper has been returned. The next chapter is not yet connected.</p>
      {/if}
      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
      {#if pending}<p role="status" class="small">Saving work…</p>{/if}
    </aside>
  </div>
  <p class="footnote">The council has not paid for this work. The tools and metal remain at the workshop.</p>
</section>

<style>
  .workshop{display:flex;flex-direction:column;flex:1;min-width:0;width:100%;color:#eee1cf;font-family:Georgia,'Times New Roman',serif}
  .scene{position:relative;display:grid;grid-template-columns:minmax(0,42%) minmax(0,47%) minmax(0,11%);
    flex:1;align-content:start;width:100%;min-width:0;min-height:clamp(450px,calc(100dvh - 350px),1100px);background:#291d15}
  .illustration{position:absolute;inset:0;overflow:hidden}
  .environment{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .guther{position:absolute;top:6%;left:11%;height:112%;width:auto;max-width:none;object-fit:contain;clip-path:inset(0 0 38% 0);pointer-events:none;z-index:1}
  .object-art{position:absolute;z-index:2;max-width:none;object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 4px #0806069c)}
  .object-art.stamps{width:23%;height:31%;bottom:5%;left:1.5%}
  .object-art.plates{width:25%;height:30%;bottom:5%;left:26%}
  .object-art.paper{width:23%;height:29%;bottom:5%;left:56%}
  .object-art.hammer{width:21%;height:38%;bottom:4%;right:0;transform:rotate(-32deg)}
  .targets{position:absolute;inset:0;pointer-events:none;z-index:5}
  .target{position:absolute;bottom:1%;display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:auto;cursor:pointer;
    background:none;border:0;color:#f3e6d1;padding:0}
  .target.stamps{left:3%;width:21%}.target.plates{left:27%;width:21%}
  .target.paper{left:56%;width:22%}.target.hammer{right:1%;width:21%}
  .pin{width:12px;height:12px;border:2px solid #e4b76c;border-radius:50%;background:#17130e}
  .label{display:flex;justify-content:center;align-items:center;gap:5px;width:100%;min-height:32px;background:#15120feb;
    border:1px solid #99784b;padding:5px;font-size:clamp(10px,1.16vw,14px);white-space:nowrap}
  .target:hover .label,.target:focus-visible .label,.target.selected .label{background:#30241a;border-color:#e7c288}
  .target:focus-visible{outline:2px solid #eed4a3;outline-offset:2px}
  .work-card{position:relative;grid-column:2;z-index:4;align-self:start;width:100%;margin:clamp(24px,3vw,50px) 0 24px;
    min-width:0;padding:15px 18px;border:2px solid #654022;border-radius:5px;background:#efdfbb;color:#251910;box-shadow:0 7px 15px #0008}
  .heading{font:600 11px sans-serif;letter-spacing:.12em;color:#614029;margin:0 0 12px}
  .story{font-size:clamp(13px,1.2vw,17px);line-height:1.5;margin:0 0 12px}
  .rule{border-top:1px solid #b29c7e;margin:12px 0}
  .instruction{font-weight:600;font-size:clamp(13px,1.1vw,16px);line-height:1.4;margin:0 0 10px}
  .inspection{border-top:1px solid #bba786;padding-top:10px;font-size:14px;line-height:1.45}
  .inspection p{margin:6px 0}
  .actions{display:flex;flex-direction:column;gap:6px;margin-top:9px}
  .actions button{display:block;width:100%;text-align:left;border:1px solid #6d5235;background:#241d16;color:#f7e6c9;
    padding:10px 12px;font:14px/1.4 Georgia,serif;cursor:pointer;min-height:42px}
  .actions button:hover,.actions button:focus-visible{background:#423022;outline:1px solid #c49d65}
  .actions button:disabled{opacity:.55;cursor:default}
  .small{font-size:12px;line-height:1.45;color:#614e39}
  .error{font:13px/1.45 sans-serif;color:#873523}
  .footnote{padding:9px 14px;background:#201c17;border-top:1px solid #594229;color:#cbb8a0;font:12px/1.5 sans-serif;margin:0}
  @media(max-width:700px){
    .scene{display:flex;flex-direction:column;flex:0 0 auto;min-height:0}
    .illustration{position:relative;inset:auto;width:100%;aspect-ratio:4 / 3}
    .environment{object-position:39% center}
    .guther{height:86%;left:-5%;top:2%;clip-path:inset(0 0 38% 0)}
    .object-art.stamps{width:26%;height:24%;left:0;bottom:9%}
    .object-art.plates{width:29%;height:23%;left:24%;bottom:9%}
    .object-art.paper{width:27%;height:24%;left:49%;bottom:9%}
    .object-art.hammer{width:27%;height:30%;right:0;bottom:8%}
    .target{bottom:2%}.target.stamps{left:0;width:24%}.target.plates{left:25%;width:24%}
    .target.paper{left:50%;width:24%}.target.hammer{right:0;width:25%}
    .label{font:10px/1.2 sans-serif;white-space:normal;padding:4px 1px}
    .work-card{width:100%;margin:0;padding:14px;border-radius:0}
    .story{font-size:16px;line-height:1.5}.instruction{font-size:15px}
  }
</style>
