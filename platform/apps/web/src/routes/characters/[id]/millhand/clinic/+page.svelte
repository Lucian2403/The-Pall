<script lang="ts">
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';

  type Wound={type:string;zone?:string;severity:string};
  type Condition={
    hp:number;hpMax:number;stamina:number;composure:number;
    fatigue:number;stress:number;momentum:number;bleed:number;wounds:Wound[];
  };
  type Phase='ARRIVAL'|'EXAMINED'|'SPOKEN'|'PRICED'|'PAID'|'LEFT';
  type Action='examine'|'speak'|'review_price'|'pay'|'leave';
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
  const diagnosis=$derived(clinic?.conditionType==='unhurt'
    ?'No injuries found. No treatment needed.'
    :clinic?.conditionType==='cut'
      ?"A cut is recorded. It needs cleaning and dressing."
      :'The examination records your current Health and combat condition.');
  const journal=$derived(clinic?.paid
    ?clinic?.conditionType==='unhurt'
      ?"They couldn't find anything wrong with me. Good. Still cost ten coins just to be examined. Half my money gone, and I haven't earned a thing today."
      :"The clinician checked me over and treated what they could. Ten coins for the examination and care. I needed the help, but that's half my money gone. Still nothing paid for the council work."
    :"Made it to the clinic after the fight with Flint. I've not got much money left, but I ought to get checked.");

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
      if(clinic?.phase==='LEFT'&&character)
        character={...character,tutorial:{stage:8,status:'NOT_STARTED'}};
      status='ready';
    }catch(error){
      status='error';
      errorMessage=error instanceof Error?error.message:'Clinic record unavailable';
    }
  }
  onMount(()=>{void refresh();});
  async function perform(action:Action){
    if(pending||!clinic||next!==action)return;
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
  <TutorialShell {character} sceneLocation="City clinic"
    combatStamina={{current:clinic.after?.stamina??clinic.before.stamina,maximum:100}}>
    <div class="clinic">
      <header class="clinic-heading">
        <small>MILLHAND · STAGE VII</small>
        <h1>The Clinic</h1>
        <p>{clinic.outcome==='player_defeat'
          ?'Another worker helps you reach the clinic after Flint defeats you.'
          :'You leave the passage and reach the clinic after Flint withdraws.'}</p>
        <p>There is a place to sit. A clinician is available to examine you.</p>
      </header>
      <div class="clinic-layout">
        <section class="condition" aria-label="Recorded condition">
          <h2>Your condition</h2>
          <div class="health">
            <span>Health on arrival</span>
            <strong>{clinic.before.hp} / {clinic.before.hpMax}</strong>
          </div>
          <div class="small-stats">
            <span>Stamina <b>{clinic.before.stamina}</b></span>
            <span>Fatigue <b>{clinic.before.fatigue}</b></span>
            <span>Composure <b>{clinic.before.composure}</b></span>
            <span>Stress <b>{clinic.before.stress}</b></span>
            <span>Momentum <b>{clinic.before.momentum}</b></span>
            <span>Bleeding <b>{clinic.before.bleed}</b></span>
          </div>
          <h3>Recorded injuries</h3>
          {#if clinic.before.wounds.length===0}
            <p>None recorded.</p>
          {:else}
            <ul>
              {#each clinic.before.wounds as wound,i (i)}
                <li>{wound.type}{wound.zone?' · '+wound.zone:''} · {wound.severity}</li>
              {/each}
            </ul>
          {/if}
          {#if clinic.phase!=='ARRIVAL'}
            <p class="diagnosis">{diagnosis}</p>
          {/if}
          {#if clinic.after}
            <div class="discharge">
              <h3>Condition after care</h3>
              <p>Health {clinic.after.hp} / {clinic.after.hpMax} · Stamina {clinic.after.stamina}
                · Composure {clinic.after.composure}</p>
              <p>Fatigue {clinic.after.fatigue} · Stress {clinic.after.stress}
                · Momentum {clinic.after.momentum} · Bleeding {clinic.after.bleed}
                · Active wounds {clinic.after.wounds.length}</p>
              <p class="small">Combat reserves were reset for tutorial discharge.
                The saved battle record is unchanged.</p>
            </div>
          {/if}
        </section>
        <section class="exchange" aria-label="Examination and payment">
          <h2>Examination</h2>
          {#if clinic.phase==='ARRIVAL'}
            <p>You check your condition and prepare to speak to the clinician.</p>
          {:else}
            {#if clinic.phase==='EXAMINED'}
              <p>{diagnosis}</p>
            {:else}
              <p><strong>CLINICIAN:</strong> “Sit. Let me see.”</p>
              {#if clinic.conditionType==='cut'}
                <p><strong>CLINICIAN:</strong> “Needs cleaning. I'll dress it.”</p>
              {:else if clinic.conditionType==='unhurt'}
                <p><strong>EXAMINATION RESULT:</strong> No injuries found. No treatment needed.</p>
              {:else}
                <p>{diagnosis}</p>
              {/if}
              <p><strong>YOU:</strong> “How much?”</p>
              <p><strong>CLINICIAN:</strong> “Ten coins.”</p>
              <p><strong>YOU:</strong> “Ten?”</p>
              <p><strong>CLINICIAN:</strong> “{clinic.conditionType==='cut'
                ?'That includes the dressing.'
                :clinic.conditionType==='unhurt'
                  ?'For the examination.'
                  :'For the examination and any care you need.'}”</p>
            {/if}
          {/if}
          <div class="fee" aria-label="Clinic service fee">
            <div><span>Examination and necessary basic care</span><strong>{clinic.fee} coins</strong></div>
            <div><span>Coins in hand</span><strong>{clinic.coins}</strong></div>
            {#if clinic.phase==='PRICED'}
              <div><span>Coins after payment</span><strong>{clinic.coins-clinic.fee}</strong></div>
            {/if}
            {#if clinic.paid}<p class="paid">Examination paid. No further fee is due.</p>{/if}
          </div>
          {#if clinic.phase==='PAID'}
            <p class="completion">The clinician has completed the examination
              {clinic.conditionType==='unhurt'?'without unnecessary treatment.'
                :'and the tutorial discharge care.'}
              Your starting condition has been restored.</p>
          {/if}
          {#if clinic.phase==='LEFT'}
            <p class="completion">You leave the clinic and head toward your rented home.</p>
            <p>Stage 8 — Return Home is the next chapter. Its playable scene is not yet connected.</p>
          {:else if next}
            <button class="pall-framed-button advance" type="button" disabled={pending}
              onclick={()=>{if(next)void perform(next);}}>
              {pending?'Saving…':label}
            </button>
          {/if}
          {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
        </section>
      </div>
      <section class="journal" aria-label="Personal Journal">
        <div class="reading">
          <small>PERSONAL JOURNAL</small>
          <h2>The Clinic</h2>
          <p>{journal}</p>
          {#if clinic.phase==='LEFT'}<p>I've got ten coins left. Time to head home.</p>{/if}
        </div>
      </section>
    </div>
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
  .clinic{display:flex;flex-direction:column;gap:14px;padding:16px 19px 24px;
    background:linear-gradient(#211d19ef,#141413f5);min-height:620px}
  .clinic-heading{padding:14px 20px;border:1px solid #725a3b;background:#32271fdc}
  .clinic-heading small,.journal small{font:700 13px/1.3 Arial,sans-serif;letter-spacing:.1em}
  .clinic-heading h1{margin:4px 0 10px;color:#f0d5ab;font:600 31px/1.2 Georgia,serif}
  .clinic-heading p{margin:5px 0;font-size:15px;line-height:1.5;color:#e3cfb2}
  .clinic-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:14px}
  .condition,.exchange{padding:19px 22px;background:#28231fed;border:1px solid #866546;
    min-width:0}
  h2{font:600 22px/1.3 Georgia,serif;color:#f0d3a9;margin:0 0 13px}
  h3{font:600 17px/1.4 Georgia,serif;color:#dcc39e;margin:15px 0 8px}
  p{line-height:1.55}
  .condition ul{padding-left:24px}
  .condition li{margin-bottom:6px}
  .health,.fee div{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
  .health{padding:10px 0;border-top:1px solid #695037;border-bottom:1px solid #695037}
  .health strong{font-size:20px;color:#eed4ae;font-variant-numeric:tabular-nums}
  .small-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 17px;
    margin-top:12px}
  .small-stats span{display:flex;justify-content:space-between;gap:8px;font-size:14px}
  .small-stats b{color:#f4d7b1;font-variant-numeric:tabular-nums}
  .diagnosis{padding:9px 12px;border-left:3px solid #cfad77;background:#382f25}
  .exchange>p{margin:9px 0}
  .fee{background:#201d1a;border:1px solid #755b40;padding:12px 15px;margin:20px 0 14px}
  .fee div{padding:6px 0;border-bottom:1px solid #503e2d;font-size:14px}
  .fee div:last-of-type{border-bottom:0}
  .fee strong{color:#f1d5ad;white-space:nowrap;font-variant-numeric:tabular-nums}
  .paid{margin:9px 0 0;color:#c1dbb7;font-weight:700}
  .completion{border-left:3px solid #8fa883;padding:10px 12px;background:#2e392b}
  .discharge{padding:10px 12px;margin-top:18px;background:#313323;border:1px solid #63724c}
  .discharge h3{margin:0 0 8px}
  .discharge p{margin:5px 0;font-size:14px}
  .discharge .small{font-size:12px;color:#d1c8af}
  .advance{margin-top:12px}
  .error{color:#ffd1bc}
  .journal{margin-top:2px;background:#e6d5b5;color:#24160e;padding:23px clamp(16px,3vw,45px)}
  .reading{max-width:960px;margin:auto}
  .journal small{color:#47301d}
  .journal h2{margin:5px 0;color:#25170f;font-size:24px}
  .journal p{font:600 16px/1.55 Georgia,serif;margin:0 0 10px}
  .fallback{max-width:760px;margin:8vh auto;padding:30px;background:#28221d;
    border:1px solid #866546;color:#eadfcf}
  .fallback a{color:#eac498}
  @media(max-width:900px){.clinic-layout{grid-template-columns:1fr}.clinic{padding:8px}}
  @media(max-width:550px){.small-stats{grid-template-columns:1fr}.condition,.exchange{padding:14px}}
</style>
