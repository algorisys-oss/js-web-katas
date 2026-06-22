---
id: "phase-18/005-accessible-components"
title: "Accessible Components"
phase: 18
sequence: 5
difficulty: "advanced"
tags: ["accessibility", "aria", "components"]
prerequisites: ["phase-18/004-live-regions-and-announcements"]
estimated_minutes: 15
starter: ["html", "css", "js"]
network: false
---

## Concept

This is the capstone: combine semantics (kata 1), ARIA roles/state (kata 2), and keyboard
& focus (kata 3) into one fully accessible widget — an **accordion**. A real component is
only accessible when *all* layers agree:

1. **Structure** — each section has a **header** that is a real `<button>` (focusable,
   keyboard-operable for free) wrapping the visible title, plus a **panel** of content.
2. **State & relationships (ARIA)** — each button carries `aria-expanded` (true/false) and
   `aria-controls` pointing at its panel's `id`; each panel is `hidden` when collapsed,
   removing it from both the view and the accessibility tree.
3. **Keyboard support** — the buttons are a single composite widget, so the WAI-ARIA
   pattern uses **roving focus**: **Arrow Down/Up** move between headers, **Home/End** jump
   to first/last, and **Enter/Space** (native to `<button>`) toggle the panel.

Build it from the right elements and you write surprisingly little ARIA — the heavy
lifting (focusability, Enter/Space, the name from the button text) comes from `<button>`.
Your job is to keep `aria-expanded` honest, manage which header is focusable, and move
focus with the Arrow keys. That discipline — semantics first, ARIA for state, keyboard
wired deliberately — is how every robust component (tabs, menus, comboboxes) is built.

## Key Insight

> An accessible component is layered: native elements for behavior, ARIA for state and
> relationships, and keyboard handling for navigation. All three must stay in sync — change
> one and you must update the others.

## Experiment

```html
<h1>Accessible accordion</h1>
<div id="accordion">
  <h3>
    <button class="acc-trigger" aria-expanded="true" aria-controls="p1" id="t1">Shipping</button>
  </h3>
  <div id="p1" role="region" aria-labelledby="t1" class="acc-panel">
    <p>We ship worldwide within 3–5 business days.</p>
  </div>

  <h3>
    <button class="acc-trigger" aria-expanded="false" aria-controls="p2" id="t2">Returns</button>
  </h3>
  <div id="p2" role="region" aria-labelledby="t2" class="acc-panel" hidden>
    <p>Return any item within 30 days for a full refund.</p>
  </div>

  <h3>
    <button class="acc-trigger" aria-expanded="false" aria-controls="p3" id="t3">Support</button>
  </h3>
  <div id="p3" role="region" aria-labelledby="t3" class="acc-panel" hidden>
    <p>Reach us 24/7 at support@example.com.</p>
  </div>
</div>
```

```css
:focus-visible { outline: 3px solid #6366f1; outline-offset: 2px; }
.acc-trigger {
  display: block; width: 100%; text-align: left;
  padding: .6rem .8rem; font: inherit; cursor: pointer;
  border: 1px solid #c7c7d1; background: #f4f4f8; border-radius: 6px;
}
.acc-trigger[aria-expanded="true"] { background: #e0e0f5; }
.acc-trigger::before { content: "▸ "; }
.acc-trigger[aria-expanded="true"]::before { content: "▾ "; }
.acc-panel { padding: .4rem .9rem 1rem; }
h3 { margin: .25rem 0; }
```

```js
const triggers = [...document.querySelectorAll('.acc-trigger')];

// Roving focus: only the focused header is tabbable; arrows move between them.
triggers.forEach((t, i) => t.tabIndex = i === 0 ? 0 : -1);

function toggle(trigger) {
  const open = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', String(!open));     // keep state honest
  document.getElementById(trigger.getAttribute('aria-controls')).hidden = open;
  console.log(`${trigger.textContent}: ${open ? 'collapsed' : 'expanded'}`);
}

function focusTrigger(i) {
  const idx = (i + triggers.length) % triggers.length;
  triggers.forEach((t, j) => t.tabIndex = j === idx ? 0 : -1); // roving tabindex
  triggers[idx].focus();
}

triggers.forEach((trigger, i) => {
  trigger.addEventListener('click', () => toggle(trigger));    // Enter/Space free
  trigger.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); focusTrigger(i + 1); break;
      case 'ArrowUp':   e.preventDefault(); focusTrigger(i - 1); break;
      case 'Home':      e.preventDefault(); focusTrigger(0); break;
      case 'End':       e.preventDefault(); focusTrigger(triggers.length - 1); break;
    }
  });
});

console.log('Tab into the accordion, then use Arrow/Home/End to move, Enter/Space to toggle.');
```

## Expected Result

In the **preview** the first section starts open. **Tab once** to enter the accordion —
focus lands on a single header (roving tabindex makes the whole group one Tab stop).
**Arrow Down/Up** move focus between headers; **Home/End** jump to first/last; **Enter** or
**Space** toggles the focused panel, flipping its arrow and showing/hiding the content. The
**console** logs each expand/collapse.

A screen reader announces each header as e.g. *"Shipping, collapsed, button,"* navigable by
heading (the `<h3>`s) or by the `role="region"` landmarks, and reflects each toggle as
*expanded/collapsed* because we keep `aria-expanded` synchronized with the `hidden` panel.
This is all three layers working together: native buttons for behavior, ARIA for state and
relationships, roving focus for keyboard navigation.

## Challenge

1. Add an **"allow only one open at a time"** mode: when a panel opens, collapse the others
   (and update their `aria-expanded`). Keep every attribute in sync.
2. Convert the widget into a **tabs** pattern instead: `role="tablist"`/`role="tab"`/
   `role="tabpanel"`, `aria-selected`, and Left/Right Arrow navigation. Notice how the same
   layered discipline transfers directly.
3. Audit your component: Tab and arrow through it with the mouse untouched, run a tool like
   axe DevTools, and confirm no element is reachable but unlabeled, and no `aria-expanded`
   ever goes stale.

## Deep Dive

Every composite widget in the
[ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/) — accordion,
tabs, menu, combobox, tree, grid — follows the same recipe you just built: native elements
where possible, ARIA roles/state for what HTML can't express, and a documented keyboard
interaction model (usually roving tabindex with Arrow/Home/End). The hardest part in
production is **keeping state in sync**: every place that changes the view must also update
`aria-expanded`/`aria-selected`/`hidden`/`tabindex` together. Centralizing that into a
single render-from-state function (Phase 20's state patterns) is how you stop the
attributes from drifting out of agreement — the most common source of "it looked fine but
the screen reader was wrong."

## Common Mistakes

- Letting `aria-expanded` (or `aria-selected`) drift out of sync with the actual visible
  state, so AT reports the opposite of reality.
- Giving every header `tabindex="0"`, forcing keyboard users to Tab through all of them
  instead of one Tab stop plus Arrow navigation (roving tabindex).
- Hiding a collapsed panel with CSS `visibility`/`opacity` only — it stays in the
  accessibility tree and tab order. Use `hidden` (or `display:none`) to truly remove it.
- Reimplementing Enter/Space on a `<div role="button">` when a real `<button>` would
  provide it for free — extra code and one more thing to get wrong.
