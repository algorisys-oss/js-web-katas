# Phase 14 — Web Components

**Ladder rung:** builds on 4 — The DOM, and 7 — Browser & Web Platform APIs.

## Goal

Build genuinely reusable, framework-free UI by teaching the *browser itself* new tags. By
the end of this phase you can define a custom element backed by a class, give it a private
shadow tree that no page CSS can break, stamp its markup from a `<template>`, let callers
fill it via `<slot>`, hook into its lifecycle without leaking listeners, and ship a
component that takes configuration in through attributes and reports results out through
custom events.

## Why it matters

Web Components are the platform's own answer to "reusable widget" — the same idea every
framework reinvents, standardized into the DOM. Understanding them demystifies how
frameworks work, gives you isolation (Shadow DOM) and composition (slots) without a build
step, and produces components that drop into *any* page, framework or not. The
attributes-in / events-out contract you learn here is exactly how built-in elements like
`<input>` already behave.

## Katas

1. [Custom Elements](./001-custom-elements.md) — `class extends HTMLElement` +
   `customElements.define`; an autonomous element with a hyphenated tag name.
2. [Shadow DOM](./002-shadow-dom.md) — `attachShadow({ mode: 'open' })` and the
   style/DOM encapsulation that makes a component truly isolated.
3. [Templates & Slots](./003-templates-and-slots.md) — parse-once `<template>` cloning,
   `<slot>` projection of light-DOM children, and `slotchange`.
4. [Lifecycle Callbacks](./004-lifecycle-callbacks.md) — `constructor`,
   `connectedCallback`, `disconnectedCallback`, and `observedAttributes` +
   `attributeChangedCallback`.
5. [Building a Reusable Component](./005-building-a-reusable-component.md) — a capstone
   `<star-rating>`: attribute-driven, shadow DOM, a slot, a styled template, and a custom
   event that crosses the shadow boundary.

## What's next

Phase 15 — Graphics & Media: Canvas 2D, animation loops, SVG from JS, media elements, and a
conceptual intro to WebGL.
