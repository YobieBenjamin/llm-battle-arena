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
test('history preserves valid entries alongside unsupported entries and keeps chronology',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-recover-'));
 try{fs.writeFileSync(path.join(dir,'history.json'),JSON.stringify([entry(2),{id:'bad'},entry(1)]));const store=createHistory(dir);assert.equal(store.list().entries.length,2);assert.match(store.list().warning,/Recovered 2/);assert.ok(fs.readdirSync(dir).some(f=>f.endsWith('.bak')));store.save({...entry(1),prompt:'reopened'});assert.deepEqual(store.list().entries.map(e=>e.id),['run-2','run-1']);assert.equal(createHistory(dir).get('run-1').prompt,'reopened');}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('temporary recovery keeps comparisons in memory without writing files',()=>{const store=createHistory('/does-not-exist/arena',{temporary:true});store.save(entry(1));assert.equal(store.get('run-1').prompt,'Question 1');assert.match(store.list().warning,/temporary/);});
test('history backup failure permits temporary recovery without modifying damaged file',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-history-recovery-'));const file=path.join(dir,'history.json');fs.writeFileSync(file,'broken');
 try{const rename=t.mock.method(fs,'renameSync',()=>{throw new Error('EACCES');});assert.throws(()=>createHistory(dir));const temporary=createHistory(dir,{temporary:true});temporary.save(entry(1));assert.equal(temporary.list().entries.length,1);assert.equal(fs.readFileSync(file,'utf8'),'broken');rename.mock.restore();}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
