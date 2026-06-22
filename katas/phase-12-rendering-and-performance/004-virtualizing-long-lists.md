---
id: "phase-12/004-virtualizing-long-lists"
title: "Virtualizing Long Lists"
phase: 12
sequence: 4
difficulty: "advanced"
tags: ["performance", "rendering"]
prerequisites: ["phase-12/003-debounce-and-throttle"]
estimated_minutes: 15
starter: ["html", "css", "js"]
network: false
---

## Concept

Rendering 50,000 `<li>` elements creates 50,000 layout boxes, 50,000 paint records, and a
huge style recalculation — even though the user can see only ~15 at a time. **List
virtualization** (windowing) renders *only the rows currently in view* (plus a small
buffer), positioned to look like the full list.

The technique has three parts:

1. A tall **spacer** whose height equals `totalRows × rowHeight`, so the scrollbar reflects
   the full dataset.
2. On scroll, compute the visible window: `startIndex = floor(scrollTop / rowHeight)` and how
   many rows fit in the viewport.
3. Render *only* those rows, translated down by `startIndex × rowHeight` so they land in the
   right place.

Because we only ever create a couple dozen DOM nodes, scrolling stays smooth no matter how
large the dataset. We will measure the per-update render time with `performance.now()`.

## Key Insight

> Don't render rows the user can't see. Keep a full-height spacer for the scrollbar and
> render only the visible window, repositioned on scroll.

## Experiment

```html
<div id="viewport">
  <div id="spacer"></div>
  <div id="rows"></div>
</div>
<pre id="stat"></pre>
```

```css
#viewport { position: relative; height: 300px; overflow: auto; border: 1px solid #ccc; }
#rows { position: absolute; top: 0; left: 0; right: 0; }
.row { height: 30px; line-height: 30px; padding: 0 10px; border-bottom: 1px solid #eee;
       box-sizing: border-box; font-family: monospace; }
.row:nth-child(even) { background: #f5f5f7; }
#stat { background: #111; color: #93c5fd; padding: 6px; }
```

```js
const ROW_H = 30;
const TOTAL = 50000;
const BUFFER = 4; // extra rows above/below for smooth scrolling

const data = Array.from({ length: TOTAL }, (_, i) => `Item #${i} — value ${(i * 7) % 1000}`);

const viewport = document.getElementById('viewport');
const spacer = document.getElementById('spacer');
const rowsEl = document.getElementById('rows');
const stat = document.getElementById('stat');

spacer.style.height = TOTAL * ROW_H + 'px'; // full scroll range

function render() {
  const t0 = performance.now();
  const scrollTop = viewport.scrollTop;
  const visible = Math.ceil(viewport.clientHeight / ROW_H);
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - BUFFER);
  const end = Math.min(TOTAL, start + visible + BUFFER * 2);

  const frag = document.createDocumentFragment();
  for (let i = start; i < end; i++) {
    const div = document.createElement('div');
    div.className = 'row';
    div.textContent = data[i];
    frag.appendChild(div);
  }
  rowsEl.replaceChildren(frag);
  rowsEl.style.transform = `translateY(${start * ROW_H}px)`; // composite-only offset

  const ms = (performance.now() - t0).toFixed(2);
  stat.textContent =
    `rendered rows ${start}–${end - 1} of ${TOTAL} ` +
    `(${end - start} DOM nodes) in ${ms} ms`;
}

let ticking = false;
viewport.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { render(); ticking = false; }); // throttle to one render/frame
});

render();
```

## Expected Result

The **preview** shows a scrollable list that *appears* to contain 50,000 rows — the
scrollbar thumb is tiny — yet the **console/stat** line reports only ~15–20 DOM nodes
rendered per frame, each update taking a fraction of a millisecond. Scroll fast: the window
of rows updates seamlessly while the node count stays flat.

## Challenge

1. Add a buffer-size slider (e.g. 0 vs 10). With 0 you may see brief blank gaps on fast
   scroll; explain why a buffer trades a few extra nodes for smoothness.
2. Support **variable row heights** by precomputing a cumulative-offset array and binary-
   searching it for `startIndex` instead of dividing by a fixed `ROW_H`.
3. Replace the absolute-positioned `translateY` with `padding-top` on `#rows`. Compare jank
   while scrolling and explain why `transform` is the compositor-friendly choice.

## Deep Dive

This is the core idea behind react-window, TanStack Virtual, and `<virtual-scroller>`.
The hard parts in production are variable/unknown row heights, sticky headers, anchored
scroll restoration, and keyboard/focus accessibility (a virtualized list must still be
navigable and announce its true size via `aria-setsize`/`aria-posinset`). Native
`content-visibility: auto` and the CSS `contain` property let the browser skip rendering
work for off-screen subtrees with far less JavaScript — worth knowing before you hand-roll.

## Common Mistakes

- Forgetting the full-height spacer, so the scrollbar shrinks to the visible window and the
  list feels broken.
- Running `render()` directly on every `scroll` event instead of coalescing to one call per
  frame with `requestAnimationFrame`.
- Offsetting rows with `top`/`margin-top` (reflow) instead of `transform` (composite).
- Virtualizing a list of only a few dozen rows — the machinery costs more than it saves.
