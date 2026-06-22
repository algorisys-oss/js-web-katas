---
id: "phase-03/004-getters-setters-and-proxy"
title: "Getters, Setters & Proxy"
phase: 3
sequence: 4
difficulty: "advanced"
tags: ["objects", "proxy", "descriptors"]
prerequisites: ["phase-03/003-classes-and-inheritance"]
estimated_minutes: 15
starter: ["js"]
network: false
---

## Concept

Kata 001 introduced **accessor descriptors** — properties backed by `get`/`set` functions
instead of a stored value. They let a property *compute* on read and *validate* on write
while still looking like a plain field:

```js
obj.fullName        // runs the getter
obj.fullName = 'X'  // runs the setter
```

A **`Proxy`** generalizes this to the whole object. Instead of intercepting one property,
a Proxy wraps a *target* object with a **handler** of **traps** — functions the engine
calls for fundamental operations: `get`, `set`, `has` (the `in` operator), `deleteProperty`,
and more. Whatever your trap returns becomes the operation's result. This is how reactive
frameworks observe every read and write without you touching each property.

The pairing matters: getters/setters are precise and cheap for a known set of properties;
a Proxy is broad and dynamic, intercepting properties that don't even exist yet. Both build
on the same idea — a property access is a *function call* you can control.

## Key Insight

> A getter/setter intercepts **one** property; a `Proxy` intercepts **every** operation on
> an object via traps. Both turn a plain-looking access into code you control.

## Experiment

```js
// Accessor properties: a computed `fullName` with validation on write.
const person = {
  first: 'Ada',
  last: 'Lovelace',
  get fullName() {
    return `${this.first} ${this.last}`;
  },
  set fullName(value) {
    [this.first, this.last] = value.split(' ');
  },
};

console.log('getter:', person.fullName);
person.fullName = 'Grace Hopper';        // runs the setter
console.log('after setter:', person.first, '/', person.last);

// A Proxy: trap every read and reads of missing keys.
const target = { x: 1 };
const logged = new Proxy(target, {
  get(obj, key) {
    console.log('GET trap:', key);
    return key in obj ? obj[key] : `<no ${String(key)}>`;
  },
  set(obj, key, value) {
    console.log('SET trap:', key, '=', value);
    obj[key] = value;
    return true; // must return true, or strict mode throws
  },
});

console.log('proxy x:', logged.x);
console.log('proxy missing:', logged.nope);
logged.y = 2;
console.log('target now:', JSON.stringify(target));
```

## Expected Result

The console prints:

```
getter: Ada Lovelace
after setter: Grace / Hopper
GET trap: x
proxy x: 1
GET trap: nope
proxy missing: <no nope>
SET trap: y = 2
target now: {"x":1,"y":2}
```

Reading `person.fullName` runs the getter; assigning to it runs the setter, which splits
and stores the two names. The Proxy's `get` trap fires for every read — including the
missing key `nope`, where the trap returns a fallback — and the `set` trap fires on
`logged.y = 2`, writing through to the real `target`.

## Challenge

1. Add a `has` trap to the Proxy that logs which key was tested, then run `'x' in logged`
   and `'z' in logged`. Confirm the trap fires for both.
2. In the `set` trap, reject non-number values by returning `false` (or throwing). In strict
   mode (every module) a rejected `set` throws a `TypeError` — catch and log it.
3. Make `fullName` **read-only** by removing its setter, then assign to it inside a
   `try/catch`. Why does strict mode throw on a getter-only property?

## Deep Dive

A Proxy trap must obey the target's **invariants**. If the target has a non-configurable,
non-writable property, your `get` trap *must* return that exact value, and `set` *must*
reject the change — otherwise the engine throws a `TypeError`, because the language
guarantees those properties are stable no matter what wraps them. This is the descriptor
flags from kata 001 enforced through the Proxy. `Reflect` (the companion API,
`Reflect.get(obj, key, receiver)`) provides default implementations of each trap so you can
forward an operation after logging or modifying it, instead of re-implementing it by hand.

## Common Mistakes

- Forgetting that a `set` trap (and `deleteProperty`, `defineProperty`) must return a
  boolean — returning `undefined` is falsy and throws in strict mode.
- Mixing `value`/`writable` with `get`/`set` in one descriptor — a property is *either*
  data or accessor, never both; the engine rejects the mix.
- Assuming the Proxy is the target. They are distinct objects; mutate through the Proxy or
  the target deliberately and know which one other code holds.
- Expecting traps to fire when other code already has a **direct** reference to the target
  — only operations that go through the Proxy are intercepted.
