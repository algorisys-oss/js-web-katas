---
id: "phase-20/004-client-side-routing"
title: "Client-Side Routing"
phase: 20
sequence: 4
difficulty: "advanced"
tags: ["architecture", "routing"]
prerequisites: ["phase-20/003-reactive-state-from-scratch"]
estimated_minutes: 16
starter: ["html", "js"]
network: false
---

## Concept

A single-page app (SPA) loads one HTML document and then *never reloads*. Yet users still
expect distinct URLs, a working Back button, and shareable links. A **client-side router**
delivers this: it watches the URL, maps it to a view, and swaps the page's content with
JavaScript instead of fetching a new document from the server.

There are two URL strategies in the browser. The **History API** (`history.pushState`,
`popstate`) gives clean paths like `/about`, but it requires the server to return your app
for *every* path, and in a sandboxed `<iframe>` (where these katas run) navigation is
restricted — `pushState` may throw a `SecurityError`. The reliable, dependency-free
alternative is **hash routing**: everything after the `#` (`/index.html#/about`) is the
"route." Changing `location.hash` never triggers a server request, and the browser fires a
`hashchange` event you can listen for. The Back/Forward buttons work automatically because
each hash change is a real history entry.

The router itself is small: a table mapping route strings to render functions, a function
that reads `location.hash`, looks up the matching view, and writes it into an outlet
element. Wire that function to `hashchange` (and `load`, for the initial route) and you have
navigation with zero page reloads.

## Key Insight

> A client-side router maps the URL to a view and swaps content in place. In a sandbox,
> prefer **hash routing** (`location.hash` + the `hashchange` event) — it needs no server
> config and never reloads the page.

## Experiment

```html
<nav>
  <a href="#/">Home</a> |
  <a href="#/about">About</a> |
  <a href="#/users/42">User 42</a> |
  <a href="#/nope">Broken link</a>
</nav>
<main id="outlet">Loading…</main>
```

```js
const outlet = document.getElementById('outlet');

// Route table: pattern → view function. Views return HTML strings.
const routes = {
  '/':       () => `<h1>Home</h1><p>Welcome to the SPA.</p>`,
  '/about':  () => `<h1>About</h1><p>No page reloads happen here.</p>`,
  '/users/:id': (params) => `<h1>User ${params.id}</h1><p>Dynamic segment.</p>`,
};

function matchRoute(path) {
  for (const pattern of Object.keys(routes)) {
    const names = [];
    const regex = new RegExp(
      '^' + pattern.replace(/:([^/]+)/g, (_, n) => (names.push(n), '([^/]+)')) + '$'
    );
    const m = path.match(regex);
    if (m) {
      const params = Object.fromEntries(names.map((n, i) => [n, m[i + 1]]));
      return { view: routes[pattern], params };
    }
  }
  return null;
}

function render() {
  // location.hash is like "#/about"; strip the "#" to get the route path.
  const path = location.hash.slice(1) || '/';
  const matched = matchRoute(path);
  outlet.innerHTML = matched
    ? matched.view(matched.params)
    : `<h1>404</h1><p>No route for <code>${path}</code>.</p>`;
  console.log('navigated to', path, matched ? '(matched)' : '(404)');
}

// hashchange fires on every #-navigation; load handles the first render.
window.addEventListener('hashchange', render);
window.addEventListener('load', render);
render(); // immediate first paint in case load already fired
```

## Expected Result

The **preview** shows a nav bar and a Home view. Clicking the links swaps the `<main>`
content with **no page reload**: **About** shows its text, **User 42** shows "User 42"
(extracted from the dynamic `:id` segment), and **Broken link** shows a 404 view. The
browser's Back/Forward buttons move between visited routes. The **console** logs each
navigation, e.g. `navigated to /users/42 (matched)`.

## Challenge

1. Add a `navigate(path)` helper that sets `location.hash = path` programmatically, and call
   it from a button (not an `<a>`). Confirm it produces a real history entry you can go Back
   from.
2. Add a fallback "layout": wrap every view in a persistent header/footer so only the inner
   content swaps. How does this start to resemble nested routes?
3. Try `history.pushState({}, '', '/about')` in the console and read the error. Explain why
   hash routing sidesteps the sandbox/server constraints that block path-based routing here.

## Deep Dive

Path-based routing with the History API is what production frameworks (React Router, Vue
Router, SolidJS Router) use, because clean URLs are better for users and SEO. It works
because `pushState` changes the URL *without* a navigation, and `popstate` fires on
Back/Forward — but the server must be configured to serve `index.html` for any unknown path
(a "rewrite to index"), or a hard refresh of `/about` 404s. Hash routing needs none of that:
the part after `#` was historically a same-page fragment anchor, so browsers never send it to
the server. That is exactly why it is the safe choice inside a sandboxed iframe. A real
router also handles scroll restoration, route guards (auth checks before rendering), lazy-
loaded route bundles (dynamic `import()`, Phase 13), and async data loading per route.

## Common Mistakes

- Using plain `<a href="/about">` (no `#`) in an SPA — it triggers a full server navigation
  and reloads the whole app, defeating the point.
- Forgetting the initial render on `load`/startup, so the app is blank until the user clicks
  a link or manually changes the hash.
- Injecting route params into `innerHTML` without escaping — a `:id` taken from the URL is
  user-controlled and is an XSS vector (Phase 17). Prefer `textContent` or escape it.
- Assuming `pushState` works everywhere; in restricted contexts it throws, and without
  server rewrites a deep-link refresh 404s.
