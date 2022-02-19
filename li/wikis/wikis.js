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
                    <li-button size="26" id="left" name="arrow-back" @click="${this.onclick}" style="margin-left:8px" border="none"></li-button>
                    <li-button size="26" id="right" name="arrow-forward" @click="${this.onclick}" style="margin-left:8px" border="none"></li-button>
                    <div style="flex:1"></div>${this.name || 'li-wikis'}<div style="flex:1"></div>
                    <li-button size="26" id="edit" name="edit" @click="${this.onclick}" style="margin-right:8px" border="none" title="enable edit" fill=${this.readOnly ? 'gray' : 'red'}></li-button>
                    <li-button size="26" id="border" name="border-outer" @click="${this.onclick}" style="margin-right:8px" border="none" title="show border" fill=${this.showBorder ? 'gray' : 'lightgray'}></li-button>
                    <li-button size="26" id="share" name="launch" @click="${this.onclick}" style="margin-right:8px" border="none" title="share"></li-button>
                </div>
                <div slot="app-left" style="display: block; height: 100%;">
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
            },
            left: () => {
                const app = this.$qs('li-layout-app');
                if (app._widthL > 200) {
                    app._lastWidthL = app._widthL = app._widthL - 20;
                    app._hideL();
                    app._hideL();
                }
            },
            right: () => {
                const app = this.$qs('li-layout-app');
                app._l  = app._l * (app._widthL < 100 ? -1 : 1);
                app._lastWidthL = app._widthL = app._widthL < 100 ? 420 : app._widthL + 20;
                app._hideL();
                app._hideL();
            }
        }
        click[id] && click[id]();
        this.$update();
    }
});
