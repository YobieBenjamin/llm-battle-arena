import {readProviderError,invalidGeminiKey,billingError} from './provider-errors.js';
import { validTokenCount } from './tokens.js';
export const PROVIDERS = {
  claude: { name: 'Claude', model: 'claude-sonnet-4-6', website: 'https://claude.ai/', keys: 'https://platform.claude.com/settings/keys' },
  openai: { name: 'OpenAI', model: 'gpt-5-mini', website: 'https://chatgpt.com/', keys: 'https://platform.openai.com/api-keys' },
  gemini: { name: 'Gemini', model: 'gemini-2.5-flash', website: 'https://gemini.google.com/', keys: 'https://aistudio.google.com/api-keys' }
};

export function validateRequest(value) {
  if (!value || typeof value.prompt !== 'string' || !value.prompt.trim() || value.prompt.length > 16000) throw new Error('Enter a prompt between 1 and 16,000 characters.');
  if (!Array.isArray(value.providers) || !value.providers.length || value.providers.length > 3 || new Set(value.providers).size !== value.providers.length || value.providers.some(id => !Object.hasOwn(PROVIDERS, id))) throw new Error('Choose one to three providers.');
  if (!Number.isInteger(value.maxTokens) || value.maxTokens < 256 || value.maxTokens > 8192) throw new Error('Output limit must be between 256 and 8,192 tokens.');
  return value;
}

// SSE frames can cross arbitrary network and UTF-8 boundaries.
export async function* readSSE(body, onData = () => {}) {
  if (!body) throw new Error('The provider returned no stream.');
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (value?.length) onData();
      pending += decoder.decode(value, { stream: !done });
      pending = pending.replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = pending.indexOf('\n\n')) !== -1) {
        const frame = pending.slice(0, boundary);
        pending = pending.slice(boundary + 2);
        const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (data && data !== '[DONE]') {
          let parsed;
          try { parsed = JSON.parse(data); } catch { throw new Error('Provider returned an unreadable stream. Partial answer preserved.'); }
          if (!parsed || typeof parsed !== 'object') throw new Error('Provider returned an unreadable stream. Partial answer preserved.');
          yield parsed;
        }
      }
      if (pending.length > 2000000) throw new Error('Provider stream frame is too large.');
      if (done) break;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

export function buildRequest(id, prompt, model, maxTokens, key, route = 'direct') {
  const headers = { 'Content-Type': 'application/json' };
  if (route === 'openrouter') return { url:'https://openrouter.ai/api/v1/chat/completions', headers:{...headers,Authorization:`Bearer ${key}`}, body:{model,max_tokens:maxTokens,stream:true,stream_options:{include_usage:true},messages:[{role:'user',content:prompt}],provider:{allow_fallbacks:false}} };
  if (id === 'claude') return { url: 'https://api.anthropic.com/v1/messages', headers: { ...headers, 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: { model, max_tokens: maxTokens, stream: true, messages: [{ role: 'user', content: prompt }] } };
  if (id === 'openai') return { url: 'https://api.openai.com/v1/responses', headers: { ...headers, Authorization: `Bearer ${key}` }, body: { model, input: prompt, max_output_tokens: maxTokens, stream: true, store: false } };
  if (id === 'gemini') return { url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, headers: { ...headers, 'x-goog-api-key': key }, body: { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } } };
  throw new Error('Unknown provider.');
}

