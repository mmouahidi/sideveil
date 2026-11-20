---
name: Sideveil
description: Temporary chats. By default.
colors:
  primary: "#174df0"
  primary-hover: "#103bc5"
  ink: "#132755"
  muted: "#50638a"
  ground: "#fff"
  tint: "#eef3ff"
  line: "#d8e2fa"
  track: "#7786a7"
  mint: "#a9f0d3"
  dark-ground: "#111c36"
  dark-ink: "#e7edff"
  dark-muted: "#b4c3e6"
  dark-tint: "#1b2c50"
  dark-line: "#344772"
  dark-track: "#647494"
typography:
  title:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 650
    letterSpacing: "-0.035em"
  tagline:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  service:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "15px"
  label:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 650
  supporting:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "12px"
    lineHeight: 1.55
  action:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 550
rounded:
  button: "7px"
  status: "12px"
  switch: "20px"
spacing:
  caption: "2px"
  small: "4px"
  compact: "8px"
  footer: "10px"
  row: "11px"
  note: "12px"
  status: "14px"
  section: "16px"
  header: "20px"
  gutter: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ground}"
    rounded: "{rounded.button}"
    padding: "10px 12px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  service-control:
    padding: "11px 0"
  switch:
    width: "38px"
    height: "24px"
    rounded: "{rounded.switch}"
    backgroundColor: "{colors.track}"
  switch-checked:
    backgroundColor: "{colors.primary}"
  status:
    backgroundColor: "{colors.tint}"
    rounded: "{rounded.status}"
    padding: "14px"
---

# Design System: Sideveil

## Overview

**Creative North Star: "Cyanotype impression"**

Sideveil combines a strong blue identity with familiar browser settings. The open speech contour ending in detached dots is the signature; the selected direction is code-led and uses self-hosted Onest. Flat surfaces, clear rows, and concise state language keep a small popup easy to scan.

**Key Characteristics:**

- Blue brand header and disappearing speech mark.
- Compact settings rows with semantic checkbox switches.
- Automatic light/dark appearance and restrained state motion.

## Colors

### Primary

Cyanotype blue anchors the header, checked switches, action, and light-mode focus. The action deepens on hover. Mint appears in the mark, selection, and dark-mode focus; it is an accent rather than an enabled-state substitute.

### Neutral

Ink and muted text sit on white ground with pale-blue status grouping and blue-tinted dividers. Dark mode replaces ground, ink, muted text, status tint, dividers, and inactive tracks while retaining the blue header and action. Token values above come directly from popup.css.

## Typography

Onest is self-hosted through fonts/Onest.ttf with a system sans-serif fallback and variable weights (100–900). The wordmark is the largest text; service names sit above smaller mode descriptions. Section labels use semibold supporting-size text. Status wraps at any length. Privacy and note copy use a slightly more open supporting line height.

## Layout

The popup is 360px wide with max-width 100%. The header uses 20px vertical and 24px horizontal padding; main uses 20px 24px 16px. Identity aligns the 42px mark and title with a 10px gap. Three full-width service rows align labels left and switches right. Current-page status follows after 16px, then the new-chats note and a separated privacy footer. There are no viewport breakpoints; system preferences control color and motion.

## Elevation & Depth

There are no shadows. Color fields, whitespace, and one-pixel dividers establish grouping. Switch background and thumb transform transition over 160ms ease-out; reduced-motion preference removes these transitions.

## Shapes

The brand mark is an inline open speech contour with detached dots. The status container has rounded corners; the action uses a smaller radius. Switches use a pill track and a white circular thumb (16px), translating 14px when checked. Dividers keep service rows visually connected.

## Components

### Brand header

Blue field with a white wordmark and tagline, plus a mint final dot in the mark. The header remains blue in both schemes.

### Service controls

Custom-styled native checkbox inputs retain switch roles, explicit accessible names, and clickable row labels. The control is 38 × 24px. A one-pixel divider separates each row. Initial loading disables the fieldset; saving disables the affected switch with half opacity and a wait cursor.

### Current-page status and action

The pale-blue container carries a compact heading, a seven-pixel outlined dot, and live status text. Verified active state fills the dot. The full-width action appears only for a supported current page and opens a separate chat. Errors use clear text in the same live region; there is no separate error color token. Disabled action uses opacity 0.6 and a wait cursor.

### Privacy disclosure and focus

The footer keeps the provider-retention caveat visible and offers native details/summary for more explanation. Keyboard focus on switches, action, and summary uses a two-pixel outline offset by four pixels; dark mode uses mint. Preserve native disclosure semantics.

## Do's and Don'ts

### Do:

- **Do** retain self-hosted Onest, the blue header, and the disappearing speech mark.
- **Do** preserve semantic inputs, accessible names, visible focus, and system preferences.
- **Do** distinguish requested mode, verified activity, and actionable error copy.

### Don't:

- **Don't** present temporary mode as browser Incognito, guaranteed deletion, or provider endorsement.
- **Don't** replace factual state text with an invented successful state.
- **Don't** treat store example status as evidence of a live installed-release check.
