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
  'fonts/new-standard-regular.otf',
  'fonts/bebas-neue-regular.otf',
  'fonts/bebas-neue-bold.otf',
  'fonts/beyond-wonderland.ttf',
  'licenses/NEW-STANDARD-OFL.txt',
  'licenses/BEBAS-NEUE-OFL.txt',
  'licenses/BEYOND-WONDERLAND-LICENSE.txt'
];
const missing=files.filter(file=>!existsSync(resolve(staticRoot,file)));
if(missing.length){
  console.error('Missing owner-supplied UI kit assets:');
  for(const file of missing)console.error('  '+file);
  console.error('Install from the ORIGINAL ZIP with scripts/install-owner-ui-kit.ps1 before checking the interface.');
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
assert.ok(css.includes('--pall-font-reading: Georgia'),'Readable fallback must remain while supplied New Standard OTF is invalid');
assert.ok(!css.includes('/ui-kit/fonts/stranger-friz'),'Restricted personal-use font must not load');
assert.ok(!css.includes('/ui-kit/fonts/cf-industrial'),'Non-commercial font must not load');
assert.ok(!source.includes('stamina.current')&&!source.includes('fatigue.current'),'Do not invent resource data');
console.log('PASS: Owner HUD tracks, tall city, licensed font fallback and measured Health wiring.');
