import {strict as assert} from 'node:assert';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');

const hud=read('apps/web/src/lib/TutorialShell.svelte');
const home=read('apps/web/src/lib/CharacterHome.svelte');
const audio=read('apps/web/src/lib/pall-audio.ts');
const settings=read('apps/web/src/lib/PallAudioControls.svelte');
const opening=read('apps/web/src/lib/WorkshopScene.svelte');
const work=read('apps/web/src/lib/MillhandWorkScene.svelte');
const missing=read('apps/web/src/lib/MillhandMissingStampScene.svelte');
const depot=read('apps/web/src/lib/MillhandDepotScene.svelte');
const mainLayout=read('apps/web/src/routes/+layout.svelte');

// UI state is provisional until the saved character/Flint combat API supplies
// the actual value; genuine measured values always override the 100/100
// starting display, and Health is never fabricated or arbitrarily clipped.
assert.ok(hud.includes("staminaShown=$derived(isMeasured(character.stamina)") &&
  hud.includes("?character.stamina:{current:100,maximum:100}") &&
  hud.includes("data:staminaShown") &&
  hud.includes("data:character.health") &&
  hud.includes("style={'width:'+percentage(resource.data)+'%'}") &&
  hud.includes("class={'meter-fill '+resource.id}") &&
  hud.includes("aria-valuenow={Math.min(resource.data.current,resource.data.maximum)}") &&
  hud.includes("Provisional full stamina; future combat data will replace this value") &&
  home.includes("formatted(character.stamina??{current:100,maximum:100})") &&
  home.includes("provisional:!isMeasured(character.stamina)"),
  'Health and stamina must have truthful tracked values or an explicit provisional starting baseline');
assert.ok(hud.includes('background:linear-gradient(180deg,#648e60,#315c39 52%,#183b2b)') &&
  hud.includes('background:linear-gradient(180deg,#d65b47,#9e2e23 58%,#651b17)') &&
  hud.includes('inset:4px 9px') &&
  hud.includes("url('/ui-kit/resources/bar-empty.png')") &&
  hud.includes('grid-template-columns:repeat(2,minmax(0,1fr))') &&
  hud.includes('class="minor-resources"') &&
  hud.includes('class="resource-cluster"'),
  'HUD must keep two prominent fully filled owner-framed gauges and compact minor resource indicators');
assert.ok(hud.includes("romanStages=['—','I','II','III','IV','V','VI','VII','VIII']") &&
  hud.includes('{introStage} / VIII') &&
  hud.includes('<PallAudioControls/>') &&
  hud.includes('class="stat coin-stat"') &&
  hud.includes('class="account-link"') &&
  hud.includes('@media(max-width:1270px)') &&
  hud.includes('@media(max-width:760px)'),
  'Keep original identity, coin, sound, account and Introduction progress in a responsive header');

// The new ambience is looping, with a separate persisted slider, and plays
// ONLY when a workshop-art component actually claims it.
assert.ok(audio.includes("smithingAmbienceFile='smithing-workshop-ambience.mp3'") &&
  audio.includes('ambienceVolume:0.3') &&
  audio.includes('ambience.loop=true') &&
  audio.includes('ambience.preload=\'auto\'') &&
  audio.includes('smithingAmbienceOwners=new Set<symbol>()') &&
  audio.includes('export function claimSmithingWorkshopAmbience()') &&
  audio.includes('smithingAmbienceOwners.delete(owner)') &&
  audio.includes('smithingAmbienceOwners.size>0') &&
  audio.includes('sceneActive && unlocked && settings.ambienceVolume>0') &&
  audio.includes('if(smithingAmbienceOwners.size===0)stopAmbience(true)') &&
  audio.includes("if(document.hidden)") &&
  audio.includes('stopAmbience(true)') &&
  audio.includes('startAmbience();') &&
  mainLayout.includes("setPallAudioScene(/^\\/characters\\/[^/]+(?:\\/|$)/.test(page.url.pathname))"),
  'Ambience must require a visible Smithing Workshop, respect autoplay/tab visibility and stop on navigation');
assert.ok(audio.includes("ambienceVolume:typeof next.ambienceVolume==='number'") &&
  audio.includes("clamp(next.ambienceVolume,0,1)") &&
  audio.includes('window.localStorage.setItem(KEY') &&
  audio.includes('window.localStorage.getItem(KEY') &&
  audio.includes('MAX_MUSIC_VOLUME=0.5') &&
  settings.includes('const MAX_MUSIC_VOLUME=0.5') &&
  settings.includes('Workshop ambience volume') &&
  settings.includes('aria-label="Sound effects volume"') &&
  settings.includes('aria-label="Background music volume"'),
  'Master mute and three distinct volume sliders must persist without reducing the owner music maximum');
for(const scene of [opening,work,missing]){
  assert.ok(scene.includes("onMount(claimSmithingWorkshopAmbience)") &&
    scene.includes("import {claimSmithingWorkshopAmbience} from '$lib/pall-audio'"),
    'One Smithing Workshop scene lacks ambient sound ownership');
}
assert.ok(home.includes("onMount(()=>character.origin==='Millhand'?claimSmithingWorkshopAmbience():undefined)") &&
  depot.includes("if(atWorkshop)return claimSmithingWorkshopAmbience();"),
  'Origin-workshop portrait and the Stage 4 preparation phase must use ambience only while workshop artwork is visible');
assert.ok(!audio.includes("music.loop=true") &&
  audio.includes("music.loop=false") &&
  audio.includes('MUSIC_PAUSE_MIN_MS=30_000') &&
  audio.includes('context.createBufferSource()'),
  'Do not change the independent music-rest or low-latency UI SFX contracts');

// Exact original-owner encoded audio; do not silently substitute a different
// ambience version or a huge browser-unfriendly WAV file.
const filename='apps/web/static/audio/the-pall/smithing-workshop-ambience.mp3';
const filepath=resolve(root,filename);
assert.ok(existsSync(filepath),
  'Smithing ambience MP3 missing. Extract ThePall_Smithing_Ambience_Browser_Patch.zip into platform/ and commit its audio asset.');
const bytes=readFileSync(filepath);
assert.equal(bytes.length,1610828,'Unexpected ambience MP3 size');
assert.equal(createHash('sha256').update(bytes).digest('hex'),
  'aa769bc0aa3a480bdaa56153be231bb735fa949b055c24aa7e25330a55dc38e4',
  'Ambience MP3 changed; verify against the approved owner recording');
assert.ok(bytes.toString('ascii',0,3)==='ID3'||bytes[0]===0xff,
  'The browser ambience asset must be a valid MP3');
console.log('PASS: industrial HUD, provisional tracked stamina, owner music max, claimed workshop-only looping ambience and original audio asset.');
