// Fault injection stays inside disposable profiles. No real keys or external requests.
const {_electron}=require('playwright-core');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-audit-'));let app;
try{
 app=await _electron.launch({executablePath:process.env.ARENA_ELECTRON_PATH||require('electron'),args:[path.resolve(__dirname,'..'),`--user-data-dir=${dir}`,...(process.platform==='linux'?['--no-sandbox']:[])]});const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('claude-answer'));
 await app.evaluate(({safeStorage})=>{
  Object.defineProperty(safeStorage,'isEncryptionAvailable',{value:()=>true});Object.defineProperty(safeStorage,'getSelectedStorageBackend',{value:()=> 'test'});Object.defineProperty(safeStorage,'encryptString',{value:key=>Buffer.from(key)});Object.defineProperty(safeStorage,'decryptString',{value:buffer=>buffer.toString()});
  globalThis.catalogCalls=[];globalThis.fetch=async url=>{globalThis.catalogCalls.push(url);if(globalThis.catalogOffline)throw new Error('offline');return new Response(JSON.stringify({data:[{id:'test-model'}],models:[{name:'models/test-model',supportedGenerationMethods:['generateContent']}]}));};
 });
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
 await page.locator('#connections').click();await page.locator('#check-updates').click();await page.waitForFunction(()=>!document.getElementById('check-updates').checked);assert.match(await page.locator('#notice').textContent(),/Preferences could not be saved/);assert.ok(!(await page.locator('#notice').textContent()).includes('ENOSPC'));
 await app.evaluate(()=>{process.getBuiltinModule('fs').writeFileSync=globalThis.originalWrite;globalThis.catalogOffline=false;globalThis.fetch=async()=>{await new Promise(r=>setTimeout(r,600));return new Response(JSON.stringify({data:[],models:[]}));};});
 await page.locator('#claude-key').fill('replacement');await page.locator('#settings-form button[type=submit]').click();assert.ok(await page.locator('#close-settings').isDisabled());await page.keyboard.press('Escape');assert.ok(await page.locator('#settings').isVisible());await page.locator('#settings').waitFor({state:'hidden'});
 await app.evaluate(async({dialog,BrowserWindow})=>{dialog.showMessageBox=async options=>{globalThis.recoveryTitle=options.title;return {response:0};};const wc=BrowserWindow.getAllWindows()[0].webContents;const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Recovery did not reload')),10000);wc.once('did-finish-load',()=>{clearTimeout(timer);resolve();});});wc.forcefullyCrashRenderer();await loaded;});
 assert.equal(await app.evaluate(()=>globalThis.recoveryTitle),'Arena needs to reload');
 console.log('PASS: renderer crash offers recovery; unchanged keys survive provider outage; named key errors; vote/history partial failure is idempotent and recoverable; failed preference reverts checkbox; Save cannot be dismissed mid-flight.');
}finally{if(app)await app.close();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
