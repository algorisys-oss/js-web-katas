# Phase 15 — Graphics & Media

**Ladder rung:** 7 — Browser & Web Platform APIs (drawing pixels and shapes with code).

## Goal

Learn to produce graphics and handle media directly from JavaScript, without a framework or
library. By the end of this phase you can draw and animate on a `<canvas>`, build shapes as
SVG DOM nodes, load and process images pixel by pixel, drive `<video>`/`<audio>` playback,
and explain how the GPU turns numbers into pixels through WebGL.

## Why it matters

Charts, games, image editors, data visualizations, and rich media UIs all live below the
DOM-and-CSS layer most frontend work stays in. The two big choices — **immediate-mode**
(canvas: pixels you repaint) vs **retained-mode** (SVG: shapes that are DOM nodes) — shape
everything about performance, interactivity, and accessibility. Knowing both, plus the raw
GPU pipeline underneath, lets you pick the right tool instead of reaching for a library blind.

## Katas

1. [Canvas 2D Basics](./001-canvas-2d-basics.md) — `getContext('2d')`, rectangles, paths,
   styles, text, and the top-left coordinate system; compose a small scene.
2. [Animation Loops on Canvas](./002-animation-loops-on-canvas.md) — `requestAnimationFrame`,
   clear-and-redraw, delta-time movement, a bouncing ball, and `cancelAnimationFrame`.
3. [SVG from JavaScript](./003-svg-from-javascript.md) — `createElementNS`, attributes, a
   bar chart of live nodes, and retained-mode vs immediate-mode.
4. [Images & Media Elements](./004-images-and-media-elements.md) — async image loading,
   `drawImage`, `getImageData` pixel manipulation (a grayscale filter), and the
   `<video>`/`<audio>` playback model.
5. [Intro to WebGL (conceptual)](./005-intro-to-webgl.md) — `getContext('webgl')`, the
   vertex/fragment shader pipeline, buffers and draw calls, and a single triangle.

## What's next

Phase 16 — Storage & Offline: IndexedDB, the Cache API, service-worker lifecycle, and
offline-first patterns leading to a simple PWA.
