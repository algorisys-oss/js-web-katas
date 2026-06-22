# Phase 11 — Networking & Data Fetching

**Ladder rung:** 8 — Networking & Data (fetch, HTTP).

## Goal

Learn to talk to the network the way the browser platform intends — with the **Fetch API**,
`Request`/`Response`/`Headers` objects, and readable streams. By the end of this phase you
can make a request, tell a real success from an HTTP error, parse JSON safely, inspect and
build headers, recover from transient failures with retry-and-backoff, and consume a
response body as a stream of chunks.

## Why it matters

Almost every app is a thin client over HTTP. The bugs are predictable: "why didn't my
`catch` catch the 404," "why did `.json()` throw," "why can't I read that header," "why does
my retry loop hammer the server." Each traces back to a fuzzy model of what `fetch` actually
resolves and rejects on. Build that model once and every data-loading feature gets simpler.

## Katas

1. [The Fetch API](./001-the-fetch-api.md) — `fetch` resolves to a `Response`; check
   `response.ok` and `status`. A `404` is *not* a rejection.
2. [Working with JSON APIs](./002-working-with-json-apis.md) — `response.json()` is a second
   async step that can fail on its own; the body is single-use; fetch concurrently.
3. [Request, Response & Headers](./003-request-response-and-headers.md) — `Request`/
   `Response` as objects, and the case-insensitive `Headers` map (`get`/`has`/`set`).
4. [Error Handling & Retries](./004-error-handling-and-retries.md) — network errors vs HTTP
   errors, and a retry-with-exponential-backoff helper that only retries transient failures.
5. [Streaming Responses](./005-streaming-responses.md) — read `response.body` chunk by chunk
   with `getReader()` and decode bytes with `TextDecoder` (download progress, token streams).

## Fixtures

These katas fetch in-repo JSON served at `/fixtures/…` (no third-party endpoints, fully
offline). Every kata sets `network: true` so the sandboxed iframe shares the app's origin
and absolute paths like `/fixtures/users.json` resolve:

- `users.json` — array of 5 users (`id`, `name`, `username`, `email`, `role`, `active`).
- `posts.json` — array of 5 posts (`id`, `userId`, `title`, `body`, `tags`, `published`).
- `profile.json` — a single user-profile object with a nested `stats` block.

## What's next

Phase 12 — Rendering & Performance: reflow and repaint, layout thrashing, debounce and
throttle, list virtualization, and the Performance API.
