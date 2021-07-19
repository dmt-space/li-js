import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js';

customElements.define('li-dashboard', class LiDashboard extends LiElement {

    static get styles() {
        return css`
            ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            ::-webkit-scrollbar-track {
                background: lightgray;
            }
            ::-webkit-scrollbar-thumb {
                background-color: gray;
            }
            #app-main {
                display: flex;
                height: calc(100% - 10px);
                margin: 4px 4px 4px 0;
                /* border: 1px solid lightgray; */
                align-items: flex-start;
                flex-wrap: wrap;
            }
            .color{
                border: 1px solid lightgray; 
                width: calc(100% - 6px); 
                height:32px; 
                margin: 2px;
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app hide="r" outside>
                <div slot="app-top" class="header">
                    <div style="flex:1"></div><b>dashboard</b><div style="flex:1"></div>
                </div>
                <div slot="app-left" style="padding-left:4px;display: flex; flex-direction: column;">
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(i => html`
                        <div draggable="true" class="color" style="background: ${`hsla(${i}, 50%, 70%, .7)`}" @dragstart="${(e) => this._start(e, i)}"
                            @dblclick="${e => this._dblclick(e, i)}"></div>
                    `)}
                </div>
                <div slot="app-main" id="app-main" @dragover="${this._over}" @drop="${this._drop}">
                    ${(this.items || []).map(i => html`
                        <li-dashpanel .item="${i}"></li-dashpanel>   
                    `)}
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            items: { type: Array, default: [] },
            focusedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, reflect: true, local: true}
        }
    }

    _start(e, color) {
        //console.log(color)
        this._dragElementColor = color;
    }
    _over(e) {
        //console.log(e)
        e.preventDefault();
        //e.dataTransfer.dropEffect = "move";
    }
    _drop(e) {
        this.items = this.items || [];
        this.items.push({ color: `hsla(${this._dragElementColor}, 50%, 70%, .7)` });
        this.$update();
    }
    _dblclick(e, color) {
        this._dragElementColor = color;
        this._drop();
    }

});

customElements.define('li-dashpanel', class LiDashpanel extends LiElement {

    static get styles() {
        return css`
            :host {
                flex: 1 1 auto;
            }
            ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            ::-webkit-scrollbar-track {
                background: lightgray;
            }
            ::-webkit-scrollbar-thumb {
                background-color: gray;
            }
            .panel {
                border: 1px solid gray;
                min-width: 200px;
                min-height: 100px;
                /* flex: 0 0; */
                margin: 4px;
                height: calc(50% - 10px);
                cursor: pointer;
            }
            .focused {
                border: 4px solid red;
            }
        `;
    }

    render() {
        return html`
            <div class="panel ${!this.readOnly && this.focusedItem === this.item ? 'focused' : ''}" style="background: ${this.item?.color}" @click="${this._click}">

            </div>
        `;
    }

    static get properties() {
        return {
            item: { type: Object, default: undefined },
            focusedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, local: true}
        }
    }

    _click(e) {
        this.focusedItem = this.item;
    }
});
