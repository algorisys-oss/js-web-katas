---
id: "phase-08/005-debouncing-input"
title: "Debouncing Input"
phase: 8
sequence: 5
difficulty: "intermediate"
tags: ["forms", "performance"]
prerequisites: ["phase-08/004-formdata-and-submission"]
estimated_minutes: 13
starter: ["html", "js"]
network: false
---

## Concept

The `input` event fires on **every keystroke**. If each one triggers something expensive —
a search request, a layout-heavy render, a spell-check — typing "javascript" fires ten
times and does ten times the work, most of it instantly thrown away. You only care about
the result *after the user pauses*.

**Debouncing** solves this. A debounced function delays the real work until a quiet period
has passed with no new calls. Each call **resets a timer**; only when the timer finally
elapses does the work run, with the *latest* arguments. Type fast and it runs once, at the
end.

The classic implementation is a closure over a timer id (you met closures in Phase 2, and
`setTimeout`/the event loop in Phase 5 — this is them working together):

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);                 // cancel the pending run
    timer = setTimeout(() => fn(...args), delay); // schedule a fresh one
  };
}
```

Debounce waits for *silence*. Its cousin **throttle** runs at most once per interval *during*
activity (covered in Phase 12) — use debounce for "act when they stop," throttle for "act
steadily while they go."

## Key Insight

> `input` fires on every keystroke. Debounce delays the real work until typing pauses by
> resetting a timer on each call — fast typing runs the handler once, not once per key.

## Experiment

```html
<form id="search">
  <input id="q" type="search" placeholder="Search…" autocomplete="off" />
  <p id="status">Type to search.</p>
</form>
```

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const status = document.getElementById('status');

// The "expensive" work — pretend this is a fetch to a search API (Phase 11).
function runSearch(term) {
  console.log('SEARCHING for:', term);
  status.textContent = term ? `Results for "${term}"` : 'Type to search.';
}

const debouncedSearch = debounce(runSearch, 400);

document.getElementById('q').addEventListener('input', (e) => {
  console.log('keystroke:', e.target.value);   // fires every key
  debouncedSearch(e.target.value.trim());       // but search runs only after a pause
});
```

## Expected Result

In the **preview**, type "react" quickly. The **console** logs a `keystroke:` line for every
character, but `SEARCHING for:` appears **only once**, ~400 ms after you stop typing:

```
keystroke: r
keystroke: re
keystroke: rea
keystroke: reac
keystroke: react
SEARCHING for: react
```

The status text updates once, with the final term. Pause mid-word and it will search the
partial term, then search again when you resume and stop — each pause triggers exactly one
run.

## Challenge

1. Lower the delay to 100 ms and raise it to 1000 ms. Feel how the responsiveness/quietness
   trade-off changes, and watch the console.
2. Add a **leading-edge** option: fire immediately on the first call, then debounce
   subsequent ones (search the instant typing starts, then wait for the pause).
3. Return a `cancel()` method from `debounce` (e.g. `debounced.cancel = () => clearTimeout(timer)`)
   and call it on the form's `submit` so a queued search can't fire after the user submits.

## Deep Dive

Each debounced wrapper needs its *own* private `timer`, which is why the closure is created
fresh per call to `debounce(...)` — share one `timer` variable across two inputs and they'd
cancel each other. In a real search box you'd pair debounce with an `AbortController`
(Phase 5) so that when a new search finally fires, any still-in-flight `fetch` from a prior
pause is cancelled — debounce reduces *how often* you start work; abort cleans up work that's
already started but no longer wanted.

## Common Mistakes

- Declaring `let timer` *inside* the returned function instead of in the enclosing closure —
  it resets every call, so `clearTimeout` never finds the previous timer and nothing is
  debounced.
- Debouncing the *handler reference* but recreating it on every render/call, so each call
  gets a brand-new timer and the debounce never accumulates. Create it once, reuse it.
- Reaching for a library's `debounce` before understanding the four lines above — the
  platform (`setTimeout` + a closure) already gives you everything you need.
