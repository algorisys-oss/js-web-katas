---
id: "phase-11/005-streaming-responses"
title: "Streaming Responses"
phase: 11
sequence: 5
difficulty: "advanced"
tags: ["networking", "fetch", "streams"]
prerequisites: ["phase-11/004-error-handling-and-retries"]
estimated_minutes: 15
starter: ["js"]
network: true
---

## Concept

`response.json()` and `response.text()` are *conveniences*: they buffer the **entire** body
into memory before resolving. But a `Response` body is really a **`ReadableStream`** —
`response.body` — that you can consume **chunk by chunk** as bytes arrive over the network.
Streaming matters when the body is large (you can start processing before it all arrives),
when you want **download progress**, or when the server pushes data incrementally
(server-sent events, AI token streams).

You read a stream with a **reader**:

```js
const reader = response.body.getReader();
const { value, done } = await reader.read();
```

Each `read()` resolves to `{ value, done }`. While `done` is `false`, `value` is a
**`Uint8Array`** of raw bytes — *not* a string. To turn bytes into text you feed them
through a **`TextDecoder`**, calling `decoder.decode(chunk, { stream: true })` so a
multi-byte character split across two chunks is reassembled correctly. When `done` is
`true`, the stream is finished.

## Key Insight

> The response body is a stream of **byte** chunks, not text. Read it with `getReader()` in
> a loop until `done`, and decode each `Uint8Array` chunk through a `TextDecoder`.

## Experiment

```js
const response = await fetch('/fixtures/posts.json');
if (!response.ok) throw new Error(`HTTP ${response.status}`);

const reader = response.body.getReader();
const decoder = new TextDecoder();

let received = 0;
let chunkCount = 0;
let text = '';

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  chunkCount++;
  received += value.length;                 // value is a Uint8Array of bytes
  text += decoder.decode(value, { stream: true });
  console.log(`chunk ${chunkCount}: +${value.length} bytes (total ${received})`);
}
text += decoder.decode();                   // flush any buffered trailing bytes

const posts = JSON.parse(text);             // we accumulated the whole body ourselves
console.log(`done — ${chunkCount} chunk(s), ${received} bytes, ${posts.length} posts`);
console.log('first title:', posts[0].title);
```

## Expected Result

The **console** logs one line per chunk as bytes arrive, then a summary. For a small local
fixture the whole body usually arrives in a **single** chunk, so you'll typically see:

```
chunk 1: +<N> bytes (total <N>)
done — 1 chunk(s), <N> bytes, 5 posts
first title: Notes on the Analytical Engine
```

`<N>` is the byte length of `posts.json`. With a larger or slower body you would see several
`chunk N:` lines before `done`, and `received` would climb toward the total — that running
total is exactly how you'd drive a download-progress bar.

## Challenge

1. Turn `received` into a percentage: read `response.headers.get('content-length')` up
   front (the total byte count) and log `Math.round((received / total) * 100)` after each
   chunk. When is `content-length` missing (hint: chunked transfer / compression)?
2. Decode incrementally for display: instead of accumulating `text`, append each decoded
   chunk to a DOM node so the user sees output stream in. Why is the `{ stream: true }`
   option essential when decoding piece by piece?
3. Use the body as an **async iterable** where supported: `for await (const chunk of
   response.body) { ... }`. Compare it to the manual `getReader()` loop — what does the
   reader give you that the `for await` form doesn't (hint: `reader.cancel()`)?

## Deep Dive

Streams are part of the [WHATWG Streams Standard](https://streams.spec.whatwg.org/) and
compose with `pipeThrough`/`pipeTo`. The browser even ships built-in transform streams:
`response.body.pipeThrough(new TextDecoderStream())` decodes bytes to text without a manual
loop, and `DecompressionStream` can gunzip on the fly. A reader **locks** the stream while
you hold it — you must `reader.releaseLock()` (or let it finish) before anyone else can
read, and you can call `reader.cancel()` to stop early and free the connection. This same
machinery powers `EventSource`-style token streaming from AI and chat backends, where each
chunk is a piece of a longer, still-arriving message.

## Common Mistakes

- Treating a chunk as a string. `value` is a `Uint8Array`; you must decode it with a
  `TextDecoder` before it's text.
- Decoding each chunk with a fresh `new TextDecoder().decode(value)` (no `stream: true`).
  A multi-byte character split across chunks then gets corrupted (you'll see `�`).
- Forgetting that consuming `response.body` (via the reader) also consumes the body — you
  can't *also* call `response.json()` afterward. Pick one.
- Holding a reader and never releasing or finishing it, leaving the stream locked and the
  connection open.
