---
id: "phase-14/001-custom-elements"
title: "Custom Elements"
phase: 14
sequence: 1
difficulty: "intermediate"
tags: ["web-components", "custom-elements", "dom"]
prerequisites: ["phase-13/005-polyfills-and-feature-detection"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

The browser ships with a fixed vocabulary of tags — `<div>`, `<button>`, `<input>`. The
**Custom Elements** API lets you add your *own* tags backed by a JavaScript class, so the
platform itself understands `<my-counter>` the same way it understands `<button>`.

There are two pieces:

1. A class that **extends `HTMLElement`**. Because it inherits from `HTMLElement`, your tag
   is a real DOM element: it has `this.append`, `this.setAttribute`, `this.addEventListener`,
   and everything else an element has.
2. A call to **`customElements.define('my-counter', MyCounter)`** that registers the class
   under a tag name. From that moment, the browser *upgrades* every matching element on the
   page — existing ones and any added later — by running your class constructor against them.

An **autonomous custom element** (the kind here) is a brand-new tag. The name **must
contain a hyphen** — that hyphen is how the parser tells your element apart from any future
built-in tag, and it guarantees your name never collides with the standard ones.

## Key Insight

> A custom element is a real DOM element whose behavior you wrote. `class extends
> HTMLElement` + `customElements.define('x-name', …)` teaches the browser a new tag — the
> hyphen in the name is mandatory.

## Experiment

```html
<my-counter></my-counter>
<my-counter></my-counter>
```

```js
// Define a brand-new HTML tag, <my-counter>, backed by this class.
class MyCounter extends HTMLElement {
  constructor() {
    super(); // ALWAYS call super() first — it wires up the HTMLElement internals.
    this.count = 0;
  }

  connectedCallback() {
    // Runs when the element is inserted into the document.
    const button = document.createElement('button');
    button.textContent = `Clicked 0 times`;
    button.addEventListener('click', () => {
      this.count += 1;
      button.textContent = `Clicked ${this.count} times`;
    });
    this.append(button); // `this` IS the element — append into it like any node.
  }
}

customElements.define('my-counter', MyCounter);
console.log('Defined:', customElements.get('my-counter') === MyCounter);
```

## Expected Result

The **preview** shows two independent buttons, each starting at "Clicked 0 times".
Clicking one increments only that button — each `<my-counter>` is a separate instance with
its own `count`. The **console** prints:

```
Defined: true
```

## Challenge

1. Add a `reset()` method to the class and a second button that calls it, proving instance
   methods work like any object method.
2. Insert a *third* `<my-counter>` from JavaScript with
   `document.body.append(document.createElement('my-counter'))`. Confirm it upgrades and
   works without you touching the HTML.
3. Call `customElements.define('my-counter', class extends HTMLElement {})` a second time
   and read the error. Why can a name be defined only once?

## Deep Dive

Registration is one-way and permanent: once a name is defined it cannot be redefined or
undefined for the life of the document. If your class isn't defined yet when the parser
meets the tag, the element is created as an **`HTMLElement` with `:not(:defined)` state**
and sits inert until `define` runs, at which point the browser **upgrades** it. You can
await that moment with `customElements.whenDefined('my-counter')`, and style the gap with
the `:defined` / `:not(:defined)` CSS pseudo-classes to avoid a flash of unstyled custom
element.

## Common Mistakes

- Forgetting `super()` in the constructor — the element is never properly initialized and
  the constructor throws.
- Using a one-word tag name like `mycounter` — without a hyphen the browser refuses to
  define it.
- Touching `this.append`, attributes, or children **inside the constructor**. The element
  may not be in the document yet; do DOM work in `connectedCallback` instead.
- Expecting all instances to share state — each tag is a separate object instance.
