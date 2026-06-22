---
id: "phase-05/004-async-await"
title: "async / await"
phase: 5
sequence: 4
difficulty: "intermediate"
tags: ["async", "promises", "async-await"]
prerequisites: ["phase-05/003-promises"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

`async`/`await` is **syntactic sugar over promises** — it does not change the event-loop
rules, it just makes promise code read like sequential code.

- An `async` function **always returns a promise**. A `return value` fulfills it with
  `value`; a `throw` rejects it.
- `await promise` pauses the function until the promise settles, then resumes with its
  fulfilled value — or throws its rejection reason, which you catch with ordinary
  `try`/`catch`.

The subtle part is *how* it pauses. `await` does **not** block the thread. When you hit an
`await`, the function returns control to the event loop, and the code *after* the `await`
is scheduled as a **microtask** that runs when the awaited promise settles (kata 2). So
synchronous code that follows the function call runs **before** the post-`await` lines.
Because this playground runs your code as a module, you can even use `await` at the **top
level**.

## Key Insight

> `await` doesn't block — it splits the function in two: everything after an `await`
> becomes a microtask that resumes when the awaited promise settles.

## Experiment

```js
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function run() {
  console.log('2 — inside run, before await (still synchronous)');
  const a = await delay(30, 'A');     // function pauses here; control returns to caller
  console.log('4 — resumed after await, got', a);
  const b = await delay(30, 'B');
  console.log('5 — got', b);
  return `${a}${b}`;
}

console.log('1 — start');
run().then((result) => console.log('6 — run() resolved with', result));
console.log('3 — after calling run() (runs before the post-await code)');
```

## Expected Result

The console prints in this order:

```
1 — start
2 — inside run, before await (still synchronous)
3 — after calling run() (runs before the post-await code)
4 — resumed after await, got A
5 — got B
6 — run() resolved with AB
```

Calling `run()` executes synchronously **up to the first `await`** — so `2` prints
immediately, in line with `1`. At the `await`, `run` hands control back, so `3` (the
synchronous line after the call) runs **next**. Only after each timer settles do the
post-`await` continuations resume (`4`, `5`), and finally the `async` function's returned
promise fulfills, firing its `.then` (`6`).

## Challenge

1. The two `delay` calls run **sequentially** (~60 ms total) because each `await` waits for
   the previous one. Rewrite with `await Promise.all([delay(30,'A'), delay(30,'B')])` so
   they overlap (~30 ms total). When is sequential actually correct?
2. Make `delay` reject (use `reject` instead of `resolve`) and wrap the `await` in a
   `try`/`catch`. Confirm the rejection becomes a thrown error you can catch.
3. At the top level of the module (outside any function), write `const x = await delay(10,
   'top-level'); console.log(x);` and confirm top-level `await` works here.

## Deep Dive

`async`/`await` compiles to a promise state machine: each `await` is roughly a `.then`
whose callback resumes the rest of the function. That equivalence is why the ordering
matches the promise rules exactly, and why an un-awaited async call still runs — it just
runs as a detached promise whose rejection you won't catch (a "floating" promise). A common
performance bug is `await`-ing in a loop when the iterations are independent; gathering them
with `Promise.all` and awaiting once is usually far faster.

## Common Mistakes

- `await`-ing independent operations one after another in a loop, serializing work that
  could overlap. Use `Promise.all` when order doesn't matter.
- Forgetting an `async` function returns a **promise** — a caller that ignores it (no
  `await`, no `.then`) won't see errors or wait for completion.
- Believing `await` blocks the thread. It yields to the event loop; other tasks and
  microtasks run while it's "paused."
</content>
