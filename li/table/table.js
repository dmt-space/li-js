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
            }
            .bottom-panel {
                bottom: 0;
            }
            .top-panel>div>.column {
                border-bottom: 1px solid gray;
            }
            .bottom-panel>div>.column {
                border-top: 1px solid gray;
            }
            .column {
                min-height: 32px;
                border-right: 1px solid lightgray;
            }
            #main {
                position: relative;
                display: flex;
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
            .cell:last-child {
                border-right: none;
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
                                <div class="column" style="width: ${i._width - 1 < 0 ? 0 : i._width - 1}">
                                    <li-table-header .column="${i}" type="header"></li-table-header>
                                </div>
                            `)}
                        </div>
                    </div>
                `}
                <div id="main" style="width: ${this.maxWidth}">
                    <div style="border-right: 1px solid lightgray;">
                        ${this.data?.map((i, idx) => html`
                            <div class="row"> ${this.columns?.map(c => html`
                                <div class="cell" style="width: ${c._width - 1 < 0 ? 0 : c._width - 1}">
                                    <li-table-cell .item="${i[c.name]}" .column="${c}" idx="${idx}"></li-table-cell>
                                </div>
                            `)}</div>
                        `)}
                    </div>             
                </div>
                ${this.options?.footerHidden ? html`` : html`
                    <div class="bottom-panel" style="width: ${this.maxWidth};background-color: white">
                        <div style="display: flex; background-color:${this.options?.footerColor || '#eee'}">
                            ${this.columns?.map(i => html`
                                <div class="column" style="width: ${i._width - 1 < 0 ? 0 : i._width - 1}">
                                    <li-table-header .column="${i}" type="footer"></li-table-header>
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
                word-break: break-word;
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
            <div class="label" style="writing-mode: ${this.options?.headerVertical && this.type === 'header' ? 'vertical-lr' : ''}">
                ${this.type === 'header' && (this.column?.label || this.column?.name) || ''}
            </div>
            ${this.disableResize ? html`` : html`
                <div class="point" @click="${this._setAutoWidth}"
                    style="background-color: ${this.column?.width ? 'gray' : 'orange'}"></div>
                <div class="resizer" @pointerdown="${this._pointerdown}"></div>
            `}
        `
    }

    static get properties() {
        return {
            type: { type: String },
            column: { type: Object },
            options: { type: Object, local: true },
            _fn: { type: Object, local: true },
        }
    }
    get disableResize() {
        return this.options?.disableResizeColumns || this.column?.disableResize;
    }

    firstUpdated() {
        super.firstUpdated();
        this.__move = this._move.bind(this);
        this.__up = this._up.bind(this);
    }

    _setAutoWidth(e) {
        this.column.width = undefined;
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
        this.column.left += movX;
        this.column._width += movX;
        this.column._width = this.column._width < 24 ? 24 : this.column._width;
        this.column.width = this.column._width;
        this._fn._resizeColumns();
        this._lastX = e.pageX;
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
            .cell {
                position: relative;
                display: flex;
                flex: 1;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                overflow: hidden;
                word-break: break-word;
                outline: none;
                text-align:center;
            }
        `;
    }
    render() {
        return html`
            <div style="background-color: ${this.idx%2 ? '#f5f5f5' : 'white'}">
                ${this.column?.isCount ? html`
                    <div class="cell" >${this.idx + 1}</div>
                ` : html`
                    <div class="cell" contenteditable="${this.readOnly ? 'false' : 'true'}">${this.item}</div>
                `}
            </div>
        `
    }

    static get properties() {
        return {
            idx: { type: Number },
            item: { type: Object },
            column: { type: Object },
            options: { type: Object, local: true },
        }
    }
    get readOnly() {
        return this.item?.readOnly || this.column?.readOnly || this.options?.readOnly;
    }
})
