import { LiElement, html, css } from '../../li.js';

import { m as monaco } from '../editor-monaco/monaco/index.js';
import '../editor-monaco/monaco/monaco-editor-font-face.js';

let url = import.meta.url;

const workersDir = new URL('monaco/workers/', url)
self.MonacoEnvironment = {
    getWorkerUrl: function(moduleId, label) {
        switch (label) {
            case 'json':
                return `${workersDir}json.worker.js`
            case 'css':
                return `${workersDir}css.worker.js`
            case 'html':
                return `${workersDir}html.worker.js`
            case 'typescript':
            case 'javascript':
                return `${workersDir}ts.worker.js`
            default:
                return `${workersDir}editor.worker.js`
        }
    }
}

customElements.define('li-editor-monaco', class LiMonaco extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
            :host {
                width: 100%;
                height: 100%;
            }
            #editor {
                width: 100%;
                height: 100%;
            }
            div { 
                 font-family: monaco, Consolas, "Lucida Console", monospace;
            }
        `;
    }
    render() {
        return html`
            <link rel="stylesheet" href="../editor-monaco/monaco/style.css"/>
            <div id="editor"></div>
        `
    }

    static get properties() {
        return {
            src: { type: String, default: '' },
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
            options: { type: Object, default: {} }
        }
    }
    get value() { return this.editor.getValue() }
    set value(v) { this.editor.setValue(v) }

    constructor() {
        super();
        this.options = icaro({
            language: this.mode || 'javascript',
            theme: this.theme || 'vs-dark',
            automaticLayout: true,
            lineNumbersMinChars: 3,
            mouseWheelZoom: true,
            fontSize: 20,
            minimap: { enabled: true },
            wordWrap: true,
            // wordWrap: 'wordWrapColumn',
            // wordWrapColumn: 40,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            readOnly: false,
        })
        this.options.listen((e) => {
            this.editor.updateOptions(this.options);
            monaco.editor.setModelLanguage(this.editor.getModel(), this.mode);
            this.$update();
        })
    }
    firstUpdated() {
        super.firstUpdated();
        this.editor = monaco.editor.create(this.$id('editor'), this.options);
        this.value = this.src || '';
        this.editor.getModel().onDidChangeContent((e) => {
            if (this.item && this.value !== undefined) {
                this.item.value = this.value;
                this.$update();
            }
            this.fire('change');
        });
        this.$update();
    }
    updated(e) {
        if (this.editor) {
            if (e.has('src')) {
                this.value = this.src;
                this.$update();
            }
            if (e.has('mode') || e.has('theme')) {
                this.options.mode = this.mode;
                this.options.theme = this.theme;
            }
        }
    }
})
