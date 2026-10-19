import test from 'node:test';
import assert from 'node:assert/strict';
import { readSSE, buildRequest, runProvider, validateRequest } from '../src/providers.js';
const frame = data => `data: ${JSON.stringify(data)}\n\n`;
const stream = text => new Response(text, { headers: { 'Content-Type': 'text/event-stream' } });
const base = { prompt: 'Compare a < b and HTML <div>', model: 'test-model', maxTokens: 2048, key: 'secret-test-key', signal: new AbortController().signal };

test('validation rejects malformed requests and preserves literal prompts', () => {
  const valid = { prompt: 'a < b', providers: ['claude','openai','gemini'], maxTokens: 2048 };
  assert.equal(validateRequest(valid).prompt, 'a < b');
  for (const change of [{prompt:' '}, {providers:['__proto__']}, {providers:['claude','claude']}, {maxTokens:-1}, {maxTokens:'500'}]) assert.throws(() => validateRequest({...valid,...change}));
});
test('all providers preserve identical prompt; keys are headers, not URLs', () => {
  for (const id of ['claude','openai','gemini']) {
    const req = buildRequest(id, base.prompt, base.model, base.maxTokens, base.key);
    assert.ok(JSON.stringify(req.body).includes(base.prompt));
    assert.ok(!req.url.includes(base.key));
    assert.ok(JSON.stringify(req.headers).includes(base.key));
  }
});
test('SSE handles byte boundaries, CRLF, comments and UTF-8', async () => {
  const bytes = new TextEncoder().encode(': ping\r\n\r\ndata: {"text":"🌱"}\r\n\r\ndata: [DONE]\r\n\r\n');
  const body = new ReadableStream({ start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close(); } });
  const events = []; for await (const e of readSSE(body)) events.push(e);
  assert.deepEqual(events, [{text:'🌱'}]);
});
const fixtures = {
  claude: [{type:'content_block_delta',delta:{type:'text_delta',text:'Hello'}},{type:'message_delta',usage:{output_tokens:1},delta:{stop_reason:'end_turn'}},{type:'message_stop'}],
  openai: [{type:'response.output_text.delta',delta:'Hello'},{type:'response.completed',response:{usage:{output_tokens:1}}}],
  gemini: [{candidates:[{content:{parts:[{text:'Hello'}]},finishReason:'STOP'}],usageMetadata:{candidatesTokenCount:1}}]
};
for (const [id, events] of Object.entries(fixtures)) test(`${id} streams text and completes with provider usage`, async () => {
  const updates = [];
  await runProvider({...base,id,emit:e=>updates.push(e),fetchImpl:async()=>stream(events.map(frame).join(''))});
  assert.equal(updates.at(-1).status,'done'); assert.equal(updates.at(-1).text,'Hello'); assert.equal(updates.at(-1).tokens,1);
  assert.ok(updates.some(e=>e.status==='streaming'));
});
test('missing key makes no network request and reports a terminal setup error', async () => {
  const updates=[];
  await runProvider({...base,id:'claude',key:'',emit:e=>updates.push(e),fetchImpl:()=>assert.fail('network called')});
  assert.equal(updates.at(-1).status,'error'); assert.match(updates.at(-1).error,/API key/);
});
test('raw provider errors and credentials never reach UI', async () => {
  const updates=[];
  await runProvider({...base,id:'openai',emit:e=>updates.push(e),fetchImpl:async()=>new Response(base.key,{status:401})});
  assert.equal(updates.at(-1).status,'error'); assert.ok(!JSON.stringify(updates).includes(base.key));
});
test('premature EOF preserves partial answer and reports failure', async () => {
  const updates=[];
  await runProvider({...base,id:'openai',emit:e=>updates.push(e),fetchImpl:async()=>stream(frame(fixtures.openai[0]))});
  assert.equal(updates.at(-1).status,'error'); assert.equal(updates.at(-1).text,'Hello');
});
test('cancellation and timeout produce distinct terminal outcomes', async () => {
  for (const cancelled of [true,false]) {
    const controller = new AbortController(); const updates=[];
    if(cancelled) controller.abort();
    await runProvider({...base,id:'openai',signal:controller.signal,timeoutMs:5,emit:e=>updates.push(e),fetchImpl:async(_url,{signal})=>{
      if(signal.aborted) throw signal.reason;
      await new Promise((resolve,reject)=>{ const keepAlive=setTimeout(resolve,100); signal.addEventListener('abort',()=>{clearTimeout(keepAlive);reject(signal.reason);},{once:true}); });
    }});
    assert.equal(updates.at(-1).status,cancelled?'cancelled':'error');
    if(!cancelled) assert.match(updates.at(-1).error,/Timed out/);
  }
});
test('providers run independently when another provider fails', async () => {
  const updates=[]; const completed=[];
  await Promise.all(['claude','openai','gemini'].map(id=>runProvider({...base,id,emit:e=>{updates.push(e);if(e.status==='done')completed.push(e.id);},fetchImpl:async()=>id==='claude'?new Response('',{status:429}):stream(fixtures[id].map(frame).join(''))})));
  assert.deepEqual(completed.sort(),['gemini','openai']); assert.equal(updates.find(e=>e.id==='claude'&&e.status==='error').text,'');
});
test('output cap is reported explicitly', async()=>{
  const updates=[];
  await runProvider({...base,id:'openai',emit:e=>updates.push(e),fetchImpl:async()=>stream(frame(fixtures.openai[0])+frame({type:'response.incomplete',response:{usage:{output_tokens:10},incomplete_details:{reason:'max_output_tokens'}}}))});
  assert.equal(updates.at(-1).truncated,true);
});
test('Claude reports full input including cached tokens and cumulative output usage',async()=>{
 const updates=[];
 const events=[{type:'message_start',message:{usage:{input_tokens:12,cache_creation_input_tokens:3,cache_read_input_tokens:5}}},...fixtures.claude];
 await runProvider({...base,id:'claude',emit:e=>updates.push(e),fetchImpl:async()=>stream(events.map(frame).join(''))});
 assert.equal(updates.at(-1).inputTokens,20);assert.equal(updates.at(-1).tokens,1);
});
test('OpenAI preserves reported input/output counts and separate reasoning metadata',async()=>{
 const updates=[];const events=[fixtures.openai[0],{type:'response.completed',response:{usage:{input_tokens:25,output_tokens:30,output_tokens_details:{reasoning_tokens:20}}}}];
 await runProvider({...base,id:'openai',emit:e=>updates.push(e),fetchImpl:async()=>stream(events.map(frame).join(''))});
 assert.equal(updates.at(-1).inputTokens,25);assert.equal(updates.at(-1).tokens,30);assert.equal(updates.at(-1).reasoningTokens,20);
});
test('Gemini retains late usage metadata and keeps thoughts separate from answer candidates',async()=>{
 const updates=[];const events=[fixtures.gemini[0],{usageMetadata:{promptTokenCount:13,candidatesTokenCount:8,thoughtsTokenCount:11}}];
 await runProvider({...base,id:'gemini',emit:e=>updates.push(e),fetchImpl:async()=>stream(events.map(frame).join(''))});
 assert.equal(updates.at(-1).inputTokens,13);assert.equal(updates.at(-1).tokens,8);assert.equal(updates.at(-1).reasoningTokens,11);
});
test('filtered partial Gemini output is not falsely marked complete',async()=>{
 const updates=[];
 await runProvider({...base,id:'gemini',emit:e=>updates.push(e),fetchImpl:async()=>stream(frame({candidates:[{content:{parts:[{text:'Partial'}]},finishReason:'SAFETY'}]}))});
 assert.equal(updates.at(-1).status,'error');assert.equal(updates.at(-1).text,'Partial');
});
test('OpenAI content-filter incompletion does not claim output limit reached',async()=>{
 const updates=[];
 await runProvider({...base,id:'openai',emit:e=>updates.push(e),fetchImpl:async()=>stream(frame(fixtures.openai[0])+frame({type:'response.incomplete',response:{incomplete_details:{reason:'content_filter'}}}))});
 assert.equal(updates.at(-1).status,'error');assert.ok(!updates.at(-1).truncated);
});
test('malformed SSE errors never echo raw provider content',async()=>{
 const updates=[];
 await runProvider({...base,id:'openai',emit:e=>updates.push(e),fetchImpl:async()=>stream('data: secret-test-key invalid JSON\n\n')});
 assert.equal(updates.at(-1).status,'error');assert.ok(!JSON.stringify(updates).includes(base.key));
});
test('an unreadable saved key reports unlocking failure, not a missing key',async()=>{
 const updates=[];
 await runProvider({...base,id:'claude',key:'',keyError:'Saved key could not be unlocked. Paste it again.',emit:e=>updates.push(e),fetchImpl:()=>assert.fail('network called')});
 assert.match(updates.at(-1).error,/could not be unlocked/);assert.ok(!updates.at(-1).error.includes('Add an API key'));
});
test('idle timeout fires while waiting for response data',async()=>{
 const updates=[];
 await runProvider({...base,id:'openai',firstByteMs:10,idleMs:10,timeoutMs:1000,emit:e=>updates.push(e),fetchImpl:async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))});
 assert.match(updates.at(-1).error,/waiting for provider data/);
});
test('continuing stream chunks refresh the idle deadline',async()=>{
 const updates=[];
 await runProvider({...base,id:'openai',idleMs:100,timeoutMs:2000,emit:e=>updates.push(e),fetchImpl:async()=>new Response(new ReadableStream({async start(controller){
  for(let i=0;i<8;i++){await new Promise(r=>setTimeout(r,20));controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));}
  controller.enqueue(new TextEncoder().encode(fixtures.openai.map(frame).join('')));controller.close();
 }}))});
 assert.equal(updates.at(-1).status,'done');
});

test('silent thinking gets the first-byte allowance before the shorter idle deadline',async()=>{
 const updates=[];
 await runProvider({...base,id:'openai',firstByteMs:1000,idleMs:10,emit:e=>updates.push(e),fetchImpl:async()=>{
  await new Promise(r=>setTimeout(r,50));
  return stream(fixtures.openai.map(frame).join(''));
 }});
 assert.equal(updates.at(-1).status,'done');
});
test('after first bytes, a stalled stream uses the shorter idle deadline',async()=>{
 const updates=[];
 await runProvider({...base,id:'openai',firstByteMs:1000,idleMs:10,emit:e=>updates.push(e),fetchImpl:async(_url,{signal})=>new Response(new ReadableStream({start(controller){
  controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
  signal.addEventListener('abort',()=>controller.error(signal.reason),{once:true});
 }}))});
 assert.match(updates.at(-1).error,/waiting for provider data/);
});
