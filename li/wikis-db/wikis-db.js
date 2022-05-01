import { LiElement, html, css } from '../../li.js';

import '../button/button.js'
import '../layout-tree/layout-tree.js';
import '../table/table.js';
import '../../lib/pouchdb/pouchdb.js';
import '../../lib/li-utils/utils.js';
import { LZString } from '../../lib/lz-string/lz-string.js';

const rowPanelCSS = css` .row-panel { display: flex; border-bottom: 1px solid lightgray; padding: 4px 2px; margin-bottom: 2px; }`;
const scrollCSS = css`::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }`;

class ITEM {
    constructor(doc = {}, props = {}) {
        this.doc = doc;
        this.doc.type = doc.type || props.type || 'articles';
        if (doc.label || props.label) this.doc.label = doc.label || props.label;
        else if (this.doc.type === 'articles') this.doc.label = 'new article';
        const ulid = LI.ulid();
        this.doc._id = doc._id || this.doc.type + ':' + ulid;
        this.doc.ulid = doc.ulid || ulid;
        this.doc.created = doc.created || LI.dates(new Date(), true);
        this.items = [];
        Object.keys(props).forEach(key => this[key] = props[key]);
    }
    get _id() { return this.doc._id }
    get ulid() { return this.doc.ulid }
    get created() { return this.doc.created }
    get partsId() { return this.doc.partsId || [] }
    get label() { return this.doc.label }
    set label(v) { this.doc.label = v }
    get parentId() { return this.doc.parentId || '' }
    set parentId(v) { this.doc.parentId = v }
    get partsId() { return this.doc.partsId || [] }
    set partsId(v) { this.doc.partsId = v }
    get _deleted() { return this.doc._deleted }
    set _deleted(v) {
        if (v) {
            this
            this.doc._deleted = v;
        } else {
            delete this.doc._deleted;
        }
    }
}

