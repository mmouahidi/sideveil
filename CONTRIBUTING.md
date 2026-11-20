# Contributing to Sideveil

Thanks for helping make temporary chats easier to use. Focused fixes, clear bug reports, accessibility improvements, and support for more interface languages are welcome.

## Report a bug

Open a GitHub issue in this repository and include:

- Your browser and Sideveil versions.
- The affected provider and interface language.
- Whether this is a new chat or an existing conversation.
- Steps to reproduce, expected behavior, and actual behavior.
- The popup status and any relevant extension errors.

Use harmless example messages. Remove personal chat content, account identifiers, credentials, and sensitive URL query parameters from screenshots and logs. Do not post security-sensitive reproduction details publicly; ask the maintainer for a private reporting channel first.

## Work on a change

1. Fork and clone the repository, then create a branch for your change.
2. Load the repository root as an unpacked extension in Chrome or Edge. See [installation](README.md#install).
3. Edit the source files directly. There is no build step or dependency installation.
4. Run `node --test tests/extension.test.cjs` from the repository root.
5. Reload the extension and affected provider tabs to check your change manually.
6. Open a focused pull request describing the user-visible change and your validation.

Discuss substantial behavior changes in an issue before implementation. Add or update meaningful regression tests when changing routing, activation, or preferences.

## Review checklist

- Preserve saved chats, projects, Gems, shared chats, settings, and sign-in routes.
- Preserve unrelated query parameters and URL fragments.
- Distinguish requested temporary mode from a recognized active indicator.
- Keep Gemini retries bounded and follow-up messages usable.
- Verify switches and the separate-tab action without losing the current draft.
- Preserve accessible control names, keyboard focus, light/dark themes, and reduced-motion support when changing the popup.
- Keep permissions narrow and settings local. Explain any proposed permission change.
- Include no private chat data, credentials, remote executable code, or external font requests.
- Retain the Onest font license when distributing fonts or wordmarks containing font data.

For provider-interface changes, name the browser, service, interface language, and scenarios you checked. Fixture tests and live browser checks establish different things; describe both accurately.

Contributions are made under the repository’s [MIT License](LICENSE), except third-party assets that retain their own licenses.
