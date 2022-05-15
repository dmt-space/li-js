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
                    <div style="flex:1"></div>${(this.name || 'my-family')}<div style="flex:1"></div>
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
                        ${this.hideFamilyWeeks || this.simpleMain.idx !== 1 ? html`` : html`
                            <li-family-weeks slot="weeks"></li-family-weeks>
                        `}
                        <li-family-tree slot="family tree" style="height: 100%:"></li-family-tree>
                    </li-panel-simple>
                </div>
                <div slot="app-right" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.rightTabs} style="height: 100%:" iconSize=24>
                        <li-family-phases slot="phases" style="display: flex; min-height: 100%;" .fml=${this}></li-family-phases>
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
            maxAge: { type: Number, default: 100 },
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
                if (!this.$.selectedItem.doc.usePhases) {
                    this.$.selectedItem.doc.usePhases = true;
                    this.$update();
                    return;
                }
                const color = '#' + Math.random().toString(16).substr(2, 6);
                // console.log(color)
                this.selectedItem.phases ||= [];
                let date1 = new Date().toISOString().split('T');
                date1 = date1[0] + 'T12:00';
                const doc = { date1, isPeriod: false, color };
                this.fire('changesPhases', { type: 'changesPhases', change: 'addPhaseDate', doc, sourceEvent: e })
                this.selectedItem.phases.push(doc);
            },
            'add phase period': () => {
                if (!this.$.selectedItem.doc.usePhases) {
                    this.$.selectedItem.doc.usePhases = true;
                    this.$update();
                    return;
                }
                const color = '#' + Math.random().toString(16).substr(2, 6);
                // console.log(color)
                this.selectedItem.phases ||= [];
                let date1 = new Date().toISOString().split('T');
                date1 = date1[0] + 'T12:00';
                const doc = { date1, date2: null, isPeriod: true, color };
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
                } else {
                    this.$.selectedItem.doc.usePhases = false;
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
            }
            .header {
                display: flex;
                position: sticky;
                top: 0;
                padding-top: 4px;
                border-bottom: 1px solid gray;
                background: #fff;
                flex: 1;
            }
            #canvas-phases {
                cursor: pointer;
            }
            .txt {
                opacity: 0;
            }
        `;
    }

    render() {
        return html`
            ${this._selectedItem || this.selectedItem?.doc.dateStart? html`
                <div class="header">
                    <div class="txt" style="width: 64px;font-size: 11px; color: gray; text-align: center; opacity: ${this.isReady ? 1 : 0}">year | age</div>
                    <canvas id="canvas-weeks" width="1700" height="20" style="flex: 1; width: 100%"></canvas>
                </div>
                <div style="display: flex; flex: 1">
                    <canvas id="canvas-left" width="52" height="2222"></canvas>
                    <div style="padding-left: 4px; display: flex; flex: 1">
                        <canvas id="canvas-phases" width="1700" height="2222" style="flex: 1; width: 100%"></canvas>
                    </div>
                </div>
            ` : html``}
       `
    }

    static get properties() {
        return {
            selectedItem: { type: Object, local: true },
            timeStart: { type: Number },
            dataStart: { type: Object },
            isReady: { type: Boolean }
        }
    }
    get rows() { return 100 }
    // get rows() { return Math.round(((new Date()).getTime() - this.timeRowYearStart(0)) / LI.MS_DAY / 365 + 10)  }

    async firstUpdated() {
        super.firstUpdated();
        await new Promise((r) => setTimeout(r, 10));
        const stringDate = this.selectedItem?.doc?.dateStart;
        this.dataStart = stringDate ? new Date(stringDate) : new Date();
        this.timeStart = this.dataStart?.getTime() || 0;
        this.initCanvas();
    }

    arr(count) { return [...Array(count).keys()] }
    timeRowYearStart(year) {
        const stringDate = this.selectedItem?.doc?.dateStart;
        if (!stringDate) return 0;
        const dataStart = new Date(stringDate);
        dataStart?.setFullYear(dataStart.getFullYear() + year);
        return dataStart?.getTime();
    }
    async on_click(week) {
        const label = week.weeks?.reduce((prev, curr) => prev += curr.label, '')
        let newDiv = document.createElement("div");
        if (label) {
            newDiv.style.fontSize = '16px';
            newDiv.style.color = 'gray';
            newDiv.style.padding = '8px';
            newDiv.style.background = 'white';
            newDiv.style.textAlign = 'center';
            newDiv.style.border = '1px solid gray';
            newDiv.style.boxShadow = '3px 3px 3px rgba(0, 0, 0, .7)';
            newDiv.innerHTML = label;
        }
        await LI.show('dropdown', newDiv, {}, { align: 'left', showHeader: true, label: week.weekStart.toLocaleDateString() + ' - ' + week.weekEnd.toLocaleDateString(), intersect: true });
    }
    initCanvas(y, w) {
        const dateStart = this.selectedItem?.doc?.dateStart;
        const dateEnd = this.selectedItem?.doc?.dateEnd;
        const maxAge = this.$.maxAge;
        let canvas = this.$qs('#canvas-phases');
        if (!canvas) return;
        let canvas_weeks = this.$qs('#canvas-weeks');
        let canvas_left = this.$qs('#canvas-left');
        canvas.width = canvas_weeks.width = this.offsetWidth - 54;
        const globalAlpha = .3;
        const _w = canvas.width / 52;
        const _h = 20;
        canvas.height = canvas_left.height = _h * maxAge + 8;
        canvas.addEventListener('click', (e) => {
            // const rect = canvas.getBoundingClientRect()
            // let x = e.clientX - rect.left
            // let y = e.clientY - rect.top
            let x = e.offsetX;
            let y = e.offsetY;
            x = Math.round((x - _w / 2) / _w);
            y = Math.round((y - _h / 2) / _h);
            if (x >= 0 && x <= 52 && y >= 0 && y <= 99) {
                console.log("x: " + x + " y: " + y);
                this.on_click(this.tmpWeek[y * 100 + x]);
            }
        })
        let ctx = canvas.getContext('2d');
        let ctx_weeks = canvas_weeks.getContext('2d');
        let ctx_left = canvas_left.getContext('2d');
        ctx.strokeStyle = "darkgray";
        ctx.lineWidth = 1;
        this.tmpWeek = {};
        const startYear = this.dataStart.getFullYear();
        ctx_weeks.fillStyle = ctx_left.fillStyle = "gray";
        ctx_weeks.font = ctx_left.font = "10px Arial";
        for (var w = 0; w < 52; w++) {
            ctx_weeks.fillText(w + 1, w * _w + _w / 5, _h / 2);
        }
        for (var y = 0; y < maxAge; y++) {
            ctx_left.fillText(startYear + y + (maxAge <= 100 ? '' : maxAge <= 1000 ? ' ' : '  ') + (y >= 1000 ? '' : '  ') + (y >= 100 ? '' : '  ') + (y < 10 ? '  ' : '') + y, 2, y * _h + 4 + _h / 2);
        }
        ctx_weeks.stroke;
        ctx_left.stroke;
        for (var y = 0; y < maxAge; y++) {
            for (var w = 0; w < 52; w++) {
                const week = { weeks: [] };
                let timeRowYearStart = this.timeRowYearStart(y);
                let weekStart = new Date(timeRowYearStart + w * LI.MS_DAY * 7);
                let weekEnd = new Date(timeRowYearStart + w * LI.MS_DAY * 7 + LI.MS_DAY * 6);
                if (w === 51) {
                    const date = new Date(timeRowYearStart);
                    date.setFullYear(date.getFullYear() + 1);
                    date.setDate(date.getDate() - 1);
                    weekEnd = date;
                }
                week.weekStart = weekStart;
                week.weekEnd = weekEnd;
                week.timeRowYearStart = timeRowYearStart;

                const d1 = new Date(dateStart);
                const d2 = dateEnd ? new Date(dateEnd) : new Date();
                let diff = Math.abs(d2.getTime() - d1.getTime());
                diff = (diff / 1000 / 60 / 60 / 24 / 365).toFixed(2);
                let val = {};
                if (d1 >= weekStart && d1 <= weekEnd) {
                    val.label = `
                        <div style="border-bottom: 1px solid lightgray; padding: 6px">start ...</div>
                        <strong>date start</strong>
                        <br>
                        <strong>${d1.toLocaleDateString()}</strong>
                        <div style="font-size: 14px">( ${diff} <span style="font-size: 10px"> year</span> )</div>
                        <hr>
                    `
                    ctx.globalAlpha = 1.0;
                    ctx.beginPath();
                    ctx.arc(w * _w + _w / 2 - 2, y * _h + 4 + _h / 2 - 2, _h / 4, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    // ctx.fillStyle = "red";
                    // ctx.font = "24px Arial";
                    // ctx.fillText('+', w * _w , y * _h + _h);
                    ctx.stroke();
                    week.weeks.push(val);
                }
                if (dateEnd && d2 >= weekStart && d2 <= weekEnd) {
                    val.label = `
                        <div style="border-bottom: 1px solid lightgray; padding: 6px">... end</div>
                        <strong>date end</strong>
                        <br>
                        <strong>${d2.toLocaleDateString()}</strong>
                        <div style="font-size: 14px">( ${diff} <span style="font-size: 10px"> year</span> )</div>
                        <hr>
                    `
                    ctx.globalAlpha = 1.0;
                    ctx.beginPath();
                    ctx.arc(w * _w + _w / 2 - 2, y * _h + 4 + _h / 2 - 2, _h / 4, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    // ctx.fillStyle = "red";
                    // ctx.font = "24px Arial";
                    // ctx.fillText('-', w * _w , y * _h + _h);
                    ctx.stroke();
                    week.weeks.push(val);
                }

                const length = this.selectedItem?.phases.length || 0;
                if (length) {
                    for (let l = 0; l < length; l++) {
                        const i = this.selectedItem.phases[l];
                        let val = {};
                        const d1 = new Date(i.date1);
                        const d2 = i.date2 ? new Date(i.date2) : new Date();
                        let diff = Math.abs(d2.getTime() - d1.getTime());
                        diff = (diff / 1000 / 60 / 60 / 24 / 365).toFixed(2);
                        if (i.isPeriod && (weekStart >= d1 || weekEnd >= d1) && (weekStart <= d2 || weekEnd <= d2)) {
                            val.isPeriod = true;
                            val.gradient = i.color;
                            if (d1 >= weekStart && d1 <= weekEnd && d2 >= weekStart && d2 <= weekEnd) {
                                const diffL = (7 - (weekEnd - d1) / LI.MS_DAY) / 7;
                                const diffR = (7 - (weekEnd - d2) / LI.MS_DAY) / 7;
                                let lingrad = ctx.createLinearGradient(w * _w, y * _h + 4, w * _w + _w - 4, y * _h + 4);
                                lingrad.addColorStop(0, 'transparent');
                                lingrad.addColorStop(diffL, 'transparent');
                                lingrad.addColorStop(diffL, i.color);
                                lingrad.addColorStop(diffR, i.color);
                                lingrad.addColorStop(diffR, 'transparent');
                                lingrad.addColorStop(1, 'transparent');
                                ctx.fillStyle = lingrad;
                                ctx.globalAlpha = globalAlpha;
                                ctx.fillRect(w * _w, y * _h + 4, _w - 4, _h - 4);
                                ctx.globalAlpha = 1.0;
                            } else if (d1 >= weekStart && d1 <= weekEnd) {
                                const diffL = (7 - (weekEnd - d1) / LI.MS_DAY) / 7;
                                let lingrad = ctx.createLinearGradient(w * _w, y * _h + 4, w * _w + _w - 4, y * _h + 4);
                                lingrad.addColorStop(0, 'transparent');
                                lingrad.addColorStop(diffL, 'transparent');
                                lingrad.addColorStop(diffL, i.color);
                                lingrad.addColorStop(1, i.color);
                                ctx.fillStyle = lingrad;
                                ctx.globalAlpha = globalAlpha;
                                ctx.fillRect(w * _w, y * _h + 4, _w - 4, _h - 4);
                                ctx.globalAlpha = 1.0;
                            } else if (d2 >= weekStart && d2 <= weekEnd) {
                                const diffR = (7 - (weekEnd - d2) / LI.MS_DAY) / 7;
                                let lingrad = ctx.createLinearGradient(w * _w, y * _h + 4, w * _w + _w - 4, y * _h + 4);
                                lingrad.addColorStop(0, i.color);
                                lingrad.addColorStop(diffR, i.color);
                                lingrad.addColorStop(diffR, 'transparent');
                                lingrad.addColorStop(1, 'transparent');
                                ctx.fillStyle = lingrad;
                                ctx.globalAlpha = globalAlpha;
                                ctx.fillRect(w * _w, y * _h + 4, _w - 4, _h - 4);
                                ctx.globalAlpha = 1.0;
                            } else {
                                ctx.globalAlpha = globalAlpha;
                                ctx.fillStyle = i.color;
                                ctx.fillRect(w * _w, y * _h + 4, _w - 4, _h - 4);
                                ctx.globalAlpha = 1.0;
                            }
                            val.label = `
                                    <div style="border-bottom: 1px solid lightgray; padding: 6px">${i.group || ''}</div>
                                    <strong>${i.label || ''}</strong>
                                    <br>
                                    <strong>${d1.toLocaleDateString()} - ${d2.toLocaleDateString()}</strong>
                                    <div style="font-size: 14px">( ${diff} <span style="font-size: 10px"> year</span> )</div>
                                    <hr>
                                `
                            week.weeks.push(val);
                        } else if (d1 >= weekStart && d1 <= weekEnd) {
                            val.gradient = i.color;
                            val.isDate = true;
                            val.label = `
                                    <div style="border-bottom: 1px solid lightgray; padding: 6px">${i.group || ''}</div>
                                    <strong>${i.label || ''}</strong>
                                    <br>
                                    <strong>${d1.toLocaleDateString()}</strong>
                                    <div style="font-size: 14px">( ${diff} <span style="font-size: 10px"> year</span> )</div>
                                    <hr>
                                `
                            ctx.globalAlpha = globalAlpha;
                            ctx.beginPath();
                            ctx.arc(w * _w + _w / 2 - 2, y * _h + 4 + _h / 2 - 2, _h / 2, 0, 2 * Math.PI);
                            ctx.fillStyle = i.color;
                            ctx.fill();
                            ctx.stroke();
                            ctx.globalAlpha = 1.0;
                            week.weeks.push(val);
                        }
                    }
                }
                ctx.globalAlpha = globalAlpha;
                ctx.strokeRect(w * _w, y * _h + 4, _w - 4, _h - 4);
                ctx.globalAlpha = 1.0;
                this.tmpWeek[y * 100 + w] = week;
            }
        }
        ctx.stroke();
        this.isReady = true;
    }
})

customElements.define('li-family-week', class LiFamilyWeek extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%; 
                height: 100%;
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
            ${this.weeks?.map(i => html`
                ${i.isPeriod ? html`
                    <div style="top: 0; position: absolute; background: ${i.gradient || ''}; width: 100%; height: 100%; opacity: .3;}"></div>
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
            label: { type: String },
            weeks: { type: Array },
            weekStart: { type: Object },
            weekEnd: { type: Object },
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

customElements.define('li-family-photo', class LiFamilyTree extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                box-sizing: border-box;
                margin-right: 6px; 
             }
             input {
                border: none;
                border-bottom: 1px solid lightgray; 
                outline: none;
                min-width: 0px; 
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
            label {
                color: darkgray;
                font-size: 12px;
            }
        `;
    }

    render() {
        return html`
            ${this.selected?.doc?.usePhases ? html`
                <div style="align-items: center; justify-content: center; overflow: hidden; color: gray; display: flex; flex: 1;  border-bottom: 1px solid darkgray; padding-bottom: 4px; margin-bottom: 4px; flex-wrap: wrap"> 
                    <img style="cursor: pointer; border: 1px solid gray; margin-right: 12px; padding: 4px; width: 78px;height:108px; opacity: .1" src=${this.selected?.doc?.genderType === 'man' ? './man.jpg' : this.selected?.doc?.genderType === 'woman' ? './woman.jpg' : './man.jpg'} alt="" onerror="this.style.opacity='0'">
                    <div style="overflow: hidden; display: flex; flex-direction: column; flex: 1; min-width: 160px">
                        <div style="display: flex">
                            <input id="genderType" list="gender" name="browgenderser" class="inpt" value=${this.selected?.doc?.genderType} placeholder="gender or event type" style="flex: 1" @change=${this.onchangeStartEnd}>
                            <datalist id="gender">
                                <option value="man">
                                <option value="woman">
                            </datalist>
                            <div style="color: darkgray; font-size: 14px">${this.years}</div>
                        </div>    
                        <label>date start</label>
                        <input id="dateStart" type="datetime-local" value=${this.selected?.doc?.dateStart} style="flex: 1" @input=${this.onchangeStartEnd}>
                        <input id="place" class="inpt" value=${this.selected?.doc?.place} placeholder="place" style="flex: 1" @change=${this.onchangeStartEnd}>
                        <label>date end</label>
                        <input id="dateEnd" type="datetime-local" value=${this.selected?.doc?.dateEnd} style="flex: 1" @input=${this.onchangeStartEnd}>
                    </div>
                </div>
            ` : html``}
        `
    }

    static get properties() {
        return {

        }
    }
    get selected() { return this.$._selectedItem || this.$.selectedItem}
    get years() {
        const d1 = (new Date(this.selected?.doc?.dateStart)).getTime();
        const d2 = (new Date(this.selected?.doc?.dateEnd || new Date())).getTime();
        const diff = Math.abs(d2 - d1);
        return diff ? (diff / 1000 / 60 / 60 / 24 / 365).toFixed(2) : '';
    }
    onchangeStartEnd(e) {
        this.selected.doc[e.target.id] = e.target.value;
        this.$.changedItemsID ||= [];
        this.$.changedItemsID.add(this.selected._id);
        this.$.changedItems ||= {};
        this.$.changedItems[this.selected._id] = this.selected;
        this.$update();
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
                min-width: 0px; 
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
            <li-family-photo></li-family-photo>
            <div style="display: flex; flex-direction: column">
                ${(this.$.selectedItem?.phases || []).map((doc, idx) => html`
                    <div @pointerdown=${() => { this.selectedPahsesIdx = idx; this.$update() }} style="padding: 4px; border: 1px solid ${idx === this.selectedPahsesIdx ? 'blue' : 'lightgray'}; border-radius: 4px; margin-bottom: 4px; background-color: hsla(${doc.isPeriod ? 180 : 90}, 70%, 70%, .2); overflow: hidden;">
                        <div style="display: flex">
                            <input class="inpt" value=${doc.label} @change=${e => this.onchange(e, doc, idx, 'label')} placeholder="event">
                        </div>
                        <input  class="inpt" type="datetime-local" value=${doc.date1} @change=${e => this.onchange(e, doc, idx, 'date1')} placeholder="date">
                        ${doc.isPeriod ? html`
                            <input  class="inpt" type="datetime-local" value=${doc.date2} @change=${e => this.onchange(e, doc, idx, 'date2')} placeholder="date end">
                        ` : html``}
                        <div style="display: flex; align-items: center">
                            <input class="inpt" value=${doc.group} @change=${e => this.onchange(e, doc, idx, 'group')} placeholder="group">
                            <div style="color: darkgray; font-size: 14px">${this.years(doc)}</div>
                            <li-button name="edit" size="16" scale=".8" @click=${this.setNotebook} back=${doc.notebook?.cells.length ? 'yellow' : ''}></li-button>
                        </div>
                        <input type="color" value=${doc.color || '#ffffff'} @change=${e => this.onchange(e, doc, idx, 'color')} style="opacity: .5; height: 18px; border-radius: 0">
                    </div>
                `)}
            </div>
        `
    }

    static get properties() {
        return {
            selectedPahsesIdx: { type: Number, default: -1 },
            selectedItem: { type: Object, local: true },
            genderType: { type: String }
        }
    }
    get genderType() { return this.selectedItem?.doc?.genderType }
    get selectedPhases() { return this.$.selectedItem.phases[this.selectedPahsesIdx] }

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
        this.$.notebook = this.$.selectedItem.phases[this.selectedPahsesIdx].notebook || { id: 'phases', label: this.$.selectedItem.phases[this.selectedPahsesIdx].label + ' (' + this.$.selectedItem.phases[this.selectedPahsesIdx].group + ')', cells: [] };
        this.$.simpleMain.idx = 0;
        this.$update();
    }
})
