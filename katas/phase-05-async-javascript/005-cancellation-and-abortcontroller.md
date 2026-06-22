---
id: "phase-05/005-cancellation-and-abortcontroller"
title: "Cancellation & AbortController"
phase: 5
sequence: 5
difficulty: "advanced"
tags: ["async", "abortcontroller", "cancellation"]
prerequisites: ["phase-05/004-async-await"]
estimated_minutes: 15
starter: ["js"]
network: false
---

## Concept

Promises have a missing piece: there is **no built-in way to cancel** one. Once a promise
is pending, you can't "un-start" it. The web platform's answer is a small two-part protocol:

- **`AbortController`** — an object you create and keep. It owns a `.signal` and a method
  `.abort(reason)`.
- **`AbortSignal`** — the read-only half you *pass into* an async operation. It exposes
  `signal.aborted` (a boolean), fires an **`abort` event** when cancelled, and provides
  `signal.throwIfAborted()`.

The pattern: create a controller, hand its `signal` to whatever async work you start, and
call `controller.abort()` when you no longer need the result (the user navigated away, a
newer request superseded this one, a timeout elapsed). The operation observes the signal —
either by listening for the `abort` event or by checking `signal.aborted` — and stops,
typically rejecting with an `AbortError`. `fetch`, `addEventListener`, and many other Web
APIs accept a `signal`; below we wire one into a **timer-based** fake request so it works
fully offline.

## Key Insight

> `AbortController` is the standard cancellation handle: keep the controller, pass its
> `signal` to the work, call `.abort()` to stop it. The signal both flips a flag and fires
> an `abort` event.

## Experiment

```js
// A cancellable, timer-based "request" — no network needed.
function fakeRequest(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));

    const id = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve('data loaded');
    }, ms);

    function onAbort() {
      clearTimeout(id);                       // stop the pending work
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

const controller = new AbortController();

console.log('1 — starting a 100 ms request');
fakeRequest(100, controller.signal)
  .then((result) => console.log('never — result:', result))
  .catch((err) => console.log('3 — request rejected with:', err.name));

// Cancel it after 20 ms — before the 100 ms timer can resolve.
setTimeout(() => {
  console.log('2 — aborting');
  controller.abort();
}, 20);
```

## Expected Result

The console prints in this order:

```
1 — starting a 100 ms request
2 — aborting
3 — request rejected with: AbortError
```

The request was scheduled to resolve at 100 ms, but we `abort()` at 20 ms. The `abort`
event fires, `onAbort` clears the pending timer and **rejects** the promise, so the
`.then` (success path) never runs and the `.catch` reports an `AbortError`. The work that
would have completed at 100 ms is cancelled cleanly, with no leftover timer.

## Challenge

1. Move the `controller.abort()` to fire at **120 ms** instead of 20 ms. Now the request
   resolves first; confirm the later `abort()` is a harmless no-op (the listener was
   removed and the promise already settled).
2. Implement a timeout: start the request, and in parallel `setTimeout(() =>
   controller.abort(), 50)`. (This is exactly what `AbortSignal.timeout(50)` does — try
   that built-in too.)
3. Share one signal across **two** `fakeRequest` calls and a single `controller.abort()`.
   Confirm both reject — one controller can cancel many operations at once.

## Deep Dive

The same `signal` works far beyond `fetch`. `addEventListener(type, fn, { signal })`
auto-removes the listener when the signal aborts — a clean way to tear down many handlers
at once (Phase 7). The platform also gives you `AbortSignal.timeout(ms)` for a
self-aborting signal and `AbortSignal.any([sig1, sig2])` to abort when *any* of several
signals fire. Because abort is just an event plus a flag, you can make **any** of your own
async functions cancellable by accepting a `signal` and honoring it — the convention is to
reject with a `DOMException` named `'AbortError'`.

## Common Mistakes

- Reusing one `AbortController` after calling `.abort()`. A controller is single-use; its
  signal stays aborted forever. Create a **new** controller per operation.
- Forgetting to clean up. If you don't `clearTimeout` / remove the listener on abort, the
  underlying work (or a leaked listener) lingers even though the promise rejected.
- Treating an `AbortError` like a real failure. Cancellation is usually expected — detect
  `err.name === 'AbortError'` and exit quietly rather than showing an error to the user.
