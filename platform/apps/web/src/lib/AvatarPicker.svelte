<script lang="ts">
  let {sex,selectedId=null,onSelect}:{
    sex:'Male'|'Female';
    selectedId?:string|null;
    onSelect:(id:string)=>void;
  }=$props();
  const choices=$derived(Array.from({length:8},(_,index)=>
    sex.toLowerCase()+'-'+String(index+1).padStart(2,'0')));
</script>
<div class="avatar-grid" role="group" aria-label={sex+' portrait choices'}>
  {#each choices as id,i (id)}
    <button type="button" class:chosen={selectedId===id} aria-pressed={selectedId===id}
      aria-label={sex+' portrait '+(i+1)}
      onclick={() => onSelect(id)}>
      <img src={'/ui-kit/avatars/'+id+'.webp'} alt="" loading="lazy" />
      <span>Portrait {String(i+1).padStart(2,'0')}</span>
    </button>
  {/each}
</div>
<style>
  .avatar-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  button{appearance:none;min-width:0;padding:4px;background:#201b17;
    border:1px solid #796148;cursor:pointer;color:#e8dbc5}
  button:hover,button:focus-visible{border-color:#dfb77a}
  button.chosen{border:2px solid #e2b36b;background:#483321}
  button:focus-visible{outline:2px solid #e5c18d;outline-offset:2px}
  img{display:block;width:100%;aspect-ratio:1;object-fit:cover;object-position:center 18%}
  span{display:block;text-align:center;font:13px/1.4 var(--pall-font-reading,Georgia,serif);padding:5px 2px}
  @media(max-width:550px){.avatar-grid{gap:5px}}
</style>
