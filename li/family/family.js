import { LiElement, html, css } from '../../li.js';

import * as db from './lib/db.js';
import './lib/db-settings.js';
import '../layout-app/layout-app.js';
import '../wikis-db/wikis-db.js';
import '../panel-simple/panel-simple.js';
import '../jupyter/jupyter.js';
import '../button/button.js';
import '../layout-tree/layout-tree.js';
import '../table/table.js';

const rowPanelCSS = css` .row-panel { display: flex; border-bottom: 1px solid lightgray; padding: 4px 2px; margin-bottom: 2px; }`;
const scrollCSS = css`::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }`;

customElements.define('li-family', class LiFamily extends LiElement {
    static get styles() {
        return css`
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
            <li-layout-app shift="0">
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>${this.name || 'my-family'}<div style="flex:1"></div>
                    ${this.readOnly ? html`` : html`
                    <li-button id="save" name="save" title="save" @click=${this.btnClick} .fill="${this.needSave ? 'red' : ''}" color="${this.needSave ? 'red' : 'gray'}"></li-button>
                    `}
                    <li-button id="readonly" name="edit" @click=${this.btnClick} style="margin-right:8px" title="enable edit" fill=${this.readOnly ? 'lightgray' : 'green'} 
                            color="${this.readOnly ? 'lightgray' : 'green'}" back="${this.readOnly ? 'transparent' : '#e9ffdb'}"></li-button>
                    <li-button id="reload" name="refresh" title="reload page"  @click="${this.btnClick}" style="padding-right: 8px"></li-button>
                </div>
                <div slot="app-left" slot="app-main" style="display: flex; height: 100%; padding: 0 !important">
                    <li-panel-simple .src=${this.leftTabs} iconSize=24>
                        <li-family-items-tree slot="tree"></li-family-items-tree>
                        <li-table slot="list" .data=${this.sortItems} style="cursor: pointer; width: 100%"></li-table> 
                        <li-db-settings slot="settings"></li-db-settings>
                    </li-panel-simple>
                </div>
                <div id="main" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.mainTabs} iconSize=24>
                        <li-jupyter slot="notebook" .notebook=${this.selectedItem?.notebook}></li-jupyter>
                        <li-family-weeks slot="weeks"></li-family-weeks>
                        <li-family-tree slot="family tree" style="height: 100%:"></li-family-tree>
                    </li-panel-simple>
                </div>
                <div slot="app-right" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.rightTabs} style="height: 100%:" iconSize=24>
                        <li-family-phase slot="phase"></li-family-phase>
                    </li-panel-simple>
                </div>
            </li-layout-app>
        `
    }

    static get properties() {
        return {
            name: { type: String, default: 'my-family', local: true, save: true },
            url: { type: String, default: 'http://admin:54321@localhost:5984/', local: true, save: true },
            rootLabel: { type: String, default: 'my family' },
            sortLabel: { type: String, default: 'persons' },
            prefix: { type: String, default: 'lfdb_', local: true },
            replication: { type: Boolean, default: false, local: true, save: true },
            readOnly: { type: Boolean, default: false, local: true, save: true },
            allowImport: { type: Boolean, default: true, local: true },
            allowExport: { type: Boolean, default: true, local: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },

            items: { type: Array, local: true },
            flatItems: { type: Object, local: true },
            sortItems: { type: Object, local: true },
            selectedItem: { type: Object, local: true },
            starItem: { type: Object, local: true },
            changedItemsID: { type: Array, defauLt: [], local: true },
            changedItems: { type: Object, default: {}, local: true },
            deletedItemsID: { type: Array, defauLt: [], local: true },
            deletedItems: { type: Object, defauLt: {}, local: true },

            leftTabs: {
                type: Object, default: {
                    open: true,
                    tabs: [
                        {
                            icon: 'tree-structure', label: 'tree', labelOnSelected: true, title: 'tree',
                            btns_left: [
                                { icon: 'unfold-less', title: 'collapse' },
                                { icon: 'unfold-more', title: 'expand' },
                                { icon: 'star', title: 'set selected as root', toggledClass: '_yellow', notoggledClass: '_white' },
                                { icon: 'camera', title: 'save tree state' }
                            ],
                            btns_right: [
                                { icon: 'cached', title: 'clear deleted' },
                                { icon: 'delete', title: 'delete item' },
                                { icon: 'library-add', title: 'add new item' }
                            ],
                        },
                        { icon: 'list', label: 'list', labelOnSelected: true, title: 'list' },
                        { icon: 'settings', label: 'settings', labelOnSelected: true, title: 'settings' }
                    ]
                }
            },
            mainTabs: {
                type: Object, default: {
                    open: true,
                    tabs: [
                        {
                            icon: 'edit', label: 'notebook', labelOnSelected: true, title: 'notebook',
                            btns: [
                                { icon: 'close', title: 'delete notebook' },
                                { icon: 'crop-3-2', title: 'cells border' },
                                { icon: 'add', title: 'add uploaded notebook (json)' },
                                { icon: 'file-upload', title: 'upload notebook (json)' },
                                { icon: 'save', title: 'save notebook (json)' },
                                { icon: 'launch', title: 'share notebook to new tab' }
                            ],
                        },
                        {
                            icon: 'apps', label: 'weeks', labelOnSelected: true, title: 'weeks',
                            btns: [
                                { icon: 'auto_stories' }
                            ],
                        },
                        {
                            icon: 'supervisor-account', label: 'family tree', labelOnSelected: true, title: 'family tree',
                            btns: [
                                { icon: 'arrow-back' },
                                { icon: 'arrow-forward' }
                            ],
                        }
                    ]
                }
            },
            rightTabs: {
                type: Object, default: {
                    open: true,
                    tabs: [
                        {
                            icon: 'apps', label: 'phase', labelOnSelected: true, title: 'phase',
                            btns: [
                                { icon: 'add', title: 'add' }
                            ],
                        },
                        {
                            icon: 'settings',label: 'settings', labelOnSelected: true, title: 'settings',
                            btns: [
                                { icon: 'arrow-back' },
                                { icon: 'arrow-forward' }
                            ],
                        }
                    ]
                }
            },
        }
    }

    get needSave() { return this.changedItemsID?.length || this.deletedItemsID?.length };

    firstUpdated() {
        super.firstUpdated();
        db.firstInit(this);
        this.$update();
        this.listen('tableRowSelect', async e => {
            this.selectedItem = e.detail?.row;
            this.$update();
        })
        this.listen('li-panel-simple-click', (e) => {
            this.panelSimpleClick(e);
        })
        setTimeout(() => {
            LI.listen(document, 'changed', (e) =>{
                if (this._isUpdateSelectedItem) return;
                const d = e.detail;
                console.log(d)
                if (d.type === 'jupyter_cell') {
                    const _id = 'jupyter_cell:' + d.value.ulid;
                    if (d.change === 'deleteCell') {
                        this.deletedItemsID ||= [];
                        this.deletedItemsID.add(_id);
                    } else {
                        this.setChangedCell(d.value)
                    }
                } else if(d.type === 'jupyter_notebook') {
                    this._isUpdateSelectedItem = true;
                    if (d.change === 'addNotebook') {
                        this.selectedItem.notebook ||= { cells: [] };
                        this.selectedItem._parts ||= [];
                    } else {
                        this.selectedItem.notebook = { cells: [] };
                        this.selectedItem._parts = [];
                    }
                    (d.notebook?.cells || []).map(doc => {
                        const _id = 'jupyter_cell:' + (doc.ulid || LI.ulid());
                        doc._id ||= _id;
                        const part = this.setChangedCell(doc);
                        this.selectedItem.notebook.cells.push(doc);;
                        this.selectedItem._parts.push(part);
                    })
                    setTimeout(() => {
                        this._isUpdateSelectedItem = false;
                    }, 1000);
                }
                this.$update();
            })
        }, 1000);
    }
    async updated(e) {
        if (e.has('selectedItem')) {
            db.updateSelectedItem(this);
        }
    }

    setChangedCell(doc, type = 'jupyter_cell') {
        const _id = doc._id;
        this.changedItemsID ||= [];
        this.changedItemsID.add(_id);
        const item = new db.ITEM(doc, { type });
        this.changedItems[_id] = item;

        this.selectedItem.doc.partsId ||= [];
        this.selectedItem.doc.partsId.add(_id);

        this.changedItemsID.add(this.selectedItem._id);
        this.changedItems[this.selectedItem._id] = this.selectedItem;
        //this.selectedItem.cells = d.notebook?.cells;
        return item;
    }
    btnClick(e) {
        const id = e.target.id;
        const action = {
            readonly: () => this.readOnly = !this.readOnly,
            reload: () => document.location.reload(),
            save: () => {
                db.save(this);
                db.getSortItems(this);
            }
        }
        action[id] && action[id]();
        this.$update();
    }
    _uploadFile(jup, add = false) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => jup.loadFile(e, add); 
        input.click();
    }
    panelSimpleClick(e) {
        const id = e.detail.btn;
        const jup = this.$qs('li-jupyter');
        const action = {
            'list': () => {
                setTimeout(() => {    
                    this.$qs('li-table')._resizeColumns();
                    this.$update();
                }, 10);
            },
            'delete notebook': () => {
                this.selectedItem.notebook = { cells: [] };
                this.selectedItem._parts = [];

            },
            'cells border': () => {
                jup.showBorder = !jup.showBorder
            },
            'add uploaded notebook (json)': () => {
                this._uploadFile(jup, true);
            },
            'upload notebook (json)': () => {
                this._uploadFile(jup);
            },
            'save notebook (json)': () => {
                jup.saveFile();
            },
            'share notebook to new tab': () => {
                jup.share();
            }
        }
        action[id] && action[id]();
        this.$update();
    }

})

