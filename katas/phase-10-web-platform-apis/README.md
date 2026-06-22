# Phase 10 — Browser & Web Platform APIs

**Ladder rung:** 7 — Browser & Web Platform APIs.

## Goal

Move beyond the DOM and events into the wider browser platform. By the end of this phase
you can read and build URLs correctly, persist data on the client, schedule work without
blocking the main thread, react to visibility/DOM/size changes with observers, and reach
for privacy-sensitive APIs (clipboard, location, notifications) the way the platform
intends — behind feature detection, user gestures, and permission checks.

## Why it matters

Real applications are made of these APIs. Routing is `history` plus the `URL` API; saved
preferences and drafts are Web Storage; smooth lazy-loading and infinite scroll are
observers, not `scroll` listeners; "copy link," "find me," and "notify me" are
permission-gated capabilities. Knowing which API exists — and which gate guards it — is the
difference between fighting the browser and working with it.

## Katas

1. [Location, History & the URL API](./001-location-history-and-url.md) — a URL is
   structured data; parse and build it with `URL`/`URLSearchParams`, not string surgery.
2. [Web Storage (local / session)](./002-web-storage.md) — origin-scoped key/value stores,
   the string-only constraint, and the `storage` cross-tab event.
3. [Timers & Scheduling](./003-timers-and-scheduling.md) — `setTimeout`/`setInterval`,
   `queueMicrotask`, and feature-detecting `requestIdleCallback`; delays are minimums.
4. [Observers (Intersection, Mutation, Resize)](./004-observers.md) — let the browser
   notify you of visibility, DOM, and size changes instead of polling.
5. [Clipboard, Geolocation & Notifications](./005-clipboard-geolocation-notifications.md) —
   privacy-gated APIs: feature-detect, call inside a gesture, handle every permission
   outcome.

## What's next

Phase 11 — Networking & Data Fetching: the Fetch API, JSON, `Request`/`Response` and
headers, error handling and retries, and streaming responses.
