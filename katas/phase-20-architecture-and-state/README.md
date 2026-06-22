# Phase 20 — Application Architecture & State

**Ladder rung:** 12 — Application Architecture & State (the top of the ladder — the capstone).

## Goal

Learn to structure a whole application, not just wire up one element. By the end of this
phase you can keep state in a single source of truth, decouple modules with the observer and
pub-sub patterns, build a fine-grained reactivity system from scratch, route between views
with no page reload, and compose all of it into a small framework-free single-page app.

## Why it matters

Every framework you will reach for in real work — React, Vue, Solid, Redux — is built from a
handful of platform patterns: a store, an event emitter, reactive signals, and a router. If
those are a mystery, the framework is a black box, and you fight its abstractions instead of
using them. Build the patterns by hand once and the frameworks become obvious: you can reason
about re-renders, stale closures, effect dependencies, and one-way data flow because you have
implemented every one of them. This is also where the threads of the whole curriculum tie
together — the DOM as a live tree, the event loop, events and delegation, modules, and forms
all converge into application architecture.

## Katas

1. [State Management Patterns](./001-state-management-patterns.md) — a single-source-of-truth
   store with `getState`/`setState`/`subscribe`, immutable updates, and render-from-state.
2. [The Observer / Pub-Sub Pattern](./002-observer-and-pub-sub.md) — build an `EventEmitter`
   (`on`/`off`/`emit`) and decouple producers from consumers, with unsubscribe.
3. [Reactive State from Scratch](./003-reactive-state-from-scratch.md) — signals and effects
   with automatic dependency tracking — the core of SolidJS/Vue, in twenty lines.
4. [Client-Side Routing](./004-client-side-routing.md) — a hash-based router that swaps views
   on `hashchange` with no reload, including dynamic route params.
5. [Putting It Together: A Mini App](./005-putting-it-together-mini-app.md) — combine a
   reactive store, components, actions, and routing into one small todo SPA — no framework.

## What's next

This is the top of the ladder — you have gone from "where does my JavaScript run?" to "how do
I architect a real application?" without a single framework. The next step is to **build real
projects**: take the mini app and grow it (persistence, auth, async data, accessibility,
tests) until it is something you would ship. When your app needs a backend — an API, a
database, authentication, real-time sockets — continue with the sibling **`nodejs-katas`**
project, which teaches server-side JavaScript with the same experiment-first rigor. The
browser platform is now yours; go make things with it.
