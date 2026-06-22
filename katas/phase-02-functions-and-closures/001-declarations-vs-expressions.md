---
id: "phase-02/001-declarations-vs-expressions"
title: "Function Declarations vs Expressions"
phase: 2
sequence: 1
difficulty: "beginner"
tags: ["functions", "hoisting"]
prerequisites: ["phase-01/005-strict-mode-and-footguns"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

JavaScript gives you several ways to make a function, and the *way* you write it changes
when the function exists and what name it answers to. The two foundational forms are:

- A **function declaration** — a statement that starts with the `function` keyword:
  `function greet() {}`. Declarations are **hoisted**: the engine registers the whole
  function (name *and* body) at the top of the enclosing scope, so you can call it on a
  line *above* where it's written.
- A **function expression** — a function used as a value, usually assigned to a variable:
  `const greet = function () {}`. Only the variable binding is hoisted, and (with
  `const`/`let`) it sits in the **temporal dead zone** until the assignment runs. Call it
  early and you get a `ReferenceError` or `undefined is not a function`.

Modern code also uses **arrow functions** (`const greet = () => {}`), which are a kind of
expression. They behave like a function expression for hoisting, but differ in `this`,
`arguments`, and that they cannot be used as constructors — covered in kata 3.

The engine builds the DOM and runs your module top to bottom; understanding hoisting is
what lets you predict *which* functions are callable at any given line.

## Key Insight

> Function **declarations** are hoisted whole — callable before their line. Function
> **expressions** only hoist the variable, so the value isn't there until the assignment runs.

## Experiment

```js
// 1. A declaration is callable BEFORE its definition — the whole thing is hoisted.
console.log('declared() →', declared());

function declared() {
  return 'I am a declaration';
}

// 2. An expression is NOT ready before its assignment line runs.
try {
  expressed(); // TDZ: the const exists but isn't initialized yet
} catch (err) {
  console.log('calling expressed() early →', err.name);
}

const expressed = function () {
  return 'I am an expression';
};
console.log('expressed() →', expressed());

// 3. A named function expression: the name is only visible INSIDE the function.
const fib = function fibInner(n) {
  return n < 2 ? n : fibInner(n - 1) + fibInner(n - 2); // self-reference by inner name
};
console.log('fib(7) →', fib(7));
console.log('typeof fibInner →', typeof fibInner); // not in outer scope
```

## Expected Result

The **console** prints, in order:

```
declared() → I am a declaration
calling expressed() early → ReferenceError
expressed() → I am an expression
fib(7) → 13
typeof fibInner → undefined
```

The declaration works before its line; the expression throws a `ReferenceError` because
`const expressed` is in the temporal dead zone. The named expression's inner name
`fibInner` is usable for recursion *inside* the body but is `undefined` outside it.

## Challenge

1. Replace `const expressed` with `var expressed` and call `expressed()` early. You no
   longer get a `ReferenceError` — what error do you get instead, and why? (Hint: `var`
   hoists the binding as `undefined`.)
2. Wrap a declaration inside an `if (true) { ... }` block and call it from outside the
   block. In strict mode (modules are strict), is the function visible? Why might block-level
   declarations surprise you?
3. Turn `declared` into an arrow function expression and confirm the early call now fails.

## Deep Dive

Hoisting isn't magic — it's the two-pass nature of execution. Before running a scope, the
engine does a "creation" pass that registers declarations; then a "execution" pass runs the
statements. Function *declarations* get their full value during creation; `let`/`const`
bindings are registered but left uninitialized (the temporal dead zone) until their line
runs; `var` bindings are initialized to `undefined`. Knowing the two passes lets you read
any scope and predict exactly what is callable where.

## Common Mistakes

- Assuming a function expression assigned to `const`/`let` is callable above its line — it
  is in the temporal dead zone and throws a `ReferenceError`.
- Confusing the `var`-hoisting result (`undefined`, "not a function") with the
  `const`/`let` result (`ReferenceError`). They fail differently.
- Trying to reference a named function expression's inner name from the outer scope — it
  only exists inside the function body.
- Relying on block-scoped function declarations behaving consistently — their semantics are
  historically messy; prefer assigning a function expression to a `const`.
