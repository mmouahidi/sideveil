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
  let regularChat = false;
  let chatStatus;
  const activationTimeout = 15000;
  const version = chrome.runtime.getManifest().version;
  const isTemporaryActive = { chatgpt: chatgptActive, claude: claudeActive, gemini: geminiActive }[site];
  const descriptions = {
    checking: 'Checking temporary mode…',
    active: 'Temporary mode confirmed on this page.',
    requested: 'Temporary mode requested through the site URL. Check the site indicator.',
    unverified: 'Couldn’t confirm temporary mode. Check the site’s indicator or use its temporary chat control.',
    disabled: 'Automatic temporary mode is off for this site.',
    existing: 'Existing chat or another page. Left unchanged.',
    blocked: 'Couldn’t confirm Gemini temporary mode. Typing and sending are paused. Gemini temporary chats require a personal Google account.',
    regular: 'Regular chat selected. Automatic temporary mode is paused for this chat.'
  };

  function state() { return { site, status, message: descriptions[status] }; }
  function setStatus(value) {
    status = value;
    document.documentElement?.setAttribute('data-incognito-extension', version);
    document.documentElement?.setAttribute('data-incognito-state', value);
    document.documentElement?.setAttribute('data-incognito-attempts', String(attempts));
    const newChat = core.isNewChat(new URL(location.href));
    if (!chatStatus && document.body && newChat) {
      chatStatus = globalThis.SideveilChatStatus.create(site, retry, openRegular);
    }
    chatStatus?.render(newChat ? value : 'existing');
  }

  function resetActivation() {
    since = Date.now();
    attempts = 0;
    lastAttempt = -Infinity;
  }

  function retry() {
    if (status !== 'unverified' && status !== 'blocked') return state();
    resetActivation();
    inspect();
    return state();
  }

  async function openRegular() {
    const result = await chrome.runtime.sendMessage({ type: 'sideveil-open-regular' });
    if (!result?.ok) throw new Error('Could not open regular chat');
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
    return [...document.querySelectorAll('button use[href*="chat-bubble-checkmark-dashed"]')]
      .some(icon => icon.closest('button')?.getClientRects().length > 0) ||
      [...document.querySelectorAll('button[aria-label]')].some(button =>
        button.getClientRects().length > 0 &&
        /^(turn off temporary chat|disable temporary chat|désactiver le chat éphémère)$/i.test(button.getAttribute('aria-label')));
  }
  function claudeActive() {
    return [...document.querySelectorAll('button[aria-label]')].some(button =>
      button.getClientRects().length > 0 &&
      /^(exit incognito|quitter le mode incognito)$/i.test(button.getAttribute('aria-label')));
  }

  function inspect() {
    scheduled = false;
    if (!loaded) return;
    const url = new URL(location.href);
    const newChat = core.isNewChat(url);
    if (url.href !== currentURL) {
      currentURL = url.href;
      if (!newChat) regularChat = false;
      resetActivation();
    }
    // Recognize the site's indicator even after the user chose regular mode or paused automation.
    if (isTemporaryActive()) { setStatus('active'); return; }
    if (regularChat) { setStatus('regular'); return; }
    if (!settings[site]) { setStatus('disabled'); return; }
    // If the user exits temporary mode, enforce the enabled preference again.
    // Failed activation still has a bounded retry budget before the warning.
    if (site === 'gemini' && status === 'active') {
      resetActivation();
    }
    if (!newChat) { setStatus('existing'); return; }
    const redirect = core.temporaryURL(url);
    if (redirect) {
      setStatus('checking');
      location.replace(redirect);
      return;
    }
    const timedOut = Date.now() - since > activationTimeout;
    if (site !== 'gemini') { setStatus(timedOut ? 'unverified' : 'requested'); return; }
    setStatus(timedOut ? 'blocked' : 'checking');
    const button = geminiButton();
    if (button && geminiIcon(button) === 'gemini_chat_temp' &&
        !button.disabled && button.getAttribute('aria-disabled') !== 'true' &&
        !timedOut && attempts < 4 && Date.now() - lastAttempt >= 2500) {
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
    if (site !== 'gemini' || regularChat || !settings.gemini || !core.isNewChat(new URL(location.href))) return;
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
    if (!loaded || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    if (regularChat && event.isTrusted && event.target.closest(
      'button[data-testid="new-chat-button"], button[aria-label="New chat" i], button[aria-label="Nouvelle discussion" i]'
    )) {
      regularChat = false;
      schedule();
    }
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || !core.isNewChat(url)) return;
    regularChat = false;
    if (!settings[site] || site === 'gemini') return;
    const redirect = core.temporaryURL(url);
    if (redirect) { event.preventDefault(); event.stopImmediatePropagation(); location.assign(redirect); }
  }, true);

  new MutationObserver(schedule).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-mat-icon-name', 'fonticon', 'aria-label'] });
  // Also catches history.pushState navigations that do not mutate the document.
  setInterval(inspect, 750);
  window.addEventListener('popstate', schedule);
  const savedSettings = chrome.storage.local.get(core.defaults).catch(() => ({ ...settings }));
  const pendingRegular = core.isNewChat(new URL(location.href))
    ? chrome.runtime.sendMessage({ type: 'sideveil-claim-regular' }).catch(() => false)
    : false;
  Promise.all([savedSettings, pendingRegular]).then(([value, pending]) => {
    settings = value;
    regularChat = pending === true && core.isNewChat(new URL(location.href));
    loaded = true;
    inspect();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key of Object.keys(core.defaults)) {
      if (changes[key]) settings[key] = changes[key].newValue ?? true;
    }
    resetActivation();
    inspect();
  });
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'incognito-status') { inspect(); respond(state()); }
    if (message.type === 'sideveil-retry') respond(retry());
  });
})();
