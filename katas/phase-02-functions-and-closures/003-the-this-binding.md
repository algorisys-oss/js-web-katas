---
id: "phase-02/003-the-this-binding"
title: "The this Binding"
phase: 2
sequence: 3
difficulty: "intermediate"
tags: ["functions", "this", "binding"]
prerequisites: ["phase-02/002-closures"]
estimated_minutes: 15
starter: ["js"]
network: false
---

## Concept

In most languages `this` is fixed by where a method is written. In JavaScript, `this` is
decided by **how a function is called**, not where it's defined. The same function can see
four different `this` values depending on the call. There are four rules, checked in order:

1. **`new` binding** — `new Fn()` makes `this` a brand-new object.
2. **Explicit binding** — `fn.call(obj)`, `fn.apply(obj)`, or `fn.bind(obj)` set `this`
   to `obj`.
3. **Method binding** — `obj.fn()` sets `this` to `obj` (the thing left of the dot).
4. **Default binding** — a plain `fn()` call. In **strict mode** (modules are always
   strict) `this` is `undefined`; in sloppy mode it would be the global object.

The classic bug: you pull a method off its object (`const f = obj.method`) or pass it as a
callback (`setTimeout(obj.method, 0)`). Now there's no object to the left of the dot, so
rule 3 doesn't apply, you fall through to default binding, and `this` is `undefined`.

**Arrow functions break the rules on purpose.** An arrow has no `this` of its own — it uses
the `this` of the scope where it was *defined* (lexical `this`, just like a closure captures
a variable). That's exactly what you want for callbacks that need the surrounding object.

## Key Insight

> `this` is set by the **call site**, not the definition — except for arrow functions, which
> have no `this` and borrow it lexically from where they were written.

## Experiment

```js
const user = {
  name: 'Ada',
  // Method: `this` depends on how it's called.
  greet() {
    return `Hi, I'm ${this?.name}`;
  },
  // Arrow as a method: `this` is the MODULE scope, not `user`.
  greetArrow: () => `Arrow sees: ${typeof this}`,
};

// Rule 3 — called as a method, `this` is `user`.
console.log('user.greet() →', user.greet());

// Rule 4 — pulled off the object, no dot, default binding (strict → undefined).
const loose = user.greet;
console.log('loose() →', loose()); // this is undefined → this?.name is undefined

// Rule 2 — explicit binding fixes it.
console.log('bound →', loose.call({ name: 'Grace' }));

// Arrow ignores the object it lives on and uses lexical (module) `this`.
console.log('user.greetArrow() →', user.greetArrow());

// The callback trap, and the arrow fix:
const timer = {
  label: 'tick',
  startBroken() {
    // A plain function passed as a callback loses `this`.
    return [1].map(function () { return this?.label; })[0];
  },
  startFixed() {
    // An arrow keeps `this` from startFixed's call (which was timer.startFixed()).
    return [1].map(() => this.label)[0];
  },
};
console.log('startBroken() →', timer.startBroken());
console.log('startFixed() →', timer.startFixed());
```

## Expected Result

The **console** prints, in order:

```
user.greet() → Hi, I'm Ada
loose() → Hi, I'm undefined
bound → Hi, I'm Grace
user.greetArrow() → Arrow sees: undefined
startBroken() → undefined
startFixed() → tick
```

`user.greet()` finds `this === user`. Detaching it (`loose`) drops to default binding, so
`this` is `undefined` and `this?.name` is `undefined`. `.call({name:'Grace'})` sets `this`
explicitly. The arrow method's `this` is the module's top-level `this` (which is `undefined`
in a module), so `typeof this` is `"undefined"`. Inside `map`, a plain callback loses
`this`; the arrow version inherits `this === timer`.

## Challenge

1. Add a `greetLater()` method that calls `setTimeout(function () { ... }, 0)` and logs
   `this.name`. Watch it fail, then fix it two ways: with an arrow callback, and with
   `.bind(this)`. Compare.
2. Build a constructor with `function Point(x, y) { this.x = x; this.y = y; }` and call it
   *without* `new`. In strict mode, what happens when you assign to `this.x`? Why?
3. Use `greet.call`, `greet.apply`, and `greet.bind` to invoke `greet` with three different
   objects. Note that `bind` returns a new function instead of calling immediately.

## Deep Dive

`bind` returns a *new* function permanently locked to a `this` (and optionally pre-filled
leading arguments — partial application, see kata 5). Once bound, it ignores later `call` or
`apply` attempts to change `this`. The one exception is `new`: calling `new boundFn()`
*ignores* the bound `this` and uses the freshly constructed instance instead (any bound
arguments are still applied). Arrow functions go further: they have no
`this`, `arguments`, `super`, or `new.target` of their own and cannot be used with `new` at
all. That's why arrows are perfect for short callbacks but wrong for object methods and
constructors. Class fields assigned as arrows (`onClick = () => {}`) are a common way to get
auto-bound event handlers in the DOM.

## Common Mistakes

- Assuming `this` depends on where a function is defined. It depends on the **call site**.
- Using an arrow function as an object method and expecting `this` to be that object — an
  arrow uses lexical `this` instead.
- Passing `obj.method` as a callback (to `setTimeout`, `addEventListener`, `map`) and losing
  `this`. Bind it or wrap it in an arrow.
- Forgetting that modules are strict, so default-binding `this` is `undefined` (not the
  global object) — reads like `this.name` then throw instead of silently using a global.
