---
id: "phase-02/004-higher-order-functions"
title: "Higher-Order Functions"
phase: 2
sequence: 4
difficulty: "intermediate"
tags: ["functions", "higher-order", "callbacks"]
prerequisites: ["phase-02/003-the-this-binding"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

In JavaScript, functions are **values**. You can store one in a variable, put it in an
array, pass it as an argument, and return it from another function — exactly like a number
or string. A **higher-order function** is simply a function that does one or both of these:
it **takes a function as an argument**, or it **returns a function**.

You already use them constantly in the browser:

- `array.map`, `filter`, `reduce`, `forEach`, and `sort` take a function and call it for you.
- `addEventListener(type, handler)` takes a function to run on each event (Phase 7).
- `setTimeout(callback, ms)` takes a function to run later.

The functions you pass in are **callbacks** — the higher-order function decides *when* and
*with what arguments* to call them. This inversion ("don't call us, we'll call you") is how
the platform stays in control of timing, iteration, and events while still running your code.

Treating functions as data lets you write small, reusable transformations and compose them,
instead of copy-pasting loops. It's the foundation for the currying and composition in kata 5.

## Key Insight

> A higher-order function takes or returns a function. Functions are values — that's what
> makes `map`, `filter`, event handlers, and `setTimeout` possible.

## Experiment

```js
const nums = [1, 2, 3, 4, 5];

// `map`, `filter`, `reduce` are higher-order: each takes a callback.
const doubled = nums.map((n) => n * 2);
const evens = nums.filter((n) => n % 2 === 0);
const total = nums.reduce((sum, n) => sum + n, 0);

console.log('doubled →', doubled);
console.log('evens →', evens);
console.log('total →', total);

// A higher-order function that RETURNS a function (a closure carrying `factor`).
function multiplyBy(factor) {
  return (n) => n * factor;
}
const triple = multiplyBy(3);
console.log('triple(10) →', triple(10));

// A higher-order function that TAKES a function: run something n times.
function repeat(times, action) {
  for (let i = 0; i < times; i++) action(i);
}
const collected = [];
repeat(3, (i) => collected.push(`run ${i}`));
console.log('repeat →', collected);

// Functions as data: pick a strategy from a table at runtime.
const ops = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
};
console.log('ops.add(2, 5) →', ops.add(2, 5));
```

## Expected Result

The **console** prints, in order:

```
doubled → [2, 4, 6, 8, 10]
evens → [2, 4]
total → 15
triple(10) → 30
repeat → ['run 0', 'run 1', 'run 2']
ops.add(2, 5) → 7
```

`map` builds a new array by calling the callback per element; `filter` keeps only the
elements for which it returns truthy; `reduce` folds the array into a single value.
`multiplyBy(3)` returns a closure that remembers `factor === 3`, so `triple(10)` is `30`.

## Challenge

1. Write your own `myMap(array, fn)` from scratch using a `for` loop, returning a new array.
   Confirm it matches the built-in `map` for `nums`. Why should it *not* mutate the input?
2. Write `compose2(f, g)` that returns a function computing `f(g(x))`. Use it to build
   "double then add one" and apply it to `5`.
3. Pass each `ops` function to `reduce` to combine an array of numbers, then swap the
   operation without touching the loop — showing functions-as-data in action.

## Deep Dive

The callback contract is precise: the higher-order function decides the **arguments** it
passes. `map`'s callback receives `(element, index, array)`, not just the element — which is
why `['1','2','3'].map(parseInt)` famously misbehaves (it passes the index as `parseInt`'s
radix). When you write a higher-order function, document exactly what arguments your callback
receives and in what order; when you consume one, check the signature before assuming it only
passes the value you care about.

## Common Mistakes

- Calling the function instead of passing it: `setTimeout(doWork(), 1000)` runs `doWork`
  *now* and schedules its return value. Pass `doWork` (or `() => doWork()`).
- Forgetting that array callbacks receive extra arguments (`index`, `array`), causing bugs
  like `arr.map(parseInt)`.
- Mutating the input array inside a `map`/`filter`/`reduce` callback — these are meant to
  produce new values, not change the source.
- Writing a deep `for` loop where a single `map`/`filter`/`reduce` would read more clearly.
