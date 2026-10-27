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
assert.ok(source.includes('character.health.current')&&source.includes('character.health.maximum'),'Health bar must use real character values');
assert.ok(source.includes('aria-valuenow={character.health.current}'),'Resource should be accessible');
assert.ok(css.includes('Pall New Standard')&&css.includes('Pall Bebas Neue'),'Supplied open-licensed fonts must be wired');
assert.ok(!css.includes('Stranger Friz')||!css.includes('src: url(\'/ui-kit/fonts/stranger'),'Restricted personal-use font must not load');
assert.ok(!css.includes('src: url(\'/ui-kit/fonts/cf-industrial'),'Non-commercial font must not load');
assert.ok(!source.includes('stamina.current')&&!source.includes('fatigue.current'),'Do not invent resource data');
console.log('PASS: Restrained font, logo, city, sidebar and real Health UI wiring.');
