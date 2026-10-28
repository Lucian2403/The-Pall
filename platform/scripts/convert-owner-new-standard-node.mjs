#!/usr/bin/env node
/*
 * Local-only font conversion. Never commit or upload font binaries.
 * Accepts the owner's New Standard OpenType/CFF and writes genuine
 * TrueType-outline WOFF2 to the local web static directory.
 *
 * Run via scripts/install-owner-fonts.ps1 after it installs the pinned,
 * MIT-licensed fonteditor-core@2.6.3 in a temporary tooling directory.
 *
 * Usage: node scripts/convert-owner-new-standard-node.mjs SOURCE.otf TARGET.woff2 TOOL_DIR
 */
import {readFileSync,writeFileSync,mkdirSync,renameSync,rmSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {createRequire} from 'node:module';

const [source,destination,toolsDir]=process.argv.slice(2);
if(!source||!destination||!toolsDir) {
  console.error('Usage: node convert-owner-new-standard-node.mjs SOURCE.otf TARGET.woff2 TOOL_DIR');
  process.exit(2);
}
const src=readFileSync(resolve(source));
if(src.toString('ascii',0,4)!=='OTTO') {
  throw Error('Expected the owner-supplied OpenType/CFF New Standard source, not an unrelated file.');
}

const requireTool=createRequire(join(resolve(toolsDir),'package.json'));
const editor=requireTool('fonteditor-core');
const createFont=editor.createFont??editor.Font?.create;
if(typeof createFont!=='function'||!editor.woff2?.init) {
  throw Error('fonteditor-core is incomplete; a proper OTF-to-TrueType WOFF2 converter is required.');
}
const openType=createFont(src,{type:'otf'});
const ttfBuffer=Buffer.from(openType.write({type:'ttf'}));
if(ttfBuffer.readUInt32BE(0)!==0x00010000) {
  throw Error('The source was not converted to genuine quadratic TrueType outlines.');
}
// Read the intermediate TrueType again, rather than wrapping the original CFF
// in WOFF2; Chromium rejected the original CFF CharStrings index.
const trueType=createFont(ttfBuffer,{type:'ttf'});
await editor.woff2.init();
const woff2Buffer=Buffer.from(trueType.write({type:'woff2'}));
if(woff2Buffer.length<4096||
   woff2Buffer.toString('ascii',0,4)!=='wOF2'||
   woff2Buffer.readUInt32BE(4)!==0x00010000) {
  throw Error('Converted output is not a TrueType-outline WOFF2.');
}
// Verify the produced file is actually readable, not just a plausible header.
const check=createFont(woff2Buffer,{type:'woff2'});
const glyphs=check.get()?.glyf;
if(!Array.isArray(glyphs)||glyphs.length<100) {
  throw Error('Converted WOFF2 failed glyph validation.');
}
mkdirSync(dirname(resolve(destination)),{recursive:true});
const temp=resolve(destination)+'.partial';
try{
  writeFileSync(temp,woff2Buffer);
  renameSync(temp,resolve(destination));
}catch(e){
  rmSync(temp,{force:true});
  throw e;
}
console.log('New Standard converted locally to TrueType-outline WOFF2 ('+glyphs.length+' glyphs).');
