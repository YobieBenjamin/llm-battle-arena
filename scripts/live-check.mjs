import fs from 'node:fs';
import {runProvider,PROVIDERS} from '../src/providers.js';
// Explicitly configured CI-only keys. Never read desktop settings or print credentials/answers.
const keys={claude:process.env.ARENA_LIVE_CLAUDE_KEY,openai:process.env.ARENA_LIVE_OPENAI_KEY,gemini:process.env.ARENA_LIVE_GEMINI_KEY};
let failed=false, checked=0;
const summaries=[];
function report(message){console.log(message);summaries.push(message);}
for(const id of Object.keys(keys)){
 if(!keys[id]) {report(`${id}: skipped (dedicated secret not configured)`);continue;}
 checked++;
 const model=process.env[`ARENA_LIVE_${id.toUpperCase()}_MODEL`] || PROVIDERS[id].model;
 let outcome;
 // A small bounded budget, rather than claiming exactly ten billed tokens: reasoning models need room to answer.
 await runProvider({id,model,key:keys[id],prompt:'Reply with only the word OK.',maxTokens:256,signal:new AbortController().signal,timeoutMs:120000,emit:update=>{outcome=update;}});
 if(outcome?.code==='output_budget_exhausted'){report(`${id}: INCONCLUSIVE — provider responded, but the 256-token budget was exhausted before visible text. No larger paid retry was sent.`);continue;}
 if(outcome?.status!=='done'){failed=true;report(`${id}: FAILED (${outcome?.status || 'no result'}). Check model availability, billing and credentials.`);}else report(`${id}: OK`);
}
if(!checked)report('SKIPPED: no live requests were made; provider health was not tested.');
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Live provider coverage\n\n'+summaries.map(s=>'- '+s).join('\n')+'\n');
if(failed)process.exitCode=1;
