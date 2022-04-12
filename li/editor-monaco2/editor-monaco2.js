import { LiElement, html, css } from '../../li.js';

const editorCSS = css`
    ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }            
    :host { position: relative; display: flex; width: 100%; overflow: hidden; height: 100%; }
`;

customElements.define('li-editor-monaco2', class LiMonaco2 extends LiElement {
    static get styles() { return [editorCSS, css``] }

    render() {
        return html`
            <iframe style="border: none; width: 100%; height: 100%;"></iframe>
        `
    }

    static get properties() {
        return {
            src: { type: String }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        requestAnimationFrame(() => {
            const iframe = this.$qs('iframe');
            iframe.srcdoc = this.srcdoc;
            setTimeout(() => (iframe.contentDocument || iframe.contentWindow).addEventListener("change", (e) => 
            {
                if (e.detail !== undefined)
                    this.src = e.detail;
                this.$update();
            }), 1000);
        })
    }

    get srcdoc() {
        return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Monaco editor no loader</title>
<link rel="stylesheet" data-name="vs/editor/editor.main" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/editor/editor.main.min.css">
<style>
html body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
}
</style>
</head>
<body>
<div id="container" style="height: 100vh; border:1px solid black;"></div>
<script>var require = { paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs' } }</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/loader.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/editor/editor.main.nls.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/editor/editor.main.js"></script>
<script>
const editor = monaco.editor.create(document.getElementById('container'), {
    value: \`${this.src || ''}\`,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    lineNumbersMinChars: 3,
    mouseWheelZoom: true,
    fontSize: 18,
    minimap: { enabled: true },
    wordWrap: true,
    // wordWrap: 'wordWrapColumn',
    // wordWrapColumn: 40,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    readOnly: false,
})
editor.getModel().onDidChangeContent((e) => {
    document.dispatchEvent(new CustomEvent('change', { detail: editor.getValue() }));
})

// https://github.com/brijeshb42/monaco-themes/tree/master/themes

var data = 
{
    "base": "vs-dark",
    "inherit": true,
    "rules": [
      {
        "foreground": "cc8855",
        "token": "string"
      },
    ],
    "colors": {
    //   "editor.foreground": "#f8f8f2",
    //   "editor.background": "#282a36",
    //   "editor.selectionBackground": "#44475a",
    //   "editor.lineHighlightBackground": "#44475a",
    //   "editorCursor.foreground": "#f8f8f0",
    //   "editorWhitespace.foreground": "#3B3A32",
    //   "editorIndentGuide.activeBackground": "#9D550FB0",
    //   "editor.selectionHighlightBorder": "#222218"
    }
  }
monaco.editor.defineTheme('custom-theme', data);
monaco.editor.setTheme('custom-theme');
</script>
</body>
</html>
    `}
})
