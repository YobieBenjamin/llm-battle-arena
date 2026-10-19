import fs from 'node:fs';
import path from 'node:path';
export function createPreferences(directory,{temporary=false}={}) {
  const file=path.join(directory,'preferences.json'); let state={checkUpdates:false,votes:{}};
  if(!temporary && fs.existsSync(file)) { try { const saved=JSON.parse(fs.readFileSync(file,'utf8')); state.checkUpdates=saved.checkUpdates===true; if(saved.votes && typeof saved.votes==='object' && !Array.isArray(saved.votes)) state.votes=Object.fromEntries(Object.entries(saved.votes).filter(([id,winner])=>/^[\w-]{1,100}$/.test(id) && ['claude','openai','gemini'].includes(winner))); } catch { fs.renameSync(file,`${file}.${Date.now()}.bak`); } }
  function save(next) {if(temporary){state=next;return;}try{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(next),{mode:0o600});fs.renameSync(file+'.tmp',file);state=next;}catch{throw new Error('Preferences could not be saved. Check folder access and free disk space, then try again.');}}
  return {
    snapshot:()=>({checkUpdates:state.checkUpdates,tally:Object.fromEntries(['claude','openai','gemini'].map(id=>[id,Object.values(state.votes).filter(v=>v===id).length]))}),
    setUpdates:value=>{if(typeof value!=='boolean')throw new Error('Invalid update preference.');save({...state,checkUpdates:value});},
    winner:id=>Object.hasOwn(state.votes,id)?state.votes[id]:null,
    vote:(id,winner)=>{if(Object.hasOwn(state.votes,id))throw new Error('This comparison already has a winner.');if(!/^[\w-]{1,100}$/.test(id)||!['claude','openai','gemini'].includes(winner))throw new Error('Invalid vote.');save({...state,votes:{...state.votes,[id]:winner}});return winner;}
  };
}
export function newerVersion(current,tag) {
  if(!/^v\d+\.\d+\.\d+$/.test(tag) || !/^\d+\.\d+\.\d+$/.test(current))return false;
  const a=tag.slice(1).split('.').map(Number),b=current.split('.').map(Number);
  for(let i=0;i<3;i++)if(a[i]!==b[i])return a[i]>b[i];return false;
}
export function createUpdateCheck(current,fetchImpl=fetch) {
  let request;
  return ()=>request ||= (async()=>{
    try {
      const response=await fetchImpl('https://api.github.com/repos/YobieBenjamin/llm-battle-arena/releases/latest',{headers:{Accept:'application/vnd.github+json'},redirect:'error',signal:AbortSignal.timeout(8000)});
      if(!response.ok)return {error:'Update check unavailable. Try again next launch.'};
      const release=await response.json();
      if(!release || typeof release.tag_name!=='string' || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(release.tag_name))return {error:'GitHub returned an unreadable release version. Check again next launch.'};
      return {version:!release.draft&&!release.prerelease&&newerVersion(current,release.tag_name)?release.tag_name:null};
    } catch {return {error:'Could not check updates. You can keep using the app offline.'};}
  })();
}
