// Drive the shipped UI through Chromium's renderer-only automation connection.
// Never use _electron.launch, main-process evaluate, IPC calls or mocked dialogs here.
const {chromium}=require('playwright-core');
const {spawn,execFile}=require('node:child_process'),{promisify}=require('node:util');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),assert=require('node:assert/strict');
const verifyBundle=require('./verify-bundle.cjs');
const {hash,archivePath}=require('./compare-builds.cjs');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function eventually(fn,timeout=30000) {const end=Date.now()+timeout;while(Date.now()<end){const value=await fn();if(value)return value;await pause(100);}throw new Error('Timed out waiting for release UI operation');}
async function freePort(){const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));return port;}
function portOpen(port){return new Promise(resolve=>{const socket=net.connect({host:'127.0.0.1',port});const finish=value=>{socket.destroy();resolve(value);};socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));socket.setTimeout(300,()=>finish(false));});}
async function nativeAction(child,action,folder,expectedFile) {
 console.log(`Native UI ${action}, PID ${child.pid}`);
 if(process.env.ARENA_MANUAL_NATIVE==='1'){
  console.log(`NATIVE ${action}: PID ${child.pid}; ${expectedFile||''}`);
  if(action==='save')await eventually(()=>fs.existsSync(expectedFile),180000);
  else await eventually(()=>child.exitCode!==null||child.signalCode!==null,180000);
  return;
 }
 if(!process.env.CI)throw new Error('Use ARENA_MANUAL_NATIVE=1 outside CI to handle native Save/Quit through the app UI.');
 if(process.platform==='darwin')await promisify(execFile)('/usr/bin/osascript',[path.join(__dirname,'native/mac-ui.applescript'),String(child.pid),action,folder],{timeout:20000});
 else if(process.platform==='win32')await promisify(execFile)('powershell.exe',['-NoProfile','-File',path.join(__dirname,'native/windows-ui.ps1'),'-TargetPid',String(child.pid),'-Action',action,'-Destination',expectedFile||''],{timeout:20000});
 else throw new Error('Native release smoke supports macOS and Windows.');
}
async function runReleaseSmoke(bundle,{reportFile=process.env.ARENA_RELEASE_REPORT}={}){
 await verifyBundle(bundle);
 const executable=bundle.endsWith('.app')?path.join(bundle,'Contents/MacOS/LLM Battle Arena'):bundle;
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'arena-hardened-')),profile=path.join(dir,'profile'),exports=path.join(dir,'exports');fs.mkdirSync(exports);
 const archiveHash=hash(archivePath(bundle));const executableHash=hash(executable);
 let child,browser,stderr='',page;const errors=[];
 const watchdog=setTimeout(()=>{console.error(`Hardened UI deadline exceeded. Last stderr: ${stderr}`);if(child&&child.exitCode===null)child.kill('SIGKILL');process.exit(1);},process.env.ARENA_MANUAL_NATIVE==='1'?600000:150000);
 async function launch(flag){
  const inspectorPort=await freePort();stderr='';
  child=spawn(executable,[`--user-data-dir=${profile}`,...(process.platform==='darwin'&&process.env.CI?['--use-mock-keychain']:[]),'--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-background-timer-throttling','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',`${flag}=127.0.0.1:${inspectorPort}`],{stdio:['ignore','pipe','pipe']});
  child.on('error',error=>errors.push(error.message));child.stderr.on('data',data=>{stderr=(stderr+data).slice(-64000);});
  const endpoint=await eventually(()=>{if(errors.length)throw new Error(errors.join('; '));if(child.exitCode!==null)throw new Error(`Release exited early: ${stderr}`);return stderr.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[^\s]+)/)?.[1];});
  if(process.platform==='darwin' && process.env.CI)await nativeAction(child,'activate',exports);
  browser=await chromium.connectOverCDP(endpoint);const context=browser.contexts()[0];
  page=await eventually(()=>context.pages().find(p=>p.url().startsWith('file:')));page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
  console.log('Release renderer connected');await require('./ui-ready.cjs')(page);console.log('Release UI ready');
  // A live, initialized UI proves --inspect-brk did not pause startup.
  for(let i=0;i<10;i++){assert.equal(await portOpen(inspectorPort),false,`${flag} opened a main-process inspector endpoint`);await pause(100);}
  assert.ok(!stderr.includes('Debugger listening on'),'Node inspector unexpectedly started');
  return inspectorPort;
 }
 async function quit(){await nativeAction(child,'quit',exports);await eventually(()=>child.exitCode!==null||child.signalCode!==null,10000);assert.equal(child.exitCode,0,'App did not quit cleanly');await browser.close();browser=null;child=null;}
 try{
  await launch('--inspect');
  await page.locator('#compare').click();
  for(const id of ['claude','openai','gemini'])await page.locator(`#${id}-answer`).filter({hasText:'ILLUSTRATIVE SAMPLE'}).waitFor();
  await page.locator('#history').click();await page.locator('#history-list .history-row').first().waitFor();await page.locator('#close-history').click();
  for(const format of ['md','json']){
   const date=new Date().toISOString().slice(0,10),file=path.join(exports,`comparison-${date}.${format}`);
   await page.locator(format==='md'?'#export-md':'#export-json').click();
   await nativeAction(child,'save',exports,file);await eventually(()=>fs.existsSync(file));
   const text=fs.readFileSync(file,'utf8');assert.match(text,/ILLUSTRATIVE SAMPLE/);
   if(format==='json'){const data=JSON.parse(text);assert.equal(data.mode,'sample');for(const id of ['claude','openai','gemini'])assert.match(data.results[id].text,/ILLUSTRATIVE SAMPLE/);}
   await page.locator('#notice').filter({hasText:'Comparison exported.'}).waitFor();
  }
  await quit();
  await launch('--inspect-brk');
  await page.locator('#history').click();await page.locator('#history-list .history-row button').first().click();
  for(const id of ['claude','openai','gemini'])await page.locator(`#${id}-answer`).filter({hasText:'ILLUSTRATIVE SAMPLE'}).waitFor();
  await quit();assert.deepEqual(errors,[]);
  assert.equal(hash(archivePath(bundle)),archiveHash,'Testing changed application archive');assert.equal(hash(executable),executableHash,'Testing changed executable');
  const result={version:require('../package.json').version,platform:process.platform,arch:process.arch,appAsarSha256:archiveHash,executableSha256:executableHash,inspector:false,credentialBackend:process.platform==='darwin'&&process.env.CI?'ci-mock-keychain':'native',ui:['launch','sample','history','native-markdown-export','native-json-export','quit','restart-history'],rejectedInspectorFlags:['--inspect','--inspect-brk']};
  if(reportFile){fs.mkdirSync(path.dirname(path.resolve(reportFile)),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(result,null,2)+'\n');}
  console.log('PASS: hardened release UI, native exports, quit/restart/history; main inspector flags ignored; bundle unchanged.');return result;
 }catch(error){if(page)console.error('Visible failure:',page.url(),await page.locator('#notice').textContent({timeout:3000}).catch(()=>''),await page.locator('#history-message').textContent({timeout:3000}).catch(()=>''));if(page)await page.screenshot({path:path.join(dir,'failure.png'),timeout:5000}).catch(()=>{});console.error(`Release smoke evidence: ${dir}\n${stderr}`);throw error;}
 finally{clearTimeout(watchdog);if(child&&child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await pause(500);}if(browser)await browser.close().catch(()=>{});if(!errors.length && !child)fs.rmSync(dir,{recursive:true,force:true});}
}
module.exports={runReleaseSmoke,portOpen};
if(require.main===module){require('./packaged-preflight.cjs').assertPackagedAppClosed();runReleaseSmoke(path.resolve(process.argv[2]||process.env.ARENA_RELEASE_BUNDLE||'')).catch(error=>{console.error(error);process.exitCode=1;});}
