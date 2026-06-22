# Phase 2 — Functions & Closures

**Ladder rung:** 2 — JavaScript Language Core (functions are the language's core abstraction).

## Goal

Master functions as JavaScript's central building block: how they're defined and hoisted, how
they capture scope through closures, how `this` is decided at the call site, and how treating
functions as values unlocks higher-order patterns, currying, and composition. By the end you
can predict what's callable where, reason about captured state, and combine small functions
into larger ones with confidence.

## Why it matters

Almost every browser API hands you a function to run later — event listeners, `setTimeout`,
`map`, `fetch().then()`. If you don't have a solid model of scope, closures, and `this`, those
callbacks become a source of subtle bugs: a handler that captures the wrong variable, a method
that loses `this`, a listener that leaks memory. Get functions right here and the DOM, events,
and async phases that follow build cleanly on top.

## Katas

1. [Function Declarations vs Expressions](./001-declarations-vs-expressions.md) — hoisting, the
   temporal dead zone, and named function expressions.
2. [Closures](./002-closures.md) — capturing variables (not values), private state, and the
   `var`/`let` loop trap.
3. [The this Binding](./003-the-this-binding.md) — `new`, explicit, method, and default binding,
   plus arrow functions' lexical `this`.
4. [Higher-Order Functions](./004-higher-order-functions.md) — functions as values, callbacks,
   and `map`/`filter`/`reduce`.
5. [Currying & Composition](./005-currying-and-composition.md) — partial application and piping
   small functions into bigger ones.

## What's next

Phase 3 — Objects, Prototypes & Classes: property descriptors, the prototype chain, classes and
inheritance, getters/setters/`Proxy`, and immutability.
