---
id: "phase-15/004-images-and-media-elements"
title: "Images & Media Elements"
phase: 15
sequence: 4
difficulty: "advanced"
tags: ["graphics", "canvas", "media", "images"]
prerequisites: ["phase-15/003-svg-from-javascript"]
estimated_minutes: 15
starter: ["html", "js"]
network: false
---

## Concept

Images load **asynchronously**. An `Image` (the same thing as `<img>`) starts fetching when
you set its `src`, and is only safe to use after its `load` event fires. Until then its
width is `0` and drawing it is a no-op. So the pattern is always: create the image, attach
`onload`, *then* set `src`.

Once loaded, `ctx.drawImage(img, x, y)` paints it onto a canvas. From there you can reach the
raw pixels with `ctx.getImageData(x, y, w, h)`, which returns an `ImageData` whose `.data` is
a flat `Uint8ClampedArray` of `[R, G, B, A, R, G, B, A, ...]` — four bytes per pixel, row by
row. Edit those bytes and `ctx.putImageData(...)` to write them back. That is how filters
like grayscale, invert, and blur work at the lowest level.

To stay fully offline, this kata **generates** its own image on a second canvas and turns it
into a `data:` URL with `canvas.toDataURL()` — no network request. The same `onload` rules
apply to a `data:` URL as to any other source.

**Media elements** (`<video>`, `<audio>`) follow the same async-load model and add playback
control: `play()`, `pause()`, the `currentTime` property (seek/read position in seconds),
`duration`, `volume`, and events like `timeupdate` and `ended`. You can even `drawImage` a
playing `<video>` frame onto a canvas to process it live. (We keep the runnable part to
images so nothing remote is needed.)

## Key Insight

> Images and media load asynchronously — draw or read them only after `load`. Once on a
> canvas, `getImageData` exposes raw RGBA bytes you can transform pixel by pixel.

## Experiment

```html
<canvas id="src" width="120" height="120" style="display:none"></canvas>
<canvas id="out" width="120" height="120" style="border:1px solid #cbd5e1"></canvas>
```

```js
// 1. Generate a source image offline (no network): draw shapes, export to a data URL.
const srcCanvas = document.getElementById('src');
const sctx = srcCanvas.getContext('2d');
sctx.fillStyle = '#22d3ee';
sctx.fillRect(0, 0, 120, 120);
sctx.fillStyle = '#f43f5e';
sctx.beginPath();
sctx.arc(60, 60, 40, 0, Math.PI * 2);
sctx.fill();
const dataUrl = srcCanvas.toDataURL(); // a "data:image/png;base64,..." string

// 2. Load it as an Image — note onload is set BEFORE src.
const out = document.getElementById('out');
const octx = out.getContext('2d');
const img = new Image();

img.onload = () => {
  octx.drawImage(img, 0, 0);

  // 3. Read raw pixels and apply a grayscale filter.
  const imageData = octx.getImageData(0, 0, out.width, out.height);
  const px = imageData.data; // [R,G,B,A, R,G,B,A, ...]
  for (let i = 0; i < px.length; i += 4) {
    // Luminance-weighted gray keeps perceived brightness right.
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    px[i] = px[i + 1] = px[i + 2] = gray; // leave px[i + 3] (alpha) alone
  }
  octx.putImageData(imageData, 0, 0);
  console.log('processed', px.length / 4, 'pixels');
};

img.src = dataUrl; // setting src starts the (here, instant) load
```

## Expected Result

In the **preview** you see one visible canvas: a red circle on a cyan square, rendered in
**grayscale** (shades of gray, no color). The source canvas is hidden. The **console** prints
`processed 14400 pixels` (120 × 120).

## Challenge

1. Change the filter to **invert** (`px[i] = 255 - px[i]`, and likewise for green and blue).
   Leave alpha untouched and explain why.
2. Skip the `onload` handler and draw `img` immediately after setting `src`. The output is
   blank — explain the timing bug in terms of asynchronous loading.
3. Sketch (in comments) how you would draw a live `<video>` frame onto a canvas every
   `requestAnimationFrame` and grayscale it, using `play()` and `currentTime`.

## Deep Dive

`getImageData` is subject to the canvas **origin-clean** rule: drawing a *cross-origin* image
without proper CORS headers "taints" the canvas, and `getImageData`/`toDataURL` then throw a
`SecurityError`. This prevents one site from reading pixels of another site's images. Our
self-generated `data:` URL is same-origin, so it stays clean. For heavy per-pixel work, the
modern path is a WebGL fragment shader (next kata) or an `OffscreenCanvas` in a Worker, which
keeps the main thread responsive.

## Common Mistakes

- Setting `img.src` before `img.onload`, or using the image before `load` fires — you draw a
  zero-size, not-yet-loaded image.
- Forgetting RGBA is **four** bytes per pixel and stepping the loop by 1 or 3 instead of 4.
- Overwriting the alpha byte (`px[i + 3]`) and accidentally making pixels transparent.
- Calling `getImageData` on a canvas tainted by a cross-origin image and hitting a
  `SecurityError`.
