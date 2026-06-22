---
id: "phase-14/003-templates-and-slots"
title: "Templates & Slots"
phase: 14
sequence: 3
difficulty: "intermediate"
tags: ["web-components", "shadow-dom", "templates"]
prerequisites: ["phase-14/002-shadow-dom"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

Building a shadow tree with `innerHTML` re-parses an HTML string every single time an
element is created. The **`<template>`** element fixes that: its contents are parsed once
by the browser but **inert** — not rendered, scripts don't run, images don't load. You hold
a reusable blueprint and stamp out copies with `template.content.cloneNode(true)`, which is
far cheaper than re-parsing strings.

The second half is **`<slot>`**. A component's shadow tree is its private structure, but you
often want the *user* of the tag to supply content — a label, an icon, body text. A `<slot>`
inside the shadow tree is a placeholder; whatever **light-DOM children** the user nests
inside the host tag get **projected** into the matching slot. This is **composition**: the
light children stay in the light DOM (page CSS still styles them) but *render at* the slot's
position inside the shadow tree.

- A bare `<slot>` is the **default slot** — it receives any child without a `slot=` attribute.
- A `<slot name="title">` is a **named slot** — it receives children marked
  `slot="title"`. This lets you route different children to different positions.
- The **`slotchange`** event fires on a slot whenever its assigned (projected) nodes change,
  so a component can react to its content being swapped.

## Key Insight

> `<template>` is a parse-once, inert blueprint you clone per instance. `<slot>` projects
> the user's light-DOM children into your shadow tree — that is how a component lets callers
> fill in content without breaking encapsulation.

## Experiment

```html
<!-- A reusable, inert blueprint for the shadow tree. -->
<template id="card-tpl">
  <style>
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 12px 16px;
            font: 15px sans-serif; max-width: 320px; }
    .card h3 { margin: 0 0 6px; color: #6366f1; }
    ::slotted(em) { color: #b91c1c; font-style: normal; } /* style projected nodes */
  </style>
  <div class="card">
    <h3><slot name="title">Untitled</slot></h3>
    <slot>No body provided.</slot>
  </div>
</template>

<!-- Light-DOM children get projected into the named/default slots. -->
<info-card>
  <span slot="title">Web Components</span>
  This is the <em>default-slot</em> body, supplied by the page.
</info-card>
```

```js
class InfoCard extends HTMLElement {
  constructor() {
    super();
    const tpl = document.getElementById('card-tpl');
    const shadow = this.attachShadow({ mode: 'open' });
    // Clone the parsed template instead of re-parsing an HTML string.
    shadow.append(tpl.content.cloneNode(true));

    // React when projected content changes.
    shadow.querySelector('slot:not([name])').addEventListener('slotchange', (e) => {
      console.log('default slot assigned nodes:', e.target.assignedNodes().length);
    });
  }
}
customElements.define('info-card', InfoCard);
```

## Expected Result

The **preview** shows a bordered card titled "Web Components" (from the `slot="title"`
span) with body text below it, where "default-slot" appears in red because `::slotted(em)`
styled the projected `<em>`. The fallback text ("Untitled", "No body provided.") is hidden
because both slots received content. The **console** logs the number of nodes assigned to
the default slot, e.g.:

```
default slot assigned nodes: 3
```

## Challenge

1. Remove the `slot="title"` span from the light DOM and reload. Confirm the fallback
   "Untitled" now shows — slot fallback content renders only when nothing is projected.
2. After definition, append a new child into the `<info-card>` from JS and watch the
   `slotchange` log fire with the updated count.
3. Add a `<slot name="footer">` to the template and a `slot="footer"` element to the page.
   Route content to three distinct regions of one component.

## Deep Dive

Projected nodes are *referenced*, not moved — they remain in the light DOM tree, so
`document.querySelector` still finds them and page CSS still applies, while the shadow tree
controls *where* they visually appear. Inside shadow CSS, the **`::slotted(selector)`**
pseudo-element styles top-level projected nodes (it can't reach their descendants). To read
assignments in JS, use `slot.assignedNodes()` (all nodes) or `slot.assignedElements()`
(elements only); pass `{ flatten: true }` to resolve nested slots. This "flattened tree" —
shadow tree with light children spliced into their slots — is what the browser actually
renders.

## Common Mistakes

- Re-parsing an HTML string per instance instead of cloning a `<template>` — wasteful for
  components created many times.
- Forgetting `cloneNode(true)` (deep) — a shallow clone copies the template element but none
  of its contents.
- Expecting `::slotted()` to style descendants of projected nodes — it only matches the
  top-level assigned nodes themselves.
- Assuming projected children live in the shadow tree — they stay in the light DOM and only
  *render* at the slot.
