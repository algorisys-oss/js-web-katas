---
id: "phase-03/001-objects-and-property-descriptors"
title: "Objects & Property Descriptors"
phase: 3
sequence: 1
difficulty: "beginner"
tags: ["objects", "descriptors"]
prerequisites: ["phase-02/005-currying-and-composition"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

An object property is more than a name pointing at a value. Under the hood every property
carries a **descriptor** — a small record of metadata the engine consults on every read
and write. There are two kinds:

- A **data descriptor** has `value`, plus three flags:
  - `writable` — can the value be reassigned?
  - `enumerable` — does it show up in `for…in` and `Object.keys`?
  - `configurable` — can the descriptor be changed or the property deleted?
- An **accessor descriptor** has `get` / `set` functions instead of `value` (next kata
  covers those).

When you write `obj.x = 1`, the engine creates a data descriptor with all three flags set
to `true`. But you can create properties with different flags using
`Object.defineProperty`, which is how the platform builds read-only, hidden, or locked
properties — the same mechanism the browser uses for built-in DOM properties.

Understanding descriptors is the foundation for the rest of this phase: immutability,
getters/setters, and how the prototype chain resolves reads all hinge on them.

## Key Insight

> Every property is a descriptor, not just a value. `obj.x = 1` is shorthand for a data
> descriptor with `writable`, `enumerable`, and `configurable` all `true`.

## Experiment

```js
// Default assignment vs. an explicit descriptor.
const user = {};
user.name = 'Ada'; // shorthand: all flags true

Object.defineProperty(user, 'id', {
  value: 42,
  writable: false,     // read-only
  enumerable: false,   // hidden from Object.keys / for…in
  configurable: false, // can't be deleted or reconfigured
});

console.log('name descriptor:', Object.getOwnPropertyDescriptor(user, 'name'));
console.log('id descriptor:', Object.getOwnPropertyDescriptor(user, 'id'));

// enumerable: false hides `id` from key enumeration:
console.log('keys:', Object.keys(user));

// writable: false rejects the write. Modules are strict, so it throws:
try {
  user.id = 999;
} catch (err) {
  console.log('write rejected:', err.name);
}
console.log('id after write attempt:', user.id);
```

## Expected Result

The console prints:

```
name descriptor: { value: "Ada", writable: true, enumerable: true, configurable: true }
id descriptor: { value: 42, writable: false, enumerable: false, configurable: false }
keys: ["name"]
write rejected: TypeError
id after write attempt: 42
```

`name` got all flags `true` from the shorthand assignment. `id` is read-only, hidden, and
locked. Because modules run in strict mode, the write to a non-writable property throws a
`TypeError` instead of failing silently — and the value stays `42`.

## Challenge

1. Log `err.message` (not just `err.name`) for the rejected write. Notice how the message
   names the exact property that could not be assigned.
2. Define a property with `configurable: false`, then try to `delete` it and re-run
   `Object.defineProperty` on it. Observe both failures.
3. Use `Object.defineProperties` to define several properties at once, then dump them all
   with `Object.getOwnPropertyDescriptors`.

## Deep Dive

`Object.keys`, `for…in`, `JSON.stringify`, and spread (`{...obj}`) all skip
non-enumerable properties — which is exactly why so many built-in methods live on
prototypes as non-enumerable: you don't want `toString` showing up when you iterate your
data. The `enumerable` flag is the platform's switch between "this is data" and "this is
machinery." When you build your own objects, hiding internal bookkeeping behind
`enumerable: false` keeps serialization and iteration clean.

## Common Mistakes

- Assuming all properties are writable and enumerable — properties created via
  `defineProperty` default every flag to `false`.
- Forgetting that `for…in` walks the prototype chain *and* skips non-enumerable
  properties, while `Object.keys` only returns own enumerable keys.
- Treating a silent failed write as success. In strict mode (every module) it throws; rely
  on that to catch bugs.
- Expecting `delete` to work on a `configurable: false` property — it cannot be removed.
