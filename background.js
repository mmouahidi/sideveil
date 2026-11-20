'use strict';
importScripts('core.js');
const core = globalThis.IncognitoCore;
const session = chrome.storage.session;
const regularKey = tabId => 'regular-chat:' + tabId;

async function openRegularChat(site, source, windowId) {
  const url = core.newChatURL(site, source);
  // Register the exception before the provider tab starts running its content script.
  const tab = await chrome.tabs.create({ url: 'about:blank', active: false, windowId });
  const key = regularKey(tab.id);
  try {
    await session.set({ [key]: { site, expires: Date.now() + 120000 } });
    await chrome.tabs.update(tab.id, { url: url.href, active: true });
    return { ok: true };
  } catch (error) {
    await Promise.allSettled([session.remove(key), chrome.tabs.remove(tab.id)]);
    throw error;
  }
}

async function claimRegularChat(url, tabId) {
  const key = regularKey(tabId);
  const pending = (await session.get(key))[key];
  if (!pending) return false;
  if (pending.expires < Date.now()) {
    await session.remove(key);
    return false;
  }
  if (pending.site !== core.provider(url) || !core.isNewChat(url)) return false;
  await session.remove(key);
  return true;
}

chrome.tabs.onRemoved.addListener(tabId => {
  session.remove(regularKey(tabId)).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type !== 'sideveil-open-regular' && message.type !== 'sideveil-claim-regular') return;
  const source = sender.url && new URL(sender.url);
  const fromPage = source?.protocol === 'https:' && sender.frameId === 0 && sender.tab;
  const fromPopup = sender.url === chrome.runtime.getURL('popup.html');
  let result;
  if (message.type === 'sideveil-claim-regular' && fromPage && core.provider(source)) {
    result = claimRegularChat(source, sender.tab.id);
  } else if (message.type === 'sideveil-open-regular') {
    const url = fromPage ? source : fromPopup && URL.canParse(message.page) && new URL(message.page);
    const site = url && core.provider(url);
    if (site && url.protocol === 'https:') result = openRegularChat(site, url, sender.tab?.windowId);
  }
  if (!result) return;
  result.then(respond, () => respond({ ok: false }));
  return true;
});
