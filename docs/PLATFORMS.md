# Platform coverage

Sideveil uses native temporary modes where it can identify the provider’s controls. The **More platforms** launcher also opens sites in a separate browser Incognito or InPrivate window. Local browser history and provider-account history are separate.

| Platform | Sideveil support | Provider evidence |
| --- | --- | --- |
| Grok | Opt-in **Private Chat** automation preview and guided shortcut on `grok.com`. A URL fragment alone never confirms mode. | [Grok consumer FAQ](https://x.ai/legal/faq) |
| Microsoft 365 Copilot Chat | Opt-in **Temporary Chat** automation preview and guided shortcut. Organization policy may retain chats. | [Microsoft Support](https://support.microsoft.com/en-us/microsoft-365-copilot/personalize-what-microsoft-365-copilot-remembers) |
| Perplexity | Guided shortcut for **Incognito**, which disables search history and memory. | [Perplexity changelog](https://www.perplexity.ai/changelog/what-we-shipped---december-5th) |
| Mistral Vibe | Guided shortcut for **Temporary Chat**. | [Mistral Vibe docs](https://docs.mistral.ai/vibe) |
| Google Search AI Mode | Guided shortcut for **Temporary threads**, subject to the rollout and account availability. | [Google Search Help](https://support.google.com/websearch/answer/18752729?hl=en) |
| Kimi | Private browser window. The help center documents chat deletion and training choices. | [Kimi FAQ](https://www.kimi.com/en/help/others) |
| Manus | Private browser window. Task visibility depends on account and team roles. | [Manus Help](https://help.manus.im/en/articles/11711929-who-can-see-my-tasks) |
| DeepSeek | Private browser window. DeepSeek documents managing or deleting saved chats. | [DeepSeek privacy policy](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html) |
| MiniMax Agent | Private browser window. | [MiniMax Agent](https://www.minimax.io/blog/minimax-m2-en-1748600000) |
| Google Search | Private browser window. Google offers separate account activity controls. | [Google Search Help](https://support.google.com/websearch/answer/54068?hl=en) |
| YouTube | Private browser window. YouTube’s own Incognito feature is documented for its mobile apps. | [YouTube Help](https://support.google.com/youtube/answer/9040743?hl=en) |

The previews start off by default. They target recognized desktop controls for new chats. A signed-out desktop session exposed Copilot’s toggle, but activation did not confirm there. Grok's provider documentation describes the Private Chat control, and the preview also requires the on-page history notice. Verify both previews on signed-in test accounts before enabling them by default. Perplexity, Mistral, and Google Search AI Mode need verified activation and active-state controls before adding automation. We found no documented per-chat temporary mode for the desktop Kimi, Manus, DeepSeek, or MiniMax Agent surfaces checked here.
