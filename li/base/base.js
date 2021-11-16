import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../layout-tree/layout-tree.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-base', class LiBase extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
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
            <li-layout-app>
                <div slot="app-top" class="header">
                    <div style="flex:1"></div><label>li-base</label><div style="flex:1"></div>
                </div>
                <div slot="app-left" class="panel">
                    <li-base-lpanel></li-base-lpanel>
                </div>
                <div slot="app-main" class="main" id="main">
                    main
                </div>
                <div slot="app-right" class="panel">
                    right
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            // dbName: { type: String, default: 'my-diary', save: true },
            // dbIP: { type: String, default: 'http://admin:54321@localhost:5984/', save: true },
            // autoReplication: { type: Boolean, default: false, save: true },
            _lPanel: { type: String, default: 'tree', save: true },
        }
    }
})

customElements.define('li-base-lpanel', class LiBaseLPanel extends LiElement {
    static get styles() {
        return css`

        `;
    }
    render() {
        return html`
            <div style="display: flex; border-bottom: 1px solid lightgray;padding: 4px 0;">
                <li-button name="tree-structure" title="tree" ?toggled=${this._lPanel === 'tree'} toggledClass="ontoggled" scale=".8" @click=${this._click}></li-button>
                <li-button name="settings" title="settings" ?toggled=${this._lPanel === 'settings'} toggledClass="ontoggled" @click=${this._click}></li-button>
                <div style="flex:1"></div>
                <li-button name="refresh" title="reset changes"></li-button>
                <li-button name="save" title="save"></li-button>
            </div>
            ${this._lPanel === 'tree' ? html`<li-base-tree></li-base-tree>` : html``}
            ${this._lPanel === 'settings' ? html`<li-base-settings></li-base-settings>` : html``}
        `;
    }

    static get properties() {
        return {
            _lPanel: { type: String, default: 'tree', save: true },
        }
    }

    _click(e) {
        this._lPanel = e.target.title
    }
})
customElements.define('li-base-tree', class LiBaseTree extends LiElement {
    static get styles() {
        return css`

        `;
    }
    render() {
        return html`
            <div style="display: flex; border-bottom: 1px solid lightgray;padding: 4px 0;">
                Tree ...
            </div>
            <li-layout-tree .item=${this.item} allowEdit allowCheck></li-layout-tree>
        `;
    }

    static get properties() {
        return {
            _lPanel: { type: String, default: 'tree', save: true },
            _selected: { type: Boolean },
            item: {
                type: Object,
                default: {
                    label: 'main', items: [
                        { label: 1 },
                        { label: 2, items: [{ label: '2.1' }, { label: '2.2' }, { label: '2.3' }, { label: '2.4' }, { label: '2.5' }, { label: '2.6' }] },
                    ]
                }
            }
        }
    }

})
customElements.define('li-base-settings', class LiBaseSettings extends LiElement {
    static get styles() {
        return css`
            :host {
                color: #505050;
            } 
        `;
    }
    render() {
        return html`
            <div style="display: flex; border-bottom: 1px solid lightgray;padding: 4px 0;">
                Settings ...
            </div>
        `;
    }

    static get properties() {
        return {

        }
    }
})
