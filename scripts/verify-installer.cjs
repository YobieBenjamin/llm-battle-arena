// Inspect and exercise the actual payload recovered from a distributable.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {hash,archivePath}=require('./compare-builds.cjs');
const {runReleaseSmoke}=require('./release-smoke.cjs');
async function verifyInstaller(installer,reference){
 const temp=fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(),'arena-installer-')));let mounted=false;
 try{
  let bundle;
  if(installer.endsWith('.dmg')){
   execFileSync('hdiutil',['attach',path.resolve(installer),'-readonly','-nobrowse','-mountpoint',temp],{stdio:'inherit'});mounted=true;
   bundle=path.join(temp,'LLM Battle Arena.app');execFileSync('codesign',['--verify','--deep','--strict',bundle],{stdio:'inherit'});
  }else{
   const seven=process.env.ARENA_7ZIP||'C:\\Program Files\\7-Zip\\7z.exe';
   execFileSync(seven,['x',path.resolve(installer),`-o${temp}`,'-y'],{stdio:'ignore'});
   function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
   for(let depth=0;depth<3;depth++){
    const archives=walk(temp).filter(f=>f.endsWith('.7z')&&!fs.existsSync(f+'.extracted'));
    if(!archives.length)break;
    for(const archive of archives){const dest=archive+'.extracted';fs.mkdirSync(dest);execFileSync(seven,['x',archive,`-o${dest}`,'-y'],{stdio:'ignore'});}
   }
   const candidates=walk(temp).filter(f=>path.basename(f)==='LLM Battle Arena.exe'&&fs.existsSync(path.join(path.dirname(f),'resources/app.asar')));
   assert.equal(candidates.length,1,'Expected exactly one installer application payload');const application=path.join(temp,'application');
   // Recreate the runtime application folder, outside NSIS's internal $PLUGINSDIR envelope.
   fs.cpSync(path.dirname(candidates[0]),application,{recursive:true});bundle=path.join(application,'LLM Battle Arena.exe');
  }
  const proof=JSON.parse(fs.readFileSync(reference,'utf8'));
  assert.equal(hash(archivePath(bundle)),proof.appAsarSha256,'Installer code differs from tested application');
  const exe=bundle.endsWith('.app')?path.join(bundle,'Contents/MacOS/LLM Battle Arena'):bundle;
  assert.equal(hash(exe),proof.executableSha256,'Installer executable differs from tested release');
  await runReleaseSmoke(bundle);
  console.log(`PASS: installer payload matches tested release and passes UI: ${path.basename(installer)}`);
 }finally{if(mounted)execFileSync('hdiutil',['detach',temp],{stdio:'inherit'});fs.rmSync(temp,{recursive:true,force:true});}
}
module.exports=verifyInstaller;
if(require.main===module)verifyInstaller(process.argv[2],process.argv[3]).catch(error=>{console.error(error);process.exitCode=1;});
