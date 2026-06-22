---
id: "phase-10/003-timers-and-scheduling"
title: "Timers & Scheduling"
phase: 10
sequence: 3
difficulty: "intermediate"
tags: ["web-apis", "event-loop", "scheduling"]
prerequisites: ["phase-10/002-web-storage"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

Timers are how the browser lets you schedule work for *later*, without blocking the single
thread. They are host APIs, not language features — the engine hands the callback back to
you through the event loop (Phase 5).

- **`setTimeout(fn, ms)`** — run `fn` once, after *at least* `ms` milliseconds. Returns an
  id you can pass to **`clearTimeout`** to cancel it.
- **`setInterval(fn, ms)`** — run `fn` repeatedly, roughly every `ms`. Returns an id for
  **`clearInterval`**. You almost always need to clear it eventually.
- **`queueMicrotask(fn)`** — run `fn` as a **microtask**: after the current synchronous
  code, but *before* any timer. Same queue promises use.
- **`requestIdleCallback(fn)`** — run `fn` when the browser is *idle*, with a deadline. Not
  universally supported, so you **feature-detect** it.

The crucial mental model: the delay is a **minimum**, not a guarantee. A timer only fires
once the call stack is clear and its turn comes up. And microtasks always drain before the
next timer — so ordering matters more than the numbers you pass.

## Key Insight

> `setTimeout`'s delay is a *minimum*, not a promise. Microtasks (`queueMicrotask`,
> promises) always run before the next timer task, no matter how small the delay.

## Experiment

```js
console.log('1 — synchronous start');

setTimeout(() => console.log('5 — setTimeout 0 (a macrotask)'), 0);

queueMicrotask(() => console.log('3 — microtask (before any timer)'));

Promise.resolve().then(() => console.log('4 — promise microtask'));

console.log('2 — synchronous end');

// An interval that cancels itself after 3 ticks — always clear intervals!
let ticks = 0;
const id = setInterval(() => {
  ticks += 1;
  console.log(`tick ${ticks}`);
  if (ticks === 3) {
    clearInterval(id);
    console.log('interval cleared');
  }
}, 200);

// requestIdleCallback isn't in every browser — feature-detect before using it:
if ('requestIdleCallback' in window) {
  requestIdleCallback((deadline) => {
    console.log('idle callback ran, time remaining:', Math.round(deadline.timeRemaining()), 'ms');
  });
} else {
  console.log('requestIdleCallback not supported — falling back to setTimeout');
  setTimeout(() => console.log('fallback idle work'), 0);
}
```

## Expected Result

The synchronous logs come first, then microtasks, then the timer macrotask, then the
interval ticks:

```
1 — synchronous start
2 — synchronous end
3 — microtask (before any timer)
4 — promise microtask
5 — setTimeout 0 (a macrotask)
tick 1
tick 2
tick 3
interval cleared
```

The `requestIdleCallback` (or its fallback) line appears whenever the browser reports idle
time. The key takeaway: even with a `0 ms` timeout, both microtasks ran first.

## Challenge

1. Add a second `setTimeout(..., 0)` and a second `queueMicrotask(...)`. Predict the exact
   order before running, then verify. (Hint: microtasks drain fully between each macrotask.)
2. Build a `debounce(fn, ms)` using `setTimeout`/`clearTimeout`: each call cancels the
   pending timer and schedules a fresh one, so `fn` runs only after calls stop.
3. Replace the self-clearing interval with a recursive `setTimeout` that re-schedules
   itself. Why is recursive `setTimeout` often safer than `setInterval` for slow callbacks?

## Deep Dive

`setInterval` queues the next tick on a fixed cadence regardless of how long your callback
takes — if the callback runs longer than the interval, ticks pile up and can fire
back-to-back. A **recursive `setTimeout`** (schedule the next run only after the current
one finishes) guarantees a real gap between executions. Browsers also **throttle** timers
in background tabs (clamping to ~1 s or pausing them) to save power, and nested
`setTimeout` calls are clamped to a 4 ms minimum after several levels deep. For
animation timing, never use timers — use `requestAnimationFrame` (Phase 9), which syncs to
the display's refresh.

## Common Mistakes

- Treating the delay as exact. `setTimeout(fn, 100)` means "no sooner than 100 ms," not
  "at exactly 100 ms" — a busy main thread pushes it later.
- Forgetting to `clearInterval`/`clearTimeout`, leaking timers that keep firing (and keep
  closures alive) after the component or page section is gone.
- Assuming `setTimeout(fn, 0)` beats a microtask. It never does — microtasks always run
  first.
- Calling `requestIdleCallback` without feature-detecting it, throwing in browsers that
  lack it.
