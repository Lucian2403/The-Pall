<script lang="ts">
  /**
   * Universal portrait slot. Avatar IDs refer to one shared portrait library,
   * never to an origin, starting location, class or sex. The server may supply
   * avatarId once portrait selection is approved and persisted.
   */
  let {name, avatarId = null, compact = false}: {
    name:string;
    avatarId?:string|null;
    compact?:boolean
  } = $props();
  const safeId=$derived(
    avatarId && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(avatarId) ? avatarId : null
  );
  let extension=$state<'webp'|'png'|null>('webp');
  $effect(()=>{safeId;extension='webp';});
</script>
<span class:compact class="portrait" role="img" aria-label={'Portrait of '+name}>
  {#if safeId && extension}
    <img src={'/ui-kit/avatars/'+safeId+'.'+extension} alt="" aria-hidden="true"
      onerror={() => {extension=extension==='webp'?'png':null;}} />
  {:else}
    <span class="initial" aria-hidden="true">{name.slice(0,1).toUpperCase()}</span>
  {/if}
</span>
<style>
  .portrait{display:grid;place-items:center;position:relative;flex:none;overflow:hidden;
    width:44px;height:48px;border:1px solid #987346;background:#251f19;color:#edd6ae}
  .portrait.compact{width:37px;height:40px}
  img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 23%}
  .initial{font:normal 24px/1 var(--pall-font-reading,Georgia,serif)}
  .compact .initial{font-size:21px}
</style>
