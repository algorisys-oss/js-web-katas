# Phase 5 — Asynchronous JavaScript

**Ladder rung:** 3 — Asynchronous JavaScript (above the language core, below the DOM).

## Goal

Build a precise mental model of *how* and *when* asynchronous code runs in the browser.
By the end of this phase you can predict the exact order of `setTimeout`, promises, and
`queueMicrotask`; explain the difference between a microtask and a macrotask; read and
write promise chains and `async`/`await` without surprises; and cancel in-flight work
cleanly with `AbortController`.

## Why it matters

The browser is single-threaded, so every "later" — a timer, a network reply, a resolved
promise — is scheduled through the event loop rather than run on the spot. Almost every
async bug ("why did this log out of order," "why didn't my `catch` fire," "why is this
request still running after the user navigated away") comes from a fuzzy model of that
scheduling. Get the ordering right once and asynchronous code stops being mysterious.

## Katas

1. [The Event Loop in the Browser](./001-the-event-loop.md) — the single thread, the call
   stack, and how the browser hands work back as tasks.
2. [Microtasks vs Macrotasks](./002-microtasks-vs-macrotasks.md) — two queues, one rule:
   drain all microtasks before the next macrotask.
3. [Promises](./003-promises.md) — states, `.then`/`.catch`/`.finally`, chaining, and the
   combinators (`all`, `race`, `allSettled`, `any`).
4. [async / await](./004-async-await.md) — syntactic sugar over promises that keeps the
   event-loop semantics intact.
5. [Cancellation & AbortController](./005-cancellation-and-abortcontroller.md) — using
   `AbortController` and `AbortSignal` to stop work you no longer need.

## What's next

Phase 6 — The DOM: selecting, traversing, and mutating the live document tree that all of
this asynchronous work usually exists to update.
