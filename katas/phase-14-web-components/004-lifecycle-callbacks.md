---
id: "phase-14/004-lifecycle-callbacks"
title: "Lifecycle Callbacks"
phase: 14
sequence: 4
difficulty: "advanced"
tags: ["web-components", "custom-elements", "lifecycle"]
prerequisites: ["phase-14/003-templates-and-slots"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

A custom element has a lifecycle, and the browser calls specific methods on your class at
each stage. Implementing them correctly is what separates a toy from a leak-free component:

- **`constructor()`** — the element instance is created (but may not be in the document
  yet). Set up the shadow root and internal state here. **Do not** read attributes or touch
  light children yet; they may not exist.
- **`connectedCallback()`** — the element was **inserted into the document**. This is where
  you render, read attributes, and **add event listeners**. It can run more than once if the
  element is moved.
- **`disconnectedCallback()`** — the element was **removed from the document**. This is your
  cleanup hook: **remove listeners, cancel timers, disconnect observers.** Skipping this is
  the #1 source of memory leaks in components.
- **`attributeChangedCallback(name, oldValue, newValue)`** — a watched attribute changed.
  The browser only calls this for attributes listed in the static **`observedAttributes`**
  array — that array is the opt-in list that makes the element *reactive* to its HTML.

`attributeChangedCallback` also fires once per observed attribute during **upgrade** if the
attribute is present in the parsed HTML, so initial values flow through the same code path
as later changes.

## Key Insight

> `connectedCallback` is "I'm on the page — render and listen." `disconnectedCallback` is
> "I'm gone — clean up or I leak." `observedAttributes` + `attributeChangedCallback` make
> the element react to its HTML attributes like a real built-in.

## Experiment

```html
<life-cycle label="Hello"></life-cycle>
<button id="rename">Change label attribute</button>
<button id="remove">Remove element</button>
```

```js
class LifeCycle extends HTMLElement {
  // Opt in to watching the `label` attribute.
  static get observedAttributes() {
    return ['label'];
  }

  constructor() {
    super();
    console.log('constructor: instance created');
    this.attachShadow({ mode: 'open' });
    this._onTick = () => console.log('tick'); // kept so we can remove it later
  }

  connectedCallback() {
    console.log('connectedCallback: on the page, rendering + listening');
    this.render();
    window.addEventListener('resize', this._onTick);
  }

  disconnectedCallback() {
    console.log('disconnectedCallback: removed, cleaning up listeners');
    window.removeEventListener('resize', this._onTick); // prevent the leak
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`attributeChangedCallback: ${name} "${oldValue}" -> "${newValue}"`);
    if (this.isConnected) this.render();
  }

  render() {
    this.shadowRoot.innerHTML =
      `<strong style="font:16px sans-serif">${this.getAttribute('label')}</strong>`;
  }
}
customElements.define('life-cycle', LifeCycle);

const el = document.querySelector('life-cycle');
document.getElementById('rename').onclick =
  () => el.setAttribute('label', 'Changed at ' + new Date().toLocaleTimeString());
document.getElementById('remove').onclick = () => el.remove();
```

## Expected Result

On load the **preview** shows bold "Hello", and the **console** prints (note that
`attributeChangedCallback` fires *before* `connectedCallback` because the attribute exists
at upgrade time):

```
constructor: instance created
attributeChangedCallback: label "null" -> "Hello"
connectedCallback: on the page, rendering + listening
```

Clicking **Change label** updates the bold text and logs another
`attributeChangedCallback`. Clicking **Remove element** deletes it from the preview and
logs `disconnectedCallback`, after which the `resize` listener is gone.

## Challenge

1. Add `disabled` to `observedAttributes`, then toggle it with `el.toggleAttribute('disabled')`
   and have `render()` dim the element when present. Reflect a boolean attribute correctly
   (presence = true).
2. Move the element instead of removing it: `document.body.append(el)`. Observe that
   `disconnectedCallback` then `connectedCallback` both fire — explain why connect logic
   must be idempotent.
3. Start a `setInterval` in `connectedCallback` and clear it in `disconnectedCallback`.
   Confirm via the console that it stops after removal — a timer that outlives its element
   is a classic leak.

## Deep Dive

The fifth callback, **`adoptedCallback()`**, fires when an element is moved to a *new
document* via `document.adoptNode` (e.g. into an `<iframe>`'s document) — rare, but part of
the contract. Because `connectedCallback` can run multiple times, treat it as "(re)attach"
not "construct once": guard one-time setup, and always pair every subscription made in
`connectedCallback` with its teardown in `disconnectedCallback`. Modern components often
hold an `AbortController` and pass its `signal` to every `addEventListener`, then call
`controller.abort()` in `disconnectedCallback` to remove them all at once.

## Common Mistakes

- Reading attributes or children in the **constructor** — they may not exist yet; do it in
  `connectedCallback` / `attributeChangedCallback`.
- Forgetting `disconnectedCallback` cleanup — listeners, timers, and observers leak and keep
  the detached element (and its tree) alive.
- Expecting `attributeChangedCallback` to fire for an attribute you didn't list in
  `observedAttributes` — it won't; the list is the opt-in.
- Confusing **attributes** (strings in HTML, observed here) with **properties** (JS values
  on the instance) — changing a property does not trigger this callback.
