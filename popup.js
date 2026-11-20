'use strict';
const core = globalThis.IncognitoCore;
const statusElement = document.querySelector('#status');
const newChat = document.querySelector('#new-chat');
const regularChat = document.querySelector('#regular-chat');
const retry = document.querySelector('#retry');
let activeSite;
let activePage;
let tabId;
function showStatus(result) {
  statusElement.textContent = result.message;
  statusElement.closest('section').dataset.state = result.status;
  retry.hidden = result.status !== 'unverified' && result.status !== 'blocked';
}
async function refreshStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activePage = tab?.url ? new URL(tab.url) : null;
  activeSite = activePage?.protocol === 'https:' ? core.provider(activePage) : null;
  tabId = tab?.id;
  newChat.hidden = !activeSite;
  regularChat.hidden = !activeSite;
  if (!activeSite) {
    showStatus({ status: 'unsupported', message: 'Open ChatGPT, Claude, or Gemini to check this page.' });
    return;
  }
  try {
    showStatus(await chrome.tabs.sendMessage(tabId, { type: 'incognito-status' }));
  } catch {
    showStatus({ status: 'unavailable', message: 'Reload this page to activate the extension.' });
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
  if (!activeSite) return;
  const url = core.newChatURL(activeSite, activePage);
  newChat.disabled = true;
  try {
    // A separate tab preserves the current conversation and any unsent draft.
    await chrome.storage.local.set({ [activeSite]: true });
    await chrome.tabs.create({ url: core.temporaryURL(url) || url.href });
    window.close();
  } catch {
    statusElement.textContent = 'Could not open the new chat. Try again.';
    newChat.disabled = false;
  }
});
regularChat.addEventListener('click', async () => {
  if (!activeSite) return;
  regularChat.disabled = true;
  try {
    const result = await chrome.runtime.sendMessage({ type: 'sideveil-open-regular', page: activePage.href });
    if (!result?.ok) throw new Error('Could not open regular chat');
    window.close();
  } catch {
    statusElement.textContent = 'Couldn’t open a regular chat. Try again.';
  } finally {
    regularChat.disabled = false;
  }
});
retry.addEventListener('click', async () => {
  if (document.activeElement === retry) statusElement.focus({ preventScroll: true });
  retry.disabled = true;
  try {
    showStatus(await chrome.tabs.sendMessage(tabId, { type: 'sideveil-retry' }));
  } catch {
    statusElement.textContent = 'Couldn’t reach the page. Reload it and try again.';
  } finally {
    retry.disabled = false;
  }
});
