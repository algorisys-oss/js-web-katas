# Phase 17 — Frontend Security

**Ladder rung:** 10 — Security (XSS, CSP, CORS).

## Goal

Learn to write frontend JavaScript that an attacker can't turn against your users. By the
end of this phase you can explain how XSS happens and stop it at the DOM sink, sanitize
untrusted markup with an allowlist, read and reason about a Content Security Policy,
predict what the same-origin policy and CORS allow, and store session tokens where XSS and
CSRF can't reach them.

## Why it matters

The browser runs untrusted data next to your trusted code on the same origin. A single
unsafe `innerHTML`, a `javascript:` URL, a permissive `'unsafe-inline'` CSP, or a token in
`localStorage` is enough to leak sessions and forge requests. Security here is not a
library you bolt on — it is a set of defaults (text sinks, allowlists, `HttpOnly` cookies)
and layers (sanitize *and* CSP) you choose deliberately. This phase teaches them as
defenses, so you can build them in from the start rather than patch them after a breach.

## Katas

1. [Cross-Site Scripting (XSS)](./001-cross-site-scripting.md) — how data parsed as markup
   executes, demonstrated safely, and the `textContent` fix.
2. [Sanitization & Safe DOM APIs](./002-sanitization-and-safe-dom.md) — text sinks,
   `setAttribute` URL pitfalls, an allowlist sanitizer, and the Sanitizer API / DOMPurify.
3. [Content Security Policy](./003-content-security-policy.md) — directives, nonces,
   `'unsafe-inline'`, and how CSP blocks injected scripts as defense in depth.
4. [CORS from the Browser Side](./004-cors-from-the-browser.md) — same-origin policy,
   simple vs preflighted requests, `Access-Control-Allow-*`, and credentials.
5. [Tokens, Cookies & Storage Security](./005-tokens-cookies-and-storage-security.md) —
   `HttpOnly`/`Secure`/`SameSite` cookies, why `localStorage` tokens are XSS-exposed, CSRF.

## What's next

Phase 18 — Accessibility: the accessibility tree, ARIA, keyboard and focus management, and
building components everyone can use.
