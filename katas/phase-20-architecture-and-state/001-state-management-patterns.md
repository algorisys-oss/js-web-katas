---
id: "phase-20/001-state-management-patterns"
title: "State Management Patterns"
phase: 20
sequence: 1
difficulty: "intermediate"
tags: ["architecture", "state"]
prerequisites: ["phase-19/005-end-to-end-testing"]
estimated_minutes: 15
starter: ["html", "js"]
network: false
---

## Concept

Every interactive UI is a function of **state**. As an app grows, the hard part is no
longer "how do I change this `<span>`," but "where does the truth live, and how do I keep
the screen in sync with it?" When state is scattered across DOM attributes, closures, and
ad-hoc variables, you get the classic bug: two parts of the screen disagree because each
read a different copy.

The fix is a discipline frameworks formalize but the platform already supports: a **single
source of truth**. You keep all application state in one place — a **store** — and you
never mutate the DOM directly in your event handlers. Instead handlers call an action that
updates the store; the store notifies subscribers; a single `render` function reads the
new state and redraws. The data flows one way:

```
event → setState (update store) → subscribers notified → render(state) → DOM
```

Two rules make this reliable. First, **immutable updates**: produce a *new* state object
(`{ ...state, count: state.count + 1 }`) rather than mutating the old one, so you can
always compare "before" and "after." Second, **render from state**: the DOM is a pure
projection of the store, never an independent copy of the truth.

This is the foundation of Redux, Zustand, and every flux-style library — about thirty
lines of plain JavaScript, no framework required.

## Key Insight

> Keep all state in one store and treat the DOM as a *projection* of it. Handlers update
> the store; a single `render(state)` redraws. Data flows one way.

## Experiment

```html
<output id="count">0</output>
<div>
  <button id="dec">−</button>
  <button id="inc">+</button>
  <button id="reset">reset</button>
</div>
```

```js
// A tiny single-source-of-truth store: getState / setState / subscribe.
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    setState(updater) {
      // Immutable update: build a NEW state object, never mutate the old one.
      const next = typeof updater === 'function' ? updater(state) : updater;
      state = { ...state, ...next };
      listeners.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn); // unsubscribe handle
    },
  };
}

const store = createStore({ count: 0 });

// Actions never touch the DOM — they only update the store.
const inc = () => store.setState((s) => ({ count: s.count + 1 }));
const dec = () => store.setState((s) => ({ count: s.count - 1 }));
const reset = () => store.setState({ count: 0 });

document.getElementById('inc').addEventListener('click', inc);
document.getElementById('dec').addEventListener('click', dec);
document.getElementById('reset').addEventListener('click', reset);

// render is a pure function of state; subscribe makes it run on every change.
const out = document.getElementById('count');
function render(state) {
  out.textContent = state.count;
  console.log('rendered from state:', state);
}
store.subscribe(render);
render(store.getState()); // initial paint
```

## Expected Result

The **preview** shows a counter starting at `0`. Clicking **+** / **−** changes it; **reset**
returns it to `0`. Every click logs the full state object to the **console**, e.g.
`rendered from state: { count: 1 }`. Notice you never wrote `out.textContent = ...` inside
a click handler — handlers only call `setState`, and the single subscriber redraws.

## Challenge

1. Add a `todos: []` array to the initial state and an action `addTodo(text)` that returns
   `{ todos: [...s.todos, { id: Date.now(), text }] }`. Extend `render` to list them. Note
   how the *same* store powers two independent pieces of UI.
2. Add a second subscriber that logs only when `count` crosses zero. Then call its returned
   unsubscribe function and confirm it stops firing.
3. Make `setState` log a warning if an action accidentally *mutates* `state` directly
   (hint: `Object.freeze(state)` in development turns silent mutation into a thrown error).

## Deep Dive

This pattern scales because `render` is *idempotent*: calling it twice with the same state
produces the same DOM. The expensive part is that our naive `render` rewrites everything on
every change. Real apps minimize DOM work either by diffing (a virtual DOM, as React does)
or by fine-grained reactivity that updates only the exact nodes that depend on a changed
value (kata 003, the SolidJS model). The store contract — `getState`/`setState`/`subscribe`
— stays identical regardless of how rendering is optimized.

## Common Mistakes

- Mutating state in place (`state.count++`) instead of producing a new object — subscribers
  can't tell what changed, and time-travel/undo becomes impossible.
- Updating the DOM directly inside event handlers, creating a second source of truth that
  drifts out of sync with the store.
- Forgetting to call `render` once on startup, so the initial paint is missing until the
  first user action.
- Leaking subscribers: registering on `subscribe` but never calling the returned
  unsubscribe, so detached views keep re-rendering (and keep memory alive).
