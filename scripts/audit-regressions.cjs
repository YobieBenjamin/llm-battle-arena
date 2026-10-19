require('./packaged-preflight.cjs').assertPackagedAppClosed();
// Fault injection stays inside disposable profiles. No real keys or external requests.
const {_electron}=require('playwright-core');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-audit-'));let app;
try{
 app=await _electron.launch({executablePath:process.env.ARENA_ELECTRON_PATH||require('electron'),args:[path.resolve(__dirname,'..'),`--user-data-dir=${dir}`,...(process.platform==='linux'?['--no-sandbox']:[])]});const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('claude-answer'),null,{timeout:30000,polling:100});
 await app.evaluate(({safeStorage})=>{
  Object.defineProperty(safeStorage,'isEncryptionAvailable',{value:()=>globalThis.testEncryptionAvailable!==false});Object.defineProperty(safeStorage,'getSelectedStorageBackend',{value:()=>globalThis.testStorageBackend||'test'});Object.defineProperty(safeStorage,'encryptString',{value:key=>Buffer.from(key)});Object.defineProperty(safeStorage,'decryptString',{value:buffer=>buffer.toString()});
  globalThis.catalogCalls=[];globalThis.fetch=async url=>{globalThis.catalogCalls.push(url);if(globalThis.catalogOffline)throw new Error('offline');if(globalThis.badGemini && url.includes('googleapis.com'))return new Response(JSON.stringify({error:{message:'API key not valid SECRET',details:[{reason:'API_KEY_INVALID'}]}}),{status:400});return new Response(JSON.stringify({data:[{id:'test-model'}],models:[{name:'models/test-model',supportedGenerationMethods:['generateContent']}]}));};
 });
 // Save must reject new secrets before checking any provider, including later fields and router keys.
 const settingsBefore=await page.evaluate(()=>window.arena.connections());
 for(const backend of ['unavailable','basic_text']) {
  await app.evaluate((_electron,backend)=>{globalThis.testEncryptionAvailable=backend!=='unavailable';globalThis.testStorageBackend=backend==='basic_text'?'basic_text':'test';globalThis.catalogCalls=[];},backend);
  for(const id of ['claude','gemini','openrouter']) {
   const message=await page.evaluate(async({id,config})=>{
    const value=Object.fromEntries(Object.entries(config.providers).map(([name,p])=>[name,{model:p.model,key:'',remove:false}]));
    value.openrouter={key:'',enabled:false,remove:false,models:config.openrouter.models};value[id].key='synthetic-new-key';
    try{await window.arena.saveConnections(value);return 'unexpected success';}catch(e){return e.message;}
   },{id,config:settingsBefore});
   assert.match(message,/credential encryption is unavailable/);
  }
  assert.deepEqual(await app.evaluate(()=>globalThis.catalogCalls),[],'No provider checks when new keys cannot be encrypted');
 }
 await app.evaluate(()=>{globalThis.testEncryptionAvailable=true;globalThis.testStorageBackend='test';});
 assert.deepEqual(await page.evaluate(()=>window.arena.connections()),settingsBefore,'Rejected saves must preserve connections');
 // Both Save and explicit Check must explain an invalid Gemini key, without saving it.
 await app.evaluate(()=>{globalThis.badGemini=true;});
 for(const action of ['save','check']) {
  const message=await page.evaluate(async action=>{try{if(action==='check')await window.arena.listModels('gemini','bad');else{const c=await window.arena.connections();const value=Object.fromEntries(Object.entries(c.providers).map(([id,p])=>[id,{model:p.model,key:id==='gemini'?'bad':'',remove:false}]));await window.arena.saveConnections(value);}return 'unexpected success';}catch(e){return e.message;}},action);
  assert.match(message,/API key rejected/);assert.ok(!message.includes('SECRET'));
 }
 assert.deepEqual(await page.evaluate(()=>window.arena.connections()),settingsBefore);
 await app.evaluate(()=>{globalThis.badGemini=false;globalThis.catalogCalls=[];});
 // Real IPC save/export handlers must not expose native filesystem errors or paths.
 await app.evaluate(({dialog})=>{globalThis.originalSaveDialog=dialog.showSaveDialog;dialog.showSaveDialog=async()=>({canceled:false,filePath:'/synthetic/private-path'});const fs=process.getBuiltinModule('fs/promises');globalThis.originalAsyncWrite=fs.writeFile;fs.writeFile=async()=>{throw Object.assign(new Error('EACCES /synthetic/private-path'),{code:globalThis.saveErrorCode||'EACCES'});};});
 for(const code of ['EACCES','ENOSPC']) {
  await app.evaluate((_electron,code)=>{globalThis.saveErrorCode=code;},code);
  for(const kind of ['export','artifact']) {
   const message=await page.evaluate(async kind=>{try{if(kind==='export')await window.arena.export('test','md');else await window.arena.saveArtifact({name:'test.txt',content:'test'});}catch(e){return e.message;}},kind);
   assert.match(message,code==='ENOSPC'?/disk space/:/writable folder/);assert.ok(!/EACCES|ENOSPC|private-path/.test(message));
  }
 }
 await app.evaluate(({dialog})=>{dialog.showSaveDialog=globalThis.originalSaveDialog;process.getBuiltinModule('fs/promises').writeFile=globalThis.originalAsyncWrite;});
 await page.evaluate(async()=>{const c=await window.arena.connections();globalThis.testSettings=Object.fromEntries(Object.entries(c.providers).map(([id,p])=>[id,{model:p.model,key:'synthetic-key',remove:false}]));await window.arena.saveConnections(globalThis.testSettings);for(const entry of Object.values(globalThis.testSettings))entry.key='';});
 assert.equal((await app.evaluate(()=>globalThis.catalogCalls)).length,3);
 await app.evaluate(()=>{globalThis.catalogCalls=[];globalThis.catalogOffline=true;});
 await page.evaluate(()=>window.arena.saveConnections(globalThis.testSettings));assert.equal((await app.evaluate(()=>globalThis.catalogCalls)).length,0);
 const failure=await page.evaluate(async()=>{try{await window.arena.saveConnections({...globalThis.testSettings,claude:{...globalThis.testSettings.claude,key:'replacement'}});}catch(e){return e.message;}});assert.match(failure,/Claude:/);
 // Fail history only after the durable preferences vote is written.
 await page.evaluate(()=>window.arena.historySave({id:'vote-fault',timestamp:new Date().toISOString(),mode:'live',prompt:'vote',blind:{order:['claude','openai'],revealed:false,winner:null},results:{claude:{text:'A',status:'done'},openai:{text:'B',status:'done'}}}));
 await app.evaluate(()=>{const fs=process.getBuiltinModule('fs');globalThis.originalWrite=fs.writeFileSync;fs.writeFileSync=function(file,...rest){if(String(file).endsWith('history.json.tmp'))throw new Error('ENOSPC /private/path');return globalThis.originalWrite.call(this,file,...rest);};});
 const vote=await page.evaluate(()=>window.arena.vote('vote-fault','claude'));assert.equal(vote.tally.claude,1);assert.match(vote.warning,/vote was saved/);
 const again=await page.evaluate(()=>window.arena.vote('vote-fault','openai'));assert.equal(again.winner,'claude');assert.equal(again.tally.claude,1);
 assert.equal((await page.evaluate(()=>window.arena.historyGet('vote-fault'))).blind.winner,'claude');
 await app.evaluate(()=>{const fs=process.getBuiltinModule('fs');fs.writeFileSync=function(file,...rest){if(String(file).endsWith('preferences.json.tmp'))throw new Error('ENOSPC /private/path');return globalThis.originalWrite.call(this,file,...rest);};});
 await page.locator('#connections').click();await page.locator('#check-updates').click();await page.waitForFunction(()=>!document.getElementById('check-updates').checked,null,{polling:100});assert.match(await page.locator('#notice').textContent(),/Preferences could not be saved/);assert.ok(!(await page.locator('#notice').textContent()).includes('ENOSPC'));
 await app.evaluate(()=>{process.getBuiltinModule('fs').writeFileSync=globalThis.originalWrite;globalThis.catalogOffline=false;globalThis.fetch=async()=>{await new Promise(r=>setTimeout(r,600));return new Response(JSON.stringify({data:[],models:[]}));};});
 await page.locator('#claude-key').fill('replacement');await page.locator('#settings-form button[type=submit]').click();assert.ok(await page.locator('#close-settings').isDisabled());await page.keyboard.press('Escape');assert.ok(await page.locator('#settings').isVisible());await page.locator('#settings').waitFor({state:'hidden'});
 await app.evaluate(async({app,dialog,BrowserWindow})=>{
  dialog.showMessageBox=async options=>{globalThis.recoveryTitle=options.title;return {response:0};};
  globalThis.recoveryLostAllWindows=false;app.once('window-all-closed',()=>{globalThis.recoveryLostAllWindows=true;});
  const wc=BrowserWindow.getAllWindows()[0].webContents;
  const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Recovery did not create a fresh display')),15000);app.once('browser-window-created',(_event,window)=>window.webContents.once('did-finish-load',()=>{clearTimeout(timer);resolve();}));});
  // Kill the renderer process directly; forcefullyCrashRenderer can stall Linux core dumps under CDP.
  process.kill(wc.getOSProcessId(),'SIGKILL');await loaded;
 });
 assert.equal(await app.evaluate(()=>globalThis.recoveryTitle),'Arena needs to reload');
 assert.equal(await app.evaluate(()=>globalThis.recoveryLostAllWindows),false,'Recovery must not trigger quit-on-last-window on Windows/Linux');
 console.log('PASS: encryption preflight prevents provider calls; renderer crash offers recovery; unchanged keys survive provider outage; named key errors; vote/history partial failure is idempotent and recoverable; failed preference reverts checkbox; Save cannot be dismissed mid-flight.');
}finally{if(app)await Promise.race([app.close(),new Promise(resolve=>setTimeout(()=>{app.process().kill('SIGKILL');resolve();},10000).unref())]);fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
