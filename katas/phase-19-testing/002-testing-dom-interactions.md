---
id: "phase-19/002-testing-dom-interactions"
title: "Testing DOM Interactions"
phase: 19
sequence: 2
difficulty: "intermediate"
tags: ["testing", "dom"]
prerequisites: ["phase-19/001-unit-testing-logic"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

Pure functions are the easy case. Real UI code also *touches the DOM*: it reads input
values, updates text, toggles classes. You can test that behavior too — the DOM is just an
object tree, and a test can drive it the same way a user would: **find an element, act on
it (click, type, dispatch an event), then assert on the resulting DOM**.

There are two ways to act:

- `element.click()` — a convenience that fires a real `click` event and runs its handlers.
- `element.dispatchEvent(new Event('input', { bubbles: true }))` — the general form for any
  event type (`input`, `change`, `submit`, custom events).

The **Testing Library** philosophy (used by `@testing-library/dom` and the React/Vue
variants) says: *query the way a user perceives the page*. Prefer finding elements by their
**accessible role and name** (`getByRole('button', { name: /add/i })`) or visible **text**,
not by brittle CSS classes or test-only IDs. If a query by role works, your component is
probably accessible too — testing and accessibility reinforce each other (Phase 18). We'll
write a minimal `getByText`/`getByRole` to feel the idea.

## Key Insight

> Test the DOM the way a user uses it: find by role/text, click or dispatch an event, then
> assert on what changed. If you can only find an element by a brittle CSS selector, that's
> a smell — the UI may not be accessible.

## Experiment

```html
<div id="app">
  <p>Count: <output id="count" role="status">0</output></p>
  <button type="button" id="inc">Add one</button>
</div>
```

```js
// ---- tiny harness ----
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`✓ PASS — ${name}`); }
  catch (err) { failed++; console.error(`✗ FAIL — ${name}\n    ${err.message}`); }
}
const assert = {
  equal: (a, b, m) => { if (a !== b) throw new Error(m || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); },
  ok: (v, m) => { if (!v) throw new Error(m || 'expected truthy'); },
};

// ---- user-centric queries (a tiny slice of Testing Library) ----
const getByRole = (role, name) =>
  [...document.querySelectorAll(`[role="${role}"], button`)]
    .find(el => (el.getAttribute('role') === role || el.tagName === 'BUTTON' && role === 'button')
      && (!name || el.textContent.trim().match(name)));
const getByText = (re) =>
  [...document.querySelectorAll('*')].find(el => el.children.length === 0 && re.test(el.textContent));

// ---- the widget under test ----
function mountCounter() {
  const count = document.getElementById('count');
  document.getElementById('inc').addEventListener('click', () => {
    count.textContent = String(Number(count.textContent) + 1);
  });
}
mountCounter();

// ---- tests: find → act → assert ----
test('starts at zero', () => {
  assert.equal(getByText(/^0$/).textContent, '0');
});

test('clicking the button increments the count', () => {
  const button = getByRole('button', /add one/i);     // find by role + accessible name
  button.click();                                     // act
  assert.equal(document.getElementById('count').textContent, '1'); // assert
});

test('clicking again increments again', () => {
  getByRole('button', /add one/i).click();
  // dispatchEvent is the general form — equivalent to .click() here:
  getByRole('button', /add one/i).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  assert.equal(document.getElementById('count').textContent, '3');
});

console.log(`\n${passed} passed, ${failed} failed`);
```

## Expected Result

You see the live widget in the **preview** and three passing tests in the **console**:

```
✓ PASS — starts at zero
✓ PASS — clicking the button increments the count
✓ PASS — clicking again increments again

3 passed, 0 failed
```

The button is found by its **role and visible text**, not by `#inc`. Each test drives the
real event handler, so the assertions reflect actual user behavior.

## Challenge

1. Add a "Reset" button to the HTML and a test that clicks it and asserts the count is back
   to `0`. Query it by role + name, never by ID.
2. The third test runs *after* the second, so the count is already `1` — that's shared
   state between tests. Refactor `mountCounter` so each test can mount a fresh widget into a
   throwaway container and start from `0`. Why does test isolation matter?
3. Dispatch a `keydown` (`new KeyboardEvent('keydown', { key: 'Enter' })`) on the button and
   verify whether it increments. What does the result tell you about native button keyboard
   behavior vs. a `<div>` you'd have to wire up yourself?

## Deep Dive

Real Testing Library queries are far richer: `getByRole` computes the *accessible name and
role* from the accessibility tree (the same tree screen readers use), `findBy*` retries
until an async update appears, and `userEvent` simulates realistic interaction sequences
(focus, keydown, keypress, input, keyup) instead of a single synthetic event. Under Jest or
Vitest there's no real browser, so the DOM is supplied by **jsdom** — a JavaScript
implementation of the DOM. Our playground has the *actual* browser DOM, which is even
closer to production.

## Common Mistakes

- Querying by brittle selectors (`.btn-primary`, deep `div > span`) that break on any
  refactor; query by role/text/label so tests survive restyling.
- Calling the handler function directly instead of dispatching an event — you then skip the
  real wiring (listeners, bubbling, `preventDefault`) that can be the actual bug.
- Forgetting that `dispatchEvent` events need `{ bubbles: true }` when a parent (e.g. a
  delegated listener or a form's `submit`) is what's actually listening.
- Sharing DOM state across tests without resetting it, so tests pass only in one order.
