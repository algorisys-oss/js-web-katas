---
id: "phase-18/004-live-regions-and-announcements"
title: "Live Regions & Announcements"
phase: 18
sequence: 4
difficulty: "intermediate"
tags: ["accessibility", "aria", "live-regions"]
prerequisites: ["phase-18/003-keyboard-navigation-and-focus"]
estimated_minutes: 12
starter: ["html", "js"]
network: false
---

## Concept

When content updates *without* a focus change — a "Saved" toast, a search-results count, a
form error, a chat message — a screen-reader user has no reason to be looking there and
hears nothing. **Live regions** solve this: they tell assistive tech to announce changes
to a region's text *automatically*, even though focus stays put.

You mark a region as live in two main ways:

- **`aria-live="polite"`** — announce the change *after* the user finishes what they're
  saying/reading. Use for status, counts, non-urgent updates. This is the default for
  **`role="status"`**.
- **`aria-live="assertive"`** — interrupt immediately. Reserve for errors and urgent
  alerts. This is the default for **`role="alert"`**.

The mechanism: the live region element must **already exist in the DOM** when the page
loads (so AT is watching it); then you change its **text content** and the new text is
announced. Adding a brand-new element that *contains* `aria-live` at the same moment you
fill it is unreliable — create the empty region first, populate it later.

The danger is **over-announcing**. A region that updates on every keystroke, or an
`assertive` alert for trivial news, becomes a firehose that drowns out real information.
Announce meaningful, settled changes — not noise.

## Key Insight

> A live region announces text changes without moving focus. The region must exist *first*,
> then you update its text. `polite` waits its turn; `assertive` interrupts — use it
> sparingly.

## Experiment

```html
<button id="save">Save</button>
<button id="break">Trigger error</button>

<!-- These regions exist up front and start EMPTY, so AT is already watching them. -->
<p id="status" role="status"></p>     <!-- role=status ⇒ polite -->
<p id="error"  role="alert"></p>      <!-- role=alert  ⇒ assertive -->
```

```js
const status = document.getElementById('status');
const error = document.getElementById('error');

document.getElementById('save').addEventListener('click', () => {
  error.textContent = '';                 // clear any prior error
  status.textContent = 'Saving…';
  // Simulate async work, then update the SAME existing region's text.
  setTimeout(() => {
    status.textContent = 'All changes saved';
    console.log('polite announcement:', status.textContent);
  }, 600);
});

document.getElementById('break').addEventListener('click', () => {
  status.textContent = '';
  error.textContent = 'Could not save — check your connection.';
  console.log('assertive announcement:', error.textContent);
});
```

## Expected Result

In the **preview**, clicking **Save** shows "Saving…" then "All changes saved"; clicking
**Trigger error** shows the error text. The **console** logs which kind of announcement
each path produces. Notice that **focus never moves** — you stay on the button you
clicked.

A screen reader, watching the pre-existing regions, speaks *"All changes saved"* politely
after the save (waiting if the user was mid-sentence), and interrupts with *"Could not
save — check your connection"* for the alert. We can't hear it in the playground, but the
two `role`s map directly to *polite* vs *assertive* announcement behavior. The key proof
is that the regions were in the DOM *before* we wrote to them.

## Challenge

1. Wire a search box that updates `role="status"` with "3 results" as the user types.
   Then add a debounce so it announces only after typing **pauses** — feel the difference
   between an announcement firehose and a calm one.
2. Move the error message into the same `role="status"` (polite) region and argue whether
   a failed save deserves `assertive` interruption or not.
3. Create the live region *and* its text in the same statement (e.g.
   `el.append(newDivWithAriaLive)`), then update it. Observe why announcement is flaky and
   fix it by inserting an empty region at load time.

## Deep Dive

Live-region announcements are computed from the **text difference** when the region's
subtree mutates, governed by `aria-live`, `aria-atomic` (announce the whole region vs just
the changed part), and `aria-relevant` (which mutation types matter). Because behavior
varies across screen reader + browser combinations, robust patterns keep the region in the
DOM from the start, change *text* (not visibility), and avoid rapid successive updates that
can be coalesced or dropped. The details are specified in
[ARIA live regions](https://www.w3.org/WAI/ARIA/apg/practices/live-regions/) in the APG.

## Common Mistakes

- Injecting a new element that already carries `aria-live` at the same moment you fill it —
  AT often misses it. Insert the empty region first, then update its text.
- Overusing `assertive`, interrupting the user for trivial updates. Default to `polite`;
  reserve `assertive`/`role="alert"` for genuine errors.
- Updating a live region on every keystroke or animation frame, producing an unintelligible
  stream. Announce settled, meaningful changes.
- Toggling the region's `display`/`hidden` instead of its text, or removing and re-adding
  it — many screen readers won't announce that as a change.
