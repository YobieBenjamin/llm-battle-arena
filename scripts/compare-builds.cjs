const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function archivePath(bundle) {return bundle.endsWith('.app')?path.join(bundle,'Contents/Resources/app.asar'):path.join(path.dirname(bundle),'resources/app.asar');}
function compareBuilds(privateBundle,releaseBundle) {
 const privateHash=hash(archivePath(privateBundle)),releaseHash=hash(archivePath(releaseBundle));
 assert.equal(releaseHash,privateHash,'Release application archive differs from the deeply tested private build');
 console.log(`Application archive matches private regression build byte-for-byte: ${releaseHash}`);
 return releaseHash;
}
module.exports={hash,archivePath,compareBuilds};
if(require.main===module)compareBuilds(process.argv[2],process.argv[3]);
