---
id: "phase-11/002-working-with-json-apis"
title: "Working with JSON APIs"
phase: 11
sequence: 2
difficulty: "intermediate"
tags: ["networking", "fetch", "json"]
prerequisites: ["phase-11/001-the-fetch-api"]
estimated_minutes: 13
starter: ["js"]
network: true
---

## Concept

Most web APIs speak **JSON**. A `Response` does not give you JSON automatically — it gives
you a body you must *read and parse*. The Fetch API offers several body readers, each
returning a **promise**:

- `response.json()` — read the body and parse it as JSON into a JS value.
- `response.text()` — read the body as a string (no parsing).
- `response.blob()` / `response.arrayBuffer()` — read as binary.

`response.json()` is essentially `JSON.parse(await response.text())`, so it **throws** if
the body is not valid JSON. That means JSON parsing failures show up as a *rejected
promise from `.json()`* — separate from network errors and from HTTP status errors. A
robust JSON fetch therefore has three distinct failure modes to think about: the network,
the HTTP status, and the parse.

A body can only be read **once**. If you need both the raw text and the parsed object,
read `.text()` and `JSON.parse` it yourself, or clone the response with `response.clone()`
before reading.

## Key Insight

> `response.json()` is a *second* async step that reads the whole body and parses it — and
> it can fail independently of the request. The body is single-use: read it once.

## Experiment

```js
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json(); // may reject if the body is not valid JSON
}

const [users, posts] = await Promise.all([
  getJson('/fixtures/users.json'),
  getJson('/fixtures/posts.json'),
]);

console.log('users:', users.length, '| posts:', posts.length);

// Join the two datasets, the way you would shape an API response for a UI:
const byId = new Map(users.map((u) => [u.id, u.name]));
for (const post of posts.filter((p) => p.published)) {
  console.log(`"${post.title}" — by ${byId.get(post.userId)}`);
}
```

## Expected Result

The **console** prints `users: 5 | posts: 5`, then one line per **published** post (4 of
the 5), each attributed to its author:

```
users: 5 | posts: 5
"Notes on the Analytical Engine" — by Ada Lovelace
"Compilers are just translators" — by Grace Hopper
"Checking the math by hand" — by Katherine Johnson
"Simplicity is a prerequisite for reliability" — by Edsger Dijkstra
```

(Post 3, "Loops and the imagination", is `published: false`, so it is filtered out.)

## Challenge

1. Add a third parallel fetch for `/fixtures/profile.json` (a single object, not an array).
   Log its `stats.followers`. Notice the shape differs — your code must not assume an array.
2. Read `/fixtures/users.json` with `response.text()` instead of `.json()`, then
   `JSON.parse` it yourself. Confirm you get the same result, and explain when reading text
   first is useful (hint: logging the raw body when parsing fails).
3. Call `await res.json()` **twice** on the same response and read the error. Then fix it
   with `res.clone()`.

## Deep Dive

`Promise.all` fires both requests **concurrently** and waits for both — far faster than two
sequential `await`s. But it is *all-or-nothing*: if either rejects, the combined promise
rejects. When you want every result regardless of individual failures, use
`Promise.allSettled`, which resolves to an array of `{ status, value | reason }` objects so
one bad endpoint can't sink the whole page. For paginated APIs you'll often loop fetches,
following a `next` URL or incrementing a `page` query parameter until the server signals the
last page.

## Common Mistakes

- Doing `fetch(url).json()` — `fetch` resolves to a `Response`, not the body. You must
  `await` the response first, then call `.json()` on it.
- Calling `.json()` on a non-2xx response without checking `ok`. An error page is often
  HTML, so `.json()` throws a confusing `SyntaxError` instead of your real status error.
- Reading the same body twice ("body stream already read"). Clone first if you need it
  twice.
- Awaiting requests **sequentially** when they are independent. Use `Promise.all` to run
  them concurrently.
