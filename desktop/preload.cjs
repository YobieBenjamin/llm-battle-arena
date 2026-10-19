const { contextBridge, ipcRenderer } = require('electron');
async function invoke(channel, ...args) {
  const result = await ipcRenderer.invoke(channel, ...args);
  if (!result?.ok) throw new Error(result?.error || 'The action could not be completed.');
  return result.value;
}
contextBridge.exposeInMainWorld('arena', {
  onClosing: callback => ipcRenderer.on('flush-history', () => callback()),
  finishClose: () => invoke('finish-close'),
  historyList: () => invoke('history-list'),
  historyGet: id => invoke('history-get', id),
  historySave: value => invoke('history-save', value),
  historyRemove: id => invoke('history-remove', id),
  historyClear: () => invoke('history-clear'),
  openAnswerLink: url => invoke('open-answer-link', url),
  preferences: () => invoke('preferences'),
  setUpdates: value => invoke('set-updates',value),
  checkUpdate: () => invoke('check-update'),
  openUpdate: () => invoke('open-update'),
  vote: (id,winner) => invoke('vote',id,winner),
  listModels: (id,key) => invoke('list-models',id,key),
  connections: () => invoke('connections'),
  saveConnections: value => invoke('save-connections', value),
  compare: value => invoke('compare', value),
  cancel: () => invoke('cancel'),
  open: (id, kind) => invoke('open-provider', id, kind),
  copy: text => invoke('copy', text),
  saveArtifact: value => invoke('save-artifact', value),
  export: (text, format) => invoke('export', text, format),
  onUpdate: callback => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('answer', listener);
    return () => ipcRenderer.removeListener('answer', listener);
  }
});
