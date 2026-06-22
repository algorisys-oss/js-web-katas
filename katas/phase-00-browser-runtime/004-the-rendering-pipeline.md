---
id: "phase-00/004-the-rendering-pipeline"
title: "The Rendering Pipeline Overview"
phase: 0
sequence: 4
difficulty: "beginner"
tags: ["rendering", "performance"]
prerequisites: ["phase-00/003-the-page-lifecycle"]
estimated_minutes: 12
starter: ["html", "css", "js"]
network: false
---

## Concept

When the browser turns your HTML/CSS/JS into pixels, it runs a pipeline. Knowing the
stages explains *why* some JavaScript is cheap and some is expensive:

1. **DOM** — parse HTML into the document tree.
2. **CSSOM** — parse CSS into the style model.
3. **Style** — match rules to elements (compute the final style of each node).
4. **Layout (reflow)** — compute the geometry: where and how big every box is.
5. **Paint** — fill in pixels (text, colors, borders, shadows) into layers.
6. **Composite** — assemble the layers on screen, often on the GPU.

The key cost rule: changing something that affects **geometry** (width, top, font-size,
adding/removing nodes) forces **Layout → Paint → Composite** again. Changing only
**`transform`** or **`opacity`** can often skip straight to **Composite** — much cheaper.

Reading a layout property (like `offsetHeight`) *forces the browser to finish a pending
layout right now* so it can give you an accurate number. Interleaving reads and writes in
a loop causes "layout thrashing" (Phase 12).

## Key Insight

> Geometry changes trigger Layout → Paint → Composite. `transform`/`opacity` changes can
> go straight to Composite. Cheaper animations stick to the latter.

## Experiment

```html
<div id="box">Box</div>
<button id="grow">Change width (layout)</button>
<button id="slide">Change transform (composite)</button>
```

```css
#box {
  width: 120px;
  padding: 1rem;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}
```

```js
const box = document.getElementById('box');

document.getElementById('grow').addEventListener('click', () => {
  // Width is geometry → forces Layout → Paint → Composite.
  box.style.width = box.style.width === '260px' ? '120px' : '260px';
  // Reading offsetWidth forces layout to flush so the value is accurate:
  console.log('layout flushed, width is now', box.offsetWidth);
});

document.getElementById('slide').addEventListener('click', () => {
  // transform usually skips layout & paint → straight to Composite.
  box.style.transform = box.style.transform ? '' : 'translateX(80px)';
  console.log('composited move, no layout needed');
});
```

## Expected Result

In the **preview**, "Change width" makes the box grow/shrink and logs its new width;
"Change transform" slides the box sideways. Both look animated, but only the first one
re-runs Layout. The **console** logs which path each took.

## Challenge

1. Open your browser's DevTools Performance panel, record, and click each button. Compare
   how much "Layout" and "Paint" work each one triggers.
2. Change the box's `background` color instead of its width. Which pipeline stages does a
   pure color change skip?
3. Animate `margin-left` vs `transform: translateX(...)` for the same visual motion and
   describe which is cheaper and why.

## Deep Dive

The browser tries to do layout and paint at most once per frame (~16.7 ms at 60 Hz),
right before compositing. `requestAnimationFrame` (Phase 9) lets you run JS in sync with
that cadence. Properties that can be composited on the GPU — `transform`, `opacity`,
and `filter` — are the foundation of smooth 60 fps animation.

## Common Mistakes

- Animating `width`, `height`, `top`, or `left` for motion — they reflow every frame.
  Prefer `transform`.
- Reading `offsetTop`/`getBoundingClientRect()` in a loop right after writing styles,
  forcing repeated synchronous layouts.
- Assuming a color change is "free." It still needs Paint and Composite, just not Layout.
