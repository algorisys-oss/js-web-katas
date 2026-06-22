---
id: "phase-05/003-promises"
title: "Promises"
phase: 5
sequence: 3
difficulty: "intermediate"
tags: ["async", "promises"]
prerequisites: ["phase-05/002-microtasks-vs-macrotasks"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

A **promise** is an object that represents a value that may not exist yet. It is always in
one of three states:

- **pending** — the work hasn't finished.
- **fulfilled** — it finished with a value (`resolve(value)`).
- **rejected** — it failed with a reason (`reject(error)`).

A promise settles **once** and never changes again. You read the eventual value by
attaching reactions:

- `.then(onFulfilled, onRejected)` — runs when it fulfills (or rejects).
- `.catch(onRejected)` — shorthand for the rejection path.
- `.finally(fn)` — runs either way, for cleanup.

Each of these returns a **new** promise, so you can **chain**: the value you `return` from
a `.then` becomes the input to the next `.then`, and a thrown error skips ahead to the
nearest `.catch`. Critically, every reaction runs as a **microtask** (kata 2), never
synchronously — so even `Promise.resolve(1).then(...)` defers its callback. Promises are
how the browser models the result of timers, `fetch`, and most async Web APIs.

## Key Insight

> A promise is a one-time settling box for a future value. `.then`/`.catch`/`.finally`
> each return a new promise, so chaining is just data (or an error) flowing through
> microtasks.

## Experiment

```js
// A promise that "fetches" a value after a fake async delay (a macrotask).
function fakeFetch(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), 50));
}

console.log('1 — start (synchronous)');

fakeFetch(10)
  .then((n) => {
    console.log('3 — got', n);
    return n * 2;            // returned value flows to the next .then
  })
  .then((n) => {
    console.log('4 — doubled to', n);
    throw new Error('boom'); // thrown error skips to the nearest .catch
  })
  .then(() => console.log('NOT printed — skipped because of the throw'))
  .catch((err) => console.log('5 — caught:', err.message))
  .finally(() => console.log('6 — cleanup runs no matter what'));

console.log('2 — end (synchronous, runs before any .then)');
```

## Expected Result

The console prints in this order:

```
1 — start (synchronous)
2 — end (synchronous, runs before any .then)
3 — got 10
4 — doubled to 20
5 — caught: boom
6 — cleanup runs no matter what
```

The two synchronous lines (`1`, `2`) print first because reactions never run synchronously.
After the 50 ms timer resolves the promise, the chain runs: the returned value flows from
one `.then` to the next (`10` → `20`), the `throw` skips the next `.then` and lands in
`.catch` (`5`), and `.finally` (`6`) runs regardless.

## Challenge

1. Replace the single `fakeFetch` with `Promise.all([fakeFetch(1), fakeFetch(2),
   fakeFetch(3)])` and log the resulting array. When does it resolve relative to the
   slowest input?
2. Try `Promise.race([...])` and `Promise.any([...])` with mixed resolve/reject timings.
   Describe how `race` (first to *settle*) differs from `any` (first to *fulfill*).
3. Use `Promise.allSettled([...])` with one rejecting input and inspect the
   `{ status, value }` / `{ status, reason }` objects it returns. Why does it never reject?

## Deep Dive

The four combinators cover distinct needs: `Promise.all` fulfills with all values or
rejects on the **first** rejection (fail-fast); `Promise.allSettled` waits for **every**
promise and never rejects, giving you a per-promise status; `Promise.race` settles with the
**first to settle** (fulfill *or* reject); `Promise.any` fulfills with the **first to
fulfill** and only rejects (with an `AggregateError`) if **all** reject. Choosing the right
one is usually the difference between robust and brittle async code.

## Common Mistakes

- Forgetting to `return` inside a `.then`. Without a return the next `.then` receives
  `undefined`, and you lose the chain's value.
- Not handling rejection. An unhandled rejected promise fires the global
  `unhandledrejection` event — always end a chain with `.catch` (or `await` in a `try`).
- Assuming `.then` runs synchronously. Even an already-resolved promise defers its callback
  to a microtask, so synchronous code after it runs first.
</content>
