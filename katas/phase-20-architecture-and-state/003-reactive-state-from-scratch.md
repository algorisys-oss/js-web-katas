---
id: "phase-20/003-reactive-state-from-scratch"
title: "Reactive State from Scratch"
phase: 20
sequence: 3
difficulty: "advanced"
tags: ["architecture", "reactivity"]
prerequisites: ["phase-20/002-observer-and-pub-sub"]
estimated_minutes: 18
starter: ["html", "js"]
network: false
---

## Concept

In kata 001 you called `render(state)` manually after every change. Frameworks like
SolidJS, Vue, and Svelte do something smarter: you describe *what* depends on *what*, and
the system re-runs only the affected code automatically. This is **fine-grained
reactivity**, and its core is two primitives — **signals** and **effects** — that you can
build in about twenty lines.

A **signal** is a value with a getter and a setter. An **effect** is a function that
*reads* signals and should re-run whenever any of them change. The magic is **automatic
dependency tracking**: when an effect runs, we record which signal it is "currently inside"
of. Each signal a getter touches during that run subscribes the effect to itself. Later,
when that signal's setter is called, it notifies exactly the effects that read it — nothing
else. No diffing, no virtual DOM, no manual subscribe list.

Concretely, a tiny scheduler keeps a `currentEffect` slot. Running an effect sets that slot,
calls the function (whose signal reads register themselves), then clears it. A signal's
`get` adds `currentEffect` to its subscriber set; its `set` re-runs every subscriber. That
read-during-execution handshake is the entire trick — and it is precisely the engine
powering the SolidJS shell that hosts these katas.

## Key Insight

> Reactivity = signals that record who reads them, and effects that re-run when what they
> read changes. Track on read, notify on write. No manual `render` call.

## Experiment

```html
<p>Count: <span id="count">0</span></p>
<p>Doubled: <span id="doubled">0</span></p>
<button id="inc">Increment</button>
```

```js
// --- the reactive core: ~20 lines ---
let currentEffect = null;

function signal(initial) {
  let value = initial;
  const subscribers = new Set();
  const read = () => {
    if (currentEffect) subscribers.add(currentEffect); // track on read
    return value;
  };
  const write = (next) => {
    if (next === value) return;            // skip no-op writes
    value = next;
    [...subscribers].forEach((fn) => fn()); // notify on write
  };
  return [read, write];
}

function effect(fn) {
  const run = () => {
    currentEffect = run;   // mark "we are inside this effect"
    try { fn(); } finally { currentEffect = null; }
  };
  run(); // run once to collect dependencies
}

// --- use it: the DOM updates itself ---
const [count, setCount] = signal(0);

// Each effect reads a signal, so it auto-subscribes and re-runs on change.
effect(() => {
  document.getElementById('count').textContent = count();
});
effect(() => {
  document.getElementById('doubled').textContent = count() * 2;
  console.log('doubled effect ran, count =', count());
});

document.getElementById('inc').addEventListener('click', () => {
  setCount(count() + 1); // no render() call — effects fire themselves
});
```

## Expected Result

The **preview** shows "Count: 0" and "Doubled: 0". Each click of **Increment** updates both
lines automatically — `count` rises by 1 and `doubled` tracks it — with no manual `render`
anywhere. The **console** logs `doubled effect ran, count = N` on every change. The "doubled"
effect re-ran only because it *read* `count()`; an effect that never read it would stay
asleep.

## Challenge

1. Add a `computed(fn)` helper that returns a read-only signal derived from others (e.g.
   `const doubled = computed(() => count() * 2)`). Internally it is an effect that writes
   into a private signal. Rewrite the doubled display to read the computed value.
2. Add a second signal `name` and an effect that reads *both* `count` and `name`. Confirm it
   re-runs when either changes — automatic multi-dependency tracking, for free.
3. The current `effect` accumulates stale subscriptions across runs. Make each run *clear*
   the effect from all its old signals before re-tracking, so conditional reads
   (`if (flag()) other()`) don't leave phantom dependencies.

## Deep Dive

This handshake — "track the currently-running effect on read, re-run subscribers on write" —
is the heart of SolidJS, Vue's `ref`/`watchEffect`, and Preact Signals. The difference
between them is mostly scheduling: our version re-runs effects *synchronously* and
*immediately*, so setting a signal twice runs effects twice. Production systems batch writes
within a microtask and run each effect at most once per tick, and they topologically sort
computed values so a derived value never re-runs with stale inputs. Vue and MobX implement
the same idea with a `Proxy` over a whole object instead of explicit signal getters, but the
track-on-read / notify-on-write contract is identical.

## Common Mistakes

- Calling a signal *outside* an effect and expecting reactivity — there is no
  `currentEffect` to register, so nothing subscribes. Reads must happen inside an effect to
  be tracked.
- Destructuring the value out of a signal (`const v = count()`) at the top of an effect and
  reusing `v` — you captured a snapshot; the effect won't see later changes to that read.
- Forgetting the no-op guard in the setter, so writing the same value re-runs every effect
  needlessly.
- Never clearing old subscriptions, so an effect whose dependencies change over time keeps
  firing for signals it no longer reads (the subject of challenge 3).
