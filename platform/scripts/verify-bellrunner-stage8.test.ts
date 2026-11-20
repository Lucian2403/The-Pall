import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {majorSkillDisplayLevel} from '../apps/web/src/lib/major-skill-display.ts';
import {initial,advance,view,HOME_ID,CLOSING_SPEECH,RENT} from '../apps/api/src/shared-home-state.ts';

const read=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Bellrunner secondary Major Skill +1 is saved in Stage III and visibly above provisional baseline',()=>{
 const src=read('apps/api/src/bellrunner-wrong-bell-routes.ts');
 const skill=read('apps/api/src/bellrunner-wrong-bell-work.ts');
 const display=read('apps/web/src/lib/major-skill-display.ts');
 for(const [branch,major] of [['contracts','Commerce'],['trauma','Medicine'],['machinery','Mechanics']] as const){
  assert.ok(skill.includes(branch+":'"+major+"'"),'Missing branch Major Skill: '+branch);
  assert.equal(majorSkillDisplayLevel('Bellrunner',major,{Industry:3,[major]:1}),2);
  assert.equal(majorSkillDisplayLevel('Bellrunner',major,{Industry:3}),1);
 }
 assert.equal(majorSkillDisplayLevel('Bellrunner','Industry',{Industry:3,Mechanics:1}),3);
 assert.equal(majorSkillDisplayLevel('Millhand','Craftsmanship',{Craftsmanship:3,Industry:1}),3);
 assert.equal(majorSkillDisplayLevel('Millhand','Industry',{Craftsmanship:3,Industry:1}),2);
 assert.equal(majorSkillDisplayLevel('Bellrunner','Mechanics',{Industry:3,Mechanics:1}),2);
 assert.equal(majorSkillDisplayLevel('Bellrunner','Medicine',{Industry:3,Medicine:1}),2);
 assert.equal(majorSkillDisplayLevel('Bellrunner','Commerce',{Industry:3,Commerce:1}),2);
 assert.equal(majorSkillDisplayLevel('Bellrunner','Arms',{Industry:3,Mechanics:1}),1);
 assert.ok(src.includes('character.major_skill_bonuses[key]=priorLevel+1'));
 assert.ok(src.includes('if(!current.branch&&next.branch)'));
 assert.ok(display.includes('BELLRUNNER_ROUTE_MAJORS'));
 assert.ok(!read('apps/api/src/tutorial-home-routes.ts').includes('major_skill_bonuses='),
   'Stage VIII never reawards or changes saved skills');
});
test('Hauling I is a Bellrunner starting specialization preview, never a made-up persisted rank',()=>{
 const web=read('apps/web/src/lib/CharacterSkills.svelte');
 assert.match(web,/origin==='Bellrunner'&&major==='Industry'&&skill==='Hauling'/);
 assert.match(web,/majorSkillBonuses\.Industry\?\?0\)>=3/);
 assert.match(web,/return startingSpecialization\(major,skill\)\?'I · starting':'—'/);
 assert.match(web,/rank not persisted in the current character API/);
 assert.match(web,/origin==='Millhand'&&major==='Craftsmanship'&&skill==='Smithing'/);
 assert.match(web,/Roman I–IV specializations are planned/);
 assert.ok(!read('apps/api/src/tutorial-home-routes.ts').includes('specialization'));
});
test('Both backgrounds share exact rented-room notice, rent, closing speech and phase mechanics',()=>{
 for(const [origin,branch] of [
   ['Millhand','restamp'],['Bellrunner','contracts'],
   ['Bellrunner','trauma'],['Bellrunner','machinery']
 ] as const){
  let state=initial(origin,branch,'player_victory');
  assert.equal(state.homeId,HOME_ID);
  assert.equal(state.origin,origin);
  assert.equal(state.branch,branch);
  assert.equal(view(state,'Courier',10).rent,RENT);
  assert.equal(view(state,'Courier',10).shortfall,140);
  assert.equal(view(state,'Courier',10).closingSpeech,CLOSING_SPEECH);
  assert.equal(view(state,'Courier',10).noticeText,
    'Courier, you have to pay 150 coins in rent, or you are out. No discussion.');
  for(const [action,phase] of [['read_notice','NOTICE'],['put_down','SPEECH'],['finish','COMPLETE']] as const){
    state=advance(state,action);
    assert.equal(state.phase,phase);
  }
  assert.equal(view(state,'Courier',10).completed,true);
 }
});
test('Bellrunner Stage VIII retains home artwork and uses the shared character-specific journal',()=>{
 const api=read('apps/api/src/tutorial-home-routes.ts');
 const web=read('apps/web/src/routes/characters/[id]/home/+page.svelte');
 const clinic=read('apps/web/src/lib/SharedTutorialClinic.svelte');
 const home=read('apps/web/src/lib/CharacterHome.svelte');
 const rewind=read('apps/api/src/millhand-stage-rewind-routes.ts');
 const shell=read('apps/web/src/lib/TutorialShell.svelte');
 assert.ok(api.includes("!['Millhand','Bellrunner'].includes(c.origin)"));
 assert.ok(api.includes('player_character_bellrunner_wrong_bell'));
 assert.ok(api.includes('player_character_bellrunner_second_job'));
 assert.ok(api.includes("chosen?.phase!=='committed'||second?.phase!=='exited'"));
 assert.ok(api.includes("chosen.branch!==second.branch"));
 assert.ok(api.includes('player_character_tutorial_home_receipts'));
 assert.ok(clinic.includes("if(action==='leave'&&result.phase==='LEFT')"));
 assert.ok(clinic.includes("await goto('/characters/'+encodeURIComponent(id)+'/home')"));
 assert.ok(home.includes("character.origin==='Bellrunner'&&character.tutorial.stage===8"));
 assert.ok(web.includes("url('/locations/home/rented-room.webp')"));
 assert.ok(web.includes('src="/locations/home/notice.webp"'));
 assert.ok(web.includes("home.origin==='Bellrunner'?'Bellrunner opening complete.'"));
 assert.ok(web.includes("homeJournalIntroText(home.origin as 'Millhand'|'Bellrunner')"));
 assert.ok(read('apps/web/src/lib/home-journal-copy.ts').includes("origin==='Bellrunner'"));
 assert.ok(web.includes("title:'Rented Home',entries:home.completed?[]:[homeJournalIntro]"));
 assert.ok(web.includes("journalController={{id:'home-journal'"));
 assert.ok(shell.includes('<PersonalJournal characterId={character.id}'));
 assert.ok(shell.includes('character.id'));
 assert.ok(!web.includes('id="home-journal"'),
   'Home must not create a second competing Journal overlay');
 assert.ok(web.includes('class="hotspot bed"'));
 assert.ok(web.includes('class="hotspot chest"'));
 assert.ok(web.includes('class="hotspot book"'));
 assert.ok(web.includes('class="hotspot notice-object"'));
 assert.ok(rewind.includes("const homeExists=await client.query("));
 assert.ok(rewind.includes("if(stage===8)"));
 assert.ok(rewind.includes("return {enabled:true,canRewind:!!canRewind,stage,targetStage:canRewind?7:null}"));
 assert.ok(rewind.includes("(bellrunner?'bellrunner':'millhand')+'/clinic'"));
 assert.ok(shell.includes("rewindTargetStage===6"));
});
