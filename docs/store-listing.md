# Sideveil — Temporary AI Chats

Version: 1.1.0
Primary listing language: English
Suggested category: Productivity (use the closest category offered in each dashboard)

## Short description

Make temporary chats the default in ChatGPT, Claude, and Gemini. Choose which services to automate.

## Detailed description

Temporary chats. By default.

Sideveil automatically starts new ChatGPT, Claude, and Gemini conversations in each service’s temporary or incognito mode. Set your preferences once, then get on with your conversation.

Choose your services
Turn automatic mode on or off independently for ChatGPT, Claude, and Gemini. Sideveil keeps those preferences in your browser.

Know what is happening
The toolbar popup shows whether temporary mode is active, has been requested, or needs your attention. Open a separate temporary chat from the popup while keeping your current conversation intact.

Keep existing conversations
Sideveil applies to new chats. It leaves saved conversations, projects, Gems, shared chats, settings, and sign-in pages unchanged. It cannot make previously saved messages private retroactively.

Small and local
No Sideveil account. No analytics. No developer server receiving your chat data. Fonts and code are included in the extension, with no remote code or external font requests.

How it works
Sideveil uses the services’ own temporary-chat controls. For ChatGPT and Claude, it requests the relevant mode through the new-chat URL. For Gemini, it activates the temporary-chat control and recognizes the temporary-conversation header so follow-up messages remain usable.

Privacy boundaries
This is not a browser Incognito/InPrivate window, a VPN, or an anonymity service. AI providers still process your messages and may retain temporary chats under their policies. Features and eligibility depend on your provider account. Site changes can affect automation; check the service’s own mode indicator before sharing sensitive information.

Sideveil is an independent extension and is not affiliated with or endorsed by OpenAI, Anthropic, Google, Microsoft, or their products.

## Search terms

temporary chat; incognito chat; ChatGPT; Claude; Gemini; automatic temporary mode

## Single purpose

Automatically request or activate the native temporary/incognito mode for new chats on ChatGPT, Claude, and Gemini, with per-service preferences and current-page status.

## Permission explanations

- storage: Save the three per-service automation preferences locally in the browser. No sync storage or developer backend is used.
- activeTab: Read the current tab’s URL when the user opens the popup, identify a supported service, and request its local temporary-mode status from the content script.
- Content-script site access: Run only on https://chatgpt.com/*, https://claude.ai/*, and https://gemini.google.com/*. Inspect the new-chat route and relevant interface controls, and activate the native privacy mode. No all-sites access is requested.

## Data-use answers for the dashboards

- Remote code: No. All executable code and fonts ship in the package.
- Data collection/transmission by the extension: No analytics, prompt logging, message collection, sale of data, or transmission to a developer server.
- Local processing: Supported-page URLs and interface-control labels are inspected locally to perform the stated function. Three Boolean preferences are stored locally.
- Do not describe this as “no access to browsing data”: the popup reads the active supported tab URL. Distinguish local access from data collected or transmitted when completing the live form.
- Any certifications in a dashboard must be checked by the actual publisher after reviewing this package and its privacy policy.

## Reviewer testing notes

1. Install the package in a current desktop Chromium browser.
2. Sign in to an eligible account at each AI service. No Sideveil credentials are required.
3. Visit the ChatGPT homepage. It should request temporary-chat=true and show the provider’s temporary-chat indicator.
4. Visit Claude /new. It should request incognito mode. Verify the provider’s incognito indicator.
5. Visit Gemini /app (or /u/0/app). Its temporary-chat control should activate automatically. Send one harmless message and then a follow-up; the visible temporary-conversation header must keep the composer usable.
6. Open the popup and toggle each service off/on. Existing active temporary conversations are not closed by turning automation off.
7. Open a saved conversation. Its route and content should remain unchanged.
8. Test a service without eligible temporary mode. Gemini should show an activation warning after the bounded waiting period; the preference can be turned off from the popup.

## Release notes

1.1.0 introduces the Sideveil name, original speech-mark icon, blue visual identity, self-hosted Onest typography, new popup layout, light/dark themes, expandable privacy guidance, and store icons. The tested routing, local preference keys, host scope, and permissions remain intact. Based on 1.0.3, including the Gemini follow-up-message fix.
