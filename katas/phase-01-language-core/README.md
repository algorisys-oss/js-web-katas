# Phase 1 — JavaScript Language Core

**Ladder rung:** 2 — JavaScript Language Core (the language beneath the platform).

## Goal

Master the core JavaScript language as it actually behaves in the browser — *before*
touching the DOM. By the end of this phase you can explain the type system and its
coercions, reason about scope and hoisting, choose the right equality and truthiness check,
read dense expressions with confidence, and recognize the footguns strict mode catches for
you.

## Why it matters

Every later phase — events, async, the DOM, fetch — is written in this language. The bugs
that look like "framework magic" or "the DOM is broken" are usually plain language
behavior: a string from an `<input>` concatenated instead of added, an empty array treated
as falsy, a `var` captured by three closures, a `==` coercion gone sideways. Get the
language right and the platform stops surprising you.

## Katas

1. [Types & Coercion](./001-types-and-coercion.md) — the seven primitives, `typeof`, and
   how operators coerce to string, number, or boolean.
2. [Variables, Scope & Hoisting](./002-variables-scope-and-hoisting.md) — `var` vs
   `let`/`const`, function vs block scope, hoisting, and the Temporal Dead Zone.
3. [Equality & Truthiness](./003-equality-and-truthiness.md) — `===` vs `==`, the eight
   falsy values, and why `[]` and `{}` are truthy.
4. [Operators & Expressions](./004-operators-and-expressions.md) — short-circuiting `||`,
   `&&`, `??`, optional chaining, and precedence/associativity traps.
5. [Strict Mode & Common Footguns](./005-strict-mode-and-footguns.md) — what modules give
   you for free, plus ASI, `parseInt` vs `Number`, and testing for `NaN`.

## What's next

Phase 2 — Functions & Closures: function definitions vs expressions, the scope chain made
concrete as closures, `this` binding, and higher-order functions.
