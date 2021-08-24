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
            .container-calorie {
                height: calc(100% - 40px);
                padding: 2px;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app>
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>${(this.dbName || 'my diary') + this._periods}<div style="flex:1"></div>
                </div>
                <div slot="app-left" class="panel">
                    <div style="display: flex; border-bottom: 1px solid lightgray;">
                        <li-button name="create" title="diary" @click="${() => this.leftView = 'diary'}" ?toggled="${this.leftView === 'diary'}" toggledClass="ontoggled"></li-button>
                        <li-button name="settings" title="settings" @click="${() => this.leftView = 'settings'}" ?toggled="${this.leftView === 'settings'}" toggledClass="ontoggled"></li-button>
                        <div style="flex:1"></div>
                        <li-button name="save" title="save" .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}"></li-button>
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
                                <div class="lbl" style="color:gray; opacity: 0.7">version: 0.1.0</div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div style="display: flex"><div class="lbl" style="width: 100px">db name:</div><input class="inps" .value="${this.dbName}" @change="${this._setDbName}"></div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div class="lbl" style="color:gray; opacity: 0.7">Couchdb settings:</div>
                                <div style="display: flex"><div class="lbl" style="width: 100px">db ip:</div><input class="inps" .value="${this.dbIP}" @change="${this._setDbIP}"></div>
                                <div style="display: flex; align-items: center;"><li-checkbox @change="${this._autoReplication}" .toggled="${this.autoReplication}"></li-checkbox>
                                    Auto replication local and remote db</div>
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
                                <li-button name="add" @click=${this._addRow} title="add new row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}" style="margin-left: auto"></li-button>
                                <li-button name="close" title="delete row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}"></li-button>
                            `}
                        </div>
                    ` : html``}
                    ${!['eating', 'water', 'walking', 'sport', 'dream'].includes(this._mainView?.name) ? html`` : html`
                        <div class="container">
                            <li-table .$partid=${'table-' + this._mainView?.name} id=${'table-' + this._mainView?.name} .data="${this._data}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'favorites' ? html`` : html`
                        <div class="container-calorie" style="display: flex; flex-direction: column"> 
                            <li-table $partid="table-favorites" id="table-favorites" .data="${this._data}" style="height: 48%"></li-table>
                            <div style="color:${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}; font-size: 24px; text-decoration: underline;">таблица калорийности</div>
                            <li-table $partid="table-fcalorie" id="table-fcalorie" .data="${foodList}" style="height: 48%"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'weighing' ? html`` : html`
                        <div class="container"> 
                            <li-table $partid="table-weighing" id="table-weighing" .data="${this._data}"></li-table>
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
                                <input class="inpm" placeholder="0" style="width: 80px; text-align: center;">см
                            </div>
                        `)}
                        <div style="display: flex;">
                            <li-button name="check" title="заполнить" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}"></li-button>
                            <li-button name="add" @click=${this._addRow} title="add new row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}" style="margin-left: auto"></li-button>
                            <li-button name="close" title="delete row" fill="${`hsla(${this._idx * this.step}, 50%, 50%, 1)`}" back="${`hsla(${this._idx * this.step}, 50%, 50%, .1)`}"></li-button>
                        </div>
                        <div class="container">
                            <li-table $partid="table-measurements" id="table-measurements" .data="${this._data}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'calorie' ? html`` : html`
                        <div class="container-calorie"> 
                            <li-table $partid="table-calorie" id="table-calorie" .data="${foodList}"></li-table>
                        </div>
                    `}
                    ${this._mainView?.name !== 'wiki' ? html`` : html`
                        <li-wiki id="diary-wiki" dbName="diary-wiki"></li-wiki>
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
            dbName: { type: String, default: 'my diary', save: true },
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
            _addItems: { type: Array, default: [] },
            _delItems: { type: Array, default: [] },
        }
    }

    get _measurements() {
        return this.measurements.filter(i => i.use);
    }
    get _periods() {
        if (!this.period) return '';
        const p0 = this.period[0].split('-').reverse().join('-');
        if (this.period[0] === this.period[1]) return ` (${p0})`;
        const p1 = this.period[1].split('-').reverse().join('-');
        return ` (${p0} ... ${p1})`;
    }
    get _needSave() {
        return this._addItems?.length || this._delItems?.length;
    }

    connectedCallback() {
        super.connectedCallback();
        this.measurements = sets.measurementsPos;
        this.types = sets.types;
    }

    _autoReplication() {
        this.autoReplication = !this.autoReplication;
    }

    _setMainView(e, idx, i) {
        if (this.mainView === i.label) return;
        this._mainView = undefined;
        requestAnimationFrame(() => {
            this._mainView = i;
            const mainView = i.label;
            const opts = {
                headerColor: `hsla(${idx * this.step}, 50%, 50%, .1)`,
                footerColor: `hsla(${idx * this.step}, 50%, 50%, .1)`,
            };
            this._data = {};
            if (sets[this._mainView.name]) {
                this._data.columns = sets[this._mainView.name].columns;
                this._data.options = { ...(sets[this._mainView.name].options || {}), ...opts };
                this._data.rows = sets[this._mainView.name].rows;
            }
            this.mainView = mainView;
            e.target.toggled = this.mainView === mainView;
            this._idx = idx || 0;
            this.$update();
        });
    }
    _addRow(e) {
        this.action = undefined;
        const ulid = LI.ulid(),
            type = this._mainView.name,
            _id = `${type}:${ulid}`,
            created = LI.dates(),
            item = { _id, ulid, type, created, date: created.short };
        this._addItems = this._addItems || [];
        this._addItems.push(item);
        this._data.rows.push(item);
        this.action = {
            id: `table-${type}`,
            fn: '_setRows'
        }
    }
});
