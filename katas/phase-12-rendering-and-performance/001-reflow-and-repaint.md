---
id: "phase-12/001-reflow-and-repaint"
title: "Reflow & Repaint"
phase: 12
sequence: 1
difficulty: "intermediate"
tags: ["performance", "rendering"]
prerequisites: ["phase-11/005-streaming-responses"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

Phase 0 introduced the pipeline: DOM → CSSOM → Style → **Layout (reflow)** → **Paint
(repaint)** → Composite. This phase makes the costs *measurable*.

- **Reflow (layout)** recomputes the geometry of boxes — position and size. It is triggered
  by changing widths/heights, adding or removing nodes, changing text, or by *reading* a
  layout property while a write is pending.
- **Repaint (paint)** fills pixels — colors, borders, shadows — without recomputing
  geometry. A pure `color` or `background` change repaints but does not reflow.

The expensive truth: when you insert 1,000 nodes **one at a time** into the live document,
each insertion can dirty layout, and a later read forces it to flush. Insert them through a
`DocumentFragment` (Phase 6) and the browser reflows **once**. Same DOM result, a fraction
of the layout work. We will time both with `performance.now()`.

## Key Insight

> Reflow recomputes geometry; repaint only recolors pixels. Batch your DOM writes so the
> browser reflows once, not once per node.

## Experiment

```html
<button id="bad">Insert 2000 nodes one-by-one</button>
<button id="good">Insert 2000 nodes via fragment</button>
<ul id="list"></ul>
```

```css
#list { max-height: 120px; overflow: auto; font-family: monospace; }
#list li { padding: 2px 6px; border-bottom: 1px solid #eee; }
button { margin: 0 4px 8px 0; }
```

```js
const list = document.getElementById('list');
const N = 2000;

function buildRow(i) {
  const li = document.createElement('li');
  li.textContent = `row ${i}`;
  return li;
}

// Unbatched: append directly to the LIVE list each iteration, and force a
// layout read (offsetHeight) so the browser must keep geometry up to date.
document.getElementById('bad').addEventListener('click', () => {
  list.replaceChildren();
  const t0 = performance.now();
  for (let i = 0; i < N; i++) {
    list.appendChild(buildRow(i));
    list.offsetHeight; // forces a synchronous reflow every iteration
  }
  console.log(`unbatched: ${(performance.now() - t0).toFixed(1)} ms`);
});

// Batched: build off-document in a fragment, attach once → one reflow.
document.getElementById('good').addEventListener('click', () => {
  list.replaceChildren();
  const t0 = performance.now();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++) frag.appendChild(buildRow(i));
  list.appendChild(frag); // single insertion → single reflow
  console.log(`batched:   ${(performance.now() - t0).toFixed(1)} ms`);
});
```

## Expected Result

Both buttons fill the list with 2000 rows. In the **console**, the batched run is
dramatically faster — often 10–50× — because it triggers one reflow instead of 2000
forced synchronous layouts. The visual preview is identical; only the timing differs.

## Challenge

1. Remove the `list.offsetHeight;` line in the unbatched handler and re-time it. The gap
   shrinks — explain why reading layout was the real cost, not the appends.
2. Add a third button that changes every row's `color` (a repaint) and time it; compare to
   a button that changes every row's `width` (a reflow).
3. Replace `appendChild` in a loop with `list.append(...rows)` spreading an array. Is the
   single-call form closer to the fragment timing or the one-by-one timing?

## Deep Dive

Browsers maintain a "dirty" layout flag. A write marks layout dirty but defers the actual
recompute until the next frame — *unless* you read a property that depends on geometry
(`offsetTop`, `clientWidth`, `getBoundingClientRect()`, `getComputedStyle()`), which forces
a synchronous flush so the value is correct *now*. That forced flush, repeated in a loop, is
what turns a cheap operation into a quadratic-feeling one. Building in a `DocumentFragment`
keeps the work off the live tree entirely until a single attach.

## Common Mistakes

- Appending nodes one at a time to the live DOM inside a hot loop instead of batching.
- Reading a layout property right after a write, forcing an immediate reflow each pass.
- Believing a color change reflows — it only repaints; geometry is untouched.
- Timing with `Date.now()`; use `performance.now()` for sub-millisecond, monotonic numbers.
