import test from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from '../node_modules/markdown-it/dist/browser/markdown-it.esm.min.mjs';
import corpus from './fixtures/code-corpus.cjs';
const parser = new MarkdownIt({html:false,linkify:true});
for(const c of corpus.cases) test(`code whitespace survives Markdown: ${c.id}`,()=>{
 const tokens=parser.parse(corpus.fenceCase(c),{});
 assert.deepEqual(tokens.filter(t=>t.type==='fence').map(t=>t.content),[c.code+'\n']);
});
test('nested list and blockquote preserve Makefile tabs and literal HTML',()=>{
 const code='all:\n\t@echo "<hello>&"\n';
 for(const source of ['1. Outer\n\n   - Inner\n\n     ~~~makefile\n     all:\n     \t@echo "<hello>&"\n     ~~~','> 1. File\n>\n>    ```makefile\n>    all:\n>    \t@echo "<hello>&"\n>    ```']){
  assert.equal(parser.parse(source,{}).find(t=>t.type==='fence').content,code);
 }
});
