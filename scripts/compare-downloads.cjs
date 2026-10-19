// The reference comes from this workflow's immutable build artifact, not the release.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {hash}=require('./compare-builds.cjs');
function compareDownloads(downloaded,reference){
 const files=fs.readdirSync(reference).filter(f=>/\.(exe|dmg|json)$/.test(f));
 assert.deepEqual(fs.readdirSync(downloaded).filter(f=>f!=='SHA256SUMS.txt').sort(),[...files].sort(),'Public download set differs from tested CI artifacts');
 assert.ok(files.some(f=>/^proof-.*\.json$/.test(f)),'Missing original CI proof');
 assert.ok(files.some(f=>/\.(exe|dmg)$/.test(f)),'Missing original CI installer');
 for(const file of files)assert.equal(hash(path.join(downloaded,file)),hash(path.join(reference,file)),`Published asset differs from tested CI artifact: ${file}`);
 console.log('Public installers and proof match the original tested CI artifacts byte-for-byte.');
}
module.exports=compareDownloads;
if(require.main===module)compareDownloads(process.argv[2],process.argv[3]);
