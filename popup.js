'use strict';
const core = globalThis.IncognitoCore;
const statusElement = document.querySelector('#status');
const newChat = document.querySelector('#new-chat');
let activeSite;
async function refreshStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeSite = tab?.url ? core.provider(new URL(tab.url)) : null;
  newChat.hidden = !activeSite;
  if (!activeSite) { statusElement.textContent = 'Open ChatGPT, Claude, or Gemini to check this page.'; return; }
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'incognito-status' });
    statusElement.textContent = result.message;
    statusElement.closest('section').dataset.state = result.status;
  } catch {
    statusElement.textContent = 'Reload this page to activate the extension.';
  }
}
(async () => {
  try {
    const settings = await chrome.storage.local.get(core.defaults);
    for (const key of Object.keys(core.defaults)) {
      const input = document.getElementById(key);
      input.checked = settings[key];
      input.addEventListener('change', async () => {
        input.disabled = true;
        try {
          await chrome.storage.local.set({ [key]: input.checked });
          await refreshStatus();
        } catch {
          input.checked = !input.checked;
          statusElement.textContent = 'Could not save this setting. Try again.';
        } finally { input.disabled = false; }
      });
    }
    document.querySelector('#controls').disabled = false;
    await refreshStatus();
  } catch { statusElement.textContent = 'Could not load settings. Close and reopen this menu.'; }
})();
newChat.addEventListener('click', async () => {
  const urls = { chatgpt: 'https://chatgpt.com/?temporary-chat=true', claude: 'https://claude.ai/new?incognito', gemini: 'https://gemini.google.com/app' };
  if (!activeSite) return;
  newChat.disabled = true;
  try {
    // A separate tab preserves the current conversation and any unsent draft.
    await chrome.storage.local.set({ [activeSite]: true });
    await chrome.tabs.create({ url: urls[activeSite] });
    window.close();
  } catch {
    statusElement.textContent = 'Could not open the new chat. Try again.';
    newChat.disabled = false;
  }
});
