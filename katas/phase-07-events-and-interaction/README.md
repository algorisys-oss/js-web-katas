# Phase 7 — Events & Interaction

**Ladder rung:** 5 — Events & Interaction (where the DOM starts responding to people).

## Goal

Make a page *react*. You already know how to build and update the DOM (Phase 6); now you
wire it to input. By the end of this phase you can register and tear down listeners cleanly,
trace an event through its capture and bubble phases, handle a thousand elements with one
delegated listener, broadcast your own events to decouple components, and read pointer and
keyboard input the modern, device-agnostic way.

## Why it matters

Interaction is where most real-world frontend bugs live: leaked listeners that pile up,
`stopPropagation()` that silently breaks a menu three levels up, per-item listeners that
miss dynamically added rows, and `mouse*`/`touch*` code that double-fires on phones. Each
kata here targets one of those failure modes and shows the platform-correct pattern instead.

## Katas

1. [Event Listeners](./001-event-listeners.md) — `addEventListener`/`removeEventListener`,
   the `Event` object, and the `once`/`capture`/`passive` options.
2. [Event Propagation (Bubbling & Capturing)](./002-event-propagation.md) — the three
   phases, `stopPropagation()` vs `preventDefault()`.
3. [Event Delegation](./003-event-delegation.md) — one listener on a container,
   `closest()`, and handling elements added later.
4. [Custom Events](./004-custom-events.md) — `CustomEvent`, `detail`, and `dispatchEvent`
   for loose coupling through the DOM.
5. [Pointer, Keyboard & Touch Events](./005-pointer-keyboard-and-touch.md) — the unified
   pointer model, `event.key`, and feature detection.

## What's next

Phase 8 — Forms & User Input: form elements & values, the Constraint Validation API,
controlled-input patterns, `FormData`, and debouncing input.