customElements.define('li-wikis-db', class LiWikisDB extends LiElement {
    static get styles() {
        return [rowPanelCSS, css`
            :host {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                height: 100%;
            }
            .panel {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                height: 100%;
            }
        `]
    }
    render() {
        return html`
            <div class="row-panel">
                <li-button id="tree" name="tree-structure" title="tree" ?toggled=${this.dbPanel === 'tree'} toggledClass="ontoggled" scale=".8" @click=${this.btnClick}></li-button>
                <li-button id="list" name="list" title="list" ?toggled=${this.dbPanel === 'list'} toggledClass="ontoggled" @click=${this.btnClick}></li-button>
                <li-button id="settings" name="settings" title="settings" ?toggled=${this.dbPanel === 'settings'} toggledClass="ontoggled" @click=${this.btnClick}></li-button>
                <div style="flex:1"></div>
                ${this.readOnly ? html`` : html`
                    <li-button id="save" name="save" title="save" @click=${this.btnClick} .fill="${this.needSave ? 'red' : ''}" color="${this.needSave ? 'red' : 'gray'}"></li-button>
                `}
                <li-button id="readonly" name="edit" @click=${this.btnClick} style="margin-right:8px" title="enable edit" fill=${this.readOnly ? 'lightgray' : 'green'} 
                        color="${this.readOnly ? 'lightgray' : 'green'}" back="${this.readOnly ? 'transparent' : '#e9ffdb'}"></li-button>
                <li-button id="reload" name="refresh" title="reload page"  @click="${this.btnClick}"></li-button>
            </div>
            <div class="panel">
                    ${this.dbPanel === 'tree' ? html`<li-wikis-db-three></li-wikis-db-three>` : html``}
                    ${this.dbPanel === 'list' ? html`<li-wikis-db-list></li-wikis-db-list>` : html``}
                    ${this.dbPanel === 'settings' ? html`<li-wikis-db-settings></li-wikis-db-settings></li-base-settings>` : html``}             
            </div>
        `
    }

    static get properties() {
        return {
            name: { type: String, default: 'db', local: true, save: true },
            url: { type: String, default: 'http://admin:54321@localhost:5984/', local: true, save: true },
            rootLabel: { type: String, default: 'wiki-articles' },
            sortLabel: { type: String, default: 'articles' },
            prefix: { type: String, default: 'lidb_', local: true },
            replication: { type: Boolean, default: false, local: true, save: true },
            readOnly: { type: Boolean, default: false, local: true, save: true },
            allowImport: { type: Boolean, default: true, local: true },
            allowExport: { type: Boolean, default: true, local: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },
            dbPanel: { type: String, default: 'tree', local: true, save: true },

            dbLocalStore: { type: Object, local: true },
            articles: { type: Array, default: [], local: true },
            flatArticles: { type: Object, default: {}, local: true },
            sortArticles: { type: Object, default: [], local: true },
            selectedArticle: { type: Object, local: true },
            starArticle: { type: Object, local: true },
            notebook: { type: Object, local: true },
            changedItemsID: { type: Array, default: [], local: true },
            changedItems: { type: Object, default: {}, local: true },
            deletedItemsID: { type: Array, default: [], local: true },
            deletedItems: { type: Object, default: {}, local: true }
        }
    }
    get needSave() { return this.changedItemsID.length || this.deletedItemsID.length };

    constructor() {
        super();
        this._dbName = window.location.href.split('#')?.[1];
        this.listen('changed', (e) => {
            if ((e.detail.type === 'setTreeLabel' || e.detail.type === 'moveTreeItem') && e.detail.item) {
                // console.log(e.detail.item)
                this.changedItemsID.add(e.detail.item._id);
                this.changedItems[e.detail.item._id] = e.detail.item;
            }
        })
    }
    firstUpdated() {
        super.firstUpdated();
        setTimeout(async () => {
            if (this._dbName && this._dbName !== this.name) this.replication = false;
            this.name = this._dbName || this.name;
            if (this.name) {
                const prefix = this.prefix || 'lidb_';
                this.dbLocal = new PouchDB(prefix + this.name);
                this.dbRemote = new PouchDB(this.url + prefix + this.name);
                if (this.replication) this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
                this.firstInit();
            }
        }, 100);
    }
    async updated(e) {
        if (e.has('selectedArticle')) {
            const fn = (e, item) => {
                if (this.readOnly) return;
                e.forEach((value, key) => {
                    if (key === '_deleted' && value) {
                        this.deletedItemsID.add(item._id);
                        this.deletedItems[item._id] = item;
                    } else {
                        item.doc[key] = value;
                        this.changedItemsID.add(item._id);
                        this.changedItems[item._id] = item;
                    }
                });
                this.$update();
            }
            this.notebook = undefined;
            // if (this.selectedArticle.notebook) {
            //     setTimeout(() => {
            //         this.notebook = this.selectedArticle.notebook;
            //         this.$update();
            //     }, 100);
            //     return;
            // }
            this.selectedArticle._items = [];
            this.selectedArticle.notebook = { cells: icaro([]) };
            const parts = await this.dbLocal.allDocs({ keys: this.selectedArticle.partsId || [], include_docs: true });
            parts.rows.map((i, idx) => {
                if (i.doc) {
                    let lzs = LZString.decompressFromUTF16((i.doc.lzs || ''))
                    let doc = lzs ? lzs = JSON.parse(lzs) : i.doc;
                    const item = new ITEM(doc, { type: 'editors', isUse: true });
                    this.selectedArticle._items.push(item);
                    const cell = icaro({
                        _id: item._id,
                        label: doc.label,
                        cell_name: doc.cell_name || doc.name,
                        source: doc.source || doc.value || '',
                        cell_h: doc.cell_h || doc.h,
                        cell_w: doc.cell_w >= 0 ? doc.cell_w : doc.w || '',
                        cell_type: doc.cell_type,
                        sourceHTML: doc.sourceHTML || (doc.label === 'iframe' ? doc.value : ''),
                        sourceJS: doc.sourceJS || '',
                        sourceCSS: doc.sourceCSS || '',
                        sourceJSON: doc.sourceJSON || '{}',
                        useJson: doc.useJson || false,
                        'li-editor-ace': doc['li-editor-ace'] || '',
                        'li-editor-monaco': doc['li-editor-monaco'] || ''
                    })
                    this.selectedArticle.notebook.cells.push(cell);
                    cell.listen(e => fn(e, item));
                }
            })
            this.selectedArticle.notebook.cells.listen((e) => {
                if (this.readOnly) return;
                this.selectedArticle.doc.partsId = [];
                this.selectedArticle.notebook.cells.map((i, idx) => {
                    if (!i._id) {
                        const name = i.cell_name || (i.cell_type === 'markdown' ? 'showdown'
                            : i.cell_type === 'html' || i.cell_type === 'html-cde' || i.cell_type === 'code' ? 'html'
                                : i.cell_type === 'html-executable' ? 'iframe' : 'showdown');
                        const item = new ITEM({ name, h: i.cell_h, cell_type: i.cell_type, label: i.label }, { type: 'editors' });
                        this.selectedArticle._items.push(item);
                        i._id = item._id
                        i = icaro({ ...{}, ...i });
                        i.listen(e => fn(e, item));
                        this.selectedArticle.notebook.cells[idx] = i;
                        this.changedItemsID.add(item._id);
                        this.changedItems[item._id] = item;
                    }
                    this.selectedArticle.doc.partsId.add(i._id);
                })
                this.changedItemsID.add(this.selectedArticle._id)
                this.changedItems[this.selectedArticle._id] = this.selectedArticle
            })
            setTimeout(() => {
                if (this.selectedArticle.notebook) {
                    this.notebook = this.selectedArticle.notebook;
                    this.$update();
                }
            }, 100)
        }
    }

    async firstInit() {
        try { this.rootArticle = await this.dbLocal.get('$wiki:articles') } catch (error) { }
        if (!this.rootArticle) {
            await this.dbLocal.put(new ITEM({ _id: '$wiki:articles', type: 'articles', label: this.rootLabel || 'wiki-articles' }).doc);
            this.rootArticle = await this.dbLocal.get('$wiki:articles');
        }
        this.rootArticle = new ITEM({ ...this.rootArticle });
        this.articles = [this.rootArticle];
        try { this.dbLocalStore = await this.dbLocal.get('_local/store') } catch (error) { };
        this.dbLocalStore ||= {};
        this.flatArticles = await this.getFlatArticles();
        this.selectedArticle = this.flatArticles[this.dbLocalStore['selected-article']] || this.articles[0];
        this.starArticle = this.flatArticles[this.dbLocalStore['star-article']] || undefined;
        this.sortArticles = this.getSortArticles();
        this.$update();
    }
    async getFlatArticles(type = 'articles') {
        const items = await this.dbLocal.allDocs({ include_docs: true, startkey: 'articles', endkey: 'articles' + '\ufff0' });
        if (!items.rows) return;
        const flat = {};
        let toDelete;
        items.rows.forEach(i => flat[i.doc._id] = new ITEM({ ...i.doc }));
        Object.values(flat).forEach(f => {
            if (f.doc['parentId'] === '$wiki:articles') {
                f.parent = this.articles[0];
                this.articles[0].items.push(f);
            } else {
                const i = flat[f.doc['parentId']];
                if (i) {
                    i.items = i.items || [];
                    f.parent = i;
                    i.items.push(f);
                } else {
                    if (!toDelete) {
                        toDelete = new ITEM({ _id: '$todelete:articles', label: 'No parent (to delete ?)', parenID: '$wiki:articles' }, { expanded: true });
                        this.articles[0].items.push(toDelete);
                        this.deletedItemsID.add('$todelete:articles');
                    }
                    f.doc['parentId'] = '$todelete:articles';
                    f.parent = toDelete;
                    toDelete.items.push(f);
                    f._deleted = true;
                    this.deletedItemsID.add(f._id);
                }
            }
        });
        flat['$wiki:articles'] = this.articles[0];
        if (toDelete) flat['$todelete:articles'] = toDelete;
        this.dbLocalStore['expanded-articles']?.forEach(k => flat[k] ? flat[k].expanded = true : '');
        return flat;
    }
    getSortArticles() {
        const rows = [];
        Object.keys(this.flatArticles).sort((a, b) => a.ulid > b.ulid ? 1 : -1).forEach(k => {
            const article = this.flatArticles[k];
            if (article.partsId?.length) {
                article.name = article.label;
                rows.push(article);
            }
        })
        // rows.shift();
        return {
            options: {
                lazy: true,
                headerService: true,
                headerServiceText: 'sort by last add',
                footerHidden: true,
                footerService: true,
                footerServiceTotal: true,
                rowHeight: 50,
                fontSize: '.9rem',
                searchColumns: ['name'],
                readOnly: true
            },
            columns: [{ label: '№', name: '$idx', width: 50 }, { label: this.sortLabel || 'articles', name: 'name', textAlign: 'left', alignItems: 'flex-start', showTitle: true }],
            rows: rows
        }
    }
    btnClick(e) {
        const id = e.target.id;
        const action = {
            tree: () => this.dbPanel = id,
            list: () => this.dbPanel = id,
            settings: () => this.dbPanel = id,
            readonly: () => this.readOnly = !this.readOnly,
            reload: () => document.location.reload(),
            save: () => {
                this.save();
                this.getSortArticles();
            }
        }
        action[id] && action[id]();
        this.$update();
    }
    async save() {
        if (this.changedItemsID?.length) {
            const items = await this.dbLocal.allDocs({ keys: this.changedItemsID, include_docs: true });
            const res = [];
            items.rows.map(i => {
                if (i.doc) {
                    if (i.doc._id.startsWith('editors')) {
                        let lzs = LZString.compressToUTF16(JSON.stringify(this.changedItems[i.doc._id].doc));
                        res.add({ _id: i.doc._id, _rev: i.doc._rev, lzs })
                    } else {
                        res.add({ ...i.doc, ...this.changedItems[i.key].doc });
                    }
                    this.changedItemsID.remove(i.key);
                    if (this.changedItems[i.key] !== this.selectedArticle && this.changedItems[i.key].notebook) {
                        this.changedItems[i.key]._items = this.changedItems[i.key].cells = this.changedItems[i.key].notebook = undefined;
                    }
                }
            })
            this.changedItemsID.forEach(i => {
                let doc = { ...this.changedItems[i].doc };
                if (doc._id.startsWith('editors')) {
                    let lzs = LZString.compressToUTF16(JSON.stringify(doc));
                    res.add({ _id: doc._id, lzs })
                } else {
                    res.add(doc);
                }
            })
            await this.dbLocal.bulkDocs(res);
            this.changedItemsID = [];
            this.changedItems = {};
        }
        if (this.deletedItemsID?.length) {
            const items = await this.dbLocal.allDocs({ keys: this.deletedItemsID, include_docs: true });
            const res = [];
            items.rows.map(async i => {
                if (i.doc) {
                    i.doc._deleted = true;
                    res.add(i.doc);
                    if (i.doc.partsId) {
                        const parts = await this.dbLocal.allDocs({ keys: i.doc.partsId, include_docs: true });
                        // console.log(parts.rows);
                        parts.rows.map(e => {
                            if (e.doc) {
                                e.doc._deleted = true;
                                res.add(e.doc);
                            }
                        })
                    }
                }
            })
            await this.dbLocal.bulkDocs(res);
            this.deletedItemsID = [];
            this.deletedItems = {};
            this.firstInit();
        }
    }
})

