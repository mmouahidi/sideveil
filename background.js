'use strict';
importScripts('core.js');
const core = globalThis.IncognitoCore;
const session = chrome.storage.session;
const regularKey = tabId => 'regular-chat:' + tabId;

async function switchToRegularChat(site, source, tabId) {
  const url = core.newChatURL(site, source);
  // Register the exception before the replacement document starts running.
  const key = regularKey(tabId);
  try {
    await session.set({ [key]: { site, expires: Date.now() + 120000 } });
    if (url.href === source.href) await chrome.tabs.reload(tabId);
    else await chrome.tabs.update(tabId, { url: url.href });
    return { ok: true };
  } catch (error) {
    await session.remove(key);
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
  if (message.type !== 'sideveil-switch-regular' && message.type !== 'sideveil-claim-regular') return;
  const source = sender.url && new URL(sender.url);
  const fromPage = source?.protocol === 'https:' && sender.frameId === 0 && sender.tab;
  let result;
  if (message.type === 'sideveil-claim-regular' && fromPage && core.provider(source)) {
    result = claimRegularChat(source, sender.tab.id);
  } else if (message.type === 'sideveil-switch-regular' && fromPage) {
    const site = core.provider(source);
    if (site) result = switchToRegularChat(site, source, sender.tab.id);
  }
  if (!result) return;
  result.then(respond, () => respond({ ok: false }));
  return true;
});
