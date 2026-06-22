# Phase 18 — Accessibility

**Ladder rung:** cross-cutting — builds on The DOM (rung 4) and Events (rung 5).

## Goal

Make the interfaces you build usable by everyone — keyboard-only, screen-reader, voice-
control, and switch-device users included. By the end of this phase you can read the
accessibility tree the browser exposes, choose semantic HTML for behavior you get for free,
reach for ARIA only when HTML falls short (and get it right), manage keyboard navigation and
focus deliberately, announce dynamic changes with live regions, and assemble all of it into
a fully accessible component.

## Why it matters

Accessibility is not a checkbox bolted on at the end — it is a *feature*, like security, and
it falls straight out of building on the platform correctly. The same `<button>` that gives
you Enter/Space and focus for free also makes your UI accessible; the same div soup that
hides bugs also locks people out. Most accessibility defects are ordinary engineering
mistakes — an unlabeled control, an unreachable focus stop, a stale ARIA state — and they're
cheap to prevent once you understand the accessibility tree. Get this right and your UI is
more robust, more testable, and works for far more people.

## Katas

1. [Semantic HTML & the Accessibility Tree](./001-semantic-html-and-the-a11y-tree.md) —
   role, name, and state; native elements vs div soup; semantics give behavior for free.
2. [ARIA Roles & Attributes](./002-aria-roles-and-attributes.md) — roles, states, and
   properties; the first rule of ARIA; `aria-label` vs a visible label.
3. [Keyboard Navigation & Focus Management](./003-keyboard-navigation-and-focus.md) —
   `tabindex` 0 vs −1, `:focus-visible`, programmatic `.focus()`, modal focus trapping, and
   roving tabindex.
4. [Live Regions & Announcements](./004-live-regions-and-announcements.md) —
   `aria-live` polite vs assertive, `role="status"`/`role="alert"`, and how not to
   over-announce.
5. [Accessible Components](./005-accessible-components.md) — capstone: an accordion wiring
   roles, `aria-expanded`/`aria-controls`, keyboard support, and focus together.

## What's next

Phase 19 — Testing Frontend JavaScript: unit-testing logic, testing DOM interactions,
mocking fetch & timers, and testing async code.
