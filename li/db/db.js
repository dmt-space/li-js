import { LiElement, html, css } from '../../li.js';

import '../button/button.js'
import '../layout-tree/layout-tree.js';
import '../table/table.js';
import '../../lib/pouchdb/pouchdb.js';
import '../../lib/li-utils/utils.js';

const rowPanelCSS = css` .row-panel { display: flex; border-bottom: 1px solid lightgray; padding: 4px 2px; margin-bottom: 2px; }`;
const scrollCSS = css`::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }`;

class ITEM {
    constructor(doc = {}, props = {}) {
        this.doc = doc;
        this.doc.type = doc.type || props.type || 'articles';
        this.doc.label = doc.label || props.label || 'new-article';
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

customElements.define('li-db', class LiDb extends LiElement {
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
                <li-button id="reload" name="refresh" title="reload page"  @click="${this.btnClick}"></li-button>
                ${this.readOnly ? html`` : html`
                    <li-button id="save" name="save" title="save" @click=${this.btnClick} .fill="${this.needSave ? 'red' : ''}" .color="${this.needSave ? 'red' : 'gray'}"></li-button>
                `}
            </div>
            <div class="panel">
                    ${this.dbPanel === 'tree' ? html`<li-db-three></li-db-three>` : html``}
                    ${this.dbPanel === 'list' ? html`<li-db-list></li-db-list>` : html``}
                    ${this.dbPanel === 'settings' ? html`<li-db-settings></li-db-settings></li-base-settings>` : html``}             
            </div>
        `
    }

    static get properties() {
        return {
            name: { type: String, default: 'db/', local: true, save: true },
            url: { type: String, default: 'http://admin:54321@localhost:5984/', local: true, save: true },
            replication: { type: Boolean, default: false, local: true, save: true },
            readOnly: { type: Boolean, default: false, local: true },
            allowImport: { type: Boolean, default: true, local: true },
            allowExport: { type: Boolean, default: true, local: true },
            dbLocal: { type: Object, default: {}, local: true },
            dbRemote: { type: Object, default: {}, local: true },
            replicationHandler: { type: Object, default: {}, local: true },
            dbPanel: { type: String, default: 'tree', local: true },

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
            deletedItems: { type: Object, default: {}, local: true },
        }
    }
    get needSave() { return this.changedItemsID.length || this.deletedItemsID.length };

    constructor() {
        super();
        this._dbName = window.location.href.split('#')?.[1];
    }
    firstUpdated() {
        super.firstUpdated();
        setTimeout(async () => {
            if (this._dbName && this._dbName !== this.name) this.replication = false;
            this.name = this._dbName || this.name;
            if (this.name) {
                const prefix = 'lidb_'
                this.dbLocal = new PouchDB(prefix + this.name);
                this.dbRemote = new PouchDB(this.url + prefix + this.name);
                if (this.replication) this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
                this.firstInit();
            }
        }, 100);
    }
    async updated(e) {
        if (e.has('selectedArticle')) {
            this.notebook = { cells: icaro([]) };
            if (!this.selectedArticle?.partsId) return;
            const parts = await this.dbLocal.allDocs({ keys: this.selectedArticle.partsId, include_docs: true });
            parts.rows.map((i, idx) => {
                if (i.doc) {
                    const cell = icaro({ cell_name: i.doc.name, cell_type: i.doc.cell_type, source: i.doc.value, order: idx, cell_h: i.doc.cell_h || i.doc.h })
                    i.doc && this.notebook.cells.push(cell);
                    const item = new ITEM(i.doc, { type: 'editors' });
                    console.log(item._id, i.id)
                    cell.listen((e) => {
                        // console.log(e.get('source'));
                        item.doc.value = e.get('source')
                        this.changedItemsID.add(item._id)
                        this.changedItems[item._id] = item
                        console.log(item._id, Object.fromEntries(e))
                    })
                }
            });
            this.notebook.cells.listen((e) => {
                this.selectedArticle.doc.partsId = [];
                this.notebook.cells.forEach(i => {
                    const name = i.cell_name || i.cell_type === 'markdown' ? 'showdown'
                        : i.cell_type === 'html' || i.cell_type === 'html-cde' || i.cell_type === 'code' ? 'html'
                            : i.cell_type === 'html-executable' ? 'iframe' : 'showdown';
                    const item = new ITEM({ name, value: i.source, h: i.cell_h, cell_type: i.cell_type  }, { type: 'editors' });
                    //if (!i.listen) i.listen((e) => {
                    item.doc.value = e.get('source')
                    this.changedItemsID.add(item._id)
                    this.changedItems[item._id] = item
                    console.log(item._id, Object.fromEntries(e))
                    this.changedItemsID.add(item._id)
                    this.changedItems[item._id] = item
                    //})
                    this.selectedArticle.doc.partsId.push(item._id);
                })
                this.changedItemsID.add(this.selectedArticle._id)
                this.changedItems[this.selectedArticle._id] = this.selectedArticle
            })
            this.$update();
        }
    }

    async firstInit() {
        try { this.rootArticle = await this.dbLocal.get('$wiki:articles') } catch (error) { }
        if (!this.rootArticle) {
            await this.dbLocal.put(new ITEM({ _id: '$wiki:articles', type: 'articles', label: 'wiki-articles' }).doc);
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
                        toDelete = new ITEM({ _id: '$todelete:articles', label: 'No parent (to delete ?)', parenID: '$wiki:articles' }, { expanded: true, _deleted: true });
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
        rows.shift();
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
            columns: [{ label: '№', name: '$idx', width: 50 }, { label: 'articles', name: 'name', textAlign: 'left', alignItems: 'flex-start', showTitle: true }],
            rows: rows
        }
    }
    btnClick(e) {
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
                    res.add({ ...i.doc, ...this.changedItems[i.key].doc });
                    this.changedItemsID.remove(i);
                }
            })
            this.changedItemsID.forEach(i => res.add(this.changedItems[i].doc));
            await this.dbLocal.bulkDocs(res);
            this.changedItemsID = [];
            this.changedItems = {};
        }
        if (this.deletedItemsID?.length) {
            const items = await this.dbLocal.allDocs({ keys: this.deletedItemsID, include_docs: true });
            const res = [];
            items.rows.map(i => {
                if (i.doc) {
                    i.doc._deleted = true;
                    res.add(i.doc);
                }
            })
            await this.dbLocal.bulkDocs(res);
            this.deletedItemsID = [];
            this.deletedItems = {};
            this.firstInit();
        }
    }
})

customElements.define('li-db-three', class LiDbThree extends LiElement {
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
                    <li-button id="clearDeleted" name="restore" title="clear deleted" size="20" @click=${this.btnClick}></li-button>
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

customElements.define('li-db-list', class LiDblist extends LiElement {
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

customElements.define('li-db-settings', class LiSettings extends LiElement {
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
                <div style="color:gray; opacity: 0.7; margin-left: auto; font-size: 12px;">version: 0.0.1</div>
            </div>
            <div style="flex-direction: column; overflow: auto; padding-top: -4px;">
                <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.name}" @change="${this.setDbName}"></div>
                <div style="color: gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Couchdb settings:</div>
                <div style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px">db  url:</div><input .value="${this.url}" @change="${this.setdbURL}"></div>
                <div style="display: flex; align-items: center;"><li-checkbox @change="${this.setReplication}" .toggled="${this.replication}"></li-checkbox>
                    Auto replication local and remote db</div>
                <div class="row-panel"></div>
                ${this.readOnly ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <li-button id="Compacting db" @click="${this._settings}" height="auto" width="auto" padding="4px">Compacting current database</li-button>
                        <li-button id="Delete db" @click="${this._settings}" height="auto" width="auto" padding="4px">Delete current database</li-button>
                    </div>
                ` }
                ${!this.allowExport ? html`` : html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Export database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox @change="${e => this._exportToFocused = e.detail}"></li-checkbox>Export focused in tree</div>
                        <li-button id="Export dbFile" @click="${this._settings}" height="auto" width="auto" padding="4px">Export db (or focused) to file</li-button>
                    </div>
                ` }
                ${!this.allowImport ? html`` : html`
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
            name: { type: String, local: true },
            url: { type: String, local: true, },
            replication: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            allowImport: { type: Boolean, local: true },
            allowExport: { type: Boolean, local: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },
            dbPanel: { type: String, local: true }
        }
    }

    setDbName(e) {
        this.name = e.target.value;
        if (!this.name) this.name = 'li-db';
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
})
