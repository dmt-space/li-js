import { LiElement, html, css } from '../../li.js';
import '../../lib/li-utils/utils.js';

import '../layout-app/layout-app.js';
import '../button/button.js';
import '../checkbox/checkbox.js';
import '../../lib/pouchdb/pouchdb.js';
import './lib/base-tree.js';
import '../editor-ace/editor-ace.js';
import '../editor-monaco/editor-monaco.js';
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
                    <li-editor-ace id="ace" mode="json" theme="chrome" .options=${{ fontSize: 16, minLines: 80 }}></li-editor-ace>
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
        this._data = { greateDB: (map, db) => this.greateDB(map, db), _createTree: (map, expandedList) => this._createTree(map, expandedList) }
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
                    path: 'http://admin:54321@127.0.0.1:5984/',
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
        this._count = this.dbsList.length;
        this.dbsList.forEach(db => this.greateDB(this.dbsMap, db));

        this.listen('dbAction', (e) => {
            console.log(e);
            this.$id('ace').src = JSON.stringify(e.detail.liitem.doc, null, 4);
        })
    }

    async greateDB(map, db) {
        if (!db?.name) return;
        let localDB;
        if (!map.has(db.name)) {
            localDB = new PouchDB(db.name);
            map.set(db.name, { localDB, changesMap: new ChangesMap(localDB) })
        }
        const dbm = map.get(db.name);
        dbm.db = db;
        if (db.path) {
            localDB ||= dbm.localDB;
            const remoteDB = new PouchDB(db.path + db.name);
            dbm.remoteDB = remoteDB;
            if (db.replicate) {
                const handler = localDB.sync(remoteDB, { live: true });
                dbm.handler = handler;
            }
        }
        let doc, id = 'libs--tree:root';
        try {
            doc = await localDB.get(id);
        } catch (err) { }
        if (!doc) {
            const item = new LIITEM();
            item.doc._id = id;
            await localDB.put(item.doc);
            doc = await localDB.get(id);
        }
        dbm.liitem = new LIITEM(dbm, null, doc);
        await this._createTree(dbm);
        dbm.liitem.expanded = db.expanded;
        this._count--;
        if (this._count <= 0) {
            this.ready = true;
            this.$update();
        }
    }
    async _createTree(dbm, expandedList) {
        expandedList ||= dbm.db.expandedList;
        const items = await dbm.localDB.allDocs({ include_docs: true, startkey: 'libs-tree', endkey: 'libs-tree' + '\ufff0' });
        dbm.flat = {};
        dbm.liitem.items = [];
        const rootParent = 'libs--tree:root';
        items.rows.forEach(i => dbm.flat[i.doc._id] = new LIITEM(dbm, null, i.doc));
        Object.values(dbm.flat).forEach(f => {
            if (f.doc.parent === rootParent) {
                dbm.liitem.items.push(f);
                f.parent = dbm.liitem;
            } else {
                const i = dbm.flat[f.doc.parent];
                if (i) {
                    i.items ||= [];
                    f.parent = i;
                    i.items.push(f);
                }
            }
        })
        expandedList ||= [];
        expandedList.forEach(i => {
            if (dbm.flat[i]) dbm.flat[i].expanded = true;
        })
    }
})

