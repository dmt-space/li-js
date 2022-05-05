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
                    <li-button id="readonly" name="edit" @click=${this.btnClick} title="enable edit" fill=${this.readOnly ? 'lightgray' : 'green'} color="${this.readOnly ? 'lightgray' : 'green'}" back="${this.readOnly ? 'transparent' : '#e9ffdb'}" style="padding-left: 8px"></li-button>
                    ${this.readOnly ? html`` : html`
                        <li-button id="save" name="save" title="save" @click=${this.btnClick} .fill="${this.needSave ? 'red' : ''}" color="${this.needSave ? 'red' : 'gray'}"></li-button>
                    `}
                    <li-button id="reload" name="refresh" title="reload page"  @click="${this.btnClick}" style="padding-left: 8px"></li-button>
                    <div style="flex:1"></div>${this.name || 'my-family'}<div style="flex:1"></div>
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
                        <li-jupyter slot="notebook" .notebook=${this.selectedItem?._notebook || this.selectedItem?.notebook}></li-jupyter>
                        <li-family-weeks slot="weeks"></li-family-weeks>
                        <li-family-tree slot="family tree" style="height: 100%:"></li-family-tree>
                    </li-panel-simple>
                </div>
                <div slot="app-right" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.rightTabs} style="height: 100%:" iconSize=24>
                        <li-family-phases slot="phases" style="display: flex; height: 100%;"></li-family-phases>
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
                                { icon: 'delete', title: 'delete notebook' },
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
                            icon: 'apps', label: 'phases', labelOnSelected: true, title: 'phases',
                            btns: [
                                { icon: 'delete', title: 'delete phase' },
                                { icon: 'done', title: 'add phase date' },
                                { icon: 'done-all', title: 'add phase period' } //family ties
                            ]
                        },
                        {
                            icon: 'supervisor-account', label: 'family ties', labelOnSelected: true, title: 'family ties',
                            btns: [

                            ],
                        }
                    ]
                }
            },
        }
    }

    get needSave() { return this.changedItemsID?.length || this.deletedItemsID?.length }
    get jupyter() { return this.$qs('li-jupyter') || {} }

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
            LI.listen(document, 'changesJupyter', (e) => {
                this.changedItemsID ||= [];
                this.changedItems ||= {};
                this.deletedItemsID ||= [];
                this.deletedItems ||= {};
                if (this._isUpdateSelectedItem || this.$qs('li-jupyter').ulid !== e?.detail?.jupyter.ulid) return;
                const d = e.detail;
                console.log(d)
                if (d.type === 'jupyter_cell') {
                    const _id = d.cell._id || 'jupyter_cell:' + d.cell.ulid;
                    if (d.change === 'deleteCell') {
                        this.deletedItemsID.add(_id);
                        this.changedItemsID.add(this.selectedItem._id);
                         this.changedItems[this.selectedItem._id] = this.selectedItem;
                    } else if (d.change === 'moveCell') {
                        let partsId = [];
                        this.jupyter.notebook.cells.map (i => {
                            partsId.push(i._id);
                        })
                        partsId = [...partsId, ...this.selectedItem.doc.partsId.filter(i => !i.startsWith('jupyter_cell'))]
                        this.selectedItem.doc.partsId = partsId;
                        this.changedItemsID.add(this.selectedItem._id);
                        this.changedItems[this.selectedItem._id] = this.selectedItem;
                    } else {
                        this.setChangedPart(d.cell, 'jupyter_cell')
                    }
                } else if (d.type === 'jupyter_notebook') {
                    this._isUpdateSelectedItem = true;
                    if (d.change === 'addNotebook') {
                        this.selectedItem.notebook ||= { cells: [] };
                        this.selectedItem._parts ||= [];
                    } else {
                        this.selectedItem.notebook?.cells?.map(cell => this.deletedItemsID.add(cell._id));
                        this.selectedItem.notebook = { cells: [] };
                        this.selectedItem._parts = [];
                    }
                    (d.notebook?.cells || []).map(doc => {
                        doc.ulid = LI.ulid();
                        doc._id = 'jupyter_cell:' + doc.ulid;
                        delete doc._rev;
                        const part = this.setChangedPart(doc, 'jupyter_cell');
                        this.selectedItem.notebook.cells.push(doc);;
                        this.selectedItem._parts.push(part);
                    })
                    setTimeout(() => this._isUpdateSelectedItem = false, 1000);
                }
                this.$update();
            })
            this.listen('changesPhases', (e) => {
                this.changedItemsID ||= [];
                this.changedItems ||= {};
                this.deletedItemsID ||= [];
                this.deletedItems ||= {};
                const d = e.detail;
                console.log(d);
                if (d.change === 'deletePhase') {
                    this.deletedItemsID.add(d._id);
                    this.changedItemsID.add(this.selectedItem._id);
                    this.changedItems[this.selectedItem._id] = this.selectedItem;
                } else {
                    this.setChangedPart(d.doc, 'phases')
                }
            })
        }, 1000);
    }
    async updated(e) {
        if (e.has('selectedItem')) {
            db.updateSelectedItem(this);
        }
    }

    setChangedPart(doc, type) {
        doc._id ||= type + ':' + LI.ulid();
        this.changedItemsID.add(doc._id);
        const item = new db.ITEM(doc, { type });
        this.changedItems[doc._id] = item;

        this.selectedItem.doc.partsId ||= [];
        this.selectedItem.doc.partsId.add(doc._id);

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
                if (window.confirm(`Do you really want delete all cells ?`)) {
                    this.deletedItemsID ||= [];
                    this.selectedItem.notebook?.cells?.map(cell => {
                        this.deletedItemsID.add(cell._id);
                    })
                    this.selectedItem.notebook = { cells: [] };
                    this.selectedItem._parts = [];
                }
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
            },
            'add phase date': (e) => {
                this.selectedItem.phases ||= [];
                let date = new Date().toISOString().split('T');
                date = date[0] + 'T12:00';
                const doc = { date1: date, isPeriod: false };
                this.fire('changesPhases', { type: 'changesPhases', change: 'addPhaseDate', doc, sourceEvent: e })
                this.selectedItem.phases.push(doc);
            },
            'add phase period': () => {
                this.selectedItem.phases ||= [];
                let date = new Date().toISOString().split('T');
                date = date[0] + 'T12:00';
                const doc = { date1: date, date2: date, isPeriod: true };
                this.fire('changesPhases', { type: 'changesPhases', change: 'addPhasePeriod', doc, sourceEvent: e })
                this.selectedItem.phases.push(doc);
            },
            'delete phase': () => {
                const phases = this.$qs('li-family-phases');
                let idx = phases.idx;
                if (idx >= 0) {
                    const phase = this.selectedItem.phases.splice(idx, 1)[0];
                    phases.idx = idx > this.selectedItem.phases.length - 1 ? this.selectedItem.phases.length - 1 : idx;
                    this.fire('changesPhases', { type: 'changesPhases', change: 'deletePhase', _id: phase._id, phase, sourceEvent: e })
                }
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
            deletedItems: { type: Object, local: true }
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
                            <li-family-week class="week" y=${y} w=${w}></li-family-week>
                        `)}
                    </div>
                </div>
            `)}
        `
    }

    arr(count) {
        return [...Array(count).keys()];
    }
})

customElements.define('li-family-week', class LiFamilyWeek extends LiElement {
    static get styles() {
        return css`

        `;
    }

    render() {
        return html`
            <div class="week" style="background: ${this.y >= 6 && this.y <= 13 ? 'lightgreen' : this.y >= 14 && this.y <= 17 ? 'lightblue' : ''}; width: 100%; height: 100%; opacity: .3"></div>
        `
    }

    get timeStart() {
        const MS_DAY = 1000 * 60 * 60 * 24;
        return this.y * MS_DAY * 365 + this.w * MS_DAY;
    }
    get timeEnd() {
        const MS_DAY = 1000 * 60 * 60 * 24;
        return this.y * MS_DAY * 365 + this.w * MS_DAY + 7 * MS_DAY;
    }

    static get properties() {
        return {
            selectedItem: { type: Object, local: true },
            y: { type: Number },
            w: { type: Number }
        }
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

customElements.define('li-family-phases', class LiFamilyPhase extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding: 4px;
                box-sizing: border-box;
             }
             input {
                border: none;
                border-bottom: 1px solid lightgray; 
                outline: none; 
                width: 100%; 
                color: gray; 
                font-size: 16;
                font-family: Arial;
                background-color: transparent;
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            ${(this.selectedItem?.phases || []).map((doc, idx) => html`
                <div @pointerdown=${() => this.idx = idx} style="padding: 4px; border: 1px solid ${idx === this.idx ? 'blue' : 'lightgray'}; border-radius: 4px; margin-bottom: 4px; background-color: hsla(${doc.isPeriod ? 180 : 90}, 70%, 70%, .2)">
                    <div style="display: flex">
                        <input value=${doc.label} @change=${e => this.onchange(e, doc, idx, 'label')}>
                        <input type="color" value=${doc.color || '#ffffff'} @change=${e => this.onchange(e, doc, idx, 'color')} style="width: 22px; opacity: .5">
                    </div>
                    <input type="datetime-local" value=${doc.date1} @change=${e => this.onchange(e, doc, idx, 'date1')}>
                    ${doc.isPeriod ? html`
                        <input type="datetime-local" value=${doc.date2} @change=${e => this.onchange(e, doc, idx, 'date2')}>
                    ` : html``}
                </div>
            `)}
        `
    }

    static get properties() {
        return {
            idx: { type: Number, default: -1 },
            selectedItem: { type: Object, local: true }
        }
    }
    firstUpdated() {
        super.firstUpdated();
    }
    onchange(e, doc, idx, key) {
        if (idx === this.idx) {
            this.selectedItem.phases[idx][key] = e.target.value;
            this.fire('changesPhases', { type: 'changesPhases', change: 'setValue', value: e.target.value, idx, doc, sourceEvent: e })
        }
    }
})
