---
id: "phase-11/003-request-response-and-headers"
title: "Request, Response & Headers"
phase: 11
sequence: 3
difficulty: "intermediate"
tags: ["networking", "fetch", "headers"]
prerequisites: ["phase-11/002-working-with-json-apis"]
estimated_minutes: 14
starter: ["js"]
network: true
---

## Concept

`fetch` has a two-argument form, `fetch(input, init)`, but the Fetch Standard models the
request as a first-class **`Request`** object you can build, inspect, and reuse. Likewise a
**`Response`** is a real object with a status, headers, and a body. Both carry a
**`Headers`** object — a case-insensitive multimap with a small, deliberate API:

- `headers.get(name)` — the value (or `null` if absent).
- `headers.has(name)` — boolean.
- `headers.set(name, value)` / `headers.append(name, value)` — write (on requests you build).
- iterate with `for...of`, `.entries()`, `.keys()`, `.values()`.

Header names are **case-insensitive**: `headers.get('Content-Type')` and
`headers.get('content-type')` return the same value. Building a `Request` explicitly is
useful because you can pass it straight to `fetch`, clone it, and read its `method`, `url`,
and `headers` like any other object — which is exactly how service workers (Phase 16) and
test mocks intercept traffic.

## Key Insight

> `Request` and `Response` are objects, not just arguments. Their `Headers` is a
> case-insensitive map: use `get`, `has`, `set` — never index it like a plain object.

## Experiment

```js
// Build a Request object explicitly instead of passing a URL string.
const request = new Request('/fixtures/profile.json', {
  method: 'GET',
  headers: { Accept: 'application/json' },
});

console.log('method:', request.method);
console.log('request Accept header:', request.headers.get('accept')); // case-insensitive

const response = await fetch(request);

// Inspect the RESPONSE headers the server (here, the static file server) sent back.
console.log('response.ok:', response.ok);
console.log('has content-type:', response.headers.has('content-type'));
console.log('content-type:', response.headers.get('content-type'));

console.log('--- all response headers ---');
for (const [name, value] of response.headers) {
  console.log(`${name}: ${value}`);
}

const profile = await response.json();
console.log('loaded:', profile.name, '— followers:', profile.stats.followers);
```

## Expected Result

The **console** prints (header *values* vary by environment, but the shape is fixed):

```
method: GET
request Accept header: application/json
response.ok: true
has content-type: true
content-type: application/json; charset=utf-8
--- all response headers ---
content-type: application/json; charset=utf-8
...more headers...
loaded: Ada Lovelace — followers: 1843
```

`request.headers.get('accept')` returns the value you set even though you queried it in a
different case. The `content-type` of the JSON fixture starts with `application/json`.

## Challenge

1. Build a `Headers` object directly: `const h = new Headers()`, then `h.append('X-Trace',
   'a')` and `h.append('X-Trace', 'b')`. Log `h.get('x-trace')`. How does `append` differ
   from `set` for a repeated name?
2. Read `response.headers.get('content-length')` and compare it with
   `(await response.text()).length`. When are these equal, and when not (think encodings)?
3. Create the request two different ways — `fetch(url, init)` and `fetch(new Request(url,
   init))` — and confirm they behave identically. Why might you prefer the `Request` form?

## Deep Dive

Some response headers are **forbidden** to read from JavaScript for security: a same-origin
response exposes everything, but a cross-origin response only exposes a short "CORS-safelisted"
set (`cache-control`, `content-type`, `expires`, …) unless the server opts in with
`Access-Control-Expose-Headers`. That's why `response.headers` can look emptier than what
you see in DevTools' Network panel — the browser hides the rest from your script. Likewise,
some **request** headers (`Host`, `Content-Length`, `Origin`) are set by the browser and
cannot be overridden from `fetch`; the Fetch Standard calls these "forbidden header names."

## Common Mistakes

- Treating `Headers` like a plain object: `headers['Content-Type']` is `undefined`. Use
  `headers.get('content-type')`.
- Expecting header-name case to matter. It doesn't — lookups are case-insensitive.
- Assuming you can read every response header in JavaScript. Cross-origin responses hide
  all but the CORS-safelisted ones unless the server exposes them.
- Confusing `set` (replace) with `append` (add another value for the same name).
