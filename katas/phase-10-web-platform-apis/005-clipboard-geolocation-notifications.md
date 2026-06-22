---
id: "phase-10/005-clipboard-geolocation-notifications"
title: "Clipboard, Geolocation & Notifications"
phase: 10
sequence: 5
difficulty: "intermediate"
tags: ["web-apis", "permissions", "feature-detection"]
prerequisites: ["phase-10/004-observers"]
estimated_minutes: 14
starter: ["html", "js"]
network: false
---

## Concept

Some web APIs touch the user's private world — their clipboard, their physical location,
their attention. The platform guards these behind two gates:

- **A user gesture.** Powerful APIs (especially the Clipboard API's write) only work when
  called from within a real interaction, like a `click` handler. Calling them on page load
  is rejected.
- **A permission prompt.** Geolocation and Notifications ask the user for consent, and the
  user can grant, deny, or have already decided. Your code must handle all outcomes.

Because of this, the professional pattern is **feature-detect, then call inside a gesture,
then handle every result**:

- **`navigator.clipboard`** — `writeText(str)` and `readText()` return promises.
- **`navigator.geolocation`** — `getCurrentPosition(success, error, options)`.
- **`Notification`** — `Notification.requestPermission()` then `new Notification(title)`.

Honest note: these are also gated by **secure context** and **iframe permissions**. In this
sandboxed playground they will likely be *blocked or denied*, and that is exactly what the
code below is built to detect and report clearly — failing loudly, never silently.

## Key Insight

> Privacy-sensitive APIs need a user gesture *and* permission. Always feature-detect, call
> from inside a `click`, and handle grant / deny / unsupported — never assume success.

## Experiment

```html
<button id="copy">Copy text to clipboard</button>
<button id="locate">Get my location</button>
<button id="notify">Show a notification</button>
<pre id="out">Click a button. Results (and any permission errors) show here.</pre>
```

```js
const out = document.getElementById('out');
const show = (msg) => {
  console.log(msg);
  out.textContent = msg;
};

// CLIPBOARD — needs a user gesture; the sandbox may block it.
document.getElementById('copy').addEventListener('click', async () => {
  if (!navigator.clipboard?.writeText) {
    show('Clipboard API not available in this context.');
    return;
  }
  try {
    await navigator.clipboard.writeText('Hello from the Clipboard API!');
    show('Copied! (try pasting somewhere)');
  } catch (err) {
    show('Clipboard write blocked: ' + err.name + ' — likely sandbox/permission.');
  }
});

// GEOLOCATION — prompts for permission; may be denied or unavailable in the sandbox.
document.getElementById('locate').addEventListener('click', () => {
  if (!('geolocation' in navigator)) {
    show('Geolocation not supported.');
    return;
  }
  show('Requesting location…');
  navigator.geolocation.getCurrentPosition(
    (pos) => show(`Location: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`),
    (err) => show('Geolocation failed: ' + err.message + ' (code ' + err.code + ').'),
    { timeout: 8000, enableHighAccuracy: false }
  );
});

// NOTIFICATIONS — must request permission first; sandboxed iframes usually deny it.
document.getElementById('notify').addEventListener('click', async () => {
  if (!('Notification' in window)) {
    show('Notification API not supported.');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Hello!', { body: 'Notification permission granted.' });
      show('Notification shown (permission granted).');
    } else {
      show('Notification permission: ' + permission + '.');
    }
  } catch (err) {
    show('Notification request blocked: ' + err.name + ' — likely sandbox.');
  }
});
```

## Expected Result

In the **preview**, three buttons render. Clicking each runs the matching API *from inside
the click handler* (the required user gesture) and writes the outcome to the `<pre>` and the
**console**.

Be honest about the sandbox: this playground's iframe typically **lacks the permissions and
secure-context grants** these APIs require, so you will most likely see messages like
`Clipboard write blocked: NotAllowedError`, `Geolocation failed: … (code 1)`, or
`Notification permission: denied`. **That is the lesson** — the code feature-detects and
reports the gate clearly instead of throwing or silently doing nothing. Run the same code
in a top-level page on `https://` (or `localhost`) and the prompts and success paths appear.

## Challenge

1. Add a `navigator.clipboard.readText()` "Paste" button. Notice reading is even more
   restricted than writing — what error or prompt do you get?
2. Use the **Permissions API** (`navigator.permissions.query({ name: 'geolocation' })`) to
   check the state (`granted`/`prompt`/`denied`) *before* prompting, and adjust your UI.
3. Wrap `getCurrentPosition` in a promise (`new Promise((resolve, reject) => …)`) so you can
   `await` it like the clipboard and notification calls.

## Deep Dive

These APIs encode a privacy principle: capability follows **consent plus context**. They
require a *secure context* (HTTPS or `localhost`), they require a *transient user
activation* (a recent real gesture) for the most sensitive operations, and within an
`<iframe>` they additionally require the embedder to delegate the capability via
**Permissions Policy** (e.g. `allow="geolocation; clipboard-write"`). The sandbox in this
playground grants none of that, which is why the denials you see here are correct behavior,
not bugs. Designing for the denied path — graceful fallbacks, clear messaging — is the real
skill; the happy path is the easy part.

## Common Mistakes

- Calling clipboard/geolocation/notification APIs on page load instead of inside a user
  gesture, then wondering why they're rejected.
- Assuming permission is granted and skipping the `error`/`denied` branch — half your users
  will deny or have denied already.
- Forgetting feature detection (`'geolocation' in navigator`, `navigator.clipboard?.`),
  which throws outright in unsupported or insecure contexts.
- Believing these work over plain `http://` — almost all require a secure context
  (HTTPS or `localhost`).
