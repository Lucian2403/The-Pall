<script lang="ts">
  import {getContext,tick} from 'svelte';
  import ActivityLayout from '$lib/ActivityLayout.svelte';
  import StitcherWardItemTray from '$lib/StitcherWardItemTray.svelte';
  import SecondJobChoices from '$lib/SecondJobChoices.svelte';
  import NpcConversation from '$lib/NpcConversation.svelte';
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import {STITCHER_ACTION_LABEL,STITCHER_ROUTE_UI,STITCHER_STAGE_TITLES} from '$lib/stitcher-ward-copy';
  import {shouldShowClaudia} from '$lib/stitcher-claudia-presence';
  import {stage5JournalEntries} from '$lib/stitcher-stage5-journal';
  import {STITCHER_WARD_ITEMS,stitcherItemActions,stitcherWardSuppliesVisible,
    type StitcherWardItemKey} from '$lib/stitcher-ward-items';
  import {STITCHER_SCENE_ART,stitcherSceneEnvironment} from '$lib/stitcher-scene-environment';
  import '$lib/pall-story-landscape.css';
  import '$lib/workshop-object-labels.css';
  type Branch='trolley'|'consent'|'notes';
  type Phase='intro'|'briefing'|'inspect'|'order'|'prepare'|'care'|'linen_check'|
    'linen_fix'|'verify'|'record'|'report'|'close'|'discovery'|'claudia'|'choose'|
    'opening'|'work'|'dialogue'|'finish'|'exited'|'attendant'|'investigate'|
    'witness'|'hold'|'door'|'prepare_door'|'door_reply'|'fight_ready';
  type State={
    revision:number;stage:1|2|3|4|5;phase:Phase;introLine:number;
    inspectedA:boolean;inspectedB:boolean;first:'a'|'b'|null;
    prepared:'cut'|'ready'|null;treatedA:boolean;treatedB:boolean;
    correction:'discard'|'trim'|null;reportLine:number;
    bedObserved:boolean;chartRead:boolean;patientHeard:boolean;
    patientLine:number;focus:'bed'|'chart'|'patient'|null;
    claudiaLine:number;branch:Branch|null;taskStep:number;
    routeMethod:string|null;openingLine:number;dialogueLine:number;
    stage5Line?:number;stage5Choice?:'papers'|'claudia'|'evidence'|null;
    stage5Witnessed?:boolean;stage5Hold?:boolean;
    stage5Preparation?:'reason'|'cart'|'brace'|null
  };
  type Snapshot={stage:number;tutorialStatus:string;state:State;
    started:boolean;availableActions:string[]};
  let {snapshot,pending,errorMessage,perform}:{
    snapshot:Snapshot;pending:boolean;errorMessage:string;
    perform:(action:string)=>Promise<void>;
  }=$props();
  const s=$derived(snapshot.state);
  const allowed=$derived(snapshot.availableActions);
  const itemChoices=$derived(stitcherItemActions(s.stage,s.phase,allowed));
  const hidesHotspotAction=(action:string)=>
    s.stage===2&&s.phase==='inspect'&&(action==='inspect_a'||action==='inspect_b')||
    s.stage===3&&action==='observe_bed';
  const showTextActions=$derived(allowed.some(action=>
    !itemChoices.some(item=>item.action===action)&&!hidesHotspotAction(action)));

  const branchData=$derived(s.branch?STITCHER_ROUTE_UI[s.branch]:null);
  const branchDialogues={
    trolley:[
      {speaker:'RECEIVER',text:'Contract number?'},
      {speaker:'YOU',text:"There's a man on this trolley. Haven't you got his name?"},
      {speaker:'RECEIVER',text:'I need the number.'},
      {speaker:'YOU',text:"I'm not signing him over."},
      {speaker:'RECEIVER',text:'Then take him back to the ward.'}
    ],
    consent:[
      {speaker:'CLERK',text:"His thumbprint's right here."},
      {speaker:'YOU',text:'He says they took it while he was asleep.'},
      {speaker:'CLERK',text:"Then we'd better check the medicine book."},
      {speaker:'YOU',text:'They gave him the draught before they took his print.'},
      {speaker:'CLERK',text:"I'll mark the transfer disputed."},
      {speaker:'CLAUDIA',text:"You couldn't come to me first?"},
      {speaker:'YOU',text:'Would you have changed anything?'},
      {speaker:'CLAUDIA',text:"Now the school won't pay until this is settled."}
    ],
    notes:[
      {speaker:'COPYIST',text:'What do you need?'},
      {speaker:'YOU',text:'His treatment notes. And the teaching list for tomorrow.'},
      {speaker:'YOU',text:"I can't find anything saying he needs another operation."},
      {speaker:'COPYIST',text:"He's down for a demonstration."},
      {speaker:'YOU',text:"So it's not to treat his wound?"},
      {speaker:'COPYIST',text:'Not according to these notes.'}
    ]
  } as const;
  const claudiaLines=[
    {speaker:'YOU',text:"What's this demonstration? He says he never agreed to it."},
    {speaker:'CLAUDIA',text:"The school's paying us. He got his treatment."},
    {speaker:'YOU',text:'So now they get to operate on him for a lesson?'},
    {speaker:'CLAUDIA',text:"Who's paying for the fever ward's coal if I turn them away? You?"},
    {speaker:'YOU',text:"He's strapped to the bed, Claudia."},
    {speaker:'CLAUDIA',text:"And I've got a ward full of patients waiting. Get on with your work."}
  ] as const;
  const currentLine=$derived(s.phase==='claudia'?claudiaLines[s.claudiaLine]:
    s.phase==='dialogue'&&s.branch?branchDialogues[s.branch][s.dialogueLine]:null);
  const journal=$derived.by(()=>{
    const entries:string[]=['I went to Cinder Row Infirmary for my shift. Claudia put me to work straight away. Two patients by the door needed fresh bandages, and she wanted them done properly.'];
    if(s.stage>=2)entries.push('No pay for this round, of course. One patient had a small bleeding cut, and the other needed a dirty bandage changed. Nothing too serious, thankfully. Still, I had to be careful.');
    if(s.first)entries.push(s.first==='a'?'I started with the bleeding cut. Seemed better to deal with that first.':'I dealt with the dirty bandage first. The other patient could wait a little.');
    if(s.prepared)entries.push(s.prepared==='cut'?'I cut the clean linen to fit each wound. Took longer, but we haven\'t got much to spare.':'I used the ready-cut bandages. Quicker that way, though I used more linen.');
    if(s.correction)entries.push(s.correction==='trim'
      ?'A clean bandage brushed against the dirty bed rail. Damn nuisance. I cut off the touched end before using it. Couldn\'t put that against someone\'s wound.'
      :'One of the clean bandages touched the dirty bed rail. I had to throw it out and get another. More wasted linen, but I wasn\'t going to risk an infection.');
    if(s.stage>=3){
      entries.push('I found a man lying awake in one of the side rooms. His wrists were strapped to the bed, and someone had drawn blue lines across his skin for an operation. I didn\'t like the look of it.');
      if(s.chartRead)entries.push('I checked his chart. It said: CHARITY PATIENT. TEACHING DEMONSTRATION, DAWN. A teaching demonstration? On a man strapped to his bed? What the hell is going on here?.');
      if(s.patientHeard)entries.push('The man told me they gave him something to make him sleep, then took his thumbprint. He says he never agreed to another operation. I haven\'t checked the papers yet, but I can\'t just ignore what he\'s telling me.');
      if(s.phase==='choose'||s.stage>=4)entries.push("I confronted Claudia. She knows about the operation. The school pays for the fever ward's coal, and she won't give up that money just because the man says no.");
    }
    if(s.branch)entries.push(s.branch==='trolley'
      ?'I decided to follow the trolley. I wanted to see where they were taking the man, and whether I could stop them from handing him over.'
      :s.branch==='consent'
        ?'I went to check the consent form. There\'s a thumbprint on it, but the man says he was asleep when they took it. I wanted to find out what really happened.'
        :"I went to look through the surgeon's notes. I needed to know why they wanted another operation when the man's wound had already been treated.");
    if(s.stage===5){
      if(branchData)entries.push(branchData.finding);
      entries.push(...stage5JournalEntries(s));
    }
    return entries;
  });
  let journalOpen=$state(false);
  let journalEl:HTMLElement|undefined;
  const register=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  async function toggleJournal(){
    journalOpen=!journalOpen;
    if(journalOpen){await tick();journalEl?.scrollIntoView({block:'start',behavior:'smooth'});}
  }
  $effect(()=>{
    register?.({id:'stitcher-ward-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>register?.(null);
  });
  function act(action:string){
    if(!pending&&allowed.includes(action))void perform(action);
  }
  const choices=$derived([
    {id:'choose_trolley',line:"I'll go with the trolley. I want to see where they take him.",skill:'Industry / Hauling',disabled:pending},
    {id:'choose_consent',line:'Then show me his consent paper.',skill:'Commerce / Contracts',disabled:pending},
    {id:'choose_notes',line:"Let me see the surgeon's notes.",skill:'Scholarship / Investigation',disabled:pending}
  ]);
  const interactiveBeds=$derived(s.stage===2&&(s.phase==='inspect'||s.phase==='care')||s.stage===3&&s.phase==='discovery'&&!s.bedObserved);
  const environment=$derived(stitcherSceneEnvironment(s.stage,s.branch,s.phase));
  const sceneArt=$derived(STITCHER_SCENE_ART[environment]);
  // The same four ward tools remain accessible throughout every Clinic beat
  // in Stages I–III, including the Matron's optional dialogue.
  const showWardSupplies=$derived(stitcherWardSuppliesVisible(s.stage,environment));
  let inspectedItem=$state<{
    key:StitcherWardItemKey;revision:number;stage:number;phase:string
  }|null>(null);
  const selectedWardItem=$derived(inspectedItem&&inspectedItem.revision===s.revision&&
    inspectedItem.stage===s.stage&&inspectedItem.phase===s.phase
    ?STITCHER_WARD_ITEMS.find(item=>item.key===inspectedItem?.key)??null:null);
  function inspectWardItem(key:StitcherWardItemKey){
    if(pending||!showWardSupplies)return;
    const action=itemChoices.find(item=>item.key===key)?.action;
    if(action&&!claudiaTalkOpen){
      inspectedItem=null;
      act(action);
      return;
    }
    inspectedItem=selectedWardItem?.key===key?null:{
      key,revision:s.revision,stage:s.stage,phase:s.phase
    };
  }
  // Claudia can be called to the ward during either of the first two stages.
  // Optional talk is client-only: opening/closing it cannot alter the saved
  // action list, revision, inspection, rewards or any other gameplay state.
  let claudiaTalkOpen=$state(false);
  const canTalkClaudia=$derived(s.stage===1||s.stage===2);
  const claudiaVisible=$derived(claudiaTalkOpen||shouldShowClaudia(s,snapshot.started)||
    s.stage===5&&(s.phase==='hold'||s.phase==='witness'&&s.stage5Choice==='claudia'));
  let claudiaArtMissing=$state(false);
  $effect(()=>{
    if(!canTalkClaudia&&claudiaTalkOpen)claudiaTalkOpen=false;
  });
</script>

<section class="workshop stitcher-ward" aria-label={'Stitcher Stage '+s.stage+' — '+STITCHER_STAGE_TITLES[s.stage]}>
  <ActivityLayout mode="scene" stageAspect={1672/941} class="pall-story-sections">
    {#snippet stage()}
      <div class="scene-visuals pall-story-visuals">
        <div class="ward-art pall-story-landscape">
          <img class="infirmary" src={sceneArt.image} alt={sceneArt.alt}
            draggable="false"/>
          {#if s.stage===5&&['door','prepare_door','door_reply','fight_ready'].includes(s.phase)}
            <img class="owler" src="/locations/stitcher/owler.webp"
              alt="Owler, the Night Porter, standing at the service doorway"
              draggable="false"/>
            <span class="owler-label">Owler · Night Porter</span>
          {/if}
          {#if claudiaVisible&&!claudiaArtMissing}
            <!-- One approved Claudia sprite, reused only during exchanges
                 with her. Independent treatment and patient examination
                 retain an unobstructed ward image. -->
            <img class="claudia" src="/locations/stitcher/claudia-front.webp"
              alt="Claudia Cyka, the Matron" draggable="false"
              onerror={()=>claudiaArtMissing=true}/>
          {/if}
          {#if canTalkClaudia}
            <!-- The whole portrait is a generous invisible hit target while
                 Claudia is present. During solo ward work only the small
                 framed summon label remains; opening it brings her back. -->
            <button type="button" class="claudia-hotspot" class:present={claudiaVisible}
              aria-label="Talk to Claudia Cyka" title="Talk to Claudia Cyka"
              aria-pressed={claudiaTalkOpen} disabled={pending}
              onclick={()=>{claudiaTalkOpen=true;}}>
              <span class="claudia-marker">
                <!-- <span class="claudia-poi" aria-hidden="true"></span> -->
                <span class="workshop-npc-label">Claudia Cyka</span>
              </span>
            </button>
          {/if}
          {#if interactiveBeds&&!claudiaTalkOpen}
            {#if s.stage===2}
              <button class="bed-hotspot bed-a" type="button"
                class:completed={s.inspectedA||s.treatedA}
                disabled={pending||!(allowed.includes('inspect_a')||allowed.includes('dress_a'))}
                onclick={()=>act(allowed.includes('dress_a')?'dress_a':'inspect_a')}
                aria-label={s.phase==='care'?'Clean and dress Bed A':'Inspect Bed A, shallow bleeding cut'}
                title={s.phase==='care'?'Clean and dress Bed A':'Inspect the bleeding cut at Bed A'}>
                <span class="bed-marker"><span class="bed-poi" aria-hidden="true"></span><span class="bed-label">Bed A</span></span>
              </button>
              <button class="bed-hotspot bed-b" type="button"
                class:completed={s.inspectedB||s.treatedB}
                disabled={pending||!(allowed.includes('inspect_b')||allowed.includes('dress_b'))}
                onclick={()=>act(allowed.includes('dress_b')?'dress_b':'inspect_b')}
                aria-label={s.phase==='care'?'Clean and dress Bed B':'Inspect Bed B, dirty outer dressing'}
                title={s.phase==='care'?'Clean and dress Bed B':'Inspect the dirty dressing at Bed B'}>
                <span class="bed-marker"><span class="bed-poi" aria-hidden="true"></span><span class="bed-label">Bed B</span></span>
              </button>
            {:else if s.stage===3}
              <button class="bed-hotspot teaching-bed" type="button"
                disabled={pending} onclick={()=>act('observe_bed')}
                aria-label="Examine the Narrow Bed and its adult patient" title="Look at the Narrow Bed">
                <span class="bed-marker"><span class="bed-poi" aria-hidden="true"></span><span class="bed-label">Narrow Bed</span></span>
              </button>
            {/if}
          {/if}
          <span class="scene-place">{sceneArt.place}</span>
        </div>
      </div>
    {/snippet}
    {#snippet panel()}
      <section class="pall-story-dialogue-section" aria-label="Stitcher ward interaction">
        <div class="work-card">
          <p class="eyebrow">{s.stage===4?'SECOND JOB':'STITCHER'} · STAGE {['','I','II','III','IV','V'][s.stage]}{#if branchData} · {branchData.discipline}{/if}</p>
          <h1>{s.stage===5?STITCHER_STAGE_TITLES[5]:branchData?.title??STITCHER_STAGE_TITLES[s.stage]}</h1>
          {#if claudiaTalkOpen}
            <NpcConversation origin="Stitcher" close={()=>{claudiaTalkOpen=false;}}/>
          {:else}
          {#if !snapshot.started}
            <p class="narration">The infirmary is packed, with every bed taken. Steam rises from a basin of hot water, and smoke drifts from the coal stove. Claudia Cyka is going over the morning's work.</p>
          {:else if s.stage===1}
            {#if s.phase==='intro'}
              {#if s.introLine===0}
                <p class="narration">A linen clerk questions Claudia's clean dressings. She gives him a warm smile and asks him to check his count. He turns back to his book. Her smile is gone before he reaches the doorway.</p>
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“Those two by the door need fresh dressings. Get on with it.”</p>
              {:else if s.introLine===1}
                <p class="speaker">{dialogueSpeakerLabel('YOU')}</p>
                <p class="spoken">“There's hardly any clean linen left.”</p>
              {:else if s.introLine===2}
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“I know. Use what they need. No more.”</p>
              {:else}
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“Look at the wounds first. If either one's worse than expected, come and get me. Don't guess.”</p>
              {/if}
            {:else}
              <p class="narration">Two patients lie in the beds near the door, waiting for their bandages to be changed. Claudia has left you clean water and linen to work with. She'll be keeping an eye on you, though you won't be paid for the round.</p>
              <p class="instruction">Before you begin, you need to check both wounds. If anything looks serious, you'll have to call Claudia over.</p>
            {/if}
          {:else if s.stage===2}
            {#if s.phase==='inspect'}
              <p class="narration">Two beds near the ward entrance need fresh dressings. Select each bed in the illustration to inspect it.</p>
              {#if s.inspectedA}<p class="finding"><strong>Bed A.</strong> A shallow cut has slight fresh seepage beneath the old dressing.</p>{/if}
              {#if s.inspectedB}<p class="finding"><strong>Bed B.</strong> A small scrape is covered by a dry, dirty outer dressing.</p>{/if}
            {:else if s.phase==='order'}
              <p class="narration">Both beds need attention. Who do you see first?</p>
            {:else if s.phase==='prepare'}
              <p class="narration">You check the clean water and linen. There's enough for both patients, but not much left to spare. You can cut the dressings to fit each wound, or use the ones already prepared.  </p>
            {:else if s.phase==='care'}
              <p class="narration">{!s.treatedA&&!s.treatedB
                ?'You turn to the patient in Bed B. The old bandage is dirty, and the scrape underneath needs cleaning. You have fresh linen and clean water ready.'
                :'You\'ve taken care of the dirty bandage. Now you can finish treating the other patient.'}</p>
              <p class="instruction">Once you've finished here, you'll see to the other patient.</p>
            {:else if s.phase==='linen_check'}
              <p class="narration">The end of the clean bandage touches the dirty bed rail.</p>
              <p class="instruction">You can't use that part on the wound.</p>
            {:else if s.phase==='linen_fix'}
              <p class="narration">The part of the dressing that touched the rail is visible. The unaffected linen is long enough to cover the wound if trimmed cleanly.</p>
            {:else if s.phase==='verify'}
              <p class="narration">Both patients have fresh bandages. You take one last look to make sure they're clean and not too loose. Everything looks fine. Now you can write down what you've done.</p>
            {:else if s.phase==='record'}
              <p class="narration">Record which beds received care and the linen used, including {s.correction==='trim'?'the trimmed offcut':'the discarded piece'}.</p>
            {:else if s.phase==='report'}
              {#if s.reportLine===0}
                <p class="narration">Claudia checks the linen count before she looks at you.</p>
                <p class="speaker">CLAUDIA</p><p class="spoken">“Both finished?”</p>
              {:else if s.reportLine===1}
                <p class="speaker">{dialogueSpeakerLabel('YOU')}</p>
                <p class="spoken">“{s.correction==='trim'
                  ?'Yes. I cut off the end that touched the rail.'
                  :'Yes. Some clean linen touched the bed rail. I threw it out and got fresh.'}”</p>
              {:else}
                <p class="speaker">CLAUDIA</p>
                <p class="spoken">“{s.correction==='trim'
                  ?'Put the offcut on the sheet. I want the count right.'
                  :"Write it down, then. They'll ask me where the linen went."}”</p>
              {/if}
            {:else}
              <p class="narration">Both patients have clean, secure bandages. You've written down the linen you used and handed the finished report to Claudia.</p>
            {/if}
          {:else if s.stage===3}
            {#if s.phase==='discovery'}
              {#if !s.bedObserved}
                <p class="narration">Claudia goes into the side ward to close it for the day. You notice a man lying awake in one of the narrow beds.</p>
              {:else if s.focus==='bed'}
                <p class="narration">A man lies awake in the narrow bed, with straps holding his wrists down. Blue lines have been drawn on his skin near an old wound. He keeps looking towards the door.</p>
              {:else if s.focus==='chart'}
                <p class="narration">The bedside chart does not list another treatment needed for the wound. Its transfer entry reads:</p>
                <p class="finding"><strong>CHARITY ACCOUNT SETTLED — TEACHING DEMONSTRATION, DAWN.</strong></p>
              {:else if s.focus==='patient'}
                {#if s.patientLine===0}
                  <p class="speaker">PATIENT</p><p class="spoken">“I was asleep when they took my thumbprint.”</p>
                {:else if s.patientLine===1}
                  <p class="speaker">{dialogueSpeakerLabel('YOU')}</p><p class="spoken">“You never agreed to an operation?”</p>
                {:else}
                  <p class="speaker">PATIENT</p><p class="spoken">“No. They said they'd look after my wound.”</p>
                {/if}
              {/if}
            {:else if s.phase==='claudia'&&currentLine}
              {#if s.claudiaLine===0}
                <p class="narration">Claudia closes the casebook on the end table. She looks at the chart, not the man.</p>
              {/if}
              <p class="speaker">{dialogueSpeakerLabel(currentLine.speaker)}</p>
              <p class="spoken">“{currentLine.text}”</p>
            {:else if s.phase==='choose'}
              <p class="speaker">CLAUDIA</p>
              <p class="spoken">“Do what you like. Stay out of my way.”</p>
              <p class="narration">The patient is alive. The transfer is pending. Choose how you will act.</p>
            {/if}
          {:else if s.stage===4&&branchData}
            {#if s.phase==='opening'}
              <p class="narration">{branchData.opening[s.openingLine]}</p>
            {:else if s.phase==='work'}
              <p class="narration">{branchData.steps[Math.min(s.taskStep,3)]}</p>
            {:else if s.phase==='dialogue'&&currentLine}
              <p class="speaker">{dialogueSpeakerLabel(currentLine.speaker)}</p>
              <p class="spoken">“{currentLine.text}”</p>
            {:else}
              <p class="narration">{branchData.finding}</p>
              <p class="narration">He's still in the infirmary, and you haven't signed him over. You won't get a coin for all this work. Worse, they could still come for him. For now, though, you've managed to keep him here.</p>
            {/if}
          {:else if s.stage===5}
            {#if s.phase==='exited'}
              <p class="narration">You return to the side ward and find the man's bed empty. The sheets are still warm, and the straps hang loose from the frame. They can't have taken him far. As you turn towards the service passage, an attendant comes through the door.</p>
            {:else if s.phase==='attendant'}
              {#if (s.stage5Line??0)===0}
                <p class="speaker">{dialogueSpeakerLabel('YOU')}</p>
                <p class="spoken">“Where've they taken him?”</p>
              {:else}
                <p class="speaker">ATTENDANT</p>
                <p class="spoken">“Down to the night door. He's still on the trolley in the passage.”</p>
              {/if}
            {:else if s.phase==='investigate'}
              <p class="narration">The attendant tells you the man's still on the trolley near the night door. They haven't handed him over yet, but there's no telling how long that will last. You need to do something before they take him away.</p>
            {:else if s.phase==='witness'}
              {#if (s.stage5Line??0)===0}
                {#if s.stage5Choice==='papers'}
                  <p class="narration">You check the ward records. No one has signed him over yet. There's still time to stop them.</p>
                {:else if s.stage5Choice==='claudia'}
                  <p class="narration">You fetch Claudia from the ward. She is angry that the dispute has spread, but comes to the passage.</p>
                {:else if s.branch==='trolley'}
                  <p class="narration">You explain that the receiver demanded a contract number and that you refused to sign the patient over.</p>
                {:else if s.branch==='consent'}
                  <p class="narration">You show that the consent has been marked disputed in the ward records.</p>
                {:else if s.branch==='notes'}
                  <p class="narration">You explain that the surgeon's notes describe teaching, not treatment.</p>
                {/if}
                <p class="speaker">PATIENT</p>
                <p class="spoken">“I'm not going with them. I never agreed to this.”</p>
              {:else}
                <p class="speaker">ATTENDANT</p>
                <p class="spoken">“I heard you. Nobody moves him until this is sorted.”</p>
              {/if}
            {:else if s.phase==='hold'}
              <p class="narration">The attendant stays beside the trolley, keeping it inside the infirmary. They've heard the man refuse, and for now, no one's taking him anywhere.</p>
              <p class="speaker">CLAUDIA</p>
              <p class="spoken">“Leave the trolley where it is. I've got enough trouble on my hands.”</p>
            {:else if s.phase==='door'}
              <p class="narration">At the infirmary's service corridor, Owler, the night porter, stands in the doorway holding the transfer papers. He's a broad, strong-looking man with a tired face, wearing a worn vest and a ring of keys at his belt.</p>
              <p class="narration">He's been paid to take the patient to the school, but the man is still behind the attendant, waiting on the trolley..</p>
              <p class="speaker">{(s.stage5Line??0)===1?dialogueSpeakerLabel('YOU'):'OWLER'}</p>
              <p class="spoken">“{(s.stage5Line??0)===0
                ?"Give me the papers. I'm here to take him over."
                :(s.stage5Line??0)===1
                  ?"He's not going anywhere."
                  :"I've already been paid to take him."}”</p>
            {:else if s.phase==='prepare_door'}
              <p class="narration">Owler steps towards the doorway, trying to reach the patient on the trolley. You stand in his way, but he's determined to get through. You have only a moment to decide what to do before he tries to push past you.</p>
            {:else if s.phase==='door_reply'}
              {#if s.stage5Preparation==='reason'&&(s.stage5Line??0)===0}
                <p class="speaker">{dialogueSpeakerLabel('YOU')}</p>
                <p class="spoken">“He said no. The attendant heard him.”</p>
              {:else}
                <p class="speaker">OWLER</p>
                <p class="spoken">“{s.stage5Preparation==='reason'
                  ?"Then take it up with the school. I've got a job to finish."
                  :s.stage5Preparation==='cart'
                    ?'Move that cart.'
                    :"Move. I'm not saying it again."}”</p>
              {/if}
            {:else if s.phase==='fight_ready'}
              <p class="narration">Owler lowers his shoulder and tries to push through toward the trolley. You hold the doorway while the attendant keeps the patient back.</p>
              <p class="instruction">Stage VI is the turn-based encounter with Owler. Combat is not yet connected; no result, injury or reward has been recorded.</p>
            {/if}
          {/if}
          {#if itemChoices.length}<p class="item-instruction">Use the indicated item.</p>{/if}
          {#if s.stage===3&&s.phase==='choose'}
            <SecondJobChoices {choices} onChoose={act}/>
          {:else if showTextActions}
            <div class="actions" aria-label="Available actions">
              {#each allowed as action (action)}
                {#if !itemChoices.some(item=>item.action===action)&&!hidesHotspotAction(action)}
                  <button class={action==='start'||action==='begin_round'||action==='check_ward'||
                    action==='close_round'||action==='finish_job'||action==='confront_claudia'||
                    action==='continue_intro'||action==='continue_claudia'||action==='continue_opening'||
                    action==='continue_dialogue'||action==='continue_report'||action==='continue_patient'
                      ?'primary-choice':'secondary-choice'} type="button" disabled={pending}
                    onclick={()=>act(action)}>{STITCHER_ACTION_LABEL[action]??action}</button>
                {/if}
              {/each}
            </div>
          {/if}
          {/if}
          {#if selectedWardItem&&showWardSupplies}
            <section class="ward-inspection" aria-label="Ward item inspection">
              <p class="speaker">WARD SUPPLIES · INSPECTION</p>
              <p class="finding"><strong>{selectedWardItem.label}.</strong> {selectedWardItem.observation}</p>
              <div class="actions">
                <button type="button" class="secondary-choice" onclick={()=>{inspectedItem=null;}}>
                  Return to the dialogue
                </button>
              </div>
            </section>
          {/if}
          {#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
          {#if pending}<p role="status" class="saving">Recording the work…</p>{/if}
        </div>
      </section>
    {/snippet}
    {#snippet supplement()}
      {#if showWardSupplies}
        <StitcherWardItemTray items={STITCHER_WARD_ITEMS} busy={pending}
          activeKeys={itemChoices.map(item=>item.key)}
          selected={selectedWardItem?.key??null} onChoose={inspectWardItem}/>
      {/if}
    {/snippet}
  </ActivityLayout>
  {#if journalOpen}
    <section id="stitcher-ward-journal" class="journal-panel" bind:this={journalEl}
      aria-label="Personal journal — Cinder Row Infirmary">
      <header class="journal-heading">
        <div><span class="journal-kicker">PERSONAL JOURNAL</span>
          <h2>{STITCHER_STAGE_TITLES[s.stage]}</h2></div>
        <button type="button" class="journal-toggle" data-pall-sfx="paper"
          onclick={()=>{void toggleJournal();}}>Close journal</button>
      </header>
      <div class="journal-entries">{#each journal as entry,i (i)}<p>{entry}</p>{/each}</div>
    </section>
  {/if}
</section>

<style>
  .stitcher-ward{display:flex;flex-direction:column;min-width:0;width:100%;flex:1}
  .ward-art{position:relative;width:100%;background:#171a20}
  .infirmary{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
  .owler{position:absolute;bottom:0;right:40%;height:90%;max-width:45%;
    object-fit:contain;object-position:bottom;filter:drop-shadow(6px 8px 12px #09070a99);
    pointer-events:none}
  .owler-label{position:absolute;right:50%;bottom:10px;padding:5px 9px;
    border:1px solid #9e7445;background:#1b140fdb;color:#eddbbc;
    font:700 13px/1.3 var(--pall-font-reading,Georgia,serif)}
  .claudia{position:absolute;bottom:0;left:6%;height:83%;max-width:40%;
    object-fit:contain;object-position:bottom;filter:drop-shadow(6px 7px 10px #0b090caa);
    pointer-events:none}
  .claudia-hotspot{position:absolute;z-index:4;bottom:12%;left:6%;width:210px;
    min-height:44px;padding:0;border:0;background:transparent;
    display:flex;align-items:flex-end;justify-content:center;cursor:pointer}
  .claudia-hotspot.present{top:11%;left:6%;width:35%;height:75%;bottom:auto}
  .claudia-marker{display:flex;align-items:center;gap:6px;pointer-events:none;
    max-width:100%}
  .claudia-poi{width:8px;height:8px;flex:none;border-radius:50%;
    background:#e9c480;border:1px solid #39261a;box-shadow:0 0 0 1px #e5bf7980}
  .claudia-hotspot:is(:hover,:focus-visible) .claudia-poi{
    background:#fff0b7;box-shadow:0 0 0 2px #e9c480}
  .claudia-hotspot:is(:hover,:focus-visible) .workshop-npc-label{
    filter:brightness(1.08)}
  .claudia-hotspot:focus-visible{outline:none}
  .claudia-hotspot:focus-visible .workshop-npc-label{
    outline:2px solid #ffdb9c;outline-offset:2px}
  .claudia-hotspot:disabled{cursor:wait}
  .scene-place{position:absolute;bottom:12px;left:12px;
    padding:5px 9px;background:#1d1511df;border:1px solid #97724c;color:#eddbbc;
    font:600 12px/1.4 var(--pall-font-label,Georgia,serif)}
  /* Keep full-size, percentage-anchored bed hit targets. Only the POI + label
     are painted; the old dashed rectangles must never appear, even on focus. */
  .bed-hotspot{position:absolute;display:flex;align-items:flex-end;justify-content:center;
    padding:0;border:0;border-radius:0;background:transparent;
    color:#fff2cd;cursor:pointer;outline:none;box-shadow:none}
  .bed-marker{position:absolute;left:50%;bottom:-13px;transform:translateX(-50%);
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    white-space:nowrap;pointer-events:none}
  .bed-poi{display:block;flex:none;width:8px;height:8px;border-radius:50%;
    background:#e9c480;border:1px solid #39261a;box-shadow:0 0 0 1px #e5bf7980}
  .bed-label{display:block;border:1px solid #957651;padding:2px 8px;
    background:#1b1510ed;font:700 13px/1.3 var(--pall-font-reading,Georgia,serif)}
  .bed-hotspot:is(:hover,:focus-visible):not(:disabled) .bed-poi{
    background:#fff0b7;box-shadow:0 0 0 2px #e9c480}
  .bed-hotspot:is(:hover,:focus-visible):not(:disabled) .bed-label{
    border-color:#ffdb9c;filter:brightness(1.1)}
  .bed-hotspot:focus-visible:not(:disabled) .bed-label{
    outline:2px solid #ffdb9c;outline-offset:2px}
  .bed-hotspot:disabled{opacity:.33;cursor:default;pointer-events:none}
  .bed-a{left:31%;top:42%;width:25%;height:22%}
  .bed-b{left:53%;top:38%;width:14%;height:20%}
  .teaching-bed{left:31%;top:42%;width:25%;height:22%}
  .item-instruction{font:600 13px/1.4 var(--pall-font-reading,Georgia,serif);color:#5d412b;margin:6px 0 0}
  .ward-inspection{border-top:1px solid #9e815955;padding-top:10px;margin:14px 0 0}
  .ward-inspection .finding{margin-bottom:0}
  .ward-inspection .actions{margin-top:10px}
  .work-card{box-sizing:border-box;width:100%;min-width:0;margin:0}
  .eyebrow{font:600 14px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em;color:#614029;margin:0 0 13px;padding-bottom:10px;
    border-bottom:1px solid #9e815955}
  h1{margin:0 0 13px;font:600 var(--dialogue-title,21px)/1.3
    var(--pall-font-reading,Georgia,serif);color:#25170f}
  .narration,.spoken,.finding,.instruction{margin:0 0 14px;
    font:600 var(--dialogue-text,17px)/1.52 var(--pall-font-reading,Georgia,serif);
    color:#261b13}
  .narration{font-style:italic}
  .speaker{margin:8px 0 5px;font:700 15px/1.2 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.07em;color:#69432a}
  .finding{border-left:2px solid #95704a;padding:4px 12px}
  .instruction{font-size:15px;color:#5d412b}
  .actions{display:flex;flex-direction:column;gap:8px;margin-top:16px}
  .error{color:#883522}.saving{color:#654932}
  /* Original owner journal contract; no new palette, font or closing skin. */
  .journal-panel{box-sizing:border-box;width:100%;background:#e8d6b6;color:#24160e;
    border-top:2px solid #9a7147;padding:19px clamp(16px,4vw,46px) 25px;
    scroll-margin-top:56px}
  .journal-heading{display:flex;align-items:center;justify-content:space-between;
    gap:15px;max-width:930px;margin:0 auto 15px}
  .journal-heading h2{margin:6px 0 0}
  .journal-entries{max-width:930px;margin:0 auto}
  .journal-entries p{margin:9px 0}
  .journal-toggle{box-sizing:border-box;min-height:40px;padding:3px 8px;
    border:solid transparent;border-width:10px 17px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:10px 17px 9px;
    border-image-repeat:stretch;border-radius:0;background:transparent;color:#2e1d11;cursor:pointer}
  .journal-toggle:is(:hover,:focus-visible){border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .journal-toggle:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .journal-toggle:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  @container activity-panel (max-width:480px){.work-card{padding:0}}
</style>
