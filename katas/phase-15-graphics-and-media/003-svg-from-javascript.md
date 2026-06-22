---
id: "phase-15/003-svg-from-javascript"
title: "SVG from JavaScript"
phase: 15
sequence: 3
difficulty: "intermediate"
tags: ["graphics", "svg", "dom"]
prerequisites: ["phase-15/002-animation-loops-on-canvas"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

SVG is the opposite of canvas. Where canvas is **immediate-mode** (it remembers only
pixels), SVG is **retained-mode**: every shape is a real DOM node — `<rect>`, `<circle>`,
`<line>`, `<text>` — living inside an `<svg>` element. You can select it, style it with
CSS, attach event listeners, animate it, and the browser repaints automatically when its
attributes change. SVG is also resolution-independent: it stays crisp at any zoom.

The one catch is **namespaces**. SVG elements live in the SVG namespace, not HTML's, so you
**must** create them with `createElementNS`, not `createElement`:

```js
const NS = 'http://www.w3.org/2000/svg';
const rect = document.createElementNS(NS, 'rect'); // correct
// document.createElement('rect') makes an unknown HTML element that never renders.
```

Geometry is set through **attributes** (`x`, `y`, `width`, `height`, `cx`, `cy`, `r`, `fill`),
using `setAttribute`. Append the node into the `<svg>` and it appears immediately. Because
each bar or point is a node, SVG shines for charts, diagrams, and icons — anything where you
later want to hover, click, or restyle individual pieces.

## Key Insight

> SVG is retained-mode: shapes are DOM nodes you can select, style, and re-attribute.
> Create them with `createElementNS` (the SVG namespace), never `createElement`.

## Experiment

```html
<svg id="chart" width="320" height="180" style="border:1px solid #cbd5e1"></svg>
```

```js
const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('chart');
const data = [40, 90, 60, 130, 80];
const barWidth = 48;
const gap = 12;

data.forEach((value, i) => {
  const rect = document.createElementNS(NS, 'rect');
  rect.setAttribute('x', i * (barWidth + gap) + gap);
  rect.setAttribute('y', 170 - value);          // grow upward from a 170px baseline
  rect.setAttribute('width', barWidth);
  rect.setAttribute('height', value);
  rect.setAttribute('fill', '#6366f1');
  // Each bar is a real node — we can attach behaviour to it.
  rect.addEventListener('click', () => {
    rect.setAttribute('fill', '#f97316');
    console.log('bar', i, 'value', value);
  });
  svg.appendChild(rect);

  const label = document.createElementNS(NS, 'text');
  label.setAttribute('x', i * (barWidth + gap) + gap + barWidth / 2);
  label.setAttribute('y', 165 - value);
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('font-size', '12');
  label.setAttribute('fill', '#1f2937');
  label.textContent = value;
  svg.appendChild(label);
});

console.log('rendered', svg.querySelectorAll('rect').length, 'bars');
```

## Expected Result

In the **preview** you see a small bar chart of five purple bars with their values labelled
above each. Because each bar is a live DOM node, **clicking a bar turns it orange** and logs
its index and value. The **console** prints `rendered 5 bars` and a line per click.

## Challenge

1. Add a `<line>` baseline along `y = 170` and a `<text>` title above the chart.
2. Instead of `fill` attributes, add a CSS rule `rect:hover { fill: #f97316 }` and confirm
   SVG nodes respond to CSS — something canvas pixels cannot do.
3. Re-render the same chart on a `<canvas>` and list what you *lose*: per-bar hover, click
   targets, CSS styling, and crispness at zoom.

## Deep Dive

The retained-vs-immediate trade-off is about scale. SVG keeps a node per shape, so the
browser handles redraws, hit-testing, and accessibility for you — but thousands of nodes get
heavy because each one carries DOM cost. Canvas keeps no nodes, so it scales to tens of
thousands of particles cheaply, but *you* own every redraw and there is nothing to hover or
read with a screen reader. Rule of thumb: few interactive shapes → SVG; many cheap pixels →
canvas.

## Common Mistakes

- Using `createElement('rect')` instead of `createElementNS(NS, 'rect')` — it creates an
  unknown HTML element in the wrong namespace that silently never renders.
- Setting `setAttributeNS` for plain geometry attributes — most SVG attributes have no
  namespace; plain `setAttribute` is correct (only a few like `xlink:href` need NS).
- Forgetting that SVG's `y` also grows **downward**, so bars must be offset from a baseline
  to appear to grow up.
- Reaching for canvas when you actually want clickable, styleable, accessible shapes.
