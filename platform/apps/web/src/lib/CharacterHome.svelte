<script lang="ts">
  import {onMount} from 'svelte';
  import CharacterAvatar from '$lib/CharacterAvatar.svelte';
  import {originVisual} from '$lib/origin-visuals';
  import CharacterSkills from '$lib/CharacterSkills.svelte';

  type SavedCharacter = {
    id:string; name:string; sex:string; origin:string; avatarId?:string|null;
    attributes:{STR:number;DEX:number;INT:number;RES:number};
    health:{current:number;maximum:number}; coins:number;
    majorSkillBonuses:Record<string,number>;
    starterItemRequirements:{name:string;quantity:number}[];
    startingLocation:string;
    tutorial:{stage:number;status:string};
  };
  type WorkAction={title:string;description:string;label:string;href:string};
  let {character}:{character:SavedCharacter}=$props();

  const base=$derived('/characters/'+encodeURIComponent(character.id));
  const newArrival=$derived(character.tutorial.stage===1&&character.tutorial.status==='NOT_STARTED');
  const artwork=$derived(originVisual(character.origin));
  const work=$derived.by(():WorkAction|null=>{
    if(newArrival) return {
      title:character.origin==='Millhand'?'The Smithing Workshop':'Your first work',
      description:character.origin==='Millhand'
        ?"A council plate lot waits on Guther Anvil's bench. The foreman has work for you."
        :'Your introduction begins at '+character.startingLocation+'.',
      label:'Enter '+character.startingLocation,
      href:base+'/opening'
    };
    if(character.origin==='Millhand'&&character.tutorial.stage===2) return {
      title:'Marking the Plates',
      description:'Return to the council plate lot and continue the work you have already begun.',
      label:'Continue marking the plates',
      href:base+'/millhand/work'
    };
    if(character.origin==='Millhand'&&character.tutorial.stage===3) return {
      title:'The Missing Stamp',
      description:'There are returned council papers to examine at the workshop.',
      label:'Examine the returned council papers',
      href:base+'/millhand/missing-stamp'
    };
    if(character.origin==='Millhand'&&character.tutorial.stage===4) return {
      title:'Your Second Job',
      description:'Return to your chosen work. Your completed actions are retained.',
      label:'Continue your second job',
      href:base+'/millhand/second-job'
    };
    if(character.origin==='Millhand'&&character.tutorial.stage===5) return {
      title:'Your Finished Work',
      description:'The second job is complete. Review the work already recorded.',
      label:'Review the finished second job',
      href:base+'/millhand/second-job'
    };
    return null;
  });

  // Hide / Show is a reversible local display preference, never a deletion.
  // The notice does not mutate saved quests and the work button stays visible.
  let showArrival=$state(false);
  const arrivalKey=$derived('pall-arrival-dismissed-'+character.id);
  onMount(()=>{
    try{showArrival=newArrival&&localStorage.getItem(arrivalKey)!=='1';}
    catch{showArrival=newArrival;}
  });
  function toggleArrival(){
    showArrival=!showArrival;
    try{
      if(showArrival)localStorage.removeItem(arrivalKey);
      else localStorage.setItem(arrivalKey,'1');
    }catch{/* Local storage unavailable; still toggle this session. */}
  }

  // Approved, short versions of docs/01-player/character-system.md.
  const attributes=[
    {key:'STR',name:'Strength',description:'Physical potential, carrying, heavy jobs/equipment, melee and heavy-tool training.'},
    {key:'DEX',name:'Dexterity',description:'Coordination, firearms, movement, locks and delicate technical work.'},
    {key:'INT',name:'Intellect',description:'Learning and reasoning, research, medicine, chemistry, engineering and investigation.'},
    {key:'RES',name:'Resolve',description:'Endurance under strain, mental resilience and difficult training.'}
  ] as const;
</script>

