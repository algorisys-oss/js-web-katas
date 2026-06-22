---
id: "phase-16/004-offline-first-patterns"
title: "Offline-First Patterns"
phase: 16
sequence: 4
difficulty: "advanced"
tags: ["offline", "caching-strategies"]
prerequisites: ["phase-16/003-service-worker-lifecycle"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

Once a service worker can intercept `fetch` (kata 003) and read the Cache API (kata 002), the
real question is **strategy**: for *this* request, do you trust the cache or the network first?
There is no single right answer — it depends on whether the resource is static, fresh-sensitive,
or somewhere between. The four classic strategies:

- **Cache-first** — check the cache; only hit the network on a miss. Fast and offline-proof.
  Best for **versioned static assets** (hashed JS/CSS, fonts, icons) that never change in place.
- **Network-first** — try the network; fall back to the cache when it fails. Best for **fresh
  data** (API responses, a news feed) where staleness matters more than a little latency.
- **Stale-while-revalidate** — return the cached copy *immediately* and fetch a fresh copy in
  the background to update the cache for next time. Fast *and* eventually fresh; great for
  avatars, feeds, content that can lag one load.
- **Cache-only / Network-only** — the degenerate ends, for a fully precached shell or for
  requests that must never be cached (analytics, auth).

You also need to **know you're offline**. `navigator.onLine` is a quick (if imperfect) hint,
and the `online`/`offline` window events fire as connectivity changes — both work in a normal
page and drive the UI ("You're offline — showing saved data").

## Key Insight

> Offline-first is a routing decision per request: **cache-first** for things that don't change,
> **network-first** for things that must be fresh, **stale-while-revalidate** when you want
> instant *and* eventually-fresh. The strategy is the architecture.

## Experiment

```js
// onLine + online/offline events DO work in a normal context. The strategies below are
// shown against a tiny in-memory cache so they actually run here, no network required.

console.log('navigator.onLine:', navigator.onLine);
addEventListener('online', () => console.log('event: back online'));
addEventListener('offline', () => console.log('event: went offline'));

// A stand-in "cache" and "network" so the strategies are runnable in the sandbox.
const cache = new Map([['/config', 'CACHED config (v1)']]);
let online = true;
const network = (url) =>
  online
    ? Promise.resolve(`NETWORK ${url} (v2)`)
    : Promise.reject(new Error('offline'));

// Cache-first: cache wins, network only on miss.
async function cacheFirst(url) {
  if (cache.has(url)) return cache.get(url);
  const fresh = await network(url);
  cache.set(url, fresh);
  return fresh;
}

// Network-first: try network, fall back to cache when it throws.
async function networkFirst(url) {
  try {
    const fresh = await network(url);
    cache.set(url, fresh);
    return fresh;
  } catch {
    return cache.get(url) ?? 'NO CACHE + OFFLINE';
  }
}

// Stale-while-revalidate: return cache now, refresh in the background.
function staleWhileRevalidate(url) {
  const cached = cache.get(url);
  network(url).then((fresh) => cache.set(url, fresh)).catch(() => {});
  return cached ?? network(url);
}

(async () => {
  console.log('cache-first /config:', await cacheFirst('/config'));       // from cache
  console.log('network-first /config:', await networkFirst('/config'));   // refreshed to v2
  console.log('SWR /config (now):', await staleWhileRevalidate('/config')); // instant, was v2

  online = false; // simulate losing the network
  console.log('network-first while offline:', await networkFirst('/config')); // falls back
})();
```

## Expected Result

`navigator.onLine` and the `online`/`offline` event wiring run for real; the strategy demo runs
against the in-memory stand-ins. The **console** prints something like:

```
navigator.onLine: true
cache-first /config: CACHED config (v1)
network-first /config: NETWORK /config (v2)
SWR /config (now): NETWORK /config (v2)
network-first while offline: NETWORK /config (v2)
```

The last line falls back to the *cached* value (which network-first updated to v2 a moment
earlier) because `network()` now rejects. If your browser fires real connectivity changes,
you'll also see the `online`/`offline` event logs.

## Challenge

1. Add a **timeout race** to network-first: `Promise.race([network(url), timeout(3000)])` so a
   slow network falls back to cache instead of hanging. Why is a plain network-first risky on a
   flaky connection?
2. Give stale-while-revalidate a way to tell the page "fresher data arrived" (e.g. resolve a
   second promise or `postMessage`), so the UI can update after the background refresh lands.
3. Decide a strategy for each: hashed `app.abc123.js`, a `/api/notifications` feed, a user
   avatar image, and a `POST /track` analytics beacon. Justify each choice.

## Deep Dive

`navigator.onLine` only knows whether the device has a network *interface* up — it can be
`true` on a captive-portal Wi-Fi that reaches nothing. Treat it as a hint, not truth; the
authoritative signal is whether your `fetch` actually succeeds, which is why robust apps lean on
the *fallback* paths above rather than pre-checking `onLine`. In a real service worker these
strategies live in the `fetch` handler, often routed by URL pattern (one rule for `/api/`,
another for static assets) — exactly what libraries like Workbox generate. Writing them once by
hand, as here, is what lets you read and debug that generated code.

## Common Mistakes

- Trusting `navigator.onLine === true` as proof the network works — it only reflects an
  interface being up, not reachability.
- Using cache-first for data that must be fresh, then wondering why users see stale content
  until they hard-refresh.
- Forgetting that stale-while-revalidate shows *last* load's data on *this* load — fine for
  feeds, wrong for a bank balance.
- Caching `POST`/auth/analytics requests — only cache safe, idempotent `GET`s.
