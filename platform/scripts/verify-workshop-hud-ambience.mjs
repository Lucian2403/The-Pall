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
const characterPage=read('apps/web/src/routes/characters/[id]/+page.svelte');
const openingPage=read('apps/web/src/routes/characters/[id]/opening/+page.svelte');
const workPage=read('apps/web/src/routes/characters/[id]/millhand/work/+page.svelte');
const missingPage=read('apps/web/src/routes/characters/[id]/millhand/missing-stamp/+page.svelte');
const depotPage=read('apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte');
const qaPage=read('apps/web/src/routes/__audio-qa/+page.svelte');

// UI state is provisional until the saved character/Flint combat API supplies
// the actual value; genuine measured values always override the 100/100
// starting display, and Health is never fabricated or arbitrarily clipped.
assert.ok(hud.includes("staminaShown=$derived(isMeasured(combatStamina)") &&
  hud.includes(":isMeasured(character.stamina)") &&
  hud.includes("?character.stamina:{current:100,maximum:100}") &&
  hud.includes("combatStamina?:{current:number;maximum:number}") &&
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
  hud.includes('container:pall-shell / inline-size') &&
  hud.includes('@container pall-shell (max-width:1039px)') &&
  hud.includes('@container pall-shell (max-width:599px)') &&
  hud.includes('@media(max-width:760px)'),
  'Keep original identity, coin, sound, account and Introduction progress in a responsive header that reflows by its real width');

