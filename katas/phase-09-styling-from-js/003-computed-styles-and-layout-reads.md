---
id: "phase-09/003-computed-styles-and-layout-reads"
title: "Computed Styles & Layout Reads"
phase: 9
sequence: 3
difficulty: "intermediate"
tags: ["styling", "rendering", "performance"]
prerequisites: ["phase-09/002-classlist-and-css-variables"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

`element.style` shows only inline styles. To read the value the browser **actually computed**
from the whole cascade — stylesheets, inheritance, variables, defaults — use
`getComputedStyle(el)`:

- It returns a **read-only**, live `CSSStyleDeclaration`. You cannot assign to it.
- Values are **resolved**: `em`/`rem`/percentages become absolute `px`, color keywords
  become `rgb(...)`.
- Read via `getPropertyValue('font-size')` or camelCase (`getComputedStyle(el).fontSize`).

Separately, the DOM exposes **layout** numbers: `offsetWidth`/`offsetHeight`,
`offsetTop`/`offsetLeft`, `clientWidth`, `scrollHeight`, and `getBoundingClientRect()`.
These describe geometry, and here is the catch tied to Phase 0's rendering pipeline:

> Reading a layout property forces the browser to **flush any pending layout right now** so
> it can hand you an accurate number — a *forced synchronous layout* (a.k.a. reflow).

A single read is cheap. Reading geometry, writing a style, reading geometry again, writing
again — in a loop — repeatedly invalidates and re-flushes layout. That is **layout
thrashing** (covered fully in Phase 12).

## Key Insight

> `getComputedStyle` gives the resolved, read-only value from the full cascade. Reading
> `offsetWidth`/`getBoundingClientRect()` forces a synchronous layout — batch your reads
> before your writes.

## Experiment

```html
<div id="box">Measure me</div>
<button id="read">Read computed + geometry</button>
<button id="bad">Thrash layout (read/write loop)</button>
```

```css
#box {
  font-size: 1.25rem;
  padding: 1rem;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  width: 200px;
}
button { margin-top: 0.5rem; }
```

```js
const box = document.getElementById('box');

document.getElementById('read').addEventListener('click', () => {
  const cs = getComputedStyle(box);
  // 1.25rem resolved to px; the keyword background resolved to rgb():
  console.log('computed font-size:', cs.fontSize);
  console.log('computed background:', cs.backgroundColor);

  // Geometry reads — these flush layout to return accurate numbers:
  console.log('offsetWidth:', box.offsetWidth);
  const rect = box.getBoundingClientRect();
  console.log('rect width x height:', `${rect.width} x ${rect.height}`);
});

document.getElementById('bad').addEventListener('click', () => {
  // ANTI-PATTERN: write then read inside a loop forces layout every iteration.
  for (let i = 0; i < 5; i++) {
    box.style.width = box.offsetWidth + 10 + 'px'; // read offsetWidth, then write width
  }
  console.log('thrashed: each iteration forced a synchronous layout');
  // Better: read offsetWidth ONCE, compute all widths, then write once.
});
```

## Expected Result

In the **preview**, "Read computed + geometry" leaves the box unchanged but the **console**
shows resolved values like `font-size: 20px` and `background: rgb(99, 102, 241)`, plus the
box's pixel geometry. "Thrash layout" visibly widens the box and logs the warning — in
DevTools' Performance panel you would see five separate forced-layout events for that loop.

## Challenge

1. Change the box's font-size with `box.style.fontSize = '2rem'`, then immediately read
   `getComputedStyle(box).fontSize`. Confirm it reports the resolved `px`, not `2rem`.
2. Rewrite the "thrash" loop to read `offsetWidth` **once** before the loop and apply a single
   final width. Explain why that avoids repeated reflows.
3. Compare `box.offsetWidth` with `box.getBoundingClientRect().width` after adding a
   fractional border. Which one rounds?

## Deep Dive

`offsetWidth` is an integer (it rounds), while `getBoundingClientRect()` returns sub-pixel
floats and accounts for CSS `transform`, making it the more precise choice for positioning
overlays. Both belong to a family of properties — including `clientHeight`, `scrollTop`,
`getComputedStyle()`, and `focus()` — that the browser must flush pending style/layout to
answer. The performance rule that follows from the pipeline: **separate your reads from your
writes.** Read all the geometry you need first, then perform all your style writes, so the
browser does at most one layout pass per frame.

## Common Mistakes

- Trying to assign to `getComputedStyle(el).color` — it is read-only; write to `el.style`
  instead.
- Comparing a computed color to a keyword (`=== 'red'`); computed colors come back as
  `rgb(...)`/`rgba(...)`.
- Interleaving layout reads and style writes in a loop, forcing a reflow every iteration.
- Assuming `getComputedStyle` is free — it can trigger a synchronous layout when styles are
  dirty, just like reading `offsetTop`.
