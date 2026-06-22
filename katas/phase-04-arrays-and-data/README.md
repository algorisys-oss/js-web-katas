# Phase 4 — Arrays, Iteration & Data

**Ladder rung:** 2 — JavaScript Language Core (the language, not yet the DOM).

## Goal

Get fluent with the data structures and iteration tools you'll use in every component and
data flow. By the end of this phase you can transform arrays declaratively with
`map`/`filter`/`reduce`, understand the iterator protocol that powers `for...of` and spread,
choose `Map`/`Set`/`WeakMap` over abused plain objects, reshape data with destructuring and
spread, and serialize values to JSON knowing exactly what gets lost along the way.

## Why it matters

Frontend code is mostly *moving and reshaping data*: rows from an API into list items, an
event into a state update, in-memory objects into `localStorage` strings. Loops written by
hand and objects abused as maps are where subtle bugs hide — a dropped `undefined`, a `Date`
that silently became a string, a leaked reference keeping a removed DOM node alive. Master the
right tool for each job here and the DOM phases that follow become far cleaner.

## Katas

1. [Array Methods (map / filter / reduce)](./001-array-methods.md) — describe data pipelines
   declaratively instead of mutating inside loops.
2. [Iterators & Generators](./002-iterators-and-generators.md) — the `Symbol.iterator`
   protocol behind `for...of`, and lazy sequences with `function*`.
3. [Map, Set & WeakMap](./003-map-set-and-weakmap.md) — real collections with any-type keys,
   uniqueness, and memory-safe weak references.
4. [Destructuring & Spread](./004-destructuring-and-spread.md) — pattern-match values out and
   make shallow copies with the three dots.
5. [JSON & Serialization](./005-json-and-serialization.md) — `stringify`/`parse`, their lossy
   edge cases, and `structuredClone` for deep copies.

## What's next

Phase 5 — Asynchronous JavaScript: the browser event loop, microtasks vs macrotasks,
promises, `async`/`await`, and cancellation with `AbortController`.
