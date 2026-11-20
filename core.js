(function (root) {
  'use strict';
  const defaults = { chatgpt: true, claude: true, gemini: true, grok: false, copilot: false };
  const newChatURLs = {
    chatgpt: 'https://chatgpt.com/',
    claude: 'https://claude.ai/new',
    gemini: 'https://gemini.google.com/app',
    grok: 'https://grok.com/',
    copilot: 'https://copilot.cloud.microsoft/chat'
  };
  const hosts = {
    'chatgpt.com': 'chatgpt',
    'claude.ai': 'claude',
    'gemini.google.com': 'gemini',
    'grok.com': 'grok',
    'copilot.cloud.microsoft': 'copilot'
  };
  function provider(url) {
    return Object.hasOwn(hosts, url.hostname) ? hosts[url.hostname] : null;
  }
  function isNewChat(url) {
    switch (provider(url)) {
      case 'chatgpt': return /^\/$/.test(url.pathname);
      case 'claude': return /^\/(new\/?)?$/.test(url.pathname);
      case 'gemini': return /^\/(?:u\/\d+\/)?app\/?$/.test(url.pathname);
      case 'grok': return !url.search && (
        (url.pathname === '/' && !url.hash) ||
        (url.pathname === '/c' && (!url.hash || url.hash === '#private'))
      );
      case 'copilot': return /^\/chat\/?$/.test(url.pathname) && !url.search && !url.hash;
      default: return false;
    }
  }
  function temporaryURL(url) {
    const target = new URL(url.href);
    if (!isNewChat(target)) return null;
    if (provider(target) === 'chatgpt') {
      if (target.searchParams.get('temporary-chat') === 'true') return null;
      target.searchParams.set('temporary-chat', 'true');
    } else if (provider(target) === 'claude') {
      if (target.searchParams.has('incognito')) return null;
      target.pathname = '/new';
      target.searchParams.set('incognito', '');
    } else return null;
    return target.href;
  }
  function newChatURL(site, source) {
    const url = new URL(newChatURLs[site]);
    // Keep Gemini's selected account when opening a chat from an account-specific page.
    const account = site === 'gemini' && source?.pathname.match(/^\/u\/\d+(?=\/|$)/);
    if (account) url.pathname = account[0] + '/app';
    return url;
  }
  const api = { defaults, provider, isNewChat, temporaryURL, newChatURL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IncognitoCore = api;
})(globalThis);
