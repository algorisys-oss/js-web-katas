# Phase 16 — Storage & Offline

**Ladder rung:** 11 — Offline, Storage & PWAs (making the app survive a dead network).

## Goal

Learn to store real data and whole apps on the client and keep them working without a
connection. By the end of this phase you can persist structured data in IndexedDB, cache HTTP
responses with the Cache API, reason about the service-worker lifecycle, choose the right
offline caching strategy per request, and tie a manifest and worker together into a simple,
installable PWA.

## Why it matters

Networks fail — on trains, in elevators, on bad hotel Wi-Fi. An app that goes blank the moment
the connection drops feels broken; an offline-first app feels native. The platform gives you
everything to build that without a framework: a real client database (IndexedDB), a scriptable
response cache (Cache API), a programmable network proxy (the service worker), and a manifest
that promotes a page to an installable app. Knowing these by hand is what lets you read, debug,
and trust the tools (Workbox, framework PWA plugins) that generate them.

> **Sandbox note:** several of these APIs are heavily gated. IndexedDB and the Cache API need a
> same-origin context (katas 001 and 002 set `network: true`); service workers and full PWA
> installation **cannot** run inside the kata iframe, so katas 003 and 005 are conceptual —
> they ship real, study-ready code and feature-detect honestly. Kata 004 is mixed: the
> connectivity events and strategy logic run for real against in-memory stand-ins.

## Katas

1. [IndexedDB Basics](./001-indexeddb-basics.md) — `indexedDB.open`, `onupgradeneeded` object
   stores, transactions, and promisifying requests to `add`/`get`/`getAll` records.
2. [The Cache API](./002-the-cache-api.md) — `caches.open`, `put`/`match`/`keys`, cache
   versioning by deletion, and feature-detecting a gated, secure-context API.
3. [Service Worker Lifecycle](./003-service-worker-lifecycle.md) — register, install → waiting →
   activate → fetch, `skipWaiting`/`clients.claim`, scope, and the update flow (conceptual).
4. [Offline-First Patterns](./004-offline-first-patterns.md) — cache-first, network-first, and
   stale-while-revalidate, plus `navigator.onLine` and `online`/`offline` events.
5. [Building a Simple PWA](./005-building-a-simple-pwa.md) — the manifest, the service worker,
   install criteria, and `beforeinstallprompt`, tied together (conceptual capstone).

## What's next

Phase 17 — Frontend Security: XSS, sanitization and safe DOM APIs, Content Security Policy,
CORS from the browser side, and token/cookie/storage security.
