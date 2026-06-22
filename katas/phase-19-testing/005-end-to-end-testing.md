---
id: "phase-19/005-end-to-end-testing"
title: "End-to-End Testing (conceptual)"
phase: 19
sequence: 5
difficulty: "advanced"
tags: ["testing"]
prerequisites: ["phase-19/004-testing-async-code"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

**End-to-end (E2E) tests** drive a *real browser* through a *real user flow*: open the page,
type into fields, click buttons, follow navigation, and assert on what the user finally
sees — across the whole stack, frontend and backend together. Tools like **Playwright** and
**Cypress** launch Chromium/Firefox/WebKit, control them over an automation protocol, and
wait for the UI to settle between steps.

Where does E2E fit? The **test pyramid**:

```
        ╱╲     few   →  E2E        (slow, real browser, whole flows)
       ╱──╲           →  integration (several units + a fake server)
      ╱────╲   many  →  unit        (fast, pure logic — katas 001–004)
```

Many fast unit tests at the base, a handful of slow E2E tests at the top. E2E catches what
units can't — routing, real DOM, the actual network, "does the *whole thing* work?" — but
each test is slow and **flaky-prone**: timing races, animations, and network jitter make
them fail intermittently. The cure is the same Testing Library wisdom from kata 002: select
by **role / accessible name / visible text** (`page.getByRole('button', { name: 'Buy' })`),
and rely on **auto-waiting** (the tool retries until the element is actionable) instead of
fixed `sleep()` calls.

This kata is **conceptual** — there is no real Playwright here. To make it *runnable*, we
simulate a tiny "user flow" over the real DOM in the iframe: a fake `page` object that finds
elements by role/text and clicks them, exactly mirroring a Playwright script's shape, so you
feel the API without the dependency.

## Key Insight

> E2E tests drive a real browser through a real user journey — high confidence, but slow
> and flaky, so you keep them few (the top of the pyramid). Select by role/text and lean on
> auto-waiting, never fixed sleeps.

## Experiment

```html
<form id="login">
  <label>Email <input name="email" type="email" /></label>
  <button type="submit">Log in</button>
</form>
<p id="welcome" hidden>Welcome back, <span id="who"></span>!</p>
```

```js
// ---- the app under test (normally this is your real shipped page) ----
document.getElementById('login').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.elements.email.value;
  document.getElementById('who').textContent = email.split('@')[0];
  document.getElementById('welcome').hidden = false;
});

// ---- a *simulated* Playwright-style `page` (conceptual stand-in) ----
const page = {
  getByRole(role, { name } = {}) {
    const el = [...document.querySelectorAll('button, input, [role]')]
      .find(n => {
        const r = n.getAttribute('role')
          || (n.tagName === 'BUTTON' ? 'button' : n.tagName === 'INPUT' ? 'textbox' : '');
        return r === role && (!name || n.textContent.trim().match(name));
      });
    if (!el) throw new Error(`no ${role} named ${name} found`);
    return { click: () => el.click(), fill: (v) => { el.value = v; } };
  },
  getByLabelText(re) {
    const label = [...document.querySelectorAll('label')].find(l => re.test(l.textContent));
    const input = label.querySelector('input');
    return { fill: (v) => { input.value = v; } };
  },
  getByText: (re) => [...document.querySelectorAll('*')].find(n => n.children.length === 0 && re.test(n.textContent)),
  isVisible: (el) => !!el && !el.closest('[hidden]') && !el.hidden,
};

// ---- tiny async harness ----
let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`✓ PASS — ${name}`); }
  catch (err) { failed++; console.error(`✗ FAIL — ${name}\n    ${err.message}`); }
}
const assert = { ok: (v, m) => { if (!v) throw new Error(m || 'expected truthy'); } };

// ---- the E2E "user flow": read like a Playwright test ----
await test('user logs in and sees a personalized welcome', async () => {
  page.getByLabelText(/email/i).fill('ada@example.com');   // type into the field
  page.getByRole('button', { name: /log in/i }).click();    // submit the form
  const welcome = page.getByText(/welcome back/i);          // assert on what the user sees
  assert.ok(page.isVisible(welcome), 'welcome banner should be visible after login');
  assert.ok(/ada/.test(welcome.textContent), 'banner should greet the user by name');
});

console.log(`\n${passed} passed, ${failed} failed`);
console.log('NOTE: This is a *simulation*. Real E2E (Playwright/Cypress) drives an actual browser.');
```

## Expected Result

The preview shows the form; after the simulated flow runs, the welcome banner is revealed.
The console prints:

```
✓ PASS — user logs in and sees a personalized welcome

1 passed, 0 failed
NOTE: This is a *simulation*. Real E2E (Playwright/Cypress) drives an actual browser.
```

Notice how the test reads like a sentence — *fill email, click log in, see welcome* — and
finds elements by **label, role, and text**, never by ID. That's the shape of a real
Playwright/Cypress script; only the engine underneath differs.

## Challenge

1. Add validation: if the email is empty, show an error and *don't* reveal the welcome.
   Write a second "flow" that submits empty and asserts the error text appears. This is the
   kind of journey E2E covers that a pure unit test can't.
2. Real `page.getByRole(...).click()` is **async** and **auto-waits**. Make the simulated
   `click`/`fill` return a `Promise`, add `await` in the flow, and explain why every real
   Playwright action returns a promise (hint: the browser is a separate process).
3. List three sources of E2E **flakiness** (animation, network, timing) and one mitigation
   for each. Why is `await page.waitForTimeout(500)` an anti-pattern?

## Deep Dive

Playwright and Cypress differ in mechanics: Playwright runs tests in Node and talks to the
browser over the **DevTools/automation protocol** out-of-process (so one test can span
multiple tabs, origins, and even browsers), while Cypress runs the test code *inside* the
browser alongside your app. Both add **auto-waiting** (retry an action until the element is
visible, enabled, and stable), **trace/video** capture for debugging, and **network
interception** (Playwright's `page.route`, Cypress's `cy.intercept`) so you can stub the
backend at the E2E layer — blending the determinism of mocks (kata 003) with the realism of
a true browser. The strategy that scales: push as much as possible *down* the pyramid into
fast unit/integration tests, and reserve E2E for a few critical journeys (sign-up, checkout,
the core happy path) where end-to-end confidence is worth the cost.

## Common Mistakes

- Writing many E2E tests for logic that a unit test could cover — slow suites, flaky CI,
  and slow feedback. Keep E2E few; push detail down the pyramid.
- Fixed sleeps (`waitForTimeout`) to "wait for the UI" — they're either too short (flaky)
  or too slow. Use auto-waiting / wait-for-condition assertions instead.
- Selecting by CSS classes or DOM structure that designers change weekly; select by role,
  label, and visible text so tests track the user's view, not the markup.
- Treating a green E2E run as proof of *everything*. E2E proves a *journey* works; it can't
  exhaustively check edge cases — that's the unit layer's job.
