# TODO

Frontend / browser JavaScript katas. Backend lives in the sibling `nodejs-katas` project.
Phases are ordered bottom → top of the mental-model ladder (see `CLAUDE.md`).

## Infrastructure

- [ ] Initialize app shell (Vite + SolidJS + Tailwind)
- [ ] Kata markdown parser (frontmatter + sections, multi-tab starter)
- [ ] Sandboxed iframe runner (srcdoc builder + postMessage bridge)
- [ ] Console & error capture panel
- [ ] Live preview pane
- [ ] Multi-tab code editor (HTML / CSS / JS) with Reset
- [ ] Kata navigation (phase / sequence, prev / next)
- [ ] `fixtures/` for fetch katas
- [ ] Progress tracking (localStorage)

## Phase 0 — The Browser as a Runtime

- [ ] 001 — Browser JavaScript vs Node.js
- [ ] 002 — The JavaScript Engine & the Browser
- [ ] 003 — The Page Lifecycle (parse → DOMContentLoaded → load)
- [ ] 004 — The Rendering Pipeline Overview
- [ ] 005 — How Scripts Load (defer, async, modules)

## Phase 1 — JavaScript Language Core

- [ ] 001 — Types & Coercion
- [ ] 002 — Variables, Scope & Hoisting
- [ ] 003 — Equality & Truthiness
- [ ] 004 — Operators & Expressions
- [ ] 005 — Strict Mode & Common Footguns

## Phase 2 — Functions & Closures

- [ ] 001 — Function Declarations vs Expressions
- [ ] 002 — Closures
- [ ] 003 — The `this` Binding
- [ ] 004 — Higher-Order Functions
- [ ] 005 — Currying & Composition

## Phase 3 — Objects, Prototypes & Classes

- [ ] 001 — Objects & Property Descriptors
- [ ] 002 — The Prototype Chain
- [ ] 003 — Classes & Inheritance
- [ ] 004 — Getters, Setters & Proxy
- [ ] 005 — Immutability & Object Patterns

## Phase 4 — Arrays, Iteration & Data

- [ ] 001 — Array Methods (map / filter / reduce)
- [ ] 002 — Iterators & Generators
- [ ] 003 — Map, Set & WeakMap
- [ ] 004 — Destructuring & Spread
- [ ] 005 — JSON & Serialization

## Phase 5 — Asynchronous JavaScript

- [ ] 001 — The Event Loop in the Browser
- [ ] 002 — Microtasks vs Macrotasks
- [ ] 003 — Promises
- [ ] 004 — async / await
- [ ] 005 — Cancellation & AbortController

## Phase 6 — The DOM

- [ ] 001 — Selecting Elements
- [ ] 002 — Traversing the DOM Tree
- [ ] 003 — Creating & Inserting Nodes
- [ ] 004 — Attributes, Classes & Datasets
- [ ] 005 — DocumentFragment & Efficient Updates

## Phase 7 — Events & Interaction

- [ ] 001 — Event Listeners
- [ ] 002 — Event Propagation (Bubbling & Capturing)
- [ ] 003 — Event Delegation
- [ ] 004 — Custom Events
- [ ] 005 — Pointer, Keyboard & Touch Events

## Phase 8 — Forms & User Input

- [ ] 001 — Form Elements & Values
- [ ] 002 — The Constraint Validation API
- [ ] 003 — Controlled Input Patterns
- [ ] 004 — FormData & Submission
- [ ] 005 — Debouncing Input

## Phase 9 — Styling from JavaScript

- [ ] 001 — Reading & Writing Styles
- [ ] 002 — classList & CSS Variables
- [ ] 003 — Computed Styles & Layout Reads
- [ ] 004 — The Web Animations API
- [ ] 005 — Transitions & requestAnimationFrame

## Phase 10 — Browser & Web Platform APIs

- [ ] 001 — Location, History & the URL API
- [ ] 002 — Web Storage (local / session)
- [ ] 003 — Timers & Scheduling
- [ ] 004 — Observers (Intersection, Mutation, Resize)
- [ ] 005 — Clipboard, Geolocation & Notifications

## Phase 11 — Networking & Data Fetching

- [ ] 001 — The Fetch API
- [ ] 002 — Working with JSON APIs
- [ ] 003 — Request, Response & Headers
- [ ] 004 — Error Handling & Retries
- [ ] 005 — Streaming Responses

## Phase 12 — Rendering & Performance

- [ ] 001 — Reflow & Repaint
- [ ] 002 — Avoiding Layout Thrashing
- [ ] 003 — Debounce & Throttle
- [ ] 004 — Virtualizing Long Lists
- [ ] 005 — Measuring with the Performance API

## Phase 13 — Modules & Tooling

- [ ] 001 — ES Modules
- [ ] 002 — Dynamic Imports & Code Splitting
- [ ] 003 — Module Patterns & Encapsulation
- [ ] 004 — Bundlers & the Build Step (conceptual)
- [ ] 005 — Polyfills & Feature Detection

## Phase 14 — Web Components

- [ ] 001 — Custom Elements
- [ ] 002 — Shadow DOM
- [ ] 003 — Templates & Slots
- [ ] 004 — Lifecycle Callbacks
- [ ] 005 — Building a Reusable Component

## Phase 15 — Graphics & Media

- [ ] 001 — Canvas 2D Basics
- [ ] 002 — Animation Loops on Canvas
- [ ] 003 — SVG from JavaScript
- [ ] 004 — Images & Media Elements
- [ ] 005 — Intro to WebGL (conceptual)

## Phase 16 — Storage & Offline

- [ ] 001 — IndexedDB Basics
- [ ] 002 — The Cache API
- [ ] 003 — Service Worker Lifecycle
- [ ] 004 — Offline-First Patterns
- [ ] 005 — Building a Simple PWA

## Phase 17 — Frontend Security

- [ ] 001 — Cross-Site Scripting (XSS)
- [ ] 002 — Sanitization & Safe DOM APIs
- [ ] 003 — Content Security Policy
- [ ] 004 — CORS from the Browser Side
- [ ] 005 — Tokens, Cookies & Storage Security

## Phase 18 — Accessibility

- [ ] 001 — Semantic HTML & the Accessibility Tree
- [ ] 002 — ARIA Roles & Attributes
- [ ] 003 — Keyboard Navigation & Focus Management
- [ ] 004 — Live Regions & Announcements
- [ ] 005 — Accessible Components

## Phase 19 — Testing Frontend JavaScript

- [ ] 001 — Unit Testing Logic
- [ ] 002 — Testing DOM Interactions
- [ ] 003 — Mocking Fetch & Timers
- [ ] 004 — Testing Async Code
- [ ] 005 — End-to-End Testing (conceptual)

## Phase 20 — Application Architecture & State

- [ ] 001 — State Management Patterns
- [ ] 002 — The Observer / Pub-Sub Pattern
- [ ] 003 — Reactive State from Scratch
- [ ] 004 — Client-Side Routing
- [ ] 005 — Putting It Together: A Mini App