customElements.define('li-family-items-tree', class LiFamilyItemsTree extends LiElement {
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
            <label class="row-panel">${this.starItem?.label || this.name}</label>
            <div style="overflow: auto; flex: 1">
                <li-layout-tree .item="${this._items}" .selected="${this.selectedItem}" @selected="${this.onselected}" style="overflow: auto;"
                    allowEdit allowCheck iconSize="20"></li-layout-tree>
            </div>
        `
    }

    static get properties() {
        return {
            name: { type: String, local: true },
            readOnly: { type: Boolean, local: true },
            dbLocal: { type: Object, local: true },
            dbLocalStore: { type: Object, local: true },
            items: { type: Array, local: true },
            flatItems: { type: Object, local: true },
            selectedItem: { type: Object, local: true },
            starItem: { type: Object, local: true },
            changedItemsID: { type: Array, local: true },
            changedItems: { type: Object, local: true },
            deletedItemsID: { type: Array, local: true },
            deletedItems: { type: Object, local: true },
        }
    }
    get _items() { return this.starItem || this.items }
    get needSave() { return this.deletedItemsID.length }

    onselected(e) {
        this.selectedItem = e.detail;
    }
})


customElements.define('li-family-weeks', class LiFamilyWeeks extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
                display: flex;
                flex-direction: column;
                flex: 1;
                color: darkgray;
                font-size: 12px;
                text-align: center;
            }
            .year {
                display: flex;
                flex: 1;
            }
            .week {
                height: 20px;
                flex: 1;
                border: 1px solid lightgray;
                margin: 1px;
            }
        `;
    }
    
    render() {
        return html`
            <div class="year" style="position: sticky; top: 0px; ; background: white; z-index: 9; border-bottom: 1px solid darkgray; align-items: center">
                <div style="width: 14px"></div>
                ${this.arr(52).map(w => html`
                    <div style="height: 20px; flex: 1">${w + 1}</div>
                `)}
            </div>
            ${this.arr(99).map(y => html`
                <div style="display: flex; flex: 1; align-items: center;">
                    <div style="width: 14px">${y + 1}</div>
                    <div class="year">
                        ${this.arr(52).map(w => html`
                            <div class="week"></div>
                        `)}
                    </div>
                </div>
            `)}
        `
    }
    
    static get properties() {
        return {

        }
    }

    arr(count) {
        return [...Array(count).keys()];
    }
})

customElements.define('li-family-tree', class LiFamilyTree extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                color: red;
             }
        `;
    }
    
    render() {
        return html`
            <h3>${this.props}</h1>
        `
    }
    
    static get properties() {
        return {
            props: { type: String, default: 'li-family-items-tree' },
        }
    }
})

customElements.define('li-family-phase', class LiFamilyPhase extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding: 4px;
                color: gray;
             }
        `;
    }
    
    render() {
        return html`

        `
    }
    
    static get properties() {
        return {
            props: { type: String, default: 'li-phase' },
            
        }
    }
})

customElements.define('li-family-phase-row', class LiFamilyPhase extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding: 4px;
                color: gray;
             }
             input {
                border: none;
                border-bottom: 1px solid lightgray; 
                outline: none; 
                width: 100%; 
                color: blue; 
                font-size: 18;
                font-family: Arial;
            }
        `;
    }
    
    render() {
        return html`
            <span>birthday: </span><input type="datetime-local">
            <span>death date: </span><input type="datetime-local">
        `
    }
    
    static get properties() {
        return {
            props: { type: String, default: 'li-phase' },
            
        }
    }
})
