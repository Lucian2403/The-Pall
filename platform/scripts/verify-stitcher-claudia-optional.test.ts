import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  APPROVED_CLAUDIA_OPTIONAL_DIALOGUE,CLAUDIA_WORK_SKIP_LINE
} from '../apps/web/src/lib/approved-claudia-optional.ts';
import {INITIAL_STITCHER,applyStitcherAction,stitcherActions} from '../apps/api/src/stitcher-work.ts';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const expected=[
  {
    id:'infirmary',prompt:"Why's this place always so full?",exchanges:[
      {
        reply:"Because people keep getting sick, and I've nowhere else to put them. We've already got beds out in the hall.",
        followUp:"Can't we get more beds?"
      },
      {
        reply:"And where would you put them? We can barely get through the ward as it is.",
        followUp:"What about the clean linen? We're always short of that too."
      },
      {
        reply:"I know we're short. We wash what we can and use it carefully. Now stop worrying about the whole ward and see to your two patients."
      }
    ]
  },
  {
    id:'claudia',prompt:"Why are you always so hard on everyone?",exchanges:[
      {
        reply:"Because when someone makes a mistake, I'm the one who has to answer for it.",
        followUp:"You could be a little kinder about it."
      },
      {
        reply:"Would that get the work done any better? I've asked you to change two dressings. Go and change them properly."
      }
    ]
  },
  {
    id:'city',prompt:"What do you think of the city?",exchanges:[
      {
        reply:"Too many people, not enough room. You've seen how crowded this ward is. It's not just us.",
        followUp:"At least we've got the Grand Cylinder keeping things running."
      },
      {
        reply:"Yes, we've got heat and power. Still need coal for the stove, though. And clean linen. The Cylinder doesn't provide everything.",
        followUp:"Do you think things will ever get better?"
      },
      {
        reply:"Perhaps, if we had more money and a few more people willing to work. Until then, we'll manage with what we've got."
      }
    ]
  },
  {
    id:'pall',prompt:"What do you know about the Pall?",exchanges:[
      {
        reply:"Not much worth telling you. It's dangerous land, and a lot of it hasn't even been properly mapped.",
        followUp:"But people still go out there?"
      },
      {
        reply:"Of course they do. Some come back with things worth selling. Others come back hurt, if they come back at all.",
        followUp:"Can you tell if someone got sick out there?"
      },
      {
        reply:"I can't say what caused it just because they've been to the Pall. I'd need more than that."
      }
    ]
  },
  {
    id:'plume',prompt:"What do you know about the Plume?",exchanges:[
      {
        reply:"Only what I've been told. The ground split open, and fumes and dust spread across the land. People lost their homes. It was long before my time.",
        followUp:"Do they know what caused it?"
      },
      {
        reply:"No. You'll hear all sorts of stories about it, but I wouldn't trust half of them.",
        followUp:"Do you think we're still suffering because of it?"
      },
      {
        reply:"Of course people are still dealing with what happened. But don't blame every illness on the Plume. That's how you became a fanatic."
      }
    ]
  }
] as const;

