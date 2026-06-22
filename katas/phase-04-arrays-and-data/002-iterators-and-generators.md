---
id: "phase-04/002-iterators-and-generators"
title: "Iterators & Generators"
phase: 4
sequence: 2
difficulty: "intermediate"
tags: ["iteration", "generators"]
prerequisites: ["phase-04/001-array-methods"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

`for...of`, spread (`...`), destructuring, and `Array.from` all look like array features,
but they actually work on anything **iterable** — and "iterable" is a *protocol*, not a
type. An object is iterable if it has a method keyed by the well-known symbol
`Symbol.iterator` that returns an **iterator**: an object with a `next()` method producing
`{ value, done }` records until `done` is `true`.

This is why a `String`, a `Map`, a `Set`, and a `NodeList` (the result of
`document.querySelectorAll`) can all be spread or looped, even though only one of them is an
array. They each implement the protocol.

Writing iterators by hand is tedious, so the language gives you **generator functions**
(`function*`). A generator returns an iterator automatically, and each `yield` hands a value
to the consumer and *pauses* the function until `next()` is called again. This makes
generators **lazy**: they compute values on demand, so you can describe infinite sequences
or expensive streams without building the whole list up front.

## Key Insight

> Iterable is a protocol (`Symbol.iterator`), not a type — that's why `for...of` works on
> strings, Sets, and DOM lists. Generators (`function*` + `yield`) build iterators lazily,
> one value at a time.

## Experiment

```js
// A NodeList and a String are iterable without being arrays.
console.log('spread a string:', [...'abc']);

// A generator: each yield pauses until the consumer asks for more.
function* countTo(n) {
  for (let i = 1; i <= n; i++) {
    console.log(`  ...computing ${i}`);
    yield i;
  }
}

console.log('Pull values one at a time:');
const it = countTo(3);
console.log('next():', it.next()); // { value: 1, done: false }
console.log('next():', it.next()); // { value: 2, done: false }

// for...of drives the iterator to completion.
console.log('for...of over the rest:');
for (const n of countTo(2)) {
  console.log('  got', n);
}

// Laziness lets us model an infinite sequence and take only what we need.
function* naturals() {
  let i = 0;
  while (true) yield ++i;
}
const gen = naturals();
const firstThree = [gen.next().value, gen.next().value, gen.next().value];
console.log('first three naturals:', firstThree);
```

## Expected Result

The console prints (note how "computing" interleaves with each pull, proving laziness):

```
spread a string: ["a", "b", "c"]
Pull values one at a time:
  ...computing 1
next(): { value: 1, done: false }
  ...computing 2
next(): { value: 2, done: false }
for...of over the rest:
  ...computing 1
  got 1
  ...computing 2
  got 2
got... (loop ends when done: true)
first three naturals: [1, 2, 3]
```

The `naturals()` generator loops `while (true)` yet never hangs, because `yield` pauses it
between pulls — we only ever asked for three values.

## Challenge

1. Make a plain object iterable by adding a `[Symbol.iterator]()` method that yields its
   values, then `console.log([...yourObject])`.
2. Write a generator `take(iterable, n)` that yields at most `n` values from any iterable,
   and use it on `naturals()` to get the first five.
3. Generators can *receive* values: log what `it.next('hello')` does when the function body
   uses `const reply = yield;`. Where does `'hello'` land?

## Deep Dive

The for-of loop, spread, and destructuring all call `[Symbol.iterator]()` under the hood,
then loop on `next()` until `done`. Generators also support `yield*` to delegate to another
iterable (flattening composition) and an async variant (`async function*` + `for await...of`)
for streaming data such as a `fetch` response body — you'll meet that in Phase 11. The key
mental model: an iterator is a *cursor* with state, and a generator is the most ergonomic
way to write one because the engine saves and restores the function's execution context at
each `yield`.

## Common Mistakes

- Assuming `for...of` works on plain objects. Objects are **not** iterable by default — use
  `Object.keys/values/entries`, or `for...in` (which walks keys, including inherited ones).
- Calling a generator function and expecting it to run. `countTo(3)` runs **nothing** until
  you pull with `next()` or iterate it.
- Treating an iterator as reusable. Once it's exhausted (`done: true`), it stays done — call
  the generator again to get a fresh iterator.
- Confusing `for...in` (keys/indices) with `for...of` (values). On an array, `for...in`
  yields string indices, not elements.
