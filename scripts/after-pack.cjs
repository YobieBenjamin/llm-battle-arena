// Remove unused permission descriptions before signing the bundle.
const fs=require('node:fs'),path=require('node:path'),plist=require('plist');
module.exports=async context=>{
 if(context.electronPlatformName!=='darwin')return;
 const contents=path.join(context.appOutDir,`${context.packager.appInfo.productFilename}.app`,'Contents');
 const files=[path.join(contents,'Info.plist')];
 const frameworks=path.join(contents,'Frameworks');
 for(const name of fs.readdirSync(frameworks))if(name.endsWith('.app'))files.push(path.join(frameworks,name,'Contents','Info.plist'));
 for(const file of files){const info=plist.parse(fs.readFileSync(file,'utf8'));for(const key of ['NSCameraUsageDescription','NSMicrophoneUsageDescription','NSAudioCaptureUsageDescription'])delete info[key];fs.writeFileSync(file,plist.build(info));}
};
