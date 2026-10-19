import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createStore } from '../desktop/store.js';
import { PROVIDERS } from '../src/providers.js';
const fakeCrypto = { isEncryptionAvailable:()=>true, getSelectedStorageBackend:()=> 'keychain', encryptString:text=>Buffer.from([...text].reverse().join('')), decryptString:buffer=>[...buffer.toString()].reverse().join('') };
function setup(t,crypto=fakeCrypto){ const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return {dir,store:createStore(dir,crypto)}; }
const input = ()=> Object.fromEntries(Object.entries(PROVIDERS).map(([id,p])=>[id,{model:p.model,key:''}]));
test('keys survive reload, never appear in snapshots, and blank keeps them', t=>{
  const {dir,store}=setup(t); const value=input();value.claude.key='secret-never-plain'; store.save(value);
  assert.equal(store.key('claude'),'secret-never-plain');assert.ok(!JSON.stringify(store.snapshot()).includes(value.claude.key));
  assert.ok(!fs.readFileSync(path.join(dir,'connections.json'),'utf8').includes(value.claude.key));
  store.save(input()); assert.equal(createStore(dir,fakeCrypto).key('claude'),value.claude.key);
  const remove=input();remove.claude.remove=true;store.save(remove);assert.equal(store.key('claude'),'');
});
test('weak storage refuses keys and settings changes are transactional', t=>{
  const {store}=setup(t,{...fakeCrypto,getSelectedStorageBackend:()=> 'basic_text'});const value=input();value.claude.key='secret';
  assert.throws(()=>store.save(value),/unavailable/);assert.equal(store.snapshot().providers.claude.connected,false);
});
test('invalid later provider leaves earlier settings untouched',t=>{
  const {store}=setup(t);const value=input();value.claude.key='secret';value.gemini.model='../../invalid';
  assert.throws(()=>store.save(value));assert.equal(store.key('claude'),'');
});
test('malformed saved settings are rejected at load with a recovery path',t=>{
 const {dir}=setup(t);
 for(const value of [null,[],{claude:null},{claude:{model:'../bad'}},{claude:{model:'valid',secret:123}}]) {
  fs.writeFileSync(path.join(dir,'connections.json'),JSON.stringify(value));
  assert.throws(()=>createStore(dir,fakeCrypto),/Invalid saved/);
 }
});
test('OpenRouter is opt-in, encrypted, persistent and cannot replace direct keys',t=>{
 const {dir,store}=setup(t);const value=input();value.claude.key='direct-secret';value.openrouter={key:'router-secret',enabled:true,models:{claude:'anthropic/claude-test',openai:'openai/gpt-test',gemini:'google/gemini-test'}};
 store.save(value);const reloaded=createStore(dir,fakeCrypto);assert.equal(reloaded.snapshot().route,'openrouter');assert.equal(reloaded.key('openrouter'),'router-secret');assert.equal(reloaded.key('claude'),'direct-secret');assert.ok(!JSON.stringify(reloaded.snapshot()).includes('secret'));assert.ok(!fs.readFileSync(path.join(dir,'connections.json'),'utf8').includes('router-secret'));
 const invalid={...value,openrouter:{...value.openrouter,models:{...value.openrouter.models,claude:'openai/wrong'}}};assert.throws(()=>store.save(invalid),/matching/);assert.equal(store.key('openrouter'),'router-secret');
});
