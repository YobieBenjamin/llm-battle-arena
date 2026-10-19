import fs from 'node:fs';
import path from 'node:path';
import { PROVIDERS } from '../src/providers.js';

export function createStore(directory, crypto) {
  const file = path.join(directory, 'connections.json');
  let settings = {};
  if (fs.existsSync(file)) settings = JSON.parse(fs.readFileSync(file, 'utf8'));
  function canPersist() { return crypto.isEncryptionAvailable() && crypto.getSelectedStorageBackend?.() !== 'basic_text'; }
  function snapshot() {
    return { canPersist: canPersist(), providers: Object.fromEntries(Object.entries(PROVIDERS).map(([id, p]) => [id, { model: settings[id]?.model || p.model, connected: Boolean(settings[id]?.secret) }])) };
  }
  return {
    snapshot,
    key(id) { return settings[id]?.secret ? crypto.decryptString(Buffer.from(settings[id].secret, 'base64')) : ''; },
    save(input) {
      if (!input || typeof input !== 'object') throw new Error('Invalid connection settings.');
      const next = structuredClone(settings);
      for (const id of Object.keys(PROVIDERS)) {
        const entry = input[id];
        if (!entry || typeof entry.model !== 'string' || !/^[a-zA-Z0-9._:-]{1,120}$/.test(entry.model)) throw new Error('Enter a valid model ID for each provider.');
        if (typeof entry.key !== 'string' || entry.key.length > 4096 || /[\r\n]/.test(entry.key)) throw new Error('Invalid API key.');
        next[id] = { ...next[id], model: entry.model };
        if (entry.remove) delete next[id].secret;
        else if (entry.key.trim()) {
          if (!canPersist()) throw new Error('OS credential encryption is unavailable. Use Website assist on this machine.');
          next[id].secret = crypto.encryptString(entry.key.trim()).toString('base64');
        }
      }
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(file + '.tmp', JSON.stringify(next), { mode: 0o600 });
      fs.renameSync(file + '.tmp', file);
      settings = next;
      return snapshot();
    }
  };
}
