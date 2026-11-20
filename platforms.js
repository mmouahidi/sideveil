'use strict';

// Launch only clean entry pages. Never copy a query, video, or chat from the active tab.
const platforms = {
  perplexity: {
    name: 'Perplexity', url: 'https://www.perplexity.ai/',
    mode: 'Incognito', tip: 'Turn on Incognito in Perplexity before starting a thread.'
  },
  grok: {
    name: 'Grok', url: 'https://grok.com/',
    mode: 'Private Chat', tip: 'Select the ghost icon to enter Private Chat before sending.'
  },
  mistral: {
    name: 'Mistral Vibe', url: 'https://chat.mistral.ai/',
    mode: 'Temporary Chat', tip: 'Start a Temporary Chat in Vibe before sending.'
  },
  copilot: {
    name: 'Microsoft 365 Copilot', url: 'https://copilot.cloud.microsoft/chat',
    mode: 'Temporary Chat', tip: 'Select Temporary Chat. Your organization’s retention policy can still apply.'
  },
  googleAI: {
    name: 'Google Search AI Mode', url: 'https://www.google.com/ai',
    mode: 'Temporary thread', tip: 'Select Temporary thread in AI Mode if it’s available on your account.'
  },
  kimi: { name: 'Kimi', url: 'https://www.kimi.com/' },
  manus: { name: 'Manus', url: 'https://manus.im/app' },
  deepseek: { name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
  minimax: { name: 'MiniMax Agent', url: 'https://agent.minimax.io/' },
  google: { name: 'Google Search', url: 'https://www.google.com/' },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/' }
};

async function launchPlatform(id, privateWindow, browser = chrome) {
  if (!Object.hasOwn(platforms, id)) throw new Error('Unsupported platform');
  const { url, mode } = platforms[id];
  if (privateWindow) {
    await browser.windows.create({ url, incognito: true });
    return;
  }
  if (!mode) throw new Error('Choose a private browser window for this site');
  await browser.tabs.create({ url });
}

if (typeof module !== 'undefined' && module.exports) module.exports = { platforms, launchPlatform };
