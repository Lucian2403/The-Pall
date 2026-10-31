<script lang="ts">
  import {onMount} from 'svelte';
  import CharacterAvatar from '$lib/CharacterAvatar.svelte';
  import {originVisual} from '$lib/origin-visuals';
  import {CHARACTER_SKILLS} from '$lib/character-skills';

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

  // This is only a local visual dismissal, not a fictional mail or a quest
  // mutation. Stage 1 arrival never blocks navigation and never reappears
  // on this browser after the player dismisses it.
  let showArrival=$state(false);
  const arrivalKey=$derived('pall-arrival-dismissed-'+character.id);
  onMount(()=>{
    try{showArrival=newArrival&&localStorage.getItem(arrivalKey)!=='1';}
    catch{showArrival=newArrival;}
  });
  function dismissArrival(){
    showArrival=false;
    try{localStorage.setItem(arrivalKey,'1');}catch{/* Private mode: nonblocking. */}
  }

  const attributes=[
    {key:'STR',name:'Strength'},
    {key:'DEX',name:'Dexterity'},
    {key:'INT',name:'Intellect'},
    {key:'RES',name:'Resolve'}
  ] as const;
</script>

<div class="arrival-home">
  <section class="character-arrival" aria-label="Your character"
    style={'background-image:linear-gradient(90deg,#17130feb 0%,#17130fba 42%,#17130f45 80%),linear-gradient(0deg,#17130fcc,transparent 65%),url("'+artwork.src+'")'}>
    <div class="arrival-heading">
      <p class="kicker">GRAND CYLINDER CITY · {character.origin.toUpperCase()}</p>
      <h1>{newArrival?'Another day within the walls.':'Your life within the walls.'}</h1>
      <p class="arrival-subtitle">{artwork.name} · Introduction, Stage {character.tutorial.stage} of 8</p>
      <div class="identity-row">
        <div class="hero-portrait"><CharacterAvatar name={character.name} avatarId={character.avatarId??null}/></div>
        <div class="identity-copy">
          <span class="kicker">YOUR CHARACTER</span>
          <h2>{character.name}</h2>
          <p>{character.sex} · {character.origin}</p>
          <p>{character.startingLocation}</p>
          <span class="health-summary">Health {character.health.current} / {character.health.maximum} · {character.coins} coins</span>
        </div>
      </div>
    </div>
  </section>

  <div class="arrival-top">
    <section class="work-notice" aria-label="Your next action">
      <p class="kicker">YOUR CURRENT WORK</p>
      {#if work}
        <h2>{work.title}</h2>
        <p>{work.description}</p>
        <a class="framed-action" href={work.href}>{work.label}</a>
      {:else}
        <h2>Current chapter</h2>
        <p>Your saved introduction is at Stage {character.tutorial.stage} of 8. No further action is available from this page at present.</p>
      {/if}
    </section>

    <section class="personal-notices" aria-label="Personal notices">
      <p class="kicker">PERSONAL NOTICES</p>
      {#if showArrival}
        <h2>Another shift begins.</h2>
        {#if character.origin==='Millhand'}
          <p>The workshops are already awake. Smoke rises between the roofs, and beyond the crowded streets the Grand Cylinder continues its endless work.</p>
          <p>At Guther Anvil's workshop, a new council plate lot awaits.</p>
        {:else}
          <p>The city is already awake. Your first task begins at {character.startingLocation}.</p>
        {/if}
        <p class="notice-signoff">You've a living to make.</p>
        <button class="quiet-action" type="button" onclick={dismissArrival}>Dismiss notice</button>
      {:else}
        <h2>Your journal</h2>
        <p>No additional personal notices are available here. Your current work is shown alongside this panel.</p>
      {/if}
    </section>
  </div>

  <section class="character-record" aria-labelledby="character-record-title">
    <div class="record-intro">
      <div>
        <p class="kicker">YOUR RECORD</p>
        <h2 id="character-record-title">Character details</h2>
      </div>
      <p>The attributes and skill disciplines of your chosen character.</p>
    </div>
    <div class="record-columns">
      <section class="attribute-panel" aria-label="Core attributes and equipment">
        <h3>Core Attributes</h3>
        <dl class="attribute-list">
          {#each attributes as attribute (attribute.key)}
            <div class="attribute-row">
              <dt><strong>{attribute.name}</strong><small>{attribute.key}</small></dt>
              <dd>{character.attributes[attribute.key]}</dd>
            </div>
          {/each}
        </dl>
        <div class="starting-kit">
          <h3>Starting equipment</h3>
          <p>{character.starterItemRequirements.map(item=>item.name+' × '+item.quantity).join(' · ')}</p>
        </div>
      </section>

      <section class="skill-panel" aria-label="All major skills and specializations">
        <div class="skills-heading">
          <h3>Skills & Specializations</h3>
          <span>8 MAJOR SKILLS</span>
        </div>
        <p class="skill-explanation">All agreed disciplines are listed below. A + value indicates recorded Major Skill grants; complete skill levels and specialization ranks are not yet tracked here.</p>
        <div class="skills-grid">
          {#each CHARACTER_SKILLS as group (group.major)}
            <section class="skill-card">
              <div class="skill-title">
                <h4>{group.major}</h4>
                {#if (character.majorSkillBonuses[group.major]??0)>0}
                  <span class="recorded-bonus">+{character.majorSkillBonuses[group.major]} recorded</span>
                {/if}
              </div>
              <p>{group.subskills.join(' · ')}</p>
            </section>
          {/each}
        </div>
      </section>
    </div>
  </section>
</div>

<style>
  .arrival-home{
    width:100%;max-width:none;min-width:0;
    padding:clamp(14px,2vw,27px);background:#1d1a17;color:#eee1cb;
    font-family:var(--pall-font-reading,Georgia,serif);
  }
  .kicker{
    margin:0 0 9px;font:600 13px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.11em;color:#d1a677;
  }
  .character-arrival{
    display:flex;align-items:flex-end;min-height:315px;
    padding:clamp(20px,3vw,38px);
    border:1px solid #796044;background-color:#201c18;
    background-size:cover;background-position:center 45%;
    box-shadow:0 9px 24px #0006;
  }
  .arrival-heading{width:100%;max-width:840px;text-shadow:0 2px 7px #000b}
  .arrival-heading h1{
    margin:0 0 9px;font:600 clamp(29px,3.2vw,43px)/1.12 var(--pall-font-reading,Georgia,serif);
    color:#f6e2c6;
  }
  .arrival-subtitle{margin:0 0 19px;color:#e5c6a3;font-size:16px}
  .identity-row{display:flex;align-items:center;gap:19px;min-width:0}
  .hero-portrait{display:flex;flex:none}
  .hero-portrait :global(.portrait){
    width:116px;height:145px;border:3px solid #b59261;
    box-shadow:0 4px 16px #000a;
  }
  .hero-portrait :global(.portrait .initial){font-size:53px}
  .identity-copy{min-width:0}
  .identity-copy .kicker{margin-bottom:3px}
  .identity-copy h2{
    font:600 clamp(26px,2.6vw,35px)/1.1 var(--pall-font-reading,Georgia,serif);
    margin:0 0 6px;color:#fff0d7;overflow-wrap:anywhere;
  }
  .identity-copy p{margin:3px 0;color:#ead5b9;font-size:15px}
  .health-summary{
    display:inline-block;margin-top:8px;padding:5px 0;
    color:#f1d2a8;font-weight:600;font-size:14px;
  }

  .arrival-top{
    display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
    align-items:start;gap:clamp(13px,2vw,22px);margin:20px 0 24px;
  }
  .work-notice{
    min-width:0;padding:18px 21px 22px;
    border:solid transparent;border-width:27px 31px 25px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:27px 31px 25px;border-image-repeat:stretch;
    color:#2b1a10;background:transparent;box-shadow:0 7px 18px #0006;
  }
  .work-notice .kicker{color:#694326}
  .work-notice h2{
    font:600 clamp(23px,2.2vw,31px)/1.2 var(--pall-font-reading,Georgia,serif);
    margin:0 0 10px;color:#2b1a10;
  }
  .work-notice p:not(.kicker){font:400 16px/1.55 Georgia,serif;color:#453020;margin:0 0 14px}
  .framed-action{
    display:inline-flex;align-items:center;justify-content:center;
    min-height:51px;max-width:100%;
    border-style:solid;border-color:transparent;
    border-width:13px 28px 12px;border-image-width:13px 28px 12px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-repeat:stretch;
    background:transparent;color:#29190f;
    font:600 16px/1.25 var(--pall-font-reading,Georgia,serif);
    padding:2px 11px;text-align:center;text-decoration:none;
  }
  .framed-action:hover{
    color:#1d1009;border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
  }
  .framed-action:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .framed-action:focus-visible,.quiet-action:focus-visible{outline:3px solid #e4b77d;outline-offset:3px}
  .personal-notices{
    min-width:0;padding:20px clamp(16px,2vw,25px);
    border:1px solid #705338;border-left:3px solid #a97a49;
    background:linear-gradient(145deg,#332820,#24201c 75%);
    box-shadow:0 7px 18px #0005;
  }
  .personal-notices h2{
    font:600 23px/1.2 var(--pall-font-reading,Georgia,serif);
    margin:0 0 11px;color:#f0d4af;
  }
  .personal-notices p:not(.kicker){margin:0 0 12px;font:15px/1.55 Georgia,serif;color:#dfcbb1}
  .personal-notices .notice-signoff{font-weight:700!important;color:#f2d6ae!important}
  .quiet-action{
    appearance:none;background:none;color:#e8bf8a;
    border:0;border-bottom:1px solid #a47749;padding:4px 0;
    font:600 14px/1.2 var(--pall-font-reading,Georgia,serif);
    cursor:pointer;
  }
  .quiet-action:hover{color:#ffdcaa}

  .character-record{
    border:1px solid #6f5540;background:#29231e;min-width:0;
    padding:clamp(15px,2vw,26px);
  }
  .record-intro{
    display:flex;align-items:end;justify-content:space-between;
    flex-wrap:wrap;gap:10px;margin-bottom:19px;padding-bottom:13px;
    border-bottom:1px solid #665039;
  }
  .record-intro h2{
    margin:0;color:#f3dbb8;font:600 clamp(24px,2.4vw,31px)/1.2 var(--pall-font-reading,Georgia,serif);
  }
  .record-intro .kicker{margin-bottom:4px}
  .record-intro>p{margin:0;color:#cbb69c;font-size:14px}
  .record-columns{
    display:grid;grid-template-columns:minmax(220px,.7fr) minmax(0,1.7fr);
    gap:clamp(20px,2.3vw,30px);
  }
  .attribute-panel,.skill-panel{min-width:0}
  .attribute-panel h3,.skill-panel h3{
    margin:0 0 13px;font:600 21px/1.2 var(--pall-font-reading,Georgia,serif);
    color:#e9d1aa;
  }
  .attribute-list{margin:0}
  .attribute-row{
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    padding:12px 11px;margin-bottom:5px;background:#352c25;border:1px solid #514031;
  }
  .attribute-row dt{display:flex;flex-direction:column;gap:2px}
  .attribute-row dt strong{font:600 16px/1.25 var(--pall-font-reading,Georgia,serif)}
  .attribute-row dt small{font:12px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);color:#bb9b74}
  .attribute-row dd{margin:0;color:#f4d7a8;font:600 21px/1.1 var(--pall-font-reading,Georgia,serif)}
  .starting-kit{margin-top:21px;padding-top:16px;border-top:1px solid #655039}
  .starting-kit p{color:#e0cbb0;line-height:1.55;margin:0;font-size:15px}
  .skills-heading{display:flex;gap:10px;align-items:baseline;justify-content:space-between}
  .skills-heading span{
    flex:none;color:#b99a76;
    font:13px var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.07em;
  }
  .skill-explanation{margin:0 0 13px;color:#cdbba5;font:14px/1.55 Georgia,serif}
  .skills-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .skill-card{
    min-width:0;border:1px solid #574637;background:#352c25;
    padding:12px 13px;
  }
  .skill-title{display:flex;align-items:baseline;flex-wrap:wrap;justify-content:space-between;gap:5px}
  .skill-card h4{
    margin:0;color:#efd5af;
    font:600 18px/1.25 var(--pall-font-reading,Georgia,serif);
  }
  .recorded-bonus{color:#e8bc78;font:600 13px/1.2 Georgia,serif}
  .skill-card p{margin:8px 0 0;color:#cbb8a0;font:14px/1.5 Georgia,serif}

  @media(max-width:950px){
    .record-columns{grid-template-columns:1fr}
    .attribute-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
    .attribute-row{margin:0}
  }
  @media(max-width:700px){
    .arrival-top{grid-template-columns:1fr}
    .character-arrival{min-height:285px;background-position:center}
    .hero-portrait :global(.portrait){width:96px;height:122px}
    .skills-grid{grid-template-columns:1fr}
  }
  @media(max-width:460px){
    .arrival-home{padding:10px}
    .character-arrival{padding:17px 14px;min-height:315px}
    .identity-row{gap:11px}
    .hero-portrait :global(.portrait){width:84px;height:112px}
    .identity-copy h2{font-size:25px}
    .work-notice{border-width:23px 25px 22px;border-image-width:23px 25px 22px;padding:10px 11px 15px}
    .attribute-list{grid-template-columns:1fr}
    .personal-notices{padding:16px}
  }
</style>
