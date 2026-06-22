---
id: "phase-14/005-building-a-reusable-component"
title: "Building a Reusable Component"
phase: 14
sequence: 5
difficulty: "advanced"
tags: ["web-components", "shadow-dom", "custom-events"]
prerequisites: ["phase-14/004-lifecycle-callbacks"]
estimated_minutes: 15
starter: ["html", "js"]
network: false
---

## Concept

Now assemble everything into one real, reusable component — a `<star-rating>`. A
production-grade custom element combines all four ideas from this phase:

1. **Custom element** — `class extends HTMLElement` + `customElements.define`, with
   `observedAttributes` so it reacts to its HTML.
2. **Shadow DOM** — a private, **style-encapsulated** tree so the host page can't break it
   and it can't leak styles out.
3. **A cloned `<template>`** — the internal markup, stamped once per instance, including a
   `<slot>` so callers can supply a label.
4. **A custom event** — the component talks *back* to the page by dispatching a
   `CustomEvent('rate-change', { detail, bubbles, composed })`. Crucially, `composed: true`
   lets the event **cross the shadow boundary** so page listeners on the host can hear it;
   without it the event would be trapped inside the shadow tree.

This is the standard contract of a reusable component: **attributes in** (configuration),
**events out** (notifications), shadow DOM for isolation, a slot for content. Anyone can
drop the tag on any page — framework or not — and wire it up with plain DOM.

## Key Insight

> A reusable component is **attributes in, events out**, wrapped in shadow DOM for
> isolation. `dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))`
> is how it notifies the outside — `composed: true` is what lets it escape the shadow tree.

## Experiment

```html
<star-rating value="2" max="5">Rate this kata:</star-rating>
<p id="status">No rating yet.</p>
```

```js
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-flex; align-items: center; gap: 8px;
            font: 16px sans-serif; }
    .stars { cursor: pointer; user-select: none; }
    .star { color: #ccc; font-size: 24px; transition: color .12s; }
    .star.on { color: #f5b301; }              /* themeable via a custom prop below */
    .star.on { color: var(--star-color, #f5b301); }
  </style>
  <slot></slot>
  <span class="stars" part="stars"></span>
`;

class StarRating extends HTMLElement {
  static get observedAttributes() { return ['value', 'max']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this._stars = this.shadowRoot.querySelector('.stars');
    // One delegated listener; clicking a star sets the value attribute.
    this._stars.addEventListener('click', (e) => {
      const star = e.target.closest('.star');
      if (star) this.value = Number(star.dataset.index) + 1;
    });
  }

  // Property <-> attribute reflection: el.value = 3 updates the HTML attribute.
  get value() { return Number(this.getAttribute('value')) || 0; }
  set value(v) { this.setAttribute('value', v); }
  get max() { return Number(this.getAttribute('max')) || 5; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
    if (name === 'value' && oldValue !== null) {
      // Notify the outside world. composed:true crosses the shadow boundary.
      this.dispatchEvent(new CustomEvent('rate-change', {
        detail: { value: this.value, max: this.max },
        bubbles: true,
        composed: true,
      }));
    }
  }

  connectedCallback() { this.render(); }

  render() {
    this._stars.innerHTML = '';
    for (let i = 0; i < this.max; i++) {
      const s = document.createElement('span');
      s.className = 'star' + (i < this.value ? ' on' : '');
      s.dataset.index = i;
      s.textContent = '★';
      this._stars.append(s);
    }
  }
}
customElements.define('star-rating', StarRating);

// The page listens for the component's custom event — composed:true makes it audible here.
document.querySelector('star-rating').addEventListener('rate-change', (e) => {
  document.getElementById('status').textContent =
    `You rated ${e.detail.value} / ${e.detail.max}`;
  console.log('rate-change:', e.detail);
});
```

## Expected Result

The **preview** shows the projected label "Rate this kata:" followed by five stars with the
first two filled gold (from `value="2"`). Clicking the fourth star fills four stars and the
paragraph updates to "You rated 4 / 5". Each click logs to the **console**:

```
rate-change: { value: 4, max: 5 }
```

The label comes through the `<slot>`; the stars and styles live encapsulated in the shadow
tree; configuration flows in via attributes; the result flows out via the custom event.

## Challenge

1. Add keyboard support: give the host `tabindex="0"`, `role="slider"`, and arrow-key
   handling that adjusts `value`. Reflect `aria-valuenow`/`aria-valuemax` so it is
   accessible.
2. Theme it from the page with `star-rating { --star-color: crimson }` and confirm the CSS
   custom property pierces the shadow boundary while ordinary page CSS does not.
3. Add hover preview: on `mouseover` a star, light stars up to it without changing `value`;
   restore on `mouseleave`. Keep the committed value separate from the hover preview.

## Deep Dive

This **attributes-in / events-out** shape is exactly how the platform's own elements behave
(`<input>` has a `value` attribute and fires `input`/`change`), and it is why custom
elements interoperate with *any* framework — React, Vue, and Solid all set attributes and
listen for DOM events. Three event flags matter: `bubbles` (travels up the ancestor chain),
`composed` (escapes shadow boundaries — without it, listeners outside the component never
see it), and `cancelable` (lets a listener call `preventDefault()`). The `detail` object
carries your payload. For richer config than strings, expose **JS properties** (like the
`value` getter/setter here) alongside attributes and keep them reflected in sync.

## Common Mistakes

- Dispatching a `CustomEvent` **without `composed: true`** from inside shadow DOM — it never
  reaches listeners on the host, and you wonder why "nothing happens."
- Re-rendering the whole shadow tree on every change and re-attaching listeners each time —
  attach once in the constructor and update only what changed.
- Reflecting a property to an attribute *and* reacting to that attribute without an
  equality guard (`oldValue === newValue`) — you create an infinite update loop.
- Forgetting that page CSS can't style shadow internals — expose CSS custom properties and
  `::part()` (note the `part="stars"` hook above) for theming.
