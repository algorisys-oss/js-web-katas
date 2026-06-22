---
id: "phase-07/005-pointer-keyboard-and-touch"
title: "Pointer, Keyboard & Touch Events"
phase: 7
sequence: 5
difficulty: "intermediate"
tags: ["events"]
prerequisites: ["phase-07/004-custom-events"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

`click` is convenient but coarse. Real interaction comes from three lower-level input
families:

- **Pointer events** (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) are the
  **unified** model for mouse, touch, *and* pen. One handler covers all three. The event
  carries `pointerType` (`"mouse"` / `"touch"` / `"pen"`), `pointerId` (to track multiple
  fingers), and pressure/tilt. Prefer these over separate `mouse*` and `touch*` handlers.
- **Keyboard events** (`keydown`, `keyup`) report `event.key` (the character or named key,
  e.g. `"a"`, `"Enter"`, `"ArrowLeft"`) and modifier flags (`ctrlKey`, `shiftKey`,
  `metaKey`, `altKey`). Use `key` for *what was typed*; the deprecated `keyCode` is gone.
- **Touch events** (`touchstart`, `touchmove`, `touchend`) predate pointer events and expose
  a `touches` list for multi-finger gestures. On modern browsers you rarely need them
  directly — pointer events with `pointerType === 'touch'` cover most cases — but they still
  exist where you need raw multi-touch.

Because some inputs only exist on some devices, you **feature-detect**:
`'onpointerdown' in window`. And `pointermove`/`touchmove` listeners that scroll should be
`{ passive: true }` so the browser doesn't wait for you before scrolling.

## Key Insight

> Pointer events unify mouse, touch, and pen into one API — reach for them first.
> Keyboard events report *what* via `event.key`. Feature-detect before assuming an input
> exists.

## Experiment

```html
<div id="pad">Press / move / type here</div>
<input id="field" placeholder="type with Shift/Ctrl…" />
<p id="readout">Waiting for input…</p>
```

```css
#pad {
  height: 120px; display: grid; place-items: center;
  background: #6366f1; color: white; border-radius: 8px;
  touch-action: none; user-select: none; cursor: crosshair;
}
```

```js
const pad = document.getElementById('pad');
const readout = document.getElementById('readout');

console.log('Pointer events supported:', 'onpointerdown' in window);

// ONE pointer handler covers mouse, touch, and pen.
pad.addEventListener('pointerdown', (event) => {
  readout.textContent =
    `pointerdown via ${event.pointerType} at (${Math.round(event.offsetX)}, ${Math.round(event.offsetY)})`;
  console.log('pointerdown — type:', event.pointerType, 'id:', event.pointerId);
});

// passive: true — we only read, never preventDefault, so scrolling stays smooth.
pad.addEventListener('pointermove', (event) => {
  if (event.buttons === 0 && event.pointerType === 'mouse') return; // only while pressed
  readout.textContent = `${event.pointerType} move at (${Math.round(event.offsetX)}, ${Math.round(event.offsetY)})`;
}, { passive: true });

// Keyboard: event.key is the WHAT; modifier flags add context.
document.getElementById('field').addEventListener('keydown', (event) => {
  const mods = [event.ctrlKey && 'Ctrl', event.shiftKey && 'Shift', event.altKey && 'Alt']
    .filter(Boolean).join('+');
  console.log('keydown — key:', JSON.stringify(event.key), mods ? `(${mods})` : '');
  if (event.key === 'Enter') console.log('  → Enter pressed: submit the form');
});

console.log('Click/drag the pad and type in the field (in the preview).');
```

## Expected Result

On load the console reports whether pointer events are supported (`true` in modern
browsers). In the **preview**, pressing the indigo pad updates the readout with the
`pointerType` and coordinates and logs `pointerdown`; dragging (mouse held down, or a
finger/pen) updates the readout live. Typing in the field logs each `keydown` with the
`event.key` value and any held modifiers — try `Shift+a`, `Ctrl+s`, and `Enter`. (On a
desktop without touch hardware, `pointerType` reports `"mouse"`; touch shows on a touch
device.)

## Challenge

1. Add `pad.setPointerCapture(event.pointerId)` on `pointerdown` and track `pointermove`
   even when the pointer leaves the pad. Why does pointer capture matter for drag UIs?
2. Build a keyboard shortcut: when `event.ctrlKey && event.key === 's'`, call
   `event.preventDefault()` and log "saved" — preventing the browser's Save dialog.
3. Distinguish the three `pointerType`s and color the readout differently for mouse, touch,
   and pen. Test on a phone if you have one.

## Deep Dive

Pointer events were standardized to end the era of writing parallel `mouse*` and `touch*`
code with `if (isTouch)` branches everywhere. They also fixed the infamous **300 ms tap
delay** and the "ghost click" (a touch firing both touch *and* synthetic mouse events).
The CSS property `touch-action` (e.g. `touch-action: none`) tells the browser which native
gestures you'll handle yourself, which is why our pad sets it — without it, a drag might
scroll the page instead of reaching your handler.

## Common Mistakes

- Writing separate `mousedown`/`touchstart` handlers and fighting double-firing, instead of
  one `pointerdown`. Use pointer events.
- Reading the removed `event.keyCode`/`event.which` instead of `event.key`. Use `key` (or
  `code` for physical key position, e.g. game controls).
- Forgetting `{ passive: true }` on `move` handlers tied to scrolling, hurting scroll
  performance — or forgetting `touch-action` and having the browser scroll instead of
  dragging.
- Assuming touch exists everywhere (or mouse everywhere). Feature-detect and design for
  both pointer types.
