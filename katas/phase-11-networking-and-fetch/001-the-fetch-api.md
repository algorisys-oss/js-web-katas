---
id: "phase-11/001-the-fetch-api"
title: "The Fetch API"
phase: 11
sequence: 1
difficulty: "intermediate"
tags: ["networking", "fetch"]
prerequisites: ["phase-10/005-clipboard-geolocation-notifications"]
estimated_minutes: 12
starter: ["js"]
network: true
---

## Concept

`fetch()` is the browser's modern API for making HTTP requests. It is built on promises,
so it fits naturally with `async`/`await`. Calling `fetch(url)` returns a **promise that
resolves to a `Response`** as soon as the server's *headers* arrive — **before** the body
has downloaded. The body is read separately and lazily (you'll see why in later katas).

The single most important thing to learn first is this: **`fetch` only rejects on a
*network* failure** — DNS failure, connection refused, CORS block, offline. An HTTP error
status like **404** or **500 is still a "successful" fetch** from the promise's point of
view, because the browser *did* get a response back. To know whether the request actually
succeeded, you must inspect the `Response`:

- `response.ok` — `true` only for status codes in the **200–299** range.
- `response.status` — the numeric code (`200`, `404`, `500`, …).
- `response.statusText` — the human label (`"OK"`, `"Not Found"`).

In this phase, your code runs in a sandboxed module whose origin is the app, so you can
fetch the in-repo fixtures with an **absolute path** like `/fixtures/users.json`.

## Key Insight

> `fetch` resolves as long as a response came back at all. A `404` or `500` is a resolved
> promise with `ok === false` — you must check `response.ok` yourself.

## Experiment

```js
// Top-level await works here because learner code runs as a module.
const response = await fetch('/fixtures/users.json');

console.log('ok:', response.ok);            // true for 2xx
console.log('status:', response.status);    // 200
console.log('statusText:', response.statusText);

if (!response.ok) {
  throw new Error(`Request failed with status ${response.status}`);
}

const users = await response.json();        // read & parse the body
console.log('user count:', users.length);
console.log('first user:', users[0].name);

// A 404 still RESOLVES — fetch does not throw here:
const missing = await fetch('/fixtures/does-not-exist.json');
console.log('missing ok:', missing.ok, '— status:', missing.status);
```

## Expected Result

The **console** prints:

```
ok: true
status: 200
statusText: OK
user count: 5
first user: Ada Lovelace
missing ok: false — status: 404
```

The real file resolves with `ok: true`; the missing file *also* resolves — but with
`ok: false` and status `404`. Note that the missing fetch did **not** throw.

## Challenge

1. Wrap the fetch in a `try/catch` and fetch a deliberately bad URL such as
   `'http://10.255.255.1/'` (an unroutable host). Which path runs — the `catch`, or the
   `!response.ok` branch? Explain the difference between a network error and an HTTP error.
2. Log `response.type` and `response.url`. What is the `type` when you fetch a same-origin
   fixture versus a cross-origin URL?
3. Write a small `getJson(url)` helper that fetches, throws on `!ok`, and returns the
   parsed body — you'll reuse this idea throughout the phase.

## Deep Dive

`fetch` is defined by the [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/), which
also specifies CORS, the `Request`/`Response`/`Headers` objects, and how the body is a
readable stream. It replaced the old callback-and-state-machine `XMLHttpRequest`; the only
thing `fetch` still lacks that `XHR` had is built-in upload/download *progress events* —
for download progress you read the response body as a stream (kata 005). Cancellation is
done with `AbortController` (covered in Phase 5's async work and used again in kata 004).

## Common Mistakes

- Assuming `fetch` throws on `404`/`500`. It does not — only a *network* failure rejects
  the promise. Always check `response.ok`.
- Forgetting that `fetch(url)` resolves at the **headers**, not the full body. The body
  needs a second `await` (`response.json()`, `.text()`, …).
- Using a relative path like `fetch('users.json')` and being surprised it resolves against
  `about:srcdoc`. Use an absolute path (`/fixtures/users.json`) so it hits the app origin.
- Reading the body twice. A `Response` body can be consumed **once**; a second
  `.json()`/`.text()` throws "body stream already read."
