import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../tree/tree.js';
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
                <li-base-lpanel slot="app-left"></li-base-lpanel>
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
            id: { type: String, default: 'li-base' },
            sets: { type: Object, save: true, local: true, default: { version: 'version: 0.0.1', } },
            dbs: {
                type: Array, save: true, local: true, default: [
                    {
                        localDB: 'li-base',
                        remoteDB: 'http://admin:54321@localhost:5984/',
                        replicate: false
                    }
                ]
            },
            _lPanel: { type: String, default: 'tree', save: true, local: true },
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
            <div style="padding: 2px 4px;">
                ${this._lPanel === 'tree' ? html`<li-base-tree></li-base-tree>` : html``}
                ${this._lPanel === 'settings' ? html`<li-base-settings></li-base-settings>` : html``}
            </div>
        `;
    }

    static get properties() {
        return {
            _lPanel: { type: String, default: 'tree', local: true },
        }
    }

    _click(e) {
        this._lPanel = e.target.title
    }
})

customElements.define('li-base-tree', class LiBaseTree extends LiElement {
    static get styles() {
        return css`
            .row {
                display: flex;
                align-items: center;
                border-bottom: 1px solid lightgray;
                padding: 4px 0;
                min-height: 20px;
                cursor: pointer;
            }
        `;
    }
    render() {
        return html`
            <div style="display: flex; border-bottom: 1px solid lightgray;padding: 4px 0;">
                databases:
            </div>
            <div style="display:flex; border-bottom:1px solid lightgray;width:100%;margin: 4px 0;">
                <li-button name="unfold-less" title="collapse" size="20"></li-button>
                <li-button name="unfold-more" title="expand" size="20"></li-button>
                <li-button name="${this._satr ? 'star' : 'star-border'}" title="set selected as root" size="20"
                    borderColor="${this._star ? 'orange' : ''}" fill="${this._star ? 'orange' : ''}"></li-button>
                <div style="flex: 1"></div>
                <li-button name="cached" title="clear deleted" size="20"></li-button>
                <li-button name="delete" title="delete" size="20"></li-button>
                <li-button name="library-add" title="add new" size="20"></li-button>
            </div>
            ${(this.dbs || []).map((i, idx) => html`
                ${i.localDB ? html`
                    <div class="row">
                        ${i.localDB}
                    </div>
                ` : html``}
            `)}
        `;
    }

    static get properties() {
        return {
            dbs: { type: Array, local: true },
            sets: { type: Object, local: true },
            _lPanel: { type: String, default: 'tree', local: true },
            _selected: { type: Boolean },
            _star: { type: String, default: '' }
        }
    }

})

customElements.define('li-base-settings', class LiBaseSettings extends LiElement {
    static get styles() {
        return css`
            :host {
                color: #505050;
            }
            input {
                border: none;
                border-bottom: 1px solid gray; 
                outline: none; 
                width: 100%; 
                color:gray; 
                opacity: 0.9;
                font-size: 18;
                background-color: transparent;
            }
            .row, .line{
                display: flex;
                align-items: center;
                border-bottom: 1px solid lightgray;
                padding: 4px 0;
                min-height: 20px;
            }
            .line {
                min-height: 2px;
                height: 2px;
                border-bottom: 1px solid gray;
            }
        `;
    }
    render() {
        return html`
            <div class="row">settings:</div>
            <div class="row" style="color:gray; opacity: 0.7">${this.sets?.version}</div>
            <div class="line"></div>
            <div class="row">
                used databases [${this.dbs.length}]:
                <div style="flex: 1"></div>
                ${this.dbs?.length > 1 && this._sIdx > 0 ? html`
                    <li-button name="remove" title="remove db" size="20" @click=${this._btnClick}></li-button>
                ` : html``}
                <li-button name="add" title="add db" size="20" @click=${this._btnClick}></li-button>
            </div>
            ${(this.dbs || []).map((i, idx) => html`
                    <div @click=${e => this._selectRow(e, idx)} style="cursor: pointer; background-color: ${this._sIdx === idx ? 'lightyellow' : 'white'}">
                        <div class="row">
                            <div style="width: 100px; color: ${i.replicate ? 'red' : ''}">local db:</div>
                            <input class="localDB" .value="${i.localDB || ''}" @change="${e => this._setDB(e, i, idx)}">
                        </div>
                        ${this._sIdx === idx ? html`
                            <div class="row" style="border: none;">
                                remote db:
                                <div style="flex: 1"></div>
                                replicate
                                <li-checkbox class="replicate" @change="${e => this._setDB(e, i, idx)}" .toggled="${i.replicate}"></li-checkbox>
                            </div>
                            <div class="row" style="border: none;">
                                <input class="remoteDB" .value="${i.remoteDB || ''}" @change="${e => this._setDB(e, i, idx)}">
                            </div>
                            <div class="row">
                                <div style="flex: 1"></div>
                                <li-button name="file-upload" rotate="180" title="export db" size="19" @click=${this._btnClick}></li-button>
                                <li-button name="file-download" title="import db" size="20" @click=${this._btnClick}></li-button>
                                <!-- <li-button name="delete" title="delete db" size="20" @click=${this._btnClick}></li-button> -->
                            </div>
                        ` : html``}
                    </div>
                `)}

            <div class="line"></div>
        `;
    }

    static get properties() {
        return {
            sets: { type: Object, local: true },
            dbs: { type: Array, local: true },
            _sIdx: { type: Number, default: -1 },
            _sName: { type: String, default: '' }
        }
    }

    _selectRow(e, idx) {
        this._sName = this.dbs[idx]?.localDB || '';
        if (e.srcElement.localName !== 'input' && !e.srcElement.localName.startsWith('li-')) {
            this._sIdx = this._sIdx === idx ? -1 : idx;
        } else {
            this._sIdx = idx;
        }
    }
    _btnClick(e, idx = this._sIdx) {
        const src = e.target.name;
        switch (src) {
            case 'add':
                const db = { remoteDB: this.dbs[0].remoteDB };
                this.dbs.splice(this.dbs.length, 0, db);
                this._sIdx = this.dbs.length - 1;
                break;
            case 'remove':
                if (this._sIdx !== 0) {
                    this.dbs.splice(idx, 1);
                    this._sIdx = this._sIdx > this.dbs.length - 1 ? this.dbs.length - 1 : this._sIdx;
                }
                break;
        }
        this.dbs = [...[], ...this.dbs];
        this.$update();
    }
    _setDB(e, i, idx) {
        const src = e.target.className;
        switch (src) {
            case 'localDB':
                console.log(this._sName);
                this.dbs[idx].localDB = e.target.value;
                break;
            case 'remoteDB':
                this.dbs[idx].remoteDB = e.target.value;
                break;
            case 'replicate':
                this.dbs[idx].replicate = e.target.toggled;
                break;
        }
        this.dbs = [...[], ...this.dbs];
        this.$update();
    }
})
