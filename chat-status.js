(() => {
  'use strict';
  const editors = {
    chatgpt: '#prompt-textarea',
    claude: '[contenteditable="true"].ProseMirror, [contenteditable="true"][data-testid="chat-input"]',
    gemini: 'rich-textarea [contenteditable="true"], .ql-editor[contenteditable="true"]'
  };
  const titles = {
    checking: 'Checking temporary mode…',
    requested: 'Checking temporary mode…',
    active: 'Temporary mode confirmed',
    unverified: 'Couldn’t confirm temporary mode',
    blocked: 'Couldn’t confirm temporary mode',
    regular: 'Regular chat selected'
  };
  const css = `
    :host {
      display: block;
      box-sizing: border-box;
      margin: 0 0 8px;
      min-width: 0;
      color-scheme: light dark;
      font: 13px/1.45 system-ui, sans-serif;
      text-align: start;
      --text: #132755;
      --surface: #eef3ff;
      --line: #c4d3f7;
      --accent: #174df0;
    }
    :host([data-floating]) {
      position: fixed;
      inset: auto auto 16px 16px;
      z-index: 2147483647;
      width: min(360px, calc(100vw - 32px));
      margin: 0;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        --text: #e7edff;
        --surface: #1b2c50;
        --line: #647494;
        --accent: #a9f0d3;
      }
    }
    .panel {
      color: var(--text);
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 7px 12px;
      overflow-wrap: anywhere;
    }
    .row, .actions { display: flex; gap: 4px 12px; flex-wrap: wrap; align-items: center; }
    .row { justify-content: space-between; }
    strong { font-weight: 650; }
    .brand { font-weight: 650; color: var(--accent); margin-inline-end: 8px; }
    p { margin: 4px 0 1px; }
    button {
      font: inherit;
      font-weight: 600;
      color: inherit;
      background: transparent;
      border: 0;
      padding: 4px 2px;
      border-radius: 7px;
      min-height: 24px;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    button:hover { color: var(--accent); }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    button:disabled { opacity: .65; cursor: wait; }
    [hidden] { display: none; }
  `;

  function create(site, retry, openRegular) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    shadow.adoptedStyleSheets = [sheet];
    shadow.innerHTML = `
      <div class="panel">
        <div class="row">
          <div><span class="brand">Sideveil</span><strong role="status" tabindex="-1"></strong></div>
          <div class="actions">
            <button type="button" id="retry">Retry</button>
            <button type="button" id="regular">Start one regular chat</button>
          </div>
        </div>
        <p id="detail" hidden></p>
        <p id="error" role="status" hidden></p>
      </div>
    `;
    const title = shadow.querySelector('strong');
    const retryButton = shadow.querySelector('#retry');
    const regularButton = shadow.querySelector('#regular');
    const detail = shadow.querySelector('#detail');
    const error = shadow.querySelector('#error');
    let lastStatus;
    retryButton.addEventListener('click', event => {
      if (!event.isTrusted) return;
      if (shadow.activeElement === retryButton) title.focus({ preventScroll: true });
      retry();
    });
    regularButton.addEventListener('click', async event => {
      if (!event.isTrusted) return;
      regularButton.disabled = true;
      error.hidden = true;
      try {
        await openRegular();
      } catch {
        error.textContent = 'Couldn’t open a regular chat. Try again.';
        error.hidden = false;
      } finally {
        regularButton.disabled = false;
      }
    });
    return {
      render(status) {
        if (!Object.hasOwn(titles, status)) { host.remove(); return; }
        const editor = [...document.querySelectorAll(editors[site])]
          .find(element => element.getClientRects().length > 0);
        const anchor = editor?.closest('form, input-area-v2, input-area, [data-testid="chat-input"]')
          || editor?.parentElement;
        if (anchor?.parentElement) {
          host.removeAttribute('data-floating');
          if (anchor.previousElementSibling !== host) anchor.before(host);
        } else if (status === 'blocked' && document.body) {
          host.setAttribute('data-floating', '');
          if (host.parentElement !== document.body) document.body.append(host);
        } else {
          host.remove();
          return;
        }
        if (status === lastStatus) return;
        lastStatus = status;
        if (title.textContent !== titles[status]) title.textContent = titles[status];
        retryButton.hidden = status !== 'unverified' && status !== 'blocked';
        regularButton.hidden = status === 'regular';
        detail.textContent = {
          unverified: 'Look for the site’s temporary mode indicator before sending. You can also use its temporary chat control.',
          blocked: 'Sideveil pauses typing and sending here. Gemini temporary chats require a personal Google account.',
          regular: 'Automatic temporary mode is paused for this chat.'
        }[status] || '';
        detail.hidden = !detail.textContent;
        error.hidden = true;
      }
    };
  }

  globalThis.SideveilChatStatus = { create };
})();
