// Builds the full HTML document that runs inside the sandboxed preview iframe.
// A small bridge script (injected first) captures console output and uncaught
// errors and forwards them to the parent shell via postMessage, tagged with a
// shared token so the shell can ignore unrelated messages.

export const RUNNER_TOKEN = 'js-web-katas-runner';

function bridgeScript(token, base) {
  return `<script>(function(){
  var TOKEN = ${JSON.stringify(token)};
  var BASE = ${JSON.stringify(base)};
  // Fetch katas request '/fixtures/...'. Under a project-site base path
  // (e.g. GitHub Pages '/js-web-katas/') that absolute root path would 404, so
  // rewrite a leading '/fixtures/' to the app's actual base.
  if (BASE && BASE !== '/') {
    var nativeFetch = window.fetch.bind(window);
    window.fetch = function(input, init){
      if (typeof input === 'string' && input.indexOf('/fixtures/') === 0) {
        input = BASE.replace(/\\/$/, '') + input;
      }
      return nativeFetch(input, init);
    };
  }
  function format(value){
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.name + ': ' + value.message;
    try { return JSON.stringify(value); } catch (e) { return String(value); }
  }
  function send(type, level, args){
    try {
      parent.postMessage({
        __katas: TOKEN,
        type: type,
        level: level,
        text: Array.prototype.map.call(args, format).join(' ')
      }, '*');
    } catch (e) {}
  }
  ['log','info','warn','error','debug'].forEach(function(method){
    var original = console[method];
    console[method] = function(){
      send('console', method, arguments);
      if (original) original.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e){
    send('error', 'error', [e.message + ' (line ' + e.lineno + ')']);
  });
  window.addEventListener('unhandledrejection', function(e){
    var reason = e.reason && e.reason.message ? e.reason.message : e.reason;
    send('error', 'error', ['Unhandled promise rejection: ' + reason]);
  });
})();<\/script>`;
}

export function buildSrcdoc({ html = '', css = '', js = '', token = RUNNER_TOKEN, base = '/' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${bridgeScript(token, base)}
<style>
body { font-family: system-ui, sans-serif; margin: 1rem; color: #111; }
${css}
</style>
</head>
<body>
${html}
<script type="module">
${js}
<\/script>
</body>
</html>`;
}
