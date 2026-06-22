---
id: "phase-02/002-closures"
title: "Closures"
phase: 2
sequence: 2
difficulty: "intermediate"
tags: ["functions", "closures", "scope"]
prerequisites: ["phase-02/001-declarations-vs-expressions"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

A **closure** is the combination of a function and the scope it was *defined in*. When you
create a function inside another function, the inner function keeps a live link to the
outer function's variables — even after the outer function has returned. Those variables
don't disappear; they stay alive as long as something can still reach them.

This is the engine of most stateful patterns in the browser:

- An event listener that remembers a value from when it was set up.
- A `setTimeout` callback that reads variables from where it was scheduled.
- A factory that returns a function carrying private, hidden state.

The crucial detail: a closure captures **variables, not values**. It sees the variable's
*current* value when it runs, not a snapshot from when it was created. This is why a loop
with `var` and a delayed callback famously prints the wrong number — and why `let`, which
creates a fresh binding per iteration, fixes it.

Closures are how you get **private state** without a class: the only way to read or change
the captured variable is through the functions you deliberately return.

## Key Insight

> A closure captures the **variable**, not a copy of its value. It reads whatever that
> variable holds at call time — which is why `let` (a fresh binding per loop) behaves
> differently from `var` (one shared binding).

## Experiment

```js
// 1. A counter factory: `count` is private — reachable only through the returned function.
function makeCounter() {
  let count = 0;             // lives on as long as the returned closure exists
  return function () {
    count += 1;
    return count;
  };
}

const next = makeCounter();
console.log('next() →', next()); // 1
console.log('next() →', next()); // 2
console.log('next() →', next()); // 3

// A second counter has its OWN independent `count`.
const other = makeCounter();
console.log('other() →', other()); // 1 — not 4

// 2. The classic loop trap: var shares ONE binding; let makes a fresh one per iteration.
const withVar = [];
for (var i = 0; i < 3; i++) {
  withVar.push(() => i); // all close over the SAME i
}
console.log('var closures →', withVar.map((fn) => fn())); // [3, 3, 3]

const withLet = [];
for (let j = 0; j < 3; j++) {
  withLet.push(() => j); // each closes over its OWN j
}
console.log('let closures →', withLet.map((fn) => fn())); // [0, 1, 2]
```

## Expected Result

The **console** prints, in order:

```
next() → 1
next() → 2
next() → 3
other() → 1
var closures → [3, 3, 3]
let closures → [0, 1, 2]
```

Each `makeCounter()` call creates a separate `count`, so `next` and `other` don't interfere.
The `var` loop produces `[3, 3, 3]` because all three closures share the *same* `i`, which
ends at `3`; the `let` loop produces `[0, 1, 2]` because each iteration gets a fresh binding.

## Challenge

1. Extend `makeCounter` to accept a starting value and return an object with `increment`,
   `decrement`, and `value` methods, all sharing the same private `count`. This is the
   "module pattern."
2. Fix the `var` loop *without* changing `var` to `let`: wrap the body in an IIFE
   (`(function (captured) { ... })(i)`) so each iteration captures its own value. Explain why
   this works.
3. Schedule three `setTimeout(() => console.log(k), 0)` calls inside a `var` loop, then a
   `let` loop. Predict each output before running.

## Deep Dive

Closures are also the main source of memory that *should* have been freed but wasn't. If a
DOM event listener closes over a large object, that object can't be garbage-collected until
the listener is removed — even if the element is gone from the page. The fix is to call
`removeEventListener` (or use `AbortController`, Phase 5) when you're done. The same scope
rule that gives you private state also keeps captured data alive, so be deliberate about
what your closures hold onto.

## Common Mistakes

- Believing a closure captures a *snapshot* of a value. It captures the live variable and
  reads its current value when it runs.
- Using `var` in a loop that schedules callbacks and expecting per-iteration values — use
  `let`, or capture the value explicitly.
- Forgetting that each call to a factory creates *new* independent variables, then being
  surprised two counters share nothing.
- Leaking memory by leaving listeners (and the large objects they close over) attached after
  the element is removed.
