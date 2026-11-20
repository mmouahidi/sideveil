<p align="center">
  <img src="docs/brand/icon-128.png" width="88" height="88" alt="Sideveil logo">
</p>

<h1 align="center">Sideveil</h1>

<p align="center"><strong>Temporary chats. By default.</strong></p>

<p align="center">Make new ChatGPT, Claude, and Gemini conversations temporary automatically.<br>One small browser extension. Independent controls for each service.</p>

<p align="center">Chrome &amp; Edge · Manifest V3 · No build step · MIT licensed</p>

---

Sideveil requests or activates each AI service’s native temporary or incognito mode when you start a new chat. Set your preferences once, then use the services as usual. Saved conversations stay unchanged.

<p align="center">
  <img src="docs/brand/popup-light.png" width="360" alt="Sideveil popup showing switches for ChatGPT, Claude, and Gemini, plus temporary-chat status">
  <br><em>Popup preview with example status. Always check the AI service’s own mode indicator.</em>
</p>

**[Install](#install) · [Usage](#usage) · [How it works](#how-it-works) · [Privacy](#privacy-and-permissions) · [Troubleshooting](#troubleshooting) · [Development](#development) · [Contribute](#contributing)**

## Why Sideveil?

- **Temporary by default:** automate the native temporary-chat mode on three supported services.
- **Choose per service:** turn ChatGPT, Claude, and Gemini automation on or off independently. All three start enabled.
- **See the mode before you send:** check Sideveil’s status beside the message box or in the toolbar popup.
- **Switch to regular here:** use the current tab for a regular chat and keep your usual temporary default for the next chat.
- **More platforms:** find native temporary mode instructions or open a clean site in an Incognito or InPrivate window.
- **Keep your current conversation:** open a separate temporary chat from the popup without replacing your conversation or draft.
- **Local settings:** preferences are stored in this browser, with no Sideveil account, analytics, or developer backend.
- **Simple to inspect:** plain JavaScript, HTML, and CSS, with bundled fonts and no runtime dependencies.

## Install

Sideveil runs on desktop Chrome and Microsoft Edge. Install it manually using the steps below.

1. Download this repository using **Code → Download ZIP**, then extract it. Alternatively, clone the repository.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted folder containing `manifest.json`.
5. Reload any ChatGPT, Claude, or Gemini tabs that were already open.
6. Pin **Sideveil** from the browser’s extensions menu for easy access.

Keep the extracted folder on your computer: the browser loads the extension from that location. No build command, package installation, API key, or Sideveil account is required. You still need access to each AI service and its temporary-chat feature.

**Updating:** replace the extension files in the same folder, click **Reload** on the browser’s extensions page, then reload the supported tabs. Sideveil retains its existing preference keys.

## Usage

1. Open the Sideveil popup and choose which services to automate.
2. Start a new chat on a supported service.
3. Check the status beside the message box. **Temporary mode confirmed** means Sideveil recognized the service’s own indicator.

On a supported page, **Open a temporary chat** enables automation for that service and opens a separate tab. Turning a service switch off stops future automation; it does not close or exit an already active temporary conversation. While Gemini automation is enabled, Sideveil attempts to reactivate temporary mode if you exit it on a supported new-chat page.

Choose **Switch to regular here** beside the message box or in the popup. On an empty Gemini composer, Sideveil switches modes in place. On other surfaces, it may load a fresh regular chat in the same tab. Copy any draft you want to keep before switching. The next new chat uses your usual temporary preference.

### Status messages

| Status | Meaning |
| --- | --- |
| Checking | Sideveil is inspecting the page or waiting for activation. |
| Active | Sideveil recognized a provider temporary-mode indicator. |
| Requested | A temporary-mode URL flag is present; the page indicator has not been verified. |
| Couldn’t confirm | Sideveil did not find the provider’s active indicator. Use **Retry** to check again or use the provider’s own temporary chat control. |
| Regular chat selected | You opened this chat with automatic temporary mode paused. |
| Off | Automation is disabled for this service. |
| Existing chat or another page | The page is outside the supported new-chat routes and is left unchanged. |

## How it works

| Service | Supported new-chat routes | Activation |
| --- | --- | --- |
| ChatGPT | `/` on `chatgpt.com` | Adds `temporary-chat=true`, preserving other query parameters and the URL fragment. |
| Claude | `/`, `/new`, `/new/` on `claude.ai` | Uses `/new?incognito`, preserving other query parameters and the URL fragment. |
| Gemini | `/app`, `/u/NUMBER/app`, with optional trailing slash, on `gemini.google.com` | Activates the native temporary-chat control and checks its active indicator or conversation header. |
| Grok (opt-in preview) | Clean home or new-chat page on `grok.com` | Uses Grok’s Private Chat control when recognized and confirms the native history notice. |
| Microsoft 365 Copilot (opt-in preview) | Clean `/chat` on `copilot.cloud.microsoft` | Looks for the native Temporary Chat toggle and confirms its pressed state. Organization retention can still apply. |

Content scripts watch supported pages for navigation and relevant interface changes. Saved chats, projects, Gems, shared chats, settings, and sign-in routes are outside the new-chat routes; Sideveil does not convert existing conversations retroactively.

Gemini activation makes at most four attempts per try, spaced at least 2.5 seconds apart. Until activation succeeds, Sideveil pauses ordinary input and send events. After about 15 seconds it offers **Retry** and **Switch to regular here**. The guard works on page events, so voice input, other tools, and site updates can bypass it.

### More platforms

Open **More platforms** in the popup and choose a site. Perplexity, Mistral Vibe, and Google Search AI Mode have guided shortcuts to their native modes. Grok and Microsoft 365 Copilot also have guided shortcuts if you prefer to use the native controls yourself. The Grok and Copilot automation previews start off and only show confirmation when they detect the provider’s active state.

The launcher can open all of those sites plus Kimi, Manus, DeepSeek, MiniMax Agent, Google Search, and YouTube in a browser Incognito or InPrivate window. The window starts on the site’s entry page. A provider can still record activity if you sign in, and existing private windows can share sign-in state until you close all of them. See [platform coverage](docs/PLATFORMS.md) for documented controls and verification limits.

## Privacy and permissions

Sideveil stores automation preferences in `chrome.storage.local`. To switch a chat that requires navigation, it temporarily stores the current tab ID, provider, and expiry in browser session memory. On sites with automation, it inspects the URL and relevant interface controls to request and recognize temporary mode. Code and fonts ship with the extension.

The extension has no analytics, remote code, developer server, prompt collection, message logging, or network interception. It does not transmit chat data or preferences to a developer backend.

| Permission or site access | Purpose |
| --- | --- |
| `storage` | Save the service switches locally and pass a one-time exception across navigation through session memory. |
| `activeTab` | Identify the current supported tab when the popup is opened and request its mode status. |
| `https://chatgpt.com/*` | Run the ChatGPT content script. |
| `https://claude.ai/*` | Run the Claude content script. |
| `https://gemini.google.com/*` | Run the Gemini content script. |
| `https://grok.com/*` | Read Private Chat state and optionally activate the Grok preview. |
| `https://copilot.cloud.microsoft/chat*` | Read Temporary Chat state and optionally activate the Copilot preview. |

**Privacy limits:** your messages still go to the AI provider. Its retention rules, account requirements, and feature availability apply. A browser Incognito or InPrivate window controls local browsing history. The provider’s native mode controls the conversation according to the provider’s policies.

Read the [full privacy policy](PRIVACY.md).

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| The popup asks you to reload | Reload the supported page after installing or updating the extension. |
| Sideveil says “Couldn’t confirm” | Check for the provider’s indicator. An unrecognized language or changed interface can prevent verification. Retry to check again or use the provider’s temporary chat control. |
| Gemini pauses typing or sending | Wait for activation. If it times out, choose **Retry** or **Switch to regular here**. Gemini’s temporary mode requires a personal Google account. [Gemini Help](https://support.google.com/gemini/answer/13275745?co=GENIE.Platform%3DDesktop&hl=en) |
| A saved conversation stays unchanged | Start a new chat. Sideveil does not convert existing conversations. |
| Temporary mode does not activate | Check that the service switch is on and that the feature is available to your account. Report persistent failures with the details below. |

Provider interfaces and feature availability can change. The code includes some English and French control labels; universal language support is not guaranteed.

## Development

No bundler or dependency installation is needed. Edit the source, reload the unpacked extension, and reload the provider tabs.

To run the automated tests, install a Node.js version that supports `node:test` and run this command from the repository root:

```sh
node --test tests/extension.test.cjs
```

The suite covers routing, saved-chat protection, mode confirmation, retries, one-chat exceptions, preferences, permissions, and bundled assets.

These are local tests using page fixtures. They do not prove that the latest live provider interfaces work. Before distributing a release, manually check new chats, a follow-up message, saved chats, switches, and popup status on each service. See the [release checklist](docs/PUBLISHING.md).

### Project structure

```text
sideveil/
├── manifest.json          # Extension identity, permissions, and content scripts
├── core.js                # Provider detection and new-chat URL rules
├── background.js          # Switches the current tab and hands off the one-time exception
├── platforms.js           # Site directory and private browser launcher
├── chat-status.js         # Mode indicator and controls beside the message box
├── content.js             # Activation, status detection, navigation, and guards
├── popup.html             # Settings and current-page status
├── popup.css              # Light/dark popup styling and bundled font
├── popup.js               # Preferences, status requests, and new-tab action
├── icons/                 # Extension icons
├── fonts/                 # Onest font and its SIL OFL license
├── tests/                 # Node.js test suite
└── docs/                  # Brand, design, store artwork, and publishing notes
```

The internal name `IncognitoCore` and `incognito-*` message and DOM identifiers are retained from earlier versions. The public product name is Sideveil.

## Contributing

Bug reports, reproducible provider-interface fixes, accessibility improvements, and language support are welcome. Open an issue before a substantial change, and keep pull requests focused.

For a bug report, include the browser and extension versions, affected service, interface language, steps to reproduce, and observed popup status. Remove private chats, account details, and sensitive URL parameters from reports and screenshots.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the development and review checklist.

## License and credits

Sideveil’s code and original artwork are available under the [MIT License](LICENSE). The bundled **Onest** font, including font data embedded in the wordmark SVGs, remains under the [SIL Open Font License 1.1](fonts/OFL.txt).

Sideveil is an independent project and is not affiliated with or endorsed by OpenAI, Anthropic, Google, Microsoft, or their products.
