(function (root) {
  'use strict';
  const defaults = { chatgpt: true, claude: true, gemini: true };
  function provider(url) {
    return ({ 'chatgpt.com': 'chatgpt', 'claude.ai': 'claude', 'gemini.google.com': 'gemini' })[url.hostname] || null;
  }
  function isNewChat(url) {
    switch (provider(url)) {
      case 'chatgpt': return /^\/$/.test(url.pathname);
      case 'claude': return /^\/(new\/?)?$/.test(url.pathname);
      case 'gemini': return /^\/(?:u\/\d+\/)?app\/?$/.test(url.pathname);
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
  const api = { defaults, provider, isNewChat, temporaryURL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IncognitoCore = api;
})(globalThis);
