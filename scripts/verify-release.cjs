// Run on macOS after downloading every asset from the public release.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),asar=require('@electron/asar');
const root=path.resolve(__dirname,'..'),dir=path.resolve(process.argv[2]||'verify-release');
const expected=['LLM-Battle-Arena-macOS-arm64.dmg','LLM-Battle-Arena-macOS-x64.dmg',...['x64','arm64'].flatMap(arch=>['Setup','Portable'].map(kind=>`LLM-Battle-Arena-Windows-${arch}-${kind}.exe`))];
const sums=new Map(fs.readFileSync(path.join(dir,'SHA256SUMS.txt'),'utf8').trim().split('\n').map(line=>{const match=line.match(/^([a-f0-9]{64})\s+\*?([^/\\]+)$/);if(!match)throw new Error('Invalid checksum line');return [match[2],match[1]];}));
for(const file of expected){const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex');if(actual!==sums.get(file))throw new Error(`Checksum mismatch: ${file}`);}
function sourceFiles(folder){return fs.readdirSync(path.join(root,folder),{withFileTypes:true}).flatMap(item=>item.isDirectory()?sourceFiles(`${folder}/${item.name}`):[`${folder}/${item.name}`]);}
const files=['index.html','package.json',...sourceFiles('src'),...sourceFiles('desktop')];
for(const arch of ['arm64','x64']){
 const mount=path.join(dir,`mounted-${arch}`);fs.mkdirSync(mount,{recursive:true});
 execFileSync('hdiutil',['attach',path.join(dir,`LLM-Battle-Arena-macOS-${arch}.dmg`),'-readonly','-nobrowse','-mountpoint',mount],{stdio:'inherit'});
 try{
  const app=path.join(mount,'LLM Battle Arena.app');execFileSync('codesign',['--verify','--deep','--strict',app],{stdio:'inherit'});
  const archive=path.join(app,'Contents/Resources/app.asar');
  const bundled=asar.listPackage(archive).map(p=>p.replace(/^\//,'')).filter(p=>/^(src|desktop)\//.test(p) && !asar.statFile(archive,p).files).sort();
  if(JSON.stringify(bundled)!==JSON.stringify(files.filter(p=>/^(src|desktop)\//.test(p)).sort()))throw new Error('Bundled source file set differs from tag');
  for(const file of files){const actual=asar.extractFile(archive,file),source=fs.readFileSync(path.join(root,file));if(file==='package.json'){const a=JSON.parse(actual),b=JSON.parse(source);for(const key of ['version','name','main','dependencies'])if(JSON.stringify(a[key])!==JSON.stringify(b[key]))throw new Error(`Packaged metadata mismatch: ${key}`);}else if(!actual.equals(source))throw new Error(`Bundled source differs from tag: ${file}`);}
  for(const file of ['node_modules/marked/lib/marked.esm.js','node_modules/dompurify/dist/purify.es.mjs']) if(!asar.extractFile(archive,file).equals(fs.readFileSync(path.join(root,file))))throw new Error(`Bundled dependency mismatch: ${file}`);
  console.log(`Verified ${arch}: public checksum, sealed signature, source matches tag, Markdown dependencies match lockfile install.`);
 }finally{execFileSync('hdiutil',['detach',mount],{stdio:'inherit'});}
}
