import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../db/db.js';
import '../jupyter/jupyter.js';
import '../button/button.js';

customElements.define('li-wikis', class LiWikis extends LiElement {
    static get styles() {
        return css`
            :host {
                color: #505050;
            }
            .header {
                display: flex;
                align-items: center;
                color: gray;
                font-size: large;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app hide="r">
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>${this.name || 'li-wikis'}<div style="flex:1"></div>
                    <li-button size="26" id="edit" name="edit" @click="${this.onclick}" style="margin-right:8px" border="none" title="enable edit" fill=${this.readOnly ? 'gray' : 'red'}></li-button>
                    <li-button size="26" id="border" name="border-outer" @click="${this.onclick}" style="margin-right:8px" border="none" title="show border" fill=${this.showBorder ? 'gray' : 'lightgray'}></li-button>
                    <li-button size="26" id="share" name="launch" @click="${this.onclick}" style="margin-right:8px" border="none" title="share"></li-button>
                </div>
                <div slot="app-left">
                    <li-db></li-db>
                </div>
                <div slot="app-main" style="margin-top: 6px">
                    ${this.notebook ? html`
                        <li-jupyter></li-jupyter>
                    ` : html``}
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, default: true, local: true },
            name: { type: String, local: true },
            showBorder: { type: Boolean, default: false, local: true, save: true },
            notebook: { type: Object, local: true }
        }
    }

    onclick(e) {
        const id = e.target.id;
        const click = {
            border: () => {
                this.showBorder = !this.showBorder;
            },
            edit: () => {
                this.readOnly = !this.readOnly;
            },
            share: () => {
                this.$qs('li-jupyter').share();
            }
        }
        click[id] && click[id]();
        this.$update();
    }
});
