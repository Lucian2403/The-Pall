import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {
  initialDogman,advanceDogman,availableDogmanActions,InvalidDogmanAction,
  DOGMAN_PAPERS_LENGTH,DOGMAN_REPLY_LENGTH,DOGMAN_GATE_LENGTH,DOGMAN_DEMAND_LENGTH
} from '../apps/api/src/bellrunner-dogman-work.ts';
import type {DogmanReply,DogmanAction} from '../apps/api/src/bellrunner-dogman-work.ts';
import {
  DOGMAN_ARRIVAL,DOGMAN_PAPERS,DOGMAN_DEMAND,DOGMAN_GATE,DOGMAN_ANSWERS,
  DOGMAN_ACTION_LABELS,DOGMAN_ASSETS,dogmanLine,dogmanJournal
} from '../apps/web/src/lib/bellrunner-dogman-copy.ts';

const branches=['contracts','trauma','machinery'] as const;
const responses=['ask_orders','keep_sheet','tell_him'] as const;
const stances=['step_street','use_cart','protect_bag'] as const;
function continueUntilChoice(branch:typeof branches[number]){
  let s=initialDogman(branch);
  assert.equal(s.phase,'arrival');
  assert.equal(dogmanLine(s)?.speaker,'Narration');
  assert.equal(dogmanLine(s)?.text,DOGMAN_ARRIVAL.text);
  assert.deepEqual(availableDogmanActions(s),['continue']);
  s=advanceDogman(s,'continue');
  assert.equal(s.phase,'papers');
  assert.equal(dogmanLine(s)?.text,DOGMAN_PAPERS[0]?.text);
  for(let i=0;i<DOGMAN_PAPERS_LENGTH-1;i++){
    assert.deepEqual(availableDogmanActions(s),['continue']);
    assert.equal(dogmanLine(s)?.text,DOGMAN_PAPERS[i]?.text);
    s=advanceDogman(s,'continue');
  }
  assert.equal(dogmanLine(s)?.text,DOGMAN_PAPERS.at(-1)?.text);
  assert.deepEqual(availableDogmanActions(s),responses);
  return s;
}

