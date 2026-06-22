---
id: "phase-08/004-formdata-and-submission"
title: "FormData & Submission"
phase: 8
sequence: 4
difficulty: "intermediate"
tags: ["forms", "data"]
prerequisites: ["phase-08/003-controlled-input-patterns"]
estimated_minutes: 13
starter: ["html", "js"]
network: false
---

## Concept

Reading every control one `getElementById` at a time is tedious and brittle. The platform
gives you **`FormData`**: pass a `<form>` to its constructor and it harvests every *named,
enabled* control into a key/value collection for you — exactly the data the browser would
send if the form submitted.

The natural place to build it is the form's **`submit`** event. But that event's default
action is to **navigate the browser** (reload or go to the `action` URL). For a JavaScript
app you almost always **`e.preventDefault()`** to cancel that, then handle the data yourself:

```js
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // …read data, validate, send via fetch, etc.
});
```

`FormData` is iterable. Useful readers:

- **`data.get('name')`** / **`data.getAll('name')`** — one value, or all values for a
  repeated name (checkbox groups, `multiple` selects).
- **`for (const [k, v] of data.entries())`** — every pair, in document order.
- **`Object.fromEntries(data)`** — a plain object (handy, but it *collapses* repeated keys —
  use `getAll` when names repeat).

Only controls with a `name` attribute are included. No `name`, no data — a classic
"why is my field missing" bug.

## Key Insight

> `new FormData(form)` collects every *named* control's value for you. In a JS app, the
> `submit` handler must call `e.preventDefault()` first, or the browser navigates away.

## Experiment

```html
<form id="signup">
  <input name="username" placeholder="Username" required />
  <input name="email" type="email" placeholder="Email" required />
  <fieldset>
    <legend>Interests</legend>
    <label><input type="checkbox" name="interest" value="js" /> JS</label>
    <label><input type="checkbox" name="interest" value="css" /> CSS</label>
    <label><input type="checkbox" name="interest" value="a11y" /> A11y</label>
  </fieldset>
  <input name="nickname" disabled value="ignored" />  <!-- disabled → omitted -->
  <button type="submit">Submit</button>
  <pre id="out"></pre>
</form>
```

```js
const form = document.getElementById('signup');
const out = document.getElementById('out');

form.addEventListener('submit', (e) => {
  e.preventDefault();                 // stop the browser from navigating
  const data = new FormData(form);    // harvest all named, enabled controls

  console.log('— entries —');
  for (const [key, value] of data.entries()) {
    console.log(`${key}: ${value}`);
  }

  // Repeated names (the checkbox group) need getAll, not get:
  const interests = data.getAll('interest');
  console.log('interests:', interests);

  // A flat object — note this would collapse the repeated `interest` key:
  const obj = Object.fromEntries(data);
  out.textContent = JSON.stringify({ ...obj, interest: interests }, null, 2);
  // In a real app: fetch('/api', { method: 'POST', body: data }) — Phase 11.
});
```

## Expected Result

In the **preview**, filling in a username and email, checking JS and A11y, then submitting
does **not** reload — the `<pre>` shows the collected object and the **console** logs:

```
— entries —
username: Ada
email: ada@example.com
interest: js
interest: a11y
interests: ["js", "a11y"]
```

The `nickname` field never appears: it is `disabled`, so `FormData` skips it. The repeated
`interest` key shows up once per checked box, which is why `getAll` returns both values.

## Challenge

1. Remove the `name` from the email input and resubmit. Watch it vanish from the entries —
   only named controls are collected.
2. Append a computed field with `data.append('submittedAt', Date.now())` before logging, and
   confirm it joins the entries.
3. Build a query string with `new URLSearchParams(data).toString()` and log it — the same
   `FormData` is how you'd send `application/x-www-form-urlencoded` bodies.

## Deep Dive

`new FormData(form)` is a *snapshot* taken at construction time, not a live view — edit a
field afterward and the existing object won't change; build a fresh one. When passed as a
`fetch` body, `FormData` is serialized as `multipart/form-data`, which is the only encoding
that can carry **file** inputs (`<input type="file">`), where `data.get('file')` returns a
`File` object. The 2-arg form `new FormData(form, submitter)` even records *which* button
triggered the submit, so a form with multiple submit buttons can tell them apart.

## Common Mistakes

- Forgetting `e.preventDefault()` — the form submits and the page reloads, wiping your state
  and your console.
- Expecting a control with no `name` to appear in `FormData`. The `id` is irrelevant here;
  only `name` counts.
- Using `Object.fromEntries(data)` on a form with repeated names (checkbox groups, multi
  selects) and silently dropping all but the last value. Use `getAll` for those.
