---
id: "phase-15/002-animation-loops-on-canvas"
title: "Animation Loops on Canvas"
phase: 15
sequence: 2
difficulty: "intermediate"
tags: ["graphics", "canvas", "animation"]
prerequisites: ["phase-15/001-canvas-2d-basics"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

Because canvas is immediate-mode (Kata 001), animation is just **repaint, repeatedly**:
clear the canvas, advance your state, draw the new frame, and ask for the next one. The
right scheduler for this is `requestAnimationFrame` (rAF), not `setInterval`.

`requestAnimationFrame(callback)` asks the browser to call you **once, right before the
next paint** — in sync with the rendering pipeline you met in Phase 0. The browser passes
your callback a high-resolution timestamp, and it pauses the loop when the tab is hidden,
saving battery. To keep animating, you call `requestAnimationFrame` again *inside* the
callback.

Frame intervals are not perfectly even (a 60 Hz screen aims for ~16.7 ms, but it varies).
If you move by a fixed number of pixels per frame, your animation runs faster on fast
displays. The fix is **delta-time** movement: measure the elapsed time since the last
frame and multiply your velocity (pixels *per second*) by it. The animation then runs at
the same real-world speed regardless of frame rate.

`requestAnimationFrame` returns an id; `cancelAnimationFrame(id)` stops the loop.

## Key Insight

> Animate with `requestAnimationFrame`, clear and redraw each frame, and scale movement by
> **delta time** — so speed is measured in pixels per second, not pixels per frame.

## Experiment

```html
<canvas id="stage" width="320" height="180"></canvas>
```

```js
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const ball = { x: 40, y: 40, r: 16, vx: 120, vy: 90 }; // velocity in px/second
let last = performance.now();
let rafId;
let frames = 0;

function frame(now) {
  const dt = (now - last) / 1000; // seconds since previous frame
  last = now;

  // Advance position by velocity * elapsed time.
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Bounce off the walls by flipping velocity at the edges.
  if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.vx *= -1;
  if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.vy *= -1;

  // Clear the whole canvas, then draw the new frame.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();

  // Stop after a fixed number of frames so the demo doesn't run forever.
  frames += 1;
  if (frames === 1) console.log('animation started');
  if (frames < 200) {
    rafId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(rafId);
    console.log('animation stopped after', frames, 'frames');
  }
}

rafId = requestAnimationFrame(frame);
```

## Expected Result

In the **preview**, a purple ball drifts across the canvas and bounces off all four edges,
moving at a steady real-world speed. After about 200 frames the loop stops itself. The
**console** prints `animation started` and then `animation stopped after 200 frames`.

## Challenge

1. Remove the `clearRect` call. The ball now smears a trail across the canvas — explain
   why, in terms of immediate-mode rendering.
2. Replace delta-time movement with a fixed `ball.x += 2` per frame and describe how the
   speed would differ on a 60 Hz vs a 144 Hz display.
3. Add a second ball with different velocity and color, and clamp positions to the bounds
   so a fast `dt` (e.g. after a hidden tab) can't push a ball off-screen.

## Deep Dive

rAF is the JavaScript hook into the browser's frame cadence: it fires once per frame, just
before Style → Layout → Paint → Composite. Doing heavy work in the callback overruns the
~16.7 ms budget and drops frames (jank). For physics that must stay stable, advanced loops
use a **fixed timestep** accumulator — running the simulation in constant increments while
rendering interpolated frames — but delta-time movement is the right first tool.

## Common Mistakes

- Using `setInterval` for animation — it ignores the paint cadence and keeps firing in
  hidden tabs, wasting work and causing jank.
- Forgetting to `clearRect` (or repaint a background) each frame, leaving trails.
- Moving by a fixed pixel count per frame, so speed depends on the display's refresh rate.
- Never calling `cancelAnimationFrame`, leaving a loop running after it is no longer needed.