<div class="arrival-home">
  <section class="character-arrival" aria-label="Your character"
    style={'background-image:linear-gradient(90deg,#17130feb 0%,#17130fba 42%,#17130f45 80%),linear-gradient(0deg,#17130fcc,transparent 65%),url("'+artwork.src+'")'}>
    <div class="arrival-layout">
      <div class="arrival-heading">
        <h1>{newArrival?'Another day within the walls.':'Your life within the walls.'}</h1>
        <p class="arrival-subtitle">{artwork.name} · Introduction, Stage {character.tutorial.stage} of 8</p>
        <div class="identity-row">
          <div class="hero-portrait"><CharacterAvatar name={character.name} avatarId={character.avatarId??null}/></div>
          <div class="identity-copy">
            <h2>{character.name}</h2>
            <p>{character.sex} · {character.origin}</p>
            <p>{character.startingLocation}</p>
            <span class="health-summary">Health {character.health.current} / {character.health.maximum} · {character.coins} coins</span>
          </div>
        </div>
      </div>

      <aside class="personal-notices" aria-label="Personal notices">
        <h2>Personal notices</h2>
        {#if newArrival}
          {#if showArrival}
            <h3>Another shift begins.</h3>
            {#if character.origin==='Millhand'}
              <p>The workshops are already awake. Smoke rises between the roofs, and beyond the crowded streets the Grand Cylinder continues its endless work.</p>
              <p>At Guther Anvil's workshop, a new council plate lot awaits.</p>
            {:else}
              <p>The city is already awake. Your first task begins at {character.startingLocation}.</p>
            {/if}
            <p class="notice-signoff">You've a living to make.</p>
          {/if}
          <button class="quiet-action notice-toggle" type="button"
            aria-expanded={showArrival} onclick={toggleArrival}>
            {showArrival?'Hide notice':'Show notice'}
          </button>
          <!-- Notice visibility never hides the chapter's only next action. -->
          {#if work}
            <div class="notice-work">
              <h3>{work.title}</h3>
              <p>{work.description}</p>
              <a class="framed-action" href={work.href}>{work.label}</a>
            </div>
          {/if}
        {:else}
          <p>No new personal notices. Your saved chapter work is available below.</p>
        {/if}
      </aside>
    </div>
  </section>

  {#if !newArrival}
    <section class="work-notice" aria-label="Your current work">
      <h2>Current work</h2>
      {#if work}
        <h3>{work.title}</h3>
        <p>{work.description}</p>
        <a class="framed-action" href={work.href}>{work.label}</a>
      {:else}
        <p>Your saved introduction is at Stage {character.tutorial.stage} of 8. No further action is available from this page at present.</p>
      {/if}
    </section>
  {/if}

  <section class="character-record" aria-labelledby="character-record-title">
    <div class="record-intro">
      <div class="record-ornament" aria-hidden="true">✦</div>
      <h2 id="character-record-title">Character details</h2>
      <div class="record-rule" aria-hidden="true"></div>
    </div>
    <div class="record-columns">
      <section class="attribute-panel" aria-label="Core attributes">
        <h3>Core Attributes</h3>
        <dl class="attribute-list">
          {#each attributes as attribute (attribute.key)}
            <div class="attribute-row">
              <dt>
                <span class="attribute-code">{attribute.key}</span>
                <strong>{attribute.name}</strong>
                <small>{attribute.description}</small>
              </dt>
              <dd aria-label={attribute.name+' '+character.attributes[attribute.key]}>
                <span>{character.attributes[attribute.key]}</span>
              </dd>
            </div>
          {/each}
        </dl>
      </section>

      <CharacterSkills majorSkillBonuses={character.majorSkillBonuses}/>
    </div>
  </section>
</div>

<style>
  .arrival-home{
    width:100%;max-width:none;min-width:0;
    padding:clamp(14px,2vw,27px);background:#1d1a17;color:#eee1cb;
    font-family:var(--pall-font-reading,Georgia,serif);
  }
  .character-arrival{
    min-height:342px;border:1px solid #796044;background-color:#201c18;
    background-size:cover;background-position:center 45%;
    box-shadow:0 9px 24px #0006;padding:clamp(17px,2vw,27px);
  }
  .arrival-layout{
    display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,440px);
    gap:clamp(20px,3vw,45px);align-items:start;
  }
  .arrival-heading{min-width:0;padding:14px 0 0;text-shadow:0 2px 7px #000b}
  .arrival-heading h1{
    margin:0 0 9px;font:600 clamp(29px,3.2vw,43px)/1.12 var(--pall-font-reading,Georgia,serif);
    color:#f6e2c6;
  }
  .arrival-subtitle{margin:0 0 19px;color:#e5c6a3;font-size:16px}
  .identity-row{display:flex;align-items:center;gap:19px;min-width:0}
  .hero-portrait{display:flex;flex:none}
  .hero-portrait :global(.portrait){
    width:116px;height:145px;border:3px solid #b59261;box-shadow:0 4px 16px #000a;
  }
  .hero-portrait :global(.portrait .initial){font-size:53px}
  .identity-copy{min-width:0}
  .identity-copy h2{
    font:600 clamp(26px,2.6vw,35px)/1.1 var(--pall-font-reading,Georgia,serif);
    margin:0 0 6px;color:#fff0d7;overflow-wrap:anywhere;
  }
  .identity-copy p{margin:3px 0;color:#ead5b9;font-size:15px}
  .health-summary{display:inline-block;margin-top:8px;color:#f1d2a8;font-weight:600;font-size:14px}

  /* Position the entire notice high in the previously empty area of the
     origin panorama. The first job is part of this very same notice. */
  .personal-notices{
    min-width:0;padding:20px clamp(16px,2vw,25px);
    border:1px solid #a77945;border-top:3px solid #d1a36b;
    background:linear-gradient(145deg,#29211dec,#1b1815e8);
    box-shadow:0 8px 29px #000b;
    text-shadow:none;
  }
  .personal-notices h2{
    margin:0 0 13px;padding-bottom:10px;border-bottom:1px solid #9a754b;
    color:#f5dab0;font:700 clamp(22px,2vw,27px)/1.15 var(--pall-font-reading,Georgia,serif);
  }
  .personal-notices h3{
    margin:0 0 9px;color:#f0d4af;
    font:600 20px/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .personal-notices p{margin:0 0 11px;font:15px/1.5 Georgia,serif;color:#e6d1b5}
  .personal-notices .notice-signoff{font-weight:700;color:#ffe1b8}
  .notice-work{margin-top:15px;padding-top:15px;border-top:1px solid #98734a}
  .notice-work h3{font-size:18px;color:#f6deb8}
  .quiet-action{
    appearance:none;background:none;color:#e8bf8a;
    border:0;border-bottom:1px solid #a47749;padding:4px 0;
    font:600 14px/1.2 var(--pall-font-reading,Georgia,serif);
    cursor:pointer;
  }
  .quiet-action:hover{color:#ffdcaa}

  .work-notice{
    margin:21px 0 24px;padding:14px 18px 20px;max-width:770px;
    border:solid transparent;border-width:27px 31px 25px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:27px 31px 25px;border-image-repeat:stretch;
    color:#2b1a10;background:transparent;box-shadow:0 7px 18px #0006;
  }
  .work-notice h2,.work-notice h3{color:#2b1a10;margin:0 0 10px}
  .work-notice h2{font:600 22px/1.2 var(--pall-font-reading,Georgia,serif)}
  .work-notice h3{font:600 26px/1.2 var(--pall-font-reading,Georgia,serif)}
  .work-notice p{font:16px/1.55 Georgia,serif;color:#453020;margin:0 0 14px}
  .framed-action{
    display:inline-flex;align-items:center;justify-content:center;
    min-height:51px;max-width:100%;
    border-style:solid;border-color:transparent;
    border-width:13px 28px 12px;border-image-width:13px 28px 12px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-repeat:stretch;
    background:transparent;color:#29190f;
    font:600 16px/1.25 var(--pall-font-reading,Georgia,serif);
    padding:2px 11px;text-align:center;text-decoration:none;text-shadow:none;
  }
  .framed-action:hover{color:#1d1009;border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .framed-action:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .framed-action:focus-visible,.quiet-action:focus-visible{outline:3px solid #e4b77d;outline-offset:3px}

  .character-record{
    margin-top:22px;border:1px solid #6f5540;background:#29231e;min-width:0;
    padding:clamp(15px,2vw,26px);
  }
  .record-intro{
    margin-bottom:19px;padding-bottom:13px;border-bottom:1px solid #665039;
  }
  .record-intro h2{
    margin:0;color:#f3dbb8;font:600 clamp(24px,2.4vw,31px)/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .record-columns{display:grid;grid-template-columns:minmax(230px,.7fr) minmax(0,1.7fr);gap:clamp(17px,2.3vw,30px)}
  .attribute-panel{min-width:0}
  .attribute-panel h3{
    margin:0 0 13px;font:600 21px/1.2 var(--pall-font-reading,Georgia,serif);color:#e9d1aa;
  }
  .attribute-list{margin:0}
  .attribute-row{
    display:flex;align-items:start;justify-content:space-between;gap:12px;
    padding:12px 11px;margin-bottom:7px;background:#352c25;border:1px solid #514031;
  }
  .attribute-row dt{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px}
  .attribute-row dt strong{font:600 16px/1.25 var(--pall-font-reading,Georgia,serif)}
  .attribute-row dt small{font:13px/1.45 Georgia,serif;color:#ccb49b}
  .attribute-row dd{margin:0;color:#f4d7a8;font:600 21px/1.1 var(--pall-font-reading,Georgia,serif)}

  @media(max-width:1120px){
    .arrival-layout{grid-template-columns:minmax(0,1fr) minmax(265px,385px)}
  }
  @media(max-width:950px){
    .record-columns{grid-template-columns:1fr}
    .attribute-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .attribute-row{margin:0}
  }
  @media(max-width:750px){
    .arrival-layout{grid-template-columns:1fr}
    .personal-notices{max-width:100%}
    .hero-portrait :global(.portrait){width:96px;height:122px}
  }
  @media(max-width:460px){
    .arrival-home{padding:10px}
    .character-arrival{padding:15px 12px}
    .identity-row{gap:11px}
    .hero-portrait :global(.portrait){width:84px;height:112px}
    .identity-copy h2{font-size:25px}
    .work-notice{border-width:23px 25px 22px;border-image-width:23px 25px 22px;padding:10px 11px 15px}
    .attribute-list{grid-template-columns:1fr}
    .personal-notices{padding:16px}
  }
</style>
