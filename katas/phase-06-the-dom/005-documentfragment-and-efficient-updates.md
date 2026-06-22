---
id: "phase-06/005-documentfragment-and-efficient-updates"
title: "DocumentFragment & Efficient Updates"
phase: 6
sequence: 5
difficulty: "intermediate"
tags: ["dom", "performance"]
prerequisites: ["phase-06/004-attributes-classes-and-datasets"]
estimated_minutes: 15
starter: ["html", "css", "js"]
network: false
---

## Concept

Every time you insert a node into the *live* document, you risk triggering layout work. Do
that in a loop — append 1,000 rows one at a time — and the browser may recompute geometry
many times. The fix is to **batch**: assemble everything off-screen, then attach it in a
single operation.

A **`DocumentFragment`** is a lightweight, parentless container built for exactly this. You
`append` your nodes into the fragment (which is *not* in the document, so each append costs
nothing), then `append` the whole fragment into the page **once**. Crucially, appending a
fragment moves its *children* into the target and leaves the fragment empty — the fragment
itself never appears in the DOM.

The same batching principle applies to reads and writes. **Reading** a layout property
(`offsetHeight`, `getBoundingClientRect()`) forces the browser to flush any pending layout
*now*; interleaving reads and writes in a loop causes **layout thrashing** (Phase 12). Group
all reads, then all writes.

`DocumentFragment` is also the result of cloning a `<template>` element's content — the
standard pattern for stamping out repeated UI.

## Key Insight

> A `DocumentFragment` is an off-screen staging area: append many nodes into it for free,
> then insert it into the live document **once**, so the browser lays out a single time
> instead of N times.

## Experiment

```html
<button id="build">Build 500 rows</button>
<span id="time"></span>
<ul id="list"></ul>
```

```css
#list { columns: 4; font: 13px/1.4 system-ui, sans-serif; margin-top: 8px; }
li { break-inside: avoid; }
#time { font-family: system-ui, sans-serif; margin-left: 8px; }
```

```js
const list = document.querySelector('#list');

document.querySelector('#build').addEventListener('click', () => {
  list.replaceChildren(); // clear any previous run (modern, replaces innerHTML='')

  const start = performance.now();
  const frag = document.createDocumentFragment();

  for (let i = 1; i <= 500; i++) {
    const li = document.createElement('li');
    li.textContent = `Row ${i}`;
    frag.append(li); // off-screen: no layout, no paint yet
  }

  // ONE insertion into the live tree → the browser lays out once.
  list.append(frag);

  const ms = (performance.now() - start).toFixed(2);
  console.log(`built 500 rows in ${ms}ms; fragment now empty:`, frag.childNodes.length === 0);
  document.querySelector('#time').textContent = `${list.children.length} rows in ${ms}ms`;
});
```

## Expected Result

In the **preview**, clicking **Build 500 rows** fills the list with "Row 1" … "Row 500"
laid out in four columns, and the label reads something like **"500 rows in 2.40ms"**.
Clicking again rebuilds cleanly (no duplicates, thanks to `replaceChildren()`). The
**console** prints:

```
built 500 rows in 2.40ms; fragment now empty: true
```

The exact time varies, but `fragment now empty: true` confirms the fragment handed its
children to the list and emptied itself.

## Challenge

1. Comment out the fragment and `list.append(li)` *inside* the loop instead. Compare the
   logged time and (in DevTools) the number of layout events. Is the difference visible on
   500 rows? On 50,000?
2. Demonstrate **layout thrashing**: in a loop, read `li.offsetHeight` and then write
   `li.style.height` on each item. Then refactor to read all heights first, then write —
   measure both with `performance.now()`.
3. Replace the manual `createElement` loop with a `<template>`: put one `<li>` inside
   `<template id="row">`, then `template.content.cloneNode(true)` per row. Why is cloning a
   template a clean way to stamp repeated structure?

## Deep Dive

A `DocumentFragment` has no parent and is never rendered, so mutating it triggers *zero*
layout or paint. When you append it, the DOM **moves** its children (it does not copy them)
into the target in one shot, after which the fragment is empty — that single structural
change is what the browser lays out, rather than 500 separate ones. The same "stage then
commit once" idea powers virtual-DOM diffing in frameworks and `replaceChildren()`, which
atomically swaps a node's entire child list. For genuinely huge lists, even one big insert
isn't enough — you stop creating off-screen rows at all and **virtualize**, rendering only
the visible slice (Phase 12). Measure first: on small lists the fragment win is negligible,
but the habit scales and never hurts.

## Common Mistakes

- Inserting nodes one-by-one into the live document inside a hot loop — each insertion can
  cost layout; stage them in a fragment and insert once.
- Expecting a `DocumentFragment` to *appear* in the DOM — only its children are inserted;
  the fragment itself stays out and goes empty.
- Interleaving layout reads (`offsetHeight`, `getBoundingClientRect`) and style writes in a
  loop, forcing repeated synchronous layouts (thrashing).
- Clearing a list with `innerHTML = ''` when `replaceChildren()` is clearer and avoids
  re-parsing an empty string — and reusing `innerHTML +=` to add, which re-parses everything.
