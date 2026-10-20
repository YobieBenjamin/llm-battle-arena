import { codeView } from './code-view.js';
import MarkdownIt from '../node_modules/markdown-it/dist/browser/markdown-it.esm.min.mjs';
import DOMPurify from '../node_modules/dompurify/dist/purify.es.mjs';
// Keep raw HTML inert; sanitization and trusted controls remain separate.
const parser = new MarkdownIt({html:false, linkify:true});
export function renderMarkdown(text, controls) {
  const fragment = DOMPurify.sanitize(parser.render(text), {
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
