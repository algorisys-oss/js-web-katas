---
id: "phase-10/004-observers"
title: "Observers (Intersection, Mutation, Resize)"
phase: 10
sequence: 4
difficulty: "intermediate"
tags: ["web-apis", "observers", "performance"]
prerequisites: ["phase-10/003-timers-and-scheduling"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

Before observers, watching for "did this scroll into view," "did the DOM change," or "did
this box resize" meant polling on `scroll`/`resize` events and reading layout every frame —
expensive and janky. The **Observer APIs** flip this around: you register interest, and the
browser calls *you* back, off the hot path, batching changes.

Three observers, one pattern (`new XObserver(callback)` → `.observe(target)` →
`.disconnect()`):

- **`IntersectionObserver`** — fires when a target enters or leaves the viewport (or a
  scroll container). The basis for lazy-loading images, infinite scroll, and "reveal on
  scroll" animations — without listening to `scroll`.
- **`MutationObserver`** — fires when the DOM tree changes: nodes added/removed, attributes
  or text edited. Useful for reacting to third-party DOM changes.
- **`ResizeObserver`** — fires when an element's content box changes size — element-level
  resize detection that the global `resize` event can't give you.

All three run in the sandbox and build real DOM, so this kata is fully runnable.

## Key Insight

> Don't poll on `scroll`/`resize`. Observers let the browser notify you of visibility, DOM,
> and size changes efficiently and in batches — you react, you don't loop.

## Experiment

```html
<div id="scroller">
  <div class="spacer">scroll down ↓</div>
  <div id="target">watch me (I'm observed)</div>
  <div class="spacer">… keep scrolling</div>
</div>
<button id="add">Add a node (MutationObserver)</button>
<button id="grow">Resize target (ResizeObserver)</button>
<ul id="log"></ul>
```

```css
#scroller { height: 140px; overflow-y: scroll; border: 2px solid #6366f1; border-radius: 8px; }
.spacer { height: 160px; padding: 8px; background: #eef2ff; }
#target { padding: 16px; background: #6366f1; color: white; transition: width 0.3s; }
#log { font-family: monospace; font-size: 12px; }
button { margin: 8px 4px; }
```

```js
const logEl = document.getElementById('log');
const log = (msg) => {
  console.log(msg);
  const li = document.createElement('li');
  li.textContent = msg;
  logEl.append(li);
};

const target = document.getElementById('target');

// 1. IntersectionObserver — scroll #target into the #scroller viewport to fire it.
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    log(`intersection: ${entry.isIntersecting ? 'visible' : 'hidden'} (${Math.round(entry.intersectionRatio * 100)}%)`);
  }
}, { root: document.getElementById('scroller'), threshold: 0.5 });
io.observe(target);

// 2. MutationObserver — fires when children are added/removed under #log.
const mo = new MutationObserver((records) => {
  for (const r of records) log(`mutation: +${r.addedNodes.length} node(s)`);
});
mo.observe(logEl, { childList: true });

document.getElementById('add').addEventListener('click', () => {
  const li = document.createElement('li');
  li.textContent = 'manually added node';
  logEl.append(li); // triggers the MutationObserver above
});

// 3. ResizeObserver — fires when #target's box changes size.
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    log(`resize: ${Math.round(entry.contentRect.width)}px wide`);
  }
});
ro.observe(target);

document.getElementById('grow').addEventListener('click', () => {
  target.style.width = target.style.width === '90%' ? '50%' : '90%';
});
```

## Expected Result

In the **preview**, scrolling `#target` into the bordered box logs an `intersection`
entry; clicking "Add a node" logs a `mutation`; clicking "Resize target" animates its width
and logs a `resize` with the new pixel width. The same lines appear in the **console**.
Each observer fires once on setup too (intersection and resize report the initial state).

## Challenge

1. Give the `IntersectionObserver` `threshold: [0, 0.25, 0.5, 0.75, 1]` and watch it fire
   at each visibility step as you scroll — useful for progress indicators.
2. Extend the `MutationObserver` options to `{ childList: true, subtree: true, attributes:
   true }` and edit an attribute on a nested node to see it caught.
3. Use the `IntersectionObserver` to lazy-load: only set an `<img src>` when its placeholder
   becomes visible, then `unobserve` it so it fires only once.

## Deep Dive

Observers exist because reading layout (`getBoundingClientRect`, `offsetWidth`) is
expensive and, done on every `scroll`/`resize` event, forces synchronous layout and tanks
performance. The browser already computes intersection and size during its rendering
pipeline, so observers hand you that information *for free*, asynchronously, after layout
settles — no forced reflow. `ResizeObserver` even guards against infinite loops (resize →
callback → resize) by deferring follow-up changes to the next frame. Always
`disconnect()` (or `unobserve`) when done; a live observer keeps its target — and your
callback's closure — from being garbage-collected.

## Common Mistakes

- Reaching for `scroll`/`resize` listeners plus `getBoundingClientRect` when an observer
  would do the same job without forcing layout.
- Forgetting that observer callbacks are **asynchronous and batched** — you get an array of
  entries, possibly coalescing several changes, not one call per change.
- Never calling `disconnect()`/`unobserve()`, leaking observers and the DOM they hold.
- Expecting `MutationObserver` to fire for attribute or text changes when you only passed
  `{ childList: true }` — you must opt into `attributes`/`characterData`/`subtree`.
