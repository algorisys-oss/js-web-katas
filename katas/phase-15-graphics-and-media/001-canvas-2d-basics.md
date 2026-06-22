---
id: "phase-15/001-canvas-2d-basics"
title: "Canvas 2D Basics"
phase: 15
sequence: 1
difficulty: "intermediate"
tags: ["graphics", "canvas"]
prerequisites: ["phase-14/005-building-a-reusable-component"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

A `<canvas>` is a fixed-size grid of pixels you draw onto with JavaScript. Unlike the DOM,
nothing on a canvas is a node — once you paint a shape, the canvas only remembers the
pixels, not the shape. This is **immediate-mode** rendering: you issue drawing commands and
they happen *now*.

You draw through a **context** obtained with `getContext('2d')`. The 2D context exposes a
small but complete drawing API:

- **Rectangles:** `fillRect(x, y, w, h)`, `strokeRect(x, y, w, h)`, `clearRect(...)`.
- **Paths:** `beginPath()`, then `moveTo` / `lineTo` / `arc` / `rect`, finished with
  `fill()` or `stroke()`. A path is a recipe; nothing appears until you fill or stroke it.
- **State:** `fillStyle`, `strokeStyle`, `lineWidth`, `font` — set *before* drawing.
- **Text:** `fillText(text, x, y)`.

The **coordinate system** starts at the top-left corner `(0, 0)`. X grows right, Y grows
**down** (not up, as in math). The canvas's drawing-buffer size comes from its `width` /
`height` *attributes*, which are independent of any CSS display size.

## Key Insight

> Canvas is immediate mode: it stores pixels, not shapes. Drawing commands paint once and
> are forgotten — there is nothing to "update" later, only to repaint.

## Experiment

```html
<canvas id="scene" width="300" height="200"></canvas>
```

```js
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

// Sky background — a filled rectangle covering the whole canvas.
ctx.fillStyle = '#bfdbfe';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Ground — note Y grows downward, so larger Y is lower on screen.
ctx.fillStyle = '#86efac';
ctx.fillRect(0, 150, canvas.width, 50);

// Sun — a filled circle via an arc path (full circle = 0 to 2π).
ctx.beginPath();
ctx.arc(240, 50, 30, 0, Math.PI * 2);
ctx.fillStyle = '#facc15';
ctx.fill();

// House body — a stroked rectangle (outline only).
ctx.strokeStyle = '#1f2937';
ctx.lineWidth = 3;
ctx.strokeRect(60, 90, 80, 60);

// Roof — a triangle built from a path.
ctx.beginPath();
ctx.moveTo(55, 90);
ctx.lineTo(100, 55);
ctx.lineTo(145, 90);
ctx.closePath();
ctx.fillStyle = '#b91c1c';
ctx.fill();

// A label, drawn as pixels (not selectable text).
ctx.fillStyle = '#1f2937';
ctx.font = '14px sans-serif';
ctx.fillText('canvas scene', 60, 175);
```

## Expected Result

In the **preview** you see a small scene: a blue sky, green ground, a yellow sun in the
top-right, a black-outlined house with a red triangular roof, and the label "canvas scene"
near the bottom. The console stays empty — everything is visual.

## Challenge

1. Add a `lineTo`-based path for a door on the house, then a small `arc` for a doorknob.
2. Change the canvas's *CSS* width (e.g. `style="width: 600px"`) without changing the
   `width` attribute. Notice the drawing stretches and blurs — explain why.
3. Replace the sun's `arc` with two overlapping arcs to draw a cloud, and observe how each
   `fill()` paints independently over what is already there.

## Deep Dive

The 2D context is a **state machine**: `fillStyle`, `lineWidth`, and the current
transform persist until you change them, so order matters and later draws paint over
earlier ones. Wrap a group of changes in `ctx.save()` / `ctx.restore()` to snapshot and
roll back the entire drawing state — invaluable once you start translating, rotating, and
scaling the coordinate system for sub-parts of a scene.

## Common Mistakes

- Setting canvas size with **CSS** instead of the `width`/`height` attributes — CSS scales
  the existing buffer (blurry), it does not give you more pixels to draw on.
- Forgetting `beginPath()` before a new path, so old sub-paths re-stroke/re-fill with the
  new one.
- Expecting `fillText` to be selectable or styleable later — it is just pixels, not a DOM
  text node.
- Assuming Y grows upward like a math graph. On canvas, Y grows **downward**.
