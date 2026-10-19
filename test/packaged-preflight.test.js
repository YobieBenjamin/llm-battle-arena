import test from 'node:test';
import assert from 'node:assert/strict';
import preflight from '../scripts/packaged-preflight.cjs';
test('packaged preflight identifies app processes without matching helpers or shell executables',()=>{
 const listing=' 12 /Applications/LLM Battle Arena.app/Contents/MacOS/LLM Battle Arena\n 34 /tmp/build/LLM Battle Arena.app/Contents/MacOS/LLM Battle Arena\n 56 /bin/zsh\n 78 /Applications/LLM Battle Arena.app/Contents/Frameworks/LLM Battle Arena Helper.app/Contents/MacOS/LLM Battle Arena Helper (Renderer)\n 90 /Applications/Electron.app/Contents/MacOS/Electron';
 assert.deepEqual(preflight.runningArenaPids(listing),[12,34]);
 assert.deepEqual(preflight.runningArenaPids(''),[]);
});
