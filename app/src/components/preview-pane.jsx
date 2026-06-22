/**
 * The sandboxed preview iframe. `allow-scripts` is always set so kata code can
 * run; `allow-same-origin` is added only for network katas so fetch() can reach
 * the app-served /fixtures. (Scripts + same-origin together is a sandbox escape
 * in general, but acceptable for a local, trusted learning playground.)
 *
 * props:
 *  - iframeRef(el): ref callback the parent uses to set `srcdoc`
 *  - network: boolean
 */
export default function PreviewPane(props) {
  const sandbox = () =>
    props.network ? 'allow-scripts allow-same-origin' : 'allow-scripts';

  return (
    <iframe
      ref={props.iframeRef}
      sandbox={sandbox()}
      title="Kata preview"
      class="h-full w-full border-0 bg-white"
    />
  );
}
