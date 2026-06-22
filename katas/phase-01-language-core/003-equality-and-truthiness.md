---
id: "phase-01/003-equality-and-truthiness"
title: "Equality & Truthiness"
phase: 1
sequence: 3
difficulty: "beginner"
tags: ["equality", "coercion", "truthiness"]
prerequisites: ["phase-01/002-variables-scope-and-hoisting"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

JavaScript has two equality operators, and the difference matters every day:

- **`===` (strict equality)** compares type **and** value with **no coercion**. If the
  types differ, the answer is immediately `false`.
- **`==` (loose equality)** coerces operands toward a common type *before* comparing,
  following a tangled set of rules. This is the source of most "WTF JS" memes.

A few `==` rules are actually useful to know rather than memorize wholesale:
`null == undefined` is `true` (and they equal **nothing else**), and everything else gets
coerced toward numbers. That's why `'' == 0`, `'0' == 0`, and `[] == 0` are all `true`.

Separately, every value is either **truthy** or **falsy** when used in a boolean context.
In ordinary JavaScript you'll care about these **eight falsy values**: `false`, `0`, `-0`,
`0n`, `''`, `null`, `undefined`, and `NaN`. **Everything else is truthy** — including `'0'`,
`'false'`, `[]`, and `{}`. Empty arrays and objects being truthy trips up almost everyone.
(Browsers also carry one historical oddity: the legacy `document.all` is falsy by design —
a compatibility hack so old feature-detection code keeps working — but you'll essentially
never depend on it.)

## Key Insight

> Use `===` by default. `==` only earns its place in `x == null` (a deliberate check for
> "null or undefined"). Empty arrays and objects are **truthy**, not falsy.

## Experiment

```js
// 1 — strict vs loose on the same pair.
console.log('"5" === 5:', '5' === 5);   // false — different types
console.log('"5" == 5:', '5' == 5);     // true  — string coerced to number

// 2 — the one genuinely useful == rule: null and undefined.
console.log('null == undefined:', null == undefined);    // true
console.log('null === undefined:', null === undefined);  // false
console.log('null == 0:', null == 0);                    // false (special-cased)

// 3 — number coercion makes these surprising pairs equal.
console.log('"" == 0:', '' == 0);     // true
console.log('"0" == 0:', '0' == 0);   // true
console.log('[] == 0:', [] == 0);     // true ([] -> "" -> 0)

// 4 — the eight falsy values; everything else is truthy.
const values = [false, 0, '', null, undefined, NaN, '0', [], {}];
for (const v of values) {
  console.log(JSON.stringify(v), '->', Boolean(v) ? 'truthy' : 'falsy');
}

// 5 — NaN is never equal to anything, even itself.
console.log('NaN === NaN:', NaN === NaN);                 // false
console.log('Object.is(NaN, NaN):', Object.is(NaN, NaN)); // true
```

## Expected Result

The console prints, in order:

```
"5" === 5: false
"5" == 5: true
null == undefined: true
null === undefined: false
null == 0: false
"" == 0: true
"0" == 0: true
[] == 0: true
false -> falsy
0 -> falsy
"" -> falsy
null -> falsy
undefined -> falsy
null -> falsy
"0" -> truthy
[] -> truthy
{} -> truthy
```

Note: `JSON.stringify(undefined)` yields the literal `undefined` (not a string), and
`NaN` stringifies to `null` — that's why the falsy list shows `undefined` and a second
`null` for those two entries. The headline result: `'0'`, `[]`, and `{}` are all
**truthy**.

## Challenge

1. Why is `[] == ![]` `true`? Walk through it: evaluate `![]` first, then apply the
   number-coercion rules of `==`.
2. Write an `if (response.items)` style guard for an empty array. Since `[]` is truthy,
   what should you actually check to mean "no items"? (Hint: `.length`.)
3. Use `Object.is` to distinguish `0` from `-0` and to test for `NaN`. Where does it differ
   from `===`?

## Deep Dive

`==` runs the spec's **Abstract Equality Comparison**, a step-by-step algorithm: if one
side is `null`/`undefined`, only the other being `null`/`undefined` matches; a boolean is
coerced to a number; a string-vs-number comparison coerces the string to a number; an
object-vs-primitive comparison runs `ToPrimitive` on the object. Memorizing the whole table
is a waste — adopting `===` everywhere makes it irrelevant, which is exactly why linters
default to enforcing strict equality.

## Common Mistakes

- Treating `[]` or `{}` as falsy. They are truthy; checking "is this empty" needs
  `.length === 0` or `Object.keys(obj).length === 0`.
- Using `==` "because it's shorter," then getting bitten by `'' == 0` or `'0' == false`.
- Testing for `NaN` with `=== NaN` (always `false`). Use `Number.isNaN(x)` or `Object.is`.
- Writing `if (x)` to mean "x was provided" when `0` or `''` are valid values — they're
  falsy, so the guard wrongly rejects them. Test `x != null` or `x !== undefined` instead.
