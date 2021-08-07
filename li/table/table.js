import { LiElement, html, css, styleMap } from '../../li.js';

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
                <div id="main" style="width: ${this.maxWidth}" @mousewheel=${this._wheel}>
                    <div style="border-right: 1px solid lightgray; height: ${this._tableHeight}px">
                        <div style="position: absolute; top: ${this.options?.lazy ? this.lazy?.start * this._rowHeight : 0}">
                            ${this._data.map((row, idx) => html`
                                <li-table-row .row=${row} idx=${idx}></li-table-row>
                            `)}
                        </div>
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
            lazy: { type: Object, default: { step: 100, start: 0, end: 200, max: 200, scroll: 1, ok: false }, local: true },
        }
    }
    get _hasScroll() {
        return this.$id?.table?.clientHeight < this.$id?.table?.scrollHeight;
    }
    get _data() {
        return this.options?.lazy ? this.data?.slice(this.lazy.start, this.lazy.end) || [] : this.data || [];
    }
    get _rowHeight() {
        return this.$refs?.row?.offsetHeight || this.options?.rowHeight || this.options?.rowMinHeight || 32;
    }
    get _tableHeight() {
        return (this.data?.length) * this._rowHeight;
    }

    constructor() {
        super();
        this.__resizeColumns = this._resizeColumns.bind(this);
        this._fn = this._fn || {};
        this._fn._resizeColumns = () => this._resizeColumns();
        this._fn.io = new IntersectionObserver(e => {
            if (this.options?.lazy) {
                if (this.lazy.ok && e[0].intersectionRatio === 0 && this.lazy.scroll > 0 && e[0].target.idx !== 0) {
                    this.lazy.start += this.lazy.step;
                    this.lazy.end = this.lazy.start + this.lazy.max;
                    // console.log(e[0].target);
                    // console.log(this.lazy.start, this.lazy.end, this.lazy.scroll);
                    this.$update();
                    // this.requestUpdate();
                }
                if (this.lazy.ok && e[0].intersectionRatio > 0 && this.lazy.scroll < 0 && e[0].target.idx === 0) {
                    this.lazy.start -= this.lazy.step;
                    this.lazy.end = this.lazy.start + this.lazy.max;
                    if (this.lazy.start < 0) {
                        this.lazy.start = 0;
                        this.lazy.end = this.lazy.max;
                    }
                    // console.log(e[0].target);
                    // console.log(this.lazy.start, this.lazy.end, this.lazy.scroll);
                    this.$update();
                    // this.requestUpdate();
                }
                this.lazy.ok = true;
            }
        })
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
            setTimeout(() => {
                requestAnimationFrame(() => this.$id.table?.setAttribute('ready', true));
            }, 100);

        }
    }

    _resizeColumns() {
        const parentWidth = this.parentElement.offsetWidth - (this._hasScroll ? 7 : 3);
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
    _wheel(e) {
        this.lazy.scroll = e.deltaY < 0 ? -1 : 1;
    }
})

customElements.define('li-table-row', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
            }
        `;
    }
    render() {
        return html`
            ${this.columns?.map(c => html`
                <li-table-cell .item="${this.row[c.name]}" .column="${c}" idx="${this.idx}" color=${this.color}></li-table-cell>
            `)}
        `
    }

    static get properties() {
        return {
            row: { type: Object },
            idx: { type: Number },
            _fn: { type: Object, local: true },
            lazy: { type: Object, local: true },
            options: { type: Object, local: true },
            columns: { type: Object, local: true },
        }
    }
    get _rowHeight() {
        return this.options?.rowHeight || this.options?.rowMinHeight || 32;
    }

    firstUpdated() {
        super.firstUpdated();
        this._observe();
    }
    updated(e) {
        if (e.has('options')) {
            this._observe();
        }
    }

    _observe() {
        if (this.options?.lazy) {
            if ((this.idx + 1) % this.lazy.step === 0 || this.idx === 0) {
                this._fn?.io.observe(this);
                this.color = "blue"
                this.requestUpdate();
            }
        }
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
            :host {
                display: flex;
                flex: 1;
                border-right: 1px solid lightgray;
                border-bottom: 1px solid lightgray;
            }
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
                text-align: center;
            }
        `;
    }
    get styles() {
        return {
            width: this.column?._width - 1 < 0 ? 0 : this.column?._width - 1,
            height: this.options?.rowHeight ? this.options?.rowHeight - 1 + 'px' : 'auto',
            'max-height': this.options?.rowHeight ? this.options?.rowHeight - 1 + 'px' : 'auto',
            'min-height': this.options?.rowMinHeight ? this.options?.rowMinHeight - 1 || 31 + 'px' : '31px',
            'background-color': this.count % 2 ? '#f5f5f5' : 'white',
            color: this.color
        }
    }
    render() {
        return html`
            ${this.column?.isCount ? html`
                <div class="cell" style=${styleMap(this.styles)}>${this.count}</div>
            ` : html`
                <div class="cell" contenteditable="${this.readOnly ? 'false' : 'true'}" style=${styleMap(this.styles)}>${this.item}</div>
            `}
        `
    }

    static get properties() {
        return {
            idx: { type: Number },
            item: { type: Object },
            column: { type: Object },
            options: { type: Object, local: true },
            lazy: { type: Object, local: true },
            color: { type: String },
        }
    }
    get readOnly() {
        return this.item?.readOnly || this.column?.readOnly || this.options?.readOnly;
    }
    get count() {
        return this.lazy?.start + this.idx + 1;
    }
})
