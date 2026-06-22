---
id: "phase-01/005-strict-mode-and-footguns"
title: "Strict Mode & Common Footguns"
phase: 1
sequence: 5
difficulty: "intermediate"
tags: ["strict-mode", "footguns", "language"]
prerequisites: ["phase-01/004-operators-and-expressions"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

**Strict mode** is a stricter variant of JavaScript that converts silent mistakes into
thrown errors and disables a few legacy footguns. You opt in with the `'use strict';`
directive — but in modern frontend code you usually get it **for free**: every ES **module**
runs in strict mode automatically. Since this playground runs your code as a module (see
Phase 0, kata 5), strict mode is already on here.

What strict mode changes:

- Assigning to an **undeclared variable** throws a `ReferenceError` instead of silently
  creating a global. (The single biggest typo-catcher.)
- Writing to a **non-writable** or frozen property throws a `TypeError` instead of failing
  silently.
- `this` inside a plain function call is `undefined`, not the global object — preventing
  accidental global mutation (Phase 2 covers `this` in depth).
- Duplicate parameter names and a few other legacy forms become syntax errors.

Beyond strict mode, the language has classic footguns worth meeting now:
**Automatic Semicolon Insertion (ASI)** can break a `return` on its own line;
`parseInt` and `Number` parse differently; and `NaN` needs the right test.

## Key Insight

> Modules are always strict, so accidental globals and silent write failures become loud
> errors. That is a feature: fail fast, fix early.

## Experiment

```js
// This code runs as a module, so strict mode is already active.

// 1 — assigning to an undeclared name throws instead of leaking a global.
try {
  undeclaredName = 1; // no let/const/var
} catch (err) {
  console.log('undeclared assignment:', err.name);
}

// 2 — writing to a frozen object's property throws in strict mode.
try {
  const frozen = Object.freeze({ a: 1 });
  frozen.a = 2;
} catch (err) {
  console.log('frozen write:', err.name);
}

// 3 — ASI footgun: a newline after `return` ends the statement.
function broken() {
  return
    'never reached';
}
console.log('return + newline:', broken()); // undefined

// 4 — parseInt vs Number parse differently.
console.log('parseInt("12px"):', parseInt('12px', 10)); // 12 (stops at "p")
console.log('Number("12px"):', Number('12px'));          // NaN (all-or-nothing)

// 5 — testing for NaN correctly.
console.log('NaN === NaN:', NaN === NaN);                 // false
console.log('Number.isNaN(NaN):', Number.isNaN(NaN));     // true
console.log('Number.isNaN("foo"):', Number.isNaN('foo')); // false (no coercion)
```

## Expected Result

The console prints, in order:

```
undeclared assignment: ReferenceError
frozen write: TypeError
return + newline: undefined
parseInt("12px"): 12
Number("12px"): NaN
NaN === NaN: false
Number.isNaN(NaN): true
Number.isNaN("foo"): false
```

In sloppy (non-strict) mode the first two would have **failed silently** — `undeclaredName`
would have become a global and the frozen write would have been ignored with no error.
Strict mode surfaces both. The `return` followed by a newline returns `undefined` because
ASI inserts a semicolon right after `return`.

## Challenge

1. Fix `broken()` so it returns the string. (Put the value on the same line as `return`, or
   open the parenthesis/object on the same line.)
2. The global legacy `isNaN('foo')` returns `true` because it coerces first;
   `Number.isNaN('foo')` returns `false`. Write a one-line note on which to use and why.
3. Try `'use strict';` at the top of a non-module `<script>` and reproduce the undeclared-
   variable error there. Then remove it and watch the assignment silently create a global.

## Deep Dive

Strict mode was introduced in ES5 (2009) as an opt-in so it wouldn't break the existing web,
and ES modules (2015) made it the default for all module code — which is why bundled,
modern frontend apps are strict everywhere whether you typed the directive or not. ASI, by
contrast, is permanent legacy behavior: the parser inserts semicolons at line breaks under
specific rules, and the `return`-newline trap is the one that bites people most, which is
why many teams adopt a "no newline after return" lint rule rather than relying on memory.

## Common Mistakes

- Assuming you must write `'use strict';` — in a module it's already on, and adding it is
  harmless but redundant.
- Relying on a forgotten `var` typo creating a usable global. In strict mode (and modules)
  it throws; you must declare names.
- Putting a `return` value on the next line. ASI ends the statement and you return
  `undefined`.
- Using the global `isNaN(x)` (coerces, so `isNaN('foo')` is `true`) when you mean
  `Number.isNaN(x)` (no coercion). Prefer the `Number.` version.
