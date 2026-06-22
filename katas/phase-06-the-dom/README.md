# Phase 6 — The DOM

**Ladder rung:** 4 — The DOM (the live tree your JavaScript drives).

## Goal

Learn to read and reshape the page as a living tree of objects, not a string of HTML. By
the end of this phase you can find any element with CSS selectors, walk between relatives,
create and place new nodes, manage attributes/classes/datasets correctly, and update large
amounts of DOM efficiently by batching.

## Why it matters

The DOM is where your code meets the user's screen. Almost every interactive feature —
showing a panel, rendering a list, updating a label — is a DOM operation. Doing it wrong
crashes on `null`, leaks listeners, opens XSS holes, or janks the page with needless layout.
Master the live tree here and Events (Phase 7), Forms (Phase 8), and Styling (Phase 9) all
build cleanly on top.

## Katas

1. [Selecting Elements](./001-selecting-elements.md) — `querySelector`/`querySelectorAll`,
   CSS selectors, `null` vs empty `NodeList`, static vs live collections.
2. [Traversing the DOM Tree](./002-traversing-the-dom.md) — `parentElement`, `children`,
   `nextElementSibling`, and searching upward with `closest`.
3. [Creating & Inserting Nodes](./003-creating-and-inserting-nodes.md) — `createElement`,
   `textContent`, `append`/`prepend`/`before`/`after`, and `insertAdjacentHTML` (with the
   XSS caveat).
4. [Attributes, Classes & Datasets](./004-attributes-classes-and-datasets.md) — attributes
   vs properties, `classList`, and `data-*` via `dataset`.
5. [DocumentFragment & Efficient Updates](./005-documentfragment-and-efficient-updates.md) —
   batching with `DocumentFragment`, `replaceChildren`, and avoiding layout thrashing.

## What's next

Phase 7 — Events & Interaction: listeners, propagation, delegation (built on `closest` from
this phase), custom events, and pointer/keyboard input.
