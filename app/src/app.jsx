import { createSignal, Show } from 'solid-js';
import { loadPhases } from './content/kata-loader.js';
import PhaseNav from './components/phase-nav.jsx';
import KataView from './components/kata-view.jsx';

// Update these if the repository moves.
const REPO_URL = 'https://github.com/algorisys/js-web-katas';
const ORG_URL = 'https://github.com/algorisys';

export default function App() {
  const phases = loadPhases();
  const firstKata = phases[0]?.katas[0] ?? null;
  const [selected, setSelected] = createSignal(firstKata);
  const [collapsed, setCollapsed] = createSignal(false);

  return (
    <div
      class="grid h-full transition-[grid-template-columns] duration-200 ease-in-out"
      style={{ 'grid-template-columns': collapsed() ? '0px 1fr' : '260px 1fr' }}
    >
      <aside class="min-h-0 overflow-hidden border-r border-slate-800">
        <PhaseNav
          phases={phases}
          selected={selected()}
          onSelect={setSelected}
          onCollapse={() => setCollapsed(true)}
        />
      </aside>

      <main class="flex min-h-0 flex-col">
        <div class="min-h-0 flex-1">
          <Show
            when={selected()}
            fallback={
              <div class="flex h-full items-center justify-center p-8 text-center text-slate-500">
                <div>
                  <p class="text-lg font-semibold text-slate-300">No katas found yet</p>
                  <p class="mt-1 text-sm">
                    Add kata markdown under <code class="text-slate-400">katas/phase-XX-…/</code>{' '}
                    and refresh.
                  </p>
                </div>
              </div>
            }
          >
            <KataView kata={selected()} />
          </Show>
        </div>

        <footer class="flex shrink-0 items-center justify-between gap-3 border-t border-slate-800 bg-slate-900 px-3 py-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed())}
            title={collapsed() ? 'Show sidebar' : 'Hide sidebar'}
            class="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800"
          >
            <span aria-hidden="true">{collapsed() ? '☰' : '⟨⟨'}</span>
            <span class="hidden sm:inline">{collapsed() ? 'Show sidebar' : 'Hide sidebar'}</span>
          </button>

          <p class="truncate text-[11px] text-slate-500">
            Developed by{' '}
            <a
              href={ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              class="text-slate-400 hover:text-slate-200"
            >
              Algorisys Open Source Team
            </a>
          </p>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex shrink-0 items-center gap-1.5 rounded border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-amber-400/60 hover:bg-slate-800 hover:text-amber-300"
          >
            <span aria-hidden="true">★</span>
            <span class="hidden sm:inline">Star on GitHub</span>
            <span class="sm:hidden">Star</span>
          </a>
        </footer>
      </main>
    </div>
  );
}
