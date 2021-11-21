import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js';
import '../checkbox/checkbox.js';
import '../../lib/pouchdb/pouchdb.js';
import './lib/base-tree.js';
import { ChangesMap, LIITEM } from './lib/base-cls.js';

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
            dbsList: { type: Array, local: true },
            dbsMap: { type: Object, local: true },
            _lPanel: { type: String, default: 'tree', save: true, local: true },
            _data: { type: Object, default: {}, local: true },
            selectedRow: { type: Object, global: true },
            ready: { type: Boolean, local: true }
        }
    }

    async firstUpdated() {
        super.firstUpdated();
        this._data = { greateDB: (map, db) => this.greateDB(map, db) }
        const setsDB = new PouchDB('li-base-local-sets');
        try {
            this._data.generalSets = await setsDB.get('_local/generalSets');
        } catch (err) { }
        if (!this._data.generalSets?.dbsList) {
            const sets = {
                _id: '_local/generalSets',
                dbsList: [{
                    label: 'li-base',
                    name: 'li-base-' + LI.ulid().toLowerCase(),
                    path: 'http://admin:54321@localhost:5984/',
                    replicate: false,
                    hide: false,
                    expanded: false
                }]
            }
            await setsDB.put(sets);
        }
        this._data.generalSets = await setsDB.get('_local/generalSets');
        this._data.saveGeneralSets = async () => {
            let sets = await setsDB.get('_local/generalSets')
            this._data.generalSets._rev = sets._rev;
            await setsDB.put(this._data.generalSets);
        }
        this.dbsList = this._data.generalSets.dbsList;
        this.dbsMap ||= new Map();
        this.dbsList.forEach(db => this.greateDB(this.dbsMap, db));
        this.ready = true;
    }

    greateDB(map, db) {
        if (!db?.name) return;
        let local;
        if (!map.has(db.name)) {
            local = new PouchDB(db.name);
            map.set(db.name, { local, changesMap: new ChangesMap(local) })
        }
        local ||= map.get(db.name);
        if (db.path) {
            const remote = new PouchDB(db.path + db.name);
            map.get(db.name).remote = remote;
            if (db.replicate) {
                const handler = local.sync(remote, { live: true });
                map.get(db.name).handler = handler;
            }
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
                <li-button name="save" title="save" @click=${this._click} .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}"></li-button>
            </div>
            <div style="padding: 2px 4px;">
                ${this._lPanel === 'tree' ? html`<li-base-data></li-base-data>` : html``}
                ${this._lPanel === 'settings' ? html`<li-base-settings></li-base-settings>` : html``}
            </div>
        `;
    }

    static get properties() {
        return {
            dbsMap: { type: Object, local: true },
            _lPanel: { type: String, default: 'tree', local: true },
        }
    }

    get _needSave() {
        let size = 0;
        this.dbsMap?.forEach((value, key, map) => size += value.changesMap.size);
        return size > 0;
    }

    _click(e) {
        const title = e.target.title;
        switch (title) {
            case 'save':
                this.dbsMap?.forEach(async (value, key, map) => await value.changesMap.save());
                setTimeout(() => this.$update(), 100);
                return;
        }
        this._lPanel = title;
    }
})

customElements.define('li-base-data', class LiBaseData extends LiElement {
    static get styles() {
        return css`
            .db-row {
                display: flex;
                align-items: center;
                border-bottom: 1px solid lightgray;
                min-height: 20px;
                cursor: pointer;
            }
            .db-row:hover {
                filter: brightness(.9);
            }
            .selected {
                background-color: papayawhip;
                /* box-shadow: inset 0 -2px 0 0 lightblue */
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
                <li-button name="library-add" title="add new" size="20" @click=${this._btnClick}></li-button>
            </div>
            ${(this.dbsList || []).map((i, idx) => html`
                ${i.name && !i.hide ? html`
                    <div class="db-row ${this._selectedDBName === i.name ? 'selected' : undefined}" @click=${e => this._selectRow(e, i)} style="display: flex; ">
                        <li-button back="transparent" title="expand" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}" @click=${e => this._btnClick(e, i)}></li-button>
                        <label style="color: orange;">${i.label || i.name}</label>
                    </div>
                    ${i.expanded ? html`<li-base-tree .item=${this._db(i.name)?.items || {}}></li-base-tree>` : html``}
                ` : html``}
            `)}
        `;
    }

    static get properties() {
        return {
            dbsList: { type: Array, local: true },
            dbsMap: { type: Object, local: true },
            sets: { type: Object, local: true },
            _lPanel: { type: String, default: 'tree', local: true },
            _selectedDBName: { type: String },
            _selectedDB: { type: Object, default: undefined },
            selectedRow: { type: Object, global: true },
            _star: { type: String, default: '' }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('selectedBaseTreeRow', async e => {
            // this._selectedDBName = e.detail.dbName;
            // const db = e.detail;
            // if (!db) return;
            // db.items ||= [];
            // if (!db.items.length) {
            //     const items = await db.allDocs({ include_docs: true, startkey: db.ulid, endkey: db.ulid + '\ufff0' });
            //     items.rows.forEach(i => new LIITEM(db, this.selectedRow, i.doc))
            // }
            // if (db.items.length) db.expanded = true;
            // this.$update();
        })
    }
    updated(e) {
        if (e.has('ready')) {
            this.dbsList.forEach(async i => {
                if (i.expanded && this._db(i.name)) {
                    const db = this._db(i.name);
                    db.items ||= [];
                    if (!db.items.length) {
                        const items = await db.local.allDocs({ include_docs: true, startkey: i.name, endkey: i.name + '\ufff0' });
                        items.rows.forEach(i => new LIITEM(db, undefined, i.doc));
                    }
                }
            })
            this.$update;
        }
    }

    _db(name = this._selectedDBName) {
        return this.dbsMap?.get(name);
    }
    async _selectRow(e, i) {
        this._selectedDB = i;
        this._selectedDBName = i.name;
        this.selectedRow = undefined;
        const db = this._db();
        db.items ||= [];
        if (!db.items.length) {
            const items = await db.local.allDocs({ include_docs: true, startkey: i.name, endkey: i.name + '\ufff0' });
            items.rows.forEach(i => new LIITEM(db, this.selectedRow, i.doc))
        }
        this.$update();
    }
    _btnClick(e, i) {
        const title = e.target.title;
        const db = this._db();
        switch (title) {
            case 'add new':
                if (db) {
                    this.selectedRow = this.selectedRow instanceof LIITEM ? this.selectedRow : undefined;
                    this._selectedDB.expanded = true;
                    const _id = (this.selectedRow?.ulid || this._selectedDBName) + ':' + LI.ulid();
                    const parent = this.selectedRow?._id || this._selectedDBName;
                    const litem = new LIITEM(db, this.selectedRow, { _id, parent });
                    db.changesMap.set(litem);
                    this.$update();
                    console.log(litem);
                }
                break;
            case 'expand':
                i.expanded = !i.expanded;
                break;

            default:
                break;
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
                used databases [${this.dbsList?.length}]:
                <div style="flex: 1"></div>
                <li-button name="remove" title="remove db" size="20" @click=${this._btnClick}></li-button>
                <li-button name="add" title="add db" size="20" @click=${this._btnClick}></li-button>
            </div>
            ${(this.dbsList || []).map((i, idx) => html`
                    <div @click=${e => this._selectRow(e, idx)} style="cursor: pointer; background-color: ${this._sIdx === idx ? 'lightyellow' : 'white'}">
                        <div class="row">
                            <div style="width: 50px; color: ${i.replicate ? 'red' : ''}; opacity: ${i.hide ? .3 : 1}">label:</div>
                            <input class="label" .value="${i.label || ''}" @change="${e => this._setDB(e, i, idx)}">
                        </div>
                        ${this._sIdx === idx ? html`
                            <input class="name" .value=${i.name} style="color: lightgray; border-bottom: 1px solid lightgray; font-size: 12px;padding: 4px;" @change=${e => this._setDB(e, i, idx)}>
                            <div class="row" style="border: none;">
                                <li-checkbox class="replicate" @change="${e => this._setDB(e, i, idx)}" .toggled="${i.replicate}"></li-checkbox>
                                replicate to remote db:
                            </div>
                            <div class="row" style="border: none;">
                                <input class="path" .value="${i.path || ''}" @change="${e => this._setDB(e, i, idx)}">
                            </div>
                            <div class="row">
                                <li-checkbox class="hide" @change="${e => this._setDB(e, i, idx)}" .toggled="${i.hide}"></li-checkbox>
                                hide
                                <div style="flex: 1"></div>
                                <li-button name="file-upload" rotate="180" title="export db" size="19" @click=${this._btnClick}></li-button>
                                <li-button name="file-download" title="import db" size="20" @click=${this._btnClick}></li-button>
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
            dbsList: { type: Array, local: true },
            dbsMap: { type: Object, local: true },
            _sIdx: { type: Number, default: -1 },
            _sName: { type: String, default: '' },
            _data: { type: Object, default: {}, local: true }
        }
    }

    _selectRow(e, idx) {
        this._sName = this.dbsList[idx]?.name || '';
        if (e.srcElement.localName !== 'input' && !e.srcElement.localName.startsWith('li-')) {
            this._sIdx = this._sIdx === idx ? -1 : idx;
        } else {
            this._sIdx = idx;
        }
    }
    _btnClick(e, idx = this._sIdx) {
        const src = e.target.name;
        const db = this.dbsList[idx];
        const map = this.dbsMap ||= new Map();
        switch (src) {
            case 'add':
                const _db = { path: this.dbsList[0]?.path || 'http://admin:54321@localhost:5984/', name: 'li-base-' + LI.ulid().toLowerCase(), hide: true };
                this.dbsList.splice(this.dbsList.length, 0, _db);
                this._sIdx = this.dbsList.length - 1;
                this._data.greateDB(map, db)
                break;
            case 'remove':
                this._destroyDB(map, db, idx);
                break;
        }
        this._data.saveGeneralSets();
        this.$update();
    }
    _destroyDB(map, db, idx) {
        if (db?.name && map?.has(db.name)) {
            map.get(db.name).local.destroy((err, response) => {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("Local Database Deleted");
                }
            });
            map.delete(db.name);
        }
        this.dbsList.splice(idx, 1);
        this._sIdx = this._sIdx > this.dbsList.length - 1 ? this.dbsList.length - 1 : this._sIdx;
    }
    _setDB(e, i, idx) {
        const src = e.target.className;
        const val = e.target.value || '';
        const db = this.dbsList[idx];
        const map = this.dbsMap ||= new Map();
        switch (src) {
            case 'name':
                this._destroyDB(map, db, idx);
                db.name = val;
                this.dbsList.splice(idx, 0, db);
                this._data.greateDB(map, db)
                break;
            case 'label':
                db.label = val;
                break;
            case 'path':
                if (db.name && val) {
                    db.path = val;
                    const local = map.get(db.name).local;
                    const remote = new PouchDB(db.path + db.name);
                    if (local && remote) {
                        map.get(db.name).remote = remote;
                        if (db.replicate) {
                            const handler = local.sync(remote, { live: true });
                            map.get(db.name).handler = handler;
                        }
                    }
                }
                break;
            case 'replicate':
                db.replicate = e.target.toggled;
                const local = map.get(db.name).local;
                const remote = map.get(db.name).remote;
                if (db.replicate && local && remote) {
                    const handler = local.sync(remote, { live: true });
                    map.get(db.name).handler = handler;
                } else {
                    map.get(db.name)?.handler?.cancel();
                }
                break;
            case 'hide':
                db.hide = e.target.toggled;
                break;
        }
        this._data.saveGeneralSets();
        this.$update();
    }
})
