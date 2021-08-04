import { LiElement, html, css } from '../../li.js';

customElements.define('li-table', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; border-left: 1px solid gray;}
            ::-webkit-scrollbar-track { background-color: #eee;}
            ::-webkit-scrollbar-thumb { background-color: #aaa;  border-radius: 2px; }
            #table {
                position: relative;
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: auto;
                border: 1px solid gray;
                opacity: 0;
                transition: opacity .5s linear;
            }
            #table[ready] {
                opacity: 1;
            }
            .top-panel, .bottom-panel {
                position: sticky;
                display: flex;
                z-index: 1;
            }
            .top-panel {
                top: 0;
                border-bottom: 1px solid gray;
            }
            .bottom-panel {
                bottom: 0;
                border-top: 1px solid gray;
            }
            .column {
                min-height: 32px;
                border-right: 1px solid lightgray;
            }
            .main-panel {
                position: relative;
                flex: 1;
            }
            .row {
                position: relative;
                display: flex;
                min-height: 32px;
            }
            .cell {
                border-right: 1px solid lightgray;
                border-bottom: 1px solid lightgray;
            }
        `;
    }

    render() {
        return html`
            <div id="table">
                ${this.options?.headerHidden ? html`` : html`
                    <div class="top-panel" style="width: ${this.maxWidth}; background-color: white">
                        <div style="display: flex; background-color: ${this.options?.headerColor || '#eee'}">
                            ${this.columns?.map((i, idx) => html`
                                <div class="column" style="width: ${i._width - 1}">
                                    <li-table-header .item="${i}" type="header"></li-table-header>
                                </div>
                            `)}
                        </div>
                    </div>
                `}
                <div id="main" class="main-panel" style="width: ${this.maxWidth}">
                    ${this.data?.map(i => html`
                        <div class="row" style="width: ${this.maxWidth}"> ${this.columns?.map(c => html`
                            <div class="cell" style="width: ${c._width - 1}">
                                <li-table-cell .item="${i[c.name]}" .column="${c}"></li-table-cell>
                            </div>
                        `)}</div>
                    `)}
                </div>
                ${this.options?.footerHidden ? html`` : html`
                    <div class="bottom-panel" style="width: ${this.maxWidth};background-color: white">
                        <div style="display: flex; background-color:${this.options?.footerColor || '#eee'}">
                            ${this.columns?.map(i => html`
                                <div class="column" style="width: ${i._width - 1}">
                                    <li-table-header type="footer"></li-table-header>
                                </div>
                            `)}
                        </div>
                    </div>
                `}
            </div>
        `
    }

    static get properties() {
        return {
            $partid: { type: String },
            options: { type: Object, local: true },
            columns: { type: Array, local: true },
            data: { type: Array, local: true },
            maxWidth: { type: Number, local: true },
            _fn: { type: Object, local: true },
        }
    }
    get _hasScroll() {
        return this.$id?.table?.clientHeight < this.$id?.table?.scrollHeight;
    }

    constructor() {
        super();
        this.__resizeColumns = this._resizeColumns.bind(this);
        this._fn = this._fn || {};
        this._fn._resizeColumns = () => this._resizeColumns();
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.__resizeColumns);
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.__resizeColumns);
        super.disconnectedCallback();
    }
    updated(e) {
        if (e.has('columns')) {
            this._resizeColumns();
            this.$id.table?.setAttribute('ready', true);
        }
    }

    _resizeColumns() {
        const parentWidth = this.parentElement.offsetWidth - (this._hasScroll ? 6 : 2);
        this.maxWidth = this.options?.width || parentWidth;
        let length = this.columns.length,
            left = 0;
        this.columns.forEach(i => {
            if (i.width) {
                length--;
                left += i.width;
            }
        })
        let width = (this.maxWidth - left) / length;
        left = 0;
        this.columns.map((i, idx) => {
            i.idx = idx;
            i._width = i.width || width;
            left = i.left = left + i._width;
        })
        this.$update();
    }
})

customElements.define('li-table-header', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex: 1;
                justify-content: center;
                align-items: center;
                height: 100%;
                overflow: hidden;
            }
            .label {
                padding: 4px;
            }
            .point {
                position: absolute;
                top: 0;
                left: 0;
                height: 8px;
                width: 8px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 3;
                opacity: 0;
            }
            .point:hover {
                opacity: 1;
            }
            .resizer {
                position: absolute;
                right: 0;
                height: 100%;
                border: 4px solid transparent;
                cursor: col-resize;
                z-index: 2;
            }
        `;
    }

    render() {
        return html`
            <div class="label" style="writing-mode: ${this.options?.headerVertical && this.type === 'header' ? 'vertical-lr' : ''}">${this.item?.label || this.item?.name}</div>
            <div class="point" @click="${this._setAutoWidth}"
                style="background-color: ${this.item?.width ? 'gray' : 'orange'}"></div>
            <div class="resizer" @pointerdown="${this._pointerdown}"></div>
        `
    }

    static get properties() {
        return {
            type: { type: String },
            item: { type: Object },
            options: { type: Object, local: true },
            columns: { type: Array, local: true },
            data: { type: Array, local: true },
            maxWidth: { type: Number, local: true },
            _fn: { type: Object, local: true },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.__move = this._move.bind(this);
        this.__up = this._up.bind(this);
    }

    _setAutoWidth(e) {
        this.item.width = undefined;
        this._fn._resizeColumns();
    }
    _pointerdown(e) {
        e.stopPropagation();
        e.preventDefault();
        this._resize = true;
        this._lastX = e.pageX;
        document.documentElement.addEventListener("pointermove", this.__move, false);
        document.documentElement.addEventListener("pointerup", this.__up, false);
        document.documentElement.addEventListener("pointercancel", this.__up, false);
    }
    _move(e) {
        const movX = e.pageX - this._lastX;
        this.item.left += movX;
        this.item._width += movX;
        this.item._width = this.item._width < 24 ? 24 : this.item._width;
        this.item.width = this.item._width;
        this._fn._resizeColumns();
        let _reset = false;
        let w = 0;
        this.columns.forEach(i => {
            w += i._width;
            if (i.left > this.maxWidth || i._width < 24) _reset = true;
        })
        if (w > this.maxWidth || _reset) {
            this.item.left -= movX;
            this.item._width -= movX;
            this.item.width = this.item._width;
            this._fn._resizeColumns();
        } else {
            this._lastX = e.pageX;
        }
    }
    _up() {
        this._resize = false;
        document.documentElement.removeEventListener("pointermove", this.__move, false);
        document.documentElement.removeEventListener("pointerup", this.__up, false);
        document.documentElement.removeEventListener("pointercancel", this.__up, false);
        this.$update();
    }

})

customElements.define('li-table-cell', class extends LiElement {

    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex: 1;
                justify-content: center;
                align-items: center;
                height: 100%;
                overflow: hidden;
            }            
        `;
    }

    render() {
        return html`
            <div class="cell">${this.item || ''}</div>
        `
    }

    static get properties() {
        return {
            column: { type: Object },
            item: { type: Object },
            options: { type: Object, local: true },
            columns: { type: Array, local: true },
            data: { type: Array, local: true },
            maxWidth: { type: Number, local: true },
            _fn: { type: Object, local: true },
        }
    }

})
