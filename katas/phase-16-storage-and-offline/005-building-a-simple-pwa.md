---
id: "phase-16/005-building-a-simple-pwa"
title: "Building a Simple PWA"
phase: 16
sequence: 5
difficulty: "advanced"
tags: ["offline", "pwa", "manifest"]
prerequisites: ["phase-16/004-offline-first-patterns"]
estimated_minutes: 15
starter: ["js"]
network: false
---

## Concept

A **Progressive Web App** is not a framework or a download — it is an ordinary website that
meets a few platform criteria, after which the browser lets users **install** it to the home
screen or app launcher, run it in its own window, and use it **offline**. Everything in this
phase comes together here. A PWA is three plain pieces wired together:

1. **A web app manifest** — `manifest.json`, linked from your HTML with
   `<link rel="manifest" href="/manifest.json">`. It declares the app's `name`, `icons`,
   `start_url`, `display` mode (`standalone` for an app-like window), and theme colors. This is
   what makes the app *installable* and gives it an identity outside the browser chrome.
2. **A service worker** — registered from the page (kata 003), precaching the **app shell** in
   `install` and serving it with an offline-first strategy (kata 004). This is what makes the
   app *work offline*.
3. **HTTPS** — installability and service workers both require a secure context.

When those are present, Chromium-family browsers fire a `beforeinstallprompt` event you can
capture to show your own "Install" button, calling `event.prompt()` on a user gesture. Treat
it as a progressive enhancement, not a guarantee: it is **non-standard and limited** — Safari
and Firefox don't fire it, and even some installable PWAs never do. There is nothing magic
underneath: a PWA is a regular page plus a manifest plus a worker.

## Key Insight

> A PWA = a normal website + a **manifest** (installable identity) + a **service worker**
> (offline) + **HTTPS**. No framework, no app store — just three platform pieces that promote a
> page to an installable, offline-capable app.

## Experiment

```js
// Conceptual capstone: installation and the worker can't happen in this sandbox.
// We feature-detect the pieces and show the manifest + wiring you would actually ship.

console.log('--- PWA readiness check ---');
console.log("service worker support:", 'serviceWorker' in navigator);
console.log("manifest support:", 'onbeforeinstallprompt' in window || 'BeforeInstallPromptEvent' in window);
console.log("Cache API:", 'caches' in window);
console.log("IndexedDB:", 'indexedDB' in window);
console.log("secure context:", typeof isSecureContext !== 'undefined' ? isSecureContext : 'unknown');

// The manifest you would serve at /manifest.json:
const manifest = {
  name: 'Notes PWA',
  short_name: 'Notes',
  start_url: '/',
  display: 'standalone',          // app-like window, no browser tab chrome
  background_color: '#ffffff',
  theme_color: '#4f46e5',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, // 512 needed for install
  ],
};
console.log('manifest.json:', JSON.stringify(manifest, null, 2));

// The page-side wiring (HTML <head> would also have:
//   <link rel="manifest" href="/manifest.json">)
async function bootstrapPwa() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('worker registered — app shell will be cached');
    } catch (e) {
      console.log('register failed (expected in sandbox):', e.name);
    }
  } else {
    console.log('No service worker here — running as a plain page.');
  }
}

// Capture the install prompt to power a custom "Install" button.
let deferredPrompt = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();        // stop the default mini-infobar
  deferredPrompt = e;        // stash it; call deferredPrompt.prompt() on a click
  console.log('install available — show your Install button');
});

bootstrapPwa();
```

## Expected Result

This is a **conceptual** capstone — the sandbox can neither register a worker nor trigger an
install. The console prints the readiness check (most browser features report `false` or
unavailable in this iframe), the full `manifest.json`, and the registration fallback:

```
--- PWA readiness check ---
service worker support: false
manifest support: false
Cache API: false
IndexedDB: true
secure context: ...
manifest.json: {
  "name": "Notes PWA",
  ...
}
No service worker here — running as a plain page.
```

On a real HTTPS origin with all the pieces, you'd instead see the worker register, the shell
precache, and — once the install criteria are met — a `beforeinstallprompt` event you turn into
a custom Install button.

## Challenge

1. List the **install criteria** Chromium enforces: served over HTTPS, a linked manifest with
   `name`/`short_name`, a `start_url`, a `display` of `standalone`/`fullscreen`/`minimal-ui`, and
   icons including at least a 192px and a 512px. Which one is easiest to get wrong?
2. Wire a real Install button: on click, `deferredPrompt.prompt()`, then `await
   deferredPrompt.userChoice` and log whether the user `accepted` or `dismissed`. Why must
   `prompt()` be called from a user gesture?
3. Add an **offline fallback page**: in the worker's `fetch` handler, when a *navigation*
   request fails the network and misses the cache, serve a precached `/offline.html`. Sketch the
   handler.

## Deep Dive

"Progressive" means **enhancement**: the same site works as a normal page everywhere, and on
capable browsers it *additionally* becomes installable and offline-capable — you never ship two
versions. The manifest gives the OS the app's identity (icon, name, window mode, even
`shortcuts` and `share_target`), while the service worker gives it resilience. Installed PWAs
launch from `start_url` in a `standalone` window with no address bar, which is why your offline
strategy must cover the app shell *and* the start URL. Modern extensions — Background Sync,
Periodic Sync, Push, the Badging API — layer onto this same foundation, but the irreducible core
is exactly these three pieces. Audit any real app with Lighthouse's PWA checks to see the
criteria enforced.

## Common Mistakes

- Expecting an "Install" prompt without meeting *every* criterion — a missing 512px icon or
  non-`standalone` `display` silently blocks installability.
- Registering a service worker but forgetting the manifest (or vice versa) — you need **both**
  for an installable, offline PWA.
- Calling `deferredPrompt.prompt()` outside a user gesture — browsers ignore it.
- Caching the app shell but not the `start_url`, so the installed app opens to a blank page when
  launched offline.
