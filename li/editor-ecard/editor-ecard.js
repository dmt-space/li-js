import { LiElement, html, css } from '../../li.js';
import '../button/button.js'

customElements.define('li-editor-ecard', class LiEditorECard extends LiElement {
    static get properties() {
        return {
            src: { type: String },
            item: { type: Object },
            srcdoc: { type: String, default: '' },
        }
    }

    get card() {
        return this.$refs?.editor?.contentDocument?.card;
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
            <div style="border: 1px solid gray; border-radius: 4px; background: lightgray; margin: auto; padding: 2px; width: 610px;">
                <div style="display: flex;align-items: center; padding: 4px; width: 600px;">
                    <label>eCard editor</label>
                    <div style="flex: 1"></div>
                    <li-button name="photo-library" width="160px" @click="${this._open}">Open in new tab</li-button>
                    <li-button name="content-copy" width="160px" @click="${this._copy}">Copy to clipboard</li-button>
                    <li-button name="close" @click="${() => window.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 27 }))}" title="close"></li-button>
                </div>
                <iframe ref="editor" .srcdoc="${this.srcdoc}" style="border: none; width: 610px; height: 684px;"></iframe>
            </div>
        `
    }

    async firstUpdated() {
        super.firstUpdated();
        const response = await fetch('../../li/editor-ecard/editor.html')
        this.srcdoc = await response.text();
        this.$update();
    }

    async _copy() {
        this.card?.toDataUrl(async v => {
            const res = await fetch(v);
            const blob = await res.blob();
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
        });
    }
    _open() {
        this.card?.toDataUrl(v => {
            const w = window.open();
            w.document.write(`<img src="${v}">`);
            w.document.close();
        });
    }
})
