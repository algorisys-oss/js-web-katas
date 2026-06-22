---
id: "phase-06/003-creating-and-inserting-nodes"
title: "Creating & Inserting Nodes"
phase: 6
sequence: 3
difficulty: "beginner"
tags: ["dom"]
prerequisites: ["phase-06/002-traversing-the-dom"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

To add content you build new nodes in memory, then attach them to the tree. The core
factory is **`document.createElement(tag)`**, which makes a detached element you can
configure before it is ever painted. You fill it with text via **`textContent`** (safe —
it never parses HTML) and place it with one of the modern insertion methods:

- **`parent.append(...nodes)`** — add to the **end** of a parent's children.
- **`parent.prepend(...nodes)`** — add to the **start**.
- **`ref.before(...nodes)`** / **`ref.after(...nodes)`** — insert as a *sibling* just
  before/after a reference element.
- **`ref.replaceWith(...nodes)`** — swap a node for new ones.

These accept multiple nodes *and* plain strings (auto-wrapped as text), which is why they
have largely replaced the older `appendChild`/`insertBefore` pair.

When you need to parse a chunk of markup rather than build node by node, use
**`element.insertAdjacentHTML(position, htmlString)`** with a position of `'beforebegin'`,
`'afterbegin'`, `'beforeend'`, or `'afterend'`. It parses and inserts without blowing away
existing children the way `innerHTML =` does — but because it parses HTML, **never pass
untrusted/user input through it** (that is an XSS hole; Phase 17). For text, prefer
`textContent`.

## Key Insight

> Build detached nodes with `createElement`, set text with `textContent`, and place them
> with `append`/`prepend`/`before`/`after`. Reach for `insertAdjacentHTML` only for trusted
> markup — it parses HTML and can introduce XSS.

## Experiment

```html
<h2>Reading list</h2>
<ul id="list">
  <li>Existing item</li>
</ul>
<button id="add">Add book</button>
```

```css
li { font-family: system-ui, sans-serif; margin: 2px 0; }
.new { color: #15803d; }
```

```js
const list = document.querySelector('#list');
const books = ['Eloquent JS', 'You Don\'t Know JS', 'High Performance Browser Networking'];

let i = 0;
document.querySelector('#add').addEventListener('click', () => {
  if (i >= books.length) return;

  // 1. Create a detached <li> and fill it safely with text.
  const li = document.createElement('li');
  li.textContent = books[i++];
  li.classList.add('new');

  // 2. Attach it to the end of the list — now it is live and painted.
  list.append(li);
  console.log('appended:', li.textContent, '→ total', list.children.length);
});

// prepend puts a node first; before/after insert as siblings.
const banner = document.createElement('p');
banner.textContent = 'Click "Add book" to grow the list.';
list.before(banner); // sibling just above the <ul>

// insertAdjacentHTML parses a trusted markup string in place.
list.insertAdjacentHTML('beforeend', '<li><em>(end marker)</em></li>');
```

## Expected Result

In the **preview** you see the banner paragraph, then a list containing "Existing item" and
an italic "(end marker)". Each click on **Add book** appends the next title in green, until
all three are added (further clicks do nothing). The **console** logs one line per addition,
e.g.:

```
appended: Eloquent JS → total 3
appended: You Don't Know JS → total 4
appended: High Performance Browser Networking → total 5
```

(The starting total is 2 — the existing item plus the `(end marker)`.)

## Challenge

1. Swap `append` for `prepend` so new books appear at the **top**. Then use
   `list.firstElementChild.before(li)` to get the same effect — which reads more clearly?
2. After adding a book, give it a "remove" by selecting it and calling `li.remove()` after a
   2-second `setTimeout`. Confirm the node leaves the live tree.
3. Replace the `textContent` line with `insertAdjacentHTML` and try inserting the string
   `'<img src=x onerror="alert(1)">'`. Observe why parsing arbitrary HTML is dangerous (the
   sandbox blocks the alert, but the handler still fires conceptually).

## Deep Dive

A node created with `createElement` is **detached**: it exists as an object but has no
parent, so it triggers no layout or paint until you insert it. This is why building a
subtree fully *before* attaching it is cheap — the browser only does layout work once, when
the finished piece joins the document (the basis for `DocumentFragment`, kata 5). The
`append`/`before`/`after` family came from the DOM "ChildNode/ParentNode" mixins and is
strictly more convenient than `appendChild`: it takes multiple arguments, accepts strings,
and returns `undefined` instead of the node, so it composes differently. `innerHTML =`
re-parses and **replaces** all existing children (discarding their listeners and state);
`insertAdjacentHTML` adds without that collateral damage.

## Common Mistakes

- Setting `innerHTML +=` to add an item — it re-serializes and re-parses the whole
  container, destroying existing nodes' event listeners and form state.
- Passing user-controlled strings to `innerHTML` or `insertAdjacentHTML` — that is an XSS
  vulnerability. Use `textContent` for text.
- Forgetting that a `createElement` node isn't visible until you `append`/insert it — "I
  created it but nothing showed up."
- Using `appendChild` and being surprised it only takes one node and no strings — the
  modern `append` accepts many of each.
