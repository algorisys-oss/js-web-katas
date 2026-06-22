---
id: "phase-02/005-currying-and-composition"
title: "Currying & Composition"
phase: 2
sequence: 5
difficulty: "intermediate"
tags: ["functions", "currying", "composition"]
prerequisites: ["phase-02/004-higher-order-functions"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

Once functions are values (kata 4), you can reshape and combine them. Two classic
techniques fall out of closures and higher-order functions:

- **Currying** turns a function that takes several arguments at once into a chain of
  functions that each take one argument: `add(a, b)` becomes `add(a)(b)`. Each call returns
  a closure remembering the arguments so far, until enough have arrived to compute a result.
  The practical payoff is **partial application** — fix some arguments now, supply the rest
  later (`bind` from kata 3 does exactly this for `this` and leading arguments).
- **Composition** wires functions into a pipeline: the output of one becomes the input of
  the next. `compose(f, g)(x)` computes `f(g(x))` (right-to-left); `pipe(f, g)(x)` computes
  `g(f(x))` (left-to-right, the reading order most people prefer). You build complex
  transformations from small, individually testable functions.

These aren't academic. Curried, composable functions are how you build reusable helpers —
a validator, a formatter, a DOM-update step — and snap them together without repeating glue
code. The whole thing rests on closures: every partially applied function is a closure
holding the arguments it has captured so far.

## Key Insight

> Currying produces specialized functions by fixing arguments one at a time; composition
> pipes the output of one function into the next. Both are just closures over functions.

## Experiment

```js
// Currying: each call captures one argument until all three have arrived.
function add(a) {
  return (b) => (c) => a + b + c;
}
console.log('add(1)(2)(3) →', add(1)(2)(3));

// Partial application: fix the first argument, reuse the rest.
const addTen = add(10);
console.log('addTen(5)(1) →', addTen(5)(1));

// Small, single-purpose functions to compose.
const double = (n) => n * 2;
const increment = (n) => n + 1;
const square = (n) => n * n;

// compose runs RIGHT to left: compose(f, g)(x) === f(g(x)).
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
// pipe runs LEFT to right: pipe(f, g)(x) === g(f(x)).
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const composed = compose(square, increment, double); // square(increment(double(x)))
const piped = pipe(double, increment, square);        // square(increment(double(x)))

console.log('compose →', composed(3)); // double=6, increment=7, square=49
console.log('pipe →', piped(3));       // double=6, increment=7, square=49

// Reusable partials feeding a pipeline.
const multiplyBy = (factor) => (n) => n * factor;
const formatPrice = pipe(multiplyBy(1.2), (n) => `$${n.toFixed(2)}`); // add 20% tax
console.log('formatPrice(50) →', formatPrice(50));
```

## Expected Result

The **console** prints, in order:

```
add(1)(2)(3) → 6
addTen(5)(1) → 16
compose → 49
pipe → 49
formatPrice(50) → $60.00
```

`compose(square, increment, double)(3)` works right-to-left: `double(3)=6`,
`increment(6)=7`, `square(7)=49`. `pipe(double, increment, square)(3)` works left-to-right
and happens to apply the same three steps in the same order, so it also yields `49`.
`formatPrice(50)` multiplies by `1.2` to get `60`, then formats it as `$60.00`.

## Challenge

1. Write a general `curry(fn)` that works for any arity: it collects arguments across calls
   and only invokes `fn` once `args.length >= fn.length`. Test it with a three-argument
   function called as `curried(1)(2)(3)`, `curried(1, 2)(3)`, and `curried(1)(2, 3)`.
2. Build `pipe` and confirm `pipe(double, increment, square)` and
   `compose(square, increment, double)` give the same result for several inputs. When does
   the *order* of functions matter and produce different results?
3. Compose three string transforms (e.g. `trim`, `toLowerCase`, replace spaces with `-`)
   into a `slugify` function and apply it to `'  Hello World  '`.

## Deep Dive

Composition reads cleanest when each step is a **pure** function — same input always gives
the same output, with no side effects. Pure steps can be reordered in your head, tested in
isolation, and safely cached (memoized). The moment a step touches the DOM, the network, or
shared state, it stops being pure, and the pipeline becomes order-sensitive and harder to
reason about. A common architecture is to keep a long pure pipeline that computes *what*
should change, then perform the one impure step (the DOM update) at the very end — a pattern
you'll see again in rendering (Phase 12) and state management (Phase 20).

## Common Mistakes

- Mixing up `compose` (right-to-left) and `pipe` (left-to-right) and getting steps in the
  wrong order.
- Forgetting that a curried function returns *another function* until all arguments arrive —
  calling `add(1)` and expecting a number gives you a function instead.
- Composing impure functions and being surprised when reordering them changes the result.
- Over-currying simple code: a plain `add(a, b)` is clearer than `add(a)(b)` unless you
  genuinely benefit from partial application.
