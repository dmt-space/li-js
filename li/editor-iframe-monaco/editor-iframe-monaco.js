import { LiElement, html, css } from '../../li.js';

import '../editor-monaco/editor-monaco.js'

customElements.define('li-editor-iframe-monaco', class LiEditorIFrameMonaco extends LiElement {
    static get properties() {
        return {
            src: { type: String },
            item: { type: Object },
            mode: { type: String }
        }
    }

    get value() {
        return this.editor?.value;
    }
    set value(v) {
        if (this.editor)
            this.editor.value = (v || '');
    }

    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
        `;
    }
    get editor() {
        return this.$qs('#editor').editor
    }

    render() {
        return html`
            <li-editor-monaco id="editor" mode=${this.mode || ['html', 'javascript', 'typescript']} src=${this.src}></li-editor-monaco>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this._update();
        }, 100);
        this.listen('change', (e) => {
            if (this.item && this.value !== undefined) {
                this.item.value = this.value;
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
        }
    }

    _update() {
        this.value = this.src || this.item?.value || '';
    }
})
