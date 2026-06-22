# Phase 3 — Objects, Prototypes & Classes

**Ladder rung:** 2 — JavaScript Language Core (the object model beneath everything).

## Goal

Understand how JavaScript objects actually work — not as bags of key/value pairs, but as
descriptor-backed properties linked together by the prototype chain. By the end of this
phase you can explain what a property descriptor controls, how reads and writes resolve
through prototypes, how `class` desugars to that same chain, how to intercept property
access with getters/setters and `Proxy`, and how to lock objects down for predictable,
immutable state.

## Why it matters

Every object you touch in the browser — a DOM node, a `Response`, your own app state — is
governed by these rules. "Why didn't my write take effect," "why is this method shared,"
"why did freezing not protect my nested data," "how do reactive frameworks track changes"
all trace back to descriptors, prototypes, and the access traps in this phase. Get the
object model right and the DOM, data, and state phases ahead become far less mysterious.

## Katas

1. [Objects & Property Descriptors](./001-objects-and-property-descriptors.md) — every
   property is a descriptor with `writable`/`enumerable`/`configurable` flags.
2. [The Prototype Chain](./002-the-prototype-chain.md) — reads walk up the chain; writes
   create own properties that shadow.
3. [Classes & Inheritance](./003-classes-and-inheritance.md) — `class`, `extends`, and
   `super` as syntax over the prototype chain.
4. [Getters, Setters & Proxy](./004-getters-setters-and-proxy.md) — intercepting one
   property with accessors, or every operation with a `Proxy`.
5. [Immutability & Object Patterns](./005-immutability-and-patterns.md) — `freeze`/`seal`,
   shallow vs deep, and deriving new state instead of mutating.

## What's next

Phase 4 — Arrays, Iteration & Data: array methods, iterators & generators, `Map`/`Set`/
`WeakMap`, destructuring & spread, and JSON & serialization.
