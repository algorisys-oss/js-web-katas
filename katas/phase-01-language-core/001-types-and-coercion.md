---
id: "phase-01/001-types-and-coercion"
title: "Types & Coercion"
phase: 1
sequence: 1
difficulty: "beginner"
tags: ["types", "coercion"]
prerequisites: ["phase-00/005-how-scripts-load"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

JavaScript has exactly **seven primitive types** — `string`, `number`, `boolean`,
`undefined`, `null`, `bigint`, `symbol` — plus one non-primitive type, `object` (which
includes arrays and functions). You inspect a value's type with the `typeof` operator.

The reason frontend code surprises people is **coercion**: when an operator gets operands
of the "wrong" type, the engine quietly converts them rather than throwing. There are
three target types it coerces *to*:

- **to string** — e.g. the `+` operator when either side is a string, or `String(x)`.
- **to number** — e.g. `-`, `*`, `/`, `<`, or `Number(x)`.
- **to boolean** — e.g. inside `if`, `&&`, `||`, or `Boolean(x)`.

Two `typeof` results are famous traps: `typeof null` is `"object"` (a bug from 1995 that
can never be fixed), and `typeof NaN` is `"number"` (NaN is a numeric value meaning "not a
valid number"). Knowing the rules turns "magic" output into predictable output.

## Key Insight

> Operators don't refuse mismatched types — they coerce them. `+` prefers strings;
> almost every other math/comparison operator prefers numbers; conditionals prefer booleans.

## Experiment

```js
// 1 — typeof on each primitive (note the two traps).
console.log('typeof null:', typeof null);   // "object" (historic bug)
console.log('typeof NaN:', typeof NaN);      // "number"

// 2 — the + operator: string wins if either side is a string.
console.log('5 + 2 =', 5 + 2);
console.log('"5" + 2 =', '5' + 2);
console.log('5 + "2" =', 5 + '2');

// 3 — other math operators coerce TO number.
console.log('"5" - 2 =', '5' - 2);

// 4 — explicit coercion is how you stay in control.
console.log('Number("12px"):', Number('12px'));  // NaN — not partially parsed
console.log('Number(""):', Number(''));          // 0
console.log('Number([42]):', Number([42]));       // 42 (single-element array)
console.log('String(null):', String(null));       // "null"
console.log('Boolean(""):', Boolean(''));          // false

// 5 — floating-point is not exact.
console.log('0.1 + 0.2 =', 0.1 + 0.2);
```

## Expected Result

The console prints, in order:

```
typeof null: object
typeof NaN: number
5 + 2 = 7
"5" + 2 = 52
5 + "2" = 52
"5" - 2 = 3
Number("12px"): NaN
Number(""): 0
Number([42]): 42
String(null): null
Boolean(""): false
0.1 + 0.2 = 0.30000000000000004
```

`'5' + 2` becomes the string `"52"`, but `'5' - 2` becomes the number `3`. `Number('12px')`
is `NaN` (unlike `parseInt`, full conversion does **not** stop at the first letters), and
`0.1 + 0.2` exposes IEEE-754 binary floating point.

## Challenge

1. Predict, then verify, the output of `[] + []`, `[] + {}`, and `1 + 2 + '3'`. Explain
   each in terms of "to string vs to number."
2. There is only one `number` type for both integers and decimals. Log `Number.MAX_SAFE_INTEGER`
   and `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2`. When would you reach
   for `BigInt`?
3. Use `typeof` to write a tiny `kindOf(x)` helper that returns `"null"` for `null` and
   `"array"` for arrays, fixing the two `typeof` traps.

## Deep Dive

Coercion runs through internal spec operations: objects become primitives via
`ToPrimitive`, which calls `Symbol.toPrimitive`, then `valueOf`, then `toString` depending
on a "hint" (number or string). That is why `[42]` becomes `42` (its `toString` yields
`"42"`, then number-coerced) but `[1, 2]` becomes `NaN` (its `toString` is `"1,2"`, which
is not a number). You rarely call these directly, but they explain every "weird" result.

## Common Mistakes

- Trusting `typeof null === 'object'` to mean "it's an object." Always test `x === null`
  first.
- Using `+` to add when one operand might be a string from the DOM (input values are
  **always** strings) — you get concatenation, not arithmetic. Coerce with `Number(x)` first.
- Comparing floats with `===` (`0.1 + 0.2 === 0.3` is `false`). Compare within an epsilon.
- Assuming `Number('12px')` parses the leading digits. It returns `NaN`; only `parseInt`
  stops at the first non-digit.
