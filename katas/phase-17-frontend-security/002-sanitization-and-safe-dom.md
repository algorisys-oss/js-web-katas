---
id: "phase-17/002-sanitization-and-safe-dom"
title: "Sanitization & Safe DOM APIs"
phase: 17
sequence: 2
difficulty: "intermediate"
tags: ["security", "xss", "dom", "sanitization"]
prerequisites: ["phase-17/001-cross-site-scripting"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

Once you accept that data must reach the DOM as text, you need a vocabulary of **safe DOM
APIs** and a strategy for the rare case where you genuinely must render user-supplied
*markup* (a rich-text comment, say).

The safe building blocks:

- **`textContent`** / `createTextNode` — write strings as text. The default for all data.
- **`setAttribute(name, value)`** — but **not** for URL attributes with untrusted values:
  `href`/`src` accept `javascript:` URLs that execute on click. Validate the scheme.
- **`createElement` + `append`** — build nodes explicitly so structure is code, not a
  parsed string. The browser never guesses your intent.

When you *must* accept markup, you **sanitize**: parse the string, walk the resulting
tree, and keep only an **allowlist** of safe tags and attributes — dropping `<script>`,
event handlers, and dangerous URLs. An allowlist (deny by default) is the only defensible
model; a denylist of "bad" tags will always miss something. This kata builds a tiny
allowlist sanitizer to show the shape — production code should use a vetted library
(below), not a homegrown one.

## Key Insight

> Use text sinks for data, `createElement` for structure, and an **allowlist** sanitizer
> for the rare case you must render user markup. Validate URL schemes before trusting a
> `href` or `src`.

## Experiment

```html
<h2>Safe rendering toolkit</h2>
<a id="link">profile link</a>
<div id="out" class="box"></div>
```

```js
// 1) URL guard: reject javascript:, data:, and other executable schemes.
function safeUrl(url) {
  try {
    const u = new URL(url, location.href);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : '#';
  } catch {
    return '#';
  }
}
const link = document.getElementById('link');
link.setAttribute('href', safeUrl('javascript:stealData()')); // neutralized → "#"
console.log('href after guard:', link.getAttribute('href'));

// 2) A tiny allowlist sanitizer: parse, then keep only safe tags/attrs.
const ALLOWED = { B: [], I: [], EM: [], STRONG: [], P: [], A: ['href'] };
function sanitize(dirty) {
  const tpl = document.createElement('template');
  tpl.innerHTML = dirty; // parsed in an inert template — nothing runs here
  for (const el of [...tpl.content.querySelectorAll('*')]) {
    const allowed = ALLOWED[el.tagName];
    if (!allowed) { el.replaceWith(...el.childNodes); continue; } // unwrap unknown tags
    for (const attr of [...el.attributes]) {
      if (!allowed.includes(attr.name)) el.removeAttribute(attr.name); // strip onerror, etc.
      else if (attr.name === 'href') el.setAttribute('href', safeUrl(attr.value));
    }
  }
  return tpl.content;
}

const dirty = `<p>Hi <strong>there</strong><img src=x onerror="stealData()">
  <a href="javascript:stealData()">click</a></p>`;
document.getElementById('out').replaceChildren(sanitize(dirty));
console.log('Sanitized: <img>/onerror removed, javascript: href rewritten to "#".');
```

## Expected Result

The **console** shows `href after guard: #` (the `javascript:` URL was rejected) and the
sanitized note. The **preview** renders "Hi **there**" with a "click" link, but the `<img
onerror>` is gone and the link's `href` is `#`. No `stealData` warning ever fires, because
the template parse is inert and the dangerous nodes/attributes were stripped before
insertion.

## Challenge

1. Add `<span style="...">` to the input. Note that `style` is **not** in the allowlist so
   it is stripped — explain why arbitrary `style` and `class` can be abused.
2. Extend `ALLOWED` to permit `<ul>`/`<li>` and verify nested lists survive sanitization
   while scripts still don't.
3. The sanitizer unwraps unknown tags rather than deleting their text. Change it to delete
   them entirely, then argue which behavior is safer and which is friendlier.

## Deep Dive

Two production paths exist. The browser-native **Sanitizer API**
(`Element.setHTML(string)` / the `Sanitizer` object) parses and allowlists markup with a
spec-defined safe default, removing scripts and event handlers for you — it is shipping in
modern browsers but still rolling out, so feature-detect it. Until it is universal, the
de-facto standard is **DOMPurify**, a small, heavily audited library: `el.innerHTML =
DOMPurify.sanitize(dirty)`. We don't load it here (offline, no third-party code), but the
rule holds: **never ship a hand-rolled sanitizer** — markup parsing has too many edge
cases (mutation XSS, namespace confusion) to get right yourself.

## Common Mistakes

- Setting `href`/`src` from user input without checking the scheme — `javascript:` and
  some `data:` URLs execute.
- Using a **denylist** ("remove `<script>` and `onclick`") instead of an allowlist; new
  vectors slip through every time.
- Sanitizing on input but re-introducing raw HTML somewhere downstream. Sanitize at the
  **sink**, closest to where it enters the DOM.
- Trusting `style`/`class`/`id` as harmless — they enable UI redressing and CSS-based data
  exfiltration; allowlist them too.
