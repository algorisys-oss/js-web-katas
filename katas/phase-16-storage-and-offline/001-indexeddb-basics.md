---
id: "phase-16/001-indexeddb-basics"
title: "IndexedDB Basics"
phase: 16
sequence: 1
difficulty: "intermediate"
tags: ["storage", "indexeddb"]
prerequisites: ["phase-15/005-intro-to-webgl"]
estimated_minutes: 15
starter: ["js"]
network: true
---

## Concept

`localStorage` holds strings, is synchronous, and tops out around 5 MB. When you need to
store **structured data** — objects, arrays, blobs, hundreds of records you can query —
the browser gives you **IndexedDB**: a transactional, asynchronous, key-value database that
lives entirely on the client.

The shape is unusual the first time you meet it, because the API predates promises and is
**event-based**. Every operation returns a *request* object; you listen for its `onsuccess`
and `onerror`. The core pieces:

- A **database** has a name and an integer **version**.
- You create **object stores** (think tables) and **indexes** only inside an
  `onupgradeneeded` event — triggered when you open a *new* version.
- All reads and writes happen inside a **transaction** scoped to one or more stores.

Because the raw API is verbose, the standard move is to **promisify** each request once and
then write clean `async/await` code on top.

## Key Insight

> IndexedDB is the browser's real database: asynchronous, transactional, and structured.
> Every operation is a *request* that fires `success`/`error` events — wrap those in
> promises and the rest is just `await`.

## Experiment

```js
// Promisify a single IDBRequest into a promise.
const promisify = (req) =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

// Open (or create) version 1 of the database.
function openDb() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('notes-db', 1);
    // Runs once, only when the version is new: define the schema here.
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}

(async () => {
  if (!('indexedDB' in window)) {
    console.log('IndexedDB is not available in this environment.');
    return;
  }

  const db = await openDb();
  console.log('Opened DB:', db.name, 'v' + db.version);

  // Write inside a readwrite transaction.
  const writeTx = db.transaction('notes', 'readwrite');
  const store = writeTx.objectStore('notes');
  store.put({ id: 1, text: 'Buy milk' });
  store.put({ id: 2, text: 'Learn IndexedDB' });
  store.put({ id: 3, text: 'Ship the PWA' });
  // A transaction is done when its `complete` event fires.
  await new Promise((res) => (writeTx.oncomplete = res));
  console.log('Wrote 3 notes');

  // Read back inside a readonly transaction.
  const readStore = db.transaction('notes', 'readonly').objectStore('notes');
  const one = await promisify(readStore.get(2));
  const all = await promisify(readStore.getAll());
  console.log('get(2):', one.text);
  console.log('getAll count:', all.length);
  console.log('all texts:', all.map((n) => n.text).join(', '));
})();
```

## Expected Result

Because this kata sets `network: true`, the iframe is same-origin and IndexedDB is
available. The **console** prints:

```
Opened DB: notes-db v1
Wrote 3 notes
get(2): Learn IndexedDB
getAll count: 3
all texts: Buy milk, Learn IndexedDB, Ship the PWA
```

If you re-run, `put` overwrites the same keys, so the count stays at 3. If IndexedDB is
somehow unavailable, the feature-detection branch logs the fallback message instead.

## Challenge

1. Bump the version to `2` and, in `onupgradeneeded`, call
   `store.createIndex('byText', 'text', { unique: false })`. Then query with
   `index('byText').get('Buy milk')`. Note that schema changes only happen on a version bump.
2. Use an `autoIncrement: true` store (no `keyPath`) and observe that `add()` returns the
   generated key. When would you prefer that over a natural key like `id`?
3. Open a cursor with `store.openCursor()` and iterate every record, logging each before
   calling `cursor.continue()`. Why is a cursor better than `getAll()` for huge stores?

## Deep Dive

IndexedDB transactions auto-commit: they stay open only as long as you keep issuing requests
inside the same microtask turn. `await`-ing a non-IDB promise (like a `fetch`) mid-transaction
lets the transaction commit and close underneath you, and the next request throws
`TransactionInactiveError`. So do all your IDB work synchronously within the transaction, then
`await` its `complete` event. For ergonomic apps, most developers use a thin wrapper such as
the tiny `idb` library — but it is *only* a promise wrapper over exactly this API.

## Common Mistakes

- Trying to create object stores or indexes outside `onupgradeneeded` — schema changes are
  only legal during a version upgrade.
- `await`-ing something unrelated in the middle of a transaction, letting it auto-commit and
  then throwing `TransactionInactiveError`.
- Forgetting IndexedDB is asynchronous and reading `request.result` before `onsuccess` fires.
- Assuming data persists forever — the browser may evict it under storage pressure unless you
  request persistent storage with `navigator.storage.persist()`.
