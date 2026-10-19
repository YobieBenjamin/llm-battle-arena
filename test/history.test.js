import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHistory} from '../desktop/history.js';
const entry=i=>({id:`run-${i}`,timestamp:new Date().toISOString(),mode:'live',prompt:`Question ${i}`,results:{claude:{text:'**answer**',model:'model',status:'done',key:'must-not-save'}}});
test('history keeps latest 50, replaces retries, persists raw text and excludes unknown fields',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-history-'));
 try{let store=createHistory(dir);for(let i=0;i<51;i++)store.save(entry(i));assert.equal(store.list().entries.length,50);assert.equal(store.get('run-0'),null);store.save({...entry(50),prompt:'retry'});store=createHistory(dir);assert.equal(store.list().entries.length,50);assert.equal(store.get('run-50').prompt,'retry');assert.equal(store.get('run-50').results.claude.text,'**answer**');assert.ok(!fs.readFileSync(path.join(dir,'history.json'),'utf8').includes('must-not-save'));store.remove('run-50');assert.equal(createHistory(dir).get('run-50'),null);store.clear();assert.deepEqual(createHistory(dir).list().entries,[]);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('damaged history is backed up and does not prevent startup',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-history-'));
 try{fs.writeFileSync(path.join(dir,'history.json'),'broken');const store=createHistory(dir);assert.match(store.list().warning,/preserved/);assert.ok(fs.readdirSync(dir).some(f=>f.endsWith('.bak')));store.save(entry(1));assert.equal(createHistory(dir).list().entries.length,1);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('invalid history cannot overwrite good history',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-history-'));
 try{const store=createHistory(dir);store.save(entry(1));assert.throws(()=>store.save({...entry(2),prompt:42}));assert.equal(createHistory(dir).list().entries.length,1);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
