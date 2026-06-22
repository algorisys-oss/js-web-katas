---
id: "phase-12/003-debounce-and-throttle"
title: "Debounce & Throttle"
phase: 12
sequence: 3
difficulty: "intermediate"
tags: ["performance", "events"]
prerequisites: ["phase-12/002-avoiding-layout-thrashing"]
estimated_minutes: 13
starter: ["html", "css", "js"]
network: false
---

## Concept

Events like `scroll`, `resize`, `mousemove`, and `input` fire in bursts — dozens or hundreds
of times per second. If each one triggers a layout read, a network call, or a re-render, you
flood the main thread. Two rate-limiting tools tame the burst:

- **Debounce** — wait until the events *stop*, then run once. "Run after the user pauses
  typing." The timer resets on every call; only the trailing call survives.
- **Throttle** — run at most once per interval *while* events keep coming. "Run at most
  every 100 ms during a scroll." The leading call runs; the rest within the window are
  dropped.

Use **debounce** for "settled" intent (search input, resize-finished). Use **throttle** for
"keep up but cap the rate" (scroll position, drag). We will wire both to live events and log
how many raw events fired versus how many handler calls actually executed.

## Key Insight

> Debounce runs once *after* the storm passes; throttle runs at a steady *capped* rate
> *during* the storm. Pick by whether you want the settled value or a live sample.

## Experiment

```html
<input id="search" placeholder="type fast…" />
<div id="pad">scroll inside me ↓</div>
<pre id="log"></pre>
```

```css
#pad { height: 80px; overflow: auto; border: 1px solid #ccc; margin: 8px 0; }
#pad::after { content: ""; display: block; height: 800px; }
#log { background: #111; color: #6ee7b7; padding: 8px; min-height: 60px; }
```

```js
const logEl = document.getElementById('log');
const counts = { rawInput: 0, debounced: 0, rawScroll: 0, throttled: 0 };
const show = () => { logEl.textContent = JSON.stringify(counts, null, 2); };

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), wait);
  };
}

function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(null, args);
    }
  };
}

const onSettled = debounce((value) => {
  counts.debounced++;
  console.log(`debounced search fired with "${value}"`);
  show();
}, 300);

document.getElementById('search').addEventListener('input', (e) => {
  counts.rawInput++;
  onSettled(e.target.value);
  show();
});

const onScrollSample = throttle((top) => {
  counts.throttled++;
  console.log(`throttled scroll sample @ ${Math.round(top)}px`);
  show();
}, 100);

document.getElementById('pad').addEventListener('scroll', (e) => {
  counts.rawScroll++;
  onScrollSample(e.target.scrollTop);
  show();
});

show();
```

## Expected Result

Type quickly: `rawInput` climbs with every keystroke, but `debounced` only increments ~300 ms
*after you stop*. Scroll the inner box: `rawScroll` rises rapidly while `throttled` rises at
most ~10×/second. The **console** logs the actual settled value and sampled scroll position.
The ratio of raw to handled calls is the work you saved.

## Challenge

1. Add a leading-edge option to `debounce` so the *first* call fires immediately and
   subsequent rapid calls are suppressed until the pause.
2. Make `throttle` also fire a trailing call so the final position isn't lost when scrolling
   stops mid-interval.
3. Add `resize` handling on `window` debounced at 200 ms; log the new `innerWidth` only once
   per resize gesture.

## Deep Dive

Debounce and throttle are about *who wins the burst*: debounce keeps the last call and a
fixed delay; throttle keeps the first call per window. Production versions (lodash) add
`leading`/`trailing` flags, `maxWait`, and cancellation. For purely visual work tied to the
frame cadence, `requestAnimationFrame` is often the better throttle — it self-limits to one
call per paint (~60/s) and never runs while the tab is hidden. Reach for time-based throttle
when the cap must be coarser than a frame.

## Common Mistakes

- Defining the debounced/throttled function *inside* the event handler, so a fresh timer is
  created every event and nothing is ever rate-limited.
- Debouncing a scroll handler that needs live samples — the UI feels frozen until you stop.
- Throttling a search box — you fire mid-word queries instead of waiting for the settled term.
- Forgetting to cancel the pending timer on teardown, leaving a callback to fire after the
  element is gone (Phase 7 listener hygiene).
