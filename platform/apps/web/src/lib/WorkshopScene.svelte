<script lang="ts">
  import type {StageOneBeat} from '$lib/approved-stage-one';
  import WorkshopObjectIcon from '$lib/WorkshopObjectIcon.svelte';

  type PropKey = 'stamps' | 'plates' | 'paper' | 'hammer';
  type PropSpec = {name: string; label: string; image: string; observation: string};
  const props: Record<PropKey, PropSpec> = {
    stamps: {
      name: 'Number stamps', label: 'Number stamps', image: '/workshop/number-stamps.webp',
      observation: 'Small metal tools with numbers cut into their ends. Workers arrange them and strike them with a hammer to stamp metal.'
    },
    plates: {
      name: 'Metal plates', label: 'Metal plates', image: '/workshop/metal-plates.webp',
      observation: 'Plain pieces of metal, ready for stamping.'
    },
    paper: {
      name: 'Work paper', label: 'Council order', icon: '▤', image: '/workshop/council-work.webp',
      observation: "The council's work order, with the number to stamp on each plate written on it."
    },
    hammer: {
      name: 'Hammer', label: 'Hammer', image: '/workshop/hammer.webp',
      observation: 'A heavy hammer used to strike the number stamps against a metal plate.'
    }
  };

  let {
    characterName,
    beat,
    advance,
    goBack,
    canGoBack
  }: {
    characterName: string;
    beat: StageOneBeat;
    advance: (next: string) => void;
    goBack: () => void;
    canGoBack: boolean;
  } = $props();

  let selected = $state<PropKey | null>(null);
  const say = $derived(beat.text.replaceAll('[player name]', characterName));
  const readyForWork = $derived(beat.kind === 'handoff');

  function inspect(key: PropKey) {
    selected = selected === key ? null : key;
  }
</script>

