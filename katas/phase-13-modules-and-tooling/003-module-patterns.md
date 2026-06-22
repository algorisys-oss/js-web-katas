---
id: "phase-13/003-module-patterns"
title: "Module Patterns & Encapsulation"
phase: 13
sequence: 3
difficulty: "intermediate"
tags: ["modules"]
prerequisites: ["phase-13/002-dynamic-imports-and-code-splitting"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

Before ES modules existed, JavaScript had **no** built-in way to keep things private — every
top-level `var` in a classic script became a global, and globals collide. Developers invented
patterns using the one tool the language *did* give them: **closures**. Understanding these
patterns matters because (a) you will read them in older and bundled code, and (b) they teach
the principle ESM now enforces — *expose a deliberate surface, hide everything else*.

The building block is the **IIFE** (Immediately Invoked Function Expression): a function that
runs the moment it is defined, creating a private scope. Variables declared inside are
unreachable from outside; only what the function *returns* escapes.

- **IIFE** — `(() => { ... })()` runs once and creates a private scope. The classic way to
  avoid leaking names onto the global object.
- **Revealing Module Pattern** — an IIFE that returns an object whose properties are
  references to selected inner functions, "revealing" a public API while keeping internal
  state and helpers private (via closure).
- **Closure-based factories** — a function that returns an object closing over private
  variables, so each call produces an independent instance with truly private state.

ES modules give you the same encapsulation *for free*: module scope is private by default, and
`export` is the explicit public surface. So in modern code you reach for these patterns mostly
for **per-instance private state** (factories) — module scope is shared, but a factory mints a
fresh closure each call.

## Key Insight

> Encapsulation in JavaScript comes from **closures**: variables a returned function still
> references stay alive and private. A module — IIFE or ESM — is just a deliberate public
> surface over a private scope.

## Experiment

```js
// 1) Revealing module pattern: one shared instance with private state via closure.
const counter = (() => {
  let count = 0;                          // private — no outside access
  const reset = () => { count = 0; };     // private helper

  function increment() { return ++count; }
  function value() { return count; }

  // The returned object is the public API. `count` and `reset` are NOT on it.
  return { increment, value };
})();

console.log('increment:', counter.increment(), counter.increment()); // 1 2
console.log('value:', counter.value());                              // 2
console.log('can outsiders see count?', counter.count);              // undefined

// 2) Factory: each call returns an INDEPENDENT object with its own private state.
function createBankAccount(start = 0) {
  let balance = start;                    // private per instance
  return {
    deposit(n) { balance += n; return balance; },
    withdraw(n) {
      if (n > balance) throw new Error('Insufficient funds');
      balance -= n; return balance;
    },
    get balance() { return balance; },    // read-only view
  };
}

const a = createBankAccount(100);
const b = createBankAccount(0);
console.log('a deposit:', a.deposit(50)); // 150
console.log('b balance:', b.balance);     // 0 — independent instance
console.log('a balance:', a.balance);     // 150
a.balance = 9999;                         // ignored: no setter, balance is private
console.log('a balance after tamper:', a.balance); // still 150
```

## Expected Result

The console prints:

```
increment: 1 2
value: 2
can outsiders see count? undefined
a deposit: 150
b balance: 0
a balance: 150
a balance after tamper: 150
```

The private `count` and `balance` are invisible from outside, each factory call (`a`, `b`)
owns separate state, and assigning to the getter-only `balance` is silently ignored.

## Challenge

1. Rewrite the `counter` revealing module as an ES module using a Blob URL and `import()`
   (kata 1's technique): a module-level `let count` and exported `increment`/`value`. What
   does module scope give you that the IIFE gave you? What does it *not* give you that the
   factory does?
2. Add a private `#`-style equivalent with a real `class` and a `#balance` private field, then
   compare it to the closure factory. When is each more readable?
3. The factory's `balance` getter returns a primitive (safe). Make it return an *object* of
   internal state and show how that accidentally leaks a mutable reference to the private
   data — then fix it by returning a copy.

## Deep Dive

These patterns and ES modules solve the same problem at different layers. A factory creates a
**new closure per call**, so it is the right tool when you need many independent instances each
with private state — something module scope (shared, singleton) cannot give you. A `class` with
`#private` fields is the modern, ergonomic way to get per-instance privacy with a prototype for
method sharing. ES modules handle *file-level* encapsulation and the public/private boundary
between files. In real code you compose them: a module `export`s a factory or class whose
instances use closures or private fields for per-object state. The throughline is closures —
even `#private` fields are conceptually the same "captured, inaccessible" idea, enforced by the
engine instead of by scope.

## Common Mistakes

- Putting per-instance state in **module scope** and expecting instances to be independent —
  module scope is a singleton shared by every importer; use a factory or class for separate
  state.
- Returning an object that exposes a **mutable reference** to private internals (an array or
  object), letting callers mutate "private" state from outside. Return copies or read-only
  views.
- Reaching for IIFEs in new ESM code "for encapsulation." Modules already encapsulate; the
  IIFE adds nothing there. Use factories/classes for *instances*.
- Confusing a getter (`get balance()`) with a writable property. Without a setter, assignment
  is ignored in non-strict and throws in strict mode — it does not silently update.
