---
id: "phase-10/001-location-history-and-url"
title: "Location, History & the URL API"
phase: 10
sequence: 1
difficulty: "beginner"
tags: ["web-apis", "navigation"]
prerequisites: ["phase-09/005-transitions-and-requestanimationframe"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

A URL is more than a string — it is structured data, and the browser gives you objects to
read and build it correctly. Three pieces work together:

- **`location`** — the current address of the page. `location.href`, `.pathname`,
  `.search`, `.hash`, and `.origin` let you read the parts; assigning to `location.href`
  navigates.
- **`history`** — the back/forward stack. `history.back()`, `history.forward()`, and
  crucially `history.pushState(state, '', url)` / `replaceState(...)` change the URL the
  user sees **without a full page reload**. This is the engine behind single-page-app
  routing; the `popstate` event fires when the user navigates the history.
- **The `URL` and `URLSearchParams` APIs** — pure objects (no page needed) for parsing and
  composing URLs and query strings safely, with correct percent-encoding.

Parsing URLs by hand with `split('?')` and `split('&')` breaks on encoded characters,
repeated keys, and empty values. The platform already solved this. Reach for `URL`.

## Key Insight

> Never parse or build a URL with string surgery. `new URL()` and `URLSearchParams` handle
> encoding, repeated keys, and edge cases for you — correctly.

## Experiment

```js
// URL and URLSearchParams are pure JS — they work anywhere, no live page required.
const url = new URL('https://shop.example.com/search?q=blue+jeans&page=2#reviews');

console.log('origin  :', url.origin);
console.log('pathname:', url.pathname);
console.log('search  :', url.search);
console.log('hash    :', url.hash);

const params = url.searchParams;
console.log('q       :', params.get('q'));      // "blue jeans" — '+' decoded
console.log('page    :', params.get('page'));   // "2"

// Mutating params re-serializes (and re-encodes) the URL for you:
params.set('page', '3');
params.append('tag', 'sale');
params.set('q', 'red & green');                 // '&' and space will be encoded
console.log('updated :', url.href);

// Conceptually, an SPA router would now call:
//   history.pushState({ page: 3 }, '', url);   // changes the address, no reload
// (the sandbox may restrict navigation, so we only show the URL building here)
console.log('would push:', url.pathname + url.search);
```

## Expected Result

The **console** prints the decoded parts of the URL, then the rebuilt `href` with the
query correctly re-encoded:

```
origin  : https://shop.example.com
pathname: /search
search  : ?q=blue+jeans&page=2
hash    : #reviews
q       : blue jeans
page    : 2
updated : https://shop.example.com/search?q=red+%26+green&page=3&tag=sale
would push: /search?q=red+%26+green&page=3&tag=sale
```

Notice the space and `&` in `q` were percent-/`+`-encoded automatically, and the appended
`tag` joined the query without you touching a single `?` or `&`.

## Challenge

1. Build a URL from scratch with `new URL('/profile', 'https://example.com')` and add two
   query params with `searchParams.set`. Log the final `href`.
2. Given a query with repeated keys (`?tag=a&tag=b`), use `params.getAll('tag')` and
   `[...params]` to see how repeated keys and iteration work.
3. Read about `history.pushState` vs `history.replaceState`: which one adds a new entry to
   the back button, and which one rewrites the current entry in place?

## Deep Dive

`history.pushState` is what makes client-side routing possible: it updates `location` and
the address bar without a network request, and stores a `state` object the browser hands
back to your `popstate` handler when the user presses Back. The newer **Navigation API**
(`navigation.navigate`, `navigatesuccess`) is the modern, promise-based successor and
handles more cases (intercepting clicks, scroll restoration), but `pushState` remains the
broadly supported baseline. Either way, the `URL`/`URLSearchParams` objects are how you
construct the address you navigate to.

## Common Mistakes

- Building query strings by hand (`'?q=' + value`) — it breaks the moment `value` contains
  a space, `&`, `=`, or a Unicode character. Use `URLSearchParams`.
- Forgetting that `location.href = ...` triggers a **full page load**, while
  `history.pushState` does not. Mixing them up reloads the app and loses state.
- Treating `location.search` as already-parsed. It is the raw `?...` string — feed it to
  `new URLSearchParams(location.search)` to read values.
- Assuming `searchParams.get('missing')` throws. It returns `null` for absent keys.
