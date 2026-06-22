import { For, Show } from 'solid-js';

const LEVEL_CLASS = {
  log: 'text-slate-200',
  info: 'text-sky-300',
  debug: 'text-slate-400',
  warn: 'text-amber-300',
  error: 'text-rose-400',
};

/**
 * props:
 *  - logs: accessor returning [{ level, text }]
 *  - onClear()
 */
export default function ConsolePanel(props) {
  return (
    <div class="flex h-full flex-col bg-slate-950">
      <div class="flex shrink-0 items-center justify-between border-b border-slate-800 px-3 py-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Console
        </span>
        <button
          type="button"
          onClick={() => props.onClear?.()}
          class="text-xs text-slate-500 hover:text-slate-300"
        >
          Clear
        </button>
      </div>
      <div class="min-h-0 flex-1 overflow-auto p-2 font-mono text-xs leading-relaxed">
        <Show
          when={props.logs().length}
          fallback={
            <p class="px-1 text-slate-600">
              Run the code (▶ Run or Ctrl/Cmd+Enter) to see output here.
            </p>
          }
        >
          <For each={props.logs()}>
            {(entry) => (
              <div class={`whitespace-pre-wrap px-1 ${LEVEL_CLASS[entry.level] || 'text-slate-200'}`}>
                {entry.text}
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}
