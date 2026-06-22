# TODO

Frontend / browser JavaScript katas. Backend lives in the sibling `nodejs-katas` project.
Phases are ordered bottom → top of the mental-model ladder (see `CLAUDE.md`).

## Infrastructure

- [x] Initialize app shell (Vite + SolidJS + Tailwind)
- [x] Kata markdown parser (frontmatter + sections, multi-tab starter)
- [x] Sandboxed iframe runner (srcdoc builder + postMessage bridge)
- [x] Console & error capture panel
- [x] Live preview pane
- [x] Multi-tab code editor (HTML / CSS / JS, CodeMirror 6) with Reset
- [x] Kata navigation (phase / sequence, collapsible sidebar)
- [x] `app/public/fixtures/` for fetch katas
- [ ] Prev / next kata navigation buttons
- [ ] Progress tracking (localStorage)

## Phase 0 — The Browser as a Runtime

- [x] 001 — Browser JavaScript vs Node.js
- [x] 002 — The JavaScript Engine & the Browser
- [x] 003 — The Page Lifecycle (parse → DOMContentLoaded → load)
- [x] 004 — The Rendering Pipeline Overview
- [x] 005 — How Scripts Load (defer, async, modules)

## Phase 1 — JavaScript Language Core

- [x] 001 — Types & Coercion
- [x] 002 — Variables, Scope & Hoisting
- [x] 003 — Equality & Truthiness
- [x] 004 — Operators & Expressions
- [x] 005 — Strict Mode & Common Footguns

## Phase 2 — Functions & Closures

- [x] 001 — Function Declarations vs Expressions
- [x] 002 — Closures
- [x] 003 — The `this` Binding
- [x] 004 — Higher-Order Functions
- [x] 005 — Currying & Composition

## Phase 3 — Objects, Prototypes & Classes

- [x] 001 — Objects & Property Descriptors
- [x] 002 — The Prototype Chain
- [x] 003 — Classes & Inheritance
- [x] 004 — Getters, Setters & Proxy
- [x] 005 — Immutability & Object Patterns

## Phase 4 — Arrays, Iteration & Data

- [x] 001 — Array Methods (map / filter / reduce)
- [x] 002 — Iterators & Generators
- [x] 003 — Map, Set & WeakMap
- [x] 004 — Destructuring & Spread
- [x] 005 — JSON & Serialization

## Phase 5 — Asynchronous JavaScript

- [x] 001 — The Event Loop in the Browser
- [x] 002 — Microtasks vs Macrotasks
- [x] 003 — Promises
- [x] 004 — async / await
- [x] 005 — Cancellation & AbortController

## Phase 6 — The DOM

- [x] 001 — Selecting Elements
- [x] 002 — Traversing the DOM Tree
- [x] 003 — Creating & Inserting Nodes
- [x] 004 — Attributes, Classes & Datasets
- [x] 005 — DocumentFragment & Efficient Updates

## Phase 7 — Events & Interaction

- [x] 001 — Event Listeners
- [x] 002 — Event Propagation (Bubbling & Capturing)
- [x] 003 — Event Delegation
- [x] 004 — Custom Events
- [x] 005 — Pointer, Keyboard & Touch Events

## Phase 8 — Forms & User Input

- [x] 001 — Form Elements & Values
- [x] 002 — The Constraint Validation API
- [x] 003 — Controlled Input Patterns
- [x] 004 — FormData & Submission
- [x] 005 — Debouncing Input

## Phase 9 — Styling from JavaScript

- [x] 001 — Reading & Writing Styles
- [x] 002 — classList & CSS Variables
- [x] 003 — Computed Styles & Layout Reads
- [x] 004 — The Web Animations API
- [x] 005 — Transitions & requestAnimationFrame

## Phase 10 — Browser & Web Platform APIs

- [x] 001 — Location, History & the URL API
- [x] 002 — Web Storage (local / session)
- [x] 003 — Timers & Scheduling
- [x] 004 — Observers (Intersection, Mutation, Resize)
- [x] 005 — Clipboard, Geolocation & Notifications

## Phase 11 — Networking & Data Fetching

- [x] 001 — The Fetch API
- [x] 002 — Working with JSON APIs
- [x] 003 — Request, Response & Headers
- [x] 004 — Error Handling & Retries
- [x] 005 — Streaming Responses

## Phase 12 — Rendering & Performance

- [x] 001 — Reflow & Repaint
- [x] 002 — Avoiding Layout Thrashing
- [x] 003 — Debounce & Throttle
- [x] 004 — Virtualizing Long Lists
- [x] 005 — Measuring with the Performance API

## Phase 13 — Modules & Tooling

- [x] 001 — ES Modules
- [x] 002 — Dynamic Imports & Code Splitting
- [x] 003 — Module Patterns & Encapsulation
- [x] 004 — Bundlers & the Build Step (conceptual)
- [x] 005 — Polyfills & Feature Detection

## Phase 14 — Web Components

- [x] 001 — Custom Elements
- [x] 002 — Shadow DOM
- [x] 003 — Templates & Slots
- [x] 004 — Lifecycle Callbacks
- [x] 005 — Building a Reusable Component

## Phase 15 — Graphics & Media

- [x] 001 — Canvas 2D Basics
- [x] 002 — Animation Loops on Canvas
- [x] 003 — SVG from JavaScript
- [x] 004 — Images & Media Elements
- [x] 005 — Intro to WebGL (conceptual)

## Phase 16 — Storage & Offline

- [x] 001 — IndexedDB Basics
- [x] 002 — The Cache API
- [x] 003 — Service Worker Lifecycle
- [x] 004 — Offline-First Patterns
- [x] 005 — Building a Simple PWA

## Phase 17 — Frontend Security

- [x] 001 — Cross-Site Scripting (XSS)
- [x] 002 — Sanitization & Safe DOM APIs
- [x] 003 — Content Security Policy
- [x] 004 — CORS from the Browser Side
- [x] 005 — Tokens, Cookies & Storage Security

## Phase 18 — Accessibility

- [x] 001 — Semantic HTML & the Accessibility Tree
- [x] 002 — ARIA Roles & Attributes
- [x] 003 — Keyboard Navigation & Focus Management
- [x] 004 — Live Regions & Announcements
- [x] 005 — Accessible Components

## Phase 19 — Testing Frontend JavaScript

- [x] 001 — Unit Testing Logic
- [x] 002 — Testing DOM Interactions
- [x] 003 — Mocking Fetch & Timers
- [x] 004 — Testing Async Code
- [x] 005 — End-to-End Testing (conceptual)

## Phase 20 — Application Architecture & State

- [x] 001 — State Management Patterns
- [x] 002 — The Observer / Pub-Sub Pattern
- [x] 003 — Reactive State from Scratch
- [x] 004 — Client-Side Routing
- [x] 005 — Putting It Together: A Mini App
