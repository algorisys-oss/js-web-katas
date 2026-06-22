import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import CodeEditor from './code-editor.jsx';
import PreviewPane from './preview-pane.jsx';
import ConsolePanel from './console-panel.jsx';
import { buildSrcdoc, RUNNER_TOKEN } from '../runner/build-srcdoc.js';

const DIFFICULTY_LABEL = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

function seed(kata) {
  return {
    html: kata.starter.html ?? '',
    css: kata.starter.css ?? '',
    js: kata.starter.js ?? '',
  };
}

/**
 * props:
 *  - kata: the parsed kata to display and run
 */
export default function KataView(props) {
  const [code, setCode] = createStore(seed(props.kata));
  const [logs, setLogs] = createSignal([]);
  const [reloadCount, setReloadCount] = createSignal(0);
  let iframeEl;

  // Re-seed editor + clear console whenever the selected kata changes.
  createEffect(() => {
    const fresh = seed(props.kata);
    setCode(fresh);
    setLogs([]);
    setReloadCount((n) => n + 1);
  });

  const onMessage = (event) => {
    const data = event.data;
    if (!data || data.__katas !== RUNNER_TOKEN) return;
    setLogs((prev) => [...prev, { level: data.level, text: data.text }]);
  };

  onMount(() => window.addEventListener('message', onMessage));
  onCleanup(() => window.removeEventListener('message', onMessage));

  const run = () => {
    setLogs([]);
    if (!iframeEl) return;
    iframeEl.srcdoc = buildSrcdoc({
      html: code.html,
      css: code.css,
      js: code.js,
      token: RUNNER_TOKEN,
    });
  };

  const reset = () => {
    setCode(seed(props.kata));
    setLogs([]);
    setReloadCount((n) => n + 1);
  };

  return (
    <div class="grid h-full grid-cols-1 lg:grid-cols-2">
      {/* Left: kata content */}
      <section class="min-h-0 overflow-auto border-r border-slate-800 bg-slate-900/40 px-6 py-5">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            Phase {String(props.kata.phase).padStart(2, '0')} ·{' '}
            {String(props.kata.sequence).padStart(3, '0')}
          </span>
          <span class="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
            {DIFFICULTY_LABEL[props.kata.difficulty] || props.kata.difficulty}
          </span>
          {props.kata.frontmatter.estimated_minutes && (
            <span class="text-[11px] text-slate-500">
              ~{props.kata.frontmatter.estimated_minutes} min
            </span>
          )}
        </div>
        <h2 class="mb-4 text-xl font-bold text-slate-100">{props.kata.title}</h2>
        <article class="prose-kata text-sm text-slate-300" innerHTML={props.kata.contentHtml} />
      </section>

      {/* Right: editor + preview + console */}
      <section class="flex min-h-0 flex-col">
        <div class="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Playground
          </span>
          <div class="flex gap-2">
            <button
              type="button"
              onClick={reset}
              class="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={run}
              class="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
            >
              ▶ Run
            </button>
          </div>
        </div>

        <div class="min-h-0 flex-1 border-b border-slate-800">
          <CodeEditor
            tabs={props.kata.tabs}
            code={code}
            onChange={(tab, value) => setCode(tab, value)}
            onRun={run}
            reloadTrigger={reloadCount}
          />
        </div>

        <div class="grid h-2/5 min-h-[200px] shrink-0 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
          <div class="min-h-0 border-b border-slate-800 lg:border-b-0 lg:border-r">
            <PreviewPane iframeRef={(el) => (iframeEl = el)} network={props.kata.network} />
          </div>
          <ConsolePanel logs={logs} onClear={() => setLogs([])} />
        </div>
      </section>
    </div>
  );
}
