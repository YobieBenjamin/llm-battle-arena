const {execFileSync}=require('node:child_process');
function runningArenaPids(listing) {
 return listing.split('\n').flatMap(line=>{
  const match=line.match(/^\s*(\d+)\s+(\/.*?\.app\/Contents\/MacOS\/LLM Battle Arena)$/);
  return match ? [Number(match[1])] : [];
 });
}
function assertPackagedAppClosed() {
 if(process.platform!=='darwin' || !process.env.ARENA_ELECTRON_PATH)return;
 const pids=runningArenaPids(execFileSync('/bin/ps',['-axo','pid=,comm='],{encoding:'utf8',timeout:5000}));
 if(pids.length) throw new Error(`Quit all open LLM Battle Arena apps before packaged tests (running PIDs: ${pids.join(', ')}). Save/export your work first. Keep historical bundles closed while testing a new build. No app has been closed automatically.`);
}
module.exports={runningArenaPids,assertPackagedAppClosed};
