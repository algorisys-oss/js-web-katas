---
id: "phase-05/001-the-event-loop"
title: "The Event Loop in the Browser"
phase: 5
sequence: 1
difficulty: "intermediate"
tags: ["async", "event-loop"]
prerequisites: ["phase-04/005-json-and-serialization"]
estimated_minutes: 12
starter: ["js"]
network: false
---

## Concept

Your JavaScript runs on a **single thread**. There is exactly one **call stack**: when you
call a function it is pushed on; when it returns it is popped off. While anything is on the
stack, nothing else — no timer callback, no click handler, no rendering — can run.

So how does "later" work? The browser keeps a **task queue**. When you call a host API like
`setTimeout` or `fetch`, the *browser* (not the engine) does the waiting, and when it's
done it puts a callback into the queue. The **event loop** is the rule that ties this
together:

1. Run the current task (a chunk of synchronous JS) until the call stack is **empty**.
2. Then take the next task from the queue and run it to completion.
3. Repeat, forever.

The crucial consequence: a scheduled callback can only run **once the stack is clear**.
`setTimeout(fn, 0)` does not mean "run now" — it means "run after the current synchronous
code finishes and it's this task's turn." That is why long synchronous work freezes the
page: the loop can't pick up the next task until your function returns.

## Key Insight

> The event loop runs one task to completion before starting the next. Asynchronous code
> isn't "parallel" — it's just scheduled to run *after the call stack empties*.

## Experiment

```js
// One thread, one stack. Synchronous code runs first, to completion.
console.log('1 — synchronous (runs now)');

setTimeout(() => {
  console.log('4 — timeout task (runs after the stack is empty)');
}, 0);

// A normal function call is synchronous — it stays on the stack:
function work() {
  console.log('2 — also synchronous (still on the stack)');
}
work();

console.log('3 — last synchronous line');

// Nothing above scheduled "parallel" work. The setTimeout callback waits its turn.
```

## Expected Result

The console prints in this order:

```
1 — synchronous (runs now)
2 — also synchronous (still on the stack)
3 — last synchronous line
4 — timeout task (runs after the stack is empty)
```

Even with a `0` ms delay, the timeout callback (`4`) runs **last** — only after every
synchronous line has finished and the call stack is empty. The browser couldn't run it
sooner even if it wanted to; the single thread was busy.

## Challenge

1. Add a `while` loop that spins for ~2 seconds *before* the final `console.log`. Notice
   the timeout `4` is delayed even further — the loop hogs the only thread.
2. Schedule two `setTimeout(..., 0)` callbacks. They run in the order you queued them
   (FIFO). Confirm it.
3. In one sentence, explain why a `setTimeout(fn, 100)` may fire noticeably *later* than
   100 ms if the thread is busy when the timer expires.

## Deep Dive

The event loop also has a **rendering** opportunity between tasks: after a task finishes,
the browser may run style, layout, paint, and composite (Phase 0, kata 4) before picking
up the next task — but only if the stack is clear. This is why blocking the thread with a
long loop not only delays timers but also freezes scrolling and animation: rendering, like
every other "later," is just work the event loop can't reach until you return.

## Common Mistakes

- Reading `setTimeout(fn, 0)` as "run immediately." It runs after the current synchronous
  code *and* after the current task fully unwinds.
- Believing async callbacks run on another thread. They run on the **same** main thread,
  just later; only Web Workers get a separate thread.
- Expecting timer delays to be exact. The delay is a *minimum*; the callback waits for both
  the timer and a free thread.
</content>