customElements.define('li-base-lpanel', class LiBaseLPanel extends LiElement {
    render() {
        return html`
            <div style="display: flex; border-bottom: 1px solid lightgray; padding: 2px;">
                <li-button name="tree-structure" title="tree" ?toggled=${this._lPanel === 'tree'} toggledClass="ontoggled" scale=".8" @click=${this._click}></li-button>
                <li-button name="settings" title="settings" ?toggled=${this._lPanel === 'settings'} toggledClass="ontoggled" @click=${this._click}></li-button>
                <div style="flex:1"></div>
                <li-button name="refresh" title="reload page"  @click="${() => document.location.reload()}"></li-button>
                <li-button name="save" title="save" @click=${this._click} .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}"></li-button>
            </div>
            <div style="padding-left: 2px;">
                ${this._lPanel === 'tree' ? html`<li-base-data></li-base-data>` : html``}
                ${this._lPanel === 'settings' ? html`<li-base-settings></li-base-settings>` : html``}
            </div>
        `;
    }

    static get properties() {
        return {
            dbsMap: { type: Object, local: true },
            _lPanel: { type: String, default: 'tree', local: true },
            _data: { type: Object, default: {}, local: true },
        }
    }

    get _needSave() {
        let size = 0;
        this.dbsMap?.forEach((value, key, map) => size += (value.changesMap.size || value._hasDeleted ? 1 : 0));
        return size > 0;
    }

    _click(e) {
        const title = e.target.title;
        switch (title) {
            case 'save':
                this.dbsMap?.forEach(async (value, key, map) => {
                    const expandedList = []
                    Object.values(value.flat).forEach(f => {
                        if (f._deleted) {
                            f.doc._deleted = true;
                            value.changesMap.set(f);
                        } else f.doc._deleted = undefined;
                        f._deleted = undefined;
                        if (f.expanded)
                            expandedList.push(f._id);
                    })
                    value._hasDeleted = undefined;
                    await value.changesMap.save();
                    this._data._createTree(value, expandedList);
                });
                setTimeout(() => this.$update(), 100);
                return;
        }
        this._lPanel = title;
    }
})

