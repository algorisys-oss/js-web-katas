---
id: "phase-03/002-the-prototype-chain"
title: "The Prototype Chain"
phase: 3
sequence: 2
difficulty: "intermediate"
tags: ["objects", "prototypes"]
prerequisites: ["phase-03/001-objects-and-property-descriptors"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

JavaScript has no classes at its core — it has **objects linked to other objects**. Every
object has a hidden internal link, `[[Prototype]]`, pointing at another object (or `null`).
When you read `obj.foo`, the engine:

1. Looks for an **own** property `foo` on `obj`.
2. If absent, follows `[[Prototype]]` to the next object and looks there.
3. Repeats up the **chain** until it finds `foo` or reaches `null` (then `undefined`).

This is **delegation**: an object doesn't *copy* shared behavior, it *borrows* it by
walking the chain at read time. That's why every array can call `.map` — the method lives
once on `Array.prototype`, and every array delegates to it.

You can read the link with `Object.getPrototypeOf(obj)` and create an object with a chosen
link using `Object.create(proto)`. The legacy `__proto__` accessor exposes the same link
but is discouraged for code. Writes behave differently from reads: assigning `obj.foo = x`
creates an **own** property on `obj` and never walks up the chain — it can *shadow* an
inherited one.

## Key Insight

> Reads walk **up** the prototype chain until they find the property or hit `null`. Writes
> always create an **own** property on the target object, shadowing anything inherited.

## Experiment

```js
// A base object with shared behavior.
const animal = {
  describe() {
    return `${this.name} is a ${this.kind}`;
  },
};

// `dog` delegates to `animal` via its prototype link.
const dog = Object.create(animal);
dog.name = 'Rex';
dog.kind = 'dog';

console.log('describe():', dog.describe());          // method found on `animal`
console.log("owns 'describe'?", dog.hasOwnProperty('describe'));
console.log('proto is animal?', Object.getPrototypeOf(dog) === animal);

// Writing shadows, it does not modify the prototype:
dog.describe = () => 'shadowed!';
console.log('after shadow:', dog.describe());
console.log('animal untouched:', animal.describe.call({ name: 'Cat', kind: 'cat' }));

// The chain ends at Object.prototype, then null:
console.log('end of chain:', Object.getPrototypeOf(Object.prototype));
```

## Expected Result

The console prints:

```
describe(): Rex is a dog
owns 'describe'? false
proto is animal? true
after shadow: shadowed!
animal untouched: Cat is a cat
end of chain: null
```

`dog` has no own `describe`, so the first call resolves it on `animal` (with `this` bound
to `dog`). After `dog.describe = ...`, an **own** property shadows the inherited one, but
`animal.describe` is untouched. Walking up from `dog`: `dog` → `animal` →
`Object.prototype` → `null`.

## Challenge

1. Add `Object.create(dog)` to make a third level (`puppy`). Confirm `puppy.describe()`
   still resolves — through two hops — and that `this` is the `puppy`.
2. Use `Object.create(null)` to make a "bare" object with no prototype. Try calling
   `.hasOwnProperty` on it and explain the error.
3. Log `Object.getPrototypeOf([]) === Array.prototype` and
   `Object.getPrototypeOf(Array.prototype) === Object.prototype`. Trace the array chain.

## Deep Dive

`this` is resolved at **call time**, not where the method is defined. When `dog.describe()`
runs, the method lives on `animal` but `this` is `dog`, because `this` binds to whatever is
left of the dot. This is the whole trick behind prototypal delegation: shared methods on a
prototype operate on the *caller's* data. Avoid `Object.setPrototypeOf` on existing objects
in hot paths — engines optimize objects by their fixed "shape," and mutating the prototype
forces a costly de-optimization.

## Common Mistakes

- Confusing `__proto__` (the link an instance has) with `.prototype` (a property on
  constructor functions that becomes the link of instances they create).
- Expecting `obj.foo = x` to change the prototype. It never does — it creates an own
  property that shadows.
- Mutating an object's prototype at runtime for "convenience" and paying a hidden
  performance cost from the de-optimization it triggers.
- Iterating with `for…in` and forgetting it visits **inherited** enumerable properties,
  not just own ones — guard with `hasOwnProperty` or use `Object.keys`.
