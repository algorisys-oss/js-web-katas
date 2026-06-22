---
id: "phase-03/005-immutability-and-patterns"
title: "Immutability & Object Patterns"
phase: 3
sequence: 5
difficulty: "advanced"
tags: ["objects", "immutability", "patterns"]
prerequisites: ["phase-03/004-getters-setters-and-proxy"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

Now that you know properties are descriptors, immutability is just descriptor flags applied
in bulk. The platform gives you three levels of locking, each stricter than the last:

- **`Object.preventExtensions(obj)`** — no *new* properties can be added; existing ones
  stay writable and deletable.
- **`Object.seal(obj)`** — prevents extensions **and** sets every property's
  `configurable: false`, so nothing can be added or deleted, but values can still change.
- **`Object.freeze(obj)`** — seals **and** sets every property's `writable: false`, so the
  object is fully read-only.

Crucially, freezing is **shallow**: it locks the object's own properties, but a property
holding *another* object can still have *its* contents mutated. Deep immutability requires
recursing yourself (or a Proxy guard).

Immutability underpins the common object **patterns** of UI work: produce a *new* object
rather than mutating shared state (`{...prev, changed}`), keep configuration objects
frozen so no module accidentally edits them, and use `structuredClone` for genuine deep
copies. State that never mutates in place is far easier to reason about and to compare.

## Key Insight

> `freeze` is **shallow** — it locks the top-level properties, not the objects they point
> to. True immutability means never mutating; produce a new object instead.

## Experiment

```js
const config = Object.freeze({
  theme: 'dark',
  nested: { fontSize: 14 }, // NOT frozen — freeze is shallow
});

console.log('isFrozen:', Object.isFrozen(config));

// Top-level write is rejected (strict mode → throws):
try {
  config.theme = 'light';
} catch (err) {
  console.log('top-level write:', err.name);
}
console.log('theme stays:', config.theme);

// Nested object is still mutable — the shallow trap:
config.nested.fontSize = 99;
console.log('nested changed:', config.nested.fontSize);

// The immutable pattern: derive a NEW object, leave the original alone.
const next = { ...config, theme: 'light' };
console.log('original:', config.theme, '/ derived:', next.theme);

// A genuine deep copy, fully detached from the source:
const clone = structuredClone(config);
clone.nested.fontSize = 7;
console.log('clone:', clone.nested.fontSize, '/ source:', config.nested.fontSize);
```

## Expected Result

The console prints:

```
isFrozen: true
top-level write: TypeError
theme stays: dark
nested changed: 99
original: dark / derived: light
clone: 7 / source: 99
```

Freezing rejects the top-level `theme` write (a `TypeError` in strict mode), but the
**nested** object is untouched by `freeze`, so `fontSize` mutates to `99` — the shallow-
freeze trap. The spread builds a new object, leaving `config` alone. `structuredClone`
deep-copies, so editing `clone.nested` doesn't affect the source (which still reads `99`
from the earlier nested mutation).

## Challenge

1. Write a `deepFreeze(obj)` that recurses over `Object.values` and freezes nested objects.
   Re-run the nested write inside `try/catch` and confirm it now throws.
2. Compare `Object.seal` vs `Object.freeze` on the same object: with a sealed object you
   *can* change `theme` but *cannot* add `newKey`. Demonstrate both outcomes.
3. Build a tiny immutable "update" helper `update(obj, patch)` that returns
   `Object.freeze({ ...obj, ...patch })`, and chain two updates without ever mutating.

## Deep Dive

`structuredClone` is the platform's built-in deep-copy: it handles nested objects, arrays,
`Map`, `Set`, `Date`, typed arrays, and even cyclic references — far more than the old
`JSON.parse(JSON.stringify(x))` hack, which loses functions, `undefined`, `Date` types, and
throws on cycles. It cannot clone functions or DOM nodes, though (it throws). Immutability is
not free — every derived object is a fresh allocation — but in UI code the clarity of "state
in equals state out, nothing mutated underneath me" usually wins, and it's what makes cheap
identity checks (`prev === next`) a reliable signal that nothing changed.

## Common Mistakes

- Believing `Object.freeze` is deep. It locks only own top-level properties; nested objects
  stay mutable until you freeze them too.
- Mutating a frozen object's nested array/object and assuming the freeze protected it.
- Reaching for `JSON.parse(JSON.stringify(x))` to deep-clone — it silently drops functions,
  `undefined`, and special types, and corrupts `Date`s into strings. Prefer
  `structuredClone`.
- Mutating shared state in place when a derived copy (`{...prev, changed}`) would keep the
  original comparable and safe.
