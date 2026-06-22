# Phase 19 — Testing Frontend JavaScript

**Ladder rung:** cross-cutting — a quality practice that wraps every rung, not a layer of
its own. Testing applies to your pure logic, your DOM code, your network calls, and your
whole app.

## Goal

Learn to prove your frontend code works — and keep it working — without a framework getting
in the way. By the end of this phase you can unit-test pure logic, drive and assert on DOM
interactions the way a user would, mock `fetch` and time so tests stay fast and offline,
test async code without the forgotten-`await` trap, and reason about end-to-end tests and
the test pyramid.

## Why it matters

Untested frontend code rots: a refactor breaks a handler, a "small" change drops a network
case, an async path silently swallows an error. Tests turn "I think it works" into "I can
prove it, in milliseconds, on every commit." Because this playground has **no test runner**,
each kata builds a tiny inline `test()`/`assert` harness — which also reveals that a test
framework is, at heart, just "run a function, catch the throw, report pass/fail."

## Katas

1. [Unit Testing Logic](./001-unit-testing-logic.md) — a tiny `test`/`assert` harness;
   arrange-act-assert on a pure function; equality, truthiness, and throws assertions.
2. [Testing DOM Interactions](./002-testing-dom-interactions.md) — build a widget, then
   find → click/dispatch → assert; the Testing Library "query by role/text" philosophy.
3. [Mocking Fetch & Timers](./003-mocking-fetch-and-timers.md) — stub `globalThis.fetch`
   with a fake `Response`, assert the URL/options, and advance a fake clock instead of
   waiting.
4. [Testing Async Code](./004-testing-async-code.md) — `await` resolved values, assert
   rejections with `try/await/catch`, and avoid the test-that-passes-without-running trap.
5. [End-to-End Testing (conceptual)](./005-end-to-end-testing.md) — Playwright/Cypress, the
   test pyramid, selectors and flakiness; a *simulated* user flow over the real DOM.

## What's next

Phase 20 — Architecture & State: state-management patterns, observer/pub-sub, reactive
state from scratch, client-side routing, and a small framework-free app — the code you'll
now know how to test.
