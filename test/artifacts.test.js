import test from 'node:test';
import assert from 'node:assert/strict';
import { extractArtifacts, previewDocument } from '../src/artifacts.js';
test('only complete, labeled supported files produce artifacts',()=>{
 assert.deepEqual(extractArtifacts('Normal prose\n```html\n<h1>Incomplete</h1>'),[]);
 assert.deepEqual(extractArtifacts('```unknown\nhello\n```'),[]);
 const files=extractArtifacts('A file:\n```html\n<h1>Hello 🌱</h1>\n```\n\n~~~json\n{"ok":true}\n~~~');
 assert.equal(files.length,2);assert.equal(files[0].name,'artifact-1.html');assert.equal(files[0].content,'<h1>Hello 🌱</h1>');assert.equal(files[1].extension,'json');
});
test('fences must match their opening character and length',()=>{
 assert.equal(extractArtifacts('````svg\n<svg></svg>\n```\n').length,0);
 assert.equal(extractArtifacts('```html\n<h1>Hi</h1>\n~~~\n').length,0);
 assert.equal(extractArtifacts('````svg\n<svg></svg>\n````\n').length,1);
});
test('artifact count and file size have bounds',()=>{
 assert.equal(extractArtifacts('```text\nhello\n```\n'.repeat(20)).length,12);
 assert.equal(extractArtifacts('```html\n'+'x'.repeat(1000001)+'\n```').length,0);
});
test('preview document restricts scripts, networking, forms, and embedded objects',()=>{
 const html=previewDocument({extension:'html',content:'<h1>Hello</h1><script>alert(1)</script>'});
 assert.match(html,/script-src 'none'/);assert.match(html,/connect-src 'none'/);assert.match(html,/form-action 'none'/);assert.match(html,/object-src 'none'/);assert.match(html,/img-src data:/);
 assert.equal(previewDocument({extension:'js',content:'alert(1)'}),null);
});
