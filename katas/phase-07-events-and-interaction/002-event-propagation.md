---
id: "phase-07/002-event-propagation"
title: "Event Propagation (Bubbling & Capturing)"
phase: 7
sequence: 2
difficulty: "intermediate"
tags: ["events"]
prerequisites: ["phase-07/001-event-listeners"]
estimated_minutes: 13
starter: ["html", "css", "js"]
network: false
---

## Concept

An event does not fire on just one element — it travels through the DOM tree in **three
phases**:

1. **Capturing** — from `window` *down* to the target. Listeners registered with
   `{ capture: true }` run here, outermost first.
2. **Target** — the event reaches `event.target`, the innermost element you actually
   interacted with.
3. **Bubbling** — back *up* from the target to `window`. Normal listeners (no `capture`)
   run here, innermost first.

So a click on a button inside a `<div>` inside `<body>` is heard by listeners on the
button, then the div, then body, then document — that upward journey is **bubbling**, and
it is what makes event delegation (next kata) possible.

You can change the flow:

- **`event.stopPropagation()`** — stop the event from continuing to the next element.
  Other listeners on the *current* element still run.
- **`event.stopImmediatePropagation()`** — stop it *and* skip remaining listeners on the
  current element too.
- **`event.preventDefault()`** — does **not** stop propagation; it cancels the browser's
  *default action* (following a link, submitting a form, checking a box).

Most events bubble, but a few do not (`focus`, `blur`, `scroll` on elements). Their
bubbling cousins (`focusin`, `focusout`) exist for delegation.

## Key Insight

> An event captures down to the target, then bubbles back up. `stopPropagation()` halts the
> journey; `preventDefault()` cancels the default action — they are independent.

## Experiment

```html
<div id="grandparent">grandparent
  <div id="parent">parent
    <button id="child">child — click me</button>
  </div>
</div>
<label><input type="checkbox" id="stopper"> stopPropagation at parent</label>
```

```css
#grandparent { padding: 1.5rem; background: #e0e7ff; }
#parent { padding: 1.5rem; background: #c7d2fe; }
#child { padding: 0.5rem 1rem; }
```

```js
const log = (phase, id) => console.log(`${phase.padEnd(10)} → ${id}`);

// Capturing listeners run top-down. Pass { capture: true }.
['grandparent', 'parent', 'child'].forEach((id) => {
  document.getElementById(id).addEventListener(
    'click',
    () => log('CAPTURE', id),
    { capture: true },
  );
});

// Bubbling listeners (the default) run bottom-up.
['grandparent', 'parent', 'child'].forEach((id) => {
  document.getElementById(id).addEventListener('click', (event) => {
    log('BUBBLE', id);
    if (id === 'parent' && document.getElementById('stopper').checked) {
      event.stopPropagation();
      console.log('   ✋ stopped at parent — grandparent will not hear the bubble');
    }
  });
});

console.log('Click "child". Toggle the checkbox to stop propagation at parent.');
```

## Expected Result

Click the **child** button. The console logs the full path: capturing top-down, then
bubbling bottom-up:

```
CAPTURE    → grandparent
CAPTURE    → parent
CAPTURE    → child
BUBBLE     → child
BUBBLE     → parent
BUBBLE     → grandparent
```

Now tick the checkbox and click again. The capture phase is unchanged, but bubbling stops
after `parent` — `grandparent`'s bubble listener never runs.

## Challenge

1. Add a second bubbling listener to `child` and call `stopImmediatePropagation()` in the
   first. Confirm the second listener on `child` is skipped too.
2. Change a click listener so it calls `preventDefault()` on a link (`<a href="#x">`) and
   verify propagation still continues — proving the two methods are unrelated.
3. Click directly on the **parent** (not the child). How does the path differ, and why is
   `child` absent from the log?

## Deep Dive

Every event object exposes `event.eventPhase` (1 = capturing, 2 = at-target, 3 = bubbling)
and `event.composedPath()`, which returns the full array of nodes the event will visit —
useful for debugging and for crossing shadow-DOM boundaries (Phase 14). Capturing predates
bubbling historically: Netscape used capture, Microsoft used bubble, and the W3C model
unified both phases, defaulting `addEventListener` to bubbling because it is the more
intuitive "the thing I clicked handles it first" order.

## Common Mistakes

- Believing `preventDefault()` stops the event from bubbling — it does not; only
  `stopPropagation()` does.
- Reaching for `stopPropagation()` to "fix" a bug — it silently breaks delegated listeners
  higher up (analytics, menus, outside-click handlers). Prefer targeted conditions.
- Forgetting that `focus`/`blur`/`scroll` don't bubble, so delegating them needs
  `focusin`/`focusout` or capture-phase listeners.
- Assuming capture listeners are rare and ignorable — a stray `{ capture: true }` changes
  ordering and is easy to overlook when debugging.
