<script lang="ts">
  import type {StageOneBeat} from '$lib/approved-stage-one';
  import {GUTHER_WORK_SKIP_LINE} from '$lib/approved-guther-optional';
  import NpcConversation from '$lib/NpcConversation.svelte';
  import WorkshopItemPopover from '$lib/WorkshopItemPopover.svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import '$lib/workshop-object-labels.css';
  import '$lib/pall-story-landscape.css';

  type PropKey = 'stamps' | 'plates' | 'paper' | 'hammer';
  type PropSpec = {name: string; label: string; image: string; observation: string};
  const keys = ['stamps', 'plates', 'paper', 'hammer'] as const;
  const workshopObjects: Record<PropKey, PropSpec> = {
    stamps: {
      name: 'Number stamps', label: 'Number stamps', image: '/workshop/number-stamps.webp',
      observation: 'Small metal tools with numbers cut into their ends. Workers arrange them and strike them with a hammer to stamp metal.'
    },
    plates: {
      name: 'Metal plates', label: 'Metal plates', image: '/workshop/metal-plates.webp',
      observation: 'Plain pieces of metal, ready for stamping.'
    },
    paper: {
      name: 'Work paper', label: 'Council order', image: '/workshop/council-work.webp',
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
    canGoBack,
    takeWorkPaper,
    skipToWork,
    takingWork = false,
    handoffError = ''
  }: {
    characterName: string;
    beat: StageOneBeat;
    advance: (next: string, fromChoice?: boolean) => void;
    goBack: () => void;
    canGoBack: boolean;
    takeWorkPaper?: () => Promise<void>;
    skipToWork: () => void;
    takingWork?: boolean;
    handoffError?: string;
  } = $props();


  let selected = $state<PropKey | null>(null);
  let talkingToGuther = $state(false);
  const say = $derived(beat.text.replaceAll('[player name]', characterName));
  const readyForWork = $derived(beat.kind === 'handoff');

  function inspect(key: PropKey) {
    const wasTalking = talkingToGuther;
    talkingToGuther = false;
    selected = !wasTalking && selected === key ? null : key;
  }
</script>

<!-- The text/game-state is separate from the static artwork. No on-hover image swapping.
     Scene layout (shared with Bellrunner): the workbench painting is the stage;
     Guther's dialogue and any object inspection share the adjacent reading column. -->
<section class="workshop" aria-label="Guther's workshop">
  <ActivityLayout mode="scene" stageAspect={2} class="scene pall-story-sections">
  {#snippet stage()}
  <div class="scene-visuals pall-story-visuals">
    <div class="illustration pall-story-landscape">
    <img class="environment" src="/workshop/environment.webp" alt="The smithing workshop, with a forge, bench and distant city" />
    <img class="guther" src="/workshop/guther-front.webp" alt="Guther Anvil, the smithing foreman" />
    <!-- The exact same environment is composited again only over the tabletop.
         The bench appears in FRONT of Guther instead of clipping his legs. -->
    <img class="environment bench-foreground" src="/workshop/environment.webp" alt="" aria-hidden="true" />
    <button type="button" class="npc-hotspot" aria-label="Talk to Guther Anvil"
      title="Talk to Guther Anvil" onclick={() => {selected=null;talkingToGuther=true;}}>
      <span class="workshop-npc-label">Guther Anvil</span>
    </button>

    <img class="prop-art stamps" src={workshopObjects.stamps.image} alt="" aria-hidden="true" />
    <img class="prop-art plates" src={workshopObjects.plates.image} alt="" aria-hidden="true" />
    <img class="prop-art paper" src={workshopObjects.paper.image} alt="" aria-hidden="true" />
    <img class="prop-art hammer" src={workshopObjects.hammer.image} alt="" aria-hidden="true" />

    <div class="prop-markers" aria-label="Workshop objects">
      {#each keys as key}
        <button
          class:chosen={selected === key}
          class="prop-marker {key}"
          data-workshop-object
          data-pall-sfx={key==='paper'?'paper':'click'}
          type="button"
          aria-pressed={selected === key}
          aria-label={'Inspect ' + workshopObjects[key].name}
          onclick={() => inspect(key)}
        >
          <span class="workshop-object-label">{workshopObjects[key].label}</span>
        </button>
      {/each}
    </div>
    </div>
  </div>
  {/snippet}
  {#snippet panel()}
  <div class="reading-column pall-story-dialogue-section">
    <div class="dialogue" aria-label="Workshop conversation">
      {#if talkingToGuther}
        <NpcConversation origin="Millhand" close={() => {talkingToGuther=false;}} skipToWork={() => {talkingToGuther=false;selected=null;skipToWork();}} />
      {:else}
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
        <p class="small">You can now take the paper and begin the saved workshop task.</p>
      {/if}

      <div class="responses">
        {#if beat.kind === 'choice' && beat.choices}
          {#each beat.choices as choice}
            <button type="button" onclick={() => {selected = null; advance(choice.next, true);}}>{choice.label}</button>
          {/each}
        {:else if beat.next}
          <button type="button" onclick={() => {selected = null; if (beat.next) advance(beat.next);}}>Continue</button>
        {/if}
        {#if beat.kind !== 'handoff'}
          <button type="button" class="skip-to-work" onclick={() => {selected=null;skipToWork();}}>{GUTHER_WORK_SKIP_LINE}</button>
        {/if}
        {#if beat.kind === 'handoff' && takeWorkPaper}
          <button type="button" data-pall-sfx="paper" disabled={takingWork} onclick={() => {void takeWorkPaper();}}>{takingWork ? 'Saving…' : 'Take the work paper'}</button>
        {/if}
        {#if handoffError}<p role="alert" class="handoff-error">{handoffError}</p>{/if}
        {#if canGoBack}
          <button class="back" type="button" onclick={() => {selected = null; goBack();}}>Previous line</button>
        {/if}
      </div>
      {/if}
    </div>
    {#if selected && !talkingToGuther}
      <WorkshopItemPopover itemKey={selected} placement="docked"
        title={workshopObjects[selected].name}
        description={workshopObjects[selected].observation}
        onClose={() => {selected=null;}}>
        <small class="inspection-note">
          {readyForWork
            ? 'Stage 2 work commands are not enabled in this read-only integration.'
            : 'This is inspection only. Continue the conversation to receive the work paper.'}
        </small>
      </WorkshopItemPopover>
    {/if}
  </div>
  {/snippet}
  </ActivityLayout>

</section>

<style>
  .workshop {display:flex;flex-direction:column;flex:1;min-width:0;width:100%;color:#f3e3ce;font-family:var(--pall-font-reading,Georgia,serif)}
  /* The workbench painting is the scene stage at its native 2:1 ratio, so
     Guther, the bench occluder and every tabletop hitbox stay registered to
     the painted objects at any size. */
  .illustration {position:relative;width:100%;aspect-ratio:2 / 1;overflow:hidden;background:#271b14}
  .environment {position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
  .guther {position:absolute;top:6%;left:11%;height:112%;max-width:none;width:auto;object-fit:contain;z-index:1;pointer-events:none;filter:drop-shadow(0 5px 6px #0a080555)}
  .bench-foreground {z-index:2;clip-path:inset(70% 0 0 0)}
  .npc-hotspot {position:absolute;z-index:4;top:12%;left:12%;width:25%;height:56%;display:flex;align-items:flex-end;justify-content:center;
    padding:0 0 10px;border:0;background:transparent;color:#f9dfb2;cursor:pointer}
  .npc-hotspot:focus-visible {outline:2px solid #efd092;outline-offset:2px}
  .prop-art {position:absolute;z-index:3;max-width:none;object-fit:contain;pointer-events:none;
    filter:drop-shadow(0 4px 4px #0b0709a1);transform-origin:center 72%;
    transition:transform 160ms ease-out}
  .prop-art.stamps {width:23%;height:31%;bottom:5%;left:1.5%}
  .prop-art.plates {width:25%;height:30%;bottom:5%;left:26%}
  .prop-art.paper {width:23%;height:29%;bottom:5%;left:56%}
  .prop-art.hammer {width:21%;height:38%;bottom:4%;right:0;transform:rotate(-32deg)}
  /* Reading column: Guther's conversation, then the selected object's card.
     Both are as tall as their content; neither scrolls internally. */
  .reading-column {flex-direction:column;align-items:stretch;gap:10px}
  .dialogue {position:relative;width:100%;min-width:0;box-sizing:border-box;color:#251a13}
  .speaker {font:600 10px/1.4 sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#4c3524;margin:0 0 8px}
  .dialogue-line,.narration {margin:0 0 12px;font-size:var(--dialogue-text,17px);line-height:1.55}
  .narration{font-style:italic}
  .small {color:#654d3c;font-size:14px;line-height:1.4}
  .responses {display:flex;flex-direction:column;gap:6px}
  .responses button {text-align:left;background:#221c16;border:1px solid #65492e;color:#f5e4c9;font:var(--dialogue-text,17px)/1.35 var(--pall-font-reading,Georgia,serif);padding:7px 9px;min-height:30px;cursor:pointer}
  .responses button:hover,.responses button:focus-visible {outline:2px solid #d3a86a;outline-offset:1px}
  .responses .back {background:#57412c;color:#f6e9d8}
  .responses .skip-to-work{background:#493321;border-color:#a07a4b}
  .responses button:disabled{opacity:.55;cursor:not-allowed}
  .handoff-error{font:13px/1.4 sans-serif;color:#873523;margin:6px 0}
  /* The entire visible object area, not just its nameplate, is clickable. */
  .prop-marker {position:absolute;z-index:5;bottom:1%;background:none;border:0;color:#f3e8d2;
    cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:0;padding:0}
  .prop-marker.stamps{left:1.5%;width:23%;height:37%}
  .prop-marker.plates{left:26%;width:25%;height:36%}
  .prop-marker.paper{left:56%;width:23%;height:35%}
  .prop-marker.hammer{right:0;width:21%;height:44%}
  .illustration:has(.prop-marker.stamps:is(:hover,:focus-visible)) .prop-art.stamps,
  .illustration:has(.prop-marker.plates:is(:hover,:focus-visible)) .prop-art.plates,
  .illustration:has(.prop-marker.paper:is(:hover,:focus-visible)) .prop-art.paper{transform:scale(1.018)}
  .illustration:has(.prop-marker.hammer:is(:hover,:focus-visible)) .prop-art.hammer{transform:rotate(-32deg) scale(1.018)}
  .prop-marker:focus-visible {outline:2px solid #f2d28f;outline-offset:3px}
  .inspection-note{
    display:block;margin:0;color:#64452b;
    font:500 14px/1.4 var(--pall-font-reading,Georgia,serif);
  }
  /* A narrow stage (phones, or a narrow column) uses the original 4:3
     close crop so Guther and the four tools stay large enough to tap. */
  @container activity-stage (max-width:600px){
    .illustration {aspect-ratio:4 / 3}
    .environment {object-position:39% center}
    .guther {height:86%;left:-5%;top:2%}
    .bench-foreground{object-position:39% center}
    .npc-hotspot {left:0;top:7%;width:41%;height:49%;padding-bottom:0}
    .prop-art.stamps {width:26%;height:24%;left:0;bottom:9%}
    .prop-art.plates {width:29%;height:23%;left:24%;bottom:9%}
    .prop-art.paper {width:27%;height:24%;left:49%;bottom:9%}
    .prop-art.hammer {width:27%;height:30%;right:0;bottom:8%}
    .prop-marker {bottom:2%}
    .prop-marker.stamps {left:0;width:25%;height:33%}
    .prop-marker.plates {left:24%;width:29%;height:32%}
    .prop-marker.paper {left:49%;width:27%;height:33%}
    .prop-marker.hammer {right:0;width:27%;height:39%}
  }
  @media(prefers-reduced-motion:reduce){.prop-art{transition:none}}
</style>