---
id: "phase-17/001-cross-site-scripting"
title: "Cross-Site Scripting (XSS)"
phase: 17
sequence: 1
difficulty: "intermediate"
tags: ["security", "xss", "dom"]
prerequisites: ["phase-16/005-building-a-simple-pwa"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

**Cross-Site Scripting (XSS)** is the browser's most common security flaw: untrusted data
is written into the page as **HTML**, and the browser parses it as markup — running any
script it contains with the full privileges of your origin. That script can read cookies,
exfiltrate `localStorage`, forge requests, and rewrite the page.

The root cause is a category error: treating a **string of data** as a **string of
markup**. The DOM is a live tree, not text. When you assign user input to `innerHTML`, the
browser builds *nodes* from it — including `<script>` and event-handler attributes like
`onerror`. (A `<script>` element inserted via `innerHTML` won't run, but
`<img src=x onerror=...>` *will*, which is why the classic payload uses an attribute.)

The fix is to choose the right sink. `textContent` writes a string as **text** — the
browser never parses it as markup, so `<img onerror=...>` becomes literal, harmless
characters on screen. **Data goes in as text; only trusted markup goes in as HTML.**

This kata makes the contrast concrete: the same untrusted string, sent through two
different sinks, in a sandboxed demo area. No real damage — the payload just calls a
`stealData()` stub that logs to prove it executed.

## Key Insight

> XSS happens when data is parsed as markup. `innerHTML` parses; `textContent` does not.
> Untrusted input must reach the DOM as **text**, never as HTML.

## Experiment

```html
<h2>Untrusted comment renderer</h2>
<div id="unsafe-label">Via innerHTML (vulnerable):</div>
<div id="unsafe" class="box"></div>
<div id="safe-label">Via textContent (safe):</div>
<div id="safe" class="box"></div>
```

```js
// Pretend this came from another user's comment — we do NOT control it.
const untrusted = `<img src="x" onerror="stealData('cookies + tokens')">Nice post!`;

// A harmless stand-in for what an attacker's payload would really do.
function stealData(what) {
  console.warn(`XSS FIRED — attacker code ran, could now steal: ${what}`);
}
window.stealData = stealData; // the injected handler resolves names on window

// VULNERABLE: innerHTML parses the string as markup → the onerror handler runs.
const unsafe = document.getElementById('unsafe');
unsafe.innerHTML = untrusted;
console.log('innerHTML done — watch the warning above; the broken image triggered onerror.');

// SAFE: textContent writes the same string as literal text → nothing executes.
const safe = document.getElementById('safe');
safe.textContent = untrusted;
console.log('textContent done — the tag is shown as plain characters, no code ran.');
```

## Expected Result

In the **console** you see one **warning**, "XSS FIRED — attacker code ran…", produced by
the `innerHTML` path: the browser built a real `<img>`, failed to load `src="x"`, and ran
the `onerror` handler. The **preview** shows the safe box displaying the *literal* text
`<img src="x" onerror="...">Nice post!` — proving `textContent` never parsed it as markup
and the same payload was completely inert.

## Challenge

1. Swap the payload for `<svg onload="stealData('via svg')">`. Does it fire through
   `innerHTML`? Does `textContent` still neutralize it? Why is no payload special-case
   safe — what matters is the *sink*, not the *tag*.
2. Try inserting a literal `<script>alert(1)</script>` via `innerHTML`. It does **not**
   run. Explain why, and why this gives a false sense of security.
3. Replace `innerHTML` with `insertAdjacentHTML('beforeend', untrusted)`. Confirm it is
   *also* a dangerous HTML sink, then rewrite it safely.

## Deep Dive

XSS comes in three shapes. **Stored** XSS persists the payload on the server (a comment, a
profile field) and fires for every viewer. **Reflected** XSS bounces a payload off the
server in a URL or form and fires for whoever follows the link. **DOM-based** XSS never
touches the server — JavaScript reads from `location.hash`, `document.referrer`, or
`postMessage` and writes it to an HTML sink entirely in the browser. All three share one
fix: keep untrusted data out of HTML sinks. The dangerous sinks to audit are `innerHTML`,
`outerHTML`, `insertAdjacentHTML`, `document.write`, and `<a href>`/`src` set from input.

## Common Mistakes

- Believing inserting `<script>` via `innerHTML` is the threat. It isn't — event-handler
  attributes (`onerror`, `onload`) and `javascript:` URLs are the real vectors.
- "Escaping" with a hand-rolled `replace(/</g, '&lt;')` and missing attributes, quotes, or
  URL contexts. Encoding is context-sensitive; prefer text sinks or a real sanitizer.
- Trusting data because it "came from our own API." If a user could ever influence it, it
  is untrusted at the point it reaches the DOM.
- Assuming a framework makes you immune. Escape hatches like `dangerouslySetInnerHTML` or
  `v-html` reintroduce the exact same `innerHTML` risk.
