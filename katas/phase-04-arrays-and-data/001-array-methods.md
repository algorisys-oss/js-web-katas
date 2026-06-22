---
id: "phase-04/001-array-methods"
title: "Array Methods (map / filter / reduce)"
phase: 4
sequence: 1
difficulty: "beginner"
tags: ["arrays", "iteration"]
prerequisites: ["phase-03/005-immutability-and-patterns"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

Arrays are the workhorse data structure of frontend code: lists of DOM nodes, rows from
an API, points on a chart. The language gives you a family of **higher-order array
methods** that take a callback and let you describe *what* you want instead of writing
manual `for` loops.

Three of them form the backbone of almost all data transformation:

- **`map(fn)`** — returns a **new** array of the same length, each item transformed by
  `fn`. One in, one out.
- **`filter(fn)`** — returns a **new** array containing only items for which `fn` returns
  a truthy value. Same items, fewer of them.
- **`reduce(fn, initial)`** — collapses the whole array into a **single value** (a number,
  an object, even another array) by threading an *accumulator* through every element.

The first two are non-mutating: they leave the original array untouched and hand you a
fresh one — the immutability habit from Phase 3 carries straight over. `reduce` is the most
general of the three; you can express `map` and `filter` in terms of `reduce`, but rarely
should.

## Key Insight

> `map` transforms, `filter` selects, `reduce` accumulates. Chain them to describe a data
> pipeline declaratively instead of mutating an array inside a loop.

## Experiment

```js
const orders = [
  { item: 'keyboard', price: 80, paid: true },
  { item: 'mouse', price: 25, paid: false },
  { item: 'monitor', price: 200, paid: true },
  { item: 'cable', price: 10, paid: true },
];

// map: one transformed value per input item.
const labels = orders.map((o) => `${o.item} ($${o.price})`);
console.log('labels:', labels);

// filter: keep only the paid orders.
const paid = orders.filter((o) => o.paid);
console.log('paid count:', paid.length);

// reduce: thread a running total (the accumulator) through the array.
const total = paid.reduce((sum, o) => sum + o.price, 0);
console.log('paid total:', total);

// Chain them: a pipeline reads top-to-bottom as a sentence.
const expensivePaidItems = orders
  .filter((o) => o.paid)
  .filter((o) => o.price >= 50)
  .map((o) => o.item);
console.log('expensive & paid:', expensivePaidItems);

// The original array is untouched.
console.log('orders still length:', orders.length);
```

## Expected Result

The console prints:

```
labels: ["keyboard ($80)", "mouse ($25)", "monitor ($200)", "cable ($10)"]
paid count: 3
paid total: 290
expensive & paid: ["keyboard", "monitor"]
orders still length: 4
```

`reduce` starts the accumulator at the `initial` value (`0`) and adds each paid price:
`0 + 80 + 200 + 10 = 290`. `map` and `filter` each returned new arrays, so `orders` is
still the original four items.

## Challenge

1. Rewrite the `paid total` using a single `reduce` over `orders` (no `filter`): add the
   price only when `o.paid` is true. Confirm you still get `290`.
2. Use `reduce` to build an **object** grouping items by `paid`/`unpaid` — start the
   accumulator at `{ paid: [], unpaid: [] }`. This is the "group by" pattern.
3. Call `reduce` with **no** initial value on an empty array (`[].reduce((a, b) => a + b)`)
   and read the error. Why does an initial value matter?

## Deep Dive

These methods skip *holes* in sparse arrays but visit every defined index, and the callback
receives `(value, index, array)` — the extra arguments are handy but a common source of
bugs when you pass them a function like `parseInt` that takes a second `radix` argument
(`['1','2','3'].map(parseInt)` is famously broken). For large arrays, remember each `map`
or `filter` in a chain allocates a new array and walks the data again; that is fine for UI
lists but worth collapsing into one `reduce` when you are processing tens of thousands of
items in a hot path. Related selectors — `find`, `some`, `every`, `flatMap` — round out the
toolkit and short-circuit where it makes sense.

## Common Mistakes

- Using `map` when you don't use the returned array — reach for `forEach` (or a `for` loop)
  for pure side effects, and `map` only when you want the transformed array.
- Forgetting to `return` from the callback. An arrow with a block body (`(x) => { x * 2 }`)
  returns `undefined`, so `map` yields an array of `undefined`.
- Omitting `reduce`'s initial value, which makes the first element the seed and throws on an
  empty array.
- Expecting `map`/`filter` to mutate in place. They return new arrays; the original is
  unchanged.
