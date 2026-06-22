---
id: "phase-04/004-destructuring-and-spread"
title: "Destructuring & Spread"
phase: 4
sequence: 4
difficulty: "beginner"
tags: ["destructuring", "spread"]
prerequisites: ["phase-04/003-map-set-and-weakmap"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

**Destructuring** is pattern-matching on the left side of an assignment: you describe the
shape of an array or object and the language pulls values out into variables. **Spread**
(`...`) and **rest** (`...`) are the same three dots doing opposite jobs depending on
position — spread *expands* an iterable into individual elements, rest *collects* leftovers
into one variable.

Together they replace a lot of fiddly index- and key-access code:

- **Array destructuring** binds by **position**: `const [first, , third] = arr`. A trailing
  rest (`...others`) gathers the remaining elements into a new array.
- **Object destructuring** binds by **key**, with optional renaming and **defaults**:
  `const { x: posX = 0 } = point`.
- **Spread** copies arrays/objects into new ones (`[...a, ...b]`, `{ ...base, override }`)
  and expands arguments at call sites (`Math.max(...nums)`). This is the everyday way to make
  the *shallow copies* the immutability habit demands.

These show up constantly in DOM and async code: pulling `{ target }` off an event, copying
state for an update, merging default options with user-supplied ones.

## Key Insight

> The same `...` *spreads* an iterable into pieces in a value position, and *collects* the
> rest into one binding in a pattern position. Destructuring + spread is how you copy and
> reshape data without mutating the original.

## Experiment

```js
// Array destructuring binds by position; rest collects the tail.
const scores = [90, 85, 70, 60];
const [top, second, ...rest] = scores;
console.log('top:', top, 'second:', second, 'rest:', rest);

// Swap without a temp variable.
let a = 1, b = 2;
[a, b] = [b, a];
console.log('swapped:', a, b);

// Object destructuring: rename and supply defaults.
const config = { width: 800, color: 'blue' };
const { width, height = 600, color: shade } = config;
console.log('width:', width, 'height (default):', height, 'shade:', shade);

// Nested destructuring straight out of a structure.
const event = { type: 'click', target: { id: 'btn', tag: 'BUTTON' } };
const { type, target: { id } } = event;
console.log('type:', type, 'target id:', id);

// Spread to make shallow copies and merges (the immutable-update pattern).
const base = { theme: 'light', font: 'serif' };
const updated = { ...base, theme: 'dark' }; // override one key, copy the rest
console.log('base:', base);
console.log('updated:', updated);

// Spread to expand arguments.
const nums = [3, 9, 2, 7];
console.log('max:', Math.max(...nums));
```

## Expected Result

The console prints:

```
top: 90 second: 85 rest: [70, 60]
swapped: 2 1
width: 800 height (default): 600 shade: blue
type: click target id: btn
base: { theme: "light", font: "serif" }
updated: { theme: "dark", font: "serif" }
max: 9
```

`height` falls back to its default `600` because `config` has no `height` key. `updated` is a
**new** object: `base` is unchanged, proving spread made a copy rather than mutating in place.

## Challenge

1. Write a function `greet({ name, greeting = 'Hello' } = {})` that destructures its
   parameter with a default, and call it both with `{ name: 'Ada' }` and with **no** argument.
   Why is the `= {}` necessary?
2. Use rest in a function signature — `function sum(...nums)` — and reduce `nums` to a total.
3. Spread a nested object (`{ ...user, address: { ...user.address, city: 'Paris' } }`) and
   confirm the original's nested object is untouched. Why does the *top-level* spread alone
   not protect nested objects?

## Deep Dive

Spread performs a **shallow** copy: it copies top-level elements/properties by value, but for
nested objects it copies the **reference**, so the copy and the original still share those
inner objects. That's why `{ ...state }` is enough for flat state but you must spread each
level you intend to change (or use `structuredClone` for a deep copy). Object spread copies
only **own enumerable** properties and does not run getters as accessors on the target — it
reads their values once. Array destructuring works on **any iterable** (it uses
`Symbol.iterator` from kata 002), so `const [a, b] = new Set([1, 2])` and
`const [r, g] = 'rg'` both work, while object destructuring works on property access and so
even reads from primitives via their wrapper (`const { length } = 'hi'`).

## Common Mistakes

- Forgetting the parameter default `= {}` when destructuring a function argument — calling it
  with no argument then throws "Cannot destructure property of undefined."
- Assuming spread is a deep copy. Nested objects/arrays are shared by reference; mutate one
  and you mutate both.
- Putting rest anywhere but **last** — `const [...rest, last] = arr` is a syntax error; rest
  must be the final element.
- Writing a destructuring assignment as the first statement and starting a line with `{ ... }`
  — the parser reads it as a block. Wrap it in parens: `({ a } = obj)`.
