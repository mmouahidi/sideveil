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
- **See the current state:** distinguish a requested mode from a verified active indicator.
- **Keep your current conversation:** open a separate temporary chat from the popup without replacing your conversation or draft.
- **Local settings:** three preferences stored in this browser, with no Sideveil account, analytics, or developer backend.
- **Simple to inspect:** plain JavaScript, HTML, and CSS, with bundled fonts and no runtime dependencies.

## Install

The included extension is version **1.1.0** for desktop Chrome and Microsoft Edge. Installation is manual; this README does not link to a published extension-store listing.

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
3. Confirm temporary or incognito mode using the service’s own indicator before sending a message.

On a supported page, **Open a temporary chat** enables automation for that service and opens a separate tab. Turning a service switch off stops future automation; it does not close or exit an already active temporary conversation. While Gemini automation is enabled, Sideveil attempts to reactivate temporary mode if you exit it on a supported new-chat page.

### Status messages

| Status | Meaning |
| --- | --- |
| Checking | Sideveil is inspecting the page or waiting for activation. |
| Active | Sideveil recognized a provider temporary-mode indicator. |
| Requested | A temporary-mode URL flag is present; the page indicator has not been verified. |
| Off | Automation is disabled for this service. |
| Existing chat or another page | The page is outside the supported new-chat routes and is left unchanged. |
| Could not be activated | Gemini activation timed out. Check availability or turn its automation off. |

## How it works

| Service | Supported new-chat routes | Activation |
| --- | --- | --- |
| ChatGPT | `/` on `chatgpt.com` | Adds `temporary-chat=true`, preserving other query parameters and the URL fragment. |
| Claude | `/`, `/new`, `/new/` on `claude.ai` | Uses `/new?incognito`, preserving other query parameters and the URL fragment. |
| Gemini | `/app`, `/u/NUMBER/app`, with optional trailing slash, on `gemini.google.com` | Activates the native temporary-chat control and checks its active indicator or conversation header. |

Content scripts watch supported pages for navigation and relevant interface changes. Saved chats, projects, Gems, shared chats, settings, and sign-in routes are outside the new-chat routes; Sideveil does not convert existing conversations retroactively.

Gemini activation makes at most four attempts, spaced at least 2.5 seconds apart. While activation is pending, Sideveil pauses ordinary composer input and send events. After approximately 15 seconds without activation, it shows a warning. This page-level guard does not intercept network requests: programmatic sends, voice input, other tools, or page changes can bypass it.

## Privacy and permissions

Sideveil stores only its three automation preferences in `chrome.storage.local`. On supported pages, it inspects the URL and relevant interface controls to request and recognize temporary mode. Code and fonts ship with the extension.

The extension has no analytics, remote code, developer server, prompt collection, message logging, or network interception. It does not transmit chat data or preferences to a developer backend.

| Permission or site access | Purpose |
| --- | --- |
| `storage` | Save the three service switches locally. Browser sync storage is not used. |
| `activeTab` | Identify the current supported tab when the popup is opened and request its mode status. |
| `https://chatgpt.com/*` | Run the ChatGPT content script. |
| `https://claude.ai/*` | Run the Claude content script. |
| `https://gemini.google.com/*` | Run the Gemini content script. |

**Privacy limits:** your messages still go to the AI provider. Its retention rules, account requirements, and feature availability apply. Sideveil does not provide anonymity, open browser Incognito/InPrivate windows, erase browser history, guarantee deletion, or verify a provider’s internal data handling.

Read the [full privacy policy](PRIVACY.md).

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| The popup asks you to reload | Reload the supported page after installing or updating the extension. |
| Status stays at “Requested” | Check the provider’s own indicator. An unrecognized language or changed interface can prevent verification. |
| Gemini pauses typing or sending | Wait for activation. If the warning appears, turn Gemini automation off to release the composer, or reload to retry. |
| A saved conversation stays unchanged | Start a new chat. Sideveil does not convert existing conversations. |
| Temporary mode does not activate | Check that the service switch is on and that the feature is available to your account. Report persistent failures with the details below. |

Provider interfaces and feature availability can change. The code includes some English and French control labels; universal language support is not guaranteed.

## Development

No bundler or dependency installation is needed. Edit the source, reload the unpacked extension, and reload the provider tabs.

To run the automated tests, install a Node.js version that supports `node:test` and run this command from the repository root:

```sh
node --test tests/extension.test.cjs
```

The suite currently contains **17 tests** covering routing, URL parameter preservation, saved-chat protection, preferences, Gemini activation and retries, follow-up messages, input guards, permissions, icons, and the bundled font license.

These are local tests using page fixtures. They do not prove that the latest live provider interfaces work. Before distributing a release, manually check new chats, a follow-up message, saved chats, switches, and popup status on each service. See the [release checklist](docs/PUBLISHING.md).

### Project structure

```text
sideveil/
├── manifest.json          # Extension identity, permissions, and content scripts
├── core.js                # Provider detection and new-chat URL rules
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
