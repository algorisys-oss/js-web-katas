---
id: "phase-09/002-classlist-and-css-variables"
title: "classList & CSS Variables"
phase: 9
sequence: 2
difficulty: "beginner"
tags: ["styling", "dom"]
prerequisites: ["phase-09/001-reading-and-writing-styles"]
estimated_minutes: 12
starter: ["html", "css", "js"]
network: false
---

## Concept

Instead of scattering inline styles, keep the styling in CSS and let JavaScript flip
**state**. Two tools do this cleanly:

`classList` is a live token list with ergonomic methods:

- `add('on')`, `remove('on')` — idempotent; no error if the class is already present/absent.
- `toggle('on')` — adds if missing, removes if present; returns the resulting boolean.
- `toggle('on', force)` — forces it on (`true`) or off (`false`).
- `contains('on')`, `replace('old', 'new')`.

**CSS custom properties** (variables) let you push *values* into the cascade without
touching the rules. You read/write them with the property API, not dot access:

- `el.style.setProperty('--accent', '#e11d48')` — set a variable on an element.
- `getComputedStyle(el).getPropertyValue('--accent')` — read its resolved value.

Because a variable set on an element cascades to its descendants, one assignment can
re-theme a whole subtree, and CSS `transition` still animates the properties that consume it.

## Key Insight

> Toggle a **class** to change state and a **CSS variable** to change a value. Both keep the
> actual styling in CSS, where the cascade, theming, and transitions still apply.

## Experiment

```html
<div id="card">Themed card</div>
<button id="toggle">Toggle .active</button>
<button id="accent">Randomize --accent</button>
```

```css
:root { --accent: #6366f1; }
#card {
  padding: 1.25rem;
  border: 3px solid var(--accent);
  color: var(--accent);
  border-radius: 8px;
  width: max-content;
  transition: all 0.25s ease;
}
#card.active {
  background: var(--accent);
  color: white;
}
button { margin-top: 0.5rem; }
```

```js
const card = document.getElementById('card');

document.getElementById('toggle').addEventListener('click', () => {
  const isActive = card.classList.toggle('active'); // returns the new state
  console.log('active class is now', isActive);
});

document.getElementById('accent').addEventListener('click', () => {
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue} 80% 55%)`;
  // Set the custom property — every rule using var(--accent) updates at once:
  card.style.setProperty('--accent', color);
  const resolved = getComputedStyle(card).getPropertyValue('--accent');
  console.log('--accent is now', resolved.trim());
});
```

## Expected Result

In the **preview**, "Toggle .active" fills the card with the accent color and switches the
text to white, smoothly (the `transition` animates it); clicking again reverts. "Randomize
--accent" recolors the border, text, and — when active — the background in one move, because
every rule reads `var(--accent)`. The **console** logs the boolean state and the resolved
color string after each click.

## Challenge

1. Replace the toggle handler with `classList.toggle('active', someCondition)` and force the
   state from a checkbox instead of flipping it.
2. Set `--accent` on `document.documentElement` instead of the card. What changes about the
   scope of the theme?
3. Read the variable with `card.style.getPropertyValue('--accent')` before you ever set it
   inline. Why is it empty, while `getComputedStyle(...).getPropertyValue('--accent')` is not?

## Deep Dive

Custom properties participate in the cascade and inheritance just like normal properties, so
setting `--accent` on an ancestor flows to every descendant unless overridden. They are
resolved at *computed-value* time, which is why `getComputedStyle().getPropertyValue('--x')`
returns the inherited value while `element.style.getPropertyValue('--x')` returns only what
was set inline on that exact element. Toggling classes and variables is also more performant
than rewriting many inline properties: the browser already has the rules parsed and only has
to re-match and recompute.

## Common Mistakes

- Reaching for `el.style['--accent']` or `el.style.setProperty('accent', ...)` — custom
  properties keep the leading `--` and must go through `setProperty`/`getPropertyValue`.
- Using `className = 'active'` (which **replaces** every class) when you meant
  `classList.add('active')`.
- Forgetting that `getPropertyValue` often returns a value with leading whitespace; call
  `.trim()` before comparing.
- Animating with inline styles when a class toggle plus a CSS `transition` would be simpler
  and keep the timing in the stylesheet.
