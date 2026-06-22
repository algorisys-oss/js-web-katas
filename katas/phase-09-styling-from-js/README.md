# Phase 9 — Styling from JavaScript

**Ladder rung:** 7 — Browser & Web Platform APIs.

## Goal

Drive an element's appearance from JavaScript the way the browser intends: change **state**,
not pixels by hand. By the end of this phase you can read and write inline styles, flip
classes and CSS custom properties, read the *resolved* computed style and element geometry
without thrashing layout, and animate smoothly with the Web Animations API, CSS transitions,
and `requestAnimationFrame`.

## Why it matters

Styling from JS is where the rendering pipeline (Phase 0) stops being theory. Touch the wrong
property and every frame reflows; read geometry at the wrong moment and you force a
synchronous layout. The same motion can cost a full Layout → Paint → Composite pass or skip
straight to Composite — the difference between janky and 60 fps. This phase teaches which
lever to pull, and when.

## Katas

1. [Reading & Writing Styles](./001-reading-and-writing-styles.md) — `element.style`,
   camelCase properties, `setProperty`, and `cssText`; why `.style` only reads inline values.
2. [classList & CSS Variables](./002-classlist-and-css-variables.md) — `classList.toggle`
   for state and `setProperty('--x', ...)` for values; keep styling in the cascade.
3. [Computed Styles & Layout Reads](./003-computed-styles-and-layout-reads.md) —
   `getComputedStyle` (read-only, resolved) and how `offsetWidth`/`getBoundingClientRect()`
   force a synchronous layout.
4. [The Web Animations API](./004-web-animations-api.md) — `element.animate(keyframes,
   options)`, the controllable `Animation` object, and animating on the compositor.
5. [Transitions & requestAnimationFrame](./005-transitions-and-requestanimationframe.md) —
   CSS transitions with `transitionend`, and a per-frame `rAF` loop driven by elapsed time.

## What's next

Phase 10 — Browser & Web Platform APIs: Location/History/URL, Web Storage, scheduling, and
the observer family (Intersection/Mutation/Resize).
