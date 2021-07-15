import { LiElement, html, css } from '../../li.js';

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
    get value() {
        return this.card?.getCardConfig() || undefined;
    }
    set value(v) {
        if (!this.card) return;
        let config = [{ src: 'background/notebook.png', type: 'background' }];
        try {
            config = JSON.parse(v);
        } catch (error) {}
        this.card.loadCardConfig(config);
    }
    get htmlValue() {
        return this.card?.toDataUrl() || undefined;
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
            <iframe ref="editor" .srcdoc="${this.srcdoc}" style="border: none; width: 100%; height: 100%;"></iframe>
        `
    }

    async firstUpdated() {
        super.firstUpdated();

        const response = await fetch('../../li/editor-ecard/editor.html')
        this.srcdoc = await response.text();
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
                this.card?.toDataUrl(v => this.item.htmlValue = v);
                this.$update();
            }
        }
    }

    _update() {
        if (!this.$refs?.editor) return;
        this.editor = this.$refs.editor;
        this.value = this.src || this.item?.value || '';
        setInterval(() => {
            if (this.item && this.value !== undefined) {
                this.item.value = this.value;
                this.card?.toDataUrl(v => this.item.htmlValue = v);
                this.$update();
            }
        }, 1000);
        this.$update();
    }
})
