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
                    <li-panel-simple id="simple-left" .src=${this.leftTabs} iconSize=24 idx=${this.idxLeft} @pointerdown=${this._setIdxLeft}>
                        <li-family-items-tree slot="tree"></li-family-items-tree>
                        <li-table slot="list" .data=${this.sortItems} style="cursor: pointer; width: 100%"></li-table> 
                        <li-db-settings slot="settings"></li-db-settings>
                    </li-panel-simple>
                </div>
                <div id="main" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple id="simple-main" .src=${this.mainTabs} iconSize=24 idx=${this.idxMain} @pointerdown=${this._setIdxMain}>
                        <li-jupyter slot="notebook" .notebook=${this.notebook}></li-jupyter>
                        ${this.hideFamilyWeeks ? html`` : html`
                            <li-family-weeks slot="weeks"></li-family-weeks>
                        `}
                        <li-family-tree slot="family tree" style="height: 100%:"></li-family-tree>
                    </li-panel-simple>
                </div>
                <div slot="app-right" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.rightTabs} style="height: 100%:" iconSize=24>
                        <li-family-phases slot="phases" style="display: flex; height: 100%;" .fml=${this}></li-family-phases>
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
            changedItemsID: { type: Array, default: [], local: true },
            changedItems: { type: Object, default: {}, local: true },
            deletedItemsID: { type: Array, default: [], local: true },
            deletedItems: { type: Object, default: {}, local: true },
            notebook: { type: Object, local: true },
            idxLeft: { type: Number, default: 0, save: true },
            idxMain: { type: Number, default: 0, save: true },
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
                                { icon: 'refresh', title: 'refresh family weeks' }
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
                            icon: 'list', label: 'phases', labelOnSelected: true, title: 'phases',
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
    get simpleLeft() { return this.$qs('#simple-left') || {} }
    get simpleMain() { return this.$qs('#simple-main') || {} }

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
                    if (d.notebook.id === 'phases') {
                        const phase = this.$qs('li-family-phases').selectedPhases;
                        phase.notebook = d.notebook;
                        this.setChangedPart(phase, 'phases');
                    } else if (d.change === 'deleteCell') {
                        this.deletedItemsID.add(_id);
                        this.selectedItem.doc.partsId.remove(_id);
                        this.changedItemsID.add(this.selectedItem._id);
                        this.changedItems[this.selectedItem._id] = this.selectedItem;
                    } else if (d.change === 'moveCell' || d.change === 'addCell') {
                        if (d.change === 'moveCell' || d.change === 'addCell')
                            this.setChangedPart(d.cell, 'jupyter_cell')
                        let partsId = [];
                        this.notebook.cells.map(i => partsId.push(i._id));
                        partsId = [...partsId, ...(this.selectedItem.doc.partsId || []).filter(i => !i.startsWith('jupyter_cell'))]
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
                }
                setTimeout(() => this._isUpdateSelectedItem = false, 1000);
                this.$update();
            })
            this.listen('changesPhases', (e) => {
                this.changedItemsID ||= [];
                this.changedItems ||= {};
                this.deletedItemsID ||= [];
                this.deletedItems ||= {};
                const d = e.detail;
                // console.log(d);
                if (d.change === 'deletePhase') {
                    this.deletedItemsID.add(d._id);
                    this.selectedItem.doc.partsId.remove(d._id);
                    this.changedItemsID.add(this.selectedItem._id);
                    this.changedItems[this.selectedItem._id] = this.selectedItem;
                } else {
                    this.setChangedPart(d.doc, 'phases')
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
                const color = '#' + Math.random().toString(16).substr(2, 6);
                // console.log(color)
                this.selectedItem.phases ||= [];
                let date = new Date().toISOString().split('T');
                date = date[0] + 'T12:00';
                const doc = { date1: date, isPeriod: false, color };
                this.fire('changesPhases', { type: 'changesPhases', change: 'addPhaseDate', doc, sourceEvent: e })
                this.selectedItem.phases.push(doc);
            },
            'add phase period': () => {
                const color = '#' + Math.random().toString(16).substr(2, 6);
                // console.log(color)
                this.selectedItem.phases ||= [];
                let date = new Date().toISOString().split('T');
                date = date[0] + 'T12:00';
                const doc = { date1: date, date2: null, isPeriod: true, color };
                this.fire('changesPhases', { type: 'changesPhases', change: 'addPhasePeriod', doc, sourceEvent: e })
                this.selectedItem.phases.push(doc);
            },
            'delete phase': () => {
                const phases = this.$qs('li-family-phases');
                let idx = phases.selectedPahsesIdx;
                if (idx >= 0) {
                    const phase = this.selectedItem.phases.splice(idx, 1)[0];
                    phases.selectedPahsesIdx = idx > this.selectedItem.phases.length - 1 ? this.selectedItem.phases.length - 1 : idx;
                    this.fire('changesPhases', { type: 'changesPhases', change: 'deletePhase', _id: phase._id, phase, sourceEvent: e })
                }
                this.refreshFamilyWeeks();
            },
            'refresh family weeks': () => {
                this.$.refreshFamilyWeeks();
            }
        }
        action[id] && action[id]();
        this.$update();
    }
    refreshFamilyWeeks() {
        this.hideFamilyWeeks = true;
        setTimeout(() => {
            this.hideFamilyWeeks = false;
            this.$update();
        });
    }
    _setIdxLeft(e) {
        setTimeout(() => this.idxLeft = this.simpleLeft.idx, 300);
    }
    _setIdxMain(e) {
        setTimeout(() => this.idxMain = this.simpleMain.idx, 300);
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
            items: { type: Array, local: true },
            selectedItem: { type: Object, local: true },
            starItem: { type: Object, local: true },
        }
    }
    get _items() { return this.starItem || this.items }

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
                cursor: pointer;
            }
            .year {
                position: relative;
                display: flex;
                flex: 1;
            }
            .week {
                position: relative;
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
            <div @pointerdown=${this.on_click}>
                ${this.arr(this.$._count || 100).map(y => {
                    const timeRowYearStart = this.timeRowYearStart(y);
                    return html`
                    <div style="display: flex; flex: 1; align-items: center;">
                        <div style="width: 14px">${y}</div>
                        <div class="year">
                            ${this.arr(this.$._count || 52).map(w => html`
                                <li-family-week class="week" y=${y} w=${w} timeRowYearStart=${timeRowYearStart}></li-family-week>
                            `)}
                        </div>
                    </div>
                `})}
            </div>
        `
    }

    static get properties() {
        return {
            selectedItem: { type: Object, local: true },
            timeStart: { type: Number },
            dataStart: { type: Object }
        }
    }
    arr(count) {
        return [...Array(count).keys()];
    }

    async firstUpdated() {
        super.firstUpdated();
        await new Promise((r) => setTimeout(r, 10));
        const stringDate = this.selectedItem?.phases?.[0]?.date1;
        this.dataStart = stringDate ? new Date(stringDate) : new Date();
        this.timeStart = this.dataStart?.getTime() || 0;
    }
    timeRowYearStart(year) {
        const stringDate = this.selectedItem?.phases?.[0]?.date1;
        if (!stringDate) return 0;
        const dataStart = new Date(stringDate);
        dataStart?.setFullYear(dataStart.getFullYear() + year);
        return dataStart?.getTime();
    }
    async on_click(e) {
        let target = e.target;
        if (e.target.localName !== 'li-family-week') return;
        let newDiv = document.createElement("div");
        if (target.label) {
            newDiv.style.fontSize = '16px';
            newDiv.style.color = 'gray';
            newDiv.style.padding = '8px';
            newDiv.style.background = 'white';
            newDiv.style.textAlign = 'center';
            newDiv.style.border = '1px solid gray';
            newDiv.style.boxShadow = '3px 3px 3px rgba(0, 0, 0, .7)';
            newDiv.innerHTML = target.label;
        }
        await LI.show('dropdown', newDiv, {}, { parent: target, align: 'left', showHeader: true, label: target.weekStart.toLocaleDateString() + ' - ' + target.weekEnd.toLocaleDateString(), intersect: true });
    }
})

customElements.define('li-family-week', class LiFamilyWeek extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%; 
                height: 100%;
            }
            .week {
                position: absolute;
            }
        `;
    }

    render() {
        return html`
            ${this.weeks?.map(i => html`
                ${i.isPeriod ? html`
                    <div class="week" style="top: 0; position: absolute; background: ${i.gradient || ''}; width: 100%; height: 100%; opacity: .3;}"></div>
                ` : html``}
                ${i.isDate ? html`
                    <div style="top: 0; position: absolute; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                        <svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="25" fill="${i.gradient}" style="top: 0; position: absolute; opacity: .5"/>
                        </svg>
                    </div>
                ` : html``}
            `)}
        `
    }

    static get properties() {
        return {
            selectedItem: { type: Object, local: true },
            y: { type: Number },
            w: { type: Number },
            color: { type: String },
            label: { type: String },
            timeRowYearStart: { type: Object }
        }
    }

    get label() { return this.weeks.reduce((prev, curr) => prev += curr.label, '') }

    async firstUpdated() {
        super.firstUpdated();
        await new Promise((r) => setTimeout(r, 10));
        this.init();
        this.$update();
    }
    init() {
        this.weeks = [];
        this.weekStart = new Date(this.timeRowYearStart + this.w * LI.MS_DAY * 7);
        this.weekEnd = new Date(this.timeRowYearStart + this.w * LI.MS_DAY * 7 + LI.MS_DAY * 6);
        if (this.w === 51) {
            const date = new Date(this.timeRowYearStart);
            date.setFullYear(date.getFullYear() + 1);
            date.setDate(date.getDate() - 1);
            this.weekEnd = date;
        }
        this.selectedItem?.phases.map(i => {
            let w = { };
            const d1 = new Date(i.date1);
            const d2 = i.date2 ? new Date(i.date2) : new Date();
            const diff = Math.abs(d2.getTime() - d1.getTime());
            this.diff = (diff / 1000 / 60 / 60 / 24 / 365).toFixed(2);
            if (i.isPeriod && (this.weekStart >= d1 || this.weekEnd >= d1) && (this.weekStart <= d2 || this.weekEnd <= d2)) {
                w.isPeriod = true;
                w.gradient = i.color;
                let perc = 100 / 7;
                if (d1 >= this.weekStart && d1 <= this.weekEnd && d2 >= this.weekStart && d2 <= this.weekEnd) {
     
                } else if (d1 >= this.weekStart && d1 <= this.weekEnd) {
                    const diffLeft = Math.round((this.weekEnd - d1) / LI.MS_DAY);
                    perc = Math.round(diffLeft * perc + perc);
                    w.gradient = `linear-gradient(to right, transparent ${100 - perc}%, ${i.color} ${100 - perc}%, ${i.color} ${perc}%);`;
                } else if (d2 >= this.weekStart && d2 <= this.weekEnd) {
                    const diffRight = Math.round((this.weekEnd - d2) / LI.MS_DAY);
                    perc = Math.round(diffRight * perc + perc);
                    w.gradient = `linear-gradient(to right, ${i.color} ${100 - perc}%, transparent ${100 - perc}%, transparent ${perc}%);`;
                }
                w.label = `
<div style="border-bottom: 1px solid lightgray; padding: 6px">${i.group || ''}</div>
<strong>${i.label || ''}</strong>
<br>
<strong>${d1.toLocaleDateString()} - ${d2.toLocaleDateString()}</strong>
<div style="font-size: 14px">( ${this.diff} <span style="font-size: 10px"> year</span> )</div>
<hr>
`
                this.weeks.push(w);
            } else if (d1 >= this.weekStart && d1 <= this.weekEnd) {
                w.gradient = i.color;
                w.isDate =true;
                w.label = `
<div style="border-bottom: 1px solid lightgray; padding: 6px">${i.group || ''}</div>
<strong>${i.label || ''}</strong>
<br>
<strong>${d1.toLocaleDateString()}</strong>
<div style="font-size: 14px">( ${this.diff} <span style="font-size: 10px"> year</span> )</div>
<hr>
                `
                this.weeks.push(w);
            }
        })
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
                padding: 0 4px 4px 4px;
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
            .inpt::-webkit-input-placeholder {
                color: lightgray;
            }
        `;
    }

    render() {
        return html`
            <div style="display: flex; align-items: center; padding: 2px; margin-bottom: 4px; position: sticky; top: 0px; background: white; z-index: 1; border-bottom: 1px solid darkgray;">
                <label style="color: gray; flex: 1;">${this.$.selectedItem?.label}</label>
                <li-button name="edit" size="16" scale=".8" @click=${() => { this.$.notebook = this.$.selectedItem.notebook; this.$.simpleMain.idx = 0 }} style="margin-right: 4px;"></li-button>
            </div>
            <div style="display: flex; flex-direction: column">
                ${(this.$.selectedItem?.phases || []).map((doc, idx) => html`
                    <div @pointerdown=${() => { this.selectedPahsesIdx = idx; this.$update() }} style="padding: 4px; border: 1px solid ${idx === this.selectedPahsesIdx ? 'blue' : 'lightgray'}; border-radius: 4px; margin-bottom: 4px; background-color: hsla(${doc.isPeriod ? 180 : 90}, 70%, 70%, .2); overflow: hidden;">
                        <div style="display: flex">
                            <input class="inpt" value=${doc.label} @change=${e => this.onchange(e, doc, idx, 'label')} placeholder="event">
                        </div>
                        <input type="datetime-local" value=${doc.date1} @change=${e => this.onchange(e, doc, idx, 'date1')}>
                        ${doc.isPeriod ? html`
                            <input type="datetime-local" value=${doc.date2} @change=${e => this.onchange(e, doc, idx, 'date2')}>
                        ` : html``}
                        <div style="display: flex; align-items: center">
                            <input class="inpt" value=${doc.group} @change=${e => this.onchange(e, doc, idx, 'group')} placeholder="group">
                            <div style="color: darkgray; font-size: 14px">${this.years(doc)}</div>
                            <li-button name="edit" size="16" scale=".8" @click=${this.setNotebook} back=${doc.notebook?.cells.length ? 'yellow' : ''}></li-button>
                        </div>
                        <input type="color" value=${doc.color || '#ffffff'} @change=${e => this.onchange(e, doc, idx, 'color')} style="opacity: .5; height: 18px;">
                    </div>
                `)}
            </div>
        `
    }

    static get properties() {
        return {
            selectedPahsesIdx: { type: Number, default: -1 }
        }
    }
    get selectedPhases() {
        return this.$.selectedItem.phases[this.selectedPahsesIdx];
    }

    firstUpdated() {
        super.firstUpdated();
    }

    years(doc) {
        const d1 = (new Date(doc.date1)).getTime();
        const d2 = (new Date(doc.date2 || new Date())).getTime();
        const diff = Math.abs(d2 - d1);
        return (diff / 1000 / 60 / 60 / 24 / 365).toFixed(2);
    }
    onchange(e, doc, idx, key) {
        this.$.selectedItem.phases[idx][key] = e.target.value;
        this.fire('changesPhases', { type: 'changesPhases', change: 'setValue', value: e.target.value, idx, doc, sourceEvent: e });
        // this.$.refreshFamilyWeeks();
    }
    setNotebook() {
        this.$.notebook = this.$.selectedItem.phases[this.selectedPahsesIdx].notebook || { id: 'phases', label: this.$.selectedItem.phases[this.selectedPahsesIdx].label, cells: [] };
        this.$.simpleMain.idx = 0;
        this.$update();
    }
})
