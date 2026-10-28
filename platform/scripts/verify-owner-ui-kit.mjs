/**
 * Verify presence and source wiring of the owner's UI kit installed from
 * their original ZIP. This checks local files; it does NOT download, package
 * or redistribute proprietary fonts.
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const staticRoot=resolve(root,'apps/web/static/ui-kit');
const files=[
  'branding/logo-compact.png',
  'branding/logo-full.png',
  'resources/TheCityVista.png',
  'resources/bar-empty.png',
  'resources/hp-fill.png',
  'sidebar-illustration.png',
  'frames/dialogue-frame-trim.png',
  'buttons/button-normal-trim.png',
  'buttons/button-hover-trim.png',
  'buttons/button-pressed-trim.png',
  'fonts/new-standard-regular.woff2',
  'fonts/beyond-wonderland.ttf',
  'licenses/NEW-STANDARD-OFL.txt',
  'licenses/BEBAS-NEUE-OFL.txt',
  'licenses/BEYOND-WONDERLAND-LICENSE.txt'
];
const missing=files.filter(file=>!existsSync(resolve(staticRoot,file)));
if(missing.length){
  console.error('Missing owner-supplied UI kit assets:');
  for(const file of missing)console.error('  '+file);
  console.error('Install the original UI kit and supply New Standard as a TrueType-outline WOFF2 via scripts/install-owner-fonts.ps1.');
  process.exitCode=1;
}else{
  for(const file of files)assert.ok(statSync(resolve(staticRoot,file)).size>0,'Empty UI asset: '+file);
  console.log('PASS: All selected owner UI assets and approved fonts installed.');
}
const source=readFileSync(resolve(root,'apps/web/src/lib/TutorialShell.svelte'),'utf8');
const css=readFileSync(resolve(root,'apps/web/src/lib/pall-owner-ui.css'),'utf8');
assert.ok(source.includes("import './pall-owner-ui.css'"),'Shell must import owner type tokens');
assert.ok(source.includes('/ui-kit/branding/logo-compact.png'),'Shell must show the supplied logo');
assert.ok(source.includes('/ui-kit/resources/TheCityVista.png'),'City art must be loaded from the original UI kit');
assert.ok(source.includes('/ui-kit/sidebar-illustration.png'),'Sidebar art must match supplied cutout');
assert.ok(source.includes('character.health')&&source.includes('isMeasured(resource.data)'),'Health bar must use real character values');
for(const label of ['Stamina','Fatigue','Focus']) assert.ok(source.includes("label:'"+label+"'"),'Missing relevant HUD track '+label);
assert.ok(source.includes('not tracked yet'),'Unauthored resources must be explicitly unavailable');
assert.ok(source.includes('min-height:clamp(245px,26vw,335px)'),'Grand Cylinder city vista must be taller than the prior narrow banner');
assert.ok(source.includes("center 12%/cover no-repeat"),'Vista must show the central tower, not only the city walls');
assert.ok(source.includes('min-height:43px'),'Workshop location strip must remain compact');
const secondJobUi=readFileSync(resolve(root,'apps/web/src/routes/characters/[id]/millhand/second-job/+page.svelte'),'utf8');
assert.ok(secondJobUi.includes("sceneLocation={snapshot.state.branch==='restamp'"),'Stage4 location heading must follow the chosen job');
assert.ok(secondJobUi.includes("status==='schema'"),'A missing Stage4 migration must be explainable in the UI');
const secondJobApi=readFileSync(resolve(root,'apps/api/src/millhand-second-job-routes.ts'),'utf8');
const rewindApi=readFileSync(resolve(root,'apps/api/src/millhand-stage-rewind-routes.ts'),'utf8');
for(const endpoint of [secondJobApi,rewindApi]) {
  assert.ok(endpoint.includes("code==='42P01'")&&endpoint.includes('second_job_schema_missing'),
    'Missing Stage4 relations must return 503 instead of an opaque 500');
}

assert.ok(source.includes('aria-valuenow={Math.min(resource.data.current,resource.data.maximum)}'),'Measured resources should be accessible');
assert.ok(css.includes('Pall Bebas Neue'),'Supplied Bebas Neue font must be wired');
assert.ok(!css.includes("src: url('/ui-kit/fonts/new-standard-regular.otf')"),'Chromium-rejected New Standard CFF should not be loaded');
assert.ok(css.includes("src: url('/ui-kit/fonts/new-standard-regular.woff2') format('woff2')"),
  'The repaired local New Standard WOFF2 should be the source for reading');
assert.ok(css.includes("--pall-font-reading: 'Pall New Standard', Georgia"),
  'New Standard must be the default with a reliable Georgia fallback');
assert.ok(!css.includes('/ui-kit/fonts/stranger-friz'),'Restricted personal-use font must not load');
assert.ok(!css.includes('/ui-kit/fonts/cf-industrial'),'Non-commercial font must not load');
assert.ok(!source.includes('stamina.current')&&!source.includes('fatigue.current'),'Do not invent resource data');
const avatar=readFileSync(resolve(root,'apps/web/src/lib/CharacterAvatar.svelte'),'utf8');
const installer=readFileSync(resolve(root,'scripts/install-owner-ui-kit.ps1'),'utf8');
assert.ok(source.includes('CharacterAvatar')&&source.includes('avatarId={character.avatarId}'),
  'Shared character header must use the reusable avatar slot');
assert.ok(avatar.includes('/ui-kit/avatars/')&&avatar.includes("extension==='webp'?'png':null"),
  'Avatar slot must use one shared library for WebP and PNG portraits');
assert.ok(!avatar.includes('origin')||avatar.includes('never to an origin'),
  'Avatar images must not be chosen by background or origin');
assert.ok(installer.includes('[string]$AvatarDirectory')&&installer.includes("Join-Path $target 'avatars'"),
  'Installer must accept the owner-provided shared avatar directory');
assert.ok(css.includes("url('/ui-kit/frames/dialogue-frame-trim.png')"),
  'Apply the supplied dialogue artwork to scene conversation frames');
for(const state of ['normal','hover','pressed']) {
  assert.ok(css.includes("url('/ui-kit/buttons/button-"+state+"-trim.png')"),
    'Supplied button artwork state not used: '+state);
}
assert.ok(css.includes('border-image-slice:145 190 125 190 fill'),
  'Dialogue art must resize with nine-slice rather than stretch corners');
assert.ok(css.includes('border-image-slice:50 180 45 180 fill'),
  'Button art must resize with nine-slice rather than stretch corners');
assert.ok(source.includes('font:normal 29px/1.16 var(--pall-font-reading'),'City title must use legible type rather than the noisy ornamental face');
assert.ok(css.includes('var(--pall-font-label'),'Use Bebas Neue for concise game labels');
for(const weight of ['regular','bold']) {
  const options=['ttf','otf'].map(ext=>resolve(staticRoot,'fonts/bebas-neue-'+weight+'.'+ext));
  assert.ok(options.some(candidate=>existsSync(candidate)&&statSync(candidate).size>0),
    'Bebas Neue '+weight+' must exist as a licensed TTF or OTF');
}
const fontFile=resolve(staticRoot,'fonts/new-standard-regular.woff2');
if(existsSync(fontFile)) {
  const bytes=readFileSync(fontFile);
  assert.equal(bytes.toString('ascii',0,4),'wOF2',
    'New Standard must be a genuine WOFF2, not an OTF renamed to WOFF2');
  assert.deepEqual([...bytes.subarray(4,8)],[0,1,0,0],
    'The web font must contain TrueType outlines, not the rejected OpenType CFF format');
}
const fontInstaller=readFileSync(resolve(root,'scripts/install-owner-fonts.ps1'),'utf8');
assert.ok(fontInstaller.includes('NewStandardWoff2') &&
  fontInstaller.includes('new-standard-regular.woff2') &&
  !fontInstaller.includes('convert-owner-new-standard.py') &&
  !fontInstaller.includes('pip install') &&
  !fontInstaller.includes('cf-industrial-fabrics-font.zip') &&
  !fontInstaller.includes('stranger-friz.zip'),
  'Install the owner-supplied WOFF2 directly without Python and exclude restricted fonts');
console.log('PASS: Owner HUD, frames/buttons, and three permitted font families with readable New Standard.');