customElements.define('li-base-data', class LiBaseData extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
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
            .show {
                opacity: 1;
                transition: opacity 1s; 
            }

            .hide {
                opacity: 0;
            }
        `;
    }
    render() {
        return html`
            <div class="${this.isReady ? 'show' : 'hide'}" style="display: flex; flex-direction: column; overflow: hidden; width: 100%; height: calc(100% - 40px);">
                <div style="display: flex; border-bottom: 1px solid lightgray;padding: 4px 0;">
                    databases:
                </div>
                <div style="display:flex; border-bottom:1px solid lightgray;width:100%; padding: 4px 0;">
                    <li-button name="${this._satr ? 'star' : 'star-border'}" title="set selected as root" size="20" @click=${this._btnClick}
                        borderColor="${this._star ? 'orange' : ''}" fill="${this._star ? 'orange' : ''}"></li-button>
                    <li-button name="camera" title="save tree state" @click="${this._saveTreeState}" size="20"></li-button>
                    <div style="flex: 1"></div>
                    <li-button name="cached" title="clear deleted" size="20" @click=${this._btnClick}></li-button>
                    <li-button name="delete" title="delete" size="20" @click=${this._btnClick}></li-button>
                    <li-button name="library-add" title="add new" size="20" @click=${this._btnClick}></li-button>
                </div>
                <div style="display: flex; flex-direction: column; flex: 1; overflow-y: auto;">
                    ${this._star ? html`
                        <div style="border-bottom: 2px solid orange;padding: 4px 0; color: orange">
                            <div style="color: lightgray; padding-bottom: 4px; font-size: 12px; border-bottom: 1px solid lightgray">${this._db().db.label}</div>
                            <div>${this._star.label}</div>
                        </div>
                        <li-base-tree .item=${this._star}></li-base-tree>
                    ` : (this.dbsList || []).map((i, idx) => html`
                        ${i.name && !i.hide ? html`
                            <div class="db-row ${this._selectedDBName === i.name ? 'selected' : undefined}" @click=${e => this._selectBaseRow(e, i)} style="display: flex;">
                                <li-button back="transparent" title="expand" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}" @click=${e => this._btnClick(e, i)}></li-button>
                                <label style="color: ${i.replicate ? 'orange' : 'cadetblue'}" @click=${() => i.expanded = true}>${i.label || i.name}</label>
                            </div>
                            ${i.expanded ? html`<li-base-tree .item=${this._db(i.name)?.liitem?.items || []}></li-base-tree>` : html``}
                        ` : html``}
                    `)}
                </div>
            </div>
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
            _star: { type: Object },
            _data: { type: Object, default: {}, local: true },
            ready: { type: Boolean, local: true },
            isReady: { type: Boolean }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('selectedBaseTreeRow', async e => this._selectedDBName = e.detail.dbName);
    }
    updated(e) {
        if (e.has('ready')) {
            this._selectedDBName = this.dbsList.filter(i => !i.hide)[0].name; // this._data.generalSets.selectedDBName;
            this.dbsList.filter(i => !i.hide)[0].expanded = true;
            if (this._data.generalSets.selectedRow && this._db().flat[this._data.generalSets.selectedRow])
                this.selectedRow = this._db().flat[this._data.generalSets.selectedRow];
            if (this._data.generalSets.star && this._db().flat[this._data.generalSets.star])
                this._star = this._db().flat[this._data.generalSets.star];
            this.isReady = true;
        }
    }

    _db(name = this._selectedDBName) {
        return this.dbsMap?.get(name);
    }
    _selectBaseRow(e, i) {
        this._selectedDBName = i.name;
        this.selectedRow = undefined;
        this.$update();
    }
    _btnClick(e, i) {
        const title = e.target.title;
        const db = this._db();
        switch (title) {
            case 'add new':
                if (db) {
                    this.selectedRow = this.selectedRow instanceof LIITEM ? this.selectedRow : undefined;
                    db.expanded = true;
                    const _id = 'libs-tree:' + LI.ulid();
                    const parent = this.selectedRow?._id || 'libs--tree:root';
                    const litem = new LIITEM(db, this.selectedRow || db.liitem, { _id, parent });
                    db.changesMap.set(litem);
                    this._db().flat[_id] = litem;
                }
                break;
            case 'expand':
                this._selectBaseRow(e, i);
                i.expanded = !i.expanded;
                break;
            case 'set selected as root':
                if (!this._star && this.selectedRow)
                    this._star = this.selectedRow;
                else {
                    this._star = undefined;
                }
                break;
            case 'delete':
                Object.values(this._db().flat).forEach(f => {
                    if (f.checked) f._deleted = true;
                    this._db()._hasDeleted = true;
                })
                break;
            case 'clear deleted':
                Object.values(this._db().flat).forEach(f => {
                    f._deleted = undefined;
                    this._db()._hasDeleted = false;
                })
                break;
        }
        this.$update();
    }
    _saveTreeState(e) {
        this._data.generalSets.dbsList.forEach(db => {
            const dbm = this.dbsMap?.get(db.name);
            db.expandedList = [];
            Object.keys(dbm.flat).forEach(k => {
                if (dbm.flat[k].expanded) db.expandedList.push(k);
            })
        })
        this._data.generalSets.selectedDBName = this._selectedDBName || '';
        this._data.generalSets.selectedRow = this.selectedRow?._id || '';
        this._data.generalSets.star = this._star?._id || '';
        this._data.saveGeneralSets();
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
                            <div style="width: 50px; color: ${i.replicate ? 'orange' : 'cadetblue'}; opacity: ${i.hide ? .5 : 1}">label:</div>
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
                const _db = { path: this.dbsList[0]?.path || 'http://admin:54321@127.0.0.1:5984/', name: 'li-base-' + LI.ulid().toLowerCase(), hide: true };
                this.dbsList.splice(this.dbsList.length, 0, _db);
                this._sIdx = this.dbsList.length - 1;
                this._data.greateDB(map, _db)
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
            map.get(db.name).localDB.destroy((err, response) => {
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
    _setDB(e, i, idx = this._sIdx) {
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
                    const localDB = map.get(db.name).localDB;
                    const remoteDB = new PouchDB(db.path + db.name);
                    if (localDB && remoteDB) {
                        map.get(db.name).remoteDB = remoteDB;
                        if (db.replicate) {
                            const handler = localDB.sync(remoteDB, { live: true });
                            map.get(db.name).handler = handler;
                        }
                    }
                }
                break;
            case 'replicate':
                let repl = 0;
                if (e.target.toggled) {
                    this.dbsList.forEach(i => { if (i.replicate) repl++ });
                }
                if (repl >= 5) {
                    e.target.toggled = false;
                    return;
                }
                db.replicate = e.target.toggled;
                const localDB = map.get(db.name).localDB;
                const remoteDB = map.get(db.name).remoteDB;
                if (db.replicate && localDB && remoteDB) {
                    const handler = localDB.sync(remoteDB, { live: true });
                    map.get(db.name).handler = handler;
                } else {
                    map.get(db.name)?.handler?.cancel();
                }
                break;
            case 'hide':
                // if (!e.target.toggled) {
                //     this.dbsList.forEach(i => {
                //         i.hide = true;
                //         i.replicate = false;
                //     });
                // }
                db.hide = e.target.toggled;
                break;
        }
        this._data.saveGeneralSets();
        this.$update();
    }
})
