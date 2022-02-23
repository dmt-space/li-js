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
            #main {
                background: url(./back.jpg);
                background-size: cover;
                background-attachment: fixed;
                background-color: #F4F4F2;
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
                    <li-button size="26" id="margin" name="crop-original" @click="${this.onclick}" style="margin-right:8px" border="none" title="show border" fill=${this.margin ? 'gray' : 'lightgray'}></li-button>
                    <li-button size="26" id="border" name="select-all" @click="${this.onclick}" style="margin-right:8px" border="none" title="show border" fill=${this.showBorder ? 'gray' : 'lightgray'}></li-button>
                    <li-button size="26" id="share" name="launch" @click="${this.onclick}" style="margin-right:8px" border="none" title="share"></li-button>
                </div>
                <div slot="app-left" style="display: block; height: 100%;">
                    <li-db></li-db>
                </div>
                <div id="main" slot="app-main">
                    ${this.notebook ? html`
                        <li-jupyter style="background: white; margin: 0 ${this.margin * 100}px; min-height: ${this.margin ? 'calc(100vh - 54px)' : 'unset'}"></li-jupyter>
                    ` : html``}
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            name: { type: String, local: true },
            showBorder: { type: Boolean, default: false, local: true, save: true },
            margin: { type: Number, default: 0, local: true, save: true },
            notebook: { type: Object, local: true },
            flatArticles: { type: Array, local: true },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(async () => {
            if (Object.keys(this.flatArticles).length === 1 && !this.flatArticles['$wiki:articles'].doc.partsId?.length) {
                let demo = await import('./jupyter-demo.js');
                this.notebook = demo.default;
            }
        }, 500);

    }

    onclick(e) {
        const id = e.target.id;
        const click = {
            border: () => {
                this.showBorder = !this.showBorder;
            },
            margin: () => {
                this.margin += 1;
                let max = this.$qs('#main').offsetWidth / 360;
                this.margin = this.margin > max ? 0 : this.margin;
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
                app._l = app._l * (app._widthL < 100 ? -1 : 1);
                app._lastWidthL = app._widthL = app._widthL < 100 ? 420 : app._widthL + 20;
                app._hideL();
                app._hideL();
            }
        }
        click[id] && click[id]();
        this.$update();
    }
});
