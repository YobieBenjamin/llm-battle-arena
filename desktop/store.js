import fs from 'node:fs';
import path from 'node:path';
import { ROUTER_MODELS, MODEL_ID } from '../src/catalog.js';
import { PROVIDERS } from '../src/providers.js';

export function createStore(directory, crypto) {
  const file = path.join(directory, 'connections.json');
  let settings = {};
  if (fs.existsSync(file)) {
    settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error('Invalid saved connections.');
    for (const [id, entry] of Object.entries(settings)) {
      if ((!Object.hasOwn(PROVIDERS, id) && id !== 'openrouter') || !entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.model !== 'string' || !/^[a-zA-Z0-9._:-]{1,120}$/.test(entry.model) || (entry.secret !== undefined && (typeof entry.secret !== 'string' || !/^[A-Za-z0-9+/]+=*$/.test(entry.secret)))) throw new Error('Invalid saved connection.');
      if(id==='openrouter' && (typeof entry.enabled!=='boolean' || !entry.models || !Object.keys(PROVIDERS).every(provider=>typeof entry.models[provider]==='string' && MODEL_ID.test(entry.models[provider]) && entry.models[provider].startsWith({claude:'anthropic/',openai:'openai/',gemini:'google/'}[provider])))) throw new Error('Invalid saved OpenRouter settings.');
    }
  }
  function canPersist() { return crypto.isEncryptionAvailable() && crypto.getSelectedStorageBackend?.() !== 'basic_text'; }
  function encrypt(key) {try{return crypto.encryptString(key.trim()).toString('base64');}catch{throw new Error('Your credential store could not save the key. Unlock it and try again.');}}
  function snapshot() {
    return { canPersist: canPersist(), route:settings.openrouter?.enabled?'openrouter':'direct', openrouter:{connected:Boolean(settings.openrouter?.secret),models:{...ROUTER_MODELS,...settings.openrouter?.models}}, providers: Object.fromEntries(Object.entries(PROVIDERS).map(([id, p]) => [id, { model: settings[id]?.model || p.model, connected: Boolean(settings[id]?.secret) }])) };
  }
  return {
    snapshot,
    key(id) { try{return settings[id]?.secret ? crypto.decryptString(Buffer.from(settings[id].secret, 'base64')) : '';}catch{throw new Error('Saved key could not be unlocked. Unlock your credential store or paste this provider’s key again.');} },
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
          next[id].secret = encrypt(entry.key);
        }
      }
      if(input.openrouter) {
        const r=input.openrouter;
        if(typeof r.key!=='string' || r.key.length>4096 || /[\r\n]/.test(r.key) || typeof r.enabled!=='boolean') throw new Error('Invalid OpenRouter settings.');
        const models={};
        for(const id of Object.keys(PROVIDERS)) {
          const model=r.models?.[id], prefix={claude:'anthropic/',openai:'openai/',gemini:'google/'}[id];
          if(typeof model!=='string' || !MODEL_ID.test(model) || !model.startsWith(prefix)) throw new Error('Choose a matching OpenRouter model for each card.');
          models[id]=model;
        }
        next.openrouter={...next.openrouter,model:'openrouter',models,enabled:r.enabled};
        if(r.remove) delete next.openrouter.secret;
        else if(r.key.trim()) {
          if(!canPersist()) throw new Error('OS credential encryption is unavailable.');
          next.openrouter.secret=encrypt(r.key);
        }
        if(r.enabled && !next.openrouter.secret) throw new Error('Add an OpenRouter key before enabling it.');
      }
      try { fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(file + '.tmp', JSON.stringify(next), { mode: 0o600 });
      fs.renameSync(file + '.tmp', file);
      } catch {throw new Error('Connections could not be saved. Check folder access and free disk space.');}
      settings = next;
      return snapshot();
    }
  };
}
