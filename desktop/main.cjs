const { app, BrowserWindow, ipcMain, safeStorage, shell, clipboard, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
let window, store, providers, runProvider, validateRequest;
const running = new Map();
const entry = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
function trusted(event) {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== entry) throw new Error('Untrusted caller.');
}
function handle(name, fn) { ipcMain.handle(name, (event, ...args) => { trusted(event); return fn(...args); }); }
function cancel() { for (const controller of running.values()) controller.abort(); }
function createWindow() {
  window = new BrowserWindow({ width: 1440, height: 980, minWidth: 880, minHeight: 650, backgroundColor: '#101319', title: 'LLM Battle Arena', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
  window.setMenuBarVisibility(false);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.on('closed', () => { cancel(); window = null; });
  window.loadFile(path.join(__dirname, '..', 'index.html'));
}
app.whenReady().then(async () => {
  ({ PROVIDERS: providers, runProvider, validateRequest } = await import('../src/providers.js'));
  const { createStore } = await import('./store.js');
  try { store = createStore(app.getPath('userData'), safeStorage); }
  catch { dialog.showErrorBox('Connections could not be loaded', 'The saved connection file is damaged. Restore or remove connections.json in the app data directory.'); app.quit(); return; }
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
      let key = '';
      try { key = store.key(id); } catch { /* Provider receives a useful setup error. */ }
      runProvider({ id, prompt: value.prompt, model: config.providers[id].model, maxTokens: value.maxTokens, key, signal: controller.signal, emit: update => {
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
