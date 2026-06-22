---
id: "phase-06/004-attributes-classes-and-datasets"
title: "Attributes, Classes & Datasets"
phase: 6
sequence: 4
difficulty: "intermediate"
tags: ["dom"]
prerequisites: ["phase-06/003-creating-and-inserting-nodes"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

Elements carry state in three overlapping ways, and knowing which to use prevents subtle
bugs.

**Attributes** are the strings written in the HTML source. You read/write them with
`getAttribute`, `setAttribute`, `hasAttribute`, `removeAttribute`, and `toggleAttribute`.
Use these for ARIA (`aria-expanded`), `href`, `for`, and any attribute without a clean DOM
property.

**Properties** are the live values on the element *object*. Many attributes have a matching
property (`element.id`, `element.value`, `element.checked`, `element.hidden`) that is often
more convenient and correctly typed (a boolean, not a string). The catch: an **attribute is
the initial value; the property is the current value**. After a user types into an
`<input>`, `input.value` updates but `getAttribute('value')` still shows the original — they
drift apart on purpose.

**Classes** get a dedicated, ergonomic API: **`element.classList`** with `.add()`,
`.remove()`, `.toggle()` (returns the resulting boolean), `.replace(a, b)`, and
`.contains()`. Never hand-edit `className` strings.

**Datasets** let you stash custom data on an element using `data-*` attributes, read back
through the **`element.dataset`** object with camelCased keys: `data-user-id="7"` becomes
`element.dataset.userId === "7"` (always a string).

## Key Insight

> Attributes are the **initial** HTML strings; properties are the **current** live values —
> they can diverge. Toggle CSS state with `classList`, and read/write custom data through
> `dataset` (camelCased, always strings).

## Experiment

```html
<button id="toggle" aria-expanded="false" data-panel-id="42">Details</button>
<section id="panel" hidden>
  <p>Now you can see me.</p>
</section>
<p id="log"></p>
```

```css
button[aria-expanded="true"] { background: #2563eb; color: white; }
#log { font-family: system-ui, sans-serif; }
```

```js
const btn = document.querySelector('#toggle');
const panel = document.querySelector('#panel');
const log = document.querySelector('#log');

// dataset reads data-* as camelCased strings.
console.log('panel id from dataset:', btn.dataset.panelId, typeof btn.dataset.panelId);

btn.addEventListener('click', () => {
  // toggle() returns the new boolean — drive ARIA + the hidden property from it.
  const open = !panel.hidden ? false : true;
  panel.hidden = !open;                          // boolean PROPERTY, not a string
  btn.setAttribute('aria-expanded', String(open)); // ARIA wants a string ATTRIBUTE
  btn.classList.toggle('open', open);            // force the class to match state

  log.textContent = `aria-expanded attribute: ${btn.getAttribute('aria-expanded')}, ` +
                    `hidden property: ${panel.hidden}`;
  console.log('open?', open, '| classList:', [...btn.classList].join(' '));
});
```

## Expected Result

In the **preview**, clicking **Details** shows/hides the panel and the button turns blue
when expanded (the `[aria-expanded="true"]` rule). The log line updates, e.g. after the
first click: **"aria-expanded attribute: true, hidden property: false"**. The **console**
prints once at start:

```
panel id from dataset: 42 string
```

and then on each click something like:

```
open? true | classList: open
open? false | classList:
```

Note `dataset.panelId` is the **string** `"42"`, not the number `42`.

## Challenge

1. Replace `panel.hidden = !open` with `panel.setAttribute('hidden', '')` /
   `panel.removeAttribute('hidden')`. Both work — explain why setting the *attribute* to an
   empty string still hides the panel (boolean attributes are presence-based).
2. Type into a new `<input value="start">`, then log `input.value` vs
   `input.getAttribute('value')`. Watch the property change while the attribute stays
   `"start"`.
3. Store JSON in a dataset: `el.dataset.config = JSON.stringify({a:1})`, read it back, and
   `JSON.parse` it. Why must you serialize — what type is `dataset` always?

## Deep Dive

The attribute/property split exists because HTML attributes are *text* in a markup
document, while the DOM is a graph of *typed objects*. For most attributes the browser
"reflects" the attribute into a property and keeps them in sync (`id`, `className`,
`hidden`). But for *user-editable* state — `value`, `checked` — only the **initial** value
reflects; subsequent changes live on the property so the original default isn't lost (useful
for form resets). `classList` is a live `DOMTokenList`, and `toggle(name, force)` with the
optional second argument is the clean way to *set* a class to a known state rather than flip
it. Datasets are just sugar over `data-*` attributes, so everything in them is a string —
serialize anything richer.

## Common Mistakes

- Building class strings by hand (`el.className += ' active'`) and accidentally clobbering
  or duplicating classes — use `classList`.
- Expecting `getAttribute('value')` to reflect what the user typed — it returns the *initial*
  attribute, not the live property.
- Storing a number or object in `dataset` and forgetting it comes back as a string — convert
  with `Number(...)` or `JSON.parse(...)`.
- Setting a boolean attribute to `"false"` (`setAttribute('hidden', 'false')`) and being
  surprised it's still hidden — *any* presence of a boolean attribute means true; remove it
  to turn it off.