test('all 3 Dogman routes and all 9 reply/stance combinations are persisted honestly',()=>{
  for(const branch of branches){
    for(const reply of responses){
      for(const stance of stances){
        let s=continueUntilChoice(branch);
        const revision=s.revision;
        s=advanceDogman(s,reply);
        assert.equal(s.revision,revision+1);
        assert.equal(s.reply,reply);
        assert.equal(s.phase,'reply');
        const lines=reply==='tell_him'?DOGMAN_ANSWERS.tell_him[branch]:DOGMAN_ANSWERS[reply];
        assert.equal(lines.length,DOGMAN_REPLY_LENGTH[reply as DogmanReply]);
        for(let i=0;i<lines.length;i++){
          assert.equal(dogmanLine(s)?.text,lines[i].text);
          s=advanceDogman(s,'continue');
        }
        assert.equal(s.phase,'demand');
        for(let i=0;i<DOGMAN_DEMAND_LENGTH;i++){
          assert.equal(dogmanLine(s)?.text,DOGMAN_DEMAND[i]?.text);
          s=advanceDogman(s,'continue');
        }
        assert.equal(s.phase,'gate');
        for(let i=0;i<DOGMAN_GATE_LENGTH-1;i++){
          assert.equal(dogmanLine(s)?.text,DOGMAN_GATE[i]?.text);
          s=advanceDogman(s,'continue');
        }
        assert.equal(dogmanLine(s)?.text,DOGMAN_GATE.at(-1)?.text);
        assert.deepEqual(availableDogmanActions(s),stances);
        assert.throws(()=>advanceDogman(s,'continue'),InvalidDogmanAction);
        const finished=advanceDogman(s,stance);
        assert.equal(finished.phase,'done');
        assert.equal(finished.stance,stance==='step_street'?'street':stance==='use_cart'?'cart':'defend');
        assert.equal(finished.branch,branch);
        assert.equal(finished.reply,reply);
        assert.deepEqual(availableDogmanActions(finished),[]);
        assert.throws(()=>advanceDogman(finished,stance),InvalidDogmanAction);
        assert.match(dogmanJournal(finished).at(-1)??'',/fight hasn't been settled/);
        assert.deepEqual(JSON.parse(JSON.stringify(finished)),finished,'state must survive JSON save/resume');
      }
    }
  }
});
test('Dogman cannot claim information not volunteered in the selected branch',()=>{
  for(const branch of branches){
    const without=continueUntilChoice(branch);
    assert.doesNotMatch(dogmanJournal(without).join(' '),/mechanic|infirmary|workers marked absent/);
    const told=advanceDogman(without,'tell_him');
    assert.equal(dogmanLine(told)?.text,DOGMAN_ANSWERS.tell_him[branch][0].text);
    const journal=dogmanJournal(told).join(' ');
    const exclusive=branch==='contracts'?/marked absent/
      :branch==='trauma'?/infirmary/:/mechanic/;
    assert.match(journal,exclusive);
  }
});
test('arrival introduces the passage before Dogman appears; one Continue reveals the existing first line',()=>{
  const intro=initialDogman('machinery');
  assert.match(DOGMAN_ARRIVAL.text,/turn back toward the public street/);
  assert.match(DOGMAN_ARRIVAL.text,/worksite hands call him Dogman/);
  assert.equal(dogmanLine(intro)?.text,DOGMAN_ARRIVAL.text);
  assert.deepEqual(availableDogmanActions(intro),['continue']);
  const after=advanceDogman(intro,'continue');
  assert.equal(after.phase,'papers');
  assert.equal(after.line,0);
  assert.equal(after.revision,1);
  assert.equal(dogmanLine(after)?.text,DOGMAN_PAPERS[0]?.text);
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerDogmanScene.svelte',
    import.meta.url),'utf8');
  assert.match(scene,/state.phase!=='arrival'/);
  assert.match(scene,/\{#if dogmanVisible\}/);
  assert.match(scene,/The Service Passage/);
});
test('Dogman approved dialogue is preserved and actions are non-aggressive',()=>{
  const canon=readFileSync(new URL('../../docs/05-gameplay/onboarding/bellrunner/dogman-confrontation.md',
    import.meta.url),'utf8');
  for(const line of [...DOGMAN_PAPERS,...DOGMAN_DEMAND,...DOGMAN_GATE,
    ...DOGMAN_ANSWERS.ask_orders,...DOGMAN_ANSWERS.keep_sheet,
    ...branches.flatMap(branch=>DOGMAN_ANSWERS.tell_him[branch])]){
    assert.ok(canon.includes(line.text),'Exact approved spoken/narrated beat missing from canon: '+line.text);
  }
  for(const label of [
    'Ask to see his orders','Keep hold of the route sheet','Tell him what happened',
    'Step back toward the open street','Move behind the work cart',
    'Stand your ground and protect the bag'
  ])assert.ok(Object.values(DOGMAN_ACTION_LABELS).includes(label));
  const api=readFileSync(new URL('../apps/api/src/bellrunner-dogman-routes.ts',import.meta.url),'utf8');
  assert.match(api,/second_job_not_complete/);
  assert.match(api,/player_character_bellrunner_second_job/);
  assert.match(api,/branch_mismatch/);
  assert.match(api,/request_hash/);
  assert.match(api,/stale_revision/);
  assert.match(api,/expectedRevision/);
  assert.match(api,/tutorial_stage=\$2/);
  assert.doesNotMatch(api,/major_skill_bonuses\s*=/);
  assert.match(api,/tutorialPayout:\{coins:0,ordinaryXp:0,items:0\}/);
});
test('exact owner-supplied Dogman and alley WebP images are committed; Flint ambience reused',()=>{
  const assets=[
    ['locations/bellrunner/industrial-alley.webp','5df6ce1421c5f9adcafc24ce3d7410255e4fa67c0e32f953765eb44ea557346d'],
    ['characters/dogman/dogman-standing.webp','de2a6eda8ad1193ff4c6af09994d0a063cf764ff4f95c5506196d8e8f3544806'],
    ['characters/dogman/dogman-defeated.webp','6df98b35502041f763fc3f180bbb6c88b7a42ac6999e4da48428c059ee2d73da']
  ] as const;
  for(const [path,hash] of assets){
    const file=new URL('../apps/web/static/'+path,import.meta.url);
    assert.ok(existsSync(file),'Missing owner-supplied Dogman asset '+path);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),hash,path);
  }
  assert.equal(DOGMAN_ASSETS.ambience,'/audio/the-pall/night-alley-ambience.mp3');
  const route=readFileSync(new URL('../apps/web/src/routes/characters/[id]/bellrunner/dogman/+page.svelte',
    import.meta.url),'utf8');
  assert.match(route,/alleyBackdrop=\{true\}/);
  assert.match(route,/BellrunnerDogmanScene/);
  const shell=readFileSync(new URL('../apps/web/src/lib/TutorialShell.svelte',import.meta.url),'utf8');
  assert.match(shell,/if\(alleyBackdrop\)return claimNightAlleyAmbience/);
  const scene=readFileSync(new URL('../apps/web/src/lib/BellrunnerDogmanScene.svelte',import.meta.url),'utf8');
  assert.match(scene,/DOGMAN_ASSETS.background/);
  assert.match(scene,/DOGMAN_ASSETS.standing/);
  assert.ok(!scene.includes('DOGMAN_ASSETS.defeated'),'Defeat sprite must not appear before combat');
  assert.match(scene,/registerSceneJournal/);
  assert.match(scene,/mode="scene"/);
});
