---
id: "phase-04/005-json-and-serialization"
title: "JSON & Serialization"
phase: 4
sequence: 5
difficulty: "intermediate"
tags: ["json", "serialization"]
prerequisites: ["phase-04/004-destructuring-and-spread"]
estimated_minutes: 14
starter: ["js"]
network: false
---

## Concept

**JSON** is a text format — a string — and it's how data crosses every boundary in frontend
work: `fetch` responses, `localStorage`, `postMessage`, config files. JavaScript gives you
two built-ins:

- **`JSON.stringify(value)`** — turns a live JS value into a JSON **string**.
- **`JSON.parse(text)`** — turns a JSON string back into a live JS value.

The trap is that JS values are richer than JSON, so `stringify` **silently drops or
transforms** anything JSON can't represent. The rules are worth memorizing because they
cause real bugs:

- `undefined`, **functions**, and **symbols** are **omitted** from objects entirely, but
  become **`null`** when they appear in an **array** (arrays can't have holes in JSON).
- `NaN`, `Infinity`, and `-Infinity` serialize to **`null`**.
- A **`Date`** is converted to an **ISO string** (via its `toJSON` method) — and stays a
  string after `parse`; it does **not** round-trip back to a `Date`.
- **`BigInt`** **throws** a `TypeError` — it has no JSON representation.
- `Map`, `Set`, and other class instances lose their type: only **own enumerable** string
  properties survive, so a `Map` becomes `"{}"`.

## Key Insight

> `JSON.stringify` is lossy: `undefined`/functions vanish from objects (but turn into `null`
> in arrays), `NaN`/`Infinity` become `null`, `Date`s become strings, and `BigInt` throws.
> Round-tripping through JSON gives you data, never the original *types*.

## Experiment

```js
const data = {
  name: 'widget',
  count: 3,
  missing: undefined,        // dropped from objects
  compute: () => 42,         // functions dropped
  ratio: NaN,                // becomes null
  limit: Infinity,           // becomes null
  created: new Date('2026-01-01T00:00:00Z'), // becomes an ISO string
  tags: ['a', undefined, () => {}, 'b'],     // holes become null in arrays
};

const json = JSON.stringify(data);
console.log('serialized:', json);

const back = JSON.parse(json);
console.log('created is now a:', typeof back.created); // "string", not Date
console.log('tags round-tripped:', back.tags);

// Pretty-print with the third "space" argument (great for debugging).
console.log(JSON.stringify({ a: 1, b: { c: 2 } }, null, 2));

// A class instance loses its type — only own enumerable props survive.
console.log('Map serializes to:', JSON.stringify(new Map([['k', 'v']])));

// BigInt has no JSON form and throws.
try {
  JSON.stringify({ big: 10n });
} catch (err) {
  console.log('BigInt error:', err.name);
}
```

## Expected Result

The console prints:

```
serialized: {"name":"widget","count":3,"ratio":null,"limit":null,"created":"2026-01-01T00:00:00.000Z","tags":["a",null,null,"b"]}
created is now a: string
tags round-tripped: ["a", null, null, "b"]
{
  "a": 1,
  "b": {
    "c": 2
  }
}
Map serializes to: {}
BigInt error: TypeError
```

Notice `missing` and `compute` are **absent** from the object output, but `undefined` and the
function **inside the array** became `null` (positions must be preserved). The `Date` came
back as a string, and the `Map` serialized to `{}` because it has no own enumerable
properties.

## Challenge

1. Pass a **replacer** function as the second argument to `JSON.stringify` that converts every
   `Date` it sees to a custom `{ __date: <ms> }` shape, then write a **reviver** for
   `JSON.parse` that turns it back into a real `Date`. This is how you make `Date`s survive a
   round trip.
2. Give an object a `toJSON()` method and observe that `JSON.stringify` calls it and serializes
   *its* return value instead — the same hook `Date` uses.
3. Serialize an object that references itself (`obj.self = obj`) and read the
   "circular structure" error. Why can't JSON represent cycles?

## Deep Dive

`JSON.stringify` accepts a second **replacer** (a function called for every key/value, or an
allow-list array of keys to keep) and a third **space** argument for indentation; `JSON.parse`
accepts a **reviver** that post-processes every parsed value — together they let you customize
the format losslessly for your own types. Before reaching for them, know the standard escape
hatch for *cloning* (not transmitting): `structuredClone(value)` deep-copies across far more
types — `Date`, `Map`, `Set`, `ArrayBuffer`, typed arrays, even cycles — because it uses the
**structured clone algorithm** the platform already uses for `postMessage` and IndexedDB. Use
JSON when you need a **string** to send or store; use `structuredClone` when you just need a
deep copy in memory.

## Common Mistakes

- Assuming a `Date` survives `JSON.parse` — it comes back as a string; re-wrap it with
  `new Date(str)` or use a reviver.
- Storing a `Map`/`Set` in `localStorage` via `JSON.stringify` and getting `"{}"` back —
  convert to an array first (`[...map]`) and rebuild on read.
- Forgetting that `undefined` properties vanish, so a round-tripped object can be missing keys
  you expected to find.
- Calling `JSON.parse` on already-parsed data (e.g. a `fetch` response that you used
  `res.json()` on) — you'd be parsing an object as if it were a string, which throws.
