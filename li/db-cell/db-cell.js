import { LiElement, html, css } from '../../li.js';

import '../button/button.js';

customElements.define('li-db-cell', class LiDbCell extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: undefined },
            icon: { type: String, default: 'apps' },
            label: { type: String, default: 'db-cell ...' },
            action: { type: String, default: '' },
            callback: { type: Object, default: undefined },
            iconOpen: { type: String, default: 'flip-to-front' },
            iconSettings: { type: String, default: 'settings' },
            hideIcons: { type: String, default: '' },
            liSize: { type: Number, default: 28, local: true }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.hideIcons) {
            if (this.hideIcons.includes('1')) this.icon = '';
            if (this.hideIcons.includes('2')) this.iconOpen = '';
            if (this.hideIcons.includes('3')) this.iconSettings = '';
        }
    }

    static get styles() {
        return css`
            :host {
                width: -webkit-fill-available;
                flex: 1;
            }
            .db-cell {
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 0 1px lightgray;
                background: whitesmoke;
                /* margin: 1px; */
            }
            .label {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
    }

    render() {
        return html`
            <div class="db-cell" @click="${this._tap}">
                <li-button id="btn1" class="label" name="${this.icon}" label="${this.label}" width="auto" style="flex:1;" textAlign="left" border=0></li-button>
                ${!this.iconOpen ? html`` : html`
                    <li-button id="btn2" name="${this.iconOpen}" border=0></li-button>
                `}
                ${!this.iconSettings ? html`` : html`
                    <li-button id="btn3" name="${this.iconSettings}" border=0></li-button>
                `}
            </div>
        `;
    }

    async _tap(e) {
        //e.stopPropagation();
        this._target = e.target;
        LI.fire(document, "dropdownDataChange", { id: e.target.id, target: this, value: e.target.label || e.target.name, callback: this.callback, action: this.action });
    }
});