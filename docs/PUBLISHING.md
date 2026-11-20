# Publishing Sideveil

The included runtime is version **1.1.0**. GitHub publication makes the source available for manual installation; extension-store distribution is a separate process.

## Validate a release

1. Run `node --test tests/extension.test.cjs` and resolve failures.
2. Load the actual release files as an unpacked extension in Chrome and Edge.
3. On each supported service, check automatic activation, the provider’s own mode indicator, an initial harmless message, and a follow-up message.
4. Check saved conversations, per-service switches, popup status, and the separate-tab action. Verify that drafts remain intact.
5. Check Gemini’s unavailable-mode warning and confirm that switching its automation off releases the composer.
6. Check that the README, privacy policy, manifest version, and package contents describe the same release.

Automated fixture tests do not replace checking the installed release against live provider interfaces. Historical checks of earlier versions are not evidence that the current release has passed live checks.

## Package for an extension store

Create a ZIP with `manifest.json` at its root, containing only:

```text
manifest.json
core.js
content.js
popup.html
popup.css
popup.js
icons/icon-16.png
icons/icon-32.png
icons/icon-48.png
icons/icon-128.png
fonts/Onest.ttf
fonts/OFL.txt
```

Keep tests, repository metadata, development files, and promotional artwork out of the store runtime ZIP. Use a separate GitHub source download for the complete MIT-licensed project and its documentation.

## Prepare a store submission

- Complete publisher enrollment and agreements using the owner’s account.
- Confirm the publisher identity and a real public support contact.
- Publish the [privacy policy](../PRIVACY.md) at a stable public HTTPS address and update its contact section to match the actual support channel.
- Review [store listing copy](store-listing.md), permission explanations, and reviewer notes against the actual dashboard requirements.
- Use the artwork in `store-assets/`. Popup screenshots use example status and should not be presented as proof of live provider activation.
- Upload and review the package before submitting it from the publisher account.

No store listing, completed store review, public privacy-policy hosting, or production deployment is established by these files.
