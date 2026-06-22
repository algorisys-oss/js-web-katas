---
id: "phase-00/001-browser-vs-node"
title: "Browser JavaScript vs Node.js"
phase: 0
sequence: 1
difficulty: "beginner"
tags: ["runtime", "page-lifecycle"]
prerequisites: []
estimated_minutes: 10
starter: ["js"]
network: false
---

## Concept

JavaScript is just a language — it does nothing on its own. It needs a **host
environment** that gives it objects to talk to the outside world. The browser and
Node.js are two different hosts, and they expose two different sets of "global" objects.

In the **browser**, your code runs inside a web page. The host hands you:

- `window` — the global object and the browser tab itself
- `document` — the live tree of HTML on the page (the DOM)
- `navigator`, `location`, `fetch`, `localStorage`, and dozens of other Web APIs

In **Node.js**, there is no page and no window. Instead the host hands you `process`,
`require`/`import` of core modules like `fs` and `http`, `Buffer`, and friends.

The language core (`Array`, `Promise`, `JSON`, `Math`, `async/await`) is identical in
both. Everything *around* it differs. This whole project is about the **browser** host.

## Key Insight

> The language is the same everywhere; the *host environment* is what changes. "Frontend
> JavaScript" means JavaScript plus the browser's Web APIs.

## Experiment

```js
// Inspect the browser host environment.
console.log('typeof window:', typeof window);
console.log('typeof document:', typeof document);
console.log('typeof process:', typeof process); // a Node global — absent here

console.log('Page URL:', window.location.href);
console.log('User agent:', navigator.userAgent);

// The language core is the same as anywhere:
console.log('Math.max:', Math.max(3, 9, 2));
console.log('JSON:', JSON.stringify({ host: 'browser' }));
```

## Expected Result

The **console** prints something like:

```
typeof window: object
typeof document: object
typeof process: undefined
Page URL: about:srcdoc
User agent: Mozilla/5.0 ...
Math.max: 9
JSON: {"host":"browser"}
```

`window` and `document` exist; `process` is `undefined` because that is a Node.js
global, not a browser one.

## Challenge

1. Log `window === globalThis`. What does that tell you about the global object in the
   browser?
2. Print three properties of `navigator` (e.g. `language`, `onLine`, `platform`).
3. Try calling a Node-only API like `process.cwd()` and read the error in the console.
   Why does it fail?

## Deep Dive

`globalThis` was standardized precisely because the global object has a different name in
each host (`window` in browsers, `global` in Node, `self` in Web Workers). Code that must
run in several hosts uses `globalThis` to avoid hard-coding one of them.

The browser host is defined by the [HTML Living Standard](https://html.spec.whatwg.org/)
and the many Web API specs at the WHATWG and W3C — not by the ECMAScript (language) spec.

## Common Mistakes

- Assuming `window`, `document`, or `localStorage` exist in Node.js — they don't.
- Assuming `process`, `__dirname`, or `require('fs')` exist in the browser — they don't.
- Thinking jQuery/React/etc. are "JavaScript." They are libraries that sit on top of the
  browser host; the host is what you must understand first.
