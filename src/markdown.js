import { marked } from '../node_modules/marked/lib/marked.esm.js';
import DOMPurify from '../node_modules/dompurify/dist/purify.es.mjs';
export function renderMarkdown(text) {
  const fragment = DOMPurify.sanitize(marked.parse(text, {async:false, gfm:true}), {
    ALLOWED_TAGS: ['p','br','strong','em','del','blockquote','ul','ol','li','h1','h2','h3','h4','h5','h6','pre','code','hr','table','thead','tbody','tr','th','td','a'],
    ALLOWED_ATTR: ['href','title','start'], ALLOW_DATA_ATTR:false, ALLOW_ARIA_ATTR:false, RETURN_DOM_FRAGMENT:true
  });
  for (const link of fragment.querySelectorAll('a')) {
    try { const url=new URL(link.getAttribute('href')); if(!['https:','http:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { link.removeAttribute('href'); }
  }
  return fragment;
}
