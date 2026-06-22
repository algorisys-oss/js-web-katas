---
id: "phase-06/002-traversing-the-dom"
title: "Traversing the DOM Tree"
phase: 6
sequence: 2
difficulty: "beginner"
tags: ["dom"]
prerequisites: ["phase-06/001-selecting-elements"]
estimated_minutes: 13
starter: ["html", "css", "js"]
network: false
---

## Concept

Once you hold a reference to one element, you can walk to its relatives without selecting
again. The DOM is a tree, so every node has a parent, siblings, and children. The browser
gives you two parallel sets of navigation properties:

- **Node** properties count *everything*, including whitespace text nodes:
  `parentNode`, `childNodes`, `firstChild`, `nextSibling`, `previousSibling`.
- **Element** properties skip text and comments, giving you only element neighbors:
  `parentElement`, `children`, `firstElementChild`, `nextElementSibling`,
  `previousElementSibling`.

For element work you almost always want the **Element** variants — the indentation in your
HTML creates text nodes that make `firstChild` return a whitespace node, not your `<li>`.

There is also a powerful upward search: **`element.closest(selector)`** walks from the
element up through its ancestors and returns the nearest one matching the selector
(including the element itself), or `null`. It is the inverse of `querySelector` and the
backbone of event delegation in Phase 7.

## Key Insight

> Use the **Element** navigation properties (`children`, `nextElementSibling`,
> `parentElement`) to skip whitespace text nodes, and `closest(selector)` to search
> **upward** for the nearest matching ancestor.

## Experiment

```html
<ul id="tree">
  <li>Apple</li>
  <li class="target">Banana <span class="tag">ripe</span></li>
  <li>Cherry</li>
</ul>
<p id="out"></p>
```

```css
.target { background: #fef9c3; }
.lit { outline: 2px solid #2563eb; }
#out { font-family: system-ui, sans-serif; }
```

```js
const span = document.querySelector('.tag');

// Upward: nearest ancestor that is an <li>.
const li = span.closest('li');
console.log('closest li:', li.firstChild.textContent.trim()); // "Banana "

// childNodes counts whitespace; children does not.
const list = document.querySelector('#tree');
console.log('childNodes:', list.childNodes.length, 'children:', list.children.length);

// Sideways: element siblings skip the whitespace between tags.
console.log('next sibling:', li.nextElementSibling.textContent); // "Cherry"
console.log('prev sibling:', li.previousElementSibling.textContent); // "Apple"

// Upward to the parent element (never a text node).
console.log('parent tag:', li.parentElement.tagName); // "UL"

// Show traversal in the preview: outline every sibling of the target.
for (const item of li.parentElement.children) item.classList.add('lit');
document.querySelector('#out').textContent =
  `Highlighted ${list.children.length} items via children.`;
```

## Expected Result

In the **preview**, all three list items gain a blue outline (and "Banana" keeps its yellow
background), with a line reading **"Highlighted 3 items via children."** The **console**
prints:

```
closest li: Banana
childNodes: 7 children: 3
next sibling: Cherry
prev sibling: Apple
parent tag: UL
```

`childNodes` is 7 because the newlines and indentation between the `<li>` tags are text
nodes; `children` counts only the three elements.

## Challenge

1. Log `list.firstChild` and `list.firstElementChild` side by side. Explain why the first
   is a `#text` node and the second is the `<li>`.
2. From the `.tag` span, call `closest('ul')` and then `closest('table')`. Why does the
   second return `null`?
3. Write a loop that starts at `li.firstElementChild` and walks `nextElementSibling` until
   it is `null`, collecting each item's text — reimplementing `children` iteration by hand.

## Deep Dive

`closest` is what makes **event delegation** ergonomic: you attach one listener to a
container, and inside the handler call `event.target.closest('.row')` to find which row was
actually clicked, even if the click landed on a nested icon or `<span>`. Without it you'd
write a manual `while (node && node !== container) node = node.parentElement` loop. Note
that `closest` matches the element itself first, so `span.closest('span')` returns the span,
not an ancestor. All of these properties read the *live* tree — if you mutate the DOM, the
very next access reflects the change.

## Common Mistakes

- Using `firstChild`/`nextSibling` and getting a whitespace `#text` node instead of the
  element you expected — reach for the `*Element*` variants.
- Confusing `childNodes` (all node types, live `NodeList`) with `children` (elements only,
  live `HTMLCollection`).
- Expecting `closest` to search *downward* — it only walks up the ancestor chain; use
  `querySelector` to search a subtree.
- Forgetting that `closest` can return the element itself when the element matches the
  selector.
