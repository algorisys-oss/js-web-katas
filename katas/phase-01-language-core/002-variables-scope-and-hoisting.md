---
id: "phase-01/002-variables-scope-and-hoisting"
title: "Variables, Scope & Hoisting"
phase: 1
sequence: 2
difficulty: "beginner"
tags: ["scope", "hoisting", "variables"]
prerequisites: ["phase-01/001-types-and-coercion"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

A **scope** is the region of code where a name is visible. JavaScript has three ways to
declare a variable, and they differ in scope and in *when* the name becomes usable:

- **`var`** — **function-scoped** (ignores blocks like `if`/`for`), and **hoisted** to the
  top of its function, initialized to `undefined`. Reading it before the assignment line
  gives `undefined`, not an error.
- **`let`** — **block-scoped** ({ } bounded). It is hoisted too, but lives in the
  **Temporal Dead Zone (TDZ)** from the top of the block until its declaration runs:
  reading it early throws a `ReferenceError`.
- **`const`** — same scoping and TDZ as `let`, but the **binding** can't be reassigned.
  (The *value* can still mutate: `const obj = {}` then `obj.x = 1` is fine.)

**Hoisting** means declarations are processed before any code runs. **Function
declarations** are fully hoisted — you can call them above their definition. `var`
declarations are hoisted but not their assignments. `let`/`const` are hoisted into the TDZ.

This is why `let` and `const` are the modern default: they keep names confined to the
block where you actually use them and turn "used too early" bugs into loud errors.

## Key Insight

> `var` is function-scoped and reads as `undefined` before its line; `let`/`const` are
> block-scoped and throw if read before their line (the Temporal Dead Zone).

## Experiment

```js
// 1 — function declarations are fully hoisted: callable before they appear.
console.log('hoisted() before its definition:', hoisted());
function hoisted() { return 'I work'; }

// 2 — var is hoisted but its assignment is not.
console.log('typeof laterVar before assignment:', typeof laterVar); // "undefined", no error
var laterVar = 42;

// 3 — let lives in the Temporal Dead Zone until its declaration line.
try {
  console.log(tdzVar);   // throws — declared below
  let tdzVar = 1;
} catch (err) {
  console.log('TDZ access:', err.name);
}

// 4 — block scope: each `let` belongs to one iteration; `var` does not.
const fromVar = [];
for (var v = 0; v < 3; v++) { fromVar.push(() => v); }
console.log('var in loop closures:', fromVar.map((f) => f()).join(','));

const fromLet = [];
for (let l = 0; l < 3; l++) { fromLet.push(() => l); }
console.log('let in loop closures:', fromLet.map((f) => f()).join(','));
```

## Expected Result

The console prints, in order:

```
hoisted() before its definition: I work
typeof laterVar before assignment: undefined
TDZ access: ReferenceError
var in loop closures: 3,3,3
let in loop closures: 0,1,2
```

The classic loop result: every `var` closure shares **one** variable that ended at `3`,
while each `let` iteration gets its **own** binding, capturing `0`, `1`, and `2`.

## Challenge

1. Move `let tdzVar = 1` *above* the `console.log(tdzVar)` line. The `ReferenceError`
   disappears — explain why, in terms of the TDZ.
2. Rewrite the `var` loop to also print `0,1,2` **without** using `let` (hint: wrap the
   body so each iteration captures its own value).
3. Declare `const config = { theme: 'dark' }`, then run `config.theme = 'light'` and
   separately `config = {}`. Which one throws, and why?

## Deep Dive

Each running function creates an **environment record** holding its variables; nested
functions keep a reference to the records above them (the **scope chain**), which is the
mechanism behind closures (Phase 2). `let` in a `for` header is special-cased by the spec
to create a fresh binding per iteration and copy the value forward — that single rule is
why the modern loop "just works" where the old `var` loop needed an IIFE.

## Common Mistakes

- Using `var` in a loop with async callbacks and expecting per-iteration values — you get
  the final value every time.
- Assuming `const` makes objects immutable. It freezes the **binding**, not the contents;
  use `Object.freeze` for shallow immutability.
- Relying on `var`'s "read before assign gives `undefined`" behavior — it hides bugs.
  Prefer `let`/`const` so the engine tells you when you've used a name too early.
- Declaring a function with `const fn = () => {}` and calling it above that line — unlike a
  function *declaration*, the arrow is in the TDZ until its assignment runs.
