---
id: "phase-18/003-keyboard-navigation-and-focus"
title: "Keyboard Navigation & Focus Management"
phase: 18
sequence: 3
difficulty: "intermediate"
tags: ["accessibility", "keyboard", "focus"]
prerequisites: ["phase-18/002-aria-roles-and-attributes"]
estimated_minutes: 14
starter: ["html", "css", "js"]
network: false
---

## Concept

Many people never touch a mouse: keyboard-only users, screen-reader users, switch-device
users. For them the page is a sequence of **focus stops**. Get focus right and the UI
works; get it wrong and people get stranded.

The rules:

- **Native interactive elements** (`<button>`, `<a href>`, `<input>`) are in the tab order
  automatically. Don't add `tabindex` to them.
- **`tabindex="0"`** puts a *non-native* element into the natural tab order (use sparingly,
  e.g. a custom widget that must be focusable).
- **`tabindex="-1"`** makes an element **programmatically focusable** (via `.focus()`) but
  **not** reachable by Tab — essential for moving focus to a region or a dialog.
- **Never use a positive `tabindex`** (`tabindex="1"`, `2`…). It rips elements out of DOM
  order into a separate, fragile tab sequence that almost always breaks.

When the UI changes — a dialog opens, a route changes, content is inserted — you often
must **move focus programmatically** with `.focus()`, and a **modal dialog must trap
focus** so Tab can't escape to the inert page behind it. Finally, style focus with
**`:focus-visible`** (shows a ring for keyboard users, hides it for mouse clicks) — and
never `outline: none` without a replacement.

## Key Insight

> `tabindex="0"` joins the tab order; `tabindex="-1"` is focusable only via script; never
> use positive values. Move focus deliberately, trap it in modals, and always show a
> visible focus ring.

## Experiment

```html
<button id="open">Open dialog</button>

<div id="dialog" role="dialog" aria-modal="true" aria-labelledby="title" hidden>
  <h2 id="title">Confirm action</h2>
  <button id="ok">OK</button>
  <button id="cancel">Cancel</button>
</div>
```

```css
/* Only show the focus ring for keyboard users, not mouse clicks. */
:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
}
#dialog {
  border: 2px solid #6366f1;
  padding: 1rem;
  max-width: 18rem;
  border-radius: 8px;
}
```

```js
const openBtn = document.getElementById('open');
const dialog = document.getElementById('dialog');
let lastFocused = null;

function focusable() {
  return [...dialog.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')];
}

function open() {
  lastFocused = document.activeElement;   // remember where to return focus
  dialog.hidden = false;
  focusable()[0].focus();                 // move focus INTO the dialog
  console.log('dialog open, focus on:', document.activeElement.id);
}

function close() {
  dialog.hidden = true;
  lastFocused?.focus();                   // restore focus to the trigger
  console.log('dialog closed, focus restored to:', document.activeElement.id);
}

openBtn.addEventListener('click', open);
document.getElementById('ok').addEventListener('click', close);
document.getElementById('cancel').addEventListener('click', close);

// Trap Tab inside the dialog, and let Escape close it.
dialog.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return close();
  if (e.key !== 'Tab') return;
  const items = focusable();
  const first = items[0], last = items.at(-1);
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
```

## Expected Result

Click **Open dialog**: the dialog appears and focus jumps to **OK** (logged). Press
**Tab** repeatedly — focus cycles OK → Cancel → OK and **never leaves** the dialog;
**Shift+Tab** wraps backward. Press **Escape** or a button to close, and focus **returns
to the "Open dialog" button** (logged). Throughout, you see a purple focus ring only when
navigating by keyboard, not when clicking.

A screen reader announces *"Confirm action, dialog"* on open (from `role="dialog"` +
`aria-labelledby`), and `aria-modal="true"` tells it to ignore the page behind. The visible
focus management and the announcement are two halves of the same correct behavior.

## Challenge

1. Add a third focusable element (a text `<input>`) to the dialog and confirm the trap
   still wraps correctly around all three.
2. Implement **roving tabindex** for a toolbar: give a row of buttons one `tabindex="0"`
   and the rest `tabindex="-1"`, then use Arrow keys to move the `0` (and `.focus()`) along
   the row. Why is this better than five separate tab stops?
3. Remove the `:focus-visible` rule and replace it with `outline: none`. Tab through and
   experience how disorienting an invisible focus is — then put the ring back.

## Deep Dive

The native `<dialog>` element with `dialog.showModal()` gives focus trapping, the Escape
key, the backdrop, and `aria-modal` semantics for free — another win for "use the
platform." We built the trap by hand here to *show the mechanics* every modal needs:
remember the opener, move focus in, cycle Tab within, restore focus out. **Roving
tabindex** is the standard pattern for composite widgets (menus, tabs, grids,
toolbars): the whole widget is one Tab stop, and Arrow keys move a single `tabindex="0"`
among the children, matching how native `<select>` and radio groups behave.

## Common Mistakes

- Using a positive `tabindex` to "control order" — it creates a brittle parallel tab
  sequence and pushes everything with `tabindex="0"` after it.
- Opening a dialog/menu without moving focus into it, or closing it without restoring
  focus to the trigger, leaving keyboard users lost.
- `outline: none` with no replacement, erasing the focus indicator keyboard users depend
  on. Style focus, don't delete it.
- Trapping focus in a non-modal widget. Only *modal* surfaces should trap; a normal
  dropdown should let Tab move on (and close on focus-out).
