import { LiElement, html, css } from '../../li.js';

import '../editor-ace/editor-ace.js'

customElements.define('li-editor-iframe', class LiEditorIFrame extends LiElement {
    static get properties() {
        return {
            src: { type: String },
            item: { type: Object }
        }
    }

    get value() {
        return this.editor?.getValue() || undefined;
    }
    set value(v) {
        this.editor.setValue(v || '', -1);
    }

    static get styles() {
        return css`
            ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            ::-webkit-scrollbar-track {
                background: lightgray;
            }
            ::-webkit-scrollbar-thumb {
                background-color: gray;
            }
        `;
    }
    
    render() {
        return html`
            <li-editor-ace ref="editor"></li-editor-ace>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this._update();
        }, 100);
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
        if (!this.$refs('editor')?.editor) return;
        this.editor = this.$refs('editor').editor;
        this.editor.setTheme('ace/theme/chrome');
        this.editor.getSession().setMode('ace/mode/html');
        this.editor.setOptions({ fontSize: 16, maxLines: Infinity, minLines: 100, });
        this.value = this.src || this.item?.value || '';
        this.editor.getSession().on('change', () => {
            if (this.item && this.value !== undefined) {
                this.item.value = this.value;
                this.$update();
            }
        });
    }
})
