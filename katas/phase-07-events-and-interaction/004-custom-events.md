---
id: "phase-07/004-custom-events"
title: "Custom Events"
phase: 7
sequence: 4
difficulty: "intermediate"
tags: ["events"]
prerequisites: ["phase-07/003-event-delegation"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

You are not limited to the browser's built-in events. You can invent your own, dispatch
them on any DOM node, and listen for them exactly like `click` — this is how you decouple
parts of an interface so they communicate through the DOM instead of calling each other
directly.

Two pieces:

- **`new CustomEvent(type, options)`** creates the event. The key option is **`detail`**,
  an arbitrary payload you attach. `bubbles: true` lets it travel up the tree (default is
  `false`, unlike most native events), and `cancelable: true` lets listeners call
  `preventDefault()` on it.
- **`element.dispatchEvent(event)`** fires it synchronously. Every matching listener runs
  before `dispatchEvent` returns. Its return value is `false` if a listener cancelled a
  cancelable event, `true` otherwise.

A component (say, a cart) dispatches `cart:add` on itself; anything interested — a badge, a
toast, analytics — listens, without the cart knowing they exist. That is loose coupling
through the event system, and because custom events can bubble, you can delegate them too.

## Key Insight

> `new CustomEvent('name', { detail, bubbles })` + `el.dispatchEvent(event)` lets parts of
> your UI talk through the DOM. The payload rides in `event.detail`.

## Experiment

```html
<button id="add-to-cart" data-product="Keyboard" data-price="49">Add Keyboard to cart</button>
<p id="badge">Cart: 0 items ($0)</p>
```

```js
const button = document.getElementById('add-to-cart');
const badge = document.getElementById('badge');
let count = 0;
let total = 0;

// LISTENER: anything can subscribe to our custom event. It bubbles, so we
// listen on `document` to prove delegation works for custom events too.
document.addEventListener('cart:add', (event) => {
  const { name, price } = event.detail; // the payload we attached
  count += 1;
  total += price;
  badge.textContent = `Cart: ${count} items ($${total})`;
  console.log(`cart:add heard on document — added ${name} for $${price}`);
});

// DISPATCHER: the button announces an action without knowing who listens.
button.addEventListener('click', (event) => {
  const product = {
    name: event.currentTarget.dataset.product,
    price: Number(event.currentTarget.dataset.price),
  };
  const added = button.dispatchEvent(
    new CustomEvent('cart:add', { detail: product, bubbles: true, cancelable: true }),
  );
  console.log('dispatched cart:add — not cancelled:', added);
});

console.log('Click the button to dispatch a custom "cart:add" event.');
```

## Expected Result

In the **preview**, each click updates the badge (`Cart: 1 items ($49)`, then
`2 items ($98)`, ...). The **console** shows two lines per click: the listener on
`document` reporting what it added (proof the event bubbled from the button up to
`document`), and the dispatcher reporting `not cancelled: true`.

## Challenge

1. Add a second listener for `cart:add` that calls `event.preventDefault()`. Read the
   `dispatchEvent` return value now — and note the badge still updated, because *you* chose
   whether to honour the cancellation.
2. Make a listener inspect `event.detail.price` and call `preventDefault()` only for items
   over $40; have the dispatcher skip the update when `dispatchEvent` returns `false`.
3. Dispatch a plain `new Event('cart:cleared')` (no detail) and reset the badge from a
   listener. When do you need `CustomEvent` versus a bare `Event`?

## Deep Dive

`detail` exists because you cannot add arbitrary own-properties to a native `Event` and
have them survive — `CustomEvent` standardizes the single payload slot. Custom events are
the foundation of Web Components' public API (Phase 14): a component signals state changes
by dispatching events its host page listens for, keeping the component's internals private.
Note that `dispatchEvent` is **synchronous** — unlike a real user click queued by the
event loop, your listeners have all run by the time the call returns.

## Common Mistakes

- Forgetting `bubbles: true` and then listening on an ancestor — the event fires only on
  the target, so the ancestor never hears it.
- Stuffing data onto the event object directly (`event.foo = ...`) instead of using
  `detail`. Use `CustomEvent`'s `detail`.
- Expecting `dispatchEvent` to be async. It runs every listener immediately, before the
  next line of your code.
- Prefixing nothing and colliding with a future native event name. Namespace custom events
  (`cart:add`, `app:ready`) to avoid clashes.
