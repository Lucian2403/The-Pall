import {strict as assert} from 'node:assert';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const audio=read('apps/web/src/lib/pall-audio.ts');
const shell=read('apps/web/src/lib/TutorialShell.svelte');
const controls=read('apps/web/src/lib/PallAudioControls.svelte');
const layout=read('apps/web/src/routes/+layout.svelte');
const skills=read('apps/web/src/lib/CharacterSkills.svelte');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const workshop=read('apps/web/src/lib/MillhandWorkScene.svelte');
const workRoute=read('apps/web/src/routes/characters/[id]/millhand/work/+page.svelte');
const scene=read('apps/web/src/lib/WorkshopScene.svelte');

const expected=new Map([
  ['music-theme.mp3',['d83cc434c854dbae2a5d9f4f1c56d2401e59100afdb374fc505eaf425c85e0d0',7152527]],
  ['UI_ClickMain.wav',['df0bb5f2f76534c1ca0e410068789e0827e6bf5b5b36b4636c73f0f92e3a026f',88504]],
  ['UI_Click.wav',['4df1538ce38adedb43c87df9e36b187919ed1bd6c4847e51c356ee5f7fc509fc',42448]],
  ['UI_Click02.wav',['8efc2a80fe1a3e0cce1a0a6e5b5d21f2262b05ed25bd60079c3ba148612c9e6a',57806]],
  ['UI_PaperJournal.wav',['90d871d9e273bef1009054666ce4ab150182a35eee07d1567ffa973b6f2769b1',212018]],
  ['UI_PaperJournal2.wav',['f78480f67376a1737aa92e6343b8532cc21a5906c92d1b4179d2d0e8c2624f1b',242738]],
  ['UI-SmithingAction.wav',['ab8fce9970347c716e86a2d4b420ad1b825f5b0bc36172b2b5f8c58bc19b06c6',260998]],
  ['UI-SmithingAction02.wav',['1c483a03f5c1051f080a234ab83d805738c8140d72400ebdb8c6d2ad9b8d4d41',245632]]
]);

for(const [name,[sha,size]] of expected){
  const file=resolve(root,'apps/web/static/audio/the-pall',name);
  assert.ok(existsSync(file),
    'Missing or outdated sound: '+name+'. Extract ThePall_SFXBase02_Changed_Files_Patch.zip into platform/ and commit the four revised assets.');
  const bytes=readFileSync(file);
  assert.equal(bytes.length,size,'Unexpected sound file size: '+name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),sha,
    'Sound changed unexpectedly; inspect the owner WAV or MP3 source: '+name);
  assert.ok(name.endsWith('.mp3')
    ? bytes.toString('ascii',0,3)==='ID3'||bytes[0]===0xff
    : bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WAVE',
    'Invalid browser audio format: '+name);
}
assert.ok(audio.includes('musicVolume:0.06') &&
  audio.includes('PREVIOUS_DEFAULT_MUSIC=0.035') &&
  audio.includes('parsed.musicVolume===PREVIOUS_DEFAULT_MUSIC') &&
  audio.includes('MUSIC_PAUSE_MIN_MS=30_000') &&
  audio.includes('MUSIC_PAUSE_RANGE_MS=45_000') &&
  audio.includes('FADE_IN=4') &&
  audio.includes('FADE_OUT=5') &&
  audio.includes('music.loop=false') &&
  audio.includes("musicFile='music-theme.mp3'"),
  'Theme must be quiet, fade at both ends and rest before replaying');
for(const [file,weight] of [['UI_ClickMain.wav',75],['UI_Click.wav',15],['UI_Click02.wav',10]]){
  assert.ok(audio.includes("file:'"+file+"',weight:"+weight),
    'Weighted click sample is missing: '+file);
}
assert.ok(audio.includes("const KEY='the-pall-audio-v1'") &&
  audio.includes('window.localStorage.setItem(KEY') &&
  audio.includes("if(!sceneActive)return;") &&
  audio.includes('if(unlocked)return;') &&
  audio.includes('document.hidden') &&
  audio.includes("if(kind==='paper')playPaperSfx()") &&
  audio.includes("if(kind==='smithing')playSmithingSfx()") &&
  audio.includes("index===0?0.65:0.47") &&
  audio.includes("file:'UI_Click.wav',weight:15,gain:0.24") &&
  audio.includes("file:'UI_Click02.wav',weight:10,gain:0.30"),
  'Audio must be gesture-gated, in-game scoped, saved and visibility-aware');
assert.ok(layout.includes('onMount(connectPallAudio)') &&
  layout.includes('setPallAudioScene(') &&
  shell.includes('<PallAudioControls/>') &&
  controls.includes('Background music volume') &&
  controls.includes('Sound effects volume'),
  'Persistent runtime and independent volume controls must be integrated');
for(const source of [skills,home,scene,workshop]){
  assert.ok(source.includes('data-pall-sfx='),'Missing contextual UI marker');
}
assert.ok(skills.includes('<summary data-pall-sfx="click">') &&
  !skills.includes('<summary data-pall-sfx="paper">'),
  'Expanding a skill must play the weighted mechanical click, not parchment');
assert.ok(home.includes("data-pall-sfx={character.origin==='Millhand'&&newArrival?'smithing':'click'}") &&
  home.includes('<a class="framed-action work-order-action" href={work.href}'),
  'Entering Millhand Stage 1 Smithing Workshop must play smithing SFX on its link, not a UI click');
// UI click latency regression: all seven short WAVs are fetched, decoded
// once, and then scheduled directly from Web Audio. Never create an HTML
// Audio element on a click; that reintroduces late network/decode latency.
assert.ok(audio.includes("const sfxBuffers=new Map<string,AudioBuffer>()") &&
  audio.includes("const sfxLoading=new Map<string,Promise<void>>()") &&
  audio.includes("const activeSources=new Set<AudioBufferSourceNode>()") &&
  audio.includes("new AudioContext({latencyHint:'interactive'})") &&
  audio.includes("fetch(base+filename,{cache:'force-cache'})") &&
  audio.includes("context.decodeAudioData(bytes)") &&
  audio.includes("context.createBufferSource()") &&
  audio.includes("context.createGain()") &&
  audio.includes("source.start(0,offset)") &&
  audio.includes("if(!context||!buffer||activeSources.size>=7)return") &&
  audio.includes("if(context?.state==='suspended')void context.resume()") &&
  audio.includes("const offset=filename==='UI_Click02.wav'?Math.min(0.075,buffer.duration*0.5):0") &&
  audio.includes("if(active){\n    prepareSoundEffects();") &&
  audio.includes("function stopSoundEffects()") &&
  audio.includes("stopSoundEffects();") &&
  !audio.includes("new Audio(base+filename)") &&
  !audio.includes("activeClips") &&
  audio.includes("new Audio(base+musicFile)"),
  'Web Audio SFX must be predecoded and played without per-click loading');

assert.ok(workRoute.includes('playSmithingSfx();') &&
  workRoute.indexOf('if(response.ok){') < workRoute.indexOf('playSmithingSfx();') &&
  workRoute.includes("if(action==='stamp_number'||action==='straighten'||action==='fix_mark')") &&
  workshop.includes("action==='stamp_number'||action==='straighten'||action==='fix_mark'"),
  'Smithing sounds only after server-confirmed actions, never on failed work');
console.log('PASS: owner SFXBase02, 6% music, cached Web Audio SFX, immediate click scheduling, trimmed Click02 onset, original owner volumes, skill/workshop routing.');
