---
id: "phase-03/003-classes-and-inheritance"
title: "Classes & Inheritance"
phase: 3
sequence: 3
difficulty: "intermediate"
tags: ["objects", "classes", "prototypes"]
prerequisites: ["phase-03/002-the-prototype-chain"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

The `class` keyword is **syntax over the prototype chain** from the last kata — not a new
object model. A class declaration produces a constructor function whose `.prototype` holds
the shared methods, exactly as if you wrote them by hand.

Key pieces:

- The **constructor** runs once per `new`, setting up own (per-instance) properties.
- **Methods** declared in the class body live on `Class.prototype` and are non-enumerable
  — instances delegate to them, they aren't copied per instance.
- **`extends`** links one prototype to another, so a subclass instance walks
  `instance → Sub.prototype → Base.prototype → Object.prototype`.
- **`super(...)`** in a subclass constructor calls the parent constructor (and must run
  before `this` is used). `super.method()` calls the parent's method.

This is why a method defined once on `Animal.prototype` is callable by every `Dog`: it's
the same delegation you wrote manually with `Object.create`, just with cleaner syntax and
guaranteed `super` wiring.

## Key Insight

> `class` is sugar over the prototype chain. Methods live once on `Class.prototype`;
> instances delegate to them. `extends` just links one prototype to another.

## Experiment

```js
class Animal {
  constructor(name) {
    this.name = name; // own, per-instance property
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name);      // must call before using `this`
    this.legs = 4;
  }
  speak() {
    // delegate to the parent, then extend it
    return `${super.speak()} — specifically, a bark`;
  }
}

const rex = new Dog('Rex');

console.log('speak():', rex.speak());
console.log('rex instanceof Dog:', rex instanceof Dog);
console.log('rex instanceof Animal:', rex instanceof Animal);
console.log("owns 'speak'?", rex.hasOwnProperty('speak'));   // method is on the prototype
console.log("owns 'name'?", rex.hasOwnProperty('name'));     // own, set in constructor
console.log('method shared?', rex.speak === new Dog('Fido').speak);
```

## Expected Result

The console prints:

```
speak(): Rex makes a sound — specifically, a bark
rex instanceof Dog: true
rex instanceof Animal: true
owns 'speak'? false
owns 'name'? true
method shared? true
```

`Dog`'s `speak` calls `super.speak()` (resolved on `Animal.prototype`), then appends to it.
`rex` is an instance of both classes because its chain passes through both prototypes.
`speak` is **not** an own property — it lives on `Dog.prototype`, so every `Dog` shares the
exact same function object (`method shared? true`). Only `name` is per-instance.

## Challenge

1. Add a `static create(name)` method to `Dog` that returns `new Dog(name)`. Confirm
   `Dog.create('Spot')` works but `rex.create` is `undefined` — statics live on the
   constructor, not instances.
2. Add a private field `#secret = 'woof'` and a method that returns it. Try to read
   `rex.#secret` from outside the class and read the error.
3. Remove the `super(name)` call from `Dog`'s constructor and run it. Read the
   `ReferenceError` and explain why `this` is unavailable before `super`.

## Deep Dive

Class bodies are always in **strict mode**, and class declarations are **not hoisted** the
way function declarations are — referencing a class before its declaration throws a
`ReferenceError` (the temporal dead zone). Methods being non-enumerable matters: it keeps
them out of `for…in`, `Object.keys`, and `JSON.stringify`, so serializing an instance gives
you just its data, not its machinery — the same `enumerable: false` lesson from kata 001,
applied automatically by the `class` syntax.

## Common Mistakes

- Using `this` before `super(...)` in a subclass constructor — it throws; `super` must
  initialize the instance first.
- Thinking each instance gets its own copy of the methods. Methods are shared on the
  prototype; only what the constructor assigns to `this` is per-instance.
- Forgetting that arrow functions as class fields (`speak = () => {}`) become **own**
  per-instance properties, not shared prototype methods — different memory and `this`
  behavior.
- Calling instance code expecting `static` members on `this`, or vice versa — statics live
  on the class, not the instance.
