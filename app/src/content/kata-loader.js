import { parseKata } from './markdown.js';

// Eagerly import every kata markdown file at <repo>/katas as raw text.
// Phase README.md files are excluded below (they don't match the NNN- pattern).
const modules = import.meta.glob('../../../katas/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const PHASE_TITLES = {
  0: 'The Browser as a Runtime',
  1: 'JavaScript Language Core',
  2: 'Functions & Closures',
  3: 'Objects, Prototypes & Classes',
  4: 'Arrays, Iteration & Data',
  5: 'Asynchronous JavaScript',
  6: 'The DOM',
  7: 'Events & Interaction',
  8: 'Forms & User Input',
  9: 'Styling from JavaScript',
  10: 'Browser & Web Platform APIs',
  11: 'Networking & Data Fetching',
  12: 'Rendering & Performance',
  13: 'Modules & Tooling',
  14: 'Web Components',
  15: 'Graphics & Media',
  16: 'Storage & Offline',
  17: 'Frontend Security',
  18: 'Accessibility',
  19: 'Testing Frontend JavaScript',
  20: 'Architecture & State',
};

const katas = Object.entries(modules)
  .filter(([path]) => /\/\d{3}-[^/]+\.md$/.test(path)) // kata files only, not READMEs
  .map(([path, raw]) => parseKata(raw, path))
  .sort((a, b) => a.phase - b.phase || a.sequence - b.sequence);

/** Katas grouped into ordered phases for the navigation sidebar. */
export function loadPhases() {
  const byPhase = new Map();
  for (const kata of katas) {
    if (!byPhase.has(kata.phase)) {
      byPhase.set(kata.phase, {
        phase: kata.phase,
        title: PHASE_TITLES[kata.phase] || `Phase ${kata.phase}`,
        katas: [],
      });
    }
    byPhase.get(kata.phase).katas.push(kata);
  }
  return [...byPhase.values()].sort((a, b) => a.phase - b.phase);
}

export function allKatas() {
  return katas;
}
