const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../core.js');

test('only supported blank chat routes are redirected', () => {
  for (const address of ['https://chatgpt.com/c/saved', 'https://chatgpt.com/g/gem', 'https://claude.ai/chat/saved', 'https://claude.ai/project/p', 'https://gemini.google.com/app/saved', 'https://gemini.google.com/gem/g', 'https://claude.ai/login', 'https://example.com/']) {
    assert.equal(core.isNewChat(new URL(address)), false, address);
    assert.equal(core.temporaryURL(new URL(address)), null, address);
  }
});
test('ChatGPT URL preserves model, prompt, and hash and replaces false flags', () => {
  const target = new URL(core.temporaryURL(new URL('https://chatgpt.com/?model=test&q=a%26b&temporary-chat=false#section')));
  assert.equal(target.searchParams.get('temporary-chat'), 'true');
  assert.equal(target.searchParams.get('model'), 'test');
  assert.equal(target.searchParams.get('q'), 'a&b');
  assert.equal(target.hash, '#section');
  assert.equal(core.temporaryURL(target), null);
});
test('Claude redirects root and new routes once and preserves options', () => {
  for (const route of ['/', '/new', '/new/']) {
    const target = new URL(core.temporaryURL(new URL(`https://claude.ai${route}?model=test`)));
    assert.equal(target.pathname, '/new');
    assert.equal(target.searchParams.has('incognito'), true);
    assert.equal(target.searchParams.get('model'), 'test');
    assert.equal(core.temporaryURL(target), null);
  }
});
test('Gemini account-specific blank routes use UI activation', () => {
  for (const route of ['/app', '/app/', '/u/0/app', '/u/12/app/']) {
    const url = new URL('https://gemini.google.com' + route);
    assert.equal(core.isNewChat(url), true);
    assert.equal(core.temporaryURL(url), null);
  }
});

