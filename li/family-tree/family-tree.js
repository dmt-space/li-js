import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js'

customElements.define('li-family-tree', class LiFamilyTree extends LiElement {
    render() {
        return html`
            <li-layout-app sides="260,260,1,1" fill="#9f731350" style="width: 100%; height: 100%; flex: 1; position: relative;">
                <div slot="app-top">
                    family-tree
                </div>

                 <div slot="app-left">
                     left
                </div>

                <li-family-tree-main slot="app-main" style="width: 100%; height: 100%;"></li-family-tree-main>

                <div slot="app-right">
                    right
                </div>
            </li-layout-app>
        `;
    }
});

customElements.define('li-family-tree-main', class LiFamilyTreeMain extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                flex: 1;
                box-sizing: border-box;
            }
        `;
    }

    render() {
        return html`
            <div style="transform: scale(${this.scale}); display: flex">
                <li-family-tree-box .persona=${this.persona.parents[0]} level=-1></li-family-tree-box>
                <li-family-tree-box .persona=${this.persona.parents[1]} level=-1></li-family-tree-box>
                <li-family-tree-box .persona=${this.persona} level=0></li-family-tree-box>
            </div>
        `;
    }

    static get properties() {
        return {
            translateX: { type: Number, default: 0, local: true, save: true },
            translateY: { type: Number, default: 0, local: true, save: true },
            scale: { type: Number, default: 1, local: true, save: true },
            persona: {
                type: Object, default: {
                    id: '01FP8R0ZGJCXRH2RBQK22YY1FT',
                    name: 'Иванов Сергей Семенович',
                    sex: 'm',
                    bd: '25.05.1959',
                    dd: '',
                    parents: [
                        {
                            id: '01FP8RP5PNFQNYD36NT1K3FWVT',
                            name: 'Иванова (Петренко) Ирина Николевна',
                            sex: 'f',
                            bd: '20.04.1912',
                            dd: '05.04.1972',
                            parents: [
                                {

                                },
                                {

                                }
                            ],
                            children: [],
                            folks: [],
                            marriage: [],
                        },
                        {
                            id: '01FP8RPTFERKKXW0HTWHNH1MSE',
                            name: 'Иванов Семен Петрович',
                            sex: 'm',
                            bd: '02.02.1909',
                            dd: '11.07.1971',
                            parents: [
                                {

                                },
                                {

                                }
                            ],
                            children: [],
                            folks: [],
                            marriage: [],
                        }
                    ],
                    folks: [],
                    marriage: [
                        {
                            id: '01FP8VP9HHS8QS19QD7YARFMWX',
                            name: 'Иванова (Арбузова) Наталья Владимировна',
                            sex: 'f',
                            bd: '24.09.1962',
                            dd: '',
                            parents: [
                                {

                                },
                                {

                                }
                            ],
                            children: [
                                {
                                    id: '01FP8VEQQFEDHQDKYCXV45965K',
                                    name: 'Иванова Анна Сергеевна',
                                    sex: 'f',
                                    bd: '10.07.1980',
                                    dd: '',
                                    parents: [
                                        {
        
                                        },
                                        {
        
                                        }
                                    ],
                                    children: [],
                                    folks: [],
                                    marriage: [],
                                },
                                {
                                    id: '01FP8VF7GYWRE868X128Q4W52V',
                                    name: 'Иванов Николай Сергеевич',
                                    sex: 'm',
                                    bd: '22.12.1982',
                                    dd: '',
                                    parents: [
                                        {
        
                                        },
                                        {
        
                                        }
                                    ],
                                    children: [],
                                    folks: [],
                                    marriage: [],
                                }
                            ],
                        }
                    ],
                }
            }
        }
    }
});

customElements.define('li-family-tree-box', class LiFamilyTreeBox extends LiElement {
    static get styles() {
        return css`
            :host {
                box-sizing: border-box;
                margin: 20px;
            }
            .box {
                border: 1px solid lightgray;
                border-radius: 8px;
                width: 300px;
                height: 120px;
                cursor: pointer;
                box-sizing: border-box;
                display: flex;
            }
            .box:hover {
                border: 1px solid orange;
            }
            .btn:hover {
                -webkit-text-stroke-color: orange;
            }
        `;
    }

    render() {
        return html`
            <div class="box" @pointerdown=${this._down} @wheel=${this._wheel}
                    style="transform: translate(${this._translateX}px, ${this._translateY}px); background-color: ${this.persona.sex === 'm' ? '#EFFAFE' : this.persona.sex === 'f' ? '#FEF6F9' : ''}">
                <div style="border: 1px solid lightgray; width: 80px; height: 110px; margin: 4px; box-sizing: border-box;">
                    ${this.persona.sex === 'm' || this.persona.sex === 'f' ? html`  
                        <img style="width: 78px;height:108px; opacity: .5" src=${this.persona.sex === 'm' ? './_man.jpg' : this.persona.sex === 'f' ? './_woman.jpg' : ''}>
                    ` : html``}  
                </div>
                <div style="display: flex; flex-direction: column; flex: 1;">
                    <label style="padding: 4px;">${this.persona.name}</label>
                    <div style="flex: 1"></div>
                    <label style="padding: 4px; font-size: 10px;">${this.persona.bd}${this.persona.dd ? ' - ' : ''}${this.persona.dd}</label>
                </div>
                <div style="display: flex; flex-direction: column; padding: 4px 2px;">
                    <li-button class="btn" name="add" border="none" size="16" fill="lightgray"></li-button>
                    <div style="flex: 1"></div>
                    <li-button class="btn" name="edit" border="none" size="16" fill="lightgray"></li-button>
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            translateX: { type: Number, default: 0, local: true, save: true },
            translateY: { type: Number, default: 0, local: true, save: true },
            scale: { type: Number, default: 1, local: true, save: true },
            level: { type: Number, default: 0 },
            persona: { type: Object, default: {} }
        }
    }
    get _translateX() {
        return this.level * -500 + this.translateX;
    }
    get _translateY() {
        return this.level * 160 + this.translateY;
    }

    _down(e) {
        this._lastX = e.pageX;
        this._lastY = e.pageY;
        document.addEventListener("pointermove", this.__move ||= this._move.bind(this), false);
        document.addEventListener("pointerup", this.__up ||= this._up.bind(this), false);
        document.addEventListener("pointercancel", this.__up ||= this._up.bind(this), false);
    }
    _move(e) {
        this.translateX += e.pageX - this._lastX;
        this.translateY += e.pageY - this._lastY;
        this._lastX = e.pageX;
        this._lastY = e.pageY;
        this.$update();
    }
    _up() {
        document.removeEventListener("pointermove", this.__move, false);
        document.removeEventListener("pointerup", this.__up, false);
        document.removeEventListener("pointercancel", this.__up, false);
    }
    _wheel(e) {
        this.scale += e.deltaY * -0.01;
        this.scale = Math.min(Math.max(.125, this.scale), 4);
    }
});