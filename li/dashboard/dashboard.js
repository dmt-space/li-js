import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../icon/icon.js';

customElements.define('li-dashboard', class LiDashboard extends LiElement {

    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
        `;
    }

    render() {
        return html`
            <li-dashpanel .item="${this.expandedItem}" ?hidden="${!this.expandedItem}"></li-dashpanel>
            <div ?hidden="${this.expandedItem}">
                ${(this.item?.items || []).map(i => html`<li-dashpanel .item="${i}" ?hidden="${i.collapsed}"></li-dashpanel>`)}
                <div style="position: absolute; left: 0; bottom: 0; display: flex; flex-wrap: wrap;">
                    ${(this.item?.items || []).filter(i => i.collapsed).map(i => html`<li-dashpanel .item="${i}"></li-dashpanel>`)}
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            item: { type: Object, default: {} },
            action: { type: String, default: '', local: true },
            focusedItem: { type: Object, default: undefined, local: true },
            expandedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, reflect: true, default: false, local: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('close', (e) => {
            this.item.items.splice(this.item.items.indexOf(e.detail), 1);
            this.focusedItem = undefined;
            this.expandedItem = undefined;
            this.$update();
        })
    }
})

customElements.define('li-dashpanel', class LiDashpanel extends LiElement {

    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
            .panel {
                border: 1px solid gray;
                cursor: pointer;
                z-index: 0;
                touch-action: none
            }
            .focused {
                box-shadow: 0 0 10px 2px gray;
                z-index: 1;
            }
            .resize {
                position: absolute;
                z-index: 2;
            }
            #tl { height: 5px; width: 5px; top: 0; left: 0; cursor: nwse-resize }
            #t { height: 5px; top: 0; left: 5; right: 5; cursor: ns-resize }
            #tr { height: 5px; width: 5px; top: 0; right: 0; cursor: nesw-resize }
            #l { width: 5px; top: 5; left: 0; bottom: 5; cursor: ew-resize }
            #r { width: 5px; top: 5; right: 0; bottom: 5; cursor: ew-resize }
            #br { height: 5px; width: 5px; bottom: 0; right: 0; cursor: nwse-resize }
            #b { height: 5px; bottom: 0; left: 5; right: 5; cursor: ns-resize }
            #bl { height: 5px; width: 5px; bottom: 0; left: 0; cursor: nesw-resize }
            #btns {
                position: absolute;
                display: flex;
                flex-direction: row-reverse;
                top: 2;
                right: 2;
            }
            .btn {
                z-index: 1;
                opacity: 0.1;
                cursor: pointer;
            }
            .btn:hover {
                color: white;
                background-color: gray;
                opacity: .8;
                z-index: 1;
            }
            .main {
                position: absolute;
                display: flex;
                flex-direction: column;
                top: 5;
                bottom: 5;
                left: 5;
                right: 5;
            }
        `;
    }

    render() {
        return html`
            <div class="panel ${!this.expanded && !this.item?.collapsed && this.focusedItem === this.item ? 'focused' : ''}" ?hidden="${!this.ready}"
                    style="
                        background: ${this.item?.color};
                        ${this.expanded ? `
                            position: absolute; left: 0; top: 0; right: 0; bottom : 0; overflow: hidden;
                        ` : this.item?.collapsed ? `
                            position: relative; width: 100px; height: 25px; margin: 1px;
                        ` : `
                            position: absolute;
                            left: ${this.item?.left || 0 + 'px'};
                            top: ${this.item?.top || 0 + 'px'};
                            width: ${this.item?.w || 200 + 'px'};
                            height: ${this.item?.h || 100 + 'px'};
                        `}
                    "
                    @click="${e => e.stopPropagation()}"
                    @pointerdown="${e => this._down(e, 'move')}">
                <div ?hidden="${this.readOnly || this.expanded || this.item?.collapsed}" @pointerdown="${e => e.stopPropagation()}">
                    <div id="tl" class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="t"  class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="tr" class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="l"  class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="r"  class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="br" class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="b"  class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                    <div id="bl" class="resize" @pointerdown="${e => this._down(e, 'resize')}"></div>
                </div>
                <div id="btns">   
                    <li-icon class="btn" name="close" size="20" @click="${() => this.fire('close', this.item)}"></li-icon>    
                    <li-icon class="btn"  name="fullscreen" size="20" @click="${this._expanded}"></li-icon>
                    <li-icon class="btn"  name="fullscreen-exit" size="20" @click="${this._collapsed}"></li-icon>
                </div>
                <div class="main" slot="dash-main" ?hidden="${this.item?.collapsed}"></div>
            </div>

        `;
    }

    static get properties() {
        return {
            item: { type: Object },
            action: { type: String, default: '', local: true },
            focusedItem: { type: Object, default: undefined, local: true },
            expandedItem: { type: Object, default: undefined, local: true },
            readOnly: { type: Boolean, local: true },
            ready: { type: Boolean, reflect: true }
        }
    }
    get expanded() {
        return this.expandedItem === this.item;
    }

    firstUpdated() {
        super.firstUpdated();
        this.__move = this._move.bind(this);
        this.__up = this._up.bind(this);
        this._setReady();
    }
    _setReady() {
        setTimeout(() => {
            this.ready = true;
            this.$update();
        }, 100);
    }

    _down(e, action) {
        if (this.readOnly || this.expanded) {
            this.focusedItem = undefined;
            return;
        }
        this.focusedItem = this.item;
        this.action = action;
        this._actionId = e.target.id;
        document.documentElement.addEventListener("pointermove", this.__move, false);
        document.documentElement.addEventListener("pointerup", this.__up, false);
    }
    _move(e) {
        if (this.readOnly || this.focusedItem !== this.item) return;
        if (this.action === 'move') {
            this.item.left += e.movementX;
            this.item.top += e.movementY;
            this.$update();
        }
        if (this.action === 'resize') {
            let x = e.movementX, y = e.movementY, w = this.item.w, h = this.item.h, l = this.item.left, t = this.item.top;
            const move = {
                tl: () => { w = w - x < 100 ? 100 : w - x; h = h - y < 25 ? 25 : h - y; l += x; t += y; },
                t: () => { h = h - y < 25 ? 25 : h - y; t += y; },
                tr: () => { w = w + x < 100 ? 100 : w + x; h = h - y < 25 ? 25 : h - y; t += y; },
                l: () => { w = w - x < 100 ? 100 : w - x; l += x; },
                r: () => { w = w + x < 100 ? 100 : w + x; },
                bl: () => { w = w - x < 100 ? 100 : w - x; h = h + y < 25 ? 25 : h + y; l += x; },
                b: () => { h = h + y < 25 ? 25 : h + y; },
                br: () => { w = w + x < 100 ? 100 : w + x; h = h + y < 25 ? 25 : h + y; },
            }
            move[this._actionId]();
            this.item.w = w; this.item.h = h; this.item.left = l; this.item.top = t;
            this.$update();
        }
    }
    _up() {
        document.documentElement.removeEventListener("pointermove", this.__move, false);
        document.documentElement.removeEventListener("pointerup", this.__up, false);
        if (this.readOnly || !this.action) return;
        this.action = '';
        this.item.left = Math.round(this.item.left / 5) * 5;
        this.item.top = Math.round(this.item.top / 5) * 5;
        this.item.w = Math.round(this.item.w / 5) * 5;
        this.item.h = Math.round(this.item.h / 5) * 5;
        this.item.left = this.item.left < 0 ? 0 : this.item.left;
        this.item.top = this.item.top < 0 ? 0 : this.item.top;
        this.$update();
    }
    _expanded(e) {
        e.stopPropagation();
        this.ready = false;
        this.expandedItem = this.expanded ? null : this.item;
        this.focusedItem = undefined;
        this._setReady();
    }
    _collapsed() {
        this.ready = false;
        this.expandedItem = undefined
        this.focusedItem = undefined;
        this.item.collapsed = !this.item.collapsed
        this._setReady();
    }
})
