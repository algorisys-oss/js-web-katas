---
id: "phase-06/001-selecting-elements"
title: "Selecting Elements"
phase: 6
sequence: 1
difficulty: "beginner"
tags: ["dom"]
prerequisites: ["phase-05/005-cancellation-and-abortcontroller"]
estimated_minutes: 12
starter: ["html", "css", "js"]
network: false
---

## Concept

Before you can change anything on a page, you have to *find* it. The DOM is a live tree of
element objects, and `document` is your entry point into that tree. There are two modern
methods you will reach for almost every time:

- **`document.querySelector(selector)`** — returns the **first** element matching a CSS
  selector, or `null` if nothing matches.
- **`document.querySelectorAll(selector)`** — returns a **static `NodeList`** of *all*
  matches (empty if none).

Because they take CSS selectors, the same syntax you use in a stylesheet works here:
`'#id'`, `'.class'`, `'tag'`, `'ul > li'`, `'[data-active]'`, `'input:checked'`. That one
idea replaces the older grab-bag of `getElementById`, `getElementsByClassName`, and
`getElementsByTagName`.

Two details matter. First, `querySelector` searching for something that isn't there gives
you `null` — and `null.textContent` throws, which is the classic "Cannot read properties
of null" crash. Always confirm the element exists. Second, the `NodeList` from
`querySelectorAll` is **not** an array; it has `forEach` but lacks `map`/`filter` until you
spread it into one with `[...list]`.

## Key Insight

> `querySelector`/`querySelectorAll` take **CSS selectors** — the same language as your
> stylesheet — so one mental model finds anything. A miss returns `null` (single) or an
> empty `NodeList` (all), never an error.

## Experiment

```html
<section id="menu">
  <h2>Menu</h2>
  <ul>
    <li class="dish" data-price="9">Soup</li>
    <li class="dish special" data-price="14">Steak</li>
    <li class="dish" data-price="7">Salad</li>
  </ul>
</section>
<p id="report"></p>
```

```css
.special { font-weight: bold; color: #b91c1c; }
#report { font-family: system-ui, sans-serif; }
```

```js
// First match for a CSS selector (or null).
const heading = document.querySelector('#menu h2');
console.log('heading text:', heading.textContent);

// The special dish: an element with BOTH classes.
const special = document.querySelector('.dish.special');
console.log('special dish:', special.textContent);

// All matches → a static NodeList (array-like, has forEach).
const dishes = document.querySelectorAll('.dish');
console.log('dish count:', dishes.length);
dishes.forEach((li) => console.log('-', li.textContent, li.dataset.price));

// A miss returns null — never throws by itself.
console.log('missing:', document.querySelector('.dessert'));

// Show a result in the preview, too. Spread to use array methods.
const total = [...dishes].reduce((sum, li) => sum + Number(li.dataset.price), 0);
document.querySelector('#report').textContent = `Total: $${total}`;
```

## Expected Result

In the **preview**, "Steak" appears bold and red (the `.special` rule), and a paragraph
reads **"Total: $30"**. The **console** prints:

```
heading text: Menu
special dish: Steak
dish count: 3
- Soup 9
- Steak 14
- Salad 7
missing: null
```

## Challenge

1. Replace `querySelectorAll('.dish')` with `getElementsByClassName('dish')` and log both.
   The second is a *live* `HTMLCollection` — add a new `.dish` and watch its `length` change
   while the `NodeList` stays fixed.
2. Use a single selector to grab only dishes priced over 8 — hint: an attribute selector
   alone can't compare numbers, so select all and `filter` the spread.
3. Call `special.querySelector('...')` and confirm that selecting *scopes* to that element's
   subtree, not the whole document.

## Deep Dive

`querySelectorAll` returns a **static** snapshot: it walks the tree once and freezes the
matches. The older `getElementsByClassName`/`getElementsByTagName` return **live**
collections that re-query the DOM as it changes — handy occasionally, but a surprise when
you iterate while mutating. Selector matching itself reads right-to-left (the browser starts
from the rightmost simple selector and walks up), which is why overly broad descendant
selectors can be slower than a direct `#id`. For one element by id, `getElementById` is the
most direct call there is.

## Common Mistakes

- Calling a property on the result of `querySelector` without checking for `null` first —
  the "Cannot read properties of null" crash.
- Treating a `NodeList` like an array and calling `.map`/`.filter` on it — spread it first
  (`[...nodeList]`) or use `Array.from`.
- Forgetting the `#` for ids or `.` for classes in the selector string, so it silently
  matches nothing.
- Assuming `querySelectorAll` is live — it is a frozen snapshot; nodes added later won't
  appear in it.
