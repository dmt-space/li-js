import { LiElement, html, css, unsafeCSS } from '../../li.js';

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
            .color{
                border: 1px solid lightgray; 
                width: (100% - 6px); 
                height: 32px; 
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
                <li-dashpanel slot="app-main" .item="${this.item}"></li-dashpanel>   
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            item: {
                type: Object,
                default: {
                    vertical: false,
                    items: [
                        { color: `hsla(0, 50%, 70%, .7)`, w: '400px', h: '99%' },
                        {
                            vertical: true,
                            items: [
                                { color: `hsla(45, 50%, 70%, .7)`, h: '400px' },
                                {
                                    vertical: false,
                                    items: [
                                        { color: `hsla(90, 50%, 70%, .7)` },
                                        {
                                            vertical: true,
                                            items: [
                                                { color: `hsla(135, 50%, 70%, .7)` },
                                                {
                                                    vertical: true,
                                                    items: [
                                                        { color: `hsla(180, 50%, 70%, .7)` },
                                                        {
                                                            vertical: false,
                                                            items: [
                                                                { color: `hsla(225, 50%, 70%, .7)` },
                                                                {
                                                                    vertical: false,
                                                                    items: [
                                                                        { color: `hsla(270, 50%, 70%, .7)` },
                                                                        {
                                                                            vertical: true,
                                                                            items: [
                                                                                { color: `hsla(315, 50%, 70%, .7)` },
                                                                                { color: `hsla(360, 50%, 70%, .7)` }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            focusedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, reflect: true }
        }
    }

    _start(e, color) {
        //console.log(color)
        //this._dragElementColor = color;
    }
    _over(e) {
        //console.log(e)
        //e.preventDefault();
        //e.dataTransfer.dropEffect = "move";
    }
    _drop(e) {
        // if (!this.item?.[0])
        // this.item = [{ color: `hsla(${this._dragElementColor}, 50%, 70%, .7)` }];
        // this.$update();
    }
    _dblclick(e, color) {
        // this._dragElementColor = color;
        // this._drop();
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
                flex: 1 1 auto;
                margin: 4px;
                /* height: (100% - 10px); */
                cursor: pointer;
            }
            .focused {
                border: 4px solid red;
            }
        `;
    }

    render() {
        return html`
            ${!this.item?.items?.[0] ? html`` : html`
                <div style="display: flex; flex-direction: ${this.item.vertical ? 'column' : 'row'}; width: 100%; height: 100%; flex-wrap: wrap; min-width: 200px"  @drop="${this._drop}" @dragover="${this._over}"
                        @dragstart="${this._start}">
                    <div class="panel ${!this.readOnly && this.focusedItem === this.item.items[0] ? 'focused' : ''}" style="
                        width: ${this.item.items[0].w || ''}; 
                        height: ${this.item.items[0].h || ''}; 
                        background: ${this.item.items[0].color}" @click="${this._click}"></div>
                    ${!this.item.items[1] ? html`` : html`
                        ${this.item.items[1].items?.length ? html`
                            <li-dashpanel .item=${this.item.items[1]}></li-dashpanel>
                        ` : html`
                            <div class="panel ${!this.readOnly && this.focusedItem === this.item.items[1] ? 'focused' : ''}" style="
                            width: ${this.item.items[0].w || ''}; 
                            height: ${this.item.items[0].h || ''}; 
                            background: ${this.item.items[1].color}" @click="${this._click}"></div>
                        `}
                    `}
                </div>
            `}
        `;
    }

    static get properties() {
        return {
            item: { type: Object },
            focusedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, local: false }
        }
    }

    _click(e) {
        this.focusedItem = this.item;
    }

    _start(e) {
        //console.log(color)
        this._dragElementColor = e.target.color;
    }
    _over(e) {
        //console.log(e)
        e.preventDefault();
        //e.dataTransfer.dropEffect = "move";
    }
    _drop(e) {
        // console.log(e)
        this.item.items[1] = { color: `hsla(45, 50%, 70%, .7)` };
        this.$update();
    }
});
