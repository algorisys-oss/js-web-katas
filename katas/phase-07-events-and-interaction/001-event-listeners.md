---
id: "phase-07/001-event-listeners"
title: "Event Listeners"
phase: 7
sequence: 1
difficulty: "beginner"
tags: ["events"]
prerequisites: ["phase-06/005-documentfragment-and-efficient-updates"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

The browser is event-driven: it sits idle until something happens — a click, a key, a
load — then runs the JavaScript you registered for that event. You register interest with
`addEventListener(type, handler, options)`:

```js
button.addEventListener('click', (event) => { /* ... */ });
```

When the event fires, the browser calls your handler with an **`Event` object**. It carries
`event.type`, `event.target` (the element the event originated on), `event.currentTarget`
(the element the listener is attached to), and `event.timeStamp`, among others.

The third argument tunes the listener:

- **`{ once: true }`** — the handler runs at most one time, then auto-removes itself.
- **`{ capture: true }`** — listen during the *capturing* phase, not bubbling (next kata).
- **`{ passive: true }`** — promise you won't call `preventDefault()`, letting the browser
  scroll without waiting for you (important for `scroll`/`touch`).

To detach a listener you must pass the **same function reference** to
`removeEventListener` — an inline arrow function can never be removed because you have no
reference to it. That single fact is the root of most "leaked listener" bugs.

## Key Insight

> `addEventListener` registers a handler; `removeEventListener` needs the *same function
> reference* to detach it. Anonymous inline handlers can never be removed.

## Experiment

```html
<button id="counter">Clicked 0 times</button>
<button id="once">Click me once</button>
<button id="stop">Stop counting</button>
```

```js
const counter = document.getElementById('counter');
let count = 0;

// A named handler so we can remove it later.
function handleCount(event) {
  count += 1;
  // currentTarget is the element the listener is on; target is where it started.
  event.currentTarget.textContent = `Clicked ${count} times`;
  console.log('click on', event.target.id, '— count is', count);
}

counter.addEventListener('click', handleCount);

// { once: true } auto-removes after the first call.
document.getElementById('once').addEventListener(
  'click',
  () => console.log('this listener just fired and removed itself'),
  { once: true },
);

// Detach handleCount by passing the SAME reference.
document.getElementById('stop').addEventListener('click', () => {
  counter.removeEventListener('click', handleCount);
  console.log('counter listener removed — clicking the counter does nothing now');
});

console.log('Listeners attached. Click the buttons in the preview.');
```

## Expected Result

On load the console prints `Listeners attached...`. In the **preview**, clicking the first
button increments its label and logs the new count. Clicking "Click me once" logs its
message a single time — a second click does nothing because the listener removed itself.
Clicking "Stop counting" detaches `handleCount`, after which the counter button no longer
responds.

## Challenge

1. Replace `handleCount` with an inline arrow function and try to `removeEventListener`
   it. Confirm it cannot be removed, and explain why.
2. Add the same `handleCount` to the counter button **twice**. Does it fire twice per
   click? Now try adding it twice with identical `options` — what happens?
3. Attach a `{ passive: true }` listener for `wheel` on the counter and call
   `event.preventDefault()` inside it. Read the console warning the browser emits.

## Deep Dive

`addEventListener` deduplicates: registering the *same type, same listener reference, and
same `capture` value* twice adds only one listener. Change any of those three and you get a
second registration. The `options` object also accepts `signal` — pass an
`AbortController`'s `signal` and calling `controller.abort()` removes the listener (and any
others sharing that signal) at once, which is the cleanest modern teardown pattern.

## Common Mistakes

- Using an inline arrow/`bind()` result as a handler, then being unable to remove it
  because every call creates a new function reference.
- Forgetting to remove listeners on elements you later discard — the handler (and anything
  it closes over) stays alive, leaking memory.
- Confusing `event.target` (where it started) with `event.currentTarget` (where the
  listener is). Inside delegation they differ; that is the whole point (kata 3).
- Calling `preventDefault()` inside a `passive: true` listener — it is ignored and warns.
