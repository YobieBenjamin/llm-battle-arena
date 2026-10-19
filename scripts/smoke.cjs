const { _electron: electron } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const appRoot=path.resolve(__dirname,'..');
(async()=>{
 const networkHits=[];const probe=require('node:http').createServer((req,res)=>{networkHits.push(req.url);res.end('unexpected');});
 await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
 const probeUrl=`http://127.0.0.1:${probe.address().port}/should-not-load.png`;
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-smoke-'));
 let app=await electron.launch({executablePath:process.env.ARENA_ELECTRON_PATH || require('electron'),args:[appRoot,`--user-data-dir=${dir}`,...(process.platform==='linux'?['--no-sandbox']:[])]});
 let page;
 try {
 console.log('Electron launched');
 page=await app.firstWindow({timeout:30000}); page.setDefaultTimeout(15000);
 await page.waitForFunction(()=>document.getElementById('claude-answer') && window.arena,null,{timeout:60000});
 console.log('Window ready',page.url());
 if(process.env.ARENA_DEBUG) { app.process().stderr?.on('data',data=>process.stderr.write(data)); page.on('console',message=>{if(message.type()==='error')console.error('Renderer:',message.text());}); }const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.locator('#compare').click();
 await page.locator('#claude-answer').filter({hasText:'ILLUSTRATIVE SAMPLE'}).waitFor();
 for(const id of ['claude','openai','gemini']) assert.match(await page.locator(`#${id}-tokens`).textContent(),/^Q ~\d+ · A ~[\d,]+ · R — tokens$/);
 assert.match(await page.locator('#count').textContent(),/tokens/);
 // Capture native export payloads without displaying a save dialog.
 await app.evaluate(({ipcMain})=>{ipcMain.removeHandler('export');ipcMain.handle('export',(_event,text,format)=>{globalThis.smokeExport={text,format};return {ok:true,value:true};});});
 await page.locator('#export-json').click();
 const exported=await app.evaluate(()=>globalThis.smokeExport);
 const payload=JSON.parse(exported.text);
 assert.equal(payload.results.claude.tokenCounts.question.estimated,true);
 assert.equal(payload.results.claude.tokenCounts.answer.estimated,true);
 await page.locator('#export-md').click();
 const markdown=await app.evaluate(()=>globalThis.smokeExport.text);
 assert.match(markdown,/Tokens: Q ~/);
 await page.locator('.brand').click();
 assert.ok(!page.url().includes('#'));

 await page.locator('#compare').click();
 await page.locator('#gemini-artifact').click();
 await page.frameLocator('#artifact-body iframe').locator('h1').filter({hasText:'Start small. Show up.'}).waitFor();
 assert.match(await page.locator('#artifact-state').textContent(),/Pinned/);
 const previewTop=await page.locator('#artifact-panel').evaluate(el=>el.getBoundingClientRect().top);
 const badgeBottom=await page.locator('#gemini-artifact').evaluate(el=>el.getBoundingClientRect().bottom);
 const panelRect=await page.locator('#artifact-panel').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
 const actionsRect=await page.locator('.gemini .card-actions').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
 assert.ok(panelRect.right<=actionsRect.x || panelRect.x>=actionsRect.right || panelRect.bottom<=actionsRect.y || panelRect.y>=actionsRect.bottom,'pinned artifact must not cover Gemini controls');
 if(process.env.ARENA_SCREENSHOTS) await page.screenshot({path:path.join(appRoot,'docs/artifact-preview.png'),fullPage:true});
 await page.locator('#gemini-artifact').click();
 if(process.env.ARENA_SCREENSHOTS) await page.screenshot({path:path.join(appRoot,'desktop-preview.png'),fullPage:true});
 await page.locator('#help').click();
 await page.locator('#help-dialog[open]').waitFor();
 await page.locator('#close-help').click();
 const answerScroll = await page.locator('#claude-answer').evaluate(el => { el.textContent = 'Long sample line\n'.repeat(300); el.scrollTop=500; return {scroll:el.scrollTop,client:el.clientHeight,total:el.scrollHeight}; });
 assert.ok(answerScroll.total>answerScroll.client && answerScroll.scroll>0);
 await page.locator('#mode').selectOption('manual');
 await page.locator('#prompt').fill('A long question line\n'.repeat(100));
 const promptScroll=await page.locator('#prompt').evaluate(el=>{el.scrollTop=500;return {height:el.clientHeight,total:el.scrollHeight,scroll:el.scrollTop};});
 assert.ok(promptScroll.height<100 && promptScroll.total>promptScroll.height && promptScroll.scroll>0);

 await page.locator('#prompt').fill('Explain <script>alert(1)</script>');
 await page.locator('#compare').click();
 await page.locator('#claude-manual').fill('Keep this answer');
 await page.locator('#openai-manual').fill('Keep this answer too');
 for(const key of ['Control+Enter','Meta+Enter']) {
  await page.locator('#claude-manual').press(key);
  assert.equal(await page.locator('#claude-manual').inputValue(),'Keep this answer');
  assert.equal(await page.locator('#openai-manual').inputValue(),'Keep this answer too');
 }
 await page.locator('#claude-manual').fill('<img src=x onerror=alert(1)>');
 assert.equal(await page.locator('#claude-answer img').count(),0);
 assert.match(await page.locator('#claude-manual').inputValue(),/onerror/);
 await page.locator('#claude-format').click();
 assert.equal(await page.locator('#claude-answer img').count(),0);
 await page.locator('#claude-format').click();
 await page.locator('#claude-manual').fill('Long website answer\n'.repeat(300));
 assert.match(await page.locator('#claude-tokens').textContent(),/A ~[\d,]+ · R — tokens/);

 const manualScroll=await page.locator('#claude-manual').evaluate(el=>{el.scrollTop=500;return el.scrollTop>0 && el.scrollHeight>el.clientHeight;});
 assert.ok(manualScroll);

 // Artifact detection, hover peek, click-to-pin, click-to-hide, source and native save.
 await page.locator('#claude-manual').fill(('```html\n<h1 id="test-preview">Local artifact</h1><script>document.body.dataset.executed="yes"</script><img src="https://example.com/should-not-load.png">\n```\n```json\n{"ok":true}\n```').replace('https://example.com/should-not-load.png',probeUrl));
 const artifactRequests=[];
 page.on('requestfinished',r=>{if(r.url().includes('should-not-load'))artifactRequests.push(r.url());});
 await page.locator('#claude-artifact').hover();
 await page.locator('#artifact-panel').waitFor({state:'visible'});
 const frame=page.frameLocator('#artifact-body iframe');
 await frame.locator('#test-preview').waitFor();
 assert.equal(await frame.locator('body').getAttribute('data-executed'),null);
 assert.equal(await page.locator('#artifact-body iframe').getAttribute('sandbox'),'');
 assert.equal(await frame.locator('body').evaluate(()=>typeof window.arena),'undefined');
 assert.deepEqual(artifactRequests,[]);
 await page.locator('#claude-artifact').click();
 await page.locator('#prompt').hover();
 assert.equal(await page.locator('#artifact-panel').isVisible(),true);
 assert.match(await page.locator('#artifact-state').textContent(),/Pinned/);
 await page.locator('#artifact-tabs button').nth(1).click();
 assert.match(await page.locator('#artifact-body').textContent(),/"ok": true/);
 assert.equal(await page.evaluate(async()=>{try{await window.arena.saveArtifact({name:'../escape.txt',content:'x'});return false;}catch(error){return error.message==='Invalid artifact file.';}}),true);
 await app.evaluate(({ipcMain})=>{ipcMain.removeHandler('save-artifact');ipcMain.handle('save-artifact',(_event,value)=>{globalThis.smokeArtifact=value;return {ok:true,value:true};});});
 await page.locator('#artifact-save').click();
 const savedArtifact=await app.evaluate(()=>globalThis.smokeArtifact);
 assert.equal(savedArtifact.name,'claude-artifact-2.json');assert.equal(savedArtifact.content,'{"ok":true}');
 await page.locator('#artifact-tabs button').nth(0).click();
 await page.locator('#artifact-source').click();
 assert.match(await page.locator('#artifact-body pre').textContent(),/<h1/);
 await page.locator('#claude-artifact').click();
 await page.locator('#artifact-panel').waitFor({state:'hidden'});
 await page.locator('#mode').selectOption('live');

 await page.locator('#prompt').fill('Say hello');
 await page.locator('#compare').click();
 for(const id of ['claude','openai','gemini']) await page.locator(`#${id}-status`).filter({hasText:'Add an API key'}).waitFor();
 const originalCounter=await page.locator('#claude-tokens').textContent();
 await page.locator('#prompt').fill('An entirely different unsent draft question with more words');
 assert.equal(await page.locator('#claude-tokens').textContent(),originalCounter);
 await page.locator('#connections').click();
 await page.locator('#settings[open]').waitFor();
 await page.locator('#settings-form button[type=submit]').click();
 await page.locator('#settings').waitFor({state:'hidden'});
 for(const [width,height] of [[880,650],[1280,720],[1440,900]]) {
  await app.evaluate(({BrowserWindow},{width,height})=>BrowserWindow.getAllWindows()[0].setBounds({width,height}),{width,height});
  await page.waitForFunction(width=>innerWidth===width,width,{timeout:15000});
  await page.locator('#mode').selectOption('sample');
  await page.locator('#compare').click();
  await page.locator('#gemini-artifact').click();
  const geometry=await page.evaluate(()=>({
   answers:[...document.querySelectorAll('.answer')].map(el=>el.clientHeight),
   preview:document.getElementById('artifact-body').clientHeight,
   scrollable:document.querySelector('.results-workspace').scrollHeight>document.querySelector('.results-workspace').clientHeight
  }));
  assert.ok(geometry.answers.every(h=>h>=150) && geometry.preview>=150,`Readable dock at ${width}x${height}: ${JSON.stringify(geometry)}`);
  if(width<1400) assert.ok(geometry.scrollable,'stacked results must scroll');
  await page.locator('#artifact-save').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#artifact-save').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight;}));
  await page.locator('body').click({position:{x:5,y:5}});
  await page.keyboard.press(process.platform==='darwin'?'Meta+Enter':'Control+Enter');
  await page.locator('#artifact-panel').waitFor({state:'hidden'});
 }
 const roles=await app.evaluate(({Menu})=>{const roles=[];const walk=menu=>menu?.items.forEach(item=>{if(item.role)roles.push(item.role.toLowerCase());walk(item.submenu)});walk(Menu.getApplicationMenu());return roles;});
 for(const role of ['close','minimize','zoomin','zoomout','resetzoom']) assert.ok(roles.includes(role),`Missing ${role} menu role`);
 if(process.platform==='darwin') for(const role of ['about','hide','hideothers']) assert.ok(roles.includes(role));
 assert.ok(!roles.some(role=>['reload','forcereload','toggledevtools'].includes(role)));
 // Markdown is rendered only through the production sanitizer; no passive requests.
 const markdownRequests=[]; page.on('requestfinished',r=>{if(r.url().startsWith('https://markdown.invalid'))markdownRequests.push(r.url());});
 await page.evaluate(async()=>{
  const {renderMarkdown}=await import('./src/markdown.js');
  document.getElementById('claude-answer').replaceChildren(renderMarkdown('## Heading\n\n**Bold**\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n[Safe](https://example.com) [Bad](javascript:alert(1))\n<img src="https://markdown.invalid/x" onerror="window.markdownPwned=1"><script>window.markdownPwned=1</script><iframe src="https://markdown.invalid/frame"></iframe><style>body{display:none}</style>'));
 });
 assert.equal(await page.locator('#claude-answer h2').textContent(),'Heading');
 assert.equal(await page.locator('#claude-answer table').count(),1);
 assert.equal(await page.locator('#claude-answer strong').textContent(),'Bold');
 assert.equal(await page.locator('#claude-answer img, #claude-answer script, #claude-answer iframe, #claude-answer style').count(),0);
 assert.equal(await page.evaluate(()=>window.markdownPwned),undefined);
 assert.deepEqual(markdownRequests,[]);
 for(const tag of ['script','iframe','title','style','textarea','svg']) {
  const visible=await page.evaluate(async tag=>{const {renderMarkdown}=await import('./src/markdown.js');const el=document.getElementById('claude-answer');el.replaceChildren(renderMarkdown(`Explain <${tag}> and preserve the rest.\n\nFinal paragraph.`));return el.textContent;},tag);
  assert.ok(visible.includes(`<${tag}>`) && visible.includes('Final paragraph.'),`Raw ${tag} must not swallow text`);
 }
 // Restore the link fixture after prose checks.
 await page.evaluate(async()=>{const {renderMarkdown}=await import('./src/markdown.js');document.getElementById('claude-answer').replaceChildren(renderMarkdown('[Safe](https://example.com)'));});
 await app.evaluate(({ipcMain})=>{ipcMain.removeHandler('open-answer-link');ipcMain.handle('open-answer-link',(_event,url)=>{globalThis.smokeLink=url;return {ok:true};});});
 await page.locator('#claude-answer a').filter({hasText:'Safe'}).click();
 assert.equal(await app.evaluate(()=>globalThis.smokeLink),'https://example.com/');
 // Persist, reload renderer, and reopen without provider calls.
 await page.locator('#history').click();
 await page.locator('#history-dialog[open]').waitFor();
 assert.ok(await page.locator('.history-row').count()>0);
 await page.locator('.history-row button').first().click();
 await page.locator('#history-dialog').waitFor({state:'hidden'});
 await page.reload();
 await page.locator('#history').click();
 await page.locator('.history-row button').first().click();
 await page.locator('#claude-answer').filter({hasText:'ILLUSTRATIVE SAMPLE'}).waitFor();
 await page.locator('#history').click();
 await page.locator('#clear-history').click();
 await page.locator('#confirm-clear-history').click();
 await page.locator('#history-message').filter({hasText:'No saved comparisons'}).waitFor();
 await page.locator('#close-history').click();
 await page.locator('#mode').selectOption('manual');
 await page.locator('#prompt').fill('History restart check');
 await page.locator('#compare').click();
 await page.locator('#claude-manual').fill('**Saved across restart**');
 await app.close();
 app=await electron.launch({executablePath:process.env.ARENA_ELECTRON_PATH || require('electron'),args:[appRoot,`--user-data-dir=${dir}`,...(process.platform==='linux'?['--no-sandbox']:[])]});
 page=await app.firstWindow({timeout:30000}); page.setDefaultTimeout(15000);
 await page.locator('#history').click();
 await page.locator('.history-row button').filter({hasText:'History restart check'}).click();
 assert.equal(await page.locator('#claude-manual').inputValue(),'**Saved across restart**');
 await page.locator('#claude-format').click();
 assert.equal(await page.locator('#claude-answer strong').textContent(),'Saved across restart');
 // Mock generation, not the voting/history handlers: exercise the real blind workflow without keys.
 await app.evaluate(({ipcMain,BrowserWindow})=>{ipcMain.removeHandler('compare');ipcMain.handle('compare',(_event,value)=>{
  setTimeout(()=>{for(const id of value.providers) BrowserWindow.getAllWindows()[0].webContents.send('answer',{id,runId:value.runId,model:'secret-model-'+id,status:'done',text:'A useful anonymous answer.',elapsed:100,tokens:10});},30);return {ok:true,value:{started:true}};
 });});
 await page.locator('#mode').selectOption('live');
 await page.locator('#prompt').fill('Blind test question');
 await page.locator('#blind-mode').check();
 await page.locator('#compare').click();
 await page.locator('#claude-vote:not([disabled])').waitFor();
 assert.equal(await page.locator('.card:not([hidden]) h3').first().textContent(),'Answer A');
 for(const id of ['claude','openai','gemini']) {assert.equal(await page.locator(`#${id}-model`).textContent(),'Hidden until reveal');assert.equal(await page.locator(`#${id}-tokens`).isVisible(),false);assert.equal(await page.locator(`#${id}-artifact`).isVisible(),false);}
 assert.equal(await page.locator('#export-json').isDisabled(),true);
 await page.locator('#claude-vote').click();
 await page.locator('#battle-note').filter({hasText:'Winner: Claude'}).waitFor();
 assert.equal(await page.locator('.claude h3').textContent(),'Claude');
 for(const [id,name] of [['claude','Claude'],['openai','OpenAI'],['gemini','Gemini']]) assert.equal(await page.locator(`#${id}-vote`).getAttribute('aria-label'),`${name}: ${id==='claude'?'Winner':'Not selected'}`);
 assert.equal(await page.locator('#export-json').isEnabled(),true);
 const tally=await page.evaluate(()=>window.arena.preferences());assert.equal(tally.tally.claude,1);
 await page.locator('#history').click();await page.locator('.history-row button').filter({hasText:'Blind test question'}).first().click();
 assert.equal(await page.locator('#claude-vote').isDisabled(),true);
 assert.equal((await page.evaluate(()=>window.arena.preferences())).tally.claude,1);
 // Catalog UI with a fake model response; native setup still validates independently on Save.
 await app.evaluate(({ipcMain})=>{ipcMain.removeHandler('list-models');ipcMain.handle('list-models',(_event,id)=>({ok:true,value:id==='openrouter'?['anthropic/test-model','openai/test-model','google/test-model']:['gpt-test-model']}));ipcMain.removeHandler('check-update');ipcMain.handle('check-update',()=>({ok:true,value:{version:'v99.0.0'}}));});
 await page.locator('#connections').click();
 await page.locator('#openai-load-models').click();
 await page.locator('#openai-check-result').filter({hasText:'Key accepted'}).waitFor();
 assert.ok((await page.locator('#openai-config-model option').allTextContents()).includes('gpt-test-model'));
 await page.locator('#connection-route').selectOption('openrouter');
 await page.locator('#openrouter-load-models').click();
 await page.locator('#openrouter-check-result').filter({hasText:'Key accepted'}).waitFor();
 assert.ok((await page.locator('#router-claude-model option').allTextContents()).includes('anthropic/test-model'));
 await page.locator('#check-update-now').click();
 await page.locator('#update-message').filter({hasText:'v99.0.0'}).waitFor({state:'attached'});
 await page.locator('#check-updates').check();
 assert.equal((await page.evaluate(()=>window.arena.preferences())).checkUpdates,true);
 await page.locator('#check-updates').uncheck();
 await page.locator('#close-settings').click();
 assert.deepEqual(networkHits,[],'Artifact preview must send zero requests to the loopback server');
 assert.deepEqual(errors,[]);
 console.log('PASS: manual paste shortcuts preserve answers; pinned preview stays readable at three laptop sizes and scrolls; pinned Compare shortcut and standard menus; friendly IPC errors; blind voting and persistent tally; model menus; update controls; sanitized Markdown; history deletion and full quit/restart persistence; artifact isolation; token counters/exports; scrolling/settings. No paid calls or renderer errors.');
 } catch(error) {console.error('Failure URL:',page?.url(),error); throw error;} finally {probe.closeAllConnections();await new Promise(resolve=>probe.close(resolve));await Promise.race([app.close(),new Promise(resolve=>setTimeout(()=>{app.process().kill('SIGKILL');resolve();},10000).unref())]);fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
