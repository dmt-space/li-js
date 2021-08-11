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
                flex: 1;
                height: 100%;
                width: 100%;
                border: 1px solid gray;
                overflow: hidden;
                opacity: 0;
                transition: opacity .5s linear;
                box-sizing: border-box;
            }
            #table[ready] {
                opacity: 1;
            }
            #container {
                overflow: auto; 
                display: flex; 
                flex: 1;
                box-sizing: border-box;
            }
            #main {
                position: relative;
                display: flex;
                flex-direction: column;
                height: 100%;
                flex: 1;
                box-sizing: border-box;
            }
        `;
    }
    render() {
        return html`
            <div id="table">
                <li-table-header-row class="panel top" type="top"></li-table-header-row>
                ${this.options?.headerHidden ? html`` : html`<div style="border-top:1px solid gray; height: 1px;"></div>`}
                <div id="container" @scroll=${this._scroll}>
                    <div id="main" style="width: ${this.maxWidth}">
                        <div style="position: absolute; top: ${this.options?.lazy ? this._shift * this._rowHeight : 0}px">
                            ${this._data.map((row, idx) => html`<li-table-row .row=${row} idx=${idx}></li-table-row>`)}
                        </div>           
                    </div>
                    <div style="border:1px solid transparent; height: ${this._tableHeight}px;"></div>
                </div>
                ${this.options?.footerHidden ? html`` : html`<div style="border-bottom:1px solid gray; height: 1px;"></div>`}
                <li-table-header-row class="panel bottom" type="bottom"></li-table-header-row>
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
            lazy: { type: Object, default: { step: 40, start: 0, end: 80, max: 80, scroll: 1, ok: false }, local: true },
            ready: { type: Boolean },
            left: { type: Number, local: true },
            _start: { type: Number }
        }
    }
    get _hasScroll() {
        return this.$id?.main?.scrollHeight;
    }
    get _data() {
        let end = this.lazy.end,
            start = this._start;
        if (!this._outSide && this.lazy.scroll < 0) {
            end = this._start + this.lazy.max;
            start = this._start - this.lazy.step;
        }
        return this.options?.lazy ? this.data?.slice(start, end) || [] : this.data || [];
    }
    get _shift() {
        if (this._outSide) return this.lazy?.start;
        return this.lazy?.scroll < 0 ? this.lazy?.start - this.lazy?.step : this.lazy?.start;
    }
    get _rowHeight() {
        return this.$refs?.row?.offsetHeight || this.options?.rowHeight || this.options?.rowMinHeight || 32;
    }
    get _tableHeight() {
        return (this.data?.length) * this._rowHeight + 1;
    }
    get _left() {
        return this.$id?.container?.scrollLeft || 0;
    }
    get _rowCount() {
        return Math.round(this.$id?.main?.offsetHeight / this._rowHeight || 0);
    }
    get _outSide() {
        this._scrollTop = this._scrollTop || 0;
        return this._scrollTop < this.lazy?.step || this._scrollTop >= this.data?.length - this._rowCount;
    }

    constructor() {
        super();
        this._fn = this._fn || {};
        this._fn._resizeColumns = () => this._resizeColumns();
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.__resizeColumns = this.__resizeColumns || this._resizeColumns.bind(this));
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.__resizeColumns);
        super.disconnectedCallback();
    }
    updated(e) {
        if (e.has('columns')) {
            this._resizeColumns();
            setTimeout(() => {
                this._resizeColumns();
                requestAnimationFrame(() => {
                    this.$id.table?.setAttribute('ready', true);
                    this.ready = true;
                });
            }, 100);
        }
    }

    _resizeColumns() {
        this.left = this._left;
        this.maxWidth = this.options?.width || this.parentElement.offsetWidth - (this._hasScroll ? 7 : 2);
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
    _scroll(e) {
        if (this._lastLeft !== e.target.scrollLeft) {
            this.left = this._left;
            this._lastLeft = e.target.scrollLeft;
            requestAnimationFrame(() => this.$update());
        } else if (this.options?.lazy) {
            this.lazy.scroll = e.target.scrollTop - this._lastTop;
            this._lastTop = e.target.scrollTop;
            this._scrollTop = Math.round(e.target.scrollTop / this._rowHeight);
            this._refreshData();
        }
    }
    _refreshData() {
        if (this._scrollTop < this.lazy.step && this.lazy.start !== 0) {
            this._start = this.lazy.start = 0;
            this.lazy.end = this.lazy.start + this.lazy.max;
            this.$update();
        } else if (this._scrollTop >= this.data.length - this._rowCount) {
            this._start = this.lazy.start = this.data.length - this._rowCount;
            this.lazy.end = this.lazy.start + this.lazy.max;
            this.$update();
        } else if (this._scrollTop > this.lazy.start + this.lazy.step && this.lazy.scroll > 0 ||
            this.lazy.start > this.lazy.step && this._scrollTop < this.lazy.start + this.lazy.step && this.lazy.scroll < 0) {

            this._start = this.lazy.start = this._scrollTop - 1;
            this.lazy.end = this.lazy.start + this.lazy.max;
            this.$update();
        }
    }
})

