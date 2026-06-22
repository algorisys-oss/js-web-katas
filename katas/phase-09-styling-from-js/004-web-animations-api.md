---
id: "phase-09/004-web-animations-api"
title: "The Web Animations API"
phase: 9
sequence: 4
difficulty: "intermediate"
tags: ["styling", "rendering", "animation"]
prerequisites: ["phase-09/003-computed-styles-and-layout-reads"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

The **Web Animations API** (WAA) lets JavaScript drive the same engine that powers CSS
animations — no per-frame loop, no inline-style juggling. The entry point is
`element.animate(keyframes, options)`:

```js
element.animate(
  [ { transform: 'translateX(0)' }, { transform: 'translateX(200px)' } ], // keyframes
  { duration: 600, easing: 'ease-out', fill: 'forwards' }                 // options
);
```

- **Keyframes**: an array of style objects (camelCase properties). The browser interpolates
  between them. You can also pass per-offset objects with `offset: 0..1`.
- **Options**: `duration` (ms), `easing`, `iterations` (or `Infinity`), `direction`
  (`'alternate'`), `delay`, and `fill` (`'forwards'` keeps the end state after finishing).

`animate()` returns an `Animation` object you can control: `pause()`, `play()`, `reverse()`,
`cancel()`, set `playbackRate`, and await its `finished` promise. Crucially, animate
**`transform` and `opacity`** — the compositor-friendly properties from Phase 0 — so the work
happens off the main thread and stays at 60 fps. Animating `width`/`left` reflows every
frame.

## Key Insight

> `element.animate(keyframes, options)` returns a controllable `Animation` with a `finished`
> promise — and runs on the browser's animation engine. Animate `transform`/`opacity` to
> stay on the compositor.

## Experiment

```html
<div id="ball"></div>
<button id="play">Play</button>
<button id="pause">Pause / Resume</button>
<button id="reverse">Reverse</button>
```

```css
#ball {
  width: 60px;
  height: 60px;
  background: #6366f1;
  border-radius: 50%;
  margin: 1rem 0;
}
button { margin-right: 0.25rem; }
```

```js
const ball = document.getElementById('ball');

// Animate transform + opacity → compositor-friendly, no layout per frame.
const anim = ball.animate(
  [
    { transform: 'translateX(0) scale(1)', opacity: 1 },
    { transform: 'translateX(220px) scale(1.4)', opacity: 0.4 },
  ],
  { duration: 1200, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' }
);
anim.pause(); // start paused so the buttons drive it

document.getElementById('play').addEventListener('click', () => anim.play());
document.getElementById('pause').addEventListener('click', () => {
  anim.playState === 'running' ? anim.pause() : anim.play();
  console.log('playState:', anim.playState);
});
document.getElementById('reverse').addEventListener('click', () => anim.reverse());

// The finished promise resolves only for finite animations; demo a quick one:
const flash = ball.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], 400);
flash.finished.then(() => console.log('intro flash finished'));
```

## Expected Result

In the **preview**, the ball flashes once on load (the `finished` promise logs "intro flash
finished"). "Play" starts a smooth back-and-forth glide that grows/shrinks and fades; "Pause
/ Resume" freezes and resumes it and logs the `playState`; "Reverse" flips its direction
mid-flight. Because only `transform`/`opacity` change, no layout runs per frame.

## Challenge

1. Add a third keyframe at `offset: 0.5` that nudges the ball upward
   (`transform: 'translate(110px, -40px) scale(1.2)'`) to make an arc.
2. Set `anim.playbackRate = 2` then `0.5` and watch the speed change without restarting.
3. Replace the `transform` keyframes with `left` keyframes (and `position: relative`). Record
   in DevTools and compare the layout cost against the transform version.

## Deep Dive

WAA and CSS animations share one implementation, so a JS-driven animation can run on the
**compositor thread** and keep moving even while the main thread is busy — something a
`requestAnimationFrame` loop (kata 005) cannot promise, since it competes with all your other
JS. The `Animation` object is a first-class, inspectable handle: you can scrub it by setting
`currentTime`, sequence several via their `finished` promises, or group them. For motion that
is purely declarative, prefer WAA or CSS; reach for `requestAnimationFrame` only when each
frame must be *computed* (physics, canvas, anything not expressible as keyframes).

## Common Mistakes

- Animating `width`, `height`, `top`, or `left` for movement — they reflow every frame; use
  `transform`.
- Forgetting `fill: 'forwards'` and being surprised the element snaps back to its original
  style when the animation ends.
- Awaiting `finished` on an infinite (`iterations: Infinity`) animation — it never resolves.
- Writing a manual `requestAnimationFrame` tween when a single `element.animate()` call would
  be smoother and cancellable.
