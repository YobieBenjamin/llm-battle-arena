const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('arena', {
  connections: () => ipcRenderer.invoke('connections'),
  saveConnections: value => ipcRenderer.invoke('save-connections', value),
  compare: value => ipcRenderer.invoke('compare', value),
  cancel: () => ipcRenderer.invoke('cancel'),
  open: (id, kind) => ipcRenderer.invoke('open-provider', id, kind),
  copy: text => ipcRenderer.invoke('copy', text),
  export: (text, format) => ipcRenderer.invoke('export', text, format),
  onUpdate: callback => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('answer', listener);
    return () => ipcRenderer.removeListener('answer', listener);
  }
});