<!-- The text/game-state is separate from the static artwork. No on-hover image swapping. -->
<section class="workshop" aria-label="Guther's workshop">
  <div class="scene">
    <img class="environment" src="/workshop/environment.webp" alt="The smithing workshop, with a forge, bench and distant city" />
    <img class="guther" src="/workshop/guther-front.webp" alt="Guther Anvil, the smithing foreman" />

    <img class="prop-art stamps" src={props.stamps.image} alt="" aria-hidden="true" />
    <img class="prop-art plates" src={props.plates.image} alt="" aria-hidden="true" />
    <img class="prop-art paper" src={props.paper.image} alt="" aria-hidden="true" />
    <img class="prop-art hammer" src={props.hammer.image} alt="" aria-hidden="true" />

    <div class="dialogue" aria-label="Workshop conversation">
      {#if beat.kind === 'speech'}
        <p class="speaker">{beat.speaker === 'Player' ? characterName : beat.speaker}</p>
        <p class="dialogue-line">“{say}”</p>
      {:else if beat.kind === 'narration'}
        <p class="speaker">The workshop</p>
        <p class="narration">{say}</p>
      {:else if beat.kind === 'choice'}
        <p class="speaker">Your response</p>
      {:else}
        <p class="speaker">Guther's work</p>
        <p class="dialogue-line">[{say}]</p>
        <p class="small">Stage 2 gameplay is not yet connected. This is the end of the read-only opening.</p>
      {/if}

      <div class="responses">
        {#if beat.kind === 'choice' && beat.choices}
          {#each beat.choices as choice}
            <button type="button" onclick={() => {selected = null; advance(choice.next);}}>{choice.label}</button>
          {/each}
        {:else if beat.next}
          <button type="button" onclick={() => {selected = null; advance(beat.next!);}}>Continue</button>
        {/if}
        {#if canGoBack}
          <button class="back" type="button" onclick={() => {selected = null; goBack();}}>Previous line</button>
        {/if}
      </div>
    </div>

    <div class="prop-markers" aria-label="Workshop objects">
      {#each (['stamps', 'plates', 'paper', 'hammer'] as const) as key}
        <button
          class:chosen={selected === key}
          class="prop-marker {key}"
          type="button"
          aria-pressed={selected === key}
          aria-label={'Inspect ' + props[key].name}
          onclick={() => inspect(key)}
        >
          <span class="pin" aria-hidden="true"></span>
          <span class="tag"><span class="symbol" aria-hidden="true"><WorkshopObjectIcon kind={key} /></span>{props[key].label}</span>
        </button>
      {/each}
    </div>
  </div>

  {#if selected}
    <div class="inspection" role="status">
      <div>
        <strong>{props[selected].name}</strong>
        <p>{props[selected].observation}</p>
        {#if !readyForWork}
          <small>This is inspection only. Continue the conversation to receive the work paper.</small>
        {:else}
          <small>Stage 2 work commands are not enabled in this read-only integration.</small>
        {/if}
      </div>
      <button type="button" onclick={() => {selected = null;}} aria-label="Close inspection">Close</button>
    </div>
  {/if}
</section>

<style>
  .workshop {width:100%;color:#f3e3ce;font-family:Georgia,'Times New Roman',serif}
  .scene {position:relative;width:100%;aspect-ratio: 1774 / 887;overflow:hidden;background:#271b14;border:1px solid #66432d;box-sizing:border-box}
  .environment {position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .guther {position:absolute;bottom:8%;left:13%;height:87%;max-width:none;width:auto;object-fit:contain;z-index:1;pointer-events:none;filter:drop-shadow(0 5px 6px #0a080555)}
  .prop-art {position:absolute;z-index:2;max-width:none;object-fit:contain;pointer-events:none;filter:drop-shadow(0 4px 4px #0b0709a1)}
  .prop-art.stamps {width:23%;height:31%;bottom:5%;left:1.5%}
  .prop-art.plates {width:25%;height:30%;bottom:5%;left:26%}
  .prop-art.paper {width:23%;height:29%;bottom:5%;left:56%}
  .prop-art.hammer {width:21%;height:38%;bottom:4%;right:0}
  .dialogue {position:absolute;z-index:4;left:43%;top:12%;width:35%;max-height:66%;overflow:auto;box-sizing:border-box;padding:13px 15px 15px;border:2px solid #58351e;border-radius:5px;background:#efe0bf;color:#251a13;box-shadow:0 5px 0 #18110dcc,0 12px 18px #0007}
  .speaker {font:600 10px/1.4 sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#4c3524;margin:0 0 8px}
  .dialogue-line,.narration {margin:0 0 10px;font-size:clamp(12px,1.3vw,17px);line-height:1.4}
  .narration{font-style:italic}
  .small {color:#654d3c;font-size:11px;line-height:1.3}
  .responses {display:flex;flex-direction:column;gap:5px}
  .responses button {text-align:left;background:#221c16;border:1px solid #65492e;color:#f5e4c9;font:12px/1.35 Georgia,serif;padding:7px 9px;min-height:30px;cursor:pointer}
  .responses button:hover,.responses button:focus-visible {outline:2px solid #d3a86a;outline-offset:1px}
  .responses .back {background:#57412c;color:#f6e9d8}
  .prop-marker {position:absolute;z-index:5;bottom:1%;background:none;border:0;color:#f3e8d2;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0}
  .prop-marker.stamps{left:3%;width:21%}
  .prop-marker.plates{left:27%;width:21%}
  .prop-marker.paper{left:56%;width:22%}
  .prop-marker.hammer{right:1%;width:21%}
  .pin {width:12px;height:12px;box-sizing:border-box;background:#17140f;border:2px solid #e7bb68;border-radius:50%;box-shadow:0 1px 0 #0009}
  .tag {display:flex;align-items:center;justify-content:center;gap:6px;width:100%;box-sizing:border-box;min-height:29px;background:#16130fec;border:1px solid #94754b;border-radius:3px;padding:4px 5px;font-size:clamp(10px,1.22vw,14px);line-height:1.15;white-space:nowrap;text-shadow:0 1px 1px #000}
  .symbol {color:#eac487;font-size:1.15em}
  .prop-marker:hover .tag,.prop-marker:focus-visible .tag,.prop-marker.chosen .tag{border-color:#f0c77c;background:#332616}
  .prop-marker:focus-visible {outline:2px solid #f2d28f;outline-offset:3px}
  .inspection {display:flex;align-items:start;justify-content:space-between;gap:16px;margin-top:8px;padding:13px 16px;border:1px solid #6b5136;background:#24211d;color:#f2e4ce;font-size:14px;line-height:1.45}
  .inspection p {margin:6px 0 4px}
  .inspection small {color:#bda990}
  .inspection button {padding:8px 12px;color:#f4dcbb;background:#403126;border:1px solid #816343;cursor:pointer}
  @media(max-width:700px){
    .scene {aspect-ratio:4 / 5;}
    .environment {object-fit:cover;object-position:39% center}
    .guther {height:50%;left:0;bottom:38%}
    .prop-art.stamps {width:26%;height:24%;left:0;bottom:9%}
    .prop-art.plates {width:29%;height:23%;left:24%;bottom:9%}
    .prop-art.paper {width:27%;height:24%;left:49%;bottom:9%}
    .prop-art.hammer {width:27%;height:30%;right:0;bottom:8%}
    .dialogue {top:6%;left:33%;width:64%;max-height:56%;padding:10px 11px}
    .dialogue-line,.narration {font-size:12px}
    .prop-marker {bottom:2%}
    .prop-marker.stamps {left:0;width:24%}
    .prop-marker.plates {left:25%;width:24%}
    .prop-marker.paper {left:50%;width:24%}
    .prop-marker.hammer {right:0;width:25%}
    .tag {font:10px/1.1 sans-serif;min-height:28px;padding:3px 2px;gap:3px;white-space:normal}
  }
  @media(max-width:380px){.dialogue{left:29%;width:69%;max-height:58%}.tag{font-size:9px}}
</style>
