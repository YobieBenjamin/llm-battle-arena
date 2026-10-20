// Private regression build only: imported audit corpus is data, not an executable harness.
require('./packaged-preflight.cjs').assertPackagedAppClosed();
const { _electron: electron } = require('playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const corpus=require('../test/fixtures/code-corpus.cjs');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-code-'));
 const app=await electron.launch({executablePath:process.env.ARENA_ELECTRON_PATH||require('electron'),args:[path.resolve(__dirname,'..'),`--user-data-dir=${dir}`,...(process.platform==='linux'?['--no-sandbox']:[])]});
 try{
 const page=await app.firstWindow();await require('./ui-ready.cjs')(page);
 await app.evaluate(({ipcMain})=>{ipcMain.removeHandler('copy');ipcMain.handle('copy',(_e,text)=>{globalThis.copiedCode=text;return {ok:true,value:true};});});
 await page.locator('#mode').selectOption('manual');await page.locator('#prompt').fill('Code rendering regression');await page.locator('#compare').click();
 for(const id of ['claude','openai','gemini']){await page.locator(`#${id}-manual`).fill(corpus.answer());await page.locator(`#${id}-format`).click();}
 for(const [width,height] of [[880,650],[1280,720],[1920,1080]]){
 await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(...size),[width,height]);
 for(const id of ['claude','openai','gemini']){
 const answer=page.locator(`#${id}-answer`);
 assert.deepEqual(await answer.locator('pre code').allTextContents(),corpus.cases.map(c=>c.code+'\n'));
 assert.equal(await answer.locator('h1').evaluate(el=>getComputedStyle(el).letterSpacing),'normal');
 assert.equal(await answer.locator('th').first().evaluate(el=>getComputedStyle(el).whiteSpace),'nowrap');
 assert.equal(await answer.locator('td').first().evaluate(el=>getComputedStyle(el).overflowWrap),'normal');
 const pre=answer.locator('pre').nth(2);
 const css=await pre.evaluate(el=>({white:getComputedStyle(el).whiteSpace,tab:getComputedStyle(el).tabSize,font:getComputedStyle(el).fontSize,bar:getComputedStyle(el,'::-webkit-scrollbar').height,contained:el.getBoundingClientRect().right<=el.closest('.answer').getBoundingClientRect().right}));
 assert.deepEqual(css,{white:'pre',tab:'4',font:'12px',bar:'10px',contained:true});
 await pre.focus();await pre.press('ArrowRight');await page.waitForFunction(id=>document.querySelector(`#${id}-answer`).querySelectorAll('pre')[2].scrollLeft>0,id);
 }
 }
 await page.locator('#claude-answer .code-toolbar button').nth(1).click();
 assert.equal(await app.evaluate(()=>globalThis.copiedCode),corpus.cases[1].code+'\n');
 for (let i=0;i<corpus.cases.length;i++) {
 await page.locator('#claude-answer .code-toolbar button').nth(i).click();
 assert.equal(await app.evaluate(()=>globalThis.copiedCode),corpus.cases[i].code+'\n',corpus.cases[i].id);
 }
 await page.locator('#claude-copy').click();assert.equal(await app.evaluate(()=>globalThis.copiedCode),corpus.answer());
 await page.locator('#claude-artifact').click();
 const source=page.locator('#artifact-body pre');await source.waitFor();
 assert.equal(await source.evaluate(el=>getComputedStyle(el).whiteSpace),'pre');assert.equal(await source.getAttribute('tabindex'),'0');
 await page.locator('#artifact-body .code-toolbar button').click();assert.equal(await app.evaluate(()=>globalThis.copiedCode),await source.textContent());
 await page.locator('#artifact-close').click();
 await app.evaluate(({ipcMain})=>{ipcMain.removeHandler('copy');ipcMain.handle('copy',()=>({ok:false,error:'unavailable'}));});
 await page.locator('#claude-answer .code-toolbar button').first().click();await page.locator('#notice').filter({hasText:'Could not copy code'}).waitFor();
 assert.equal(await page.locator('#claude-answer .code-toolbar button').first().isEnabled(),true);
 assert.equal(await page.locator('.answer script,.answer img,.answer iframe,.answer input').count(),0);
 console.log('PASS: audit corpus exact in all cards; headings/tables; code font/tabs; visible scrollbars; keyboard scrolling; exact block/answer/source copy; copy failure recovery; source unwrapped; inert HTML.');
 }finally{await app.close();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
