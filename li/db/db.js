import { LiElement, html, css } from '../../li.js';

import '../button/button.js'
import '../tree/tree.js';
import '../../lib/pouchdb/pouchdb.js';

const mainCSS = css`
    .row-panel { display: flex; border-bottom: 1px solid lightgray; padding: 4px 2px; margin-bottom: 2px; }
`;

customElements.define('li-db', class LiDb extends LiElement {
    static get styles() {
        return [mainCSS, css``]
    }
    render() {
        return html`
            <div class="row-panel">
                <li-button id="tree" name="tree-structure" title="tree" ?toggled=${this.$c.dbPanel === 'tree'} toggledClass="ontoggled" scale=".8" @click=${this._onclick}></li-button>
                <li-button id="list" name="list" title="list" ?toggled=${this.$c.dbPanel === 'list'} toggledClass="ontoggled" @click=${this._onclick}></li-button>
                <li-button id="settings" name="settings" title="settings" ?toggled=${this.$c.dbPanel === 'settings'} toggledClass="ontoggled" @click=${this._onclick}></li-button>
                <div style="flex:1"></div>
                <li-button id="reload" name="refresh" title="reload page"  @click="${this._onclick}"></li-button>
                ${this.$a.readOnly ? html`` : html`
                    <li-button id="save" name="save" title="save" @click=${this._onclick} .fill="${this.needSave ? 'red' : ''}" .color="${this.needSave ? 'red' : 'gray'}"></li-button>
                `}
            </div>
            <div style="padding-left: 2px;">
                ${this.$c.dbPanel === 'tree' ? html`<li-db-three></li-db-three>` : html``}
                ${this.$c.dbPanel === 'list' ? html`<li-db-list></li-db-list>` : html``}
                ${this.$c.dbPanel === 'settings' ? html`<li-db-settings></li-db-settings></li-base-settings>` : html``}
            </div>
        `
    }

    static get properties() {
        return {
            $s: {
                type: Object, local: true, save: true , default: {
                    name: 'db/',
                    url: 'http://admin:54321@localhost:5984/',
                    replication: true,
                }
            },
            $a: {
                type: Object, local: true, default: {
                    readOnly: false,
                    allowImport: true,
                    allowExport: true,
                }
            },
            $c: { 
                type: Object, local: true, default: { 
                    dbLocal: undefined,
                    dbRemote: undefined,
                    replicationHandler: undefined,
                    dbPanel: 'tree',
                    starView: false
                }
            }
        }
    }
    get needSave() { return false };

    constructor() {
        super();
        this._dbName = window.location.href.split('#')?.[1];
    }
    firstUpdated() {
        super.firstUpdated();
        setTimeout(async () => {
            if (this._dbName && this._dbName !== this.$s.name) this.$s.replication = false;
            this.$s.name = this._dbName || this.$s.name;
            if (this.$s.name) {
                const prefix = 'lidb_'
                this.$c.dbLocal = new PouchDB(prefix + this.$s.name);
                this.$c.dbRemote = new PouchDB(this.$s.url + prefix + this.$s.name);
                if (this.$s.replication) this.$c.replicationHandler = this.$c.dbLocal.sync(this.$c.dbRemote, { live: true });
                this.$update();
            }
        }, 100);
    }

    _onclick(e) {
        const id = e.target.id;
        const action = {
            tree: () => {
                this.$c.dbPanel = id;
            },
            list: () => {
                this.$c.dbPanel = id;
            },
            settings: () => {
                this.$c.dbPanel = id;
            },
            reload: () => {
                document.location.reload();
            },
            save: () => {
                console.log('save ...')
            }
        }
        action[id] && action[id]();
        this.$update();
    }
})

