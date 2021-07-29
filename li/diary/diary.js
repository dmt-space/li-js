import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

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
                overflow: hidden;
            }
            .lbl {
                padding: 4px;
            }
            .inps {
                border: none; 
                outline: none; 
                width: 100%; 
                color:gray; 
                opacity: 0.9;
                font-size: 18;
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
                            <li-button name="dining" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'eating'}" toggledClass="ontoggled">eating</li-button>
                            <li-button name="water_drop" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'water'}" toggledClass="ontoggled">water</li-button>
                            <li-button name="hiking" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'walking'}" toggledClass="ontoggled">walking</li-button>
                            <li-button name="sports_volleyball" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'sport'}" toggledClass="ontoggled">sport</li-button>
                            <li-button name="bedroom_parent" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'dream'}" toggledClass="ontoggled">dream</li-button>
                            <li-button name="monitor_weight" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'weighing'}" toggledClass="ontoggled">weighing</li-button>
                            <li-button name="accessibility_new" size="36" width="auto" @click="${this._setMainView}" ?toggled="${this.mainView === 'measurements'}" toggledClass="ontoggled">measurements</li-button>
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
                    <div>${this.mainView}</div>
                    <div ?hidden="${this.mainView !== 'measurements'}">
                        <img src="./measure.png">
                        ${[...Array(13).keys()].map((i, idx) => html`
                            <input class="inps" value="0" type="number" style="text-align: center;position: absolute; top: ${idx * 41 + 49}px; left: 212px; width: 100px;">
                        `)}
                    </div>
                </div>
                <div slot="app-right" class="panel">
                    calendar...
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
            mainView: { type: String, default: '' }
        }
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

    _setMainView(e) {
        this.mainView = e.target.innerText;
        this.$update();
    }
});
