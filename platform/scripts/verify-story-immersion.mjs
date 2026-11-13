/** Narrative UI must not leak tutorial debug ledgers into player dialogue.
 *
 * Skill/coin/XP state is enforced by the game server and shown in dedicated
 * character/HUD systems. The prose panels should show dialogue, physical
 * evidence, and diegetic task outcomes, never implementation notes.
 *
 * This scans all existing and newly authored Svelte narrative scenes.
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';

const root=resolve(import.meta.dirname,'../apps/web/src');
const lib=join(root,'lib');
const characterRoutes=join(root,'routes/characters');
function allSvelte(folder){
  return readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
    const name=join(folder,entry.name);
    if(entry.isDirectory())return allSvelte(name);
    return entry.isFile()&&entry.name.endsWith('.svelte')?[name]:[];
  });
}
const scenes=[
  ...allSvelte(lib).filter(f=>f.endsWith('Scene.svelte')),
  ...allSvelte(characterRoutes).filter(f=>f.endsWith('+page.svelte'))
];
const banned=[
  [/Major Skill increased\s*:/i,'reward ledger in dialogue'],
  [/Major Skill received\s*\+\s*1/i,'route skill receipt in dialogue'],
  [/Ordinary XP\s*:\s*\d+/i,'numeric XP ledger in dialogue'],
  [/No wages, ordinary XP or personal inventory items are awarded/i,
    'debug payout disclaimer in dialogue'],
  [/No wages or inventory items are awarded here/i,
    'debug reward disclaimer in dialogue'],
  [/No additional skill level or tutorial wage is awarded/i,
    'debug Stage 4 reward summary'],
  [/Your choice is recorded\. The work continues/i,
    'internal progress summary in dialogue'],
  [/Stage \d+.*not implemented yet\. Your.*progress is saved/i,
    'implementation placeholder in dialogue'],
  [/Route:\s*\{branchCopy\.label\}/i,
    'debug route choice recap in dialogue'],
  [/Stage 4 complete<\/strong>/i,
    'technical stage completion box in dialogue']
];
const failures=[];
for(const path of scenes){
  const source=readFileSync(path,'utf8');
  // Restrict checks to text markup. TypeScript game state, UI styles and
  // comments may legitimately describe non-awards or schema status.
  const markup=source.slice(source.indexOf('</script>')+9,source.lastIndexOf('<style>')>=0
    ?source.lastIndexOf('<style>'):undefined);
  for(const [pattern,why] of banned){
    if(pattern.test(markup))failures.push(path.replace(root+'/','')+': '+why);
  }
}
assert.ok(scenes.length>=18,'Narrative scene scan did not execute');
assert.deepEqual(failures,[],failures.join('\n'));

const bell=readFileSync(join(root,
  'routes/characters/[id]/bellrunner/wrong-bell/+page.svelte'),'utf8');
const hand=readFileSync(join(lib,'MillhandMissingStampScene.svelte'),'utf8');
const stage4=readFileSync(join(lib,'BellrunnerSecondJobScene.svelte'),'utf8');
assert.ok(bell.includes("if(committedBeat===0)committedBeat=1;")&&
  bell.includes("else void goto('/characters/'+encodeURIComponent(id)+'/bellrunner/second-job')"),
  'Bellrunner Stage 3 must leave from the final approved story beat');
assert.ok(!bell.includes('committedBeat<2')&&!bell.includes('round-finding'),
  'No third post-choice result screen is permitted');
assert.ok(hand.includes('branchCopy.response')&&hand.includes('branchCopy.consequence'),
  'Keep the real Millhand NPC response and narrative consequence');
assert.ok(stage4.includes("{copy.done}")&&
  stage4.includes('The outside service gate stands ahead.'),
  'Stage 4 concludes with narrative, not a reward/technical recap');
console.log('PASS: '+scenes.length+
  ' narrative scenes have no post-choice debug ledgers; Story Continue leads directly onward.');
