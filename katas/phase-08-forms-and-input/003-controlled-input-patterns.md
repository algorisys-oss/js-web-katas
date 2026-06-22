---
id: "phase-08/003-controlled-input-patterns"
title: "Controlled Input Patterns"
phase: 8
sequence: 3
difficulty: "intermediate"
tags: ["forms", "state"]
prerequisites: ["phase-08/002-constraint-validation-api"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

By default a form control owns its own state: the user types, the DOM holds the value, and
your JavaScript only *reads* it when it feels like it. That's an **uncontrolled** input.

A **controlled** input flips the relationship. A plain JavaScript object is the single
**source of truth**, and the input merely *reflects* it:

1. The `input` event fires.
2. Your handler updates the state object.
3. You write the (possibly transformed) value back to `input.value`, re-rendering the UI
   from state.

This loop — *event → update state → render from state* — is the core idea behind every UI
framework, but it's just the DOM. Because *you* own the value, you can **transform input as
it's typed**: force uppercase, strip non-digits, clamp a number to a range, or format a
phone number. The DOM never disagrees with your state because state always writes last.

One gotcha: re-assigning `input.value` can move the text **caret** to the end. For simple
transforms that's fine; for mid-string edits you save and restore
`input.selectionStart`/`selectionEnd`.

## Key Insight

> A controlled input makes a JS object the source of truth: on every `input`, update state,
> then write state back to `.value`. The DOM reflects your model, never the other way round.

## Experiment

```html
<form id="form">
  <label>Coupon (UPPERCASE): <input id="coupon" /></label>
  <label>Quantity (1–10): <input id="qty" type="text" inputmode="numeric" /></label>
  <pre id="state"></pre>
</form>
```

```js
// The single source of truth. The inputs only ever reflect this.
const state = { coupon: '', qty: 1 };

const coupon = document.getElementById('coupon');
const qty = document.getElementById('qty');
const view = document.getElementById('state');

function render() {
  coupon.value = state.coupon;            // write state → DOM
  qty.value = String(state.qty);
  view.textContent = JSON.stringify(state, null, 2);
  console.log('state →', state);
}

coupon.addEventListener('input', (e) => {
  state.coupon = e.target.value.toUpperCase();   // transform on the way in
  render();
});

qty.addEventListener('input', (e) => {
  const digits = e.target.value.replace(/\D/g, '');     // strip non-digits
  const n = Math.min(10, Math.max(1, Number(digits) || 1)); // clamp 1–10
  state.qty = n;
  render();
});

render(); // initial paint from state
```

## Expected Result

In the **preview**, typing into "Coupon" shows only uppercase letters no matter how you
type; typing into "Quantity" rejects letters and clamps the number to 1–10 (typing `99`
becomes `10`). The `<pre>` always mirrors the `state` object. The **console** logs the
state after each edit:

```
state → { coupon: "SAVE20", qty: 3 }
```

The input field and the rendered state can never drift apart, because the field is rendered
*from* state.

## Challenge

1. Add a caret fix: in the coupon handler, save `coupon.selectionStart` before re-assigning
   `.value`, then restore it with `coupon.setSelectionRange(...)`. Type in the middle of the
   word and confirm the caret stays put.
2. Add a "Reset" button that sets `state` back to its defaults and calls `render()` — proving
   the UI is fully derived from state.
3. Add a third field bound to the same `state.qty` (e.g. a `range` slider). Updating either
   the text box or the slider should move both, since both render from one value.

## Deep Dive

The render-from-state pattern is exactly what React's "controlled components" formalize, and
what reactive frameworks automate with signals/observers (Phase 20). Doing it by hand here
shows there's no magic: it's a unidirectional data flow over ordinary DOM events. The cost is
that you must re-render on every change; the benefit is one authoritative copy of the data
you can validate, persist, or undo — the input can never hold a value your model rejects.

## Common Mistakes

- Reading `.value` straight from the DOM elsewhere in your app *and* keeping a state object —
  now you have two sources of truth that drift. Pick one; here, it's state.
- Forgetting the caret jumps to the end after `input.value = ...`. Save/restore the selection
  for mid-string edits.
- Doing heavy work in the `input` handler on every keystroke. For expensive effects (network,
  layout), debounce it — the next kata covers exactly that.
