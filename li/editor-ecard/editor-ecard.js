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
        const config = JSON.parse(v || "[{src:'background/notebook.png',type:'background'}]");
        this.card.loadCardConfig(config);
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
            <iframe ref="editor" .srcdoc="${this.srcdoc}" style="border: none;width: 640px; height: 720px;"></iframe>
        `
    }

    async firstUpdated() {
        super.firstUpdated();

        const response = await fetch('./editor.html')
        this.srcdoc = await response.text();
        this._update();
    }

    updated(changedProperties) {
        //if (this.editor) {
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
        //}
    }

    _update() {
        //if (!this.$refs?.editor) return;
        //this.editor = this.$refs.editor;
        this.value = this.src || this.item?.value || '';
        // this.editor.getSession().on('change', () => {
        //     if (this.item && this.value !== undefined) {
        //         this.item.value = this.value;
        //         this.$update();
        //     }
        // });
        this.$update();
    }
})
