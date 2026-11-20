'use strict';
const core = globalThis.IncognitoCore;
const statusElement = document.querySelector('#status');
const newChat = document.querySelector('#new-chat');
const regularChat = document.querySelector('#regular-chat');
const regularHint = document.querySelector('#regular-hint');
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
  regularHint.hidden = !activeSite;
  if (!activeSite) {
    showStatus({ status: 'unsupported', message: 'Open a site with automatic temporary chat to see its status here.' });
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
    const result = await chrome.tabs.sendMessage(tabId, { type: 'sideveil-switch-regular' });
    if (!result?.ok) throw new Error('Could not switch to a regular chat');
    await refreshStatus();
  } catch {
    statusElement.textContent = 'Couldn’t switch to a regular chat. Reload the page and try again.';
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

const platformPicker = document.querySelector('#platform');
const platformTip = document.querySelector('#platform-tip');
const openPlatform = document.querySelector('#open-platform');
const openPrivate = document.querySelector('#open-private');
const launchError = document.querySelector('#launch-error');
const nativeGroup = document.querySelector('#native-platforms');
const browserGroup = document.querySelector('#browser-platforms');
for (const [id, platform] of Object.entries(platforms)) {
  const option = new Option(platform.name, id);
  (platform.mode ? nativeGroup : browserGroup).append(option);
}
platformPicker.selectedIndex = 0;

function updatePlatform() {
  const platform = platforms[platformPicker.value];
  openPlatform.hidden = !platform.mode;
  openPlatform.textContent = 'Open site for ' + (platform.mode || 'temporary mode');
  platformTip.textContent = platform.tip || 'Open a separate browser session for ' + platform.name + '.';
  launchError.hidden = true;
}

async function openSelectedPlatform(privateWindow) {
  openPlatform.disabled = true;
  openPrivate.disabled = true;
  launchError.hidden = true;
  try {
    await launchPlatform(platformPicker.value, privateWindow);
    window.close();
  } catch {
    launchError.textContent = privateWindow
      ? 'Couldn’t open a private window. Try opening one from your browser menu.'
      : 'Couldn’t open the site. Try again.';
    launchError.hidden = false;
  } finally {
    openPlatform.disabled = false;
    openPrivate.disabled = false;
  }
}

platformPicker.addEventListener('change', updatePlatform);
openPlatform.addEventListener('click', () => openSelectedPlatform(false));
openPrivate.addEventListener('click', () => openSelectedPlatform(true));
updatePlatform();
