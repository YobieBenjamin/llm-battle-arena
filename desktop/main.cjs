const { app, BrowserWindow, ipcMain, safeStorage, shell, clipboard, dialog, screen, Menu, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
let window, store, history, providers, runProvider, validateRequest;
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
  window.setMenuBarVisibility(false);
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
  window.on('closed', () => { cancel(); window = null; });
  window.loadFile(path.join(__dirname, '..', 'index.html'));
}
app.whenReady().then(async () => {
  ({ PROVIDERS: providers, runProvider, validateRequest } = await import('../src/providers.js'));
  const { createStore } = await import('./store.js');
  const dataDirectory = app.getPath('userData');
  const { createHistory } = await import('./history.js');
  history = createHistory(dataDirectory);
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
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }] }] : []),
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'Window', submenu: [{ role: 'close' }, { role: 'minimize' }, { role: 'zoom' }, ...(process.platform === 'darwin' ? [{ type: 'separator' }, { role: 'front' }] : [])] }
  ]));
  handle('finish-close', () => { setImmediate(()=>quitting ? app.quit() : window?.close()); });
  handle('history-list', () => history.list());
  handle('history-get', id => history.get(id));
  handle('history-save', value => history.save(value));
  handle('history-remove', id => history.remove(id));
  handle('history-clear', () => history.clear());
  handle('open-answer-link', value => {
    if (typeof value !== 'string' || value.length > 4096) throw new Error('Invalid link.');
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Only ordinary web links can be opened.');
    return shell.openExternal(url.href);
  });
  handle('connections', () => store.snapshot());
  handle('save-connections', value => { if (running.size) throw new Error('Wait for the comparison to finish before changing connections.'); return store.save(value); });
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
      try { key = store.key(id); } catch { keyError = 'Saved key could not be unlocked. Open Connections and paste it again, or unlock your OS credential store.'; }
      runProvider({ id, prompt: value.prompt, model: config.providers[id].model, maxTokens: value.maxTokens, key, keyError, signal: controller.signal, emit: update => {
        if (window && !window.isDestroyed()) window.webContents.send('answer', { ...update, runId: value.runId });
      } }).finally(() => running.delete(id));
    }
    return { started: true };
  });
  handle('cancel', () => cancel());
  handle('open-provider', (id, kind) => {
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
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
