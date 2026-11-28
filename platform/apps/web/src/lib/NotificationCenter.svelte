<script lang="ts">
  import {untrack} from 'svelte';
  import type {GameNotification,NotificationInbox,ActivityStatusSnapshot} from '@the-pall/game-core';
  import ShellServiceControl from './ShellServiceControl.svelte';
  import {playActivityCompletionSfx} from './pall-audio';
  let {characterId,inbox}:{characterId:string;inbox:NotificationInbox}=$props();
  let current=$state<NotificationInbox>({items:[],unread:0});
  let open=$state(false),pending=$state(false),error=$state('');
  let toast=$state<GameNotification|null>(null);
  let timer:ReturnType<typeof setTimeout>|undefined;
  let owner='';
  const seen=new Set<string>();
  function dismiss(){clearTimeout(timer);toast=null;}
  function apply(id:string,next:NotificationInbox){
    if(owner!==id){owner=id;seen.clear();open=false;dismiss();}
    current=next;
    // Durable inbox is the authority. This local cache only suppresses repeat toasts.
    const key='pall.notice.seen:'+id;
    try{for(const item of JSON.parse(localStorage.getItem(key)??'[]'))if(typeof item==='string')seen.add(item);}catch{}
    const fresh=next.items.filter(item=>!item.readAt&&!seen.has(item.id));
    if(!fresh.length)return;
    for(const item of fresh)seen.add(item.id);
    try{localStorage.setItem(key,JSON.stringify([...seen].slice(-200)));}catch{}
    dismiss();toast=fresh[0];
    playActivityCompletionSfx();
    timer=setTimeout(dismiss,7000);
  }
  $effect(()=>{const id=characterId,next=inbox;untrack(()=>apply(id,next));});
  $effect(()=>()=>clearTimeout(timer));
  async function markRead(){
    if(pending||!current.unread)return;
    const id=characterId;pending=true;error='';
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(id)+'/free-play/notifications/read',{
        method:'POST',headers:{'content-type':'application/json'},body:'{}'
      });
      if(!response.ok)throw Error('Could not mark notifications read.');
      const status=await response.json() as ActivityStatusSnapshot;
      if(characterId===id&&status.notifications)apply(id,status.notifications);
    }catch{if(characterId===id)error='Could not mark notifications read. Try again.';}
    finally{pending=false;}
  }
</script>

<div class="notification-center">
  <ShellServiceControl kind="notifications" service={{unread:current.unread,active:open,open:()=>{open=!open;}}}/>
  {#if open}
    <aside class="notification-panel" aria-label="Notifications">
      <header><strong>Notifications</strong><button type="button" onclick={()=>open=false} aria-label="Close notifications">×</button></header>
      {#if current.unread}<button type="button" class="read-all" disabled={pending} onclick={()=>{void markRead();}}>Mark all as read ({current.unread})</button>{/if}
      {#if error}<p role="alert">{error}</p>{/if}
      {#each current.items as item (item.id)}
        <article class:unread={!item.readAt}>
          <strong>{item.title}</strong><p>{item.message}</p>
          <time datetime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
        </article>
      {:else}<p>No notifications.</p>{/each}
    </aside>
  {/if}
</div>
{#if toast}
  <aside class="notification-toast" aria-label="Activity notification">
    <div role="status"><strong>{toast.title}</strong><p>{toast.message}</p></div>
    <button type="button" aria-label="Dismiss notification" onclick={dismiss}>×</button>
  </aside>
{/if}

<style>
  .notification-center{position:relative;display:flex;flex:none}
  .notification-panel,.notification-toast{box-sizing:border-box;position:fixed;right:12px;z-index:10010;width:min(340px,calc(100vw - 24px));background:#2e2319;color:#f2dfc0;border:1px solid #a78251;box-shadow:0 6px 24px #000a;padding:12px;font:15px/1.4 var(--pall-font-reading,Georgia,serif)}
  .notification-panel{top:76px;max-height:65dvh;overflow:auto}
  header{display:flex;justify-content:space-between;align-items:center;gap:8px}
  button{background:#49341f;color:#f2dfc0;border:1px solid #a78251;padding:5px 9px;cursor:pointer;font:inherit}
  .read-all{margin:8px 0;width:100%}
  article{border-top:1px solid #785b3b;padding:10px 5px}
  article.unread{border-left:3px solid #d6ac66;padding-left:9px}
  p{margin:5px 0}time{font-size:12px;color:#bca17a}
  .notification-toast{bottom:18px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
  .notification-toast button{flex:none}
</style>