customElements.define('li-table-row', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                border-bottom: 1px solid lightgray;
                box-sizing: border-box;
            }
        `;
    }
    render() {
        return html`
            ${this.columns?.map(c => html`
                <li-table-cell .item="${this.row[c.name]}" .column="${c}" idx="${this.row['c0'] || 0}" color=${this.color}></li-table-cell>
            `)}
        `
    }

    static get properties() {
        return {
            row: { type: Object },
            idx: { type: Number },
            options: { type: Object, local: true },
            columns: { type: Object, local: true },
        }
    }
    get _rowHeight() {
        return this.options?.rowHeight || this.options?.rowMinHeight || 32;
    }
})

customElements.define('li-table-header-row', class extends LiElement {
    static get styles() {
        return css`
            .panel {
                position: relative;
                display: flex;
                box-sizing: border-box;
            }
        `;
    }
    render() {
        return html`
            ${this.type === 'bottom' && this.options?.footerHidden || this.type === 'top' && this.options?.headerHidden ? html`` : html`
                <div class="panel ${this.type}" style="left: ${-this.left}">
                    <div style="display: flex; background-color:${this.options?.footerColor || '#eee'}">
                        ${this.columns?.map(i => html`
                            <div style="width: ${i._width < 0 ? 0 : i._width}; min-height: ${this._columnMinHeight}">
                                <li-table-header-cell .column="${i}" type=${this.type}></li-table-header-cell>
                            </div>
                        `)}
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            type: { type: String },
            left: { type: Number, local: true },
            options: { type: Object, local: true },
            columns: { type: Object, local: true },
        }
    }
    get _columnMinHeight() {
        return this.options?.columnMinHeight || this.options?.columnMinHeight || 32;
    }
})


customElements.define('li-table-header-cell', class extends LiElement {
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
                border-right: 1px solid lightgray;
                box-sizing: border-box;
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
                ${this.type === 'top' && (this.column?.label || this.column?.name) || ''}
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

    _setAutoWidth(e) {
        this.column.width = undefined;
        this._fn._resizeColumns();
    }
    _pointerdown(e) {
        e.stopPropagation();
        e.preventDefault();
        this._resize = true;
        this._lastX = e.pageX;
        document.documentElement.addEventListener("pointermove", this.__move = this.__move || this._move.bind(this), false);
        document.documentElement.addEventListener("pointerup", this.__up = this.__up || this._up.bind(this), false);
        document.documentElement.addEventListener("pointercancel", this.__up = this.__up || this._up.bind(this), false);
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
            'max-height': this.options?.rowHeight ? this.options?.rowHeight + 'px' : 'auto',
            'min-height': this.options?.rowMinHeight ? this.options?.rowMinHeight || 32 + 'px' : '32px',
            'background-color': this.idx % 2 ? '#f5f5f5' : 'white',
            color: this.color
        }
    }
    render() {
        return html`
            <div class="cell" contenteditable="${this.readOnly ? 'false' : 'true'}" style=${styleMap(this.styles)}>${this.item}</div>
        `
    }

    static get properties() {
        return {
            idx: { type: Number },
            item: { type: Object },
            column: { type: Object },
            options: { type: Object, local: true },
            color: { type: String },
        }
    }
})
