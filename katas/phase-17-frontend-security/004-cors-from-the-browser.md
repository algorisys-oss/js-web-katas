---
id: "phase-17/004-cors-from-the-browser"
title: "CORS from the Browser Side"
phase: 17
sequence: 4
difficulty: "advanced"
tags: ["security", "cors", "networking"]
prerequisites: ["phase-17/003-content-security-policy"]
estimated_minutes: 13
starter: ["js"]
network: false
---

## Concept

The browser enforces the **same-origin policy (SOP)**: script on one *origin* (scheme +
host + port) cannot freely read responses from a *different* origin. This is what stops a
malicious page from reading your bank's API while you're logged in. **CORS**
(Cross-Origin Resource Sharing) is the controlled relaxation: the *server* opts in, with
response headers, to let specific other origins read its responses.

Crucially, CORS is enforced **by the browser, on the response**. Your `fetch` to another
origin is usually *sent*; the browser then checks the reply's headers and, if they don't
permit your origin, **hides the response from your JavaScript** (you get a network/CORS
error, not the data). CORS is not a server-side firewall — it protects *users*, not the
server's data.

Two request shapes:

- **Simple requests** — `GET`/`HEAD`/`POST` with only "safe" headers and a basic
  content type. Sent directly; the browser checks the response afterward.
- **Preflighted requests** — anything else (e.g. `PUT`/`DELETE`, custom headers,
  `Content-Type: application/json`) triggers an automatic **`OPTIONS`** preflight first,
  asking the server "may I send this?" via `Access-Control-Request-Method/Headers`. Only
  if the server approves does the real request go.

The server's answer is in headers like **`Access-Control-Allow-Origin`** (which origins),
**`Access-Control-Allow-Methods/Headers`**, and **`Access-Control-Allow-Credentials`**.

## Key Insight

> Same-origin policy blocks cross-origin *reads* by default; CORS lets a server opt in via
> response headers. The browser enforces it on the **response** — your request may go, but
> you can't read the reply unless `Access-Control-Allow-Origin` permits your origin.

## Experiment

```js
// This kata is OFFLINE, so we reason about CORS with code shapes rather than a real call.
// (A real cross-origin fetch to a server with no CORS headers would reject with a
//  TypeError: "Failed to fetch", and DevTools would show a CORS error — never the body.)

const myOrigin = 'https://app.example.com';

// Decide whether the browser would expose a response, given the server's headers.
function browserAllowsRead(responseHeaders, withCredentials) {
  const allowOrigin = responseHeaders['access-control-allow-origin'];
  const allowCreds = responseHeaders['access-control-allow-credentials'] === 'true';
  if (allowOrigin !== '*' && allowOrigin !== myOrigin) return 'BLOCKED: origin not allowed';
  if (withCredentials && allowOrigin === '*') return "BLOCKED: '*' is illegal with credentials";
  if (withCredentials && !allowCreds) return 'BLOCKED: credentials not allowed';
  return 'ALLOWED: JS can read the response body';
}

console.log(browserAllowsRead({}, false));
console.log(browserAllowsRead({ 'access-control-allow-origin': '*' }, false));
console.log(browserAllowsRead({ 'access-control-allow-origin': myOrigin }, false));
console.log(browserAllowsRead({ 'access-control-allow-origin': '*' }, true));
console.log(browserAllowsRead(
  { 'access-control-allow-origin': myOrigin, 'access-control-allow-credentials': 'true' }, true));

// Would this request be preflighted?
function needsPreflight({ method = 'GET', headers = {}, contentType = 'text/plain' }) {
  const simpleMethods = ['GET', 'HEAD', 'POST'];
  const simpleTypes = ['text/plain', 'multipart/form-data', 'application/x-www-form-urlencoded'];
  const customHeader = Object.keys(headers).some(h => !['accept', 'accept-language'].includes(h.toLowerCase()));
  return !simpleMethods.includes(method) || !simpleTypes.includes(contentType) || customHeader;
}
console.log('\nGET text/plain →', needsPreflight({}) ? 'PREFLIGHT' : 'simple');
console.log('POST application/json →',
  needsPreflight({ method: 'POST', contentType: 'application/json' }) ? 'PREFLIGHT' : 'simple');
console.log('DELETE with Authorization →',
  needsPreflight({ method: 'DELETE', headers: { authorization: 'Bearer x' } }) ? 'PREFLIGHT' : 'simple');
```

## Expected Result

The **console** prints the read decisions, in order:

```
BLOCKED: origin not allowed
ALLOWED: JS can read the response body
ALLOWED: JS can read the response body
BLOCKED: '*' is illegal with credentials
ALLOWED: JS can read the response body
```

then the preflight classifications: a plain `GET text/plain` is **simple**, while
`POST application/json` and `DELETE with Authorization` are **PREFLIGHT**. No network is
touched — this models the exact rules the browser applies.

## Challenge

1. A server returns `Access-Control-Allow-Origin: *` but you call `fetch(url, {
   credentials: 'include' })` and it fails. Using the model above, explain the rule that
   forbids wildcard-plus-credentials and how the server must respond instead.
2. Add an `Access-Control-Max-Age` concept: why does caching the preflight matter for a
   chatty API, and what does the browser cache?
3. Distinguish an **opaque** response (`mode: 'no-cors'`) from a CORS-enabled one. Why can
   you sometimes *send* a request and even display an image, yet never read the bytes?

## Deep Dive

SOP and CORS govern **reading** cross-origin responses, but some cross-origin *sends* have
always been allowed and are the basis of CSRF (next kata): a `<form>` or `<img>` can POST
or GET to any origin, carrying cookies, even though your script can't read the reply. That
asymmetry — "the request goes with credentials, but you can't read the answer" — is exactly
why CORS protects *confidentiality* (reads) while *cookies* + `SameSite` protect against
forged *writes*. Note too that CORS errors are deliberately vague to JS (`TypeError`,
no status) so a page can't probe internal services by origin; the real diagnosis lives in
the DevTools Network panel.

## Common Mistakes

- Thinking CORS is enforced on the server or "blocks the request." The request often goes;
  the browser blocks your script from *reading the response*.
- Trying to "fix CORS" in the frontend (custom headers, `mode: 'no-cors'`). Only the
  **server's** response headers can grant access; `no-cors` just gives you an unreadable
  opaque response.
- Pairing `Access-Control-Allow-Origin: *` with credentials — illegal; the browser blocks
  it. Echo the specific origin and send `Allow-Credentials: true` instead.
- Forgetting that `application/json` bodies and `Authorization` headers force a preflight,
  then being surprised by the extra `OPTIONS` request in the network log.
