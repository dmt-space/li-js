import { LiElement, html, css } from '../../../li.js';

import { m as monaco } from './monaco/index.js';
import './monaco/monaco-editor-font-face.js';

window.MonacoEnvironment = {
    getWorkerUrl: function(workerId, label) {
        return `data: text/javascript; charset=utf-8, ${encodeURIComponent(`
            self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@latest/min/' };
            importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');`
        )}`;
    }
}

const workersDir = new URL('monaco/', import.meta.url)

customElements.define('li-editor-monaco', class LiMonaco extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
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
            <link rel="stylesheet" href="${workersDir}/style.css"/>
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
                default: 'vs',
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
            language: this.mode || ['javascript', 'typescript'],
            theme: this.theme || 'vs-dark',
            automaticLayout: true,
            lineNumbersMinChars: 3,
            mouseWheelZoom: true,
            fontSize: 16,
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
            this.fire('change', { value: this.value });
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
