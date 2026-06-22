---
id: "phase-08/002-constraint-validation-api"
title: "The Constraint Validation API"
phase: 8
sequence: 2
difficulty: "intermediate"
tags: ["forms", "validation"]
prerequisites: ["phase-08/001-form-elements-and-values"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

The browser already knows how to validate forms — you declare the rules in HTML and read
the results in JavaScript. This is the **Constraint Validation API**, and it saves you from
hand-rolling regex checks for common cases.

You declare constraints as attributes: `required`, `type="email"`, `min`/`max`,
`minlength`/`maxlength`, and `pattern="..."` (a regular expression the value must match).
The browser then exposes, on every control:

- **`.validity`** — a `ValidityState` object of booleans: `valueMissing`, `typeMismatch`,
  `patternMismatch`, `tooShort`, `rangeOverflow`, and a summary `valid`.
- **`.checkValidity()`** — returns `true`/`false` *silently* (no UI).
- **`.reportValidity()`** — same check, but also shows the browser's bubble on the first
  invalid field.
- **`.setCustomValidity(message)`** — set a non-empty message to mark a field invalid with
  your own text; set it to `''` to clear it and make the field valid again.

When any field is invalid, the form's `submit` event does not fire — the browser blocks it
and shows its built-in messages. You hook in to *augment*, not replace, that behavior.

## Key Insight

> Declare constraints in HTML; read results from `.validity` in JS. `setCustomValidity(msg)`
> marks a field invalid; `setCustomValidity('')` clears it. Empty string means valid.

## Experiment

```html
<form id="signup" novalidate>
  <input id="email" type="email" required placeholder="Email" />
  <input id="pw" type="password" required minlength="8" placeholder="Password (8+)" />
  <input id="pw2" type="password" required placeholder="Confirm password" />
  <button type="submit">Create account</button>
  <p id="msg"></p>
</form>
```

```js
const form = document.getElementById('signup');
const pw = document.getElementById('pw');
const pw2 = document.getElementById('pw2');
const msg = document.getElementById('msg');

// A constraint the browser can't express in HTML: the two passwords must match.
function checkMatch() {
  pw2.setCustomValidity(pw2.value !== pw.value ? 'Passwords do not match' : '');
}
pw.addEventListener('input', checkMatch);
pw2.addEventListener('input', checkMatch);

form.addEventListener('submit', (e) => {
  e.preventDefault();              // never actually navigate/submit here
  checkMatch();
  if (!form.checkValidity()) {     // silent check across all controls
    form.reportValidity();         // now show the browser's bubbles
    const bad = form.querySelector(':invalid');
    console.log('invalid:', bad.id, bad.validity);
    msg.textContent = 'Please fix the highlighted fields.';
    return;
  }
  msg.textContent = 'All valid — would submit now.';
  console.log('form is valid');
});
```

## Expected Result

In the **preview**, submitting with an empty or malformed email, a short password, or
mismatched confirmation keeps the form on-screen and shows the browser's validation bubble
on the first bad field. The **console** logs the offending field and its `ValidityState`,
for example:

```
invalid: email ValidityState { valueMissing: true, valid: false, ... }
```

Fill everything in correctly (valid email, 8+ char password typed identically twice) and
submitting logs `form is valid` and shows "All valid — would submit now."

## Challenge

1. Add `pattern="[a-z0-9._%+-]+@example\.com"` to the email so only `@example.com`
   addresses pass, and log `email.validity.patternMismatch` when it fails.
2. Listen for the `invalid` event on a field (it fires when a check fails) and log it —
   note that `invalid` does **not** bubble, so attach it to the field, not the form.
3. Replace the browser bubble entirely: keep `novalidate`, read `.validationMessage`, and
   render your own error text under each field.

## Deep Dive

The `:invalid` and `:valid` CSS pseudo-classes mirror `ValidityState` live, so you can style
fields with no JavaScript at all (e.g. `input:invalid { border-color: red }`). The form-level
`novalidate` attribute disables the browser's *automatic* blocking-and-bubbling on submit,
which is what you want when you intend to call `reportValidity()` (or render your own
messages) yourself — you keep the validity data, just not the default UI.

## Common Mistakes

- Forgetting that `setCustomValidity('non-empty')` keeps the field invalid forever until you
  call `setCustomValidity('')`. You must clear it when the value becomes good.
- Calling only `checkValidity()` and wondering why no message appears — it's silent;
  `reportValidity()` shows the UI.
- Re-implementing `required`/`email`/`minlength` by hand. The platform already does these;
  reserve custom JS for rules HTML can't express (like "passwords match").
