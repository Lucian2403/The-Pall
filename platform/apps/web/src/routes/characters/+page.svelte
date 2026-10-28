<script lang="ts">
  import {onMount} from 'svelte';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';
  import AvatarPicker from '$lib/AvatarPicker.svelte';
  import CharacterAvatar from '$lib/CharacterAvatar.svelte';
  import {originVisual} from '$lib/origin-visuals';

  type Character={
    id:string;name:string;origin:string;sex:string;avatarId?:string|null;
    startingLocation:string;coins:number;
    tutorial:{stage:number;status:string};
    majorSkillBonuses:Record<string,number>;
  };
  type Roster={revision:number;slots:{used:number;limit:number};characters:Character[]};
  let roster=$state<Roster|null>(null);
  let state=$state<'checking'|'ready'|'login'|'unavailable'>('checking');
  let editingId=$state<string|null>(null);
  let deletingId=$state<string|null>(null);
  let deletionName=$state('');
  let processingId=$state<string|null>(null);
  let alertMessage=$state('');
  async function refresh(){
    try{
      const res=await fetch('/api/characters',{cache:'no-store'});
      if(res.status===401){state='login';return;}
      if(!res.ok){state='unavailable';return;}
      roster=await res.json() as Roster;
      state='ready';
    }catch{state='unavailable';}
  }
  onMount(()=>{void refresh();});
  async function changePortrait(character:Character,id:string){
    if(processingId)return;
    processingId=character.id;alertMessage='';
    try{
      const res=await fetch('/api/characters/'+encodeURIComponent(character.id)+'/avatar',{
        method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({avatarId:id})
      });
      if(!res.ok)throw Error('Could not save that portrait.');
      editingId=null;
      await refresh();
    }catch(e){alertMessage=e instanceof Error?e.message:'Could not save portrait.';}
    finally{processingId=null;}
  }
  async function removeCharacter(character:Character){
    if(!roster||processingId||deletionName!==character.name)return;
    processingId=character.id;alertMessage='';
    try{
      const response=await fetch('/api/characters/'+encodeURIComponent(character.id),{
        method:'DELETE',headers:{'content-type':'application/json'},
        body:JSON.stringify({confirmedName:deletionName,expectedRevision:roster.revision})
      });
      if(!response.ok){
        const b=await response.json().catch(()=>({error:'unknown'})) as {error:string};
        if(b.error==='stale_revision'){await refresh();throw Error('Your roster changed. Review it and confirm removal again.');}
        throw Error(b.error==='character_in_use'?'This character has linked data that prevents removal.':'Character could not be removed: '+b.error);
      }
      deletingId=null;deletionName='';
      await refresh();
    }catch(e){alertMessage=e instanceof Error?e.message:'Cannot remove character.';}
    finally{processingId=null;}
  }
