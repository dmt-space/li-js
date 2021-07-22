import { LiElement, html, css, unsafeCSS } from '../../li.js';

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
                z-index: 0;
            }
            .focused {
                box-shadow: 0 0 10px 2px gray;
                z-index: 1;
            }
            .marker {
                position: absolute;
                opacity: 0;
                z-index: 2;
            }
            .marker:hover {
                opacity: .8;
            }
            #tl { top: 0; left: 0; cursor: pointer; }
            #tr { top: 0; right: 0; cursor: pointer; }
            #br { bottom: 0; right: 0; cursor: pointer; }
            #bl { bottom: 0; left: 0; cursor: pointer; }
            #btns {
                cursor: pointer;
                display: flex;
                opacity: 0.1;
            }
            #btns:hover {
                opacity: .8;
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
                            width: 98px; height: 22px; margin: 1px;
                        ` : `
                            position: absolute;
                            left: ${this.item?.left || 0 + 'px'};
                            top: ${this.item?.top || 0 + 'px'};
                            width: ${this.item?.w || 200 + 'px'};
                            height: ${this.item?.h || 100 + 'px'};
                        `}
                    "
                    @click="${e => e.stopPropagation()}">
                ${!this.readOnly && !this.action && !this.expanded && !this.item?.collapsed ? html`
                    <li-icon id="tl" class="marker" name="swap-horiz" rotate="45" size="16" @mousedown="${e => this._down(e, 'resize')}"></li-icon>
                    <li-icon id="tr" class="marker" name="swap-horiz" rotate="-45" size="16" @mousedown="${e => this._down(e, 'resize')}"></li-icon>
                    <li-icon id="br" class="marker" name="swap-horiz" rotate="45" size="16" @mousedown="${e => this._down(e, 'resize')}"></li-icon>
                    <li-icon id="bl" class="marker" name="swap-horiz" rotate="-45" size="16" @mousedown="${e => this._down(e, 'resize')}"></li-icon>
                ` : html``}
                <div id="btns">       
                    <div style="flex: 1" @mousedown="${e => this._down(e, 'move')}"></div>
                    <li-icon name="fullscreen-exit" size="20" @click="${this._collapsed}"></li-icon>
                    <li-icon name="fullscreen" size="20" @click="${this._expanded}"></li-icon>
                    <li-icon name="close" size="20" @click="${() => this.fire('close', this.item)}" style="margin-right: 12px;"></li-icon>
                </div>
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
        document.documentElement.addEventListener("mousemove", this.__move, false);
        document.documentElement.addEventListener("mouseup", this.__up, false);
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
                br: () => { w = w + x < 98 ? 98 : w + x; h = h + y < 22 ? 22 : h + y; },
                bl: () => { w = w - x < 98 ? 98 : w - x; h = h + y < 22 ? 22 : h + y; l += x; },
                tl: () => { w = w - x < 98 ? 98 : w - x; h = h - y < 22 ? 22 : h - y; l += x; t += y; },
                tr: () => { w = w + x < 98 ? 98 : w + x; h = h - y < 22 ? 22 : h - y; t += y; }
            }
            move[this._actionId]();
            this.item.w = w; this.item.h = h; this.item.left = l; this.item.top = t;
            this.$update();
        }
    }
    _up() {
        document.documentElement.removeEventListener("mousemove", this.__move, false);
        document.documentElement.removeEventListener("mouseup", this.__up, false);
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
