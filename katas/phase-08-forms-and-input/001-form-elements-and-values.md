---
id: "phase-08/001-form-elements-and-values"
title: "Form Elements & Values"
phase: 8
sequence: 1
difficulty: "beginner"
tags: ["forms"]
prerequisites: ["phase-07/005-pointer-keyboard-and-touch"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

A form is a cluster of interactive controls (`<input>`, `<select>`, `<textarea>`, …) that
hold *state the user can change*. Reading that state correctly is the first skill in this
phase, because every control exposes its value through a **different property** depending
on its type:

- **Text-like inputs** (`text`, `email`, `password`, `number`, `<textarea>`) — read
  `.value`. Note: `.value` is **always a string**, even for `type="number"`.
- **Checkboxes & radios** — read `.checked` (a boolean), not `.value`. The `.value` is the
  fixed string you'd submit *if* it's checked.
- **`<select>`** — read `.value` for the chosen option, or `.selectedOptions` for the full
  list (essential for `multiple`).

Controls also emit two key events as the user types or chooses:

- **`input`** — fires on *every* keystroke/edit, immediately. Use it for live feedback.
- **`change`** — fires when the value is *committed* (blur for text, instantly for
  checkboxes/selects). Use it for "the user finished."

## Key Insight

> The property you read depends on the control: `.value` for text and selects, `.checked`
> for checkboxes and radios. `.value` is always a string — coerce it yourself for numbers.

## Experiment

```html
<form id="profile">
  <input id="name" type="text" placeholder="Your name" />
  <input id="age" type="number" placeholder="Age" />
  <label><input id="news" type="checkbox" /> Subscribe</label>
  <select id="role">
    <option value="dev">Developer</option>
    <option value="design">Designer</option>
    <option value="pm">Product</option>
  </select>
  <p id="out">Edit a field…</p>
</form>
```

```js
const out = document.getElementById('out');

function snapshot() {
  const name = document.getElementById('name').value;       // string
  const ageRaw = document.getElementById('age').value;      // string, even here
  const age = Number(ageRaw);                               // coerce yourself
  const subscribed = document.getElementById('news').checked; // boolean
  const role = document.getElementById('role').value;       // selected option's value
  console.log({ name, ageRaw, age, subscribed, role });
  out.textContent = `${name || '(no name)'} · age ${age || '?'} · ${role}` +
    (subscribed ? ' · subscribed' : '');
}

// `input` fires on every keystroke; `change` fires when committed.
document.getElementById('profile').addEventListener('input', snapshot);
```

## Expected Result

In the **preview**, editing any field updates the summary paragraph live. The **console**
logs an object on each keystroke, for example after typing "Ada", age 36, checking the box,
and choosing Designer:

```
{ name: "Ada", ageRaw: "36", age: 36, subscribed: true, role: "design" }
```

Notice `ageRaw` is the string `"36"` while `age` is the number `36`.

## Challenge

1. Add a second listener for `change` (instead of `input`) on just the text field and log
   when each fires. Confirm `change` only fires when you blur the field.
2. Turn the `<select>` into a `multiple` select and read `[...select.selectedOptions]` to
   log every chosen value as an array.
3. Replace the checkbox with a group of radio buttons sharing one `name`, and read the
   chosen one with `form.elements['theGroupName'].value`.

## Deep Dive

Every `<form>` exposes a live `HTMLFormControlsCollection` at `form.elements`, indexable by
control `name` *or* `id`. `form.elements.name.value` is often cleaner than chaining
`getElementById`. For radio groups, `form.elements[groupName]` returns a `RadioNodeList`
whose `.value` is the checked radio's value — the platform does the "which one is selected"
work for you.

## Common Mistakes

- Reading `.value` on a checkbox to decide if it's "on." `.value` is the submit string
  (`"on"` by default); the boolean you want is `.checked`.
- Treating `type="number"` `.value` as a number. It is a string; `"10" + 5` is `"105"`.
- Using `change` for live UI (a character counter, a search box) — it won't update until
  blur. Use `input` for per-keystroke feedback.
