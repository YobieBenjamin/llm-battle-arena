import fs from 'node:fs';
import path from 'node:path';
const ids = ['claude', 'openai', 'gemini'];
function clean(value) {
  if (!value || typeof value.id !== 'string' || !/^[\w-]{1,100}$/.test(value.id) || !['sample','manual','live'].includes(value.mode) || typeof value.prompt !== 'string' || value.prompt.length > 16000 || !Number.isFinite(Date.parse(value.timestamp))) throw new Error('Invalid history entry.');
  const results = {};
  for (const id of ids) {
    const r = value.results?.[id];
    if (!r) continue;
    if (typeof r.text !== 'string' || r.text.length > 2000000) throw new Error('Answer is too large to save in history. Export it instead.');
    results[id] = { id, prompt: value.prompt, text: r.text };
    for (const key of ['model','status','error']) if (typeof r[key] === 'string') results[id][key] = r[key].slice(0,1000);
    for (const key of ['tokens','inputTokens','reasoningTokens','elapsed']) if (Number.isFinite(r[key]) && r[key] >= 0) results[id][key] = r[key];
    results[id].truncated = r.truncated === true;
  }
  return { id:value.id, prompt:value.prompt, mode:value.mode, timestamp:value.timestamp, route:value.route==='openrouter'?'openrouter':'direct', blind:value.blind && value.mode==='live' && Array.isArray(value.blind.order) && value.blind.order.length>=2 && value.blind.order.length<=3 && new Set(value.blind.order).size===value.blind.order.length && value.blind.order.every(id=>ids.includes(id)) ? {order:value.blind.order,revealed:value.blind.revealed===true,winner:ids.includes(value.blind.winner)?value.blind.winner:null} : null, maxTokens:[2048,4096,8192].includes(value.maxTokens)?value.maxTokens:4096, results };
}
export function createHistory(directory,{temporary=false}={}) {
  if(!temporary)fs.mkdirSync(directory,{recursive:true});
  const file=path.join(directory,'history.json');
  let entries=[], warning=temporary?'History is temporary for this session. Export comparisons before quitting.': '';
  let recovered=false;
  if(!temporary && fs.existsSync(file)) {
    try { const data=JSON.parse(fs.readFileSync(file,'utf8')); if(!Array.isArray(data)) throw new Error(); const valid=[];let invalid=0;for(const entry of data){try{valid.push(clean(entry));}catch{invalid++;}} entries=valid.slice(0,50);
      if(invalid){const backup=`${file}.${Date.now()}.bak`;fs.renameSync(file,backup);warning=`Recovered ${entries.length} valid comparisons; ${invalid} unsupported entries are preserved at ${backup}.`;recovered=true;} }
    catch { const backup=`${file}.${Date.now()}.bak`; fs.renameSync(file,backup); warning=`Damaged history was preserved at ${backup}. New history starts empty.`; }
  }
  function commit(next) {
    if(temporary){entries=next;return;}
    const temp=file+'.tmp';
    try { fs.writeFileSync(temp,JSON.stringify(next),{mode:0o600}); fs.renameSync(temp,file); entries=next; }
    catch { throw new Error('History could not be saved. Export this comparison and check free disk space.'); }
  }
  if(recovered)commit(entries);
  return {
    list:()=>({entries:entries.map(({results,...entry})=>entry),warning}),
    get:id=>structuredClone(entries.find(e=>e.id===id) || null),
    save:value=>{ const entry=clean(value); const index=entries.findIndex(e=>e.id===entry.id);commit(index<0?[entry,...entries].slice(0,50):entries.map((e,i)=>i===index?entry:e)); },
    remove:id=>commit(entries.filter(e=>e.id!==id)),
    clear:()=>commit([])
  };
}
