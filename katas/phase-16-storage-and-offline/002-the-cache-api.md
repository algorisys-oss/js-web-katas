---
id: "phase-16/002-the-cache-api"
title: "The Cache API"
phase: 16
sequence: 2
difficulty: "intermediate"
tags: ["storage", "offline", "cache"]
prerequisites: ["phase-16/001-indexeddb-basics"]
estimated_minutes: 13
starter: ["js"]
network: true
---

## Concept

IndexedDB stores *your data*. The **Cache API** stores *HTTP responses* — the actual
`Request`/`Response` pairs that make up your app: HTML, CSS, JS, images, fonts. It is the
storage layer that makes offline-first apps possible, and it is the cache a **service worker**
reaches into to answer requests when the network is gone (kata 003).

It is a promise-based key-value store where the **key is a Request (or URL)** and the
**value is a Response**:

- `caches.open(name)` → opens (or creates) a named `Cache` bucket.
- `cache.put(request, response)` → store a response under a request.
- `cache.add(url)` / `cache.addAll([...])` → fetch and store in one step.
- `cache.match(request)` → look up a stored response (or `undefined`).
- `caches.keys()` / `cache.keys()` → list cache buckets / cached requests.
- `caches.delete(name)` → drop a whole bucket (how you do cache versioning).

`Response` bodies are single-use streams, so to both cache *and* use one you must
`response.clone()` first.

## Key Insight

> The Cache API is a store of `Request → Response` pairs. It is not the HTTP cache and not
> IndexedDB — it is the explicit, scriptable cache your offline strategy reads from and
> writes to.

## Experiment

```js
// The Cache API needs a secure, same-origin context. We set network: true, but the
// sandbox may STILL withhold it — so feature-detect and report honestly.
(async () => {
  if (!('caches' in window)) {
    console.log('Cache API (caches) is unavailable in this sandbox.');
    console.log('Below is the exact code you would run where it IS available:');
    console.log("  const cache = await caches.open('v1');");
    console.log("  await cache.put('/hello', new Response('Hi from cache'));");
    console.log("  const hit = await cache.match('/hello');");
    return;
  }

  const cache = await caches.open('demo-v1');

  // Store a hand-made Response under a URL key (no network needed for put()).
  await cache.put('/greeting', new Response('Hello from the Cache API', {
    headers: { 'Content-Type': 'text/plain' },
  }));
  await cache.put('/answer', new Response(JSON.stringify({ answer: 42 }), {
    headers: { 'Content-Type': 'application/json' },
  }));
  console.log('Stored 2 responses');

  // Look one up and read its body.
  const hit = await cache.match('/greeting');
  console.log('match("/greeting"):', hit ? await hit.text() : 'MISS');

  // List what is in this cache, and which cache buckets exist.
  const requests = await cache.keys();
  console.log('cached URLs:', requests.map((r) => new URL(r.url).pathname).join(', '));
  console.log('cache buckets:', await caches.keys());

  // Versioning = delete the old bucket.
  await caches.delete('demo-v1');
  console.log('Deleted demo-v1; buckets now:', await caches.keys());
})();
```

## Expected Result

The Cache API requires a secure, same-origin context. We request it via `network: true`, but
sandboxed iframes may still block it — so the result depends on your browser. **Either:**

The feature is available and the console prints:

```
Stored 2 responses
match("/greeting"): Hello from the Cache API
cached URLs: /greeting, /answer
cache buckets: ["demo-v1"]
Deleted demo-v1; buckets now: []
```

**Or** it is gated, and the console prints the honest fallback message plus the example code.
Both outcomes are "correct" — the point is the API shape and the feature-detection guard.

## Challenge

1. Build a tiny "install" step: `cache.addAll(['/', '/app.css', '/app.js'])`. Why does
   `addAll` reject the *whole* batch if any single request fails (atomic precaching)?
2. Implement a `matchOrFetch(url)` helper: return `cache.match(url)` if present, otherwise
   `fetch` it, `put` a `clone()` in the cache, and return the response. (This is "cache-first".)
3. Inspect a `Response`'s `status` and `headers` after `match`. Why can a cached `Response`
   with an `opaque` type (from a `no-cors` cross-origin fetch) not have its body or status read?

## Deep Dive

The Cache API is deliberately *not* the browser's built-in HTTP cache: it ignores
`Cache-Control` and `Expires` entirely. You decide what goes in, what comes out, and when to
evict — which is exactly what an offline app needs. Cache storage counts against the origin's
storage quota (shared with IndexedDB), and the browser may evict whole origins under pressure.
Naming buckets with a version suffix (`assets-v3`) and deleting old buckets on activate is the
standard cache-busting pattern you will wire into a service worker next.

## Common Mistakes

- Reading a `Response` body twice — bodies are one-shot streams; `clone()` before you consume.
- Expecting `caches` to exist on plain HTTP or in a non-secure context — it requires HTTPS (or
  `localhost`) and a secure, same-origin context.
- Confusing the Cache API with the HTTP cache; the Cache API ignores `Cache-Control` headers.
- Letting old caches pile up — without explicit `caches.delete()` of old versions, stale assets
  linger and quota fills.