async function fixture({ href = 'https://gemini.google.com/app', icon = 'gemini_chat_temp', settings = {}, succeeds = true, present = true, ignoredClicks = 0, regular = false } = {}) {
  const listeners = {};
  let storageListener, messageListener;
  let clock = 0;
  let clicks = 0;
  let interval;
  let observer;
  const timers = [];
  let conversationHeader = false;
  let modeIndicator = '';
  class Element {
    closest(selector) { return selector.includes('contenteditable') ? this : null; }
  }
  const iconNode = { getAttribute: name => name === 'data-mat-icon-name' ? icon : null };
  class ToggleButton extends Element {
    disabled = false;
    // HTML buttons without a type attribute default to submit, even outside forms.
    type = 'submit';
    form = null;
    getAttribute() { return null; }
    querySelector() { return iconNode; }
    closest(selector) { return selector === 'button' ? this : null; }
    click() {
      clicks++;
      const event = { type: 'click', target: this, button: 0,
        preventDefault() { this.defaultPrevented = true; },
        stopImmediatePropagation() { this.stopped = true; } };
      for (const callback of listeners.click || []) {
        callback(event);
        if (event.stopped) break;
      }
      if (!event.defaultPrevented && succeeds && clicks > ignoredClicks) icon = 'close';
    }
  }
  const button = new ToggleButton();
  const location = { href, replace(value) { this.href = value; this.redirect = value; }, assign(value) { this.href = value; } };
  Object.defineProperty(location, 'origin', { get: () => new URL(location.href).origin });
  const body = { append() {} };
  const document = {
    body,
    querySelector: selector => selector === '.temporary-chat-header' ?
      (conversationHeader ? { hidden: false, getAttribute: () => null, getClientRects: () => [{}] } : null) :
      (selector.includes('temp-chat') || selector.includes('Temporary chat') ? (present ? button : null) : null),
    querySelectorAll: selector => selector === 'button[aria-label]' && modeIndicator
      ? [{ getClientRects: () => [{}], getAttribute: () => modeIndicator }]
      : [],
    addEventListener(type, callback) { (listeners[type] ||= []).push(callback); }
  };
  const context = vm.createContext({
    IncognitoCore: core, SideveilChatStatus: { create: () => ({ render() {} }) },
    URL, location, document, Element,
    Date: { now: () => clock },
    setTimeout: callback => timers.push(callback),
    setInterval: callback => { interval = callback; },
    MutationObserver: class { constructor(callback) { observer = callback; } observe() {} },
    window: { addEventListener() {} },
    chrome: {
      storage: { local: { get: async () => ({ ...core.defaults, ...settings }) }, onChanged: { addListener: cb => { storageListener = cb; } } },
      runtime: {
        getManifest: () => require('../manifest.json'),
        sendMessage: async () => regular,
        onMessage: { addListener: cb => { messageListener = cb; } }
      }
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../content.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  function status(type = 'incognito-status') {
    let result;
    messageListener({ type }, {}, value => { result = value; });
    return result.status;
  }
  return {
    status, location, get clicks() { return clicks; }, tick: () => interval(),
    setIcon: value => { icon = value; },
    setModeIndicator: value => { modeIndicator = value; },
    enableToggle: () => { present = true; },
    startConversation: () => { present = false; conversationHeader = true; },
    advance: value => { clock += value; interval(); },
    change: value => storageListener(value, 'local'),
    mutate: () => { observer(); while (timers.length) timers.shift()(); },
    event(type, extra = {}) {
      const event = { type, target: new Element(), key: 'Enter', preventDefault() { this.prevented = true; }, stopImmediatePropagation() {}, ...extra };
      for (const callback of listeners[type] || []) callback(event);
      return event;
    }
  };
}
test('Gemini activation is idempotent across polling and DOM changes', async () => {
  const app = await fixture({});
  assert.equal(app.clicks, 1);
  assert.equal(app.status(), 'active');
  for (let i = 0; i < 5; i++) { app.tick(); app.mutate(); }
  assert.equal(app.clicks, 1);
  assert.equal(app.event('beforeinput').prevented, undefined);
});
test('already-active Gemini is never toggled off', async () => {
  const app = await fixture({ icon: 'close' });
  app.tick();
  assert.equal(app.clicks, 0);
  assert.equal(app.status(), 'active');
});
test('Gemini allows follow-up messages when the toggle becomes a temporary-chat header', async () => {
  const app = await fixture({});
  assert.equal(app.status(), 'active');
  app.startConversation();
  app.advance(20000);
  assert.equal(app.status(), 'active');
  for (const type of ['beforeinput', 'paste', 'keydown', 'submit']) {
    assert.equal(app.event(type).prevented, undefined, type);
  }
  assert.equal(app.clicks, 1);
});
test('Gemini retries a click ignored before app hydration and stops after activation', async () => {
  const app = await fixture({ ignoredClicks: 1 });
  assert.equal(app.status(), 'checking');
  assert.equal(app.clicks, 1);
  app.advance(1000);
  assert.equal(app.clicks, 1);
  app.advance(2000);
  assert.equal(app.status(), 'active');
  assert.equal(app.clicks, 2);
  app.advance(5000);
  assert.equal(app.clicks, 2);
});
test('Gemini retries are spaced and bounded when a control never activates', async () => {
  const app = await fixture({ succeeds: false });
  for (let i = 0; i < 10; i++) app.advance(1000);
  assert.equal(app.clicks, 4);
  app.advance(6000);
  assert.equal(app.status(), 'blocked');
  assert.equal(app.clicks, 4);
});
test('Gemini automation reactivates mode after a user exits it', async () => {
  const app = await fixture({});
  assert.equal(app.status(), 'active');
  app.setIcon('gemini_chat_temp');
  app.tick();
  assert.equal(app.clicks, 2);
  assert.equal(app.status(), 'active');
  app.tick();
  assert.equal(app.clicks, 2);
});
test('failed activation blocks composer events and times out without repeat clicks', async () => {
  const app = await fixture({ succeeds: false });
  for (const type of ['beforeinput', 'paste', 'drop', 'keydown', 'submit']) assert.equal(app.event(type).prevented, true, type);
  app.advance(16000);
  assert.equal(app.status(), 'blocked');
  app.tick();
  assert.equal(app.clicks, 1);
});
test('unavailable button fails visibly and disabling releases the composer', async () => {
  const app = await fixture({ present: false });
  app.advance(16000);
  assert.equal(app.status(), 'blocked');
  app.change({ gemini: { newValue: false } });
  assert.equal(app.status(), 'disabled');
  assert.equal(app.event('beforeinput').prevented, undefined);
  assert.equal(app.clicks, 0);
});
test('saved chats are not modified or blocked and SPA new-chat navigation is covered', async () => {
  const app = await fixture({ href: 'https://gemini.google.com/app/saved' });
  assert.equal(app.clicks, 0);
  assert.equal(app.status(), 'existing');
  assert.equal(app.event('beforeinput').prevented, undefined);
  app.location.href = 'https://gemini.google.com/app';
  app.tick();
  assert.equal(app.clicks, 1);
  assert.equal(app.status(), 'active');
});
test('disabled site remains unchanged until enabled', async () => {
  const app = await fixture({ href: 'https://chatgpt.com/?model=test', settings: { chatgpt: false } });
  assert.equal(app.status(), 'disabled');
  assert.equal(app.location.redirect, undefined);
  app.change({ chatgpt: { newValue: true } });
  const url = new URL(app.location.redirect);
  assert.equal(url.searchParams.get('temporary-chat'), 'true');
  assert.equal(url.searchParams.get('model'), 'test');
});
test('URL parameter alone is not reported as verified active', async () => {
  const app = await fixture({ href: 'https://claude.ai/new?incognito' });
  assert.equal(app.status(), 'requested');
  assert.equal(app.location.redirect, undefined);
  app.advance(16000);
  assert.equal(app.status(), 'unverified');
  app.setModeIndicator('Exit incognito');
  assert.equal(app.status('sideveil-retry'), 'active');
});

test('Gemini Retry starts a new activation attempt without reloading', async () => {
  const app = await fixture({ present: false });
  app.advance(16000);
  assert.equal(app.status(), 'blocked');
  app.enableToggle();
  app.status('sideveil-retry');
  assert.equal(app.status(), 'active');
  assert.equal(app.clicks, 1);
  assert.equal(app.location.redirect, undefined);
  assert.equal(app.event('beforeinput').prevented, undefined);
});

test('one regular chat skips automation and releases Gemini input, then expires', async () => {
  const app = await fixture({ regular: true });
  assert.equal(app.status(), 'regular');
  assert.equal(app.clicks, 0);
  assert.equal(app.event('beforeinput').prevented, undefined);
  app.location.href = 'https://gemini.google.com/app/saved';
  assert.equal(app.status(), 'existing');
  app.location.href = 'https://gemini.google.com/app';
  assert.equal(app.status(), 'checking');
  assert.equal(app.status(), 'active');
  assert.equal(app.clicks, 1);
});

test('one regular Claude chat opens without a temporary URL redirect', async () => {
  const app = await fixture({ href: 'https://claude.ai/new', regular: true });
  assert.equal(app.status(), 'regular');
  assert.equal(app.location.redirect, undefined);
});

test('regular chat opens in the new tab only and keeps the selected Gemini account', async () => {
  const tabs = new Map();
  const data = {};
  let onMessage, onRemoved;
  const popup = 'chrome-extension://sideveil/popup.html';
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../background.js'), 'utf8'), {
    importScripts() {}, URL, IncognitoCore: core,
    chrome: {
      runtime: { getURL: () => popup, onMessage: { addListener: fn => { onMessage = fn; } } },
      storage: {
        session: {
          async get(key) { return { [key]: data[key] }; },
          async set(values) { Object.assign(data, values); },
          async remove(key) { delete data[key]; }
        }
      },
      tabs: {
        async create(options) { tabs.set(12, options); return { id: 12 }; },
        async update(id, options) {
          assert.ok(data['regular-chat:' + id]);
          tabs.set(id, options);
        },
        onRemoved: { addListener: fn => { onRemoved = fn; } }
      }
    }
  });
  const send = (message, sender) => new Promise(resolve => onMessage(message, sender, resolve));
  const opened = await send({ type: 'sideveil-open-regular', page: 'https://gemini.google.com/u/2/app/saved' }, { url: popup });
  assert.equal(opened.ok, true);
  const url = tabs.get(12).url;
  assert.equal(url, 'https://gemini.google.com/u/2/app');
  const claim = id => send({ type: 'sideveil-claim-regular' }, { url, tab: { id }, frameId: 0 });
  assert.equal(await claim(11), false);
  assert.equal(await claim(12), true);
  assert.equal(await claim(12), false);
  await send({ type: 'sideveil-open-regular', page: url }, { url: popup });
  onRemoved(12);
  assert.equal(await claim(12), false);
});
test('manifest has no unnecessary network or browsing-history permission', () => {
  const manifest = require('../manifest.json');
  assert.deepEqual(manifest.permissions, ['storage', 'activeTab']);
  assert.equal(manifest.manifest_version, 3);
  for (const file of manifest.content_scripts[0].js.concat([manifest.background.service_worker, 'popup.html', 'popup.js', 'popup.css'])) {
    assert.equal(fs.existsSync(path.join(__dirname, '..', file)), true, file);
  }
});
test('release icons are correctly sized PNGs and the local font license is included', () => {
  const manifest = require('../manifest.json');
  assert.ok(manifest.name.length <= 75);
  assert.ok(manifest.description.length <= 132);
  for (const [size, file] of Object.entries(manifest.icons)) {
    const bytes = fs.readFileSync(path.join(__dirname, '..', file));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), Number(size));
    assert.equal(bytes.readUInt32BE(20), Number(size));
  }
  assert.ok(fs.existsSync(path.join(__dirname, '../fonts/Onest.ttf')));
  assert.match(fs.readFileSync(path.join(__dirname, '../fonts/OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/);
});
