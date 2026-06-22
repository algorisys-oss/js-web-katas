# Phase 13 — Modules & Tooling

**Ladder rung:** 7+ — organizing & shipping code (a cross-cutting rung that supports
Performance & Rendering and Application Architecture above it).

## Goal

Learn how JavaScript is *organized* and *shipped* for the browser. By the end of this phase you
can explain the native ES module system (static graph, live bindings, single evaluation), load
code on demand with dynamic imports, encapsulate state with closures and modules, reason about
what a bundler's build step actually does, and ship code that works across browsers via feature
detection and guarded polyfills.

## Why it matters

Modules are how real apps stay maintainable; tooling is how they stay fast and compatible. The
static structure of `import`/`export` is not just syntax — it is the contract that makes
code-splitting and tree-shaking *possible*, which directly feeds the performance work in
phase 12 and the architecture work in phase 20. Get the module mental model right and the build
step stops being magic: it becomes a graph analysis you can predict and exploit.

## Katas

1. [ES Modules](./001-es-modules.md) — static graph, live read-only bindings, single
   evaluation; run the real loader with Blob-URL imports.
2. [Dynamic Imports & Code Splitting](./002-dynamic-imports-and-code-splitting.md) — `import()`
   as a lazy, Promise-returning load; the seam a bundler turns into a chunk.
3. [Module Patterns & Encapsulation](./003-module-patterns.md) — IIFEs, the revealing module
   pattern, and closure factories for per-instance private state.
4. [Bundlers & the Build Step](./004-bundlers-and-the-build-step.md) — *(conceptual)* bundling,
   tree-shaking, transpilation, minification, source maps, dev vs prod.
5. [Polyfills & Feature Detection](./005-polyfills-and-feature-detection.md) — detect
   capabilities (not user-agents), then install guarded polyfills with graceful fallbacks.

## A note on the playground

Your code runs as a **single ES module** in a sandboxed iframe — there are no sibling files to
`import`. To exercise the *real* module system at runtime, katas 1 and 2 import **Blob URLs**
(`URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))`), which the browser
loads through its genuine ESM machinery, top-level `await` and all. Kata 4 is **conceptual** —
there is no bundler here, so it explains the build step and *simulates* tree-shaking with a pure
illustrative snippet. Everything runs offline; no CDN or network imports.

## What's next

Phase 14 — Web Components: custom elements, Shadow DOM, templates & slots, and lifecycle
callbacks — building reusable, framework-free components from the modules you now know how to
organize and ship.
