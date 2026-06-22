---
id: "phase-19/003-mocking-fetch-and-timers"
title: "Mocking Fetch & Timers"
phase: 19
sequence: 3
difficulty: "advanced"
tags: ["testing", "networking", "async"]
prerequisites: ["phase-19/002-testing-dom-interactions"]
estimated_minutes: 15
starter: ["js"]
network: false
---

## Concept

A test must be **fast, deterministic, and offline**. Code that calls `fetch` or waits on
`setTimeout` is neither — the network is slow and flaky, and real time makes tests crawl.
The fix is to **replace those dependencies with fakes** you control.

**Mocking `fetch`:** save the real `globalThis.fetch`, then overwrite it with a stub that
returns a resolved `Promise` of a fake `Response`. A `Response` object is constructable in
the browser: `new Response(JSON.stringify(data), { status: 200 })`. Your code under test
still calls `await res.json()` exactly as in production — it can't tell the difference. The
stub also *records* how it was called, so you can assert the code requested the **right URL
with the right options**. Always restore the original in a `finally` so one test can't
leak its mock into the next.

**Faking timers:** rather than wait two real seconds, inject a fake clock. We model time as
a queue of scheduled callbacks and an `advance(ms)` that fires the ones that are due. Code
that takes a `setTimeout`-shaped function as a parameter can be tested instantly — you
*advance* time instead of *spending* it. (Real runners do this by swapping the global
timers; the principle is identical.)

Because we **stub** `fetch`, this kata makes **zero** real network requests —
`network: false`.

## Key Insight

> Don't test against the network or the wall clock — replace them with fakes you control.
> A mock lets you assert *how* your code called a dependency (URL, method, body), and a
> fake clock lets you *advance* time instead of waiting for it.

## Experiment

```js
// ---- tiny async-aware harness ----
let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`✓ PASS — ${name}`); }
  catch (err) { failed++; console.error(`✗ FAIL — ${name}\n    ${err.message}`); }
}
const assert = {
  equal: (a, b, m) => { if (a !== b) throw new Error(m || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); },
  ok: (v, m) => { if (!v) throw new Error(m || 'expected truthy'); },
};

// ---- code under test: a real fetch caller ----
async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { id: data.id, label: data.name.toUpperCase() };
}

// ---- a fetch mock that returns a fake Response and records calls ----
function mockFetch(body, init = { status: 200 }) {
  const calls = [];
  const stub = (url, options) => {
    calls.push({ url, options });
    return Promise.resolve(new Response(JSON.stringify(body), init));
  };
  stub.calls = calls;
  return stub;
}

await (async () => {
  const realFetch = globalThis.fetch;
  try {
    await test('loadUser maps the JSON response', async () => {
      globalThis.fetch = mockFetch({ id: 7, name: 'Ada' });
      const user = await loadUser(7);
      assert.equal(user.label, 'ADA');
      assert.equal(user.id, 7);
    });

    await test('loadUser requests the correct URL and headers', async () => {
      const stub = mockFetch({ id: 7, name: 'Ada' });
      globalThis.fetch = stub;
      await loadUser(7);
      assert.equal(stub.calls.length, 1);
      assert.equal(stub.calls[0].url, '/api/users/7');
      assert.equal(stub.calls[0].options.headers.Accept, 'application/json');
    });

    await test('loadUser throws on a 404 response', async () => {
      globalThis.fetch = mockFetch({}, { status: 404 });
      let threw = false;
      try { await loadUser(99); } catch { threw = true; }
      assert.ok(threw, 'expected loadUser to reject on HTTP 404');
    });
  } finally {
    globalThis.fetch = realFetch; // always restore — never leak a mock
  }
})();

// ---- a fake clock: advance time instead of waiting for it ----
function createClock() {
  let now = 0, id = 0;
  const scheduled = [];
  return {
    setTimeout: (fn, ms) => { const t = { id: ++id, at: now + ms, fn }; scheduled.push(t); return t.id; },
    advance(ms) {
      now += ms;
      scheduled
        .filter(t => t.at <= now)
        .sort((a, b) => a.at - b.at)
        .forEach(t => { scheduled.splice(scheduled.indexOf(t), 1); t.fn(); });
    },
  };
}

await test('debounced call fires only after the delay elapses', async () => {
  const clock = createClock();
  let calls = 0;
  // a debounce that takes its timer as a dependency (injectable for testing)
  function debounce(fn, ms, timer) {
    let pending;
    return () => { if (pending) return; pending = timer.setTimeout(() => { pending = null; fn(); }, ms); };
  }
  const onScroll = debounce(() => calls++, 200, clock);
  onScroll(); onScroll(); onScroll(); // three rapid calls
  assert.equal(calls, 0, 'nothing should fire before time advances');
  clock.advance(199);
  assert.equal(calls, 0, 'still nothing at 199ms');
  clock.advance(1);
  assert.equal(calls, 1, 'fires exactly once at 200ms');
});

console.log(`\n${passed} passed, ${failed} failed`);
```

## Expected Result

The console prints four passing tests — instantly, with no network or real waiting:

```
✓ PASS — loadUser maps the JSON response
✓ PASS — loadUser requests the correct URL and headers
✓ PASS — loadUser throws on a 404 response
✓ PASS — debounced call fires only after the delay elapses

4 passed, 0 failed
```

The 404 test exercises the *error* path, and the clock test verifies the debounce fires at
exactly 200 ms — without the test taking 200 ms.

## Challenge

1. Make `mockFetch` reject (`Promise.reject(new TypeError('Network error'))`) to simulate
   an offline device, and write a test asserting `loadUser` surfaces that failure.
2. Extend the fake clock with `setInterval`/`clearTimeout` and test a function that polls
   every 1000 ms, asserting it fired exactly 3 times after `advance(3000)`.
3. Replace the hand-rolled `stub.calls` with a tiny spy factory `spy(impl)` that records
   `spy.calls` for *any* function, then reuse it to assert a callback was invoked.

## Deep Dive

Vitest and Jest formalize all of this: `vi.fn()` / `jest.fn()` create spies that record
calls and let you stub return values; `vi.useFakeTimers()` swaps the global timer functions
so `vi.advanceTimersByTime(200)` fast-forwards them; and tools like **MSW** (Mock Service
Worker) intercept `fetch`/`XHR` at the network layer so your code stays *completely*
unaware it's mocked — closer to reality than monkey-patching `globalThis.fetch`. The
recurring lesson is **dependency injection**: code that receives its `fetch` and `setTimeout`
(or reaches them through a swappable global) is code you can test in milliseconds.

## Common Mistakes

- Forgetting to restore the real `fetch`/timers, so a mock leaks into later tests and
  produces baffling, order-dependent failures. Restore in `finally`.
- Asserting only the happy path. The 404, the network error, and the malformed-JSON cases
  are where real bugs live — mock them deliberately.
- Returning a bare object from the fetch stub instead of a real `Response`; the code under
  test calls `res.ok` and `res.json()`, which a plain object doesn't provide.
- Using real `setTimeout` in tests and `await`-ing actual delays — slow, flaky suites.
  Inject a clock and advance it.
