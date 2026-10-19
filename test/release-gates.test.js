import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import builds from '../scripts/compare-builds.cjs';
import smoke from '../scripts/release-smoke.cjs';
test('release gate rejects a different application archive',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'arena-gates-'));
 try{
  const apps=['private.app','release.app'].map(name=>path.join(root,name));
  for(const app of apps){fs.mkdirSync(path.join(app,'Contents/Resources'),{recursive:true});fs.writeFileSync(builds.archivePath(app),'tested code');}
  assert.equal(builds.compareBuilds(...apps).length,64);
  fs.writeFileSync(builds.archivePath(apps[1]),'different code');
  assert.throws(()=>builds.compareBuilds(...apps),/differs/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('inspector endpoint probe detects a listener and its closure',async()=>{
 const server=net.createServer(socket=>socket.end());
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
 try{assert.equal(await smoke.portOpen(port),true);}finally{await new Promise(resolve=>server.close(resolve));}
 assert.equal(await smoke.portOpen(port),false);
});

test('public asset gate rejects replacing both installer and its public proof',async()=>{
 const {default:compareDownloads}=await import('../scripts/compare-downloads.cjs');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'arena-public-gate-'));
 try{
  const reference=path.join(root,'ci'),download=path.join(root,'public');
  for(const dir of [reference,download]){fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'app.exe'),'tested installer');fs.writeFileSync(path.join(dir,'proof-win-x64.json'),'original proof');}
  compareDownloads(download,reference);
  fs.writeFileSync(path.join(download,'app.exe'),'replacement installer');fs.writeFileSync(path.join(download,'proof-win-x64.json'),'replacement proof');
  assert.throws(()=>compareDownloads(download,reference),/differs from tested CI artifact/);
  for(const file of fs.readdirSync(reference))fs.copyFileSync(path.join(reference,file),path.join(download,file));
  fs.writeFileSync(path.join(download,'extra-installer.exe'),'untested');
  assert.throws(()=>compareDownloads(download,reference),/download set differs/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
