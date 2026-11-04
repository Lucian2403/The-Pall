<script lang="ts">
  import {getContext} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {onMount,tick} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import {
    clinicianAssessment,clinicianDischarge,clinicianFatigue
  } from '$lib/millhand-clinic-dialogue';

  type Wound={type:string;zone?:string;severity:string};
  type Condition={
    hp:number;hpMax:number;stamina:number;composure:number;
    fatigue:number;stress:number;momentum:number;bleed:number;wounds:Wound[];
  };
  type Phase='ARRIVAL'|'EXAMINED'|'SPOKEN'|'PRICED'|'PAID'|'LEFT';
  type Action='examine'|'speak'|'review_price'|'pay'|'leave';
  type PricedBeat=
    |{kind:'narration';text:string}
    |{kind:'speech';speaker:'YOU'|'CLINICIAN';text:string};
  const PRICED_DIALOGUE_BEATS:readonly PricedBeat[]=[
    {kind:'narration',text:'The clinician looks you over, then pulls a chair closer.'},
    {kind:'speech',speaker:'YOU',text:"How much is this gonna cost me?"},
    {kind:'speech',speaker:'CLINICIAN',text:'Ten coins.'},
    {kind:'speech',speaker:'YOU',text:'Ten? Just for having a look?'},
    {kind:'speech',speaker:'CLINICIAN',text:'For the examination and whatever treatment you need.'},
    {kind:'speech',speaker:'YOU',text:"Bloody hell. That's half the money I've got left."},
    {kind:'speech',speaker:'CLINICIAN',text:"Well, you can barely stand straight. I'd say you need looking at."},
    {kind:'narration',text:'You glance down at yourself, then back at the clinician.'},
    {kind:'speech',speaker:'YOU',text:'Yeah... alright. Just get on with it.'}
  ];
  type Clinic={
    stage:7;revision:number;phase:Phase;
    outcome:'player_victory'|'player_defeat';before:Condition;after:Condition|null;
    conditionType:'unhurt'|'cut'|'other';
    fee:number;coins:number;paid:boolean;completed:boolean;nextStage:number|null;
  };
  type Character={
    id:string;name:string;origin:string;sex:string;avatarId?:string|null;
    coins:number;health:{current:number;maximum:number};startingLocation:string;
    tutorial:{stage:number;status:string};
  };
  let character=$state<Character|null>(null);
  let clinic=$state<Clinic|null>(null);
  let status=$state<'loading'|'ready'|'login'|'missing'|'prerequisite'|'schema'|'error'>('loading');
  let pending=$state(false);
  let errorMessage=$state('');
  let retryId:string|null=null;
  let retrySignature:string|null=null;
  const id=$derived(page.params.id);
  const route=$derived('/api/characters/'+encodeURIComponent(id)+'/millhand/clinic');
  const next=$derived(clinic?.phase==='ARRIVAL'?'examine'
    :clinic?.phase==='EXAMINED'?'speak'
    :clinic?.phase==='SPOKEN'?'review_price'
    :clinic?.phase==='PRICED'?'pay'
    :clinic?.phase==='PAID'?'leave':null);
  const label=$derived(next==='examine'?'Examine condition'
    :next==='speak'?'Speak to clinician'
    :next==='review_price'?'Review the price'
    :next==='pay'?'Pay 10 coins'
    :next==='leave'?'Leave the clinic':'');
  let pricedDialogueIndex=$state(0);
  const pricedBeat=$derived(PRICED_DIALOGUE_BEATS[pricedDialogueIndex]!);
  const pricedAtEnd=$derived(pricedDialogueIndex===PRICED_DIALOGUE_BEATS.length-1);
  $effect(()=>{
    // The spoken price exchange is purely local; a new clinic visit begins at its first line.
    if(clinic?.phase!=='PRICED')pricedDialogueIndex=0;
  });
  function advancePricedDialogue(){
    if(pending||clinic?.phase!=='PRICED'||pricedAtEnd)return;
    pricedDialogueIndex+=1;
  }
  let journalOpen=$state(false);
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{

    registerSceneJournal?.({id:'clinic-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });
  let journalElement:HTMLElement|undefined;
  const assessment=$derived(clinic
    ?clinicianAssessment(clinic.before,clinic.conditionType):'');
  const fatigueNote=$derived(clinic?clinicianFatigue(clinic.before):null);
  const departure=$derived(clinic?clinicianDischarge(clinic.conditionType):'');
  const journal=$derived(clinic?.paid
    ?clinic?.conditionType==='unhurt'
      ?"They couldn't find anything wrong with me. Good. Still cost ten coins just to be examined. Half my money gone, and I haven't earned a thing today."
      :clinic?.conditionType==='cut'
        ?"The clinician checked me over and treated what they could. Ten coins for the examination and care. I needed the help, but that's half my money gone. Still nothing paid for the council work."
        :"The clinician examined what the fight had done to me. Ten coins for the examination and getting me fit to leave. Half my money gone, and still nothing earned from the council."
    :"Made it to the clinic after the fight with Flint. I've not got much money left, but I ought to get checked.");

  async function toggleJournal(){
    journalOpen=!journalOpen;
    await tick();
    if(journalOpen)journalElement?.scrollIntoView({block:'start',behavior:'smooth'});
  }

  async function start(){
    const response=await fetch(route,{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({kind:'start',requestId:crypto.randomUUID()})});
    if(!response.ok)throw Error('clinic_start_failed_'+response.status);
    clinic=await response.json() as Clinic;
  }
  async function refresh(){
    status='loading';errorMessage='';
    try{
      const [person,visit]=await Promise.all([
        fetch('/api/characters/'+encodeURIComponent(id),{cache:'no-store'}),
        fetch(route,{cache:'no-store'})
      ]);
      if(person.status===401||visit.status===401){status='login';return;}
      if(person.status===404||visit.status===404){status='missing';return;}
      if(visit.status===503){status='schema';return;}
      if(visit.status===409){status='prerequisite';return;}
      if(!person.ok||!visit.ok)throw Error('clinic_fetch_failed');
      character=(await person.json() as {character:Character}).character;
      const result=await visit.json() as Clinic|{needsStart:true};
      if('needsStart' in result)await start();
      else clinic=result;
      // Starting the clinic already advances the saved character to Stage 7.
      // Keep the mounted shell in sync so its dev-only Back to Stage 6
      // control appears immediately, not only after a full page reload.
      if(clinic&&character)
        character={...character,tutorial:clinic.phase==='LEFT'
          ?{stage:8,status:'NOT_STARTED'}
          :{stage:7,status:'IN_PROGRESS'}};
      status='ready';
    }catch(error){
      status='error';
      errorMessage=error instanceof Error?error.message:'Clinic record unavailable';
    }
  }
  onMount(()=>{void refresh();});
  async function perform(action:Action){
    if(pending||!clinic||next!==action||(action==='pay'&&!pricedAtEnd))return;
    pending=true;errorMessage='';
    const signature=clinic.revision+':'+action;
    if(signature!==retrySignature||!retryId){
      retrySignature=signature;retryId=crypto.randomUUID();
    }
    try{
      const response=await fetch(route,{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({
          kind:'action',requestId:retryId,expectedRevision:clinic.revision,action
        })
      });
      const result=await response.json() as Clinic&{error?:string};
      if(response.ok){
        clinic=result;retryId=null;retrySignature=null;
        if(character){
          character={...character,coins:result.coins,
            health:{...character.health,current:result.after?.hp??character.health.current},
            tutorial:{
              stage:result.phase==='LEFT'?8:7,
              status:result.phase==='LEFT'?'NOT_STARTED':'IN_PROGRESS'
            }
          };
        }
      }else{
        if(response.status===409){
          retryId=null;retrySignature=null;
          const current=await fetch(route,{cache:'no-store'});
          if(current.ok)clinic=await current.json() as Clinic;
        }
        errorMessage=result.error==='stale_revision'
          ?'The clinic was updated in another tab. The saved examination has been reloaded.'
          :result.error==='insufficient_coins'?'There are not enough coins for the examination.'
          :result.error==='wrong_clinic_phase'?'Complete the examination in the proper order.'
          :'The clinic action was not saved: '+(result.error??response.status);
      }
    }catch{
      errorMessage='Connection interrupted. Retry the same action; the fee cannot be charged twice.';
    }finally{pending=false;}
  }
</script>

<svelte:head><title>The Pall — The Clinic</title></svelte:head>
{#if status==='ready' && character && clinic}
  <TutorialShell {character} sceneLocation="City clinic" sceneStage={7}
    combatStamina={{current:clinic.after?.stamina??clinic.before.stamina,maximum:100}}>
    <section class="clinic" aria-label="Stage 7 clinic">
      <div class="clinic-scene" aria-label="Grand Cylinder City clinic interior">
        <aside class="clinic-dialogue" aria-label="Conversation with the clinician">
          <p class="eyebrow">THE CLINIC · STAGE VII</p>
          <h1>The Clinic</h1>

          {#if clinic.phase==='ARRIVAL'}
            <p class="narration">{clinic.outcome==='player_defeat'
              ?'Another worker helps you reach the clinic after Flint defeats you.'
              :'You leave the passage and reach the clinic after Flint withdraws.'}</p>
            <p class="narration">There is a place to sit. A clinician is available to examine you.</p>
            <p class="instruction">Check your condition before speaking to the clinician.</p>
          {:else if clinic.phase==='EXAMINED'}
            <p class="narration">You sit on the edge of a bed and check yourself after the fight.</p>
            <p class="narration">The clinician waits for you to speak.</p>
          {:else if clinic.phase==='SPOKEN'}
            <p class="speaker">CLINICIAN</p>
            <p class="speech">“Sit. Let me see.”</p>
            <p class="speaker">CLINICIAN</p>
            <p class="speech">“{assessment}”</p>
            {#if fatigueNote}
              <p class="speech">“{fatigueNote}”</p>
            {/if}
            <p class="instruction">Find out what the examination will cost.</p>
          {:else if clinic.phase==='PRICED'}
            {#if pricedBeat.kind==='narration'}
              <p class="narration stage-direction">{pricedBeat.text}</p>
            {:else}
              <p class="speaker">{pricedBeat.speaker}</p>
              <p class="speech">“{pricedBeat.text}”</p>
            {/if}
            {#if pricedAtEnd}
              <div class="price" aria-label="Price before payment">
                <span>Examination and basic care if necessary</span>
                <strong>{clinic.fee} coins</strong>
                <span>Coins in hand</span>
                <strong>{clinic.coins}</strong>
              </div>
            {/if}
          {:else if clinic.phase==='PAID'}
            <p class="narration">You pay ten coins. The examination and any necessary care are complete.</p>
            <p class="speaker">CLINICIAN</p>
            <p class="speech">“{departure}”</p>
            <p class="receipt">Coins remaining: {clinic.coins}. No further fee is due.</p>
          {:else if clinic.phase==='LEFT'}
            <p class="narration">You leave the clinic and head toward your rented home.</p>
            <p class="receipt">Coins remaining: {clinic.coins}.</p>
            <p class="next-note">Return Home is the next chapter. Its playable scene is not yet connected.</p>
          {/if}

          {#if next}
            <div class="actions">
              {#if clinic.phase==='PRICED' && !pricedAtEnd}
                <button class="pall-framed-button advance" type="button"
                  disabled={pending} onclick={advancePricedDialogue}>Continue</button>
              {:else}
                <button class="pall-framed-button advance" type="button" disabled={pending}
                  onclick={()=>{if(next)void perform(next);}}>
                  {pending?'Saving…':label}
                </button>
              {/if}
            </div>
          {/if}
          {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}

          <details class="medical-record">
            <summary>Review examination record</summary>
            <p>Health after the fight: {clinic.before.hp} / {clinic.before.hpMax}</p>
            {#if clinic.before.wounds.length}
              <ul>
                {#each clinic.before.wounds as wound,i (i)}
                  <li>{wound.type}{wound.zone?' · '+wound.zone:''} · {wound.severity}</li>
                {/each}
              </ul>
            {:else}
              <p>No recorded wounds.</p>
            {/if}
            {#if clinic.before.bleed>0}<p>Bleeding recorded: {clinic.before.bleed}</p>{/if}
            <p>Stamina {clinic.before.stamina} · Fatigue {clinic.before.fatigue}
              · Composure {clinic.before.composure}</p>
            {#if clinic.after}
              <p>After care: Health {clinic.after.hp} / {clinic.after.hpMax},
                Stamina {clinic.after.stamina}, no active combat wounds.</p>
            {/if}
          </details>

        </aside>
      </div>

      {#if journalOpen}
        <section id="clinic-journal" class="journal" bind:this={journalElement}
          aria-label="Personal Journal">
          <header class="journal-head">
            <div><small>PERSONAL JOURNAL</small><h2>The Clinic</h2></div>
            <button type="button" class="journal-button" data-pall-sfx="paper"
              onclick={()=>{void toggleJournal();}}>Close journal</button>
          </header>
          <div class="journal-entries">
            <p>{journal}</p>
            {#if clinic.phase==='LEFT'}<p>I've got ten coins left. Time to head home.</p>{/if}
          </div>
        </section>
      {/if}
    </section>
  </TutorialShell>
{:else}
  <main class="fallback">
    {#if status==='loading'}<p role="status">Loading the clinic…</p>
    {:else if status==='login'}<h1>Sign in required</h1><p><a href="/account">Account</a></p>
    {:else if status==='missing'}<h1>Character not found</h1>
    {:else if status==='prerequisite'}
      <h1>Clinic not yet available</h1>
      <p>The fight with Flint must finish before the clinic examination.</p>
      <a href={'/characters/'+encodeURIComponent(id)+'/millhand/combat'}>Return to the encounter</a>
    {:else if status==='schema'}
      <h1>Clinic persistence is not installed</h1>
      <p>Run <code>npm run clinic:migrate</code> from the platform folder.</p>
    {:else}
      <h1>Clinic service unavailable</h1><p role="alert">{errorMessage}</p>
      <button class="pall-framed-button" type="button" onclick={refresh}>Retry</button>
    {/if}
  </main>
{/if}

<style>
  :global(body){margin:0;background:#151717;color:#eadfcf;font-family:Georgia,serif}
  .clinic{display:block;min-width:0;color:#2b1c11;
    font-family:var(--pall-font-reading,Georgia,serif)}
  /* The scene fills the chapter surface, as in Stages 3–5. Dialogue is
     overlaid on the original, fully visible illustration. */
  .clinic-scene{position:relative;isolation:isolate;box-sizing:border-box;
    width:100%;height:clamp(650px,65vw,820px);overflow:hidden;
    background:#20212a url('/locations/clinic/clinic-workshop-cold.webp')
      center center/cover no-repeat}
  .clinic-scene::before{content:'';position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(90deg,#17120d0a 0%,#10121b12 48%,#10101555 100%)}
  .clinic-dialogue{position:absolute;z-index:5;top:3.5%;right:2.4%;
    box-sizing:border-box;width:min(46%,650px);max-height:91%;overflow-y:auto;
    background:transparent;color:#2b1c11;
    border:solid transparent;border-width:21px 25px 20px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:21px 25px 20px;border-image-repeat:stretch;
    margin:0;padding:10px 15px 12px;filter:drop-shadow(0 6px 8px #0008)}
  .eyebrow,.speaker{font:600 14px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.065em;color:#382416;margin:0 0 10px}
  h1{margin:0 0 12px;font:600 26px/1.25 var(--pall-font-reading,Georgia,serif);
    color:#2b1b12}
  .narration,.speech,.instruction{font:16px/1.45 var(--pall-font-reading,Georgia,serif);
    color:#21150e;margin:0 0 13px}
  .speech{font-weight:600}
  .narration{color:#302016}
  .stage-direction{font-style:italic}
  .instruction{font-weight:700}
  .speaker{margin:10px 0 5px}
  .price{display:grid;grid-template-columns:minmax(0,1fr) auto;
    align-items:baseline;gap:7px 12px;padding:12px 13px;margin:13px 0;
    border-top:1px solid #967650;border-bottom:1px solid #967650;
    background:#e0cba7;color:#3a2616;font:14px/1.4 Georgia,serif}
  .price strong{text-align:right;font-variant-numeric:tabular-nums}
  .receipt,.next-note{font-size:14px;line-height:1.5;color:#3d291b;margin:10px 0}
  .actions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0 10px}
  .advance{min-width:210px;max-width:100%}
  .error{padding:8px 10px;background:#f4d3c2;border-left:3px solid #a34129;
    font-size:14px;line-height:1.4;color:#702018}
  .medical-record{margin:12px 0 0;border-top:1px solid #bb9c70;
    padding:9px 1px 0;color:#3d291b;font:13px/1.45 Georgia,serif}
  .medical-record summary{cursor:pointer;font-weight:700}
  .medical-record p{margin:8px 0}
  .medical-record ul{margin:8px 0;padding-left:23px}
  .journal-toggle{margin:12px 0 0;min-width:170px;min-height:44px}
  /* Match the full-width personal journals used in Stages 5 and 6. */
  .journal{background:#e6d5b5;color:#24160e;
    padding:23px clamp(16px,3vw,45px);border-top:2px solid #94704a;
    scroll-margin-top:14px}
  .journal-head{max-width:960px;display:flex;justify-content:space-between;
    align-items:center;margin:0 auto 15px;gap:12px}
  .journal-head small{font:700 13px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.09em;color:#47301d}
  .journal-head h2{margin:4px 0;font:600 24px/1.3 var(--pall-font-reading,Georgia,serif);
    color:#25170f}
  .journal-entries{max-width:960px;margin:0 auto}
  .journal-entries p{margin:0 0 10px;font:600 16px/1.55 var(--pall-font-reading,Georgia,serif);
    color:#24160e}
  .journal-button{background:#e5d1ae;border:1px solid #906c49;padding:6px 10px;
    font:600 14px/1.3 var(--pall-font-reading,Georgia,serif);color:#352414;cursor:pointer}
  .journal-button:is(:hover,:focus-visible){background:#f6e4c3}
  .journal-button:focus-visible{outline:2px solid #614022;outline-offset:2px}
  .fallback{max-width:760px;margin:8vh auto;padding:30px;background:#28221d;
    border:1px solid #866546;color:#eadfcf}
  .fallback a{color:#eac498}
  @media(max-width:950px){
    .clinic-scene{height:auto;min-height:660px;display:flex;
      flex-direction:column;gap:14px;padding:22px 14px;align-items:flex-end;
      background-position:45% center}
    .clinic-dialogue{position:relative;top:auto;right:auto;bottom:auto;
      left:auto;width:min(100%,590px);max-height:none;overflow:visible}
  }
  @media(max-width:550px){
    .clinic-scene{padding:12px 8px;min-height:670px;background-position:48% center}
    .clinic-dialogue{width:100%;border-width:17px 18px 17px;
      border-image-width:17px 18px 17px;padding:8px 11px}
    .narration,.speech,.instruction{font-size:14px}
    .eyebrow,.speaker{font-size:12px}
    h1{font-size:22px}
    .actions .pall-framed-button{width:100%}
  }
</style>
