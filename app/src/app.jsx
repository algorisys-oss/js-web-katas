import { createSignal, Show } from 'solid-js';
import { loadPhases } from './content/kata-loader.js';
import PhaseNav from './components/phase-nav.jsx';
import KataView from './components/kata-view.jsx';

export default function App() {
  const phases = loadPhases();
  const firstKata = phases[0]?.katas[0] ?? null;
  const [selected, setSelected] = createSignal(firstKata);

  return (
    <div class="grid h-full grid-cols-[260px_1fr]">
      <aside class="min-h-0 border-r border-slate-800">
        <PhaseNav phases={phases} selected={selected()} onSelect={setSelected} />
      </aside>
      <main class="min-h-0">
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
      </main>
    </div>
  );
}
