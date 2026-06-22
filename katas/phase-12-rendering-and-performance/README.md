# Phase 12 — Rendering & Performance

**Ladder rung:** 9 — Performance & Rendering.

## Goal

Turn the rendering-pipeline overview from Phase 0 into measurable engineering. By the end of
this phase you can tell reflow from repaint, recognize and eliminate layout thrashing,
rate-limit event floods with debounce and throttle, render arbitrarily large lists without
choking the DOM, and use the Performance API to prove every change with numbers instead of
guesses.

## Why it matters

"The page feels janky" is the most common — and most vaguely reported — frontend complaint.
Almost every cause lives here: too much layout, reads and writes interleaved, handlers firing
hundreds of times a second, thousands of DOM nodes the user never sees. The fix is never a
faster framework; it is doing *less work per frame* and **measuring before optimizing**.

## Katas

1. [Reflow & Repaint](./001-reflow-and-repaint.md) — what triggers geometry recompute vs a
   pure repaint, with a measured batched-vs-unbatched DOM-write demo.
2. [Avoiding Layout Thrashing](./002-avoiding-layout-thrashing.md) — interleaved read/write
   loops vs read-all-then-write-all, timed in the console.
3. [Debounce & Throttle](./003-debounce-and-throttle.md) — two rate-limiting utilities wired
   to input/scroll/resize, with raw-vs-handled call counts logged.
4. [Virtualizing Long Lists](./004-virtualizing-long-lists.md) — a windowed list that renders
   only the visible rows of a 50,000-item dataset on scroll.
5. [Measuring with the Performance API](./005-measuring-with-performance-api.md) —
   `performance.now()`, `mark()`/`measure()`, `PerformanceObserver`, and the timeline.

## What's next

Phase 13 — Modules & Tooling: ES modules, dynamic imports & code splitting, module patterns,
the build step (conceptual), and feature detection.