// A single explicit shell backdrop contract avoids accidental playback on
// unrelated character pages. The audio player survives short scene remounts.
assert.ok(audio.includes("smithingAmbienceFile='smithing-workshop-ambience.mp3'") &&
  audio.includes('ambienceVolume:0.3') &&
  audio.includes('ambience.loop=true') &&
  audio.includes("ambience.preload='auto'") &&
  audio.includes('smithingAmbienceOwners=new Set<symbol>()') &&
  audio.includes('export function claimSmithingWorkshopAmbience()') &&
  audio.includes('export function stopSmithingWorkshopAmbience()') &&
  audio.includes('smithingAmbienceOwners.delete(owner)') &&
  audio.includes('smithingAmbienceOwners.size>0') &&
  audio.includes('sceneActive && unlocked && settings.ambienceVolume>0') &&
  audio.includes('WORKSHOP_TRANSITION_GRACE_MS=2400') &&
  audio.includes('if(smithingAmbienceOwners.size===0){') &&
  audio.includes('deferAmbienceDeparture()') &&
  audio.includes('cancelAmbienceDeparture()') &&
  audio.includes('deferAmbienceDeparture()') &&
  audio.includes('stopAmbience(true)') &&
  audio.includes('startAmbience();') &&
  mainLayout.includes('onMount(connectPallAudio)') &&
  !mainLayout.includes('setPallAudioScene(') &&
  mainLayout.includes('beforeNavigate(({to})=>') &&
  mainLayout.includes('stopSmithingWorkshopAmbience();') &&
  /onMount\(\(\)=>\{\s*setPallAudioScene\(true\);/.test(hud) &&
  hud.includes('return ()=>setPallAudioScene(false);') &&
  hud.includes('if(smithingBackdrop)return claimSmithingWorkshopAmbience()') &&
  hud.includes('stopSmithingWorkshopAmbience();') &&
  hud.includes('smithingBackdrop = false'),
  'Forge loop must be explicitly scene-scoped, continue through route handoffs, and stop on non-forge backdrops');
assert.ok(audio.includes("ambienceVolume:typeof next.ambienceVolume==='number'") &&
  audio.includes("clamp(next.ambienceVolume,0,1)") &&
  audio.includes('window.localStorage.setItem(KEY') &&
  audio.includes('window.localStorage.getItem(KEY') &&
  audio.includes('MAX_MUSIC_VOLUME=0.5') &&
  settings.includes('const MAX_MUSIC_VOLUME=0.5') &&
  settings.includes('Environmental ambience volume') &&
  settings.includes('aria-label="Sound effects volume"') &&
  settings.includes('aria-label="Background music volume"'),
  'Master mute and three distinct volume sliders must persist without reducing the owner music maximum');
// Scene images no longer register independent owners. The page supplying
// each illustrated backdrop declares the state directly to TutorialShell.
for(const scene of [opening,work,missing,depot,home]){
  assert.ok(!scene.includes('claimSmithingWorkshopAmbience'),
    'Independent scene owners can leak ambience into other backgrounds');
}
assert.ok(characterPage.includes("smithingBackdrop={character.origin==='Millhand'}") &&
  openingPage.includes("smithingBackdrop={character.origin==='Millhand'}") &&
  workPage.includes('smithingBackdrop={true}') &&
  missingPage.includes('smithingBackdrop={true}') &&
  depotPage.includes('smithingBackdrop={preparingAtWorkshop}') &&
  depotPage.includes("snapshot.state.phase==='COMPARE_DELIVERY'&&!travelConfirmed") &&
  depotPage.includes('depotBackdrop={showingDepot}') &&
  qaPage.includes('smithingBackdrop={forgeVisible && councilRoom===null && !alleyVisible}') &&
  qaPage.includes('councilBackdrop={councilRoom!==null && !alleyVisible}') &&
  qaPage.includes('alleyBackdrop={alleyVisible}') &&
  qaPage.includes('depotBackdrop={!forgeVisible && councilRoom===null && !alleyVisible}') &&
  depot.includes("class:preparing={atWorkshop}") &&
  depot.includes("state.phase==='CHECK_LOAD'||state.phase==='CHOOSE_TRANSPORT'"),
  'Only routes showing actual workshop artwork may request forge ambience');
assert.ok(audio.includes("councilOfficeAmbienceFile='contracts-scholarship-ambience.mp3'") &&
  audio.includes('export function claimCouncilOfficeAmbience()') &&
  audio.includes('export function stopCouncilOfficeAmbience()') &&
  audio.includes('councilAmbience.loop=true') &&
  audio.includes("activeAmbienceScene='council'") &&
  audio.includes('councilAmbienceOwners=new Set<symbol>()') &&
  audio.includes('cancelCouncilDeparture()') &&
  audio.includes('deferCouncilDeparture()') &&
  audio.includes('councilAmbience.load()') &&
  audio.includes('updateCouncilAmbience()') &&
  hud.includes('councilBackdrop = false') &&
  hud.includes('if(councilBackdrop)return claimCouncilOfficeAmbience()') &&
  hud.includes('stopCouncilOfficeAmbience()') &&
  depotPage.includes("councilBackdrop={snapshot.state.branch==='contracts'||snapshot.state.branch==='records'}") &&
  mainLayout.includes('stopCouncilOfficeAmbience();') &&
  settings.includes("Flint's alley and the medical clinic"),
  'Contracts and Scholarship must share one backdrop-scoped indoor loop without altering the forge or music');
const alleyPage=read('apps/web/src/routes/characters/[id]/millhand/wage-claim/+page.svelte');
const alleyScene=read('apps/web/src/lib/MillhandWageClaimScene.svelte');
assert.ok(audio.includes("nightAlleyAmbienceFile='night-alley-ambience.mp3'") &&
  audio.includes("activeAmbienceScene='alley'") &&
  audio.includes('alleyAmbienceOwners=new Set<symbol>()') &&
  audio.includes('export function claimNightAlleyAmbience()') &&
  audio.includes('export function stopNightAlleyAmbience()') &&
  audio.includes('alleyAmbience.loop=true') &&
  audio.includes('alleyAmbience.load()') &&
  audio.includes('cancelAlleyDeparture()') &&
  audio.includes('deferAlleyDeparture()') &&
  audio.includes('updateAlleyAmbience()') &&
  hud.includes('alleyBackdrop = false') &&
  hud.includes('if(alleyBackdrop)return claimNightAlleyAmbience()') &&
  hud.includes('stopNightAlleyAmbience()') &&
  alleyPage.includes('alleyBackdrop={true}') &&
  alleyScene.includes("url('/locations/alley/alley-background.webp')") &&
  !depotPage.includes('alleyBackdrop={true}') &&
  mainLayout.includes('stopNightAlleyAmbience();') &&
  qaPage.includes('alleyBackdrop={alleyVisible}'),
  'Night Alley must play only in the painted Stage 5/6 passage and stop in other locations');
assert.ok(audio.includes("depotAmbienceFile='depot-ambience.mp3'") &&
  audio.includes("activeAmbienceScene='depot'") &&
  audio.includes('depotAmbienceOwners=new Set<symbol>()') &&
  audio.includes('export function claimDepotAmbience()') &&
  audio.includes('export function stopDepotAmbience()') &&
  audio.includes('depotAmbience.loop=true') &&
  hud.includes('if(depotBackdrop)return claimDepotAmbience()') &&
  hud.includes('stopDepotAmbience()') &&
  depot.includes('confirmTravel()') &&
  !depot.includes('let travelConfirmed=$state(false)') &&
  mainLayout.includes('stopDepotAmbience();'),
  'Depot ambience must follow the painted backdrop, including local travel confirmation');
assert.ok(!audio.includes("music.loop=true") &&
  audio.includes("music.loop=false") &&
  audio.includes('MUSIC_PAUSE_MIN_MS=30_000') &&
  audio.includes('context.createBufferSource()'),
  'Do not change the independent music-rest or low-latency UI SFX contracts');

// These controls must affect real playback, not only update slider
// labels. In particular, a pointer drag alone must be a playback gesture,
// and the ambience player must never be reloaded on every scene remount.
assert.ok(audio.includes("document.addEventListener('pointerdown',gesture,true)") &&
  audio.includes("document.addEventListener('keydown',gesture,true)") &&
  audio.includes("document.removeEventListener('pointerdown',gesture,true)") &&
  audio.includes("document.removeEventListener('keydown',gesture,true)") &&
  audio.includes("track.volume=clamp(settings.ambienceVolume,0,1)") &&
  audio.includes("music.volume=canPlayMusic()?clamp(settings.musicVolume,0,MAX_MUSIC_VOLUME)*envelope:0") &&
  audio.includes("volume.gain.value=clamp(settings.sfxVolume*gain,0,1)") &&
  audio.split('ambience.load()').length===2 &&
  audio.includes('export const pallAudioPlayback=writable') &&
  audio.includes('export async function previewPallEffect()') &&
  settings.includes('{$pallAudioPlayback.music}') &&
  settings.includes('{$pallAudioPlayback.ambience}') &&
  settings.includes('{$pallAudioPlayback.effects}') &&
  settings.includes('onclick={previewPallEffect}'),
  'Music, Ambience and Effects must use live volume gain, gesture unlock and observable playback state');

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
