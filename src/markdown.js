import { codeView } from './code-view.js';
import { Marked } from '../node_modules/marked/lib/marked.esm.js';
import DOMPurify from '../node_modules/dompurify/dist/purify.es.mjs';
const parser = new Marked({renderer:{html:({text}) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}});
export function renderMarkdown(text, controls) {
  const fragment = DOMPurify.sanitize(parser.parse(text, {async:false, gfm:true}), {
    ALLOWED_TAGS: ['p','br','strong','em','del','blockquote','ul','ol','li','h1','h2','h3','h4','h5','h6','pre','code','hr','table','thead','tbody','tr','th','td','a'],
    ALLOWED_ATTR: ['href','title','start'], ALLOW_DATA_ATTR:false, ALLOW_ARIA_ATTR:false, RETURN_DOM_FRAGMENT:true
  });
  for (const link of fragment.querySelectorAll('a')) {
    try { const url=new URL(link.getAttribute('href')); if(!['https:','http:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { link.removeAttribute('href'); }
  }
  for (const pre of fragment.querySelectorAll('pre')) {
    const placeholder = document.createTextNode(''); pre.replaceWith(placeholder);
    placeholder.replaceWith(codeView(pre, controls));
  }
  return fragment;
}
