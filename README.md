# js-web-katas

Interactive, kata-driven katas for **frontend / browser JavaScript** — the language core,
the DOM, the event loop, the rendering pipeline, and the web platform APIs.

This is the **browser-side** companion to [`nodejs-katas`](../nodejs-katas) (which covers
backend/Node.js). Everything here runs **client-side**: kata code executes in a sandboxed
`<iframe>` with a live preview and a console panel — no backend required.

> **No frameworks as the subject.** You learn the platform itself. Frameworks are named for
> context in later phases, never used to teach a fundamental.

## What you'll learn

21 phases, ~105 katas, ordered bottom → top of the browser mental-model ladder:

1. The Browser as a Runtime
2. JavaScript Language Core
3. Functions & Closures
4. Objects, Prototypes & Classes
5. Arrays, Iteration & Data
6. Asynchronous JavaScript
7. The DOM
8. Events & Interaction
9. Forms & User Input
10. Styling from JavaScript
11. Browser & Web Platform APIs
12. Networking & Data Fetching
13. Rendering & Performance
14. Modules & Tooling
15. Web Components
16. Graphics & Media
17. Storage & Offline (PWA)
18. Frontend Security
19. Accessibility
20. Testing Frontend JavaScript
21. Architecture & State

See [`TODO.md`](./TODO.md) for the full per-kata checklist and
[`CLAUDE.md`](./CLAUDE.md) for the teaching contract and kata format.

## Structure

```
katas/        Markdown kata content (phase-XX-name/NNN-title.md)
app/          SolidJS + Tailwind shell (editor, preview, console, nav)
fixtures/     Static JSON used by fetch katas
```

## License

MIT
