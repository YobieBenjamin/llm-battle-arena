// Trusted controls are added after Markdown sanitization, never from model HTML.
export function codeView(pre, {copy = text => navigator.clipboard.writeText(text), notice = () => {}} = {}) {
  const wrapper = document.createElement('div'); wrapper.className = 'code-view';
  const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
  const hint = document.createElement('span'); hint.textContent = 'Code · scroll ↔ for long lines';
  const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Copy code';
  button.setAttribute('aria-label', 'Copy this code block');
  const status = document.createElement('span'); status.className = 'sr-only'; status.setAttribute('role', 'status');
  pre.tabIndex = 0; pre.setAttribute('role', 'region'); pre.setAttribute('aria-label', 'Code. Use arrow keys to scroll.');
  button.onclick = async () => {
    button.disabled = true;
    try { await copy(pre.textContent); status.textContent = 'Code copied.'; notice('Code copied.'); }
    catch { status.textContent = 'Could not copy code. Select the text and copy it manually.'; notice(status.textContent); }
    finally { button.disabled = false; }
  };
  toolbar.append(hint, button, status); wrapper.append(toolbar, pre); return wrapper;
}