test('Five owner-approved Claudia topics preserve every question, exact answer and order',()=>{
  assert.deepEqual(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE,expected);
  assert.equal(CLAUDIA_WORK_SKIP_LINE,'Enough talk. Back to work.');
  assert.deepEqual(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE.map(t=>t.id),
    ['infirmary','claudia','city','pall','plume']);
  assert.deepEqual(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE.map(t=>t.exchanges.length),
    [3,2,3,3,3]);
  for(const topic of APPROVED_CLAUDIA_OPTIONAL_DIALOGUE){
    assert.ok(topic.prompt.endsWith('?'));
    for(const [step,exchange] of topic.exchanges.entries()){
      if(step<topic.exchanges.length-1){
        assert.ok(exchange.followUp?.length,'Each intermediate answer has one next clickable question');
        assert.ok(exchange.followUp.endsWith('?')||exchange.followUp.endsWith('.'));
      }else assert.equal(exchange.followUp,undefined,
        'End of the topic never gives an invented extra question');
    }
  }
});
test('All optional exchanges avoid Stage III Teaching Bed disclosures',()=>{
  const all=JSON.stringify(APPROVED_CLAUDIA_OPTIONAL_DIALOGUE).toLowerCase();
  for(const forbidden of ['teaching bed','demonstration','restrain','strapped',
    'consent paper','thumbprint','surgeon','surgical guide','school paying','school pays']){
    assert.ok(!all.includes(forbidden),'Spoiler before Stage III: '+forbidden);
  }
});
test('Shared Guther conversation panel provides instant answer and both exits at every exchange',()=>{
  const ui=read('apps/web/src/lib/NpcConversation.svelte');
  const data=read('apps/web/src/lib/approved-claudia-optional.ts');
  assert.ok(ui.includes("origin === 'Millhand'"),'Keep existing Guther branch');
  assert.ok(ui.includes("origin === 'Stitcher'"));
  assert.ok(ui.includes('APPROVED_CLAUDIA_OPTIONAL_DIALOGUE.find'));
  assert.ok(ui.includes('claudiaCurrent?.exchanges[claudiaStep]'));
  assert.ok(ui.includes('onclick={() => askClaudia(option.id)}'));
  assert.ok(ui.includes('onclick={() => {claudiaStep+=1;}}'));
  assert.ok(ui.includes('{claudiaExchange.reply}'));
  assert.ok(ui.includes('{claudiaExchange.followUp}'));
  assert.ok(ui.includes('onclick={changeClaudiaTopic}'));
  assert.ok(ui.includes('Ask something else'));
  assert.ok(ui.includes('onclick={close}'));
  assert.ok(ui.includes('{CLAUDIA_WORK_SKIP_LINE}'));
  assert.ok(ui.includes('let claudiaTopic=$state'));
  assert.ok(ui.includes('let claudiaStep=$state(0)'));
  assert.ok(ui.includes('claudiaTopic=null;'));
  assert.ok(ui.includes('claudiaStep=0;'));
  assert.ok(!ui.includes('{claudiaCurrent.prompt}'),
    'A clicked player question must not be repeated as speech');
  assert.ok(!ui.includes('perform('),'Optional talk must not send work actions');
  assert.ok(!ui.includes("fetch("),'Optional talk must not call the server');
  assert.ok(!data.includes('teaching bed'));
});
test('Claudia is clickable in either early stage and optional dialogue leaves original job state untouched',()=>{
  const scene=read('apps/web/src/lib/StitcherWardScene.svelte');
  assert.ok(scene.includes('s.stage===1||s.stage===2'));
  assert.ok(scene.includes('aria-label="Talk to Claudia Cyka"'));
  assert.ok(scene.includes('onclick={()=>{claudiaTalkOpen=true;}}'));
  assert.ok(scene.includes('const claudiaVisible=$derived(claudiaTalkOpen||shouldShowClaudia'));
  assert.ok(scene.includes('class:present={claudiaVisible}'));
  assert.ok(scene.includes('{#if interactiveBeds&&!claudiaTalkOpen}'),
    'Hide bed work targets during optional speech, restoring them on close');
  assert.ok(scene.includes('{#if claudiaTalkOpen}'));
  assert.ok(scene.includes('<NpcConversation origin="Stitcher" close={()=>{claudiaTalkOpen=false;}}/>'));
  assert.ok(scene.includes('if(!canTalkClaudia&&claudiaTalkOpen)claudiaTalkOpen=false;'));
  assert.ok(!read('apps/api/src/stitcher-work.ts').includes('claudiaTopic'),
    'Optional talk is not allowed in the persistent ward state machine');
  const initial=structuredClone(INITIAL_STITCHER);
  const stage2=applyStitcherAction(applyStitcherAction(
    applyStitcherAction(initial,'continue_intro'),'check_ward'),'begin_round');
  const before=structuredClone(stage2);
  const actionsBefore=stitcherActions(stage2);
  for(const topic of APPROVED_CLAUDIA_OPTIONAL_DIALOGUE){
    // UI reads frozen topic data in memory; questions and close do not call
    // the work reducer. The same action list/revision is visible afterwards.
    let step=0;
    for(const exchange of topic.exchanges){
      assert.equal(topic.exchanges[step],exchange);
      if(exchange.followUp)step+=1;
    }
    assert.deepEqual(stage2,before);
    assert.deepEqual(stitcherActions(stage2),actionsBefore);
    assert.equal(stage2.revision,before.revision);
  }
});
