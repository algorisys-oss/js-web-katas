---
id: "phase-09/005-transitions-and-requestanimationframe"
title: "Transitions & requestAnimationFrame"
phase: 9
sequence: 5
difficulty: "intermediate"
tags: ["styling", "rendering", "animation"]
prerequisites: ["phase-09/004-web-animations-api"]
estimated_minutes: 15
starter: ["html", "css", "js"]
network: false
---

## Concept

Two more ways to move pixels, each for a different job.

**CSS transitions** animate a property when its value *changes*. You declare
`transition: transform 0.3s ease` in CSS, then in JS you simply set the new value — the
browser tweens it. When it ends, the element fires a **`transitionend`** event (one per
animated property), letting JS run cleanup or chain the next step. A common gotcha: a
property must have a *starting* value for the browser to transition *from*; toggling display
or inserting an element and changing it in the same tick can skip the animation unless you
force a layout read in between.

**`requestAnimationFrame(callback)`** schedules `callback` to run **once**, right before the
next repaint (~60 times/second). For a continuous loop you re-schedule inside the callback.
The callback receives a high-resolution timestamp, so you compute motion from **elapsed
time**, not a fixed per-frame delta — that keeps speed consistent across refresh rates. Use
`rAF` when each frame must be *computed* (physics, canvas, scroll-driven effects). It runs on
the main thread, in sync with the rendering pipeline from Phase 0.

Decision guide: a value change you can express in CSS → **transition**; declarative keyframes
→ **Web Animations API** (kata 004); per-frame computation → **`requestAnimationFrame`**.

## Key Insight

> A transition tweens a property when you change it and fires `transitionend` when done.
> `requestAnimationFrame` runs one callback per frame in sync with the repaint — re-schedule
> it for a loop, and drive motion by elapsed time.

## Experiment

```html
<div id="card">transition</div>
<button id="move">Toggle transition</button>
<div id="dot"></div>
<button id="loop">Start / Stop rAF loop</button>
```

```css
#card {
  width: 90px; padding: 1rem; margin-bottom: 1rem;
  background: #6366f1; color: white; border-radius: 8px;
  /* animate transform (compositor), not left (layout) */
  transition: transform 0.4s ease, background 0.4s ease;
}
#card.shift { transform: translateX(200px); background: tomato; }
#dot {
  width: 40px; height: 40px; background: seagreen; border-radius: 50%;
}
button { margin-bottom: 1rem; }
```

```js
const card = document.getElementById('card');
card.addEventListener('transitionend', (e) => {
  console.log('transitionend for property:', e.propertyName);
});
document.getElementById('move').addEventListener('click', () => {
  card.classList.toggle('shift'); // changing the value triggers the transition
});

// requestAnimationFrame loop: bob the dot using ELAPSED time, not a fixed delta.
const dot = document.getElementById('dot');
let rafId = null;
let start = null;
function frame(now) {
  if (start === null) start = now;
  const elapsed = (now - start) / 1000;          // seconds
  const y = Math.sin(elapsed * 3) * 30;           // smooth bob
  dot.style.transform = `translateY(${y}px)`;     // transform → compositor
  rafId = requestAnimationFrame(frame);           // re-schedule for a loop
}
document.getElementById('loop').addEventListener('click', () => {
  if (rafId === null) {
    start = null;
    rafId = requestAnimationFrame(frame);
    console.log('rAF loop started');
  } else {
    cancelAnimationFrame(rafId);                  // always cancel to stop the loop
    rafId = null;
    console.log('rAF loop stopped');
  }
});
```

## Expected Result

In the **preview**, "Toggle transition" glides the card 200px to the right and recolors it
over 0.4s; the **console** logs a `transitionend` for `transform` and another for
`background` (one event per property). "Start / Stop rAF loop" makes the green dot bob up and
down smoothly and logs start/stop; the bob speed stays the same regardless of your monitor's
refresh rate because it is driven by elapsed time.

## Challenge

1. Add a `transitionstart` listener to the card and confirm it fires before `transitionend`.
2. In the rAF loop, log `now` for the first 5 frames and compute the per-frame delta. Is it
   exactly 16.7 ms? Why use elapsed time instead?
3. Insert a fresh element, set its starting `opacity: 0`, then set `opacity: 1` in the same
   tick — the fade is skipped. Force it by reading `el.offsetWidth` between the two writes and
   explain why that fixes it.

## Deep Dive

`requestAnimationFrame` callbacks run in the *pre-render* step of the event loop, batched and
throttled to the display's refresh rate and paused entirely when the tab is hidden — which is
why it beats `setInterval` for animation (no wasted frames, no drift, no background CPU
burn). But it runs on the **main thread**, so heavy work in the callback delays the very
paint it precedes, causing jank. CSS transitions and the Web Animations API can offload
`transform`/`opacity` to the compositor and survive a busy main thread; reserve `rAF` for the
frames you genuinely need to *compute*, and keep each callback short.

## Common Mistakes

- Forgetting to `cancelAnimationFrame` — the loop keeps running (and burning CPU) forever.
- Assuming a fixed 16.7 ms per frame; frames vary, so derive motion from the timestamp.
- Expecting a transition with no starting value to animate; set the initial value (and force
  a layout read) before changing it.
- Animating `left`/`width` in a transition or rAF loop instead of `transform`, forcing a
  reflow every frame.
