---
id: "phase-20/005-putting-it-together-mini-app"
title: "Putting It Together: A Mini App"
phase: 20
sequence: 5
difficulty: "advanced"
tags: ["architecture", "state"]
prerequisites: ["phase-20/004-client-side-routing"]
estimated_minutes: 18
starter: ["html", "css", "js"]
network: false
---

## Concept

This is the capstone. You now have every piece a framework gives you — built by hand from
the platform:

- a **store** for the single source of truth (kata 001),
- the **observer** contract to notify views of change (kata 002),
- **reactive** signals/effects so the DOM updates itself (kata 003),
- a **hash router** to swap views without reloading (kata 004).

We will assemble them into one tiny todo SPA with two routes. The architecture is the same
one every serious front end uses: **unidirectional data flow**. State lives in a reactive
store. **Components** are plain functions that read state and return DOM. **Actions**
(`addTodo`, `toggleTodo`) are the only way to change state. The router decides *which*
component is mounted; an effect keeps the mounted component in sync with the store. User
events call actions, actions update the store, the store notifies effects, effects redraw —
the loop you have been building toward since Phase 0.

No framework appears anywhere. Every line is the browser platform: the DOM as a live tree
(Phase 6), events and delegation (Phase 7), modules and one-way data flow, and the
reactivity that powers the very SolidJS shell rendering this page. When you reach for React
or Solid in real work, you will now know *exactly* what they are doing under the hood — and
why.

## Key Insight

> A real app is just these patterns composed: a reactive store (truth) + components
> (functions of state) + actions (the only mutators) + a router (which view) — all wired by
> one-way data flow. Frameworks automate this loop; they don't invent it.

## Experiment

```html
<header>
  <h1>Tasks</h1>
  <nav>
    <a href="#/">All</a> · <a href="#/active">Active</a> · <a href="#/done">Done</a>
  </nav>
</header>
<form id="new-todo">
  <input id="todo-input" placeholder="What needs doing?" autocomplete="off" />
  <button>Add</button>
</form>
<ul id="list" aria-live="polite"></ul>
<p id="status"></p>
```

```css
body { font: 16px system-ui, sans-serif; max-width: 28rem; margin: 1.5rem auto; }
nav a { text-decoration: none; color: #6366f1; }
ul { list-style: none; padding: 0; }
li { display: flex; gap: .5rem; padding: .35rem 0; align-items: center; }
li.done span { text-decoration: line-through; color: #9ca3af; }
button { cursor: pointer; }
#status { color: #6b7280; font-size: .9rem; }
```

```js
// --- reactive core (kata 003) ---
let current = null;
function signal(v) {
  const subs = new Set();
  return {
    get() { if (current) subs.add(current); return v; },
    set(n) { if (n === v) return; v = n; [...subs].forEach((f) => f()); },
  };
}
function effect(fn) {
  const run = () => { current = run; try { fn(); } finally { current = null; } };
  run();
}

// --- store: a reactive single source of truth (katas 001 + 003) ---
const todos = signal([]);
const route = signal('/');
let nextId = 1;

// --- actions: the only way to mutate state, always immutably ---
const addTodo = (text) =>
  todos.set([...todos.get(), { id: nextId++, text, done: false }]);
const toggleTodo = (id) =>
  todos.set(todos.get().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

// --- router (kata 004): updates the route signal, no reload ---
const syncRoute = () => route.set(location.hash.slice(1) || '/');
window.addEventListener('hashchange', syncRoute);
syncRoute();

// --- a component: a pure function of state returning a DOM node ---
function TodoItem(todo) {
  const li = document.createElement('li');
  if (todo.done) li.className = 'done';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = todo.done;
  box.addEventListener('change', () => toggleTodo(todo.id)); // event → action
  const span = document.createElement('span');
  span.textContent = todo.text; // textContent, not innerHTML → XSS-safe (Phase 17)
  li.append(box, span);
  return li;
}

const list = document.getElementById('list');
const status = document.getElementById('status');

// --- the render effect: re-runs whenever todos OR route change ---
effect(() => {
  const all = todos.get();
  const r = route.get();
  const visible = all.filter((t) =>
    r === '/active' ? !t.done : r === '/done' ? t.done : true
  );
  list.replaceChildren(...visible.map(TodoItem)); // efficient full swap
  const left = all.filter((t) => !t.done).length;
  status.textContent = `${left} left · ${all.length} total · view: ${r}`;
});

// --- user input → action (Phase 8 forms) ---
document.getElementById('new-todo').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
});

addTodo('Build a store');
addTodo('Add reactivity');
```

## Expected Result

The **preview** is a working todo app. Type a task and press **Add** (or Enter) to append it;
the list updates instantly. Checking a box toggles its done state and strikes it through. The
**All / Active / Done** links filter the list *without reloading* — and the Back button moves
between filters. The status line stays in sync: e.g. `1 left · 3 total · view: /active`. You
never call a `render()` function by hand; the single effect re-runs whenever `todos` or
`route` changes, because it *reads* both signals.

## Challenge

1. Add a **delete** button per item with an action `removeTodo(id)` that filters it out
   immutably. Confirm the effect redraws with no extra wiring.
2. Persist `todos` to `localStorage` (Phase 10): load it into the initial signal, and add an
   effect that writes `JSON.stringify(todos.get())` on every change. Reload and confirm tasks
   survive.
3. Split the header/nav and the list into separate component functions and add a `/stats`
   route showing counts. Notice how routing + components compose without a framework.

## Deep Dive

Look at what you built: state, derived views, components, routing, and DOM updates — the
exact responsibilities React, Vue, and Solid take over. Frameworks add value by automating
the tedious and error-prone parts: minimizing DOM mutations (virtual DOM diffing or
fine-grained compilation), batching updates within a frame, server-side rendering,
hydration, and a component lifecycle. But the *mental model* is identical to this kata, which
is why understanding the platform makes you a far better framework user — you can reason about
re-renders, key warnings, stale closures, and effect dependencies because you have
implemented all of them. The one place this toy diverges from production is granularity: our
effect rebuilds the *entire* list on any change. SolidJS would update only the single text
node that changed; React would diff a virtual tree. Same loop, smarter rendering.

## Common Mistakes

- Mutating an item in place (`todo.done = true`) instead of mapping to a new array — the
  signal's `set` sees the same reference and skips the update, so the UI silently won't
  refresh.
- Building list rows with `innerHTML` and user text — a todo titled `<img onerror=…>` becomes
  an XSS hole. Use `textContent`/`createElement` as shown (Phase 17).
- Putting business logic in components instead of actions, so state changes scatter and the
  one-way flow breaks down.
- Reaching for a framework before you understand this loop — you will then fight its
  abstractions instead of using them, because you can't see the machine underneath.
