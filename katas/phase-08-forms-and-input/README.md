# Phase 8 — Forms & User Input

**Ladder rung:** 6 — Forms & User Input.

## Goal

Capture, validate, and react to what users type and choose — using the platform's own form
machinery instead of reinventing it. By the end of this phase you can read any control's
value correctly, validate with the Constraint Validation API, make an input a controlled
reflection of your own state, harvest a whole form with `FormData`, and debounce expensive
work so it runs when typing pauses, not on every keystroke.

## Why it matters

Forms are where most real apps meet the user: sign-ups, searches, checkouts, settings. The
bugs here are everyday ones — reading `.value` off a checkbox, a search box that fires a
request per keystroke, a form that reloads the page on submit, a field silently missing from
the data because it has no `name`. The browser already solves these problems; this phase
teaches you to use what it gives you.

## Katas

1. [Form Elements & Values](./001-form-elements-and-values.md) — `.value` vs `.checked` vs
   `.selectedOptions`, and the `input` vs `change` events.
2. [The Constraint Validation API](./002-constraint-validation-api.md) — `required`,
   `pattern`, `.validity`, `checkValidity`/`reportValidity`, and `setCustomValidity`.
3. [Controlled Input Patterns](./003-controlled-input-patterns.md) — make a JS object the
   source of truth: event → update state → render from state.
4. [FormData & Submission](./004-formdata-and-submission.md) — `e.preventDefault()`,
   `new FormData(form)`, entries, and repeated names.
5. [Debouncing Input](./005-debouncing-input.md) — a closure-and-timer debounce so the
   handler runs once, after the user stops typing.

## What's next

Phase 9 — Styling from JavaScript: reading and writing styles, `classList` and CSS
variables, computed styles, and animation with `requestAnimationFrame`.
