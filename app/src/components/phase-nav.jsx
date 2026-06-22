import { For, Show, createSignal } from 'solid-js';

const DIFFICULTY_DOT = {
  beginner: 'bg-emerald-400',
  intermediate: 'bg-amber-400',
  advanced: 'bg-rose-400',
};

function PhaseGroup(props) {
  const [open, setOpen] = createSignal(props.defaultOpen);
  return (
    <div class="border-b border-slate-800/60">
      <button
        type="button"
        onClick={() => setOpen(!open())}
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800/40"
      >
        <span class="w-7 shrink-0 text-slate-500">
          {String(props.phase.phase).padStart(2, '0')}
        </span>
        <span class="flex-1">{props.phase.title}</span>
        <span class="text-slate-600">{open() ? '−' : '+'}</span>
      </button>
      <Show when={open()}>
        <ul class="pb-1">
          <For each={props.phase.katas}>
            {(kata) => (
              <li>
                <button
                  type="button"
                  onClick={() => props.onSelect(kata)}
                  class={`flex w-full items-center gap-2 py-1.5 pl-12 pr-3 text-left text-xs transition-colors ${
                    props.selected?.path === kata.path
                      ? 'bg-indigo-500/15 text-indigo-200'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span
                    class={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      DIFFICULTY_DOT[kata.difficulty] || 'bg-slate-500'
                    }`}
                  />
                  <span class="truncate">
                    {String(kata.sequence).padStart(3, '0')} · {kata.title}
                  </span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}

/**
 * props:
 *  - phases: array of { phase, title, katas }
 *  - selected: current kata
 *  - onSelect(kata)
 */
export default function PhaseNav(props) {
  return (
    <nav class="flex h-full flex-col bg-slate-900">
      <div class="shrink-0 border-b border-slate-800 px-3 py-3">
        <h1 class="text-sm font-bold text-slate-100">js-web-katas</h1>
        <p class="text-[11px] text-slate-500">Frontend JavaScript, kata by kata</p>
      </div>
      <div class="min-h-0 flex-1 overflow-auto">
        <For each={props.phases}>
          {(phase) => (
            <PhaseGroup
              phase={phase}
              selected={props.selected}
              onSelect={props.onSelect}
              defaultOpen={props.selected?.phase === phase.phase}
            />
          )}
        </For>
      </div>
    </nav>
  );
}
