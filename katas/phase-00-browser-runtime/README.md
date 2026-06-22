# Phase 0 — The Browser as a Runtime

**Ladder rung:** 1 — The Browser Runtime & Page Lifecycle (the foundation).

## Goal

Build a correct mental model of *where* and *how* your JavaScript runs before writing any.
By the end of this phase you can explain what the browser host gives you, how the JS engine
and rendering engine cooperate through the event loop, when a page is "ready," what the
rendering pipeline costs, and how the way a script loads decides when it runs.

## Why it matters

Almost every confusing frontend bug — "my element is null," "why is the page frozen,"
"why is my animation janky," "why did this run before that" — traces back to a fuzzy model
of the runtime. Fix the model first; everything later gets easier.

## Katas

1. [Browser JavaScript vs Node.js](./001-browser-vs-node.md) — the language is the same;
   the host is what differs.
2. [The JavaScript Engine & the Browser](./002-the-js-engine.md) — engine, rendering
   engine, and the single-threaded event loop.
3. [The Page Lifecycle](./003-the-page-lifecycle.md) — `loading` → `interactive` →
   `complete`, `DOMContentLoaded` vs `load`.
4. [The Rendering Pipeline Overview](./004-the-rendering-pipeline.md) — DOM → CSSOM →
   Style → Layout → Paint → Composite, and what each costs.
5. [How Scripts Load](./005-how-scripts-load.md) — plain vs `defer` vs `async` vs
   `type="module"`.

## What's next

Phase 1 — JavaScript Language Core: types, scope, coercion, and the footguns the language
is famous for.
