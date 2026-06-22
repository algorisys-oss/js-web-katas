---
id: "phase-00/005-how-scripts-load"
title: "How Scripts Load: defer, async & modules"
phase: 0
sequence: 5
difficulty: "beginner"
tags: ["runtime", "page-lifecycle", "modules"]
prerequisites: ["phase-00/003-the-page-lifecycle"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

How a `<script>` is loaded decides *when* it runs and whether it blocks the page being
built. There are four behaviors:

- **`<script>`** (plain, in `<body>`): fetched and executed **immediately**, pausing HTML
  parsing until it finishes. A classic blocking script.
- **`<script defer>`**: fetched **in parallel** with parsing, but executed **after** the
  DOM is fully parsed, just before `DOMContentLoaded`, **in document order**. Best default
  for scripts that touch the DOM.
- **`<script async>`**: fetched in parallel, then executed **as soon as it arrives**,
  possibly mid-parse, in **no guaranteed order**. Good for independent things (analytics).
- **`<script type="module">`**: deferred by default (like `defer`), runs in **strict
  mode**, has its own top-level scope, and can `import`/`export`. The DOM is ready when it
  runs.

This kata's playground runs your code as a **module**, which is why `document` is already
available and top-level `await`/`import` work.

## Key Insight

> `defer` and `type="module"` run after the DOM is parsed, in order — the safe default.
> `async` runs whenever it arrives, out of order. Plain scripts block parsing.

## Experiment

```js
// This script runs as a module, so the DOM is already parsed and these globals exist.
console.log('Running as a module — DOM is ready.');
console.log('document.body exists:', !!document.body);

// Modules are always in strict mode. This assignment to an undeclared variable throws:
try {
  undeclaredVariable = 42; // ReferenceError in strict mode
} catch (err) {
  console.log('Strict mode caught:', err.name);
}

// Modules have their own scope: a top-level `const` is NOT a global.
const moduleScoped = 'only visible in this module';
console.log('typeof window.moduleScoped:', typeof window.moduleScoped); // "undefined"
```

## Expected Result

The console prints:

```
Running as a module — DOM is ready.
document.body exists: true
Strict mode caught: ReferenceError
typeof window.moduleScoped: undefined
```

The strict-mode assignment throws a `ReferenceError`, and the module-scoped `const` is
**not** attached to `window`.

## Challenge

1. In a classic (non-module) script, `var x = 1` at the top level becomes `window.x`.
   Explain why modules don't do this.
2. Given three scripts that depend on each other in order, which attribute would you use:
   `async` or `defer`? Why?
3. Look up why putting a plain `<script>` at the **end of `<body>`** was the old trick to
   avoid the "element is null" problem, and how `defer` replaced it.

## Deep Dive

ES modules are loaded with their own algorithm: the browser fetches the entry module,
statically scans its `import` statements, and fetches the dependency graph before running
anything — top to bottom, each module evaluated once and cached. This static structure is
what lets bundlers tree-shake unused exports (Phase 13).

## Common Mistakes

- Using `async` for scripts that depend on each other or on the DOM — order isn't
  guaranteed and the DOM may be incomplete.
- Expecting a top-level `const`/`let` in a module to be a global. It is scoped to the
  module.
- Forgetting that modules are always strict mode — silent footguns (like accidental
  globals) become loud errors, which is a good thing.
