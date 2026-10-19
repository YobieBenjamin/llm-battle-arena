const { app, BrowserWindow, ipcMain, safeStorage, shell, clipboard, dialog, screen, Menu, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
let window, store, history, preferences, checkUpdate, listModels, providers, runProvider, validateRequest;
const ownsProfile=app.requestSingleInstanceLock();
if(!ownsProfile)app.quit();
app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}else if(app.isReady() && store)createWindow();});
let quitting = false;
app.on('before-quit', () => { quitting=true; });
const running = new Map();
const entry = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
function trusted(event) {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== entry) throw new Error('Untrusted caller.');
}
function handle(name, fn) {
  ipcMain.handle(name, async (event, ...args) => {
    try { trusted(event); return { ok: true, value: await fn(...args) }; }
    catch (error) { return { ok: false, error: error.message || 'The action could not be completed.' }; }
  });
}
function cancel() { for (const controller of running.values()) controller.abort(); }
function createWindow() {
  const area = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(1440, Math.max(400, area.width - 32));
  const height = Math.min(980, Math.max(400, area.height - 32));
  window = new BrowserWindow({ width, height, minWidth: Math.min(880, width), minHeight: Math.min(650, height), backgroundColor: '#101319', title: 'LLM Battle Arena', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
  const createdWindow=window;
  window.setMenuBarVisibility(false);
  window.webContents.on('render-process-gone',async()=>{
    if(quitting)return;
    cancel();
    const failedWindow=window;
    const result=await dialog.showMessageBox({type:'warning',title:'Arena needs to reload',message:'The display stopped responding. Saved comparisons are still in History.',buttons:['Reload','Quit'],defaultId:0,cancelId:1});
    if(result.response===0 && window===failedWindow && !failedWindow.isDestroyed()){createWindow();failedWindow.destroy();}
    else if(result.response!==0)app.quit();
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.on('will-frame-navigate', event => {
    if (!['about:srcdoc', 'about:blank'].includes(event.url)) event.preventDefault();
  });
  let closing=false, closeTimer;
  window.on('close', event => {
    if(closing) return;
    event.preventDefault(); closing=true;
    window.webContents.send('flush-history');
    closeTimer=setTimeout(()=>quitting ? app.quit() : window?.close(),2000);
  });
  window.on('closed', () => clearTimeout(closeTimer));
  window.on('closed', () => { cancel(); if(window===createdWindow)window = null; });
  window.loadFile(path.join(__dirname, '..', 'index.html'));
}
if(ownsProfile) app.whenReady().then(async () => {
  ({ PROVIDERS: providers, runProvider, validateRequest } = await import('../src/providers.js'));
  const { createStore } = await import('./store.js');
  const dataDirectory = app.getPath('userData');
  const { createHistory } = await import('./history.js');
  async function recoverStorage(name,factory) {
    try{return factory(dataDirectory);}catch{
      const answer=await dialog.showMessageBox({type:'warning',title:`${name} unavailable`,message:`${name} could not be read or backed up.`,detail:`Folder: ${dataDirectory}\nUse a temporary session to continue without overwriting these files. Export any work before quitting.`,buttons:['Use temporary session','Open folder and quit','Quit'],defaultId:0,cancelId:2});
      if(answer.response!==0){if(answer.response===1)await shell.openPath(dataDirectory);app.quit();return null;}
      return factory(dataDirectory,{temporary:true});
    }
  }
  history = await recoverStorage('History',createHistory);if(!history)return;
  ({ listModels } = await import('../src/catalog.js'));
  const {createPreferences,createUpdateCheck}=await import('./preferences.js');
  preferences=await recoverStorage('Preferences',createPreferences);if(!preferences)return; checkUpdate=createUpdateCheck(app.getVersion());
  try { store = createStore(dataDirectory, safeStorage); }
  catch {
    const file = path.join(dataDirectory, 'connections.json');
    const result = await dialog.showMessageBox({ type: 'warning', title: 'Connections could not be loaded', message: 'Saved connection settings are damaged.', detail: `Settings file: ${file}\n\nReset connections keeps a backup and starts fresh. You will need to paste your API keys again.`, buttons: ['Reset connections', 'Open settings folder', 'Quit'], defaultId: 2, cancelId: 2 });
    if (result.response === 1) { await shell.openPath(dataDirectory); app.quit(); return; }
    if (result.response !== 0) { app.quit(); return; }
    try {
      await fs.rename(file, `${file}.${Date.now()}.bak`);
      store = createStore(dataDirectory, safeStorage);
    } catch { dialog.showErrorBox('Could not reset connections', `Close the app and rename the settings file manually:\n${file}`); app.quit(); return; }
  }
  // Provider calls use main-process fetch; rendered content never needs network access.
  session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true}));
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }] }] : []),
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label:'View', submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}] },
    { label: 'Window', submenu: [{ role: 'close' }, { role: 'minimize' }, { role: 'zoom' }, ...(process.platform === 'darwin' ? [{ type: 'separator' }, { role: 'front' }] : [])] }
  ]));
  handle('finish-close', () => { setImmediate(()=>quitting ? app.quit() : window?.close()); });
  handle('history-list', () => history.list());
  handle('history-get', id => { const entry=history.get(id); const winner=preferences.winner(id); if(entry?.blind && winner) entry.blind={...entry.blind,revealed:true,winner}; return entry; });
  handle('history-save', value => history.save(value));
  handle('history-remove', id => history.remove(id));
  handle('history-clear', () => history.clear());
  handle('open-answer-link', value => {
    if (typeof value !== 'string' || value.length > 4096) throw new Error('Invalid link.');
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Only ordinary web links can be opened.');
    return shell.openExternal(url.href);
  });
  handle('preferences', () => preferences.snapshot());
  handle('set-updates', value => preferences.setUpdates(value));
  handle('check-update', () => checkUpdate());
  handle('open-update', () => shell.openExternal('https://github.com/YobieBenjamin/llm-battle-arena/releases/latest'));
  handle('vote', (id,winner) => {
    const entry=history.get(id);
    const existing=preferences.winner(id);if(existing)return {...preferences.snapshot(),winner:existing};
    if(!entry?.blind || entry.blind.revealed || !entry.blind.order.includes(winner) || !entry.blind.order.every(provider=>entry.results[provider]?.status==='done' && entry.results[provider]?.text)) throw new Error('Finish all blind answers before picking a winner.');
    preferences.vote(id,winner); entry.blind.revealed=true; entry.blind.winner=winner;
    try{history.save(entry);}catch{return {...preferences.snapshot(),winner,warning:'Your vote was saved. Its history copy could not be updated; reopening the comparison will recover the winner.'};}
    return {...preferences.snapshot(),winner};
  });
  handle('connections', () => store.snapshot());
  handle('list-models', async (id,key) => {
    if(!['claude','openai','gemini','openrouter'].includes(id) || typeof key!=='string') throw new Error('Invalid provider.');
    return listModels(id,key.trim() || store.key(id));
  });
  handle('save-connections', async value => {
    if(running.size) throw new Error('Wait for the comparison to finish before changing connections.');
    if(!value || typeof value!=='object') throw new Error('Invalid settings.');
    const before=store.snapshot();
    // Check the whole submission before any provider request, including keys in later fields.
    const hasNewKey=['claude','openai','gemini','openrouter'].some(id=>!value[id]?.remove && typeof value[id]?.key==='string' && value[id].key.trim());
    if(hasNewKey && !before.canPersist)throw new Error('OS credential encryption is unavailable. Use Website assist on this machine.');
    for(const id of ['claude','openai','gemini','openrouter']) {
      const entry=value[id]; if(!entry || entry.remove) continue;
      if(typeof entry.key!=='string')throw new Error('Invalid API key.');
      // Check only new keys or changed settings on the active route. Never generate text here.
      const active=id==='openrouter'?value.openrouter?.enabled:!value.openrouter?.enabled;
      const changed=id==='openrouter'?(entry.enabled!== (before.route==='openrouter') || Object.keys(providers).some(p=>entry.models?.[p]!==before.openrouter.models[p])):entry.model!==before.providers[id].model;
      if(entry.key.trim() || (active && changed)) {
        const key=entry.key.trim() || store.key(id); if(!key) continue;
        try { await listModels(id,key); } catch(error) { throw new Error(`${providers[id]?.name || 'OpenRouter'}: ${error.message}`); }
      }
    }
    if(running.size) throw new Error('Wait for the comparison to finish before changing connections.');
    return store.save(value);
  });
  handle('compare', value => {
    validateRequest(value);
    if (typeof value.runId !== 'string' || !/^[\w-]{1,100}$/.test(value.runId)) throw new Error('Invalid comparison ID.');
    if (value.providers.some(id => running.has(id))) throw new Error('A comparison is already running.');
    const config = store.snapshot();
    for (const id of value.providers) {
      const controller = new AbortController();
      running.set(id, controller);
      // Capture key before launch so a decryption error cannot strand the run.
      let key = '', keyError = '';
      try { key = store.key(config.route==='openrouter'?'openrouter':id); } catch { keyError = 'Saved key could not be unlocked. Open Connections and paste it again, or unlock your OS credential store.'; }
      runProvider({ id, prompt: value.prompt, model: config.route==='openrouter'?config.openrouter.models[id]:config.providers[id].model, route:config.route, maxTokens: value.maxTokens, key, keyError, signal: controller.signal, emit: update => {
        if (window && !window.isDestroyed()) window.webContents.send('answer', { ...update, runId: value.runId });
      } }).finally(() => running.delete(id));
    }
    return { started: true };
  });
  handle('cancel', () => cancel());
  handle('open-provider', (id, kind) => {
    if(id==='openrouter' && kind==='keys') return shell.openExternal('https://openrouter.ai/settings/keys');
    if (!Object.hasOwn(providers, id) || !['website', 'keys'].includes(kind)) throw new Error('Invalid provider link.');
    return shell.openExternal(providers[id][kind]);
  });
  handle('copy', text => { if (typeof text !== 'string' || text.length > 4000000) throw new Error('Invalid text.'); clipboard.writeText(text); });
  handle('save-artifact', async value => {
    if (!value || typeof value.name !== 'string' || !/^[a-z0-9-]+\.(html|svg|json|csv|md|txt|js|ts|jsx|tsx|py|css)$/.test(value.name) || typeof value.content !== 'string' || value.content.length > 1000000) throw new Error('Invalid artifact file.');
    const extension = value.name.split('.').pop();
    const result = await dialog.showSaveDialog(window, { defaultPath: value.name, filters: [{ name: 'Artifact file', extensions: [extension] }] });
    if (result.canceled) return false;
    await fs.writeFile(result.filePath, value.content, 'utf8');
    return true;
  });
  handle('export', async (text, format) => {
    if (!['md', 'json'].includes(format) || typeof text !== 'string' || text.length > 4000000) throw new Error('Invalid export.');
    const result = await dialog.showSaveDialog(window, { defaultPath: `comparison-${new Date().toISOString().slice(0, 10)}.${format}`, filters: [{ name: format === 'md' ? 'Markdown' : 'JSON', extensions: [format] }] });
    if (result.canceled) return false;
    await fs.writeFile(result.filePath, text, 'utf8');
    return true;
  });
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
}).catch(()=>{dialog.showErrorBox('Arena could not start','Local settings could not be opened. Check the app-data folder permissions and free disk space, then reopen the app.');app.quit();});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
