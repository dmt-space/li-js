import { LiElement, html, css, unsafeCSS } from '../../li.js';

import '../layout-app/layout-app.js';
import '../button/button.js';
import '../icon/icon.js';

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
            .app-main {
                display: block;
                position: relative;
                width: 100%;
                height: 100%;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app hide="r" outside @mouseup="${e => this.action = ''}" @click="${e => this.focusedItem = undefined}">
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>dashboard<div style="flex:1"></div>
                </div>
                <div slot="app-left" style="padding-left:4px;display: flex; flex-direction: column;">
                    ${[0, 45, 90, 135, 180, 225, 270, 315].map(i => html`
                        <div draggable="true" class="color" style="background: ${`hsla(${i}, 50%, 70%, .7)`}" @dragstart="${(e) => this._start(e, i)}"
                            @dblclick="${e => this._dblclick(e, i)}"></div>
                    `)}
                </div>
                <div slot="app-main" class="app-main" @drop="${this._drop}" @dragover="${this._over}">
                    ${(this.item?.items || []).map(i => html`
                        <li-dashpanel .item="${i}"></li-dashpanel>
                    `)}
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            item: { type: Object, default: {} },
            action: { type: String, default: '', local: true },
            focusedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, reflect: true, default: false, local: true }
        }
    }

    _start(e, color) {
        this._dragElementColor = color;
    }
    _over(e) {
        e.preventDefault();
    }
    _drop(e) {
        this.item.items = this.item.items || [];
        this.item.items.push({ color: `hsla(${this._dragElementColor}, 50%, 70%, .7)`, left: 10, top: 10, w: 200, h: 100 });
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
                cursor: pointer;
                z-index: 0;
            }
            .focused {
                box-shadow: 0 0 10px 2px gray;
                z-index: 1;
            }
            .marker {
                position: absolute;
                border-color: red;
                opacity: .8;
                z-index: 2;
                cursor: move;
            }
            #tl {
                top: -8;
                left: -8;
            }
            #tr {
                top: -8;
                right: -8;
            }
            #br {
                bottom: -8;
                right: -8;
            }
            #bl {
                bottom: -8;
                left: -8;
            }
        `;
    }

    render() {
        return html`
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; pointer-events: ${this.action ? 'auto' : 'none'}" 
                    ?hidden="${this.readOnly || this.focusedItem !== this.item || !this.action}"
                    @mousemove="${this._move}" @mouseup="${this._up}">
            </div>
            <div class="panel ${!this.readOnly && this.focusedItem === this.item ? 'focused' : ''}" 
                    style="
                        position: absolute;
                        background: ${this.item?.color};
                        left: ${this.item?.left || 0 + 'px'};
                        top: ${this.item?.top || 0 + 'px'};
                        width: ${this.item?.w || 200 + 'px'};
                        height: ${this.item?.h || 100 + 'px'};
                    " 
                    @click="${this._click}"
                    @mousedown="${this._down}"
                    @mousemove="${this._move}"
                    @mouseup="${this._up}"
                    @dragstart="${this._start}">
                ${!this.readOnly && this.focusedItem === this.item && !this.action ? html`
                    <li-icon id="tl" class="marker" name="swap-horiz" rotate="45" size="16" @mousedown="${this._markerDown}"></li-icon>
                    <li-icon id="tr" class="marker" name="swap-horiz" rotate="-45" size="16" @mousedown="${this._markerDown}"></li-icon>
                    <li-icon id="br" class="marker" name="swap-horiz" rotate="45" size="16" @mousedown="${this._markerDown}"></li-icon>
                    <li-icon id="bl" class="marker" name="swap-horiz" rotate="-45" size="16" @mousedown="${this._markerDown}"></li-icon>
                ` : html``}
            </div>

        `;
    }

    static get properties() {
        return {
            item: { type: Object },
            action: { type: String, default: '', local: true },
            focusedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, local: true }
        }
    }
    _start() {
        this.focusedItem = this.item;
    }
    _click(e) {
        e.stopPropagation();
        this.focusedItem = this.item;
    }
    _move(e) {
        if (this.readOnly || this.focusedItem !== this.item) return;
        if (this.action === 'mouseMove') {
            this.item.left += e.movementX;
            this.item.top += e.movementY;
            this.$update();
        }
        if (this.action === 'markerMove') {
            if (this._actionId === 'br') {
                this.item.w += e.movementX;
                this.item.h += e.movementY;
            } else if (this._actionId === 'bl') {
                this.item.w -= e.movementX;
                this.item.h += e.movementY;
                this.item.left += e.movementX;
            } else if (this._actionId === 'tl') {
                this.item.w -= e.movementX;
                this.item.h -= e.movementY;
                this.item.left += e.movementX;
                this.item.top += e.movementY;
            } else if (this._actionId === 'tr') {
                this.item.w += e.movementX;
                this.item.h -= e.movementY;
                this.item.top += e.movementY;
            }
            this.$update();
        }
    }
    _down(e) {
        if (this.readOnly) return;
        this.focusedItem = this.item;
        this.action = 'mouseMove';
    }
    _up(e) {
        if (this.readOnly) return;
        this.action = '';
        this.item.left = Math.round(this.item.left / 5) * 5;
        this.item.top = Math.round(this.item.top / 5) * 5;
        this.item.w = Math.round(this.item.w / 5) * 5;
        this.item.h = Math.round(this.item.h / 5) * 5;
        this.item.left = this.item.left < 0 ? 0 : this.item.left;
        this.item.top = this.item.top < 0 ? 0 : this.item.top;
        this.item.w = this.item.w < 10 ? 10 : this.item.w;
        this.item.h = this.item.h < 10 ? 10 : this.item.h;
        this.$update();
    }
    _markerDown(e) {
        if (this.readOnly) return;
        e.stopPropagation();
        this.focusedItem = this.item;
        this.action = 'markerMove';
        this._actionId = e.target.id;
    }
});
