import { LiElement, html, css } from '../../li.js';

import '../button/button.js'
import '../layout-tree/layout-tree.js';
import '../table/table.js';
import '../../lib/pouchdb/pouchdb.js';

import { ITEM, BOX } from '../wiki/data.js';

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
                <li-button id="tree" name="tree-structure" title="tree" ?toggled=${this.dbPanel === 'tree'} toggledClass="ontoggled" scale=".8" @click=${this.btnClick}></li-button>
                <li-button id="list" name="list" title="list" ?toggled=${this.dbPanel === 'list'} toggledClass="ontoggled" @click=${this.btnClick}></li-button>
                <li-button id="settings" name="settings" title="settings" ?toggled=${this.dbPanel === 'settings'} toggledClass="ontoggled" @click=${this.btnClick}></li-button>
                <div style="flex:1"></div>
                <li-button id="reload" name="refresh" title="reload page"  @click="${this.btnClick}"></li-button>
                ${this.readOnly ? html`` : html`
                    <li-button id="save" name="save" title="save" @click=${this.btnClick} .fill="${this.needSave ? 'red' : ''}" .color="${this.needSave ? 'red' : 'gray'}"></li-button>
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
            starActive: { type: Boolean, default: false, local: true },

            articles: { type: Array, default: [], local: true },
            sortArticles: { type: Object, default: [], local: true },
            selectedArticle: { type: Object, local: true },
            notebook: { type: Object, local: true },
        }
    }
    get needSave() { return false };
    get _selected() { return this.selectedArticle }

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
            await this.setSelectedEditors();
            this.$update();
        }
    }

    async firstInit() {
        try { this.rootArticle = await this.dbLocal.get('$wiki:articles') } catch (error) { }
        if (!this.rootArticle) {
            await this.dbLocal.put((new ITEM({ _id: '$wiki:articles', label: 'wiki-articles', type: 'articles' })).doc);
            this.rootArticle = await this.dbLocal.get('$wiki:articles');
        }
        this.rootArticle = new ITEM({ ...this.rootArticle });
        this.articles = [this.rootArticle];
        try {
            this._localStore = await this.dbLocal.get('_local/store');
        } catch (error) { }
        this._localStore = this._localStore || {};
        this._articles = await this.createTree('articles');
        this.selectedArticle = this._articles[this._localStore['selected-articles']] || this.articles[0];
        if (this._localStore['starId-articles']) {
            this['_star-articles'] = this._articles[this._localStore['starId-articles']] || undefined;
            this.$refs('star').toggled = true;
        }
        await this.setSelectedEditors();
        Object.keys(this._articles).forEach(k => this._articles[k].changed = false);
        LI.listen(document, 'needSave', (e) => {
            //console.log(e.detail);
            if (e?.detail?._id && e?.detail?.type === '_deleted') this._deletedList.add(e.detail._id);
            else if (e?.detail?._id && !this._deletedList.includes(e.detail._id)) this._changedList.add(e.detail._id);
        });
        this.setSortArticles();
        this.$update();
    }
    async createTree(type) {
        const
            items = await this.dbLocal.allDocs({ include_docs: true, startkey: type, endkey: type + '\ufff0' }),
            flat = {},
            tree = this[type],
            rootParent = '$wiki:' + type;
        items.rows.forEach(i => flat[i.doc._id] = new ITEM({ ...i.doc }));
        Object.values(flat).forEach(f => {
            if (f['parentId'] === rootParent) {
                f.parent = tree[0];
                tree[0].items.push(f);
            } else {
                const i = flat[f['parentId']];
                if (i) {
                    i.items = i.items || [];
                    f.parent = i;
                    i.items.push(f);
                } else {
                    f['parentId'] = rootParent;
                    f.parent = tree[0];
                    tree[0].items.push(f);
                    f._deleted = true;
                }
            }
        });
        flat[rootParent] = this[type][0];
        this._localStore['expanded-' + type]?.forEach(k => flat[k] ? flat[k].expanded = true : '');
        return flat;
    }
    setSortArticles() {
        const rows = [];
        Object.keys(this._articles).sort((a, b) => a.ulid > b.ulid ? 1 : -1).forEach(k => {
            const article = this._articles[k];
            if (article.partsId?.length) {
                article.name = article._data.label;
                rows.push(article);
            }
        })
        rows.shift();
        const data = {
            options: {
                // lazy: true, 
                headerService: true,
                headerServiceText: 'sort by last add',
                footerHidden: true,
                footerService: true,
                footerServiceTotal: true,
                // rowHeight: 40,
                fontSize: '.9rem',
                searchColumns: ['name'],
                readOnly: true
            },
            columns: [{ label: '№', name: '$idx', width: 50 }, { label: 'articles', name: 'name', textAlign: 'left', showTitle: true }],
            rows: rows
        }
        this.sortArticles = data;
    }
    async setSelectedEditors() {
        //if (!this._selected || this._selected.partsLoaded || !this._selected.partsId) return;
        this._editors = this._editors || {};
        this.notebook = { cells: [] };
        const temps = await this.dbLocal.allDocs({ keys: this.selectedArticle.partsId, include_docs: true });
        this._selected.parts.splice(0);
        temps.rows.map((i, idx) => {
            if (i.doc) {
                this.notebook.cells.push({ cell_name: i.doc.name, source: i.doc.value, order: idx, cell_h: i.doc.h })
                const box = new BOX({ ...i.doc, changed: false });
                this._selected.parts.push(box);
                this._editors[i.id] = box;
            }
        });
        this._selected.partsLoaded = true;
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
                <li-button id="collapse" name="unfold-less" title="collapse" size="20" @click=${this.btnClick}></li-button>
                <li-button id="expand" name="unfold-more" title="expand" size="20" @click=${this.btnClick}></li-button>
                <li-button id="starActive" name=${this.starIcon} title="set selected as root" size="20" @click=${this.btnClick} borderColor=${this.starColor} fill=${this.starColor}></li-button>
                <li-button name="camera" title="save tree state" @click="${this._saveTreeState}" size="20"></li-button>
                <div style="flex: 1"></div>
                ${this.readOnly ? html`` : html`
                    <li-button name="restore" title="clear deleted" size="20" @click=${this.btnClick}></li-button>
                    <li-button name="delete" title="delete" size="20" @click=${this.btnClick}></li-button>
                    <li-button name="library-add" title="add new" size="20" @click=${this.btnClick}></li-button>
                `}
            </div>
            <li-layout-tree .item="${this._star}" .selected="${this.selectedArticle}" @selected="${this.onselected}" style="overflow: auto;"
                allowEdit allowCheck iconSize="20"></li-layout-tree>
        `
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            starActive: { type: Boolean, local: true },
            articles: { type: Array, default: [], local: true },
            selectedArticle: { type: Object, local: true },
        }
    }
    get starColor() { return this.starActive ? 'orange' : '' }
    get starIcon() { return this.starActive ? 'star' : 'star-border' }
    get _star() { return this['_star-articles'] || this.articles }

    btnClick(e) {
        const id = e.target.id;
        const action = {
            collapse: () => {

            },
            expand: () => {

            },
            starActive: () => {
                this.starActive = !this.starActive;
            },
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
                display: block;
                height: calc(100% - 40px);
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
            dbPanel: { type: String, local: true },
            starActive: { type: Boolean, local: true },
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
