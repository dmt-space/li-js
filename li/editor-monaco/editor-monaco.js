import { LiElement, html, css } from '../../li.js';

const editorCSS = css`
    ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }            
    :host { position: relative; display: flex; width: 100%; overflow: hidden; height: 100%; }
`;

customElements.define('li-editor-monaco', class LiMonaco extends LiElement {
    static get styles() { return [editorCSS, css``] }

    render() {
        return html`
            <iframe style="border: none; width: 100%; height: 100%;"></iframe>
        `
    }

    static get properties() {
        return {
            src: { type: String },
            mode: {
                type: String,
                default: 'javascript',
                list: ['javascript', 'html', 'css', 'xml', 'json', 'markdown', 'python', 'php']
            },
            theme: {
                type: String,
                default: 'vs-dark',
                list: ['vs-dark', 'vs-light']
            },
            props: { type: Object, default: {} },
            fontSize: { type: String , default: 18 },
            wordWrap: { type: Boolean, default: true },
            readOnly: { type: Boolean, default: false },
            lineNumbers: { type: String, default: 'on' }
        }
    }
    get value() { return this.editor?.getValue() }
    set value(v) { this.editor?.setValue(v || '') }

    async firstUpdated() {
        super.firstUpdated();
        await new Promise((r) => setTimeout(r, 0));
        this.setProps();

        const iframe = this.$qs('iframe');
        iframe.src = URL.createObjectURL(new Blob([this.srcdoc], { type: 'text/html' }));
        setTimeout(() => iframe.contentDocument.addEventListener("editor-ready", (e) => {
            this.editor = e.detail.editor;
            this.monaco = e.detail.monaco;
            this.value = this.src
            this.$update()
        }), 100);
        setTimeout(() => iframe.contentDocument.addEventListener("change", (e) => {
            this.fire('change', e.detail);
        }), 500);
    }
    setProps(v = this.props) {
        const listen = v?.listen;
        const isPlainObject = LI.isPlainObject(v)
        this.props = !isPlainObject ? icaro({}) : !listen ? icaro(v) : v;
        !listen && this.props.listen((e) => {
            this.editor.updateOptions(this.props);
            this.monaco.editor.setModelLanguage(this.editor.getModel(), this.props.mode || this.mode);
            this.$update();
        })
    }
    updated(e) {
        if (e.has('src')) {
            this.value = this.src || '';
        }
        if (this.editor && e.has('props')) {
            this.setProps();
            this.editor.updateOptions(this.props);
            this.monaco.editor.setModelLanguage(this.editor.getModel(), this.props.mode || this.mode);
            this.$update();
        }
        if (this.editor && e.has('mode') && this.mode) {
            this.monaco.editor.setModelLanguage(this.editor.getModel(), this.props.mode || this.mode);
        }
        if (this.editor && (e.has('theme') || e.has('fontSize') || e.has('wordWrap') || e.has('lineNumbers') || e.has('readOnly'))) {
            this.editor.updateOptions(this.options);
        }
    }

    get options() {
        return {
            language: this.mode || 'vs-dark',
            theme:  this.theme || 'javascript',
            automaticLayout: true,
            lineNumbersMinChars: 3,
            mouseWheelZoom: true,
            fontSize: this.fontSize || 18,
            minimap: { enabled: true },
            wordWrap: this.wordWrap || true,
            // wordWrap: 'wordWrapColumn',
            // wordWrapColumn: 40,
            lineNumbers: this.lineNumbers || 'on',
            scrollBeyondLastLine: false,
            readOnly: this.readOnly || false,
        }
    }

    get srcdoc() {
        return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Monaco editor</title>
<link rel="stylesheet" data-name="vs/editor/editor.main" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs/editor/editor.main.min.css">
<style>
html body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
}
</style>
</head>
<body>
<div id="container" style="height: 100vh; border:1px solid black;"></div>
<script>var require = { paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } }</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs/loader.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs/editor/editor.main.nls.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs/editor/editor.main.js"></script>
<script>
const editor = monaco.editor.create(document.getElementById('container'), ${JSON.stringify(this.options)})
setTimeout(() => document.dispatchEvent(new CustomEvent('editor-ready', { detail: { monaco, editor }})), 10);
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
        "foreground": "CE9178",
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
