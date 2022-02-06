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
                <li-button id="tree" name="tree-structure" title="tree" ?toggled=${this.dbPanel === 'tree'} toggledClass="ontoggled" scale=".8" @click=${this._onclick}></li-button>
                <li-button id="list" name="list" title="list" ?toggled=${this.dbPanel === 'list'} toggledClass="ontoggled" @click=${this._onclick}></li-button>
                <li-button id="settings" name="settings" title="settings" ?toggled=${this.dbPanel === 'settings'} toggledClass="ontoggled" @click=${this._onclick}></li-button>
                <div style="flex:1"></div>
                <li-button id="reload" name="refresh" title="reload page"  @click="${this._onclick}"></li-button>
                ${this.dbs.readOnly ? html`` : html`
                    <li-button id="save" name="save" title="save" @click=${this._onclick} .fill="${this.needSave ? 'red' : ''}" .color="${this.needSave ? 'red' : 'gray'}"></li-button>
                `}
            </div>
            <div style="padding-left: 2px;">
                ${this.dbPanel === 'tree' ? html`<li-db-three></li-db-three>` : html``}
                ${this.dbPanel === 'list' ? html`<li-db-list></li-db-list>` : html``}
                ${this.dbPanel === 'settings' ? html`<li-db-settings></li-db-settings></li-base-settings>` : html``}
            </div>
        `
    }

    static get properties() {
        return {
            dbName: { type: String, default: 'db', local: true, save: true },
            dbURL: { type: String, default: 'http://admin:54321@localhost:5984/', local: true, save: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },
            replication: { type: Boolean, default: false, local: true, save: true },
            dbs: {
                type: Object, local: true, default: {
                    readOnly: false,
                    allowImport: true,
                    allowExport: true,
                }
            },
            dbPanel: { type: String, default: 'tree', local: true },
            starView: { type: Boolean, default: false, local: true }
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
            if (this._dbName !== this.dbName) this.replication = false;
            this.dbName = this._dbName || this.dbName;
            if (this.dbName) {
                const prefix = 'lidb_'
                this.dbLocal = new PouchDB(prefix + this.dbName);
                this.dbRemote = new PouchDB(this.dbURL + prefix + this.dbName);
                if (this.replication) this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
                this.$update();
            }
        }, 100);
    }

    _onclick(e) {
        const id = e.target.id;
        const action = {
            tree: () => {
                this.dbPanel = id;
            },
            list: () => {
                this.dbPanel = id;
            },
            settings: () => {
                this.dbPanel = id;
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
                <li-button id="starView" name="${this.starView ? 'star' : 'star-border'}" title="set selected as root" size="20" @click=${this._onclick}
                    borderColor="${this.starView ? 'orange' : ''}" fill="${this.starView ? 'orange' : ''}"></li-button>
                <li-button name="camera" title="save tree state" @click="${this._saveTreeState}" size="20"></li-button>
                <div style="flex: 1"></div>
                ${this.dbs.readOnly ? html`` : html`
                    <li-button name="restore" title="clear deleted" size="20" @click=${this._onclick}></li-button>
                    <li-button name="delete" title="delete" size="20" @click=${this._onclick}></li-button>
                    <li-button name="library-add" title="add new" size="20" @click=${this._onclick}></li-button>
                `}
            </div>
        `
    }

    static get properties() {
        return {
            dbs: { type: Object, local: true },
            dbPanel: { type: String, local: true },
            starView: { type: Boolean, local: true }
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
                this.starView = !this.starView;
            },
        }
        action[id] && action[id]();
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
            dbPanel: { type: String, local: true },
        }
    }
})

customElements.define('li-db-settings', class LiDbSettings extends LiElement {
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
                <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.dbName}" @change="${this._setDbName}"></div>
                <div style="color: gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Couchdb settings:</div>
                <div style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px">db  url:</div><input .value="${this.dbURL}" @change="${this._setdbURL}"></div>
                <div style="display: flex; align-items: center;"><li-checkbox @change="${this._setReplication}" .toggled="${this.replication}"></li-checkbox>
                    Auto replication local and remote db</div>
                <div class="row-panel"></div>
                ${this.dbs.readOnly ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <li-button id="Compacting db" @click="${this._settings}" height="auto" width="auto" padding="4px">Compacting current database</li-button>
                        <li-button id="Delete db" @click="${this._settings}" height="auto" width="auto" padding="4px">Delete current database</li-button>
                    </div>
                ` }
                ${!this.dbs.allowExport ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Export database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox @change="${e => this._exportToFocused = e.detail}"></li-checkbox>Export focused in tree</div>
                        <li-button id="Export dbFile" @click="${this._settings}" height="auto" width="auto" padding="4px">Export db (or focused) to file</li-button>
                    </div>
                ` }
                ${!this.dbs.allowImport ? html`` : html`
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
            dbName: { type: String, local: true },
            dbURL: { type: String, local: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },
            replication: { type: Boolean, local: true },
            dbPanel: { type: String, local: true },
            dbs: { type: Object, local: true }
        }
    }

    _setDbName(e) {
        this.dbName = e.target.value;
        if (!this.dbName) this.dbName = 'li-db';
        this.replication = false;
        window.location.href = window.location.href.split('#')?.[0] + '#' + this.dbName;
        location.reload();
    }
    _setdbURL(e) {
        this.dbURL = e.target.value;
    }
    _setReplication(e) {
        this.replication = e.detail;
        if (this.replication) {
            this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
        } else {
            this.replicationHandler.cancel();
        }
    }
})