customElements.define('li-db-three', class LiDbThree extends LiElement {
    static get styles() {
        return [mainCSS, css``]
    }
    render() {
        return html`
            <label class="row-panel">three</label>
            <div class="row-panel">
                <li-button id="collapse" name="unfold-less" title="collapse" size="20" @click=${this._onclick}></li-button>
                <li-button id="expand" name="unfold-more" title="expand" size="20" @click=${this._onclick}></li-button>
                <li-button id="starView" name="${this.$c.starView ? 'star' : 'star-border'}" title="set selected as root" size="20" @click=${this._onclick}
                    borderColor="${this.$c.starView ? 'orange' : ''}" fill="${this.$c.starView ? 'orange' : ''}"></li-button>
                <li-button name="camera" title="save tree state" @click="${this._saveTreeState}" size="20"></li-button>
                <div style="flex: 1"></div>
                ${this.$a.readOnly ? html`` : html`
                    <li-button name="restore" title="clear deleted" size="20" @click=${this._onclick}></li-button>
                    <li-button name="delete" title="delete" size="20" @click=${this._onclick}></li-button>
                    <li-button name="library-add" title="add new" size="20" @click=${this._onclick}></li-button>
                `}
            </div>
        `
    }

    static get properties() {
        return {
            $s: { type: Object, local: true },
            $a: { type: Object, local: true },
            $c: { type: Object, local: true }
        }
    }

    _onclick(e) {
        const id = e.target.id;
        const action = {
            collapse: () => {

            },
            expand: () => {

            },
            starView: () => {
                this.$c.starView = !this.$c.starView;
            },
        }
        action[id] && action[id]();
        this.$update();
    }
})

customElements.define('li-db-list', class LiDblist extends LiElement {
    static get styles() {
        return [mainCSS, css``]
    }
    render() {
        return html`
            <label class="row-panel" style="">list</label>
        `
    }

    static get properties() {
        return {
            
        }
    }
})

customElements.define('li-db-settings', class Li$aettings extends LiElement {
    static get styles() {
        return [mainCSS, css`
            input {
                border: none; 
                outline: none; 
                width: 100%; 
                color: blue; 
                opacity: 0.7;
                font-size: 18;
            }
        `]
    }
    render() {
        return html`
            <div class="row-panel" style="align-items: center">
                <label>settings</label>
                <div style="color:gray; opacity: 0.7; margin-left: auto; font-size: 12px;">version: 0.0.1</div>
            </div>
            <div style="flex-direction: column; overflow: auto; padding-top: -4px;">
                <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.$s.name}" @change="${this._setDbName}"></div>
                <div style="color: gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Couchdb settings:</div>
                <div style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px">db  url:</div><input .value="${this.$s.url}" @change="${this._setdbURL}"></div>
                <div style="display: flex; align-items: center;"><li-checkbox @change="${this._setReplication}" .toggled="${this.$s.replication}"></li-checkbox>
                    Auto replication local and remote db</div>
                <div class="row-panel"></div>
                ${this.$a.readOnly ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <li-button id="Compacting db" @click="${this._settings}" height="auto" width="auto" padding="4px">Compacting current database</li-button>
                        <li-button id="Delete db" @click="${this._settings}" height="auto" width="auto" padding="4px">Delete current database</li-button>
                    </div>
                ` }
                ${!this.$a.allowExport ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Export database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox @change="${e => this._exportToFocused = e.detail}"></li-checkbox>Export focused in tree</div>
                        <li-button id="Export dbFile" @click="${this._settings}" height="auto" width="auto" padding="4px">Export db (or focused) to file</li-button>
                    </div>
                ` }
                ${!this.$a.allowImport ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Import database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox @change="${e => this._importToFocused = e.detail}"></li-checkbox>Import to focused in tree</div>
                        <li-button for="import" height="auto" width="auto" padding="4px" @click=${() => { this.$id('import').click() }}>Импорт db</li-button>
                        <input id="import" type="file" id="import" @change=${this._tap} style="display: none"/>
                    </div>
                ` }
            </div>
        `
    }

    static get properties() {
        return {
            $s: { type: Object, local: true },
            $a: { type: Object, local: true },
            $c: { type: Object, local: true }
        }
    }

    _setDbName(e) {
        this.$s.name = e.target.value;
        if (!this.$s.name) this.$s.name = 'li-db';
        this.$s.replication = false;
        window.location.href = window.location.href.split('#')?.[0] + '#' + this.$s.name;
        location.reload();
    }
    _setdbURL(e) {
        this.$s.url = e.target.value;
        this.$update();
    }
    _setReplication(e) {
        this.$s.replication = e.detail;
        if (this.$s.replication) {
            this.$c.replicationHandler = this.$c.dbLocal.sync(this.$c.dbRemote, { live: true });
        } else {
            this.$c.replicationHandler.cancel();
            this.$c.replicationHandler = undefined;
        }
        this.$update();
    }
})
