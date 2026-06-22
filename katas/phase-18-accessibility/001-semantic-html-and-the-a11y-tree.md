---
id: "phase-18/001-semantic-html-and-the-a11y-tree"
title: "Semantic HTML & the Accessibility Tree"
phase: 18
sequence: 1
difficulty: "beginner"
tags: ["accessibility", "semantic-html", "dom"]
prerequisites: ["phase-17/005-tokens-cookies-and-storage-security"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

The browser builds the visual DOM *and*, in parallel, an **accessibility tree**: a
stripped-down representation that assistive technology (screen readers, voice control,
switch devices) actually consumes. Each node in that tree has a **role** (what kind of
thing it is — button, heading, link), a **name** (its accessible label — usually the
text), and **state/properties** (pressed, checked, expanded, disabled).

When you use the right native element, you get all three for free. A `<button>` has role
`button`, its name comes from its text, it is focusable, it fires `click` on **Enter** and
**Space**, and it announces as "button" to a screen reader. A `<div onclick>` styled to
*look* like a button has role `generic`, no name, is not focusable, ignores the keyboard,
and is invisible to assistive tech. "Div soup" — building UI from anonymous `<div>` and
`<span>` — produces a flat, meaningless tree.

Semantic elements (`<nav>`, `<main>`, `<header>`, `<h1>`–`<h6>`, `<button>`, `<label>`,
`<ul>`/`<li>`) also create **landmarks** and a **document outline** that let screen-reader
users jump straight to regions and navigate by heading. You cannot get that from `<div>`.

## Key Insight

> The browser exposes an accessibility tree, not your CSS. Choose the element for its
> *meaning* (role, name, behavior), then style it — never the reverse.

## Experiment

```html
<nav aria-label="Primary">
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#docs">Docs</a></li>
  </ul>
</nav>
<main>
  <h1>Semantic vs div soup</h1>

  <!-- Native button: has a role, a name, is focusable, keyboard-operable -->
  <button id="real">Real button</button>

  <!-- "Div soup": looks clickable, but the a11y tree sees almost nothing -->
  <div id="fake" style="cursor:pointer; text-decoration:underline">Fake button</div>
</main>
```

```js
// We can't hear a screen reader here, but we CAN reason about the a11y tree.
const real = document.getElementById('real');
const fake = document.getElementById('fake');

function describe(el) {
  return {
    tag: el.tagName.toLowerCase(),
    // role is implicit for native elements; explicit-only for generic ones
    implicitRole: el.tagName === 'BUTTON' ? 'button' : 'generic (none)',
    accessibleName: el.textContent.trim() || '(none)',
    focusable: el.tabIndex >= 0 || el.tagName === 'BUTTON' || el.tagName === 'A',
  };
}

console.log('real  →', describe(real));
console.log('fake  →', describe(fake));

// Prove the keyboard difference: a native button fires click on Enter/Space.
real.addEventListener('click', () => console.log('real button activated'));
fake.addEventListener('click', () => console.log('fake "button" activated'));
console.log('Tab to each element and press Enter. Only the real button responds.');
```

## Expected Result

In the **preview** both look clickable, and a mouse click logs activation for either one.
But press **Tab**: focus lands on the links and the *real* button, and **skips the fake
one entirely** (it is not in the tab order). Press **Enter** on the focused real button
and it logs "real button activated"; the fake div can never be reached or activated by
keyboard. The **console** shows the real button has role `button`, a name, and is
focusable, while the fake div is `generic` with no role and no keyboard behavior.

A screen reader would announce the real button as *"Real button, button,"* let the user
jump to the `nav` landmark and the `h1`, and ignore the div as meaningless text. That
keyboard-and-announcement gap is exactly what semantic HTML closes for free.

## Challenge

1. Add a real `<label for="email">Email</label>` and `<input id="email">`. Click the
   label text and watch focus jump into the input — that association is part of the
   accessible name and comes free from `<label>`.
2. Try to "fix" the fake div by adding `role="button"`, `tabindex="0"`, and a `keydown`
   handler for Enter/Space. Count how many lines it takes to re-implement what `<button>`
   gave you — this is the first argument *against* ARIA.
3. Remove the `<h1>` and add a second `<nav>` without an `aria-label`. Explain how a
   screen-reader user navigating by landmark/heading is now worse off.

## Deep Dive

The accessibility tree is derived from the DOM by the browser and handed to the platform
accessibility API (UIA on Windows, AX on macOS, AT-SPI on Linux), which screen readers
read. The **accessible name** is computed by a precise algorithm (the
[Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/)) that
walks sources in priority order: `aria-labelledby`, then `aria-label`, then the element's
own content/`<label>`, then `title`. Understanding that "name" is *computed* — not just
"the text" — is the foundation for everything in this phase.

## Common Mistakes

- Building interactive controls from `<div>`/`<span>` and bolting behavior on with
  JavaScript, instead of using `<button>`, `<a>`, `<input>`, or `<select>`.
- Using a heading because it *looks* big, or skipping heading levels (`h1` → `h4`), which
  breaks the document outline screen-reader users rely on to navigate.
- Forgetting that an accessible *name* must exist: an icon-only `<button></button>` with
  no text and no `aria-label` announces as just "button" with no purpose.
- Assuming sighted-mouse testing is enough. Always Tab through the page; anything you
  can't reach or operate with the keyboard is broken for many users.
