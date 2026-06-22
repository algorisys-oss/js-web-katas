---
id: "phase-04/003-map-set-and-weakmap"
title: "Map, Set & WeakMap"
phase: 4
sequence: 3
difficulty: "intermediate"
tags: ["data-structures", "collections"]
prerequisites: ["phase-04/002-iterators-and-generators"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

Before `Map` and `Set`, developers abused plain objects as lookup tables. That works until
it doesn't: object keys are always coerced to **strings** (so `1` and `'1'` collide,
objects become `"[object Object]"`), the prototype chain leaks accidental keys
(`obj['toString']`), and there's no clean `.size` or ordered iteration.

The collection types fix this:

- **`Map`** — keys can be **any value** (objects, functions, NaN), insertion order is
  preserved, `.size` is O(1), and it's directly iterable (`for...of` yields `[key, value]`
  pairs). Use it whenever keys aren't simple string constants.
- **`Set`** — a collection of **unique** values, ideal for deduplication and membership
  tests (`.has(x)` instead of `array.includes(x)`). Also insertion-ordered and iterable.
- **`WeakMap`** / **`WeakSet`** — keys must be **objects**, and they're held *weakly*: if
  nothing else references a key object, the garbage collector may reclaim it and drop the
  entry. They're **not** iterable and have no `.size`. This makes them the right tool for
  attaching private data to DOM nodes or objects **without leaking memory**.

## Key Insight

> `Map` keys can be anything and keep insertion order; `Set` stores unique values. `WeakMap`
> holds its object keys weakly — so associating data with a DOM node won't keep that node
> alive after it's removed.

## Experiment

```js
// Map: object keys, real ordering, easy size.
const seen = new Map();
const userA = { id: 1 };
const userB = { id: 2 };
seen.set(userA, 'first visit').set(userB, 'second visit');
console.log('map size:', seen.size);
console.log('lookup by object identity:', seen.get(userA));

// Two distinct objects are distinct keys, even with equal contents.
seen.set({ id: 1 }, 'a different object');
console.log('map size after distinct key:', seen.size);

// Set: dedupe an array in one expression (spread an iterable back to an array).
const nums = [1, 2, 2, 3, 3, 3, 1];
const unique = [...new Set(nums)];
console.log('unique:', unique);
console.log('has 3?', new Set(nums).has(3));

// Map is iterable as [key, value] pairs.
const counts = new Map([['a', 1], ['b', 2]]);
for (const [k, v] of counts) console.log(`  ${k} -> ${v}`);

// WeakMap: attach private metadata to an object key, no .size, not iterable.
const meta = new WeakMap();
let node = { tag: 'div' };
meta.set(node, { clicks: 0 });
console.log('weakmap has node?', meta.has(node));
node = null; // the entry is now eligible for garbage collection.
console.log('dropped the only reference to node — entry may be reclaimed.');
```

## Expected Result

The console prints:

```
map size: 2
lookup by object identity: first visit
map size after distinct key: 3
unique: [1, 2, 3]
has 3? true
  a -> 1
  b -> 2
weakmap has node? true
dropped the only reference to node — entry may be reclaimed.
```

Note the third `set` grows the map to `3`, not `2`: `{ id: 1 }` is a *new* object, so it's a
different key from `userA` even though their contents match. Map keys compare by **identity**
(roughly `===`), not by value.

## Challenge

1. Build a word-frequency counter from a sentence using a `Map`: split on spaces and
   `map.set(word, (map.get(word) ?? 0) + 1)`. Log the map.
2. Given two arrays, use `Set` to compute their **intersection** (values in both) with
   `filter` + `has`.
3. Try `weakMap.set('a string', 1)` and read the error. Why must `WeakMap` keys be objects
   and not primitives?

## Deep Dive

A `WeakMap` can't be iterated or counted *because* doing so would let you observe garbage
collection timing, which the spec keeps non-deterministic — exposing it would make GC a
visible side effect. The classic browser use case is a private store: `wm.set(domNode,
state)` keeps per-element state outside the DOM, and when the node is removed and dereferenced,
both the node and its state are collected together — no manual cleanup, no leak. (This is one
mechanism behind framework "fiber" and component-instance bookkeeping.) For ordinary lookups,
prefer `Map` over a plain object whenever keys are dynamic, non-string, or could collide with
prototype names like `constructor`.

## Common Mistakes

- Using `Map` keys expecting *value* equality. `map.get({ id: 1 })` won't find an entry set
  with a different `{ id: 1 }` object — keys match by identity.
- Trying to JSON-serialize a `Map` or `Set` directly: `JSON.stringify(new Map(...))` yields
  `"{}"` because they have no enumerable own properties (covered in kata 005).
- Reaching for `WeakMap` when you need to enumerate entries or know the size — it supports
  neither by design.
- Using an array's `.includes()` for repeated membership checks in a hot loop where a `Set`'s
  `.has()` would be far faster.
