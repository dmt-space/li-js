import { LiElement, html, css } from '../../li.js';

import '../editor-ace/editor-ace.js'
import '../editor-monaco/editor-monaco.js'
import '../editor-html/editor-html.js'

customElements.define('li-editor-iframe', class LiEditorIFrame extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
        `;
    }
    
    render() {
        return html`
                ${this.currentEditor === 'ace' ? html`
                    <li-editor-ace id="editor" src=${this.src} mode=${this.mode} theme="cobalt" style="overflow: auto"></li-editor-ace>
                ` : this.currentEditor === 'monaco' ? html`
                    <li-editor-monaco id="editor" src=${this.src} mode=${this.mode}></li-editor-monaco>
                ` : html`
                    <li-editor-html id="editor" src=${this.src}></li-editor-html>
                `}
        `
    }

    static get properties() {
        return {
            src: { type: String },
            item: { type: Object },
            mode: { type: String, default: 'html' },
            currentEditor: { type: String, default: 'ace' }
        }
    }

    get value() { return this.editor?.value }
    set value(v) { this.editor.value = v || '' }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => this._update(), 100);
        this.listen('change', (e) => {
            if (this.item && this.value !== undefined) {
                this.item.value = e.detail || this.value;
                this.$update();
            }
        })
    }

    updated(changedProperties) {
        if (this.editor) {
            if (changedProperties.has('src')) {
                this.value = this.src;
                if (this.item)
                    this.item.value = this.value;
                this.$update();
            }
            if (changedProperties.has('item')) {
                this.value = this.item?.value || '';
                this.$update();
            }
            if (changedProperties.has('currentEditor')) {
                setTimeout(() => this._update(), 100);
            }
        }
    }

    _update() {
        if (!this.$qs('#editor')?.editor) return;
        this.editor = this.$qs('#editor').editor;
        this.value = this.value = this.src || this.item?.value || '';
        this.src = this.value;
        if (this.currentEditor === 'ace') this.editor.setValue(this.value, -1);
        this.$update();
    }
})
