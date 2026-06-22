---
id: "phase-10/002-web-storage"
title: "Web Storage (local / session)"
phase: 10
sequence: 2
difficulty: "beginner"
tags: ["web-apis", "storage"]
prerequisites: ["phase-10/001-location-history-and-url"]
estimated_minutes: 12
starter: ["js"]
network: true
---

## Concept

The browser gives every origin two simple key/value stores:

- **`localStorage`** — persists until explicitly cleared. Survives reloads, tab closes, and
  browser restarts. Good for preferences, drafts, feature flags.
- **`sessionStorage`** — scoped to a single tab and cleared when that tab closes. Good for
  per-session state you don't want to leak between tabs.

Both share the same API: `setItem(key, value)`, `getItem(key)`, `removeItem(key)`,
`clear()`, plus `length` and `key(i)`. The catch: **values are always strings.** To store
an object you `JSON.stringify` on the way in and `JSON.parse` on the way out.

Storage is scoped to the **origin** (scheme + host + port), which is why this kata sets
`network: true` — that grants the sandbox `allow-same-origin`, without which any access to
`localStorage` throws a `SecurityError`.

A bonus: when another tab on the same origin changes `localStorage`, the browser fires a
`storage` event on every *other* tab. That makes it a lightweight cross-tab message bus.

## Key Insight

> Web Storage only stores strings, and only for one origin. `JSON.stringify`/`JSON.parse`
> to round-trip objects, and remember persistence differs: `local` survives, `session`
> dies with the tab.

## Experiment

```js
// localStorage requires same-origin — this kata enables it via `network: true`.
// Start clean so re-runs are predictable:
localStorage.removeItem('prefs');

// 1. Strings go in and out directly:
localStorage.setItem('theme', 'dark');
console.log('theme:', localStorage.getItem('theme'));

// 2. Objects must be serialized — storage holds strings only:
const prefs = { theme: 'dark', fontSize: 16, beta: true };
localStorage.setItem('prefs', JSON.stringify(prefs));

const raw = localStorage.getItem('prefs');
console.log('raw string :', raw);                 // a JSON string
const restored = JSON.parse(raw);
console.log('restored   :', restored);            // a real object again
console.log('fontSize+2 :', restored.fontSize + 2);

// 3. A common bug: forgetting to parse leaves you with a string:
console.log('typeof raw :', typeof raw);          // "string", not "object"

// 4. Remove and confirm absence (getItem returns null, not undefined):
localStorage.removeItem('theme');
console.log('after remove:', localStorage.getItem('theme')); // null

// 5. Cross-tab sync: another tab on this origin writing 'prefs' would fire this:
window.addEventListener('storage', (e) => {
  console.log('storage event:', e.key, '→', e.newValue);
});
console.log('listening for cross-tab storage events…');
```

## Expected Result

The **console** prints the round-trip and shows that an unparsed value is still a string:

```
theme: dark
raw string : {"theme":"dark","fontSize":16,"beta":true}
restored   : { theme: 'dark', fontSize: 16, beta: true }
fontSize+2 : 18
typeof raw : string
after remove: null
listening for cross-tab storage events…
```

The `storage` listener won't log here (it needs a *second* tab on the same origin to write
the key), but the registration succeeds. If you saw a `SecurityError` instead, the kata
would be missing `network: true`.

## Challenge

1. Switch every `localStorage` call to `sessionStorage`, reload the preview, and reason
   about which values would survive a reload vs a tab close.
2. Write a tiny `store` helper: `save(key, obj)` and `load(key)` that wrap
   `JSON.stringify`/`JSON.parse` and return `null` for missing keys without throwing on bad
   JSON (wrap `JSON.parse` in try/catch).
3. Storage is limited (typically ~5 MB per origin). Loop `setItem` with growing strings in
   a try/catch and observe the `QuotaExceededError` when you hit the cap.

## Deep Dive

Web Storage is **synchronous** — every read and write blocks the main thread. That is fine
for a few small keys, but storing megabytes, or reading on every scroll, will jank your
page. For larger or structured data, reach for **IndexedDB** (Phase 16), which is
asynchronous and can store typed objects, blobs, and indexes. Also note: anything in
`localStorage` is readable by any script on the page, so it is **not** a safe place for
secrets or auth tokens — that is a security topic (Phase 17), not just a storage one.

## Common Mistakes

- Storing an object directly: `setItem('x', obj)` saves the string `"[object Object]"`.
  Always `JSON.stringify` first.
- Forgetting to `JSON.parse` on read and then doing math/property access on a string.
- Assuming `localStorage` is available everywhere — it throws in sandboxed/cross-origin
  contexts and can be disabled by the user; wrap access in try/catch in production.
- Keeping tokens or secrets in `localStorage` — any XSS on the page can read them.
