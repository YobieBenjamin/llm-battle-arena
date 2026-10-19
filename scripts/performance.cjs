require('./packaged-preflight.cjs').assertPackagedAppClosed();
// Production renderer, history and IPC; synthetic stream only. No credentials or network.
const {_electron}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const {spawn}=require('node:child_process');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-perf-'));const executablePath=process.env.ARENA_ELECTRON_PATH||require('electron');
 const args=[path.resolve(__dirname,'..'),`--user-data-dir=${dir}`,...(process.platform==='linux'?['--no-sandbox']:[])];
 let app;
 try{
  app=await _electron.launch({executablePath,args});const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('claude-answer'),null,{timeout:30000,polling:100});
  // A second process must exit without acquiring a separate writable profile snapshot.
  const second=spawn(executablePath,args,{stdio:'ignore'});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{second.kill();reject(new Error('Second instance did not exit'));},10000);second.on('error',reject);second.on('exit',()=>{clearTimeout(timer);resolve();});});
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().length),1);
  await app.evaluate(({ipcMain,BrowserWindow})=>{
   ipcMain.removeHandler('compare');ipcMain.handle('compare',(_event,value)=>{
    const text=('## Heading\n\n**Bold** and prose with <script> examples.\n\n|A|B|\n|-|-|\n|1|2|\n\n```html\n<h1>Example</h1>\n```\n\n').repeat(260).slice(0,24000);
    let offset=0;globalThis.perfStart=Date.now();
    globalThis.perfTimer=setInterval(()=>{offset=Math.min(offset+12,text.length);for(const id of value.providers)BrowserWindow.getAllWindows()[0].webContents.send('answer',{id,runId:value.runId,model:'fixture',status:offset===text.length?'done':'streaming',text:text.slice(0,offset),elapsed:Date.now()-globalThis.perfStart});if(offset===text.length){clearInterval(globalThis.perfTimer);globalThis.perfEnd=Date.now();}},30);
    return {ok:true,value:{started:true}};
   });
  });
  console.log('Single-instance check passed; starting three streams');
  await page.locator('#mode').selectOption('live');await page.locator('#prompt').fill('Performance regression fixture');
  const start=Date.now();await page.locator('#compare').click();const latencies=[];
  while(Date.now()-start<120000){const t=Date.now();const state=await page.evaluate(()=>({done:['claude','openai','gemini'].every(id=>document.getElementById(id+'-status').textContent.toLowerCase().startsWith('done')),lengths:['claude','openai','gemini'].map(id=>document.getElementById(id+'-answer').textContent.length)}));latencies.push(Date.now()-t);if(state.done)break;await new Promise(r=>setTimeout(r,100));}
  const elapsed=Date.now()-start;const timing=await app.evaluate(()=>({start:globalThis.perfStart,end:globalThis.perfEnd}));
  assert.ok(timing.end,'Stream must finish');
  await page.waitForFunction(()=>['claude','openai','gemini'].every(id=>document.getElementById(id+'-status').textContent.toLowerCase().startsWith('done')),null,{timeout:10000,polling:100});
  const p95=latencies.sort((a,b)=>a-b)[Math.floor(latencies.length*.95)];
  assert.ok(elapsed<1.5*(timing.end-timing.start),`Renderer finished too slowly: ${elapsed}ms`);assert.ok(p95<250,`UI p95 ${p95}ms exceeds 250ms`);
  console.log(`PASS: three 24KB streams; elapsed ${elapsed}ms; stream ${timing.end-timing.start}ms; UI p95 ${p95}ms; second instance exited.`);
 }finally{if(app)await Promise.race([app.close(),new Promise(resolve=>setTimeout(()=>{app.process().kill('SIGKILL');resolve();},10000).unref())]);fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
