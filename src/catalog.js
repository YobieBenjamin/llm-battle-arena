import {readProviderError,invalidGeminiKey} from './provider-errors.js';
export const ROUTER_MODELS = {claude:'anthropic/claude-sonnet-4.6',openai:'openai/gpt-5-mini',gemini:'google/gemini-2.5-flash'};
export const MODEL_ID = /^[a-zA-Z0-9._:/-]{1,160}$/;
export async function listModels(id,key,{fetchImpl=fetch,signal=AbortSignal.timeout(15000)}={}) {
  if(!['claude','openai','gemini','openrouter'].includes(id) || typeof key!=='string' || !key.trim() || key.length>4096 || /[\r\n]/.test(key)) throw new Error('Paste a valid API key first.');
  const headers=id==='claude'?{'x-api-key':key,'anthropic-version':'2023-06-01'}:id==='gemini'?{'x-goog-api-key':key}:{Authorization:`Bearer ${key}`};
  async function get(url) {
    let response;
    try { response=await fetchImpl(url,{headers,signal,redirect:'error'}); } catch { throw new Error('Could not check the key. Check your internet connection and try again.'); }
    if(!response.ok) {
      const error=id==='gemini' && response.status===400 ? await readProviderError(response) : (await response.body?.cancel(),null);
      if(id==='gemini' && response.status===400 && invalidGeminiKey(error)) throw new Error('API key rejected. Paste a valid Gemini API key in Connections.');
      throw new Error(response.status===401||response.status===403?'Key rejected or model-list access denied. Check the key and its permissions.':`Model check unavailable (HTTP ${response.status}). Try again later.`);
    }
    try { return await response.json(); } catch { throw new Error('The model list could not be read. Try again later.'); }
  }
  if(id==='openrouter') await get('https://openrouter.ai/api/v1/key'); // The public catalog alone does not validate credentials.
  const base={claude:'https://api.anthropic.com/v1/models?limit=100',openai:'https://api.openai.com/v1/models',gemini:'https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',openrouter:'https://openrouter.ai/api/v1/models'}[id];
  let url=base, models=[];const seen=new Set();
  for(let page=0;page<20;page++) {
    const data=await get(url); const rows=id==='gemini'?data.models:data.data;
    if(!Array.isArray(rows)) throw new Error('The provider returned an unexpected model list.');
    for(const row of rows) {
      const model=id==='gemini'?row.name?.replace(/^models\//,''):row.id;
      if(typeof model!=='string' || !MODEL_ID.test(model)) continue;
      if(id==='gemini' && !row.supportedGenerationMethods?.includes('generateContent')) continue;
      if(id==='openai' && (!/^(gpt-|o[1-9])/.test(model) || /audio|realtime|image|transcribe|tts|search|instruct|^gpt-3\.5/.test(model))) continue;
      if(id==='openrouter' && (!/^(anthropic|openai|google)\//.test(model) || (row.architecture?.output_modalities && !row.architecture.output_modalities.includes('text')))) continue;
      models.push(model);
    }
    const next=id==='gemini'?data.nextPageToken:id==='claude' && data.has_more?data.last_id:null;
    if(!next) return [...new Set(models)].sort();
    if(seen.has(next))throw new Error('The provider repeated a catalog page. Try loading models again later.');seen.add(next);
    url=base+`&${id==='gemini'?'pageToken':'after_id'}=${encodeURIComponent(next)}`;
  }
  throw new Error('The model catalog is too large to load completely. Try again later.');
}
