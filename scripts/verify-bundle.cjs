const {getCurrentFuseWire,FuseV1Options}=require('@electron/fuses');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),plist=require('plist');
async function verifyBundle(app) {
 const wire=await getCurrentFuseWire(app);
 for(const [name,enabled] of Object.entries({RunAsNode:false,EnableNodeOptionsEnvironmentVariable:false,OnlyLoadAppFromAsar:true,EnableEmbeddedAsarIntegrityValidation:true}))assert.equal(wire[FuseV1Options[name]],enabled?49:48,`Incorrect fuse: ${name}`);
 if(app.endsWith('.app')) {
  const info=plist.parse(fs.readFileSync(path.join(app,'Contents/Info.plist'),'utf8'));
  for(const key of ['NSCameraUsageDescription','NSMicrophoneUsageDescription','NSAudioCaptureUsageDescription'])assert.ok(!(key in info),`Unused permission: ${key}`);
  assert.equal(info.CFBundleIconFile,'icon.icns');
  assert.ok(fs.readFileSync(path.join(app,'Contents/Resources',info.CFBundleIconFile)).equals(fs.readFileSync(path.join(__dirname,'../assets/icon.icns'))),'Custom icon differs from source');
 }
 console.log('Verified packaged fuses and Mac metadata.');
}
module.exports=verifyBundle;
if(require.main===module)verifyBundle(process.argv[2]).catch(error=>{console.error(error);process.exitCode=1;});
