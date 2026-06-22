---
id: "phase-13/005-polyfills-and-feature-detection"
title: "Polyfills & Feature Detection"
phase: 13
sequence: 5
difficulty: "advanced"
tags: ["modules", "tooling", "compatibility"]
prerequisites: ["phase-13/004-bundlers-and-the-build-step"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

The web has no single "version" — your code runs across a moving spread of browsers, each
shipping new APIs at different times. Two distinct tools handle that gap, and confusing them
causes real bugs:

- **Feature detection** asks, at runtime, "does *this* browser have the capability I need?"
  You test the **feature**, never the user-agent string. Browser-sniffing (`navigator.userAgent`)
  is brittle and lies; capability checks are honest.
- **A polyfill** *provides* a missing feature by implementing it in JavaScript and installing
  it where the native one would be — but **only when it is absent** (the guard). Loaded
  unconditionally, it would overwrite the (faster, correct) native implementation.

The pattern is always: **detect, then conditionally polyfill**. The check shapes are simple and
worth memorizing — `'name' in object` for a property, `typeof fn === 'function'` for a global,
and `'method' in Constructor.prototype` for a prototype method. Pair detection with a graceful
fallback when *no* polyfill is reasonable (e.g. skip an `IntersectionObserver`-based lazy-load
and just load everything).

This is genuinely runnable in the browser — no build step needed. (At scale, tools like
`core-js` plus a `browserslist` config let a build inject only the polyfills your target
browsers actually lack, so modern users download none.)

## Key Insight

> **Detect the feature, then polyfill only if missing.** Test capabilities, never the
> user-agent string — and never clobber a native implementation that's already there.

## Experiment

```js
// 1) Feature detection — three canonical shapes. (Modern browsers have all of these,
//    so expect `true`; the point is the *check*, not the result.)
console.log("'IntersectionObserver' in window:", 'IntersectionObserver' in window);
console.log("'at' on Array.prototype:", 'at' in Array.prototype);
console.log("structuredClone is a function:", typeof structuredClone === 'function');

// 2) A real (tiny) polyfill WITH A GUARD. Array.prototype.at(i) supports negative indices.
//    Only install it if the native method is missing — never overwrite the real one.
if (typeof Array.prototype.at !== 'function') {
  Object.defineProperty(Array.prototype, 'at', {
    value: function at(n) {
      n = Math.trunc(n) || 0;
      if (n < 0) n += this.length;          // negative index counts from the end
      return (n < 0 || n >= this.length) ? undefined : this[n];
    },
    writable: true, configurable: true, enumerable: false, // match built-in descriptor
  });
  console.log('Polyfill installed: Array.prototype.at');
} else {
  console.log('Native Array.prototype.at present — polyfill skipped.');
}

// The call works either way: native or polyfilled.
console.log("[10, 20, 30].at(-1):", [10, 20, 30].at(-1)); // 30

// 3) Graceful fallback when polyfilling isn't worth it.
if ('IntersectionObserver' in window) {
  console.log('Would lazy-load images via IntersectionObserver.');
} else {
  console.log('No IntersectionObserver — fall back to loading all images eagerly.');
}
```

## Expected Result

In a modern browser the console prints (the `at` polyfill branch is skipped):

```
'IntersectionObserver' in window: true
'at' on Array.prototype: true
structuredClone is a function: true
Native Array.prototype.at present — polyfill skipped.
[10, 20, 30].at(-1): 30
Would lazy-load images via IntersectionObserver.
```

The `.at(-1)` call returns `30` whether it ran natively or through the polyfill — that
interchangeability is the whole point of a polyfill.

## Challenge

1. Force the polyfill branch to run: before the `if`, do
   `delete Array.prototype.at;` then re-run. Confirm the `Polyfill installed` message appears
   and `.at(-1)` still returns `30`. Why must the polyfill set `enumerable: false`?
2. Write a feature-detected wrapper `clone(value)` that uses `structuredClone` when available
   and falls back to `JSON.parse(JSON.stringify(value))` otherwise. Note one thing the JSON
   fallback gets *wrong* (e.g. `Date`, `Map`, circular references).
3. Explain why `if (window.IntersectionObserver)` and `if ('IntersectionObserver' in window)`
   are *almost* equivalent, and construct a case where the truthiness check could mislead you
   (hint: a feature that legitimately exists but holds a falsy value).

## Deep Dive

A **polyfill** backfills a *standard* API so old browsers behave like new ones, while a *shim*
or *ponyfill* offers the same capability under a different name without touching globals — safer
because it never risks clobbering or conflicting. Detection should be as close to the real
capability as possible: testing `'flat' in Array.prototype` is honest, but some features need a
*functional* probe (actually call the API in a `try/catch`) because a browser may expose a name
yet implement it incorrectly. At build scale, `core-js` plus a `browserslist` target lets your
bundler inject only the polyfills your *oldest* supported browser lacks — modern users download
zero polyfill bytes. The discipline is the same whether hand-rolled or automated: detect the
real capability, install only when missing, and degrade gracefully when neither native support
nor a polyfill is worthwhile.

## Common Mistakes

- **Browser-sniffing** with `navigator.userAgent` instead of detecting the feature. UA strings
  are spoofed, frozen, and lie about capabilities; they rot the moment a browser updates.
- Loading a polyfill **unconditionally**, overwriting a correct native implementation with a
  slower (or subtly wrong) JS version. Always guard with a detection check.
- Assuming a name's *presence* means it works correctly. Some buggy implementations expose the
  API surface but misbehave — use a functional probe when correctness matters.
- Polyfilling a prototype method as an **enumerable** property, which then leaks into
  `for...in` loops over arrays/objects. Built-ins are non-enumerable; match that with
  `Object.defineProperty` and `enumerable: false`.
