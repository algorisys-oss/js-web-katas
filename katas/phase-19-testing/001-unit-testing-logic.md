---
id: "phase-19/001-unit-testing-logic"
title: "Unit Testing Logic"
phase: 19
sequence: 1
difficulty: "intermediate"
tags: ["testing"]
prerequisites: ["phase-18/005-accessible-components"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

A **unit test** checks one small piece of behavior in isolation. The easiest thing to test
is a **pure function**: same input → same output, no DOM, no network, no clock. Most of
your app's real logic — formatting money, computing a total, reducing state — can be
written as pure functions, and pure functions are a joy to test.

In a real project you'd run tests with **Jest** or **Vitest**. This playground has no test
runner: your code runs as a single ES module inside a sandboxed iframe. So we'll build a
**tiny harness** — a `test()` function and an `assert` helper — that logs `✓ PASS` or
`✗ FAIL` to the console. Writing the harness yourself demystifies what a test framework
actually is: a loop that runs functions, catches thrown errors, and reports results.

Every good test follows **arrange → act → assert**: set up inputs, run the code under
test, then check the result. Keep each test focused on one behavior so a failure points
you straight at the cause.

## Key Insight

> A test framework is not magic: it runs your functions, catches thrown assertion errors,
> and prints pass/fail. The hard part is writing *pure, testable* code in the first place.

## Experiment

```js
// ---- a tiny test harness (this is all a framework's core really is) ----
let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ PASS — ${name}`);
  } catch (err) {
    failed++;
    console.error(`✗ FAIL — ${name}\n    ${err.message}`);
  }
}

const assert = {
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  ok(value, msg) {
    if (!value) throw new Error(msg || `expected a truthy value, got ${JSON.stringify(value)}`);
  },
  throws(fn, msg) {
    try { fn(); } catch { return; }
    throw new Error(msg || 'expected function to throw, but it did not');
  },
};

// ---- the pure function under test ----
function formatPrice(cents, currency = 'USD') {
  if (!Number.isInteger(cents)) throw new TypeError('cents must be an integer');
  const symbol = { USD: '$', EUR: '€' }[currency] ?? '?';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

// ---- tests: arrange → act → assert ----
test('formats whole dollars', () => {
  const result = formatPrice(500);            // arrange + act
  assert.equal(result, '$5.00');              // assert
});

test('rounds to two decimal places', () => {
  assert.equal(formatPrice(1999), '$19.99');
});

test('supports another currency symbol', () => {
  assert.equal(formatPrice(250, 'EUR'), '€2.50');
});

test('truthiness: a formatted string is non-empty', () => {
  assert.ok(formatPrice(0).length > 0);
});

test('throws on a non-integer amount', () => {
  assert.throws(() => formatPrice(5.5));
});

console.log(`\n${passed} passed, ${failed} failed`);
```

## Expected Result

The console prints five passing tests and a summary:

```
✓ PASS — formats whole dollars
✓ PASS — rounds to two decimal places
✓ PASS — supports another currency symbol
✓ PASS — truthiness: a formatted string is non-empty
✓ PASS — throws on a non-integer amount

5 passed, 0 failed
```

Break the function on purpose — change `(cents / 100)` to `(cents / 10)` — and you'll see
two `✗ FAIL` lines with a clear "expected … got …" message.

## Challenge

1. Add a `assert.deepEqual(a, b)` helper (compare with `JSON.stringify`) and a pure
   `cartTotal(items)` reducer, then test it with an array of `{ price, qty }` objects.
2. Add a *failing* test deliberately and confirm the summary line counts it. Why does
   throwing an `Error` (not returning `false`) make the harness simpler?
3. Make `formatPrice` handle negative amounts (e.g. refunds) and write a test that pins
   down the exact output you decided on (`-$5.00` vs `$-5.00`).

## Deep Dive

The `test`/`assert` shape you just built is essentially Jest's and Vitest's public API
(`test`, `expect`, matchers). Real runners add a lot around it — file discovery, isolated
module scopes, parallel workers, watch mode, code coverage, rich diffs — but the beating
heart is "run a function, catch the throw, report." Because the contract is just *throw on
failure*, any assertion library (Chai, Node's `assert`, your three-line object) plugs into
any runner.

## Common Mistakes

- Testing implementation details instead of behavior — assert on the *output*, not on
  which private helpers got called.
- Writing functions that read the DOM, `Date.now()`, or `fetch` inline, making them
  impossible to test in isolation; push those at the edges and keep the core pure.
- Returning `false` from a check instead of throwing — the harness can't tell a failed
  assertion from a function that legitimately returned `false`.
- One giant test that asserts ten things; when it fails you don't know which behavior
  broke. Prefer many small, named tests.
