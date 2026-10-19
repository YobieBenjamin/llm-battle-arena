import {runProvider,PROVIDERS} from '../src/providers.js';
// Explicitly configured CI-only keys. Never read desktop settings or print credentials/answers.
const keys={claude:process.env.ARENA_LIVE_CLAUDE_KEY,openai:process.env.ARENA_LIVE_OPENAI_KEY,gemini:process.env.ARENA_LIVE_GEMINI_KEY};
let failed=false;
for(const id of Object.keys(keys)){
 if(!keys[id]) {console.log(`${id}: skipped (dedicated secret not configured)`);continue;}
 const model=process.env[`ARENA_LIVE_${id.toUpperCase()}_MODEL`] || PROVIDERS[id].model;
 let outcome;
 // A small bounded budget, rather than claiming exactly ten billed tokens: reasoning models need room to answer.
 await runProvider({id,model,key:keys[id],prompt:'Reply with only the word OK.',maxTokens:256,signal:new AbortController().signal,timeoutMs:120000,emit:update=>{outcome=update;}});
 if(outcome?.status!=='done'){failed=true;console.error(`${id}: FAILED (${outcome?.status || 'no result'}). Check model availability, billing and credentials.`);}else console.log(`${id}: OK`);
}
if(failed)process.exitCode=1;
