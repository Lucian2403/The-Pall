<script lang="ts">
  import {onMount} from 'svelte';
  import CharacterAvatar from '$lib/CharacterAvatar.svelte';
  import {originVisual} from '$lib/origin-visuals';
  import CharacterSkills from '$lib/CharacterSkills.svelte';

  type SavedCharacter = {
    id:string; name:string; sex:string; origin:string; avatarId?:string|null;
    attributes:{STR:number;DEX:number;INT:number;RES:number};
    health:{current:number;maximum:number}; coins:number;
    stamina?:{current:number;maximum:number};
    fatigue?:{current:number;maximum:number};
    focus?:{current:number;maximum:number};
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
        ?'Report to Guther Anvil at the bench to begin your first shift.'
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

  // Match TutorialShell's measurements: untracked resources are not guessed.
  type Measured={current:number;maximum:number};
  function isMeasured(value:Measured|undefined):value is Measured{
    return !!value && Number.isFinite(value.current) &&
      Number.isFinite(value.maximum) && value.maximum>0 && value.current>=0;
  }
  function formatted(value:Measured|undefined){
    return isMeasured(value)?value.current+' / '+value.maximum:'—';
  }
  const resources=$derived([
    {id:'health',label:'Health',value:formatted(character.health),known:isMeasured(character.health)},
    {id:'stamina',label:'Stamina',value:formatted(character.stamina),known:isMeasured(character.stamina)},
    {id:'fatigue',label:'Fatigue',value:formatted(character.fatigue),known:isMeasured(character.fatigue)},
    {id:'focus',label:'Focus',value:formatted(character.focus),known:isMeasured(character.focus)},
    {id:'coins',label:'Coins',value:String(character.coins),known:true},
    {id:'stage',label:'Onboarding',value:character.tutorial.stage+' / 8',known:true}
  ]);

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
    style={'background-image:linear-gradient(270deg,#120e0bdd 0%,#120e0b77 28%,transparent 55%),linear-gradient(90deg,#17130feb 0%,#17130fba 42%,#17130f45 80%),linear-gradient(0deg,#17130fcc,transparent 65%),url("'+artwork.src+'")'}>
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
          </div>
        </div>
        <ul class="resource-grid" aria-label="Character condition and progression">
          {#each resources as resource (resource.id)}
            <li class:untracked={!resource.known} class="resource-item"
              title={resource.known?resource.label:'Not tracked yet'}>
              <img src={'/ui-kit/icons/character-'+resource.id+'.svg'} alt="" aria-hidden="true"
                width="32" height="32"/>
              <span class="resource-details">
                <span class="resource-label">{resource.label}</span>
                <strong class="resource-value">{resource.value}</strong>
              </span>
            </li>
          {/each}
        </ul>
      </div>

      <aside class="personal-notices" aria-label="Personal notices">
        <h2>Personal notices</h2>
        {#if newArrival}
          {#if showArrival}
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
            <section class="notice-work work-order" aria-label="Current work order">
              <div class="work-order-head">
                <span class="work-order-kicker">Current work order</span>
                <span class="work-order-stage">Stage I</span>
              </div>
              <h3>{work.title}</h3>
              <p>{work.description}</p>
              <a class="framed-action work-order-action" href={work.href}>{work.label}</a>
            </section>
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

      <CharacterSkills majorSkillBonuses={character.majorSkillBonuses} origin={character.origin}/>
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
    display:grid;
    grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);
    gap:clamp(20px,2vw,33px);align-items:start;
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
  .resource-grid{
    list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
    gap:8px;margin:21px 0 0;padding:0;max-width:720px;text-shadow:none;
  }
  .resource-item{
    min-width:0;display:flex;align-items:center;gap:8px;
    padding:8px 9px;background:#18140ed4;border:1px solid #94704699;
    box-shadow:0 2px 7px #09070466;
  }
  .resource-item img{display:block;width:32px;height:32px;flex:none}
  .resource-details{display:flex;flex-direction:column;min-width:0;gap:3px}
  .resource-label{
    color:#ddbd8c;font:600 13px/1.1 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.035em;
  }
  .resource-value{
    color:#f8e5c8;font:700 15px/1.2 var(--pall-font-reading,Georgia,serif);
    white-space:nowrap;font-variant-numeric:tabular-nums;
  }
  .resource-item.untracked .resource-value{color:#c5b7a2}
  .resource-item.untracked{border-color:#75634f70}

  /* Position the entire notice high in the previously empty area of the
     origin panorama. The first job is part of this very same notice. */
  .personal-notices{
    min-width:0;width:100%;box-sizing:border-box;
    padding:16px clamp(8px,1.5vw,22px) 16px 12px;
    border:0;border-radius:0;background:none;box-shadow:none;
    text-shadow:0 2px 5px #090604,0 0 11px #090604b8;
    color:#fff0d9;
  }
  .personal-notices h2{
    margin:0 0 13px;padding-bottom:9px;
    border-bottom:1px solid #d4a36b9c;
    color:#ffe3b8;
    font:700 clamp(25px,2.5vw,34px)/1.13 var(--pall-font-reading,Georgia,serif);
  }
  .personal-notices h3{
    margin:0 0 9px;color:#f0d4af;
    font:600 20px/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .personal-notices p{
    margin:0 0 11px;max-width:84ch;
    font:500 clamp(16px,1vw,18px)/1.53 var(--pall-font-reading,Georgia,serif);
    color:#f1dec6;
  }
  .personal-notices .notice-signoff{font-weight:700;color:#ffe1b8}
  /* A single parchment work order is the most prominent action on first
     arrival. Keep it within Personal notices, not in a competing section. */
  .notice-work{
    box-sizing:border-box;
    width:100%;
    margin-top:16px;
  }
  .work-order{
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    gap:10px;
    min-width:0;
    padding:15px clamp(13px,2vw,23px) 19px;
    border:solid transparent;
    border-width:26px 30px 24px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:26px 30px 24px;
    border-image-repeat:stretch;
    background:transparent;
    color:#2a190f;
    text-shadow:none;
    box-shadow:0 8px 22px #0008;
  }
  .work-order-head{
    display:flex;
    align-items:baseline;
    justify-content:space-between;
    align-self:stretch;
    gap:12px;
    border-bottom:1px solid #ac855d;
    padding-bottom:9px;
  }
  .personal-notices .work-order-kicker,
  .work-order-stage{
    color:#79502c;
    font:600 14px/1.15 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.11em;
    text-transform:uppercase;
  }
  .work-order-stage{white-space:nowrap}
  .personal-notices .work-order h3{
    margin:2px 0 0;
    color:#2b190d;
    font:700 clamp(25px,2.3vw,30px)/1.1 var(--pall-font-reading,Georgia,serif);
    text-shadow:none;
  }
  .personal-notices .work-order p{
    margin:0 0 4px;
    max-width:65ch;
    color:#3f2918;
    font:500 clamp(16px,1vw,18px)/1.45 var(--pall-font-reading,Georgia,serif);
    text-shadow:none;
  }
  .work-order-action{
    min-width:min(100%,280px);
    min-height:64px;
    margin-top:5px;
    padding:5px 18px;
    font-size:18px;
    text-shadow:none;
  }
  .work-order-action:hover{filter:brightness(1.035)}
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
  .work-notice p{font:16px/1.55 var(--pall-font-reading,Georgia,serif);color:#453020;margin:0 0 14px}
  .framed-action{
    display:inline-flex;align-items:center;justify-content:center;
    min-height:60px;max-width:100%;
    border-style:solid;border-color:transparent;
    border-width:15px 32px 14px;border-image-width:15px 32px 14px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-repeat:stretch;
    background:transparent;color:#29190f;
    font:600 17px/1.25 var(--pall-font-reading,Georgia,serif);
    padding:4px 13px;text-align:center;text-decoration:none;text-shadow:none;
  }
  .framed-action:hover{color:#1d1009;border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .framed-action:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .framed-action:focus-visible,.quiet-action:focus-visible{outline:3px solid #e4b77d;outline-offset:3px}

  .character-record{
    position:relative;margin-top:22px;min-width:0;
    border:1px solid #785b3b;
    background:
      linear-gradient(135deg,#30261d 0%,#292019 58%,#241d18 100%);
    box-shadow:inset 0 0 0 4px #1b15115e,0 9px 25px #0006;
    padding:clamp(21px,2.3vw,34px);
  }
  .character-record::before,.character-record::after{
    content:'';position:absolute;width:19px;height:19px;
    border:solid #b48a57;pointer-events:none;
  }
  .character-record::before{top:7px;left:7px;border-width:1px 0 0 1px}
  .character-record::after{bottom:7px;right:7px;border-width:0 1px 1px 0}
  .record-intro{
    display:flex;align-items:center;gap:13px;
    margin-bottom:24px;padding-bottom:14px;
    border-bottom:1px solid #9d764a;
  }
  .record-ornament{color:#c5a06a;font-size:19px;line-height:1}
  .record-rule{height:1px;flex:1;background:linear-gradient(90deg,#9d764a,transparent)}
  .record-intro h2{
    margin:0;color:#f3dbb8;font:600 clamp(24px,2.4vw,31px)/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .record-columns{display:grid;grid-template-columns:minmax(230px,.7fr) minmax(0,1.7fr);gap:clamp(17px,2.3vw,30px)}
  .attribute-panel{min-width:0;padding-right:clamp(0px,1vw,12px)}
  .attribute-panel h3{
    margin:0 0 13px;font:600 21px/1.2 var(--pall-font-reading,Georgia,serif);color:#e9d1aa;
  }
  .attribute-list{margin:0}
  .attribute-row{
    display:flex;align-items:center;justify-content:space-between;gap:13px;
    padding:12px 12px 12px 17px;margin-bottom:8px;
    background:linear-gradient(110deg,#f1dfc2,#e3c79d);
    border:1px solid #a27c51;color:#382517;
    box-shadow:inset 3px 0 #a47c4d,0 2px 6px #0003;
  }
  .attribute-row dt{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px}
  .attribute-code{
    color:#795331;font:600 12px/1.1 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.11em;
  }
  .attribute-row dt strong{font:700 18px/1.15 var(--pall-font-reading,Georgia,serif);color:#2d1b0e}
  .attribute-row dt small{
    font:700 15px/1.5 var(--pall-font-reading,Georgia,serif);
    font-synthesis:weight;color:#24160d;text-shadow:none;
    opacity:1;letter-spacing:0;
  }
  .attribute-row dd{
    margin:0;flex:none;display:grid;place-items:center;
    min-width:47px;min-height:47px;padding:5px;
    border:2px solid #8a613b;border-radius:50%;
    background:#3b2a1c;color:#f1d9aa;
    box-shadow:inset 0 0 0 2px #d8b88330;
    font:700 22px/1.1 var(--pall-font-reading,Georgia,serif);
  }

  @media(max-width:1250px){
    .arrival-layout{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)}
    .resource-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  }
  @media(max-width:950px){
    .record-columns{grid-template-columns:1fr}
    .attribute-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
    .attribute-row{margin:0}
  }
  @media(max-width:900px){
    .arrival-layout{grid-template-columns:1fr}
    .personal-notices{max-width:100%}
    .resource-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
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
    .personal-notices{padding:14px 4px}
    .work-order{
      border-width:23px 24px 21px;
      border-image-width:23px 24px 21px;
      padding:10px 9px 14px;
    }
    .work-order-action{min-width:100%;font-size:16px}
    .attribute-row{padding:10px;gap:8px}
    .resource-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
    .resource-item{padding:7px 6px;gap:6px}
    .resource-item img{width:27px;height:27px}
  }
</style>
