---
id: "phase-14/002-shadow-dom"
title: "Shadow DOM"
phase: 14
sequence: 2
difficulty: "intermediate"
tags: ["web-components", "shadow-dom", "dom"]
prerequisites: ["phase-14/001-custom-elements"]
estimated_minutes: 13
starter: ["html", "js"]
network: false
---

## Concept

A custom element built only with `this.append` puts its markup straight into the page's
main DOM (the **light DOM**), where outside CSS can restyle it and outside scripts can
reach into it. That breaks encapsulation: your component's internals are public.

**Shadow DOM** fixes this. `this.attachShadow({ mode: 'open' })` attaches a private DOM
subtree — the **shadow root** — to your element and returns it. Anything you render inside
the shadow root is:

- **Style-encapsulated** — `<style>` rules inside the shadow root apply *only* there, and
  page-level CSS does not leak *in*. A `.title { color: red }` on the page won't touch a
  `.title` in your shadow tree, and vice versa.
- **DOM-encapsulated** — `document.querySelector` from the page cannot see shadow nodes.
  The element renders a shadow tree but reports no light-DOM children.

The element you see in the page is the **host**; the boundary between host and its shadow
tree is the **shadow boundary**. `mode: 'open'` exposes the tree as `element.shadowRoot`
for debugging; `mode: 'closed'` returns `null` there and keeps the reference fully private.

## Key Insight

> `attachShadow({ mode: 'open' })` gives an element a private DOM subtree. Styles defined
> inside the shadow root stay in; page styles stay out. That isolation is what makes a
> component truly reusable.

## Experiment

```html
<style>
  /* This page-level rule tries to paint every <p> red... */
  p { color: red; font-weight: bold; }
</style>
<p>I am a light-DOM paragraph (page CSS makes me red).</p>
<fancy-badge></fancy-badge>
```

```js
class FancyBadge extends HTMLElement {
  constructor() {
    super();
    // Attach a private shadow tree and render into it.
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        /* Scoped to THIS shadow root only. */
        p { color: white; background: #6366f1; padding: 4px 10px;
            border-radius: 999px; font: 14px sans-serif; display: inline-block; }
      </style>
      <p>Shadow DOM — page CSS can't reach me</p>
    `;
  }
}
customElements.define('fancy-badge', FancyBadge);

// The page cannot see into the shadow tree:
console.log('light-DOM <p> count on page:', document.querySelectorAll('p').length);
console.log('badge.shadowRoot exists:', !!document.querySelector('fancy-badge').shadowRoot);
```

## Expected Result

The **preview** shows a red bold paragraph (styled by page CSS) above a pill-shaped indigo
badge. The badge's own paragraph is **not** red — the page's `p { color: red }` cannot
cross the shadow boundary, and the badge's `p` style does not leak out. The **console**
prints:

```
light-DOM <p> count on page: 1
badge.shadowRoot exists: true
```

`querySelectorAll('p')` finds only the *one* light-DOM paragraph; the badge's paragraph is
hidden inside the shadow root.

## Challenge

1. Move the page's `p { color: red }` rule and confirm it never affects the badge no matter
   how specific you make it. Then add `:host { … }` inside the shadow `<style>` to style the
   badge element from the inside.
2. Switch to `attachShadow({ mode: 'closed' })` and log `element.shadowRoot`. What changes,
   and why might a library prefer `closed`?
3. From the page, try `document.querySelector('fancy-badge p')`. Why is the result `null`?

## Deep Dive

Style encapsulation is *bidirectional but not total*. Inherited properties like `color`,
`font`, and `line-height` still **inherit across the boundary** from the host's context
unless the shadow tree overrides them — that is intentional, so components blend into their
surroundings. To intentionally let the outside theme the inside, components expose **CSS
custom properties** (which pierce the boundary) and `::part()` hooks. The `:host`,
`:host(...)`, and `:host-context(...)` selectors let shadow CSS style the host element
itself based on its attributes or ancestors.

## Common Mistakes

- Expecting page CSS to style shadow internals — by design it can't. Theme with CSS custom
  properties or `::part()` instead.
- Forgetting that **inherited** properties (`color`, `font`) still cross the boundary, then
  being surprised your component "leaks" a font.
- Calling `attachShadow` twice on the same element — it throws; an element has one shadow
  root.
- Querying shadow content with `document.querySelector` from the page — use the host's
  `shadowRoot.querySelector` instead.
