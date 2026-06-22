---
id: "phase-17/003-content-security-policy"
title: "Content Security Policy"
phase: 17
sequence: 3
difficulty: "advanced"
tags: ["security", "csp", "xss"]
prerequisites: ["phase-17/002-sanitization-and-safe-dom"]
estimated_minutes: 13
starter: ["html", "js"]
network: false
---

## Concept

Sanitizing your sinks is the first line of defense; **Content Security Policy (CSP)** is
the second. CSP is an allowlist the *server* sends in a response header that tells the
browser which sources of script, style, image, and connection it is permitted to load and
execute. Even if an attacker injects a payload, CSP can stop the browser from running it —
**defense in depth**.

A policy is a list of directives, each naming allowed sources:

- **`default-src 'self'`** — fallback for everything; here, only your own origin.
- **`script-src 'self' https://cdn.example.com`** — where scripts may come from.
- **`'unsafe-inline'`** — allows inline `<script>…</script>` and `onclick=` handlers.
  Its presence largely defeats CSP's XSS protection, so a strong policy **omits** it.
- **`nonce-<random>`** — instead of `'unsafe-inline'`, mark trusted inline scripts with a
  per-response random `nonce` attribute; injected scripts won't have it and are blocked.
- **`'strict-dynamic'`**, **`object-src 'none'`**, **`base-uri 'self'`** — tighten common
  bypasses.

CSP's payoff against XSS: with `script-src 'self'` (no `'unsafe-inline'`), an injected
`<img onerror="...">` or inline `<script>` simply **does not execute** — the browser
refuses it and logs a violation.

## Key Insight

> CSP is a browser-enforced allowlist sent by the server. A strong `script-src` without
> `'unsafe-inline'` (using nonces/hashes instead) neutralizes injected scripts even when
> sanitization fails.

## Experiment

```html
<h2>Reading a CSP</h2>
<!-- A page CAN declare CSP via a meta tag (a subset of the header form): -->
<!-- <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' 'nonce-r4nd0m'; object-src 'none'"> -->
<pre id="out" class="box"></pre>
```

```js
// We can't set real response headers from inside this sandboxed iframe, so this kata
// EXPLAINS CSP and shows how to read/reason about a policy string.
const policy =
  "default-src 'self'; " +
  "script-src 'self' 'nonce-r4nd0m'; " +
  "img-src 'self' data:; " +
  "connect-src 'self' https://api.example.com; " +
  "object-src 'none'; base-uri 'self'; " +
  "report-uri /csp-report";

// Parse the policy into directive → allowed-sources for inspection.
const directives = Object.fromEntries(
  policy.split(';').map(s => s.trim()).filter(Boolean).map(part => {
    const [name, ...sources] = part.split(/\s+/);
    return [name, sources];
  })
);
console.log('Parsed CSP directives:');
for (const [name, sources] of Object.entries(directives)) {
  console.log(`  ${name}: ${sources.join(' ') || '(none)'}`);
}

// What this policy would block:
console.log("\nThis policy WOULD BLOCK:");
console.log("  • inline <script> / onerror= (no 'unsafe-inline', only the nonce passes)");
console.log("  • <object>/<embed> plugins (object-src 'none')");
console.log("  • a fetch() to evil.com (connect-src allows only self + api.example.com)");
document.getElementById('out').textContent = policy;
```

## Expected Result

The **console** prints each parsed directive with its allowed sources, then the list of
things this policy blocks. The **preview** shows the raw policy string. Nothing is actually
enforced here — the iframe can't set response headers — so treat this as a *reading and
reasoning* exercise: given a policy, you can now say what loads and what is refused.

## Challenge

1. Rewrite the policy to also allow scripts from `https://cdn.example.com` and images from
   `https://images.example.com`. Which two directives change?
2. A teammate adds `'unsafe-inline'` to `script-src` "to make a widget work." Explain, in
   terms of XSS, why this guts the policy — and what `nonce`/`'strict-dynamic'` offer
   instead.
3. Look up `Content-Security-Policy-Report-Only`. How would you roll out a strict policy on
   a live site *without* breaking it, using `report-uri`/`report-to` first?

## Deep Dive

The robust, header-only form looks like
`Content-Security-Policy: default-src 'self'; script-src 'nonce-{random}' 'strict-dynamic';
object-src 'none'; base-uri 'self'`. The `<meta http-equiv>` form works for static hosting
but supports only a subset (no `report-uri`, no `frame-ancestors`, and it can be bypassed
by markup that appears before the meta tag), so the header is preferred. Modern guidance
favors **nonce-based** policies with `'strict-dynamic'` over host allowlists, because long
allowlists almost always contain a JSONP or open-redirect endpoint that defeats them.
Pair CSP with `Trusted Types` (`require-trusted-types-for 'script'`) to force every DOM
sink through a vetted policy function — turning DOM-XSS into a compile-time-style error.

## Common Mistakes

- Adding `'unsafe-inline'` or `'unsafe-eval'` "to make something work," silently disabling
  the protection you deployed CSP for.
- Treating CSP as a *replacement* for sanitization. It is defense in depth; both layers
  matter, because a misconfigured policy or an allowlisted-but-compromised CDN can fail.
- Forgetting `object-src 'none'` and `base-uri 'self'` — classic bypasses via `<object>`
  and `<base href>` injection.
- Shipping a strict policy without a Report-Only trial first, then breaking the live site
  when a legitimate inline handler gets blocked.
