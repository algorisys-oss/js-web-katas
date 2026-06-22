import { onMount, onCleanup, createSignal, createEffect, untrack } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const LANGUAGE = {
  html: () => html(),
  css: () => css(),
  js: () => javascript(),
};

const TAB_LABEL = { html: 'HTML', css: 'CSS', js: 'JS' };

/**
 * Multi-tab CodeMirror editor.
 *
 * props:
 *  - tabs:    array of active tab keys (subset of html/css/js)
 *  - code:    store object { html, css, js }
 *  - onChange(tab, value)
 *  - onRun()
 *  - reloadTrigger(): accessor; bump it to reload the editor from `code`
 *    (used by Reset and when switching kata)
 */
export default function CodeEditor(props) {
  const [active, setActive] = createSignal(props.tabs[0] || 'js');
  let host;
  let view;
  const language = new Compartment();

  const runKeymap = keymap.of([
    {
      key: 'Mod-Enter',
      run: () => {
        props.onRun?.();
        return true;
      },
    },
  ]);

  onMount(() => {
    const tab = active();
    view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: untrack(() => props.code[tab] ?? ''),
        extensions: [
          basicSetup,
          runKeymap,
          language.of(LANGUAGE[tab]()),
          oneDark,
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              props.onChange?.(active(), update.state.doc.toString());
            }
          }),
        ],
      }),
    });
  });

  // Reload the document when the tab changes or a reload is triggered.
  createEffect(() => {
    const tab = active();
    props.reloadTrigger?.(); // track external reloads (Reset / kata switch)
    if (!view) return;
    const next = untrack(() => props.code[tab] ?? '');
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: next },
      effects: language.reconfigure(LANGUAGE[tab]()),
    });
  });

  // If the active tab disappears (kata switch changes the tab set), reset it.
  createEffect(() => {
    if (!props.tabs.includes(untrack(active))) {
      setActive(props.tabs[0] || 'js');
    }
  });

  onCleanup(() => view?.destroy());

  return (
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 items-center gap-1 border-b border-slate-800 bg-slate-900 px-2">
        <For each={props.tabs}>
          {(tab) => (
            <button
              type="button"
              onClick={() => setActive(tab)}
              class={`px-3 py-1.5 text-xs font-medium transition-colors ${
                active() === tab
                  ? 'border-b-2 border-indigo-400 text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {TAB_LABEL[tab] || tab}
            </button>
          )}
        </For>
      </div>
      <div ref={host} class="min-h-0 flex-1 overflow-auto" />
    </div>
  );
}
