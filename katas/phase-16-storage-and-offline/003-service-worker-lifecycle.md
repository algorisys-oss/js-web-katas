---
id: "phase-16/003-service-worker-lifecycle"
title: "Service Worker Lifecycle"
phase: 16
sequence: 3
difficulty: "advanced"
tags: ["offline", "service-worker"]
prerequisites: ["phase-16/002-the-cache-api"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

A **service worker** is a script that runs in its own thread, separate from any page, and
sits **between your app and the network** as a programmable proxy. It has no DOM access; it
exists to intercept `fetch` events and serve responses — from the Cache API (kata 002), from
the network, or from anywhere you decide. It is the engine of offline-first apps and PWAs.

What makes it tricky is its **lifecycle**, which is intentionally decoupled from the page so
an update can never break a running tab:

1. **register** — a page calls `navigator.serviceWorker.register('/sw.js')`.
2. **install** — fires once per new worker version; the place to **precache** assets.
3. **waiting** — if an old worker still controls open tabs, the new one waits.
4. **activate** — fires when the new worker takes control; the place to **delete old caches**.
5. **fetch** — once active and controlling a page, it intercepts that page's requests.

Two methods cut the waiting short: `self.skipWaiting()` (in `install`) makes a new worker
activate immediately, and `self.clients.claim()` (in `activate`) makes it control already-open
pages without a reload. Scope matters too: a worker at `/sw.js` controls the whole origin; one
at `/app/sw.js` controls only `/app/`.

## Key Insight

> A service worker is a network proxy with a deliberately slow lifecycle:
> **install → waiting → activate → fetch**. The waiting state protects open tabs from a
> half-updated app; `skipWaiting` + `clients.claim` let you opt out of the wait.

## Experiment

```js
// Service workers CANNOT register inside this sandboxed iframe. This kata is conceptual:
// the code below is exactly what you would ship, and we feature-detect to prove the point.

// --- In your PAGE script (app.js) ---
async function registerWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are unsupported here (no navigator.serviceWorker).');
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js'); // scope: whole origin
    console.log('Registered, scope:', reg.scope);
  } catch (err) {
    console.log('Registration failed (expected in this sandbox):', err.name);
  }
}

console.log("'serviceWorker' in navigator:", 'serviceWorker' in navigator);
registerWorker();

// --- This is the worker file itself (sw.js) — shown for study, not executed here ---
const SW_SOURCE = `
  const CACHE = 'app-v1';
  const ASSETS = ['/', '/index.html', '/app.css', '/app.js'];

  self.addEventListener('install', (event) => {
    // Precache the app shell, then activate without waiting.
    event.waitUntil(
      caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    // Delete caches from previous versions, then claim open clients.
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    // Cache-first: serve from cache, fall back to the network.
    event.respondWith(
      caches.match(event.request).then((hit) => hit || fetch(event.request))
    );
  });
`;
console.log('sw.js source length (chars):', SW_SOURCE.length);
```

## Expected Result

This kata is **conceptual** — the sandbox cannot host a service worker. The console prints:

```
'serviceWorker' in navigator: false
Service workers are unsupported here (no navigator.serviceWorker).
sw.js source length (chars): <some number>
```

(If your browser *does* expose `navigator.serviceWorker` in the iframe, registration still
fails — sandboxed iframes can't control a scope — and you'll see the "Registration failed"
branch with an error name like `SecurityError`.) The takeaway is the **lifecycle and the
event handlers**, not a running worker.

## Challenge

1. Trace what happens when you ship a new `sw.js`: the browser byte-compares the file, sees a
   change, runs `install` for the new worker, but holds it in **waiting** until every tab using
   the old worker closes. Why is that the safe default, and what does `skipWaiting` trade away?
2. Add a `message` listener so the page can `postMessage({type:'SKIP_WAITING'})` and the worker
   calls `self.skipWaiting()` — the "Update available, reload?" pattern. Sketch both sides.
3. Explain why `event.waitUntil(...)` is required in `install`/`activate`: what happens to the
   precache if you start it but don't pass the promise to `waitUntil`?

## Deep Dive

A service worker's lifecycle is independent of pages on purpose: a tab opened yesterday must
keep working even as you deploy ten times. That is why a new worker **installs in the
background** and only **activates** when it is safe — by default, when the old worker has no
clients. The cost is that updates lag by one page load unless you use `skipWaiting` +
`clients.claim`, which can swap the controlling worker mid-session (fine for stateless asset
serving, risky if old and new code share in-flight state). Service workers also require HTTPS
(or `localhost`), terminate when idle to save memory, and respawn on the next event — so never
keep important state in a worker variable; persist it to the Cache API or IndexedDB.

## Common Mistakes

- Expecting a freshly registered worker to control the current page — it doesn't until the next
  load, unless it calls `clients.claim()`.
- Forgetting `event.waitUntil()`, so the worker is considered "done" before precaching finishes
  and may be killed mid-install.
- Never deleting old caches in `activate`, leaving stale assets to fill the storage quota.
- Putting the worker file in a subfolder and being surprised it can't intercept requests
  outside its narrower **scope**.
