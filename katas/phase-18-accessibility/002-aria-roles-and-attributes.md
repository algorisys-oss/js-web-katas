---
id: "phase-18/002-aria-roles-and-attributes"
title: "ARIA Roles & Attributes"
phase: 18
sequence: 2
difficulty: "intermediate"
tags: ["accessibility", "aria"]
prerequisites: ["phase-18/001-semantic-html-and-the-a11y-tree"]
estimated_minutes: 13
starter: ["html", "js"]
network: false
---

## Concept

**ARIA** (Accessible Rich Internet Applications) is a set of attributes that override or
supplement what the accessibility tree reports. It comes in three families:

- **Roles** (`role="tab"`, `role="dialog"`) — *what the element is*.
- **States** (`aria-expanded`, `aria-checked`, `aria-pressed`, `aria-hidden`) — *current
  condition*, expected to change.
- **Properties** (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`) —
  *relationships and naming*, usually static.

Crucially, **ARIA changes only the accessibility tree — never behavior.** Adding
`role="button"` does **not** make an element focusable or keyboard-operable; you must add
`tabindex` and key handlers yourself. ARIA is a promise to assistive tech that you will
implement the matching behavior. A broken promise (wrong role, stale state) is worse than
silence — hence the **first rule of ARIA: don't use ARIA if a native element with the
needed semantics already exists.** A `<button>` beats `<div role="button" tabindex="0">`
every time.

Where ARIA earns its place is naming and state for things HTML can't express: a label for
an icon-only button (`aria-label`), an expanded/collapsed relationship between a trigger
and a panel (`aria-expanded` + `aria-controls`), or hiding decorative nodes from the tree
(`aria-hidden="true"`).

## Key Insight

> ARIA decorates the accessibility tree; it never adds behavior. First rule of ARIA: if a
> native element does the job, use it instead. Wrong ARIA is worse than no ARIA.

## Experiment

```html
<h1>A disclosure toggle</h1>

<!-- aria-label gives the icon-only button an accessible name -->
<button id="toggle" aria-expanded="false" aria-controls="panel" aria-label="Show details">
  ▸
</button>

<div id="panel" hidden>
  <p>These are the extra details, revealed on demand.</p>
</div>
```

```js
const toggle = document.getElementById('toggle');
const panel = document.getElementById('panel');

toggle.addEventListener('click', () => {
  // Read the *current* state from the attribute (the single source of truth).
  const open = toggle.getAttribute('aria-expanded') === 'true';

  toggle.setAttribute('aria-expanded', String(!open)); // state, announced on change
  toggle.setAttribute('aria-label', open ? 'Show details' : 'Hide details');
  toggle.textContent = open ? '▸' : '▾';
  panel.hidden = open; // `hidden` removes it from the a11y tree AND from view

  console.log('aria-expanded is now', toggle.getAttribute('aria-expanded'));
});

// Native <button> already gives us Enter/Space + focus — no key handler needed.
console.log('Tab to the button and press Space; aria-expanded flips.');
```

## Expected Result

In the **preview**, clicking (or focusing and pressing **Space**/**Enter**, free from
`<button>`) flips the arrow and shows/hides the panel. The **console** logs the new
`aria-expanded` value each time.

To a screen reader the button announces as *"Show details, collapsed, button."* After
activation it becomes *"Hide details, expanded, button,"* and the newly revealed panel
enters the tree. Because we used a native `<button>`, we wrote **zero** keyboard code — we
only managed the two ARIA attributes that express *state* and *name*. We can't hear the
announcement in this playground, but the attribute values are exactly what AT reads.

## Challenge

1. Replace `aria-label` with a visible label: put `<span id="lbl">Show details</span>`
   next to an icon and point the button at it with `aria-labelledby="lbl"`. When is a
   *visible* label preferable to `aria-label`? (Hint: voice-control users say what they
   see.)
2. Add a decorative SVG icon inside the button and give it `aria-hidden="true"`. Verify
   the accessible name still comes only from your label, not the icon.
3. Deliberately forget to update `aria-expanded` on toggle. Describe how the now-stale
   state misleads a screen-reader user — a concrete example of "wrong ARIA is worse."

## Deep Dive

`aria-label` and `aria-labelledby` *override* the element's own text in the name
computation, so an icon-only control should use one of them, but a control that already
has visible text usually should not (a mismatch between the spoken name and the visible
name confuses voice-control users who say the visible word). `aria-hidden="true"` prunes a
node and all its descendants from the accessibility tree while leaving it visible — the
right tool for purely decorative icons, and the *wrong* tool for anything interactive
(never put `aria-hidden` on a focusable element). The full vocabulary lives in the
[WAI-ARIA spec](https://www.w3.org/TR/wai-aria-1.2/) and the patterns in the
[ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).

## Common Mistakes

- Adding `role="button"`/`role="link"` to a `<div>` and expecting keyboard support — ARIA
  adds none; you must add `tabindex` and key handlers.
- Using `aria-label` on an element that already has visible text, creating a name mismatch
  for voice-control users.
- Putting `aria-hidden="true"` on a focusable element, so it disappears from the tree but
  can still be tabbed to — a confusing "phantom" focus stop.
- Reaching for ARIA first. Try the native element (`<button>`, `<details>`, `<select>`,
  `<dialog>`) before reinventing it with roles and JavaScript.