export async function runProvider({ id, prompt, model, maxTokens, key, keyError, signal, emit, fetchImpl = fetch, timeoutMs = 300000, idleMs = 45000, firstByteMs = 120000, route = 'direct', retryDelayMs = 2000 }) {
  const started = Date.now();
  let text = '', tokens = null, inputTokens = null, reasoningTokens = null, finished = false, truncated = false;
  const deadline = new AbortController();
  let timeoutKind = '', idleTimer;
  const totalTimer = setTimeout(() => { timeoutKind = 'total'; deadline.abort(); }, timeoutMs);
  const armIdle = delay => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { timeoutKind = 'idle'; deadline.abort(); }, delay);
  };
  const touch = () => armIdle(text.length ? idleMs : firstByteMs);
  armIdle(firstByteMs);
  const combined = AbortSignal.any([signal, deadline.signal]);
  const send = (status, extra = {}) => emit({ id, model, status, text, tokens, inputTokens, reasoningTokens, elapsed: Date.now() - started, ...extra });
  try {
    if (keyError) throw new Error(keyError);
    if (!key) throw new Error('Add an API key in Connections, or use Website assist.');
    const req = buildRequest(id, prompt, model, maxTokens, key, route);
    send('connecting');
    const request=()=>fetchImpl(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body), signal: combined });
    let response = await request();
    if([503,529].includes(response.status)) {
      await response.body?.cancel(); send('retrying', {error:'Provider busy. Retrying once…'});
      await new Promise((resolve,reject)=>{
        if(combined.aborted) {reject(combined.reason);return;}
        const abort=()=>{clearTimeout(timer);reject(combined.reason);};
        const timer=setTimeout(()=>{combined.removeEventListener('abort',abort);resolve();},retryDelayMs);
        combined.addEventListener('abort',abort,{once:true});
      });
      response=await request();
    }
    if (!response.ok) {
      const error=response.status===400 ? await readProviderError(response) : (await response.body?.cancel(),null);
      if(id==='gemini' && route!=='openrouter' && response.status===400 && invalidGeminiKey(error)) throw new Error('API key rejected. Paste a valid Gemini API key in Connections.');
      if(response.status===402 || billingError(error))throw new Error('Insufficient credit or billing setup. Add credit or enable billing on the provider’s website, then retry.');
      throw new Error(({ 400:'The provider rejected this request (HTTP 400). Check the model and account settings.', 401: 'API key rejected. Check Connections.', 403: 'Access denied. Check your account and model access.', 404: 'Model unavailable. Update the model ID in Connections.', 429: 'Rate limit or billing quota reached. Check your provider account and retry later.' })[response.status] || `Provider returned HTTP ${response.status}. Try again later.`);
    }
    for await (const event of readSSE(response.body, touch)) {
      const hadText=text.length>0;
      if (event.error || event.type === 'error' || event.type === 'response.failed') throw new Error('The provider reported an error during generation. Retry or check your account.');
      if (route === 'openrouter') {
        const choice=event.choices?.[0];
        if(typeof choice?.delta?.content==='string') text+=choice.delta.content;
        if(choice?.finish_reason) { finished=true; truncated=choice.finish_reason==='length'; if(!['stop','length'].includes(choice.finish_reason)) throw new Error('The provider stopped or filtered this answer. Partial answer preserved.'); }
        inputTokens=validTokenCount(event.usage?.prompt_tokens) ?? inputTokens;
        tokens=validTokenCount(event.usage?.completion_tokens) ?? tokens;
        reasoningTokens=validTokenCount(event.usage?.completion_tokens_details?.reasoning_tokens) ?? reasoningTokens;
      } else if (id === 'claude') {
        if (event.type === 'message_start' && event.message?.usage) {
          const usage = event.message.usage;
          if (validTokenCount(usage.input_tokens) !== null) inputTokens = usage.input_tokens + (validTokenCount(usage.cache_creation_input_tokens) ?? 0) + (validTokenCount(usage.cache_read_input_tokens) ?? 0);
        }
        if (event.delta?.type === 'text_delta') text += event.delta.text;
        if (event.usage?.output_tokens != null) tokens = validTokenCount(event.usage.output_tokens);
        if (event.delta?.stop_reason === 'max_tokens') truncated = true;
        if (event.type === 'message_stop') finished = true;
      } else if (id === 'openai') {
        if (event.type === 'response.output_text.delta') text += event.delta;
        if (event.type === 'response.completed' || event.type === 'response.incomplete') {
          finished = true;
          tokens = validTokenCount(event.response?.usage?.output_tokens);
          inputTokens = validTokenCount(event.response?.usage?.input_tokens);
          reasoningTokens = validTokenCount(event.response?.usage?.output_tokens_details?.reasoning_tokens);
          truncated = event.type === 'response.incomplete' && event.response?.incomplete_details?.reason === 'max_output_tokens';
          if (event.type === 'response.incomplete' && !truncated) throw new Error('The provider stopped this answer before completion. Partial answer preserved.');
        }
        if (event.type === 'response.refusal.delta') text += event.delta;
      } else {
        const candidate = event.candidates?.[0];
        text += (candidate?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
        tokens = validTokenCount(event.usageMetadata?.candidatesTokenCount) ?? tokens;
        inputTokens = validTokenCount(event.usageMetadata?.promptTokenCount) ?? inputTokens;
        reasoningTokens = validTokenCount(event.usageMetadata?.thoughtsTokenCount) ?? reasoningTokens;
        if (candidate?.finishReason) {
          finished = true;
          truncated = candidate.finishReason === 'MAX_TOKENS';
          if (!['STOP', 'MAX_TOKENS'].includes(candidate.finishReason)) throw new Error('The provider stopped or filtered this answer. Partial answer preserved.');
        }
        if (event.promptFeedback?.blockReason) throw new Error('The provider blocked this prompt. Try another prompt.');
      }
      if(!hadText && text.length)armIdle(idleMs);
      send('streaming');
    }
    if (combined.aborted) throw combined.reason;
    if (!finished) throw new Error('Connection ended before generation finished. Partial answer preserved.');
    if (!text) {const error=new Error(truncated?'The output budget was exhausted before an answer appeared. Try a higher output limit.':'No answer text returned. The output limit or safety settings may have stopped generation.');error.code=truncated?'output_budget_exhausted':'no_answer';throw error;}
    send('done', { truncated });
  } catch (error) {
    send(signal.aborted ? 'cancelled' : 'error', { code:error.code, error: signal.aborted ? 'Stopped. Partial answer preserved.' : timeoutKind ? (timeoutKind === 'idle' ? 'Timed out waiting for provider data. Partial answer preserved.' : 'Timed out at the request time limit. Partial answer preserved.') : error.message });
  } finally { clearTimeout(totalTimer); clearTimeout(idleTimer); }
}
