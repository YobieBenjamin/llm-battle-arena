import test from 'node:test';
import assert from 'node:assert/strict';
import {listModels} from '../src/catalog.js';
import {runProvider} from '../src/providers.js';
import {readProviderError} from '../src/provider-errors.js';
const base={id:'gemini',key:'secret',model:'test',prompt:'test',maxTokens:256,signal:new AbortController().signal};
const response=error=>new Response(JSON.stringify({error}),{status:400});
for(const error of [{message:'API key not valid. SECRET'},{details:[{reason:'API_KEY_INVALID'}]},{status:'API_KEY_INVALID'}])test('invalid Gemini key is actionable in catalog and generation',async()=>{
 await assert.rejects(listModels('gemini','secret',{fetchImpl:async()=>response(error)}),e=>/API key rejected/.test(e.message)&&!e.message.includes('SECRET'));
 let last;await runProvider({...base,fetchImpl:async()=>response(error),emit:e=>last=e});assert.match(last.error,/API key rejected/);assert.ok(!last.error.includes('SECRET'));
});
test('other Gemini 400 errors remain request errors and malformed structures are safe',async()=>{
 for(const body of ['bad JSON',JSON.stringify({error:{message:'Bad model',details:{some:'invalid'}}}),'x'.repeat(9000)]){
  await assert.rejects(listModels('gemini','secret',{fetchImpl:async()=>new Response(body,{status:400})}),/HTTP 400/);
  let last;await runProvider({...base,fetchImpl:async()=>new Response(body,{status:400}),emit:e=>last=e});assert.match(last.error,/HTTP 400/);
 }
});
test('bounded error reader cancels oversized streams and decodes split UTF-8',async()=>{
 let cancelled=false;
 const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(8193));},cancel(){cancelled=true;}});
 assert.equal(await readProviderError(new Response(body)),null);assert.equal(cancelled,true);
 const bytes=new TextEncoder().encode(JSON.stringify({error:{message:'clé API key not valid'}}));
 const split=new ReadableStream({start(c){for(const b of bytes)c.enqueue(new Uint8Array([b]));c.close();}});
 assert.equal((await readProviderError(new Response(split))).message,'clé API key not valid');
});
