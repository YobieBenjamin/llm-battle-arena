import { extractArtifacts, previewDocument } from './artifacts.js';
export function createArtifactViewer({ providers, api, notice }) {
  const $ = id => document.getElementById(id);
  const panel = $('artifact-panel');
  const records = new Map();
  let owner = null, index = 0, pinned = false, timer, suppressed = null, source = false;
  function cancelHide() { clearTimeout(timer); }
  function hide() {
    cancelHide();
    if (owner) $(`${owner}-artifact`).setAttribute('aria-expanded','false');
    panel.hidden = true;
    $('artifact-body').replaceChildren();
    owner = null; pinned = false; panel.classList.remove('is-pinned');
  }
  function scheduleHide() { cancelHide(); if (!pinned) timer = setTimeout(hide, 180); }
  function place() {
    if (!owner) return;
    // Keep every Y badge uncovered so a second click can always unpin it.
    const header = $(`${owner}-artifact`).closest('.card-top').getBoundingClientRect();
    const top = Math.min(header.bottom + 6, window.innerHeight - 200);
    panel.style.top = `${top}px`;
    panel.style.height = `${Math.max(160, Math.min(570, window.innerHeight - top - 18))}px`;
  }
  window.addEventListener('resize', place);
  function draw() {
    panel.classList.toggle('is-pinned', pinned);
    const artifacts = records.get(owner) || [];
    const artifact = artifacts[index];
    if (!artifact) { hide(); return; }
    $('artifact-title').textContent = `${providers[owner].name} · ${artifact.label}`;
    $('artifact-state').textContent = pinned ? 'Pinned · click Y again to hide' : 'Preview · click Y to keep open';
    $('artifact-save').disabled = !api;
    $('artifact-source').textContent = source ? 'Show preview' : 'Show source';
    $('artifact-source').hidden = !['html','svg','json'].includes(artifact.extension);
    $('artifact-tabs').replaceChildren();
    artifacts.forEach((item, i) => {
      const button = document.createElement('button');
      button.textContent = item.name; button.setAttribute('aria-pressed',String(i === index));
      button.onclick = () => { index = i; draw(); };
      $('artifact-tabs').append(button);
    });
    const body = $('artifact-body'); body.replaceChildren();
    if (!source && ['html','svg'].includes(artifact.extension)) {
      const frame = document.createElement('iframe');
      frame.title = `${artifact.label} artifact preview`;
      frame.setAttribute('sandbox','');
      frame.setAttribute('referrerpolicy','no-referrer');
      frame.srcdoc = previewDocument(artifact);
      body.append(frame);
    } else {
      const code = document.createElement('pre');
      let text = artifact.content;
      if (!source && artifact.extension === 'json') { try { text = JSON.stringify(JSON.parse(text), null, 2); } catch { /* Show original source if JSON isn't valid. */ } }
      code.textContent = text;
      body.append(code);
    }
  }
  function show(id) {
    cancelHide();
    if (!records.get(id)?.length || suppressed === id || (pinned && owner !== id)) return;
    if (owner !== id) {
      if (owner) $(`${owner}-artifact`).setAttribute('aria-expanded','false');
      owner = id; index = 0; source = false;
    }
    panel.hidden = false;
    place();
    $(`${id}-artifact`).setAttribute('aria-expanded','true');
    draw();
  }
  for (const id of Object.keys(providers)) {
    const button = $(`${id}-artifact`);
    button.onpointerenter = () => show(id);
    button.onpointerleave = () => { suppressed = null; scheduleHide(); };
    button.onfocus = () => show(id);
    button.onblur = scheduleHide;
    button.onclick = () => {
      if (pinned && owner === id) { suppressed = id; hide(); return; }
      // An explicit click switches even when another card's artifact is pinned.
      pinned = false; suppressed = null; show(id); pinned = true; draw();
    };
  }
  panel.onpointerenter = cancelHide;
  panel.onpointerleave = scheduleHide;
  panel.onfocusin = cancelHide;
  panel.onfocusout = () => { if (!panel.contains(document.activeElement) && !panel.matches(':hover')) scheduleHide(); };
  $('artifact-close').onclick = hide;
  $('artifact-source').onclick = () => { source = !source; draw(); };
  $('artifact-save').onclick = async () => {
    const artifact = records.get(owner)?.[index];
    if (!artifact || !api) return;
    try { notice(await api.saveArtifact({ name: `${owner}-${artifact.name}`, content: artifact.content }) ? 'Artifact saved.' : 'Save cancelled.'); }
    catch (error) { notice(error.message); }
  };
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { hide(); event.preventDefault(); } });
  return {
    update(id, text) {
      const next = extractArtifacts(text);
      const previous = records.get(id);
      if (JSON.stringify(previous) === JSON.stringify(next)) return;
      records.set(id, next);
      const button = $(`${id}-artifact`);
      button.hidden = !next.length;
      button.title = `${next.length} artifact${next.length === 1 ? '' : 's'}. Hover to preview; click to pin; click again to hide.`;
      button.setAttribute('aria-label', `${providers[id].name}: ${next.length} artifacts. Preview or pin.`);
      if (owner === id) { if (index >= next.length) index = 0; draw(); }
    },
    reset() { hide(); suppressed = null; for (const id of Object.keys(providers)) { records.delete(id); $(`${id}-artifact`).hidden = true; } }
  };
}
