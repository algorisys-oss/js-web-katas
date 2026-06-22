---
id: "phase-19/004-testing-async-code"
title: "Testing Async Code"
phase: 19
sequence: 4
difficulty: "advanced"
tags: ["testing", "async"]
prerequisites: ["phase-19/003-mocking-fetch-and-timers"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

Async code is where tests quietly lie. The danger is the **forgotten `await`**: if your
test function returns before the promise settles, the runner records a pass *before the
assertion ever runs*. A test that can never fail is worse than no test.

The cure is to make the harness **async-aware** and to `await` everything:

- Make `test(name, fn)` `await fn()`, and make `fn` an `async` function. Now a rejected
  promise (or a thrown assertion) propagates to the harness's `catch`.
- To test a **resolved** value: `const result = await thing(); assert.equal(result, ...)`.
- To test a **rejection**: you can't just call the function — you must `await` it inside a
  `try/catch` and assert the `catch` ran. Wrap that in an `expectRejects` helper so the
  intent is obvious and you can't accidentally let a non-throwing call pass.

A subtle trap: `await` only waits for *one* promise. If a function returns an array of
promises, you must `await Promise.all(...)`. And asserting *inside* a `.then()` without
returning the promise chain means the assertion runs after the test already finished.

## Key Insight

> The #1 async-test bug is a forgotten `await`: the test finishes and reports PASS before
> the assertion runs. Always `await` the thing you're testing — and to test a rejection,
> `await` it inside `try/catch` and assert the catch fired.

## Experiment

```js
// ---- async-aware harness ----
let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`✓ PASS — ${name}`); }
  catch (err) { failed++; console.error(`✗ FAIL — ${name}\n    ${err.message}`); }
}
const assert = {
  equal: (a, b, m) => { if (a !== b) throw new Error(m || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); },
  ok: (v, m) => { if (!v) throw new Error(m || 'expected truthy'); },
};
// assert that an async function rejects (and optionally matches a message)
async function expectRejects(promiseOrFn, re) {
  const p = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
  try { await p; }
  catch (err) {
    if (re && !re.test(err.message)) throw new Error(`rejected, but message ${JSON.stringify(err.message)} didn't match ${re}`);
    return; // good: it rejected
  }
  throw new Error('expected the promise to reject, but it resolved');
}

// ---- async code under test ----
const wait = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));

async function fetchScore(id) {
  if (id < 0) throw new Error('invalid id');         // sync throw in an async fn → rejection
  const raw = await wait(5, id * 10);                // simulated async work
  return raw + 1;
}

async function fetchAll(ids) {
  return Promise.all(ids.map(fetchScore));           // many promises in flight
}

// ---- tests: every one awaits ----
await test('resolves to the computed value', async () => {
  const score = await fetchScore(4);                 // ← await, or the test lies
  assert.equal(score, 41);
});

await test('awaits multiple promises with Promise.all', async () => {
  const scores = await fetchAll([1, 2, 3]);
  assert.equal(scores.join(','), '11,21,31');
});

await test('rejects on an invalid id', async () => {
  await expectRejects(() => fetchScore(-1), /invalid id/);
});

await test('a forgotten await would hide this failure (we await, so it is caught)', async () => {
  // Demonstrates the trap: if we DIDN'T await, the catch below would never run
  // and the test would pass even though the value is wrong.
  const score = await fetchScore(0);
  assert.equal(score, 1);                            // 0 * 10 + 1 === 1
});

console.log(`\n${passed} passed, ${failed} failed`);
```

## Expected Result

The console prints four passing tests:

```
✓ PASS — resolves to the computed value
✓ PASS — awaits multiple promises with Promise.all
✓ PASS — rejects on an invalid id
✓ PASS — a forgotten await would hide this failure (we await, so it is caught)

4 passed, 0 failed
```

Now prove the trap: in the first test, delete the `await` before `fetchScore(4)` and change
the expected value to something wrong. The test still **passes** — because the assertion
runs against a pending `Promise`, not the number. That false pass is exactly what the
`await` prevents.

## Challenge

1. Add `Promise.race` to `fetchScore`: race the work against `wait(2)` that rejects with
   `"timeout"`. Write a test (using `expectRejects(..., /timeout/)`) proving the timeout
   wins, then a passing test proving fast work beats the timeout.
2. Make `expectRejects` also assert the error is a specific class (`err instanceof
   TypeError`). When is asserting the *type* better than asserting the *message*?
3. Write a deliberately broken test that asserts inside a non-returned `.then()` and watch
   it pass even when wrong. Then fix it two ways: `return promise.then(...)` and
   `await`/`assert`.

## Deep Dive

This is why real runners give you async-first matchers: Vitest/Jest's
`await expect(fn()).rejects.toThrow(/invalid id/)` and `.resolves.toEqual(...)` wrap the
`try/await/catch` dance so you physically cannot forget to wait — `expect(...).rejects`
*returns a promise* you must await, and ESLint rules like `jest/valid-expect` and
`no-floating-promises` flag the ones you don't. Combine this with the fake timers from the
previous kata (`vi.advanceTimersByTime`) to test time-based async logic — debounces,
retries with backoff, polling — deterministically and instantly.

## Common Mistakes

- Forgetting `await`, so the test ends before the assertion runs and a broken function
  reports PASS — the most common async-test bug by far.
- Testing rejection by *calling* the function without `await`ing it; the rejection becomes
  an unhandled promise rejection somewhere else, and the test passes regardless.
- Asserting inside a `.then()` callback without `return`ing the chain — the assertion fires
  after the test has already resolved.
- `await`-ing a single promise when the function actually produced many; wrap them in
  `Promise.all` so every one is awaited (and failures aren't swallowed).
