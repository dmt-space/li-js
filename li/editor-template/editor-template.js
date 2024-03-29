import { LiElement, html, css } from '../../li.js';

import '../splitter/splitter.js';

const editorCSS = css`
    :host { position: relative; display: flex; width: 100%; overflow: hidden; min-height: 20px; }
`;

customElements.define('li-editor-template', class LiEditorTemplate extends LiElement {
    static get styles() { return [editorCSS, css``] }

    render() {
        return html`
            ${this.readOnly ? html`
                <div .innerHTML=${this.source} style="width: 100%; padding: 8px;"></div>
            ` : html`
                <div style="display: flex; overflow: hidden; width: 100%;">
                    <div style="width: 50%; height: 100%; overflow: hidden; position: relative;">
                        <iframe style="border: none; width: 100%; height: 100vh;"></iframe>
                    </div>
                    <li-splitter size="3" color="gray" style="opacity: .3"></li-splitter>
                    <div style="flex: 1; height: 100%; overflow: auto">
                        <div .innerHTML=${this.source} style="width: 100%"></div>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            source: { type: String, default: '' },
            srcdoc: { type: String, default: '', notify: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('srcdoc-changed', () => {
            requestAnimationFrame(() => {
                const iframe = this.$qs('iframe');
                iframe.srcdoc = this.srcdoc;
                setTimeout(() => iframe.contentDocument.addEventListener("change", (e) => {
                    if (e.detail !== undefined)
                        this.source = e.detail;
                    this.$update();
                }), 1000);
            })
        })
    }
})
