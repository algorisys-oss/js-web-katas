---
id: "phase-13/002-dynamic-imports-and-code-splitting"
title: "Dynamic Imports & Code Splitting"
phase: 13
sequence: 2
difficulty: "intermediate"
tags: ["modules", "performance"]
prerequisites: ["phase-13/001-es-modules"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

Static `import` declarations are resolved up front: every module in the graph is fetched
before your entry code runs. That is correct for code you always need — but wasteful for code
you might *never* use (a settings dialog, a chart library, an admin panel). The fix is the
**dynamic import**: `import(specifier)`, a function-like form that returns a **Promise** for
the module's namespace and loads it **on demand**, at runtime.

Because it returns a Promise, a dynamic import is:

- **Conditional** — call it inside an `if`, an event handler, or after a feature check.
- **Lazy** — the network request for that chunk happens only when the line executes.
- **Awaitable** — `const mod = await import(url)` gives you the same namespace object a
  static import would, including `mod.default`.

This is the runtime half of **code splitting**. A bundler (kata 4) sees each `import()` call
site and emits the target module as a **separate chunk** instead of folding it into the main
bundle. The result: a small initial download that loads features only when the user reaches
them. The browser still caches each module once, so a second dynamic import of the same
specifier resolves from cache without a new fetch.

In this single-file playground there is no bundler and no sibling file, so we demonstrate the
*runtime* behavior with Blob URLs — the exact mechanism a split chunk would use, minus the
build step.

## Key Insight

> `import()` is a runtime, Promise-returning function: it loads a module **on demand**. Each
> call site is the seam a bundler turns into a separately downloaded chunk.

## Experiment

```js
// A "heavy feature" we only want to load when the user asks for it.
const featureSource = `
  console.log('[feature] module body evaluated — this only runs on first load');
  export function greet(name) { return 'Hello, ' + name + '!'; }
  export default { loadedAt: Date.now() };
`;
const featureUrl = URL.createObjectURL(
  new Blob([featureSource], { type: 'text/javascript' })
);

console.log('App started. Feature NOT loaded yet.');

async function onUserClick() {
  console.log('User triggered the feature — loading now...');
  const mod = await import(featureUrl);          // network/parse happens here, lazily
  console.log('feature.greet:', mod.greet('Ada'));
  console.log('default export:', mod.default);
  return mod;
}

// Simulate two interactions. Note the feature body logs ONCE (cached after first load).
const first = await onUserClick();
const second = await onUserClick();
console.log('same cached module?', first === second);  // true — loaded once

URL.revokeObjectURL(featureUrl);
```

## Expected Result

The console prints, in order:

```
App started. Feature NOT loaded yet.
User triggered the feature — loading now...
[feature] module body evaluated — this only runs on first load
feature.greet: Hello, Ada!
default export: { loadedAt: <number> }
User triggered the feature — loading now...
feature.greet: Hello, Ada!
default export: { loadedAt: <number> }
same cached module? true
```

The `[feature] module body evaluated` line appears **once** even though the feature is
"clicked" twice — the module is cached after the first dynamic import.

## Challenge

1. Wrap the `await import(...)` in `try/catch` and import a deliberately broken specifier
   (e.g. a Blob whose source has a syntax error). Show that a failed dynamic import rejects
   the Promise instead of throwing synchronously, and that your app can recover.
2. Add a tiny loading state: log `"loading…"` before the import and `"ready"` after. Then race
   two clicks that both `import()` before the first resolves — confirm the module body still
   evaluates only once.
3. Explain why you would `import()` a charting module inside a "Show chart" button handler
   rather than statically at the top of the file. What does the user *not* pay for if they
   never click?

## Deep Dive

A static `import` is a declaration the parser sees before execution, so its target is part of
the eagerly-loaded graph. A dynamic `import()` is an expression the engine evaluates only when
control reaches it, returning a Promise — which is why it can take a computed specifier and
live inside conditionals. Bundlers exploit exactly this: every literal `import('./x.js')`
becomes a **split point**, and `./x.js` (plus its private dependencies) is emitted as its own
chunk fetched on first call. Good splitting tracks real user journeys — route boundaries,
modals, rarely-used tools — so the initial payload stays small while everything else streams
in just-in-time. Measure the win with the Performance API (phase 12) before and after.

## Common Mistakes

- Treating `import()` like static `import` and `await`ing it at the top of the file for code
  you *always* need — you lose nothing by splitting it, but you also gain nothing and add a
  round trip. Split on real boundaries, not everywhere.
- Forgetting `import()` returns a Promise — using the result before `await`/`.then` gives you
  a pending Promise, not the module.
- Assuming a dynamic import re-runs the module each time. It is cached like any module; the
  body evaluates once per unique specifier.
- Splitting so aggressively that a single user action triggers a waterfall of tiny chunk
  requests — over-splitting trades one big download for many slow round trips.
