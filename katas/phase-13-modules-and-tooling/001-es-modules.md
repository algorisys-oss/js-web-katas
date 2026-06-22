---
id: "phase-13/001-es-modules"
title: "ES Modules"
phase: 13
sequence: 1
difficulty: "intermediate"
tags: ["modules"]
prerequisites: ["phase-12/005-measuring-with-performance-api"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

**ES Modules (ESM)** are the browser's native module system — the same `import`/`export`
syntax the spec defines, loaded by the browser with no build tool. A module is a JavaScript
file with its own top-level scope, always in strict mode, evaluated **once** and cached.
What it shares with the outside world is only what it `export`s; what others give it is only
what it `import`s. This is real encapsulation enforced by the platform, not a convention.

Three properties make modules different from classic scripts:

- **Static structure.** `import`/`export` are declarations, not function calls. The browser
  can scan a module's imports *before* running any of its code, building the dependency
  graph up front. (This is what makes tree-shaking possible — kata 4.)
- **Single evaluation, live bindings.** Import the same module twice and you get the *same*
  instance. Imported names are **live read-only views** of the exporter's variables, not
  copies — if the exporter reassigns, importers see the new value.
- **Deferred, ordered execution.** `<script type="module">` runs after the DOM is parsed,
  in document order, like `defer` (you saw this in phase-00/005).

This playground runs your code as one module, so you cannot `import './other.js'` — there is
no sibling file. But you *can* run the module system for real by importing a **Blob URL**: a
string of source code wrapped in an object URL. `import(url)` then fetches, parses, and
evaluates it through the genuine ESM machinery.

## Key Insight

> Imports are **live, read-only bindings** to a single cached module instance — not copies
> of values. The browser resolves the whole graph statically before any code runs.

## Experiment

```js
// Create a real module from source text, then import it. This exercises the actual
// browser module loader — fetch, parse, link, evaluate, cache.
const source = `
  export const NAME = 'math-utils';
  let count = 0;
  export function bump() { return ++count; }      // closes over module state
  export const square = (n) => n * n;
  export default function describe() { return NAME + ' v1'; }
`;

const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));

// Namespace import: everything the module exports, as one object.
const mod = await import(url);
console.log('named export NAME:', mod.NAME);
console.log('square(5):', mod.square(5));
console.log('default export:', mod.default());

// Module state persists across calls because the module is evaluated once.
console.log('bump:', mod.bump(), mod.bump(), mod.bump()); // 1 2 3

// Import the SAME url again — you get the SAME instance, not a fresh one.
const again = await import(url);
console.log('same instance?', again === mod);            // true
console.log('shared state:', again.bump());              // 4, continues the count

URL.revokeObjectURL(url); // clean up the object URL once we're done importing it
```

## Expected Result

The console prints:

```
named export NAME: math-utils
square(5): 25
default export: math-utils v1
bump: 1 2 3
same instance? true
shared state: 4
```

The second `import()` returns the **identical** module object, and `bump()` keeps counting
from where it left off — proof that modules are evaluated once and cached.

## Challenge

1. Add `export let version = 1;` and an `export function setVersion(v) { version = v; }` to
   the source. Import the module, read `mod.version`, call `mod.setVersion(2)`, then read
   `mod.version` again. Explain why it changed even though you never reassigned `mod.version`
   yourself (hint: live bindings).
2. Try `mod.NAME = 'hacked'` after importing. What happens, and why does the module system
   make named exports read-only on the importer's side?
3. Build a *second* Blob module whose source does `import` of the first module's URL, then
   import the second one. Confirm the shared `count` is the same instance across both.

## Deep Dive

The module loading algorithm has distinct phases: **construction** (fetch every file in the
graph and parse it to find more imports — recursively, deduplicating by URL), **instantiation**
(allocate each module's exported bindings and wire every import to point at the right export
slot — this is where live bindings are set up, before any code runs), and **evaluation** (run
each module body bottom-up, once). Circular imports work *because* binding wiring happens
before evaluation: a name can be linked before it has a value, and reading it too early throws
a `ReferenceError` rather than silently giving `undefined`. Bundlers reproduce this same graph
at build time.

## Common Mistakes

- Thinking an imported value is a snapshot. It is a **live binding** — if the exporting
  module reassigns the variable later, every importer sees the new value.
- Expecting `import './sibling.js'` to work in this single-file playground. There is no
  sibling file; use a Blob or `data:` URL to demonstrate real module loading.
- Forgetting that a module is evaluated only once. Re-importing does **not** re-run its
  top-level code; module-level state is shared by every importer.
- Mutating a namespace import (`mod.x = ...`). Namespace objects and their named bindings are
  read-only — the assignment throws in strict mode (and modules are always strict).
