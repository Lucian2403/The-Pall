<script lang="ts" module>
  /** A real service, once one exists, opens its own drawer/dock/centre. */
  export type ShellService={
    open:()=>void;
    /** True while the service's drawer or dock is showing. */
    active?:boolean;
    /** Only a server-confirmed count; never a placeholder number. */
    unread?:number;
  };
</script>

<script lang="ts">
  import {beforeNavigate} from '$app/navigation';
  import {openAnchoredPopover} from '$lib/anchored-popover';
  let {kind,service}:{kind:'notifications'|'chat';service?:ShellService}=$props();
  const copy=$derived(kind==='chat'
    ?{label:'Chat',heading:'Chat',
      body:'Chat is not available yet. Nothing is sent, received or stored here.'}
    :{label:'Notifications',heading:'Notifications',
      body:'Notifications are not available yet. No game events are collected here.'});
  const panelId=$derived('pall-'+kind+'-status');
  let open=$state(false);
  let trigger=$state<HTMLButtonElement>();
  let panel=$state<HTMLDivElement>();
  $effect(()=>{
    if(!open||!panel||!trigger)return;
    return openAnchoredPopover({trigger,panel,onDismiss:()=>{open=false;},minHeight:80});
  });
  beforeNavigate(()=>{open=false;});
</script>

<div class="shell-service" data-shell-service={kind} data-service-state={service?'available':'unavailable'}>
  {#if service}
    <button type="button" class="service-trigger"
      aria-label={copy.label+(service.unread?', '+service.unread+' unread':'')}
      aria-pressed={service.active??false} title={copy.label}
      onclick={service.open}>
      {@render icon()}
      {#if service.unread}<span class="badge" aria-hidden="true">{service.unread>99?'99+':service.unread}</span>{/if}
    </button>
  {:else}
    <button type="button" class="service-trigger unavailable" bind:this={trigger}
      aria-label={copy.label+' (not available yet)'} title={copy.label+' — not available yet'}
      aria-haspopup="true" aria-expanded={open} aria-controls={panelId}
      onclick={()=>{open=!open;}}>
      {@render icon()}
      <svg class="unavailable-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="11" width="12" height="9" rx="1.5"/><path d="M9 11V8.5a3 3 0 0 1 6 0V11"/>
      </svg>
    </button>
    {#if open}
      <div class="service-panel" id={panelId} bind:this={panel} popover="manual"
        role="group" aria-label={copy.heading+' status'}>
        <p class="service-heading">{copy.heading}</p>
        <p class="service-body">{copy.body}</p>
      </div>
    {/if}
  {/if}
</div>

{#snippet icon()}
  <svg class="service-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
    fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    {#if kind==='chat'}
      <path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z"/>
      <path d="M8 9.5h8M8 12.5h5"/>
    {:else}
      <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5h-14z"/>
      <path d="M10 20.5a2 2 0 0 0 4 0"/>
    {/if}
  </svg>
{/snippet}

<style>
  .shell-service{position:relative;display:flex;flex:none}
  .service-trigger{position:relative;display:grid;place-items:center;width:40px;height:40px;padding:0;
    border:1px solid #80613e;background:#241b14;color:#e2c497;cursor:pointer}
  .service-trigger:hover{border-color:#c7a372;background:#3b2b1d}
  .service-trigger:focus-visible{outline:2px solid #e9be7e;outline-offset:3px}
  .service-trigger[aria-pressed="true"],.service-trigger[aria-expanded="true"]{border-color:#d2a96f;background:#4a3522}
  .service-icon{width:21px;height:21px;display:block}
  /* Honest unavailable state: muted ink, dashed frame and a small lock,
     never a fake unread badge. The status popover explains it in words. */
  .service-trigger.unavailable{color:#a48d6e;border-style:dashed;border-color:#6d5539}
  .unavailable-mark{position:absolute;right:2px;bottom:2px;width:13px;height:13px;
    padding:1px;border-radius:2px;background:#241b14;color:#c9ab7f;pointer-events:none}
  .badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;
    border-radius:9px;background:#8e2e22;color:#fff0d8;border:1px solid #e8b778;
    font:700 11px/16px var(--pall-font-reading,Georgia,serif);text-align:center}
  .service-panel{position:fixed;inset:auto;margin:0;box-sizing:border-box;
    width:min(260px,calc(100vw - 16px));overflow-y:auto;overscroll-behavior:contain;
    padding:11px 14px 12px;background:#2a211a;color:#f0dfc8;border:1px solid #a77f4d;
    box-shadow:0 10px 27px #000b}
  .service-heading{margin:0 0 6px;color:#f2d3a8;font:600 16px/1.2 var(--pall-font-reading,Georgia,serif)}
  .service-body{margin:0;color:#dcc6a6;font:14px/1.45 var(--pall-font-reading,Georgia,serif)}
  @media(pointer:coarse){.service-trigger{width:44px;height:44px}}
</style>
