---
id: "phase-05/002-microtasks-vs-macrotasks"
title: "Microtasks vs Macrotasks"
phase: 5
sequence: 2
difficulty: "intermediate"
tags: ["async", "event-loop", "microtasks"]
prerequisites: ["phase-05/001-the-event-loop"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

The event loop doesn't have one queue — it has **two**, with different priorities:

- **Macrotasks** (the "task queue"): `setTimeout`, `setInterval`, message events, I/O
  callbacks. The loop runs **one** macrotask per turn.
- **Microtasks** (the "microtask queue"): promise reactions (`.then`/`.catch`/`.finally`),
  `queueMicrotask`, and `await` continuations. These are higher priority.

The rule that governs everything:

> After each macrotask (and after the initial synchronous run), the browser **drains the
> entire microtask queue** — running every microtask, including any that get added while
> draining — **before** it touches the next macrotask or renders.

So the order of any code is always: **all synchronous code first**, then **all microtasks
drain to empty**, then **the next single macrotask**, then microtasks drain again, and so
on. Microtasks queued by other microtasks run in the *same* drain, which is why a runaway
chain of promises can starve timers and rendering entirely.

## Key Insight

> One macrotask, then drain *all* microtasks, then render, then the next macrotask. The
> microtask queue is emptied completely before any timer ever fires.

## Experiment

```js
console.log('1 — sync start');

setTimeout(() => console.log('6 — macrotask (setTimeout)'), 0);

// Enqueued first → drains first (microtasks are strictly FIFO):
queueMicrotask(() => console.log('3 — microtask A (queueMicrotask, enqueued first)'));

Promise.resolve().then(() => {
  console.log('4 — microtask B (promise .then, enqueued second)');
  // A microtask queued from inside a microtask runs in the SAME drain:
  Promise.resolve().then(() => console.log('5 — microtask C (queued during the drain)'));
});

console.log('2 — sync end');

// Predict the order before running. Sync (1,2) → microtasks drain (3,4,5) → macrotask (6).
```

## Expected Result

The console prints in **exactly** this order:

```
1 — sync start
2 — sync end
3 — microtask A (queueMicrotask, enqueued first)
4 — microtask B (promise .then, enqueued second)
5 — microtask C (queued during the drain)
6 — macrotask (setTimeout)
```

Read it as three phases. **Synchronous** lines `1` and `2` run first. Then the microtask
queue **drains in FIFO order**: `queueMicrotask` (`3`) appears before the promise's `.then`
(`4`) in the source, so it was enqueued first and runs first; the microtask queued *during*
the drain (`5`) is appended and runs in the **same** drain. Only when the microtask queue
is empty does the loop run the single waiting **macrotask** (`6`). The `setTimeout` is dead
last despite its `0` ms delay.

## Challenge

1. Swap the `queueMicrotask(...)` and `Promise.resolve().then(...)` lines so the `.then` is
   registered first. Predict how `3` and `4` swap, then verify — microtasks are strictly
   FIFO by registration order.
2. Wrap `Promise.resolve().then(...)` in another `.then` so it chains three deep. Confirm
   all of them still run before the `setTimeout`.
3. Write a function that schedules a *new* microtask from inside every microtask (an
   infinite chain). Reason about why this would block the `setTimeout` and rendering
   forever — then don't actually run it.

## Deep Dive

`await` is the most common microtask source in real code: the statements *after* an
`await` are scheduled as a microtask when the awaited promise settles (kata 4). This means
even `await Promise.resolve()` defers the continuation past the current synchronous run —
a subtlety that explains many "why did this log after that?" puzzles. The microtask queue
is defined by the [HTML spec's "perform a microtask
checkpoint"](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint),
which the browser runs after each task and after each callback returns to the event loop.

## Common Mistakes

- Thinking `setTimeout(fn, 0)` beats a promise. A resolved promise's `.then` is a
  microtask; it always runs before the next macrotask timer.
- Assuming microtasks queued *during* a drain wait for the next round. They run in the
  current drain — the queue is emptied to zero before moving on.
- Flooding the microtask queue (e.g. recursive promise chains) and wondering why timers
  and animation stall. Microtasks can starve macrotasks and rendering.
