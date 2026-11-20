(() => {
  'use strict';
  const core = globalThis.IncognitoCore;
  const site = core.provider(new URL(location.href));
  if (!site) return;
  let settings = { ...core.defaults };
  let loaded = false;
  let currentURL = '';
  let status = 'checking';
  let since = Date.now();
  let attempts = 0;
  let lastAttempt = -Infinity;
  let scheduled = false;
  let notice;
  const descriptions = {
    checking: 'Checking temporary mode…',
    active: 'Temporary mode is active.',
    requested: 'Temporary mode requested through the site URL. Check the site indicator.',
    disabled: 'Automatic temporary mode is off for this site.',
    existing: 'Existing chat or another page. Left unchanged.',
    blocked: 'Temporary mode could not be activated. Check your account or turn automation off.'
  };

  function state() { return { site, status, message: descriptions[status] }; }
  function setStatus(value) {
    status = value;
    document.documentElement?.setAttribute('data-incognito-extension', '1.1.0');
    document.documentElement?.setAttribute('data-incognito-state', value);
    document.documentElement?.setAttribute('data-incognito-attempts', String(attempts));
    if (notice && value !== 'blocked') { notice.remove(); notice = null; }
    if (value === 'blocked' && document.body && !notice) {
      notice = document.createElement('div');
      notice.id = 'incognito-automation-notice';
      const shadow = notice.attachShadow({ mode: 'closed' });
      const box = document.createElement('div');
      box.setAttribute('role', 'alert');
      box.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:2147483647;max-width:min(360px,calc(100vw - 40px));box-sizing:border-box;padding:16px;background:#fff6db;color:#382b0b;border:1px solid #947324;border-radius:8px;font:14px/1.5 system-ui,sans-serif;box-shadow:0 4px 16px #0002';
      box.textContent = 'Sideveil: Gemini temporary mode is unavailable. Sending is paused on this new chat. Use the extension menu to turn automation off, or reload to retry.';
      shadow.append(box);
      document.body.append(notice);
    }
  }

  function geminiButton() {
    return document.querySelector('.temp-chat-button button') ||
      document.querySelector('button[aria-label="Temporary chat"],button[aria-label="Discussion temporaire"]');
  }
  function geminiIcon(button) {
    const icon = button?.querySelector('mat-icon');
    return icon?.getAttribute('data-mat-icon-name') || icon?.getAttribute('fonticon') || '';
  }
  function geminiActive() {
    if (geminiIcon(geminiButton()) === 'close') return true;
    // After the first message Gemini removes the toggle and renders this
    // conversation header instead, while keeping the same /app URL.
    const header = document.querySelector('.temporary-chat-header');
    return !!header && !header.hidden && header.getAttribute('aria-hidden') !== 'true' && header.getClientRects().length > 0;
  }
  function chatgptActive() {
    return !!document.querySelector('button use[href*="chat-bubble-checkmark-dashed"]') ||
      [...document.querySelectorAll('button[aria-label]')].some(button =>
        /^(turn off temporary chat|disable temporary chat|désactiver le chat éphémère)$/i.test(button.getAttribute('aria-label')));
  }
  function claudeActive() {
    return [...document.querySelectorAll('button[aria-label]')].some(button =>
      /^(exit incognito|quitter le mode incognito)$/i.test(button.getAttribute('aria-label')));
  }

  function inspect() {
    scheduled = false;
    if (!loaded) return;
    const url = new URL(location.href);
    if (url.href !== currentURL) {
      currentURL = url.href;
      since = Date.now();
      attempts = 0;
      lastAttempt = -Infinity;
    }
    if (!settings[site]) { setStatus('disabled'); return; }
    // Inspect Gemini's toggle even after its temporary conversation changes route.
    if (site === 'gemini' && geminiActive()) {
      setStatus('active'); return;
    }
    // If the user exits temporary mode, enforce the enabled preference again.
    // Failed activation still has a bounded retry budget before the warning.
    if (site === 'gemini' && status === 'active') {
      attempts = 0;
      lastAttempt = -Infinity;
      since = Date.now();
    }
    if (site === 'chatgpt' && chatgptActive()) { setStatus('active'); return; }
    if (site === 'claude' && claudeActive()) { setStatus('active'); return; }
    if (!core.isNewChat(url)) { setStatus('existing'); return; }
    const redirect = core.temporaryURL(url);
    if (redirect) {
      setStatus('checking');
      location.replace(redirect);
      return;
    }
    if (site !== 'gemini') { setStatus('requested'); return; }
    setStatus(Date.now() - since > 15000 ? 'blocked' : 'checking');
    const button = geminiButton();
    if (button && geminiIcon(button) === 'gemini_chat_temp' &&
        !button.disabled && button.getAttribute('aria-disabled') !== 'true' &&
        Date.now() - since <= 15000 && attempts < 4 && Date.now() - lastAttempt >= 2500) {
      // Server-rendered controls may appear before Angular attaches handlers.
      // Retry slowly, checking the active icon before every attempt.
      attempts++;
      lastAttempt = Date.now();
      button.click();
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(inspect, 100);
  }
  // Protect Gemini's empty composer while the asynchronous toggle is pending.
  // These DOM guards do not intercept the site's network requests.
  function guard(event) {
    if (site !== 'gemini' || !settings.gemini || !core.isNewChat(new URL(location.href))) return;
    if (geminiActive()) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const composer = target.closest('[contenteditable="true"],textarea,[role="textbox"]');
    const button = target.closest('button');
    // The activation control itself must never be caught by our send guard.
    // Gemini's toolbar buttons have no type attribute, so their .type is
    // "submit" even though they are outside a form and do not send a prompt.
    if (button && button === geminiButton()) return;
    const submitButton = button && (/send|submit|envoyer|senden|enviar|إرسال/i.test(button.getAttribute('aria-label') || button.textContent || '') || (button.type === 'submit' && button.form));
    const unsafe = event.type === 'submit' ||
      (event.type === 'keydown' && event.key === 'Enter' && composer) ||
      (['beforeinput', 'paste', 'drop'].includes(event.type) && composer) ||
      (event.type === 'click' && submitButton);
    if (unsafe) {
      event.preventDefault();
      event.stopImmediatePropagation();
      schedule();
    }
  }
  for (const type of ['submit', 'keydown', 'beforeinput', 'paste', 'drop', 'click']) {
    document.addEventListener(type, guard, true);
  }
  // Rewrite new-chat links before SPA routers handle them; preserve query options.
  document.addEventListener('click', event => {
    if (!loaded || !settings[site] || site === 'gemini' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    const redirect = core.temporaryURL(url);
    if (redirect) { event.preventDefault(); event.stopImmediatePropagation(); location.assign(redirect); }
  }, true);

  new MutationObserver(schedule).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-mat-icon-name', 'fonticon', 'aria-label'] });
  // Also catches history.pushState navigations that do not mutate the document.
  setInterval(inspect, 750);
  window.addEventListener('popstate', schedule);
  chrome.storage.local.get(core.defaults).then(value => {
    settings = value; loaded = true; inspect();
  }).catch(() => { loaded = true; inspect(); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key of Object.keys(core.defaults)) {
      if (changes[key]) settings[key] = changes[key].newValue ?? true;
    }
    attempts = 0; lastAttempt = -Infinity; since = Date.now(); inspect();
  });
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'incognito-status') { inspect(); respond(state()); }
  });
})();
