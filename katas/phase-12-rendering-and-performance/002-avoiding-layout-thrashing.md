---
id: "phase-12/002-avoiding-layout-thrashing"
title: "Avoiding Layout Thrashing"
phase: 12
sequence: 2
difficulty: "intermediate"
tags: ["performance", "rendering"]
prerequisites: ["phase-12/001-reflow-and-repaint"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

**Layout thrashing** is the pathological case of the previous kata: a loop that *reads* a
layout property, then *writes* a style, then reads again — over and over. Each read forces
the browser to flush the layout that the previous write dirtied, so you pay for a full
reflow on *every iteration*.

The fix is **read/write separation** (sometimes called batching by phase): read **all** the
geometry you need first into plain variables, *then* perform **all** the writes. Now the
browser flushes layout at most once for the reads, and defers a single reflow for the
writes — instead of ping-ponging N times.

We will animate N elements so each one's new width depends on a sibling's measured width.
The naive version interleaves read→write; the fixed version reads all widths, then writes
all widths. The console shows the difference in milliseconds.

## Key Insight

> Interleaving layout reads and writes forces a reflow per iteration. Read everything first,
> then write everything — the browser reflows once.

## Experiment

```html
<button id="thrash">Read/write interleaved (thrash)</button>
<button id="batch">Read-all then write-all</button>
<div id="bars"></div>
```

```css
#bars { margin-top: 8px; }
.bar { height: 14px; margin: 2px 0; background: #6366f1; border-radius: 3px; }
button { margin: 0 4px 8px 0; }
```

```js
const bars = document.getElementById('bars');
const N = 400;

function reset() {
  bars.replaceChildren();
  for (let i = 0; i < N; i++) {
    const d = document.createElement('div');
    d.className = 'bar';
    d.style.width = (50 + (i % 50)) + 'px';
    bars.appendChild(d);
  }
  return [...bars.children];
}

// THRASH: each iteration reads offsetWidth (forces reflow) then writes width.
document.getElementById('thrash').addEventListener('click', () => {
  const els = reset();
  const t0 = performance.now();
  for (const el of els) {
    const w = el.offsetWidth;      // READ → flush pending layout
    el.style.width = (w + 30) + 'px'; // WRITE → dirty layout again
  }
  console.log(`thrash: ${(performance.now() - t0).toFixed(1)} ms`);
});

// BATCH: phase 1 reads all widths, phase 2 writes all widths.
document.getElementById('batch').addEventListener('click', () => {
  const els = reset();
  const t0 = performance.now();
  const widths = els.map((el) => el.offsetWidth); // all READS together
  els.forEach((el, i) => { el.style.width = (widths[i] + 30) + 'px'; }); // all WRITES
  console.log(`batch:  ${(performance.now() - t0).toFixed(1)} ms`);
});
```

## Expected Result

Both buttons widen every bar by 30px, so the **preview** looks the same. In the **console**,
the read-all/write-all version is consistently faster because it collapses N forced reflows
into a single layout flush. The larger `N` is, the wider the gap.

## Challenge

1. Increase `N` to 4000 and re-run. Does the gap grow roughly linearly with the element
   count? Explain why thrashing scales worse than batching.
2. Wrap the write phase in `requestAnimationFrame` so writes land just before the next
   paint. Does the visual update look smoother, and why does rAF help scheduling?
3. Mix in a `getBoundingClientRect()` read inside the *batch* version's write loop. Watch
   the timing degrade — you reintroduced thrashing with one stray read.

## Deep Dive

The list of properties that force a synchronous layout is long: `offsetTop/Left/Width/
Height`, `clientTop/Left/Width/Height`, `scrollTop/Left/Width/Height`, `getBoundingClient
Rect()`, `getComputedStyle()`, and several `Range`/`SVG` getters. Libraries like FastDOM
formalize the pattern by queueing reads and writes into separate phases tied to
`requestAnimationFrame`. You rarely need the library — you need the discipline: *measure,
then mutate*, never measure-mutate-measure-mutate.

## Common Mistakes

- Reading a measured value inside the same loop that writes styles — classic thrash.
- Assuming small element counts are safe; the per-reflow cost is fixed overhead that adds up.
- Calling `getComputedStyle()` repeatedly in a loop instead of caching the value once.
- "Fixing" thrash by adding `setTimeout(0)` per item — that just spreads the same reflows
  across more frames; separate the reads from the writes instead.
