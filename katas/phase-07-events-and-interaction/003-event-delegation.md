---
id: "phase-07/003-event-delegation"
title: "Event Delegation"
phase: 7
sequence: 3
difficulty: "intermediate"
tags: ["events"]
prerequisites: ["phase-07/002-event-propagation"]
estimated_minutes: 13
starter: ["html", "css", "js"]
network: false
---

## Concept

Because events **bubble** (previous kata), you don't need a listener on every element.
Attach **one** listener to a stable ancestor, let clicks bubble up to it, and figure out
which descendant was actually clicked. This is **event delegation**, and it is the standard
pattern for lists, tables, menus, and any dynamic UI.

The workhorse is **`event.target.closest(selector)`** — it walks from the clicked node up
through its ancestors and returns the nearest element matching the selector (or `null`). It
handles the common case where you click a child *inside* the element you care about (an
icon inside a button, text inside a list item).

Delegation has two big payoffs:

- **It works for elements that don't exist yet.** Add a new list item after the listener is
  attached and it is handled automatically — no re-binding. With per-element listeners you
  must wire up every new node.
- **It scales.** One listener instead of a thousand means less memory and faster setup.

The shape is always: listen on the container → in the handler, find the relevant element
with `closest()` → bail out if it's `null` → act on it.

## Key Insight

> Don't put a listener on every item. Put one on the container and use
> `event.target.closest(selector)` to find which item was hit — it even handles items added
> later.

## Experiment

```html
<ul id="todos">
  <li data-id="1">Learn bubbling <button class="remove">✕</button></li>
  <li data-id="2">Learn delegation <button class="remove">✕</button></li>
</ul>
<button id="add">Add a new item</button>
```

```css
#todos { list-style: none; padding: 0; }
#todos li { padding: 0.4rem 0; display: flex; gap: 0.5rem; align-items: center; }
.remove { cursor: pointer; }
```

```js
const list = document.getElementById('todos');
let nextId = 3;

// ONE listener on the container handles every current AND future item.
list.addEventListener('click', (event) => {
  // Did the click land on (or inside) a remove button?
  const removeBtn = event.target.closest('.remove');
  if (!removeBtn) return; // clicked elsewhere in the list — ignore

  const item = removeBtn.closest('li');
  console.log('removing item', item.dataset.id, '—', item.firstChild.textContent.trim());
  item.remove();
});

// New items work with NO extra wiring, because the listener is on the parent.
document.getElementById('add').addEventListener('click', () => {
  const li = document.createElement('li');
  li.dataset.id = String(nextId);
  li.innerHTML = `Item ${nextId} <button class="remove">✕</button>`;
  list.append(li);
  console.log('added item', nextId, '— its ✕ already works, no re-binding');
  nextId += 1;
});
```

## Expected Result

In the **preview**, clicking any `✕` removes that row and logs which item id was removed —
even though only one listener exists. Click "Add a new item" to append a row; its `✕`
button works immediately with no extra listener attached, because the click bubbles up to
the single container listener.

## Challenge

1. Log `event.target` vs `event.currentTarget` inside the handler. Confirm `currentTarget`
   is always the `<ul>` while `target` is whatever you actually clicked.
2. Make the whole `<li>` toggle a `done` class when clicked (strike-through via CSS), but
   keep the `✕` button removing the row. Use `closest()` to tell the two intents apart.
3. Replace `closest('.remove')` with `event.target.matches('.remove')`. Click the `✕`
   text vs its padding and explain when `matches` fails where `closest` succeeds.

## Deep Dive

Delegation relies on the event bubbling to reach your container, so it only works for
events that bubble. For non-bubbling events (`focus`, `blur`) use their bubbling forms
(`focusin`, `focusout`) or attach the listener in the **capture phase**. Frameworks lean
heavily on delegation under the hood: React historically attached a single delegated
listener per event type at the root and synthesized events from there, precisely to avoid
thousands of native listeners.

## Common Mistakes

- Using `event.target` directly when the click could land on a child node — text or an icon
  inside the element. `closest()` is robust; raw `target` is brittle.
- Forgetting the early `return` when `closest()` is `null`, then crashing on
  `null.dataset` for clicks that miss every item.
- Attaching the delegated listener to an element that gets replaced (e.g. re-rendered),
  which silently drops the listener. Delegate to a stable ancestor.
- Trying to delegate `focus`/`blur` directly — they don't bubble; use `focusin`/`focusout`.
