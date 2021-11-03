import { LiElement, html, css, svg } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js';
import '../checkbox/checkbox.js';
import '../calendar/calendar.js';
import '../wiki/wiki.js';
import '../table/table.js';
import { foodList } from './food.js';
import { sets } from './settings.js';

customElements.define('li-diary', class LiDiary extends LiElement {

    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
            :host {
                color: #505050;
            } 
            .header {
                display: flex;
                align-items: center;
                color: gray;
                font-size: large;
            }
            .panel {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .panel-in {
                display: flex;
                flex-direction: column;
                border-top: 1px solid lightgray;
                padding: 4px;
                flex: 1;
                overflow: auto;
            }
            .lbl {
                padding: 4px;
            }
            input {
                border: none; 
                outline: none; 
                width: 100%; 
                color: gray; 
                opacity: 0.9;
            }
            .inps {
                font-size: 18px;
            }
            .inpm {
                font-size: 18px;
                background-color: transparent;
            }
            .inpm::placeholder {
                color: lightgray;
                opacity: .8;
            }
            .main {
                position: relative;
                height: 100%;
            }
            .container {
                display: flex; 
                padding: 2px;
            }
            .list {
                padding: 4px 0 4px 4px;
            }
            .container-split {
                height: calc(100% - 40px);
                padding: 2px;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app>
                <div slot="app-top" class="header">
                    ${!this.showButtons ? html`` : this.types.map((i, idx) => html`
                        <li-button .name="${i.icon}" size="24" @click="${(e) => this._setMainView(e, idx, i)}" toggledClass="_white" 
                            ?toggled="${this.mainView === i.label}" fill="${`hsla(${idx * this.step}, 50%, 50%, 1)`}" border="none"></li-button>
                    `)}
                    <div style="flex:1"></div><div style="color: ${this._colorDay || 'gray'}">${(this.dbName || 'my-diary') + this._periods + this._dayView}</div><div style="flex:1"></div>
                    ${['A', 'Y', 'Q', 'M', 'W', 'D'].map((i, idx) => html`
                        <li-button size="20" @click="${(e) => this._setDayView(e, idx, i)}" color="${`hsla(${idx * 60}, 50%, 50%, 1)`}" 
                            title=${this._dayViewArray[idx]} style="margin-left: 6px;">${i}</li-button>
                    `)}
                    <li-button name="refresh" title="reset changes" @click=${this._resetChanges} style="margin-left: 8px; margin-right: 8px;"></li-button>
                    <li-button name="save" title="save" .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}" @click=${this._save} style="margin-right: 8px;"></li-button>
                </div>
                <div slot="app-left" class="panel">
                    <div style="display: flex; border-bottom: 1px solid lightgray;">
                        <li-button name="create" title="diary" @click="${() => this.leftView = 'diary'}" ?toggled="${this.leftView === 'diary'}" toggledClass="ontoggled"></li-button>
                        <li-button name="settings" title="settings" @click="${() => this.leftView = 'settings'}" ?toggled="${this.leftView === 'settings'}" toggledClass="ontoggled"></li-button>
                        <div style="flex:1"></div>
                        <li-button name="refresh" title="reset changes" @click=${this._resetChanges}></li-button>
                        <li-button name="save" title="save" .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}" @click=${this._save}></li-button>
                    </div>
                    <b class="lbl">${this.leftView}</b>
                    <div class="panel-in">
                        ${this.leftView === 'diary' ? html`
                            ${this.types.map((i, idx) => html`
                                <li-button .name="${i.icon}" size="36" width="auto" @click="${(e) => this._setMainView(e, idx, i)}" toggledClass="_white" 
                                    ?toggled="${this.mainView === i.label}" fill="${`hsla(${idx * this.step}, 50%, 50%, 1)`}" .back="${`hsla(${idx * this.step}, 70%, 70%, 0.5)`}">${i.label}</li-button>
                            `)}
                        ` : this.leftView === 'settings' ? html`
                            <div style="display: flex; flex-direction: column; overflow: auto;">
                                <div class="lbl" style="color:gray; opacity: 0.7">version: 0.2.0</div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div style="display: flex"><div class="lbl" style="width: 100px">db name:</div><input class="inps" .value="${this.dbName}" @change="${this._setDbName}"></div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div class="lbl" style="color:gray; opacity: 0.7">Couchdb settings:</div>
                                <div style="display: flex"><div class="lbl" style="width: 100px">db ip:</div><input class="inps" .value="${this.dbIP}" @change="${this._setDbIP}"></div>
                                <div style="display: flex; align-items: center;"><li-checkbox @change="${this._autoReplication}" .toggled="${this.autoReplication}"></li-checkbox>
                                    Auto replication local and remote db</div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div style="display: flex; align-items: center;"><li-checkbox @change="${() => this.showButtons = !this.showButtons}" .toggled="${this.showButtons}"></li-checkbox>
                                    Show buttons in top</div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            </div>
                        ` : html``}
                    </div>
                </div>
                <div slot="app-main" class="main" id="main">
                    ${!this.types[this._idx]?.hideLabel ? html`
                        <div style="display: flex">
                            <div style="color:${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}; font-size: 24px; text-decoration: underline;">${this.mainView}</div>
                            ${!'eating water walking sport dream weighing favorites'.includes(this._mainView?.name) ? html`` : html`
                                ${this._mainView?.name === 'eating' ? html`<div style="margin-left: auto"></div>` : html`   
                                    <li-button name="add" @click=${this._addRow} title="add new row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}" style="margin-left: auto"></li-button>
                                `} 
                                <li-button name="close" @click=${this._deleteRow} title="delete row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}"></li-button>
                            `}
                        </div>
                    ` : html``}
                    ${this._mainView?.name !== 'eating' ? html`` : html`
                        <div class="container-split" style="display: flex; flex-direction: column"> 
                            <li-table id="table-eating" .data="${this._data}" style="height: 48%"></li-table>
                            <div style="display: flex">
                            <div @click=${e => this._eating = '001'} style="cursor: pointer; color:${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}; font-size: 24px; text-decoration: ${this._eating !== '002' ? 'underline' : ''}">избранное</div>
                            <div style="flex:1"></div>
                            <div @click=${e => this._eating = '002'} style="cursor: pointer; color:${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}; font-size: 24px; text-decoration: ${this._eating === '002' ? 'underline' : ''}">таблица калорийности</div>
                            </div>
                            ${this._eating !== '002' ? html`
                                <li-table id="table-favorites" style="height: 48%" .data="${{
                        columns: sets.favorites.columns,
                        options: { ...sets.favorites.options, readonly: true },
                        rows: sets.favorites.rows
                    }}"></li-table>
                            ` : html`
                                <li-table id="table-ecalorie" style="height: 48%" .data="${foodList}"></li-table>
                            `}
                        </div>
                    `}
                    ${this._mainView?.name !== 'favorites' ? html`` : html`
                        <div class="container-split" style="display: flex; flex-direction: column"> 
                            <li-table id="table-favorites" .data="${this._data}" style="height: 48%"></li-table>
                            <div style="color:${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}; font-size: 24px; text-decoration: underline;">таблица калорийности</div>
                            <li-table id="table-fcalorie" .data="${foodList}" style="height: 48%"></li-table>
                        </div>
                    `}
                    ${!['water', 'walking', 'sport', 'dream'].includes(this._mainView?.name) ? html`` : html`
                        <div class="container">
                            <li-table id=${'table-' + this._mainView?.name} .data="${this._data}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'weighing' ? html`` : html`
                        <div class="container"> 
                            <li-table id="table-weighing" .data="${this._data}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'measurements' ? html`` : html`
                        <img src="./measure.jpg" style="width: 510px;" @click="${e => console.log(e.offsetX, e.offsetY)}">
                        <svg viewBox="0 0 510 584" width="510" height="584" style="position: absolute; top:30; left:0;">
                            ${this._measurements.map((i, idx) => svg`
                                <line x1="${i.x}" y1="${i.y}" x2="200" y2="${idx * this.step + 31}" stroke="lightblue" />
                                <line x1="200" y1="${idx * this.step + 31}" x2="320" y2="${idx * this.step + 31}" stroke="lightblue" />
                                <line x1="320" y1="${idx * this.step + 31}" x2="${i.x1}" y2="${i.y1}" stroke="lightblue" />
                                <circle cx="${i.x}" cy="${i.y}" r="4" fill="lightblue" />
                                <circle cx="200" cy="${idx * this.step + 31}" r="2" fill="lightblue" />
                                <circle cx="320" cy="${idx * this.step + 31}" r="2" fill="lightblue" />
                                <circle cx="${i.x1}" cy="${i.y1}" r="4" fill="lightblue" />
                            `)} 
                        </svg>
                        ${this._measurements.map((i, idx) => html`
                            <div style="position: absolute; top: ${idx * this.step + 34}px; left: 100px; color: gray; font-size: 10px; display: flex; align-items: center;">
                                <div style="width: 120px; text-align: right;">${i.name}</div>  
                                <input class="inpm" placeholder="0" style="width: 80px; text-align: center;" .value=${i.val || ''} @change=${e => this._changeMeasurements(e, i)}>см
                            </div>
                        `)}
                        <div style="display: flex;">
                            <li-button name="add" @click=${this._addRow} title="add new row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}" style="margin-left: auto"></li-button>
                            <li-button name="close" @click=${this._deleteRow} title="delete row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}"></li-button>
                        </div>
                        <div class="container">
                            <li-table id="table-measurements" .data="${this._data}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'calorie' ? html`` : html`
                        <div class="container-split"> 
                            <li-table id="table-calorie" .data="${foodList}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'wiki' ? html`` : html`
                        <li-wiki id=${this.dbName} dbName=${this.dbName}></li-wiki>
                    `}
                </div>
                <div slot="app-right" class="panel">
                    <b class="lbl">${this.rightView}</b>
                    <div class="panel-in" style="padding: 0px;">
                        <li-calendar></li-calendar>
                    </div>
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            dbName: { type: String, default: 'my-diary', save: true },
            dbIP: { type: String, default: 'http://admin:54321@localhost:5984/', save: true },
            autoReplication: { type: Boolean, default: false, save: true },
            step: { type: Number, default: 35 },
            leftView: { type: String, default: 'diary' },
            rightView: { type: String, default: 'calendar' },
            mainView: { type: String, default: '' },
            _mainView: { type: Object },
            measurements: { type: Array },
            types: { type: Array },
            period: { type: Array, local: true },
            action: { type: Object, global: true },
            _changedList: { type: Object },
            _eating: { type: String, default: '001' },
            showButtons: { type: Boolean, default: false, save: true }
        }
    }

    get _measurements() {
        return this.measurements.filter(i => i.use);
    }
    get _periods() {
        if (!this.period) return '';
        this._period.p0 = this.period[0].split('-').reverse().join('-');
        if (this.period[0] === this.period[1]) return ` (${this._period.p0})`;
        this._period.p1 = this.period[1].split('-').reverse().join('-');
        return ` (${this._period.p0} ... ${this._period.p1})`;
    }
    get _currentDate() {
        if (!this.period) return '';
        return this.period[1];
    }
    get _needSave() {
        return this._changedList?.size;
    }

    constructor() {
        super();
        this._dbName = window.location.href.split('#')?.[1];
        this.listen('tableRowSelect', (e) => {
            if (this._mainView?.name === 'measurements' && e?.detail?.row) {
                this._measurementsFocusedRow = e.detail;
                this.measurements.forEach(i => i.val = this._measurementsFocusedRow.row[i.name] || '');
            } else {
                this._measurementsFocusedRow = undefined;
                this.measurements.forEach(i => i.val = '');
            }
            this.$update();
        });
        this._dayViewArray = ['for all the time', 'in a year', 'for the quarter', 'per month', 'during the week', 'for the current day'];
    }

    connectedCallback() {
        super.connectedCallback();
        this.measurements = sets.measurementsPos;
        this.types = sets.types;
        this._period = LI.icaro({});
        this._period.listen(() => this._resetView());
    }
    updated(e) {
        if (e.has('action') && this.action) {
            if ((this._mainView.name === 'eating' && this.action.id === 'table-favorites'
                || this._mainView.name === 'eating' && this.action.id === 'table-ecalorie'
                || this._mainView.name === 'favorites' && this.action.id === 'table-fcalorie')
                && this.action.action === 'dblClickTableCell'
            ) {
                this._addRow(null, this.action.row);
            }
            if (this.action.action === 'tableCellChanged' && this.$ulid !== this.action.ulid && this.action.row._id) {
                this._changedList = this._changedList || new Map();
                this._changedList.set(this.action.row._id, this.action.row);
                this.$update();
            }
        }
    }
    async firstUpdated() {
        super.firstUpdated();
        setTimeout(async () => {
            this.dbName = this._dbName || this.dbName;
            this.dbLocal = new PouchDB(this.dbName);
            this.dbRemote = new PouchDB(this.dbIP + this.dbName);
            if (this.autoReplication) this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
            this.$update();
        }, 100);
    }

    _setDbName(e) {
        this.dbName = e.target.value;
        if (!this.dbName) this.dbName = 'my-diary';
        this.autoReplication = false;
        window.location.href = window.location.href.split('#')?.[0] + '#' + this.dbName;
        location.reload();
    }
    _setDbIP(e) {
        this.dbIP = e.target.value;
        // localStorage.setItem('wiki_temp.temp', LZString.compress(this.dbIP));
    }
    _autoReplication(e) {
        this.autoReplication = e.detail;
        if (this.autoReplication) {
            this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
        } else {
            this.replicationHandler.cancel();
        }
    }

    _resetChanges() {
        this._changedList = new Map();
        this._resetView();
    }
    _resetView() {
        this._changedSet = new Set();
        if (this._mainView?.name === 'eating')
            this._initMainView('favorites');
        this._initMainView();
        this._colorDay = this._dayView = '';
        this.update();
    }
    async _setDayView(ev, idx, i) {
        if (!this._mainView?.name || this._idx > 6) return;
        this._changedList = new Map();
        this._dayView = ' - ' + i;
        this._colorDay = `hsla(${idx * 60}, 50%, 50%, 1)`;
        let d = new Date();
        let s = new Date(
            new Date(d).getFullYear() - (i === 'A' ? 100 : i === 'Y' ? 1 : 0),
            new Date(d).getMonth() - (i === 'Q' ? 3 : 0),
            new Date(d).getDate() - (i === 'W' ? 7 : i === 'M' ? 31 : 0)
        );
        // console.log(this._mainView.name, LI.dates(s).short, LI.dates(d).short)
        this._initMainView(this._mainView.name, LI.dates(s).short, LI.dates(d).short);
    }
    _setMainView(e, idx, i) {
        e.target.toggled = this.mainView === i.label;
        if (this.mainView === i.label) return;
        this._colorDay = this._dayView = '';
        this._mainView = undefined;
        this._mainView = i;
        const mainView = i.label;
        this._colorOpts = {
            headerColor: `hsla(${idx * this.step}, 50%, 50%, .1)`,
            footerColor: `hsla(${idx * this.step}, 50%, 50%, .1)`,
        };
        this.mainView = mainView;
        this._idx = idx || 0;
        if (this._mainView.name === 'eating')
            this._initMainView('favorites');
        this._initMainView();
    }
    _initMainView(view = this._mainView?.name, startkey, endkey) {
        if (!view) return;
        requestAnimationFrame(async () => {
            let res;
            this._changedSet = this._changedSet || new Set();
            if (!this._changedSet.has(view) || !sets[view]?.rows.length || startkey) {
                this._changedSet.add(view);
                startkey = view + ':' + (view === 'favorites' ? '' : startkey || this.period[0]);
                endkey = view + ':' + (view === 'favorites' ? '' : endkey || this._currentDate);
                const items = await this.dbLocal.allDocs({ include_docs: true, startkey, endkey: endkey + '\ufff0' });
                res = [];
                items.rows.forEach(i => res.push(i.doc));
            }
            if (sets[view]) {
                this._changedSet.add(view)
                if (view === this._mainView?.name) {
                    this._data = {};
                    this._data.columns = sets[view].columns;
                    this._data.options = { ...(sets[view].options || {}), ...this._colorOpts };
                    sets[view].rows = this._data.rows = res || sets[view].rows;
                } else {
                    sets[view].rows = res || sets[view].rows;
                }
            }
            this.$update();
        });
    }
    _addRow(e, row) {
        this.action = undefined;
        const ulid = LI.ulid(),
            type = this._mainView.name,
            created = LI.dates(new Date(this._currentDate)),
            _id = `${type}:${created.short}:${ulid}`;
        let item = { _id, ulid, type, date: created.short };
        if (row) item = { ...row, ...item };
        this._changedList = this._changedList || new Map();
        this._changedList.set(_id, item);
        this._data.rows.push(item);
        this.action = {
            id: `table-${type}`,
            fn: '_setRows',
            scrollToEnd: true
        }
    }
    _deleteRow() {
        this.action = undefined;
        const type = this._mainView.name;
        this.action = {
            id: `table-${type}`,
            fn: '_deleteRow'
        }
    }
    async _save() {
        if (!this._changedList?.keys()) return
        const items = await this.dbLocal.allDocs({ keys: [...this._changedList.keys()], include_docs: true });
        const res = [];
        items.rows.map(i => {
            const doc = this._changedList.get(i.key);
            if (i.doc && !i.error) i.doc = { ...i.doc, ...doc };
            else if (!doc._deleted) {
                delete doc._rev;
                i.doc = { ...doc };
            }
            if (i.doc) {
                const toDelete = [];
                Object.keys(i.doc).forEach(k => { if (k.startsWith('$')) toDelete.push(k) });
                const split = i.doc._id.split(':');
                toDelete.forEach(k => delete i.doc[k]);
                if (i.doc.date !== split[1]) {
                    let newDoc = { ...{}, ...i.doc };
                    i.doc._deleted = true;
                    delete newDoc._rev;
                    newDoc.ulid = LI.ulid();
                    newDoc._id = split[0] + ':' + newDoc.date + ':' + newDoc.ulid;
                    res.add(newDoc);
                }
                res.add(i.doc);
            }
        })
        await this.dbLocal.bulkDocs(res);
        this._changedList = new Map();
        // this._resetChanges();
    }
    _changeMeasurements(e, i) {
        i.val = e.target.value;
        if (this._measurementsFocusedRow) {
            this._measurementsFocusedRow.row[i.name] = i.val;
            this._measurementsFocusedRow.update();
        }
    }
});
