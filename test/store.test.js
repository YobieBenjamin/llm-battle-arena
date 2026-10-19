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
