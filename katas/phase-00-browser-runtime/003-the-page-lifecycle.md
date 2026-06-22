---
id: "phase-00/003-the-page-lifecycle"
title: "The Page Lifecycle"
phase: 0
sequence: 3
difficulty: "beginner"
tags: ["runtime", "page-lifecycle", "dom"]
prerequisites: ["phase-00/002-the-js-engine"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

A page is not "ready" the instant the browser starts reading it. It moves through stages,
and your JavaScript can observe each one via `document.readyState` and lifecycle events:

1. **`loading`** — the HTML is still being parsed; the DOM is incomplete.
2. **`interactive`** — the HTML is fully parsed and the DOM is built. This fires the
   **`DOMContentLoaded`** event. You can safely touch any element now.
3. **`complete`** — the DOM *plus* all sub-resources (images, stylesheets, fonts) have
   finished loading. This fires the **`load`** event on `window`.

If a `<script>` in the `<head>` runs during parsing and tries to find an element that
appears later in the HTML, it gets `null` — the element doesn't exist yet. That's the
single most common "my code can't find the element" bug. Listening for `DOMContentLoaded`
(or using `defer`, next kata) fixes it.

## Key Insight

> `DOMContentLoaded` fires when the DOM is ready; `load` fires when images and other
> resources are also done. Touch the DOM only after it exists.

## Experiment

```html
<h1 id="title">Lifecycle demo</h1>
<button id="go">Click me</button>
```

```js
// readyState reflects how far the page has progressed.
console.log('readyState at script start:', document.readyState);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded — DOM is ready, readyState:', document.readyState);
  document.getElementById('title').textContent = 'DOM ready!';
});

window.addEventListener('load', () => {
  console.log('load — everything is ready, readyState:', document.readyState);
});
```

## Expected Result

The **preview** heading changes to "DOM ready!", and the **console** prints, in order:

```
readyState at script start: interactive   (or "loading")
DOMContentLoaded — DOM is ready, readyState: interactive
load — everything is ready, readyState: complete
```

(Because this kata's script is a module, it runs after parsing, so `readyState` may
already be `interactive` when it starts. The events still fire in lifecycle order.)

## Challenge

1. Add a wired-up click handler to the button inside the `DOMContentLoaded` callback that
   logs "clicked". Then try moving the same `getElementById('go')` call to the very top of
   the script (outside any listener). What changes?
2. Add an `<img>` with a real `src` and confirm `load` fires *after* `DOMContentLoaded`.
3. Log `performance.now()` in each handler to see the gap between the two events.

## Deep Dive

There are later-stage lifecycle events too: `pagehide`, `visibilitychange`, and
`beforeunload`. Modern apps use the [Page Lifecycle
API](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) and
`visibilitychange` (rather than the unreliable `unload`) to save state when a tab is
backgrounded or closed.

## Common Mistakes

- Querying an element from a `<head>` script that runs before that element is parsed →
  you get `null`.
- Putting expensive setup in the `load` handler when `DOMContentLoaded` would do — `load`
  waits for every image and can be much later.
- Assuming `DOMContentLoaded` waits for stylesheets or images. It does not; only `load`
  does.
