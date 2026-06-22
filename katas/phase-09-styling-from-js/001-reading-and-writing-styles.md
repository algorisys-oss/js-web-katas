---
id: "phase-09/001-reading-and-writing-styles"
title: "Reading & Writing Styles"
phase: 9
sequence: 1
difficulty: "beginner"
tags: ["styling", "dom"]
prerequisites: ["phase-08/005-debouncing-input"]
estimated_minutes: 12
starter: ["html", "css", "js"]
network: false
---

## Concept

Every element has a `style` property: a live `CSSStyleDeclaration` representing only its
**inline** styles (the `style="..."` attribute). Writing to it sets inline styles, which
have high specificity and win over most stylesheet rules.

- `el.style.backgroundColor = 'tomato'` — CSS property names become **camelCase**
  (`background-color` → `backgroundColor`, `z-index` → `zIndex`).
- `el.style.setProperty('background-color', 'tomato')` — the dashed-name form; required for
  custom properties (`--x`) and when you want to pass a priority like `'important'`.
- `el.style.cssText = 'color: white; padding: 1rem'` — replaces **all** inline styles in
  one assignment. Convenient for setting many at once, but it clobbers anything already
  there.

A crucial limit: `el.style.color` only reads back what you set **inline**. A color coming
from a stylesheet reads as an empty string here. To read the *effective* value you need
`getComputedStyle` (kata 003).

## Key Insight

> `element.style` is the inline-style declaration — write-anything, read-only-what-you-set.
> Single properties are camelCase; `cssText` replaces the whole block at once.

## Experiment

```html
<div id="box">Style me</div>
<button id="single">Set one property</button>
<button id="bulk">Set via cssText</button>
```

```css
#box {
  padding: 1rem;
  background: #6366f1; /* from the stylesheet, not inline */
  color: white;
  border-radius: 8px;
  width: max-content;
}
button { margin-top: 0.5rem; }
```

```js
const box = document.getElementById('box');

// Reading a stylesheet value through .style fails — it only sees inline styles:
console.log('inline background before:', JSON.stringify(box.style.background)); // ""

document.getElementById('single').addEventListener('click', () => {
  box.style.backgroundColor = 'tomato'; // camelCase property name
  box.style.transform = 'scale(1.1)';
  console.log('inline background now:', box.style.background);
});

document.getElementById('bulk').addEventListener('click', () => {
  // cssText replaces ALL inline styles in one shot — note transform is gone:
  box.style.cssText = 'background: seagreen; color: white; padding: 1.5rem';
  console.log('cssText is now:', box.style.cssText);
});
```

## Expected Result

The **preview** shows a purple box. "Set one property" turns it tomato-red and enlarges it.
"Set via cssText" turns it green, re-pads it, and **resets** the scale (because `cssText`
wiped the inline `transform`). The **console** first logs that the inline background is `""`
even though the box looks purple, then logs the values you set inline.

## Challenge

1. After clicking "Set one property," log `box.style.transform`, then click "Set via
   cssText" and log it again. Confirm `cssText` erased it.
2. Use `box.style.setProperty('color', 'gold', 'important')` and read it back with
   `box.style.getPropertyPriority('color')`.
3. Set `box.style.width = '300'` (no unit) and observe it is ignored. Add `'px'` and watch
   it apply. Why does the unit matter?

## Deep Dive

`element.style` is a *live* object, so reads and writes go straight to the inline-style
attribute. Building a big style string and assigning it once via `cssText` triggers a single
style recalculation, whereas setting ten individual properties touches the declaration ten
times — though the browser still only restyles once per frame. Prefer toggling a **class**
(kata 002) over scattering inline styles: classes keep styling in the stylesheet where it
belongs and are far easier to override and theme.

## Common Mistakes

- Writing `el.style.background-color = ...` — that is a subtraction expression, not a
  property. Use `backgroundColor` or `setProperty('background-color', ...)`.
- Forgetting units: `el.style.width = 100` does nothing; it must be `'100px'`.
- Expecting `el.style.color` to return a value set by a stylesheet — it only reflects inline
  styles. Use `getComputedStyle` for the resolved value.
- Using `cssText` to tweak one property and accidentally wiping every other inline style.