customElements.define('li-wikis-db-three', class LiWikisDbThree extends LiElement {
    static get styles() {
        return [rowPanelCSS, scrollCSS, css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
        `]
    }
    render() {
        return html`
            <label class="row-panel">${this.starArticle?.label || 'articles'}</label>
            <div class="row-panel">
                <li-button id="collapse" name="unfold-less" title="collapse" size="20" @click=${this.btnClick}></li-button>
                <li-button id="expand" name="unfold-more" title="expand" size="20" @click=${this.btnClick}></li-button>
                <li-button id="starArticle" name=${this.starIcon} title="set selected as root" size="20" @click=${this.btnClick} borderColor=${this.starColor} fill=${this.starColor}></li-button>
                <li-button id="camera" name="camera" title="save tree state" @click="${this.btnClick}" size="20"></li-button>
                <div style="flex: 1"></div>
                ${this.readOnly ? html`` : html`
                    <li-button id="clearDeleted" name="cached" title="clear deleted" size="20" @click=${this.btnClick}></li-button>
                    <li-button id="delete" name="delete" title="delete" size="20" @click=${this.btnClick} fill="${this.needSave ? 'red' : ''}" .color="${this.needSave ? 'red' : 'gray'}"></li-button>
                    <li-button id="addArticle" name="library-add" title="add new" size="20" @click=${this.btnClick}></li-button>
                `}
            </div>
            <div style="overflow: auto; flex: 1">
                <li-layout-tree .item="${this._articles}" .selected="${this.selectedArticle}" @selected="${this.onselected}" style="overflow: auto;"
                    allowEdit allowCheck iconSize="20"></li-layout-tree>
            </div>
        `
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            dbLocal: { type: Object, local: true },
            dbLocalStore: { type: Object, local: true },
            articles: { type: Array, local: true },
            flatArticles: { type: Object, local: true },
            selectedArticle: { type: Object, local: true },
            starArticle: { type: Object, local: true },
            changedItemsID: { type: Array, local: true },
            changedItems: { type: Object, local: true },
            deletedItemsID: { type: Array, local: true },
            deletedItems: { type: Object, local: true },
        }
    }
    get starColor() { return this.starArticle ? 'orange' : '' }
    get starIcon() { return this.starArticle ? 'star' : 'star-border' }
    get _articles() { return this.starArticle || this.articles }
    get needSave() { return this.deletedItemsID.length }

    btnClick(e) {
        const id = e.target.id;
        const action = {
            collapse: () => {
                LIUtils.arrSetItems(this.selectedArticle, 'expanded', false);
            },
            expand: () => {
                LIUtils.arrSetItems(this.selectedArticle, 'expanded', true);
            },
            starArticle: () => {
                if (this.starArticle) {
                    // this.selectedArticle = this.starArticle;
                    this.starArticle = undefined;
                } else if (this.selectedArticle?.items?.length) {
                    this.starArticle = this.selectedArticle;
                }
            },
            camera: async () => {
                const expanded = [];
                Object.keys(this.flatArticles).map(key => { if (this.flatArticles[key]?.expanded) expanded.push(key) });
                let _ls = {};
                try {
                    _ls = await this.dbLocal.get('_local/store')
                } catch (error) { }
                _ls._id = '_local/store';
                _ls['selected-article'] = this.selectedArticle?._id || '';
                _ls['expanded-articles'] = expanded;
                _ls['star-article'] = this.starArticle?._id || '';
                await this.dbLocal.put(_ls);
                this.dbLocalStore = await this.dbLocal.get('_local/store');

            },
            addArticle: () => {
                let item = new ITEM({ parentId: this.selectedArticle._id }, { parent: this.selectedArticle, changed: true, isNew: true });
                this.selectedArticle.items.splice(this.selectedArticle.items.length, 0, item);
                this.selectedArticle.expanded = true;
                this.flatArticles[item._id] = item;
                this.changedItemsID ||= [];
                this.changedItemsID.add(item._id);
                this.changedItems ||= {};
                this.changedItems[item._id] = item;
                this.$update();
            },
            delete: () => {
                this.articles[0].checked = false;
                const itemToDelete = LIUtils.arrFindItem(this.articles[0], 'checked', true);
                if (!itemToDelete || (confirm && !window.confirm(`Do you really want delete selected and all children articles?`))) return;
                Object.keys(this.flatArticles).forEach(key => {
                    const item = this.flatArticles[key];
                    if (item.checked) {
                        item.checked = false;
                        item._deleted = true;
                        this.deletedItemsID.add(key);
                        item._partsId?.forEach(i => this.deletedItemsID.add(i));
                        item.partsId?.forEach(i => this.deletedItemsID.add(i));
                    }
                })
            },
            clearDeleted: () => {
                Object.keys(this.flatArticles).forEach(key => { if (this.flatArticles[key]._deleted) this.flatArticles[key]._deleted = false })
                this.deletedItemsID = [];
                this.$update();
            }
        }
        action[id] && action[id]();
        this.$update();
    }
    onselected(e) {
        this.selectedArticle = e.detail;
    }
})

customElements.define('li-wikis-db-list', class LiWikisDblist extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
        `
    }
    render() {
        return html`
            <li-table .data=${this.sortArticles} style="cursor: pointer;"></li-table> 
        `
    }

    static get properties() {
        return {
            sortArticles: { type: Object, local: true },
            selectedArticle: { type: Object, local: true },
        }
    }

    constructor() {
        super();
        this.listen('tableRowSelect', async e => {
            this.selectedArticle = e.detail?.row;
            this.$update();
        });
    }
})

customElements.define('li-wikis-db-settings', class LiWikisSettings extends LiElement {
    static get styles() {
        return [scrollCSS, rowPanelCSS, css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
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
                <div style="color:gray; opacity: 0.7; margin-left: auto; font-size: 12px;">version: 1.0.1</div>
            </div>
            <div style="flex-direction: column; overflow: auto; padding-top: -4px;">
                <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.name}" @change="${this.setDbName}"></div>
                <div style="color: gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Couchdb settings:</div>
                <div style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px">db  url:</div><input .value="${this.url}" @change="${this.setdbURL}"></div>
                <div style="display: flex; align-items: center;"><li-checkbox @change="${this.setReplication}" .toggled="${this.replication}"></li-checkbox>
                    Auto replication local and remote db</div>
                <div class="row-panel"></div>
                ${!this.readOnly && this.dbLocal ? html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <li-button id="compacting" @click="${this.btnClick}" height="auto" width="auto" padding="4px">Compacting current database</li-button>
                        <div style="display: flex; align-items: center;"><li-checkbox id="also-delete-remote"></li-checkbox>Also delete remoteDB</div>
                        <li-button id="delete" @click="${this.btnClick}" height="auto" width="auto" padding="4px">Delete current localDB</li-button>
                    </div>
                ` : html``}
                ${this.allowExport && this.dbLocal ? html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Export database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox id="focused-export"></li-checkbox>Export checked in focused article</div>
                        <li-button id="export" height="auto" width="auto" padding="4px" @click=${this.btnClick}>Export db (or focused) to file</li-button>
                    </div>
                ` : html``}
                ${this.allowImport && this.dbLocal ? html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Import database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox id="focused-import"></li-checkbox>Import to focused article</div>
                        <li-button for="import" height="auto" width="auto" padding="4px" @click=${() => { this.$id('import').click() }}>Импорт db</li-button>
                        <input id="import" type="file" id="import" @change=${this.btnClick} style="display: none"/>
                    </div>
                ` : html``}
                <div class="row-panel" style="display: flex; flex-direction: column;">
                    <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Copy to new compress database:</div>
                    <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.newName}" @change="${this.setNewDbName}"></div>
                    <div style="display: flex; align-items: center;"><li-checkbox id="copy-replicate"></li-checkbox>Replicate to new remote db</div>
                    <div style="display: flex; align-items: center;"><li-checkbox id="copy-selected"></li-checkbox>Copy checked in focused article</div>
                    <li-button id="copy" height="auto" width="auto" padding="4px" @click=${this.btnClick}>Copy to new db</li-button>
                </div>
            </div>
        `
    }

    static get properties() {
        return {
            name: { type: String, local: true },
            url: { type: String, local: true, },
            prefix: { type: String, local: true },
            replication: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            allowImport: { type: Boolean, local: true },
            allowExport: { type: Boolean, local: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },
            dbPanel: { type: String, local: true },
            selectedArticle: { type: Object, local: true },
            flatArticles: { type: Object, local: true }
        }
    }
    get newName() { return this._newName || this.name + '_copy' }
    set newName(v) { this._newName = v }

    setDbName(e) {
        this.name = e.target.value;
        if (!this.name) this.name = 'db';
        this.replication = false;
        window.location.href = window.location.href.split('#')?.[0] + '#' + this.name;
        location.reload();
    }
    setdbURL(e) {
        this.url = e.target.value;
        this.$update();
    }
    setReplication(e) {
        this.replication = e.detail;
        if (this.replication) {
            this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
        } else {
            this.replicationHandler.cancel();
            this.replicationHandler = undefined;
        }
        this.$update();
    }
    setNewDbName(e) {
        this._newName = e.target.value;
    }
    btnClick(e) {
        const id = e.target.id;
        const action = {
            compacting: () => {
                if (!window.confirm(`Do you really want compacting current localDB ?`)) return;
                this.dbLocal.compact().then(function(info) {
                    console.log('Local compaction complete');
                }).catch(function(err) {
                    return console.log(err); f
                });
            },
            delete: () => {
                if (!window.confirm(`Do you really want delete current localDB ${this.$qs('#also-delete-remote').toggled ? 'and remoteDB' : ''} ?`)) return;
                this.replication = false;
                this.name = '';
                if (this.$qs('#also-delete-remote').toggled) {
                    this.dbRemote.destroy((err, response) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            console.log("Remote CouchDB Database Deleted");
                        }
                    });
                }
                this.dbLocal.destroy((err, response) => {
                    if (err) {
                        return console.log(err);
                    } else {
                        console.log("Local Database Deleted");
                    }
                });
                setTimeout(() => {
                    let url = window.location.href.split('#')?.[0];
                    window.open(url, '_parent');
                }, 500);
            },
            export: async (e) => {
                let saveFile = async (json, name) => {
                    let str = JSON.stringify(json);
                    if (!str || !name) return;
                    const blob = new Blob([str], { type: "text/plain" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = name + '.json';
                    a.click();
                    this.$update();
                }
                if (!this.$qs('#focused-export').toggled) {
                    await this.dbLocal.allDocs({ include_docs: true }, (error, doc) => {
                        if (error) console.error(error);
                        else saveFile(doc.rows.map(({ doc }) => doc), this.name);
                    })
                } else {
                    const
                        keys = [],
                        root = '$wiki:articles',
                        parent = this.selectedArticle._id,
                        arr = LIUtils.arrAllChildren(this.selectedArticle);
                    keys.add(parent);
                    (this.selectedArticle.doc.partsId || []).map(id => keys.add(id));
                    arr.map(i => {
                        if (i.checked) {
                            keys.add(i._id);
                            (i.doc.partsId || []).map(id => keys.add(id));
                        }
                    })
                    await this.dbLocal.allDocs({ include_docs: true, keys }, (error, doc) => {
                        if (error) console.error(error);
                        else {
                            doc.rows.map(({ doc }) => {
                                if (doc.parentId === parent) doc.parentId = root;
                                if (doc._id === parent) doc._id = root;
                            })
                            saveFile(doc.rows.map(({ doc }) => doc), this.selectedArticle.label);
                        }
                    })
                }
            },
            import: async () => {
                const file = e.target.files[0];
                const importToFocused = this.$qs('#focused-import').toggled;
                if (importToFocused && !window.confirm(`Do you really want import to focused article ?`)) return;
                if (!importToFocused && !window.confirm(`Do you really want rewrite current Database ?`)) return;
                this.replication = false;
                this.replicationHandler?.cancel();
                this.replicationHandler = undefined;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        let result = JSON.parse(e.target.result);
                        if (importToFocused) {
                            const ulid = LI.ulid();
                            result.forEach(i => {
                                if (i._id === '$wiki:articles') {
                                    i._id = 'articles:' + ulid;
                                    i.ulid = LI.ulid();
                                    i.parentId = this.selectedArticle._id;
                                }
                                if (i.parentId === '$wiki:articles') i.parentId = 'articles:' + ulid;
                            })
                        }
                        if (!importToFocused) {
                            this.dbLocal = new PouchDB('lidb_' + this.name);
                            this.dbRemote = new PouchDB(this.url + 'lidb_' + this.name);
                            if (this.replication) this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
                        }
                        await this.dbLocal.bulkDocs(
                            result,
                            { new_edits: false },
                            (...args) => {
                                console.log('DONE', args)
                                this.$update();
                                setTimeout(() => document.location.reload(), 500);
                            }
                        )
                    };
                    reader.readAsText(file);
                }
            },
            copy: async () => {
                const prefix = this.prefix || 'lidb_';
                const dbLocalNew = new PouchDB(prefix + this.newName);
                if (this.$qs('#copy-replicate').toggled) {
                    const dbRemoteNew = new PouchDB(this.url + prefix + this.newName);
                    this.replicationHandlerNew = dbLocalNew.sync(dbRemoteNew, { live: true });
                }
                let items;
                const copy_selected = this.$qs('#copy-selected').toggled;
                const parent = this.selectedArticle._id;
                if (copy_selected) {
                    const keys = [];
                    const arr = LIUtils.arrAllChildren(this.selectedArticle);
                    keys.add(parent);
                    (this.selectedArticle.doc.partsId || []).map(id => keys.add(id));
                    arr.map(i => {
                        if (i.checked) {
                            keys.add(i._id);
                            (i.doc.partsId || []).map(id => keys.add(id));
                        }
                    })
                    items = await this.dbLocal.allDocs({ keys, include_docs: true });
                } else {
                    items = await this.dbLocal.allDocs({ include_docs: true });
                }
                const res = [];
                const root = '$wiki:articles'
                items.rows.map(i => {
                    if (i.doc) {
                        if (copy_selected) {
                            if (i.doc.parentId === parent) i.doc.parentId = root;
                            if (i.doc._id === parent) i.doc._id = root;
                        }
                        delete i.doc._rev;
                        if (i.doc._id.startsWith('editors')) {
                            let lzs = LZString.decompressFromUTF16((i.doc.lzs || ''))
                            let doc = lzs ? JSON.parse(lzs) : i.doc;
                            lzs = LZString.compressToUTF16(JSON.stringify(doc));
                            res.add({ _id: i.doc._id, lzs })
                        } else {
                            res.add({ ...i.doc });
                        }
                    }
                })
                await dbLocalNew.bulkDocs(res);
                console.log('done copy');
            }
        }
        action[id] && action[id](e);
        this.$update();
    }
})
