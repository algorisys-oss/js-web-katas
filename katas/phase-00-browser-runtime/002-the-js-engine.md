---
id: "phase-00/002-the-js-engine"
title: "The JavaScript Engine & the Browser"
phase: 0
sequence: 2
difficulty: "beginner"
tags: ["runtime", "event-loop"]
prerequisites: ["phase-00/001-browser-vs-node"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

A browser is several cooperating engines, not one program:

- The **JavaScript engine** (V8 in Chrome/Edge, SpiderMonkey in Firefox, JavaScriptCore
  in Safari) parses and executes your JS. It owns the **call stack** and the **heap**.
- The **rendering engine** (Blink, Gecko, WebKit) parses HTML/CSS, builds the DOM, and
  paints pixels.
- The **event loop** sits between them, deciding what runs next.

Crucially, the JS engine does **not** know about timers, the network, the DOM, or clicks.
Those are provided by the *browser* (the "host"). When you call `setTimeout` or
`fetch`, you are calling a browser API; the browser does the work and hands the result
back to the engine through the event loop as a **task**.

The engine runs your code on a **single thread**. While a function is running, nothing
else — no clicks, no rendering — can happen. This is why long synchronous work freezes
the page.

## Key Insight

> The JS engine runs your code; the *browser* provides the timers, network, and DOM. They
> meet at the single-threaded event loop, one task at a time.

## Experiment

```js
// The call stack runs to completion before anything else gets a turn.
console.log('1 — start');

setTimeout(() => console.log('4 — timeout callback (a browser-scheduled task)'), 0);

Promise.resolve().then(() => console.log('3 — microtask (runs before timers)'));

console.log('2 — end of synchronous code');
```

## Expected Result

The console prints in this order:

```
1 — start
2 — end of synchronous code
4 — timeout callback (a browser-scheduled task)
3 — microtask (runs before timers)
```

Wait — `3` actually prints **before** `4`. The correct order is:

```
1 — start
2 — end of synchronous code
3 — microtask (runs before timers)
4 — timeout callback (a browser-scheduled task)
```

All synchronous code (`1`, `2`) runs first. Then queued **microtasks** (the promise, `3`)
drain. Only then does the next **task** (the timeout, `4`) run. You'll go deep on this in
Phase 5.

## Challenge

1. Add a second `setTimeout(..., 0)` and a second `Promise.resolve().then(...)`. Predict
   the order before you run it.
2. Write a `while` loop that spins for ~2 seconds, then logs "done". Notice the whole tab
   is frozen while it runs — that is the single thread at work.
3. Explain in one sentence why the timeout callback can't run "during" the spin loop.

## Deep Dive

The engine compiles JS just-in-time: it starts interpreting bytecode, then recompiles
hot functions to optimized machine code, and de-optimizes if assumptions break. You don't
control this directly, but it's why micro-benchmarks are unreliable and why predictable,
monomorphic code tends to run fast.

## Common Mistakes

- Believing `setTimeout(fn, 0)` runs "immediately." It runs *after* the current call stack
  and all pending microtasks.
- Thinking the browser is multi-threaded for your JS. Your scripts share one main thread;
  only Web Workers run JS off it (Phase 13+).
- Blaming the engine for a frozen page. A frozen page is almost always your own
  long-running synchronous code blocking the single thread.
