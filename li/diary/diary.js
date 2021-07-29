import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js';
import '../checkbox/checkbox.js';
import '../calendar/calendar.js';

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
                color:gray; 
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
            }
        `;
    }

    render() {
        return html`
            <li-layout-app>
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>${this.dbName || 'my diary'}<div style="flex:1"></div>
                </div>
                <div slot="app-left" class="panel">
                    <div style="display: flex; border-bottom: 1px solid lightgray;">
                        <li-button name="create" title="diary" @click="${() => this.leftView = 'diary'}" ?toggled="${this.leftView === 'diary'}" toggledClass="ontoggled"></li-button>
                        <li-button name="settings" title="settings" @click="${() => this.leftView = 'settings'}" ?toggled="${this.leftView === 'settings'}" toggledClass="ontoggled"></li-button>
                        <div style="flex:1"></div>
                        <li-button name="save" title="save" @click="${this._treeActions}" .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}"></li-button>
                    </div>
                    <b class="lbl">${this.leftView}</b>
                    <div class="panel-in">
                        ${this.leftView === 'diary' ? html`
                            ${this.types.map((i, idx) => html`
                                <li-button .name="${i.icon}" size="36" width="auto" @click="${(e) => this._setMainView(e, idx)}" toggledClass="_white" 
                                    ?toggled="${this.mainView === i.type}" fill="${`hsla(${idx * 40}, 50%, 50%, 1)`}" .back="${`hsla(${idx * 40}, 70%, 70%, 0.5)`}">${i.type}</li-button>
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
                    <div style="color:${`hsla(${this._idx * 40}, 50%, 50%, 1)`}; font-size: 24px; text-decoration: underline;">${this.mainView}</div>
                    <div ?hidden="${this.mainView !== 'measurements'}">
                        <img src="./measure.jpg" style="width: 510px;">
                        ${[...Array(13).keys()].map((i, idx) => html`
                            <div style="position: absolute; top: ${idx * 40 + 32}px; left: 210px; color: lightgray; font-size: 12px; display: flex; align-items: center;">
                                <input class="inpm" placeholder="0" style="width: 80px;">см</div>`)}
                    </div>
                </div>
                <div slot="app-right" class="panel">
                <div style="display: flex; border-bottom: 1px solid lightgray;">
                        <li-button name="event" title="calendar" @click="${() => this.rightView = 'calendar'}" ?toggled="${this.rightView === 'calendar'}" toggledClass="ontoggled"></li-button>
                        <li-button name="list" title="list" @click="${() => this.rightView = 'list'}" ?toggled="${this.rightView === 'list'}" toggledClass="ontoggled"></li-button>
                    </div>
                    <b class="lbl">${this.rightView}</b>
                    <div class="panel-in" style="padding: 0px;">
                        ${this.rightView === 'calendar' ? html`
                            <li-calendar></li-calendar>
                        ` : this.rightView === 'list' ? html`

                        ` : html``}
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
            leftView: { type: String, default: 'diary' },
            rightView: { type: String, default: 'calendar' },
            mainView: { type: String, default: '' }
        }
    }

    get types() {
        return [
            { icon: 'dining', type: 'eating' },
            { icon: 'water_drop', type: 'water' }, 
            { icon: 'hiking', type: 'walking' }, 
            { icon: 'sports_volleyball', type: 'sport' }, 
            { icon: 'bedroom_parent', type: 'dream' }, 
            { icon: 'monitor_weight', type: 'weighing' }, 
            { icon: 'accessibility_new', type: 'measurements' }, 
        ]
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        super.firstUpdated();
    }

    _autoReplication() {
        this.autoReplication = !this.autoReplication;
    }

    _setMainView(e, idx) {
        this.mainView = e.target.innerText;
        e.target.toggled = this.mainView === e.target.innerText;
        this._idx = idx || 0;
        this.$update();
    }
});
