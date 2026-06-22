---
id: "phase-17/005-tokens-cookies-and-storage-security"
title: "Tokens, Cookies & Storage Security"
phase: 17
sequence: 5
difficulty: "advanced"
tags: ["security", "cookies", "storage", "csrf"]
prerequisites: ["phase-17/004-cors-from-the-browser"]
estimated_minutes: 14
starter: ["js"]
network: true
---

## Concept

Where you keep a session token decides which attacks can reach it. The browser offers a
few homes, each with a different threat model:

- **Cookies** — sent automatically with requests to their origin. The server controls
  their security via attributes:
  - **`HttpOnly`** — the cookie is invisible to `document.cookie`, so **XSS can't read
    it**. This is the single most important protection for a session token.
  - **`Secure`** — sent only over HTTPS.
  - **`SameSite=Lax|Strict`** — not sent on cross-site requests, the core defense against
    **CSRF** (a malicious site forging a request that rides your cookie).
- **`localStorage` / `sessionStorage`** — plain JS-readable key/value strings. Convenient,
  but **any XSS on your origin can read every token in them** — there is no `HttpOnly`
  equivalent. Storing access tokens here trades a cookie risk (CSRF) for a worse one
  (full token theft via XSS).

The takeaway: a session token belongs in an **`HttpOnly; Secure; SameSite` cookie** that
your JS never touches. If you must hold a token in JS (e.g. a short-lived access token for
a header-based API), keep it in **memory**, accept the tradeoff, and lean hard on the XSS
defenses from katas 001–003.

This kata needs `document.cookie`, which requires same-origin access — so `network: true`.

## Key Insight

> `HttpOnly` cookies are unreadable by JavaScript, so XSS can't steal them; `localStorage`
> tokens have no such shield. Put session tokens in `HttpOnly; Secure; SameSite` cookies,
> not in `localStorage`.

## Experiment

```js
// This iframe has same-origin access (network: true), so document.cookie works.

// A NON-HttpOnly cookie set from JS — readable, to make the point visible.
document.cookie = 'pref_theme=dark; SameSite=Lax; Max-Age=3600';
console.log('document.cookie sees:', document.cookie);
console.log('→ JS can read this cookie because it is NOT HttpOnly.');

// HttpOnly cookies are set by the SERVER (Set-Cookie) and are INVISIBLE here.
// We can only describe the header the server would send:
console.log('\nA secure session cookie would be set by the server as:');
console.log("  Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict; Path=/");
console.log('  → document.cookie would NOT show it, so XSS could not read it.');

// Tokens in localStorage: convenient, but fully exposed to any XSS on this origin.
const fakeToken = { sub: 'user-42', exp: Date.now() + 60000 };
localStorage.setItem('access_token', JSON.stringify(fakeToken));
const read = JSON.parse(localStorage.getItem('access_token'));
console.warn('localStorage token is plainly readable by JS:', read.sub);
console.log('→ Any injected script could exfiltrate this. Prefer an HttpOnly cookie,');
console.log('  or keep short-lived access tokens in memory only (not persisted).');

localStorage.removeItem('access_token'); // don't leave secrets lying around
```

## Expected Result

The **console** shows `document.cookie` containing `pref_theme=dark` (a non-HttpOnly
cookie JS *can* read), then a note that a real `session` cookie set with `HttpOnly` would
**not** appear here. It then warns that the `localStorage` token is trivially readable by
JavaScript and is cleaned up. The lesson is the visible asymmetry: the cookie *can* be
hidden from JS; the `localStorage` value never can.

## Challenge

1. Set a second cookie with `SameSite=Strict` and one with `SameSite=Lax`. Look up which
   one is sent when a user clicks a link *to* your site from another site, and which CSRF
   scenarios each blocks.
2. Implement a small **CSRF token** pattern: generate a random value, store it in a
   readable cookie *and* echo it in a request header; explain how the server comparing the
   two ("double-submit") defeats a forged cross-site request.
3. Move the access token from `localStorage` into a module-scoped variable (in-memory
   only). What do you gain against XSS, and what do you lose on page refresh?

## Deep Dive

CSRF and XSS are opposite problems. **CSRF** exploits *automatic* cookie attachment: a
malicious page submits a form to your origin and the browser dutifully attaches the
session cookie, so the request looks authentic — the page never reads anything, it just
acts. Defenses are `SameSite` cookies, anti-CSRF tokens, and checking the `Origin`/`Referer`
header. **XSS** runs attacker code *on your origin*, which defeats `SameSite` (the request
is now genuinely same-site) and reads anything JS can reach — which is precisely why
`HttpOnly` matters and why `localStorage` for tokens is fragile. The modern pattern for SPAs
is a short-lived in-memory access token plus a long-lived **`HttpOnly; Secure; SameSite`
refresh cookie**, so a stolen page state expires fast and the durable secret is never in JS.

## Common Mistakes

- Storing JWTs or session tokens in `localStorage` "because it's easy." One XSS and every
  token is gone; there is no `HttpOnly` for Web Storage.
- Believing `SameSite` alone stops all CSRF. It blocks cross-*site* requests but not
  same-site ones, and not every browser/edge case — keep CSRF tokens for sensitive writes.
- Setting a session cookie without `Secure` and `HttpOnly`, leaving it readable by script
  or sendable over plain HTTP.
- Assuming `sessionStorage` is "more secure" than `localStorage`. It is just shorter-lived
  (per-tab); it is equally readable by any XSS while the tab is open.
