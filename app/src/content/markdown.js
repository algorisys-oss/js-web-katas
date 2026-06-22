import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

// Sections rendered in the left content panel, in display order.
// "Experiment" is intentionally excluded — its code seeds the editor instead.
const CONTENT_SECTIONS = [
  'Concept',
  'Key Insight',
  'Expected Result',
  'Challenge',
  'Deep Dive',
  'Common Mistakes',
];

/**
 * Parse a tiny, strict subset of YAML frontmatter — exactly the shape our kata
 * schema uses: `key: scalar`, inline JSON arrays (`["a", "b"]`), numbers and
 * booleans. No nesting. Keep kata frontmatter within this shape.
 */
function parseFrontmatter(raw) {
  const fm = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value === '') {
      fm[key] = '';
      continue;
    }
    if (value.startsWith('[')) {
      try {
        fm[key] = JSON.parse(value);
        continue;
      } catch {
        // fall through to scalar handling
      }
    }
    if (value === 'true' || value === 'false') {
      fm[key] = value === 'true';
      continue;
    }
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      fm[key] = Number(value);
      continue;
    }
    // strip surrounding quotes
    fm[key] = value.replace(/^["']|["']$/g, '');
  }
  return fm;
}

/** Split the markdown body into a map of `## Heading` -> content text. */
function splitSections(body) {
  const sections = {};
  const lines = body.split('\n');
  let current = null;
  let buffer = [];
  const flush = () => {
    if (current) sections[current] = buffer.join('\n').trim();
  };
  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      current = m[1];
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

/** Extract fenced code blocks from a section, keyed by language. */
function extractStarter(experiment) {
  const starter = {};
  if (!experiment) return starter;
  const re = /```(\w+)\n([\s\S]*?)```/g;
  let m;
  const langMap = { html: 'html', css: 'css', js: 'js', javascript: 'js' };
  while ((m = re.exec(experiment)) !== null) {
    const lang = langMap[m[1].toLowerCase()];
    if (!lang) continue;
    // first block per language wins
    if (!(lang in starter)) starter[lang] = m[2].replace(/\n$/, '');
  }
  return starter;
}

/**
 * Parse a raw kata markdown file into a structured object the shell can render
 * and run.
 */
export function parseKata(raw, path) {
  const fmMatch = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  const frontmatter = fmMatch ? parseFrontmatter(fmMatch[1]) : {};
  const body = fmMatch ? fmMatch[2] : raw;

  const sections = splitSections(body);
  const starter = extractStarter(sections.Experiment);

  const contentHtml = CONTENT_SECTIONS.filter((name) => sections[name])
    .map((name) => `<h2>${name}</h2>\n${marked.parse(sections[name])}`)
    .join('\n');

  const tabs =
    Array.isArray(frontmatter.starter) && frontmatter.starter.length
      ? frontmatter.starter
      : Object.keys(starter);

  return {
    path,
    frontmatter,
    title: frontmatter.title || path,
    phase: frontmatter.phase ?? 0,
    sequence: frontmatter.sequence ?? 0,
    difficulty: frontmatter.difficulty || 'beginner',
    network: Boolean(frontmatter.network),
    tabs: tabs.length ? tabs : ['js'],
    starter,
    contentHtml,
    sections,
  };
}
