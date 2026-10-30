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
<div class="entry-page characters-page">
  <div class="entry-wrap">
    <!-- Match the approved public entry pages with one uninterrupted skyline. -->
    <div class="characters-masthead">
      <nav class="entry-nav" aria-label="Page navigation">
        <a class="brand" href="/introduction" aria-label="The Pall, world introduction">
          <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        </a>
        <div class="entry-links">
          <a href="/introduction">World introduction</a>
          <a href="/account">Account</a>
        </div>
      </nav>
      <header class="entry-hero">
        <div>
          <span class="entry-eyebrow">Account · Characters</span>
          <h1>Your characters</h1>
        </div>
      </header>
    </div>
    <main class="entry-content characters-content">
      {#if state==='checking'}
        <div class="roster-notice"><p role="status">Loading your characters…</p></div>
      {:else if state==='login'}
        <div class="roster-notice"><p>Sign in to view your characters.</p><a class="entry-button" href="/account">Account access</a></div>
      {:else if state==='unavailable'||!roster}
        <div class="roster-notice"><p role="alert">The character service is unavailable. Check the API and database.</p></div>
      {:else}
        <div class="roster-head">
          <p class="entry-muted">{roster.slots.used} of {roster.slots.limit} character slots occupied.</p>
          {#if roster.slots.used<roster.slots.limit}<a class="entry-button" href="/backgrounds">Create a character</a>{/if}
        </div>
        {#if alertMessage}<p class="entry-error" role="alert">{alertMessage}</p>{/if}
        {#if roster.characters.length===0}
          <div class="roster-notice"><p>You haven't created a character yet.</p></div>
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
  /* Preserve the working roster, portraits and all destructive confirmations.
     Scope this pass to the character-selection route only. */
  .characters-page{padding-top:13px}
  .characters-page .entry-wrap{max-width:1160px}

  /* One panoramic surface behind navigation and title. */
  .characters-masthead{
    position:relative;
    isolation:isolate;
    overflow:hidden;
    border:1px solid #745538;
    background:#24201b url('/ui-kit/resources/TheCityVista.png') center 31%/cover no-repeat;
  }
  .characters-masthead::before{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:
      linear-gradient(90deg,#15120fec 0%,#15120fc6 27%,#15120f37 67%,transparent 100%),
      linear-gradient(180deg,#100e0cbd 0%,#100e0c55 25%,transparent 58%);
  }
  .characters-page .entry-nav{
    position:relative;
    z-index:1;
    flex-wrap:wrap;
    gap:12px;
    padding:10px clamp(14px,2.4vw,30px) 12px;
    border:0;
    background:transparent;
  }
  .characters-page .entry-nav .brand img{
    display:block;
    width:clamp(174px,17vw,228px);
    max-height:118px;
    height:auto;
    object-fit:contain;
    filter:drop-shadow(0 2px 5px #0b0807cc);
  }
  .characters-page .entry-links{
    justify-content:flex-end;
    gap:clamp(5px,.7vw,10px);
  }
  .characters-page .entry-hero{
    position:relative;
    z-index:1;
    display:flex;
    align-items:flex-end;
    min-height:clamp(190px,20vw,230px);
    max-height:none;
    border:0;
    padding:clamp(24px,3vw,40px);
    background:transparent;
  }
  .characters-page .entry-hero::after{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:linear-gradient(0deg,#15120fc9,transparent 67%);
  }
  .characters-page .entry-hero > div{position:relative;z-index:1}
  .characters-page .entry-hero h1{
    margin:8px 0 0;
    font:600 clamp(34px,4vw,54px)/1.13 var(--pall-font-reading,Georgia,serif);
    letter-spacing:-.02em;
    color:#f7e5cd;
  }

  /* Owner-supplied three-state button artwork throughout the roster. */
  .characters-page .entry-links a,
  .characters-page .entry-button,
  .characters-page .small-action{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-style:solid;
    border-color:transparent;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#25170e;
    font:600 15px/1.3 var(--pall-font-reading,Georgia,serif);
    text-align:center;
    text-decoration:none;
    text-shadow:none;
    cursor:pointer;
  }
  .characters-page .entry-links a{
    min-height:42px;
    padding:2px 5px;
    border-width:10px 21px 9px;
    border-image-width:10px 21px 9px;
    white-space:nowrap;
  }
  .characters-page .entry-button,
  .characters-page .small-action{
    min-height:46px;
    padding:3px 6px;
    border-width:11px 23px 10px;
    border-image-width:11px 23px 10px;
    max-width:100%;
  }
  .characters-page .small-action{font-size:13px}
  .characters-page .entry-links a:hover,
  .characters-page .entry-button:hover:not(:disabled),
  .characters-page .small-action:hover:not(:disabled){
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    background:transparent;
    color:#170d08;
    text-decoration:none;
  }
  .characters-page .entry-links a:active,
  .characters-page .entry-button:active:not(:disabled),
  .characters-page .small-action:active:not(:disabled){
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
  .characters-page .entry-links a:focus-visible,
  .characters-page .entry-button:focus-visible,
  .characters-page .small-action:focus-visible,
  .characters-page .card-editor input:focus-visible{
    outline:2px solid #a66d36;
    outline-offset:3px;
  }
  .characters-page .entry-button:disabled,
  .characters-page .small-action:disabled{opacity:.58;cursor:not-allowed}
  .characters-page .danger-link{color:#783a2b}
  .characters-page .danger-link:hover:not(:disabled){color:#632719}
  .characters-page .entry-danger{color:#722c23}

  .characters-page .characters-content{
    padding:clamp(16px,3vw,36px);
    border:1px solid #59452f;
    border-top:0;
    background:radial-gradient(ellipse at 52% 0%,#30271d 0%,#1b1916 75%);
  }

  /* The status strip is a compact parchment plaque; no invented character data. */
  .characters-page .roster-head,
  .characters-page .roster-notice{
    min-width:0;
    border-style:solid;
    border-color:transparent;
    border-width:22px 27px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:22px 27px 20px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    box-shadow:0 6px 18px #0005;
    color:#332114;
    padding:9px 14px 11px;
  }
  .characters-page .roster-head{
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:12px;
    margin:0 0 21px;
  }
  .characters-page .roster-head p,
  .characters-page .roster-notice p{
    margin:0;
    color:#382719;
    font:400 16px/1.5 Georgia,'Times New Roman',serif;
  }
  .characters-page .roster-notice{
    max-width:650px;
    margin:0 auto;
  }
  .characters-page .roster-notice .entry-button{margin-top:13px}
  .characters-page .characters-content > .entry-error{
    padding:10px 14px;
    margin:0 0 18px;
    background:#39251e;
    border-left:3px solid #b47a58;
    color:#ffe4d3;
  }

  /* Retain origin artwork and the selected portrait as the actual card header. */
  .characters-page .roster{
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:clamp(13px,1.8vw,22px);
    align-items:start;
  }
  .characters-page .character-card{
    min-width:0;
    overflow:hidden;
    border:1px solid #81603d;
    background:#251e18;
    box-shadow:0 8px 20px #0008;
  }
  .characters-page .card-image{
    min-width:0;
    height:205px;
    position:relative;
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap:12px;
    padding:clamp(12px,1.6vw,19px);
    background-size:cover;
    background-position:center 45%;
  }
  .characters-page .avatar-slot{flex:none}
  .characters-page .avatar-slot :global(.portrait){
    width:76px;
    height:85px;
    border:2px solid #b28b59;
    box-shadow:0 3px 10px #000b;
  }
  .characters-page .card-title{min-width:0;text-align:right}
  .characters-page .card-title .entry-eyebrow{
    color:#efd6a8;
    font-size:14px;
    text-shadow:0 2px 5px #090503;
  }
  .characters-page .card-title h2{
    margin:5px 0 0;
    color:#fff0d9;
    font:600 clamp(21px,2.3vw,28px)/1.16 var(--pall-font-reading,Georgia,serif);
    text-shadow:0 2px 5px #000;
    overflow-wrap:anywhere;
  }

  /* Individual nine-slice parchment panels below the art, rather than
     placing labels and actions directly on a flat charcoal rectangle. */
  .characters-page .card-details{
    min-width:0;
    border-style:solid;
    border-color:transparent;
    border-width:25px 27px 23px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:25px 27px 23px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#2b1c12;
    padding:10px 11px 14px;
  }
  .characters-page .card-details p{
    margin:0 0 10px;
    color:#352316;
    font:400 16px/1.47 Georgia,'Times New Roman',serif;
    overflow-wrap:anywhere;
  }
  .characters-page .card-details .entry-muted{color:#644a32;font-size:15px}
  .characters-page .card-actions{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:4px 6px;
    margin-top:14px;
  }
  .characters-page .card-actions .entry-button{
    grid-column:1/-1;
    width:100%;
  }
  .characters-page .card-actions .small-action{
    min-width:0;
    font-size:13px;
    border-width:10px 17px 9px;
    border-image-width:10px 17px 9px;
    white-space:normal;
  }
  .characters-page .card-editor{
    margin-top:16px;
    padding:15px 0 0;
    border-top:1px solid #aa8a64;
    color:#312116;
    min-width:0;
  }
  .characters-page .card-editor p{color:#382618}
  .characters-page .card-editor strong{color:#54251c}
  .characters-page .card-editor label{
    display:block;
    margin:10px 0 8px;
    color:#352316;
    font:600 15px/1.5 Georgia,'Times New Roman',serif;
  }
  .characters-page .card-editor input{
    display:block;
    width:100%;
    box-sizing:border-box;
    min-height:44px;
    margin:0 0 13px;
    padding:9px 11px;
    border:1px solid #826142;
    border-radius:0;
    background:#f8eddb;
    color:#24160f;
    font:16px/1.4 Georgia,'Times New Roman',serif;
  }
  .characters-page .card-editor .entry-action-row{gap:6px;flex-wrap:wrap}
  .characters-page .card-editor .entry-action-row .entry-button{flex:1 1 170px}
  /* Leave AvatarPicker's selection and focus feedback intact; it owns
     its inner portrait buttons, not the page-wide nine-slice navigation style. */

  @media(max-width:1090px){
    .characters-page .roster{grid-template-columns:repeat(2,minmax(0,1fr))}
  }
  @media(max-width:750px){
    .characters-page .entry-nav{padding:8px 13px 10px}
    .characters-page .entry-links{width:100%;justify-content:flex-start;gap:5px 8px}
    .characters-page .entry-links a{
      min-height:37px;
      padding:1px 3px;
      border-width:8px 17px;
      border-image-width:8px 17px;
      font-size:14px;
    }
    .characters-page .entry-nav .brand img{
      width:clamp(162px,35vw,205px);
      max-height:110px;
    }
    .characters-masthead{background-position:55% 31%}
    .characters-masthead::before{
      background:
        linear-gradient(180deg,#15120fdb 0%,#15120f70 38%,transparent 72%),
        linear-gradient(90deg,#15120fd9,#15120f22 100%);
    }
    .characters-page .entry-hero{min-height:190px;padding:23px 21px}
  }
  @media(max-width:650px){
    .characters-page .roster{grid-template-columns:1fr}
    .characters-page .card-image{height:220px}
  }
  @media(max-width:420px){
    .characters-page{padding:9px}
    .characters-page .characters-content{padding:12px}
    .characters-page .roster-head,.characters-page .roster-notice{
      border-width:20px 23px 19px;
      border-image-width:20px 23px 19px;
      padding:9px;
    }
    .characters-page .card-details{
      border-width:23px 25px 22px;
      border-image-width:23px 25px 22px;
      padding:10px 7px 13px;
    }
    .characters-page .card-actions .small-action{font-size:13px}
    .characters-page .card-title h2{font-size:23px}
  }
</style>