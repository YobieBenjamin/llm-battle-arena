const TYPES = {
  html: ['html','HTML'], htm: ['html','HTML'], svg: ['svg','SVG'],
  json: ['json','JSON'], csv: ['csv','CSV'], markdown: ['md','Markdown'], md: ['md','Markdown'],
  javascript: ['js','JavaScript'], js: ['js','JavaScript'], typescript: ['ts','TypeScript'], ts: ['ts','TypeScript'],
  jsx: ['jsx','JSX'], tsx: ['tsx','TSX'], python: ['py','Python'], py: ['py','Python'],
  css: ['css','CSS'], text: ['txt','Text'], txt: ['txt','Text']
};
// Only complete, explicitly labeled fenced blocks are files; prose and cloud links aren't.
export function extractArtifacts(text = '') {
  const artifacts = [];
  const lines = text.split(/\r?\n/);
  let block = null;
  for (const line of lines) {
    if (!block) {
      const match = line.match(/^ {0,3}(`{3,}|~{3,})\s*([a-zA-Z]+)(?:\s.*)?$/);
      if (match && Object.hasOwn(TYPES, match[2].toLowerCase())) block = { fence: match[1][0], length: match[1].length, type: match[2].toLowerCase(), lines: [] };
    } else if (new RegExp(`^ {0,3}${block.fence === '`' ? '`' : '~'}{${block.length},}\\s*$`).test(line)) {
      const [extension, label] = TYPES[block.type];
      const content = block.lines.join('\n');
      if (content.trim() && content.length <= 1000000) artifacts.push({ name: `artifact-${artifacts.length + 1}.${extension}`, extension, label, content });
      block = null;
      if (artifacts.length === 12) break;
    } else block.lines.push(line);
  }
  return artifacts;
}
export function previewDocument(artifact) {
  if (!['html','svg'].includes(artifact.extension)) return null;
  // Scripts, forms, external resources and app privileges are unavailable in the iframe.
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><style>html{color-scheme:light}body{margin:16px;font-family:system-ui;overflow-wrap:anywhere}svg{max-width:100%;height:auto}</style></head><body>${artifact.content}</body></html>`;
}