</script>
<svelte:head><title>The Pall — Your Characters</title></svelte:head>
<div class="entry-page">
  <div class="entry-wrap">
    <nav class="entry-nav" aria-label="Page navigation">
      <a class="brand" href="/introduction"><img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/><span>A CITY ENDURES</span></a>
      <div class="entry-links"><a href="/introduction">World introduction</a><a href="/account">Account</a></div>
    </nav>
    <header class="entry-hero">
      <div><span class="entry-eyebrow">Account · Characters</span><h1>Your characters</h1></div>
    </header>
    <main class="entry-content">
      {#if state==='checking'}
        <p role="status">Loading your characters…</p>
      {:else if state==='login'}
        <p>Sign in to view your characters.</p><a class="entry-button" href="/account">Account access</a>
      {:else if state==='unavailable'||!roster}
        <p role="alert">The character service is unavailable. Check the API and database.</p>
      {:else}
        <div class="roster-head">
          <p class="entry-muted">{roster.slots.used} of {roster.slots.limit} character slots occupied.</p>
          {#if roster.slots.used<roster.slots.limit}<a class="entry-button" href="/backgrounds">Create a character</a>{/if}
        </div>
        {#if alertMessage}<p class="entry-error" role="alert">{alertMessage}</p>{/if}
        {#if roster.characters.length===0}
          <p>You haven't created a character yet.</p>
        {:else}
          <div class="roster">
            {#each roster.characters as character (character.id)}
              <article class="character-card">
                <div class="card-image" style={'background-image:linear-gradient(0deg,#171310f5 0%,#17131093 42%,#17131039 100%),url("'+originVisual(character.origin).src+'")'}>
                  <div class="avatar-slot"><CharacterAvatar name={character.name} avatarId={character.avatarId}/></div>
                  <div class="card-title">
                    <span class="entry-eyebrow">{character.origin} · {character.sex}</span>
                    <h2>{character.name}</h2>
                  </div>
                </div>
                <div class="card-details">
                  <p>{character.startingLocation}</p>
                  <p class="entry-muted">Introduction · Stage {character.tutorial.stage} of 8</p>
                  <div class="card-actions">
                    <a class="entry-button" href={'/characters/'+encodeURIComponent(character.id)}>Select character</a>
                    <button class="small-action" type="button" onclick={()=>{
                      editingId=editingId===character.id?null:character.id;deletingId=null;alertMessage='';
                    }}>{editingId===character.id?'Cancel':'Change portrait'}</button>
                    <button class="small-action danger-link" type="button" onclick={()=>{
                      deletingId=deletingId===character.id?null:character.id;editingId=null;
                      deletionName='';alertMessage='';
                    }}>{deletingId===character.id?'Cancel removal':'Remove'}</button>
                  </div>
                  {#if editingId===character.id}
                    <div class="card-editor">
                      <p>Choose a {character.sex.toLowerCase()} portrait. The same collection is available to every background.</p>
                      <AvatarPicker sex={character.sex==='Female'?'Female':'Male'}
                        selectedId={character.avatarId??null}
                        onSelect={(id)=>{void changePortrait(character,id);}}/>
                      {#if processingId===character.id}<p role="status">Saving portrait…</p>{/if}
                    </div>
                  {/if}
                  {#if deletingId===character.id}
                    <div class="card-editor">
                      <p><strong>Permanent removal.</strong> This deletes {character.name} and their saved tutorial progress. It cannot be undone.</p>
                      <label for={'remove-'+character.id}>Type <strong>{character.name}</strong> to confirm:</label>
                      <input id={'remove-'+character.id} bind:value={deletionName} autocomplete="off"/>
                      <div class="entry-action-row">
                        <button type="button" class="entry-button entry-danger" disabled={deletionName!==character.name||processingId!==null}
                          onclick={()=>{void removeCharacter(character);}}>Remove permanently</button>
                        <button class="small-action" type="button" onclick={()=>{deletingId=null;deletionName='';}}>Keep character</button>
                      </div>
                    </div>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        {/if}
      {/if}
    </main>
  </div>
</div>
<style>
  .entry-hero{min-height:220px;max-height:260px}
  .roster-head{display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap;margin:0 0 18px}
  .roster{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
  .character-card{min-width:0;background:#29241f;border:1px solid #785c3d;overflow:hidden}
  .card-image{height:195px;position:relative;display:flex;justify-content:space-between;align-items:flex-end;
    padding:15px;background-size:cover;background-position:center 45%}
  .card-title{min-width:0;text-align:right}
  .card-title h2{margin:3px 0 0;font:600 25px/1.1 var(--pall-font-reading,Georgia,serif);
    text-shadow:0 2px 3px #000}
  .avatar-slot :global(.portrait){width:76px;height:85px;box-shadow:0 3px 10px #0008}
  .card-details{padding:14px}
  .card-details p{margin:0 0 9px}
  .card-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:13px}
  .card-actions .entry-button{font-size:14px}
  .small-action{border:0;padding:7px 2px;background:transparent;color:#e1bb87;
    text-decoration:underline;cursor:pointer;font:600 13px/1.3 var(--pall-font-reading,Georgia,serif)}
  .danger-link{color:#efaa99}
  .card-editor{padding:13px 0;margin-top:13px;border-top:1px solid #73563a}
  .card-editor label{display:block;margin:9px 0}
  .card-editor input{width:100%;padding:9px;background:#eee0ca;border:1px solid #846646;
    color:#2a1c12;font:16px var(--pall-font-reading,Georgia,serif);margin-bottom:12px}
  .card-editor .entry-action-row{margin-top:8px}
  @media(max-width:1090px){.roster{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:650px){.roster{grid-template-columns:1fr}}
</style>