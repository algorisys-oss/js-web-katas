---
id: "phase-12/005-measuring-with-performance-api"
title: "Measuring with the Performance API"
phase: 12
sequence: 5
difficulty: "advanced"
tags: ["performance", "measurement"]
prerequisites: ["phase-12/004-virtualizing-long-lists"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

Every optimization in this phase relied on one principle from `CLAUDE.md`: **measure before
optimizing.** The browser gives you a precise, standardized toolkit for that — the
**Performance API** — instead of scattering `console.time` calls.

- `performance.now()` — a high-resolution, monotonic timestamp in milliseconds (sub-ms,
  unaffected by clock changes). Subtract two to time a block.
- `performance.mark(name)` — drops a named timestamp onto the **performance timeline**.
- `performance.measure(name, startMark, endMark)` — records a named duration between two
  marks as a `PerformanceMeasure` entry.
- `PerformanceObserver` — subscribes to timeline entries (`measure`, `paint`, `longtask`,
  `resource`…) as they are recorded, so you observe without polling.

Marks and measures don't just time things — they appear in DevTools' Performance panel under
"Timings," lining your labels up against real Layout/Paint work. We will mark around an
expensive operation, measure it, and let a `PerformanceObserver` report the result.

## Key Insight

> `performance.now()` times a block; `mark()`/`measure()` name durations on the shared
> timeline; `PerformanceObserver` delivers them as they happen. Measure first, optimize second.

## Experiment

```html
<button id="run">Run measured work</button>
<pre id="out"></pre>
```

```css
#out { background: #111; color: #fbbf24; padding: 8px; min-height: 80px;
       white-space: pre-wrap; font-family: monospace; }
```

```js
const out = document.getElementById('out');
const print = (line) => { out.textContent += line + '\n'; };

// Observe 'measure' entries as the browser records them.
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    print(`observed measure "${entry.name}": ${entry.duration.toFixed(2)} ms ` +
          `(started @ ${entry.startTime.toFixed(1)} ms)`);
  }
});
observer.observe({ entryTypes: ['measure'] });

function expensiveWork() {
  let sum = 0;
  for (let i = 0; i < 3_000_000; i++) sum += Math.sqrt(i);
  return sum;
}

document.getElementById('run').addEventListener('click', () => {
  out.textContent = '';

  // 1) Quick ad-hoc timing with now().
  const t0 = performance.now();
  expensiveWork();
  print(`now(): ${(performance.now() - t0).toFixed(2)} ms`);

  // 2) Named marks + measure → lands on the performance timeline.
  performance.mark('work-start');
  expensiveWork();
  performance.mark('work-end');
  performance.measure('expensive-work', 'work-start', 'work-end');

  // 3) Read measures back from the timeline.
  const [m] = performance.getEntriesByName('expensive-work');
  print(`measure entry duration: ${m.duration.toFixed(2)} ms`);

  // Tidy the timeline so repeated runs don't accumulate entries.
  performance.clearMarks();
  performance.clearMeasures();
});
```

## Expected Result

Click the button: the **console/output** prints the `now()` timing, then the
`PerformanceObserver` fires asynchronously with the observed `expensive-work` measure, then
the direct read of the measure's duration. All three report the same loop at sub-millisecond
precision. In real DevTools, "expensive-work" would appear as a labeled bar in the Timings
track.

## Challenge

1. Wrap each of this phase's earlier demos (reflow batch, thrash, virtual render) in
   `mark`/`measure` pairs and compare their durations side by side from the timeline.
2. Add `entryTypes: ['longtask']` to the observer (where supported) and run heavier work;
   long tasks over 50 ms block the main thread — confirm yours shows up.
3. Compute the average of 10 runs of `expensiveWork()` using an array of measures, then clear
   them — a tiny benchmark harness built entirely from the Performance API.

## Deep Dive

The performance timeline is a single, shared, append-only buffer of typed entries:
`navigation`, `resource`, `paint` (with `first-contentful-paint`), `largest-contentful-paint`,
`layout-shift`, `longtask`, plus your own `mark`/`measure`. This is exactly how Core Web
Vitals (LCP, CLS, INP) are gathered — libraries like `web-vitals` are thin wrappers over
`PerformanceObserver`. Prefer observers to polling: they hand you entries the instant the
browser records them, even ones (like LCP) that happen before your script's polling loop
would start.

## Common Mistakes

- Using `Date.now()` for timing — it's millisecond-granular and can jump backward if the
  system clock changes; `performance.now()` is monotonic and sub-millisecond.
- Forgetting to call `observer.observe(...)` before the entries are recorded, then wondering
  why the callback never fires.
- Never clearing marks/measures, so the timeline buffer grows and `getEntriesByName` returns
  stale duplicates.
- Treating a single run as truth — JIT warmup and GC make first runs noisy; average several.
