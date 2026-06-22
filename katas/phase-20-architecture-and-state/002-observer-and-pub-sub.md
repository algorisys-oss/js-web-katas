---
id: "phase-20/002-observer-and-pub-sub"
title: "The Observer / Pub-Sub Pattern"
phase: 20
sequence: 2
difficulty: "intermediate"
tags: ["architecture", "events"]
prerequisites: ["phase-20/001-state-management-patterns"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

How does the store in kata 001 tell the view "something changed" without knowing what a
view *is*? Through the **Observer pattern**: an object (the *subject*) keeps a list of
interested parties (*observers*) and notifies them when it changes. The subject doesn't
import, reference, or depend on any observer — it just walks its list and calls them. That
decoupling is the whole point.

You have already used this everywhere. `element.addEventListener('click', fn)` registers an
observer on a DOM node (the subject); `MutationObserver` and `IntersectionObserver` (Phase
10) are the same shape; the store's `subscribe` is a hand-rolled version. The generalized,
named-channel form is **publish/subscribe** (pub-sub): instead of observing one object, you
`emit('user:login', data)` on a shared **event bus** and any number of modules that called
`on('user:login', handler)` receive it. Publishers and subscribers never see each other —
they only share the channel name.

A minimal `EventEmitter` is the engine behind it: `on` adds a handler to a named list,
`off` removes it, `emit` calls every handler for that name with a payload. The same three
methods power Node's `EventEmitter`, the DOM's event system, and message buses in large
front ends. Building it yourself demystifies all of them.

## Key Insight

> The observer pattern lets a subject notify listeners without knowing who they are.
> Pub-sub generalizes it to named channels — publishers and subscribers share only a
> string, never a reference.

## Experiment

```js
// A minimal event bus: on / off / emit. The core of every pub-sub system.
function createEmitter() {
  const channels = new Map(); // eventName -> Set of handlers

  return {
    on(event, handler) {
      if (!channels.has(event)) channels.set(event, new Set());
      channels.get(event).add(handler);
      return () => this.off(event, handler); // convenient unsubscribe
    },
    off(event, handler) {
      channels.get(event)?.delete(handler);
    },
    emit(event, payload) {
      // Copy to a array so a handler that unsubscribes mid-emit is safe.
      [...(channels.get(event) ?? [])].forEach((fn) => fn(payload));
    },
  };
}

const bus = createEmitter();

// Two independent "modules" subscribe — they never reference each other.
const logger = (user) => console.log(`[log] ${user.name} logged in`);
const greeter = (user) => console.log(`[ui]  Welcome back, ${user.name}!`);

bus.on('user:login', logger);
const stopGreeting = bus.on('user:login', greeter);

// A publisher fires the event without knowing who (if anyone) listens.
console.log('— first login —');
bus.emit('user:login', { name: 'Ada' });

// Unsubscribe one observer, then publish again.
stopGreeting();
console.log('— second login (greeter unsubscribed) —');
bus.emit('user:login', { name: 'Grace' });

// Emitting an event with no listeners is a harmless no-op.
bus.emit('user:logout', { name: 'Ada' });
console.log('done');
```

## Expected Result

The **console** prints:

```
— first login —
[log] Ada logged in
[ui]  Welcome back, Ada!
— second login (greeter unsubscribed) —
[log] Grace logged in
done
```

The greeter fires for Ada but not Grace, because `stopGreeting()` removed it. The
`user:logout` emit with no subscribers does nothing — no error. Publishers and subscribers
were fully decoupled: neither `logger` nor `greeter` knows the other exists.

## Challenge

1. Add a `once(event, handler)` method that auto-unsubscribes after the first emit (hint:
   wrap the handler in a function that calls `off` then the original).
2. Make `emit` catch and log errors per-handler so one throwing observer doesn't stop the
   others from being notified. Why is isolation important on a shared bus?
3. Re-implement kata 001's store so its `subscribe` is just `emit('change', state)` on an
   internal emitter. Notice the store *is* a specialized event emitter.

## Deep Dive

Pub-sub's strength — total decoupling — is also its risk. Because emits are "fire and
forget," a large app can become hard to trace: you see an `emit('cart:updated')` but can't
statically find who reacts. This is why teams namespace events (`domain:action`), keep a
central registry of channel names, and prefer the direct observer form (explicit
`subscribe`) when the relationship is one-to-one. The DOM's own event system adds *bubbling*
on top of plain pub-sub: an event emitted on a child is re-offered to each ancestor, which
is what makes event delegation (Phase 7) possible.

## Common Mistakes

- Forgetting to `off` handlers, so detached components keep reacting to events — a classic
  memory leak and source of "ghost" updates.
- Mutating the listener collection *during* an `emit` (a handler that subscribes or
  unsubscribes) without iterating over a copy, skipping or double-calling handlers.
- Passing mutable payloads that one subscriber mutates before another reads them — emit
  immutable data, or treat the payload as read-only.
- Over-using a global bus for everything, turning simple parent→child data flow into
  untraceable action-at-a-distance.
