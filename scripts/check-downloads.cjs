const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {hash}=require('./compare-builds.cjs');
const dir=process.argv[2];
const sums=new Map(fs.readFileSync(path.join(dir,'SHA256SUMS.txt'),'utf8').trim().split('\n').map(line=>{const match=line.match(/^([a-f0-9]{64})\s+\*?([^/\\]+)$/);assert.ok(match,'Invalid checksum line');return [match[2],match[1]];}));
for(const file of fs.readdirSync(dir).filter(f=>f!=='SHA256SUMS.txt'))assert.equal(hash(path.join(dir,file)),sums.get(file),`Public checksum mismatch: ${file}`);
console.log('Downloaded installer and proof checksums match.');
