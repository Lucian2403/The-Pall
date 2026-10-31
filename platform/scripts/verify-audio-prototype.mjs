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
  ['UI_ClickMain.wav',['d0a27cdd11da60a941f34114c3a40a2c6f6921cce9a0b258f26ae73e4999dbc9',103864]],
  ['UI_Click.wav',['3063e11795d2c3a183d2634ec742aefacdb0d9c8d5ba83ce3aebe20c85472f2f',59618]],
  ['UI_Click02.wav',['8efc2a80fe1a3e0cce1a0a6e5b5d21f2262b05ed25bd60079c3ba148612c9e6a',57806]],
  ['UI_PaperJournal.wav',['9990c5c0401a95d2b0484732da4f3b062c86744cbe361e47b9c5e5ead6064bdc',142930]],
  ['UI_PaperJournal2.wav',['be2fcbffde74591d405769bc3df45750e3d1f2930f5ee828f00af4e426096ea8',258094]],
  ['UI-SmithingAction.wav',['ab8fce9970347c716e86a2d4b420ad1b825f5b0bc36172b2b5f8c58bc19b06c6',260998]],
  ['UI-SmithingAction02.wav',['1c483a03f5c1051f080a234ab83d805738c8140d72400ebdb8c6d2ad9b8d4d41',245632]]
]);

for(const [name,[sha,size]] of expected){
  const file=resolve(root,'apps/web/static/audio/the-pall',name);
  assert.ok(existsSync(file),
    'Missing owner sound: '+name+'. Extract ThePall_Audio_Assets_Prototype.zip into platform/ and commit all eight assets.');
  const bytes=readFileSync(file);
  assert.equal(bytes.length,size,'Unexpected sound file size: '+name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),sha,
    'Sound changed unexpectedly; inspect the owner WAV or MP3 source: '+name);
  assert.ok(name.endsWith('.mp3')
    ? bytes.toString('ascii',0,3)==='ID3'||bytes[0]===0xff
    : bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WAVE',
    'Invalid browser audio format: '+name);
}
assert.ok(audio.includes('musicVolume:0.035') &&
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
  audio.includes("if(kind==='paper')playPaperSfx()"),
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
assert.ok(workRoute.includes('playSmithingSfx();') &&
  workRoute.indexOf('if(response.ok){') < workRoute.indexOf('playSmithingSfx();') &&
  workRoute.includes("if(action==='stamp_number'||action==='straighten'||action==='fix_mark')") &&
  workshop.includes("action==='stamp_number'||action==='straighten'||action==='fix_mark'"),
  'Smithing sounds only after server-confirmed actions, never on failed work');
console.log('PASS: eight owner sounds, 7m27s compressed quiet theme, weighted clicks, contextual paper/hammer, settings and autoplay safety.');
