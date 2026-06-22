---
id: "phase-11/004-error-handling-and-retries"
title: "Error Handling & Retries"
phase: 11
sequence: 4
difficulty: "intermediate"
tags: ["networking", "fetch", "error-handling"]
prerequisites: ["phase-11/003-request-response-and-headers"]
estimated_minutes: 15
starter: ["js"]
network: true
---

## Concept

Real networks are unreliable, so production fetch code must distinguish — and handle —
**two different kinds of failure**:

1. **Network errors** — the request never completed: offline, DNS failure, connection
   refused, CORS block, or an aborted request. These **reject** the `fetch` promise, so
   they land in a `try/catch`.
2. **HTTP errors** — a response *did* come back, but with a non-2xx status (`404`, `429`,
   `500`). These **resolve** the promise with `ok === false`, so you must check and throw
   yourself.

A good pattern is one `getJson` helper that normalizes both into thrown `Error`s, then a
**retry-with-backoff** wrapper around it. Retrying blindly hammers a struggling server, so
you wait a little longer after each attempt — **exponential backoff** (`delay`, `delay*2`,
`delay*4`, …). You should retry **transient** failures (network errors, `5xx`, `429`) but
**not** permanent ones (`4xx` like `400`/`404` — retrying won't help). `AbortController`
lets you cap how long any single attempt may run.

## Key Insight

> Network errors reject; HTTP errors resolve with `ok: false`. Normalize both into thrown
> errors, then retry only the *transient* ones — with growing delays, not in a tight loop.

## Experiment

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function getJson(url) {
  const res = await fetch(url);          // network error → rejects here
  if (!res.ok) throw new HttpError(res.status, url); // HTTP error → we throw
  return res.json();
}

// Retry only transient failures, backing off 100ms, 200ms, 400ms, ...
async function withRetry(fn, { tries = 4, baseDelay = 100 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const transient = !(err instanceof HttpError) || err.status >= 500 || err.status === 429;
      if (!transient || attempt >= tries) throw err;
      const delay = baseDelay * 2 ** (attempt - 1);
      console.log(`attempt ${attempt} failed (${err.message}); retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
}

// 1) A real fixture succeeds on the first try:
const users = await withRetry(() => getJson('/fixtures/users.json'));
console.log('got users:', users.length);

// 2) A 404 is permanent — it should NOT be retried, it throws immediately:
try {
  await withRetry(() => getJson('/fixtures/missing.json'));
} catch (err) {
  console.log('gave up:', err.name, err.status, '(no retries — 404 is permanent)');
}
```

## Expected Result

The **console** prints:

```
got users: 5
gave up: HttpError 404 (no retries — 404 is permanent)
```

The first call succeeds immediately, so no "retrying" lines appear for it. The missing file
returns `404`, which `withRetry` classifies as **permanent**, so it throws on the first
attempt without any backoff.

## Challenge

1. Make `getJson` accept an `AbortSignal` and call `fetch(url, { signal })`. Create an
   `AbortController`, call `controller.abort()` after `50ms`, and confirm the abort surfaces
   as a rejected promise whose error `name` is `'AbortError'` — a network-class failure, so
   it *is* retried by the current rules. Should it be? Adjust the policy.
2. Add **jitter**: instead of exactly `baseDelay * 2 ** n`, use that value times a random
   factor between `0.5` and `1.0`. Why does randomized backoff help when many clients retry
   at once (the "thundering herd")?
3. Simulate a server that fails twice then succeeds: write a `flaky()` function backed by a
   counter that throws an `HttpError(503, ...)` on the first two calls and returns data on
   the third. Confirm `withRetry(flaky)` logs two "retrying" lines, then succeeds.

## Deep Dive

Exponential backoff comes from network congestion control (it's the same idea as Ethernet's
collision backoff). The numbers matter: with `baseDelay = 100` and 4 tries you wait at most
`100 + 200 + 400 = 700ms` total — bounded and predictable. Production clients add an
absolute ceiling (`Math.min(delay, maxDelay)`) so backoff never grows unboundedly, and they
honor a server's **`Retry-After`** response header on `429`/`503` instead of guessing. Pair
all of this with `AbortController` for a *timeout per attempt* and an overall deadline, and
you have the core of a resilient HTTP client.

## Common Mistakes

- Putting `if (!res.ok) throw` *outside* the `try`, so HTTP errors escape your retry logic.
  Normalize HTTP errors into thrown errors *inside* the retried function.
- Retrying `4xx` errors. A `400` or `404` won't fix itself; retrying just wastes time and
  load. Retry `5xx`, `429`, and network errors only.
- Retrying in a tight loop with no delay — that's a denial-of-service attack on your own
  backend. Always back off.
- Forgetting that an aborted/timed-out request rejects like any network error, and deciding
  on purpose whether such a failure should be retried.
