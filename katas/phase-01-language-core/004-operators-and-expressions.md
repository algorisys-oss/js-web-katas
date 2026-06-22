---
id: "phase-01/004-operators-and-expressions"
title: "Operators & Expressions"
phase: 1
sequence: 4
difficulty: "intermediate"
tags: ["operators", "expressions"]
prerequisites: ["phase-01/003-equality-and-truthiness"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

Most JavaScript code is **expressions** — combinations of values and operators that
produce a value. Knowing how operators behave (and in what order) is what lets you read
dense real-world code without guessing.

The logical operators don't just return `true`/`false` — they **short-circuit** and return
one of their **operands**:

- `a || b` returns `a` if `a` is **truthy**, otherwise `b`. (Default with a fallback.)
- `a && b` returns `a` if `a` is **falsy**, otherwise `b`. (Guard before access.)
- `a ?? b` (nullish coalescing) returns `b` **only** when `a` is `null` or `undefined` —
  it does *not* treat `0` or `''` as missing, unlike `||`.

Two more modern operators tame deep property access:

- `obj?.a?.b` (**optional chaining**) returns `undefined` instead of throwing if a link in
  the chain is `null`/`undefined`.
- combined with `??`, it gives a clean "read deep, with a default" pattern.

Precedence and **associativity** decide grouping: `**` is right-associative
(`2 ** 3 ** 2` is `2 ** 9`), comparisons are left-associative (so `1 < 2 < 3` is
`(1 < 2) < 3`, i.e. `true < 3`, i.e. `1 < 3`). When in doubt, add parentheses.

## Key Insight

> `||` and `&&` return an operand, not a boolean, and short-circuit. Use `??` (not `||`)
> for defaults when `0` or `''` are valid values.

## Experiment

```js
// 1 — || and && return operands and short-circuit.
console.log('0 || "fallback":', 0 || 'fallback');       // "fallback"
console.log('"hi" || "fallback":', 'hi' || 'fallback'); // "hi"
console.log('1 && "x":', 1 && 'x');                     // "x"
console.log('0 && "x":', 0 && 'x');                     // 0 (short-circuits)

// 2 — ?? only falls back on null/undefined, NOT on 0 or "".
console.log('0 ?? "fallback":', 0 ?? 'fallback');         // 0
console.log('null ?? "fallback":', null ?? 'fallback');   // "fallback"

// 3 — optional chaining: no error on a missing link.
const user = { profile: { name: 'Ada' } };
console.log('user?.profile?.name:', user?.profile?.name);   // "Ada"
console.log('user?.address?.city:', user?.address?.city);   // undefined

// 4 — associativity surprises.
console.log('2 ** 3 ** 2:', 2 ** 3 ** 2);   // 512  (right-assoc → 2 ** 9)
console.log('1 < 2 < 3:', 1 < 2 < 3);       // true (true→1, 1 < 3)
console.log('3 > 2 > 1:', 3 > 2 > 1);       // false (true→1, 1 > 1 is false)

// 5 — + is overloaded; left-to-right evaluation matters.
console.log('1 + 2 + "3":', 1 + 2 + '3');   // "33"
console.log('"1" + 2 + 3:', '1' + 2 + 3);   // "123"
```

## Expected Result

The console prints, in order:

```
0 || "fallback": fallback
"hi" || "fallback": hi
1 && "x": x
0 && "x": 0
0 ?? "fallback": 0
null ?? "fallback": fallback
user?.profile?.name: Ada
user?.address?.city: undefined
2 ** 3 ** 2: 512
1 < 2 < 3: true
3 > 2 > 1: false
1 + 2 + "3": 33
"1" + 2 + 3: 123
```

`3 > 2 > 1` is `false` because `3 > 2` is `true`, which coerces to `1`, and `1 > 1` is
`false`. And `2 ** 3 ** 2` is `512` because `**` groups right-to-left into `2 ** 9`.

## Challenge

1. Combine optional chaining and `??`: write one expression that reads
   `user.settings.theme` and defaults to `'light'` when any link is missing **or** the
   theme is explicitly `null`.
2. Predict `'' || 'a'`, `'' ?? 'a'`, and `0 ?? 0 || 'x'`. (The last one is a syntax error
   without parentheses — find out why `??` can't mix with `||`/`&&` unparenthesized.)
3. Use the conditional (ternary) operator and short-circuiting to log a greeting only when
   `user.profile?.name` exists, without an `if` statement.

## Deep Dive

`??` was added specifically to fix the `||`-default bug: before it, `count || 10` wrongly
replaced a valid `0` with `10`. The spec forbids mixing `??` with `||`/`&&` without
parentheses precisely because their precedence relationship is non-obvious, so the language
makes you disambiguate with `(a ?? b) || c`. Optional chaining also **short-circuits the
whole chain**: in `a?.b.c`, if `a` is nullish the entire `.b.c` is skipped and the result
is `undefined`.

## Common Mistakes

- Using `value || default` when `0`, `''`, or `false` are legitimate values — they're
  falsy, so `||` discards them. Reach for `??`.
- Forgetting `**` is right-associative and writing `-2 ** 2` (a syntax error — JS forces
  you to write `(-2) ** 2` or `-(2 ** 2)` to make intent explicit).
- Chaining comparisons like `1 < x < 10` expecting math-style range checks. Write
  `1 < x && x < 10` instead.
- Assuming `a?.b` guards `b` from being missing too. It only guards `a`; `a?.b.c` still
  throws if `a.b` is nullish.
