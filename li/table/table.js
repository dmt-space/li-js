import { LiElement, html, css, styleMap } from '../../li.js';
import '../button/button.js';
import '../rating/rating.js';

customElements.define('li-table', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; border-left: 1px solid gray}
            ::-webkit-scrollbar-track { background-color: #eee;}
            ::-webkit-scrollbar-thumb { background-color: #aaa;  border-radius: 2px; }
            :host {
                box-sizing: border-box;
                height: 100%;
                width: 100%;
            }
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
                <li-table-panel-row class="panel top" type="top"></li-table-panel-row>
                ${this.data?.options?.headerHidden && !this.data?.options?.headerService ? html`` : html`<div style="border-top:1px solid gray; height: 1px;"></div>`}
                <div id="container" @scroll=${this._scroll}>
                    <div id="main" style="width: ${this.maxWidth}px; height: ${this.data?.options?.lazy ? this._tableHeight + 'px' : 'unset'}">
                        ${this._rows.map((row, idx) => html`
                            <li-table-row .row=${row} idx=${idx} style="box-sizing: border-box;
                                position: ${this.data?.options?.lazy ? 'absolute' : 'relative'};
                                top: ${this.data?.options?.lazy ? (row.$idx - 1) * this._rowHeight + 'px' : 'unset'}">
                            </li-table-row>
                        `)}   
                    </div>
                </div>
                ${this.data?.options?.footerHidden && !this.data?.options?.footerService ? html`` : html`<div style="border-bottom:1px solid gray; height: 1px;"></div>`}
                <li-table-panel-row class="panel bottom" type="bottom"></li-table-panel-row>
            </div>
        `
    }

    static get properties() {
        return {
            $partid: { type: String },
            data: { type: Object, local: true },
            _data: { type: Object, local: true },
            maxWidth: { type: Number, local: true },
            lazy: { type: Object },
            ready: { type: Boolean },
            left: { type: Number, local: true },
            selected: { type: Object, local: true },
            strSearch: { type: String, default: '', local: true },
            action: { type: Object, global: true }
        }
    }
    get _rows() {
        if (!this.data?.options?.lazy) return this._data.rows || [];
        return this._data.rows?.slice(this.lazy.start, this.lazy.end,) || [];
    }
    get _rowHeight() {
        return this.data?.options?.rowHeight || this.data?.options?.rowMinHeight || 32;
    }
    get _tableHeight() {
        return (this._data?.rows?.length || 0) * this._rowHeight + 1;
    }
    get _left() {
        return this.$id('container')?.scrollLeft || 0;
    }
    get _visibleRowCount() {
        return Math.round(this.$id('container')?.clientHeight / this._rowHeight || 0);
    }
    get _hasScroll() {
        return this.$id('main')?.scrollHeight > this.$id('table').clientHeight;
    }

    constructor() {
        super();
        this.lazy = { step: 40, start: 0, end: 80, max: 80, scroll: 1 };
        this._data = {};
        this.$listen('changedInPropertyGrid', () => this.$update());
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.__resizeColumns = this.__resizeColumns || this._resizeColumns.bind(this));
        this.listen('scrollTo', (e) => this.$id('container')?.scrollTo(0, this.$id('container').scrollTop += e.detail * this._rowHeight));
        this._lastTop = this._top = this._lastLeft = this._scrollTop = 0;
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.__resizeColumns);
        super.disconnectedCallback();
    }
    updated(e) {
        if (e.has('data')) {
            if (this.data) {
                this._data._setRows = () => this._setRows();
                this._setRows();
                this.lazy.step = this.data.options?.lazyStep || this._visibleRowCount * 2 || 40;
                this.lazy.max = this.data.options?.lazyMax || this.lazy.step * 2;
                this.lazy.end = this._visibleRowCount + this.lazy.max;
                this._data._resizeColumns = () => this._resizeColumns();
                this._resizeColumns();
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.$id('table')?.setAttribute('ready', true);
                        this.ready = true;
                    });
                }, 100);
            }
        }
        if (e.has('action') && this.action) {
            // console.log(this.action);
            if (this[this.action.fn] && this.id === this.action.id) {
                this[this.action.fn]();
                this.$update();
                if (this.action.scrollToEnd) {
                    setTimeout(() => {
                        this.selected = this._data.rows[this._data.rows.length - 1];
                        this.$id('container')?.scrollTo(0, this.$id('container').scrollTop += 1_000_000_000);
                        this.fire('tableRowSelect', { row: this.selected, update: () => this.$update() });
                    }, 50);
                }
            }
        }
    }

    _setRows() {
        let idx = 0,
            sum = this.data?.options?.sum?.length,
            search = this.data.options?.searchColumns?.length && this.strSearch ? this.strSearch.toLowerCase() : '';
        if (sum) {
            this._data.sum = {};
            this.data.options._sum = {};
            this.data.options.sum.forEach(j => this._data.sum[j] = 0);
        }
        const sort = this.data.options.sortColumns;
        if (sort?.length && this.data?.rows?.length) {
            this.data.rows.forEach(i => {
                i.$sort = '';
                sort.forEach(s => i.$sort += (i[s] || 'яяя'));
            })
            this.data.rows = this.data.rows.sort((a, b) => {
                if (a.$sort > b.$sort) return 1;
                if (a.$sort < b.$sort) return -1;
                return 0;
            });
        }
        let s = search ? search.split(' ') : undefined;
        this._data.rows = this.data?.rows?.filter(i => {
            if (!i._deleted) {
                let ok = false;
                if (s?.length) this.data.options.searchColumns.forEach(j => {
                    s.some(v => {
                        if (!ok && v && (i[j] + '')?.toLowerCase().includes(v.trim())) ok = true;
                    })
                });
                if (!s?.length || (s?.length && ok)) {
                    i.$idx = ++idx;
                    if (sum) this.data.options.sum.forEach(j => {
                        const col = this.data?.columns?.find((e) => e.name === j);
                        this._data.sum[j] += col?.calc?.(i) || Number(i[j]) || 0;
                    })
                    return true;
                }
            }
        })
        this.$update();
    }
    _deleteRow(row = this.selected) {
        if (!row) return;
        const idx = row.$idx === this._data.rows.length ? this._data.rows.length - 2 : row.$idx;
        row._deleted = true;
        this.selected = this._data.rows[idx];
        this._setRows();
        this.action = {
            action: 'tableCellChanged',
            ulid: this.$ulid,
            row
        }
        this.fire('tableRowSelect', { row: this.selected, update: () => this.$update() });
    }
    _resizeColumns() {
        this.left = this._left;
        this.maxWidth = this.$id('table')?.offsetWidth - (this._hasScroll ? 6 : 2);
        const columns = this.data._columns = this.data?.columns?.filter(i => !i.hidden) || [];
        let length = columns.length,
            left = 0;
        columns.forEach(i => {
            if (i.width) {
                length--;
                left += i.width;
            }
        })
        let width = (this.maxWidth - left) / length;
        left = 0;
        columns.map((i, idx) => {
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
        } else if (this.data?.options?.lazy) {
            this.lazy.scroll = e.target.scrollTop - this._lastTop;
            this._lastTop = e.target.scrollTop;
            this._scrollTop = Math.round(e.target.scrollTop / this._rowHeight);
            this._refreshRows();
        }
    }
    _refreshRows() {
        if (this._scrollTop > this.lazy.start + this.lazy.step && this.lazy.scroll > 0
            || this._scrollTop < this.lazy.start + this.lazy.step && this.lazy.scroll < 0
        ) {
            this.lazy.scrollLast = this.lazy.scroll;
            if (this.lazy.scroll > 0) {
                this.lazy.start = this._scrollTop - 1;
                this.lazy.start = this.lazy.start % 2 ? this.lazy.start - 1 : this.lazy.start;
                this.lazy.end = this.lazy.start + this._visibleRowCount + this.lazy.max;
                //console.log(this.lazy.start, this.lazy.end, this.lazy.end - this.lazy.start, 'step-' + this.lazy.step, 'max-' + this.lazy.max)
                this.$update();
            } else if (this.lazy.start !== 0) {
                this.lazy.start = this._scrollTop - this.lazy.max;
                this.lazy.start = this.lazy.start % 2 ? this.lazy.start - 1 : this.lazy.start;
                this.lazy.start = this.lazy.start < 0 ? 0 : this.lazy.start;
                this.lazy.end = this.lazy.start + this.lazy.max + this._visibleRowCount;
                //console.log(this.lazy.start, this.lazy.end, this.lazy.end - this.lazy.start, 'step-' + this.lazy.step, 'max-' + this.lazy.max)
                this.$update();
            }
        }
    }
})

customElements.define('li-table-row', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                box-sizing: border-box;
            }
        `;
    }
    render() {
        return html` 
            ${this.data?._columns?.map(c => html`
                <li-table-cell .item="${this.row[c.name]}" .column="${c}" @click=${this._click} .row=${this.row} .selectedRow=${this._selected} .idx=${this.idx}></li-table-cell>
            `)}
        `
    }

    static get properties() {
        return {
            row: { type: Object },
            idx: { type: Number },
            data: { type: Object, local: true },
            _data: { type: Object, local: true },
            selected: { type: Object, default: {}, local: true },
        }
    }
    get _rowHeight() {
        return this.data?.options?.rowHeight || this.data?.options?.rowMinHeight || 32;
    }
    get _selected() {
        return this.selected === this.row;
    }

    _click(e) {
        this.selected = this.row;
        this.fire('tableRowSelect', { row: this.row, update: () => this.$update() });
    }
})

customElements.define('li-table-panel-row', class extends LiElement {
    static get styles() {
        return css`
            .panel {
                position: relative;
                display: flex;
                box-sizing: border-box;
            }
            .service {
                display: flex;
                align-items: center;
                width: 100%;
                height: 24px;
            }
            ._top {
                border-bottom: 1px solid lightgray;
            }
            ._bottom {
                border-top: 1px solid lightgray;
            }
            li-button {
                padding: 2px;
                font-size: 10px;
            }
            .service-text {
                align-items: center;
                padding: 2px;
                font-size: 12px;
            }
            #strSearch {
                color: gray;
                border: 1px solid lightgray;

            }
            #strSearch:focus {
                outline: none !important;
            }
        `;
    }
    render() {
        return html`
            ${this.type === 'top' && this.data?.options?.headerService ? html`
            <div class="service _top">
                <div class="service-text">${this.data?.options?.headerServiceText || ''}</div>
                ${this.data.options?.searchColumns?.length ? html`
                    <input id="strSearch" style="margin-left: auto" @change=${this._setStrSearch}>
                    <li-button name="search" size=18 border='none' title="search" @click=${this._setStrSearch}></li-button>
                    <li-button name="close" size=18 border='none' title="clear" @click=${this._clearStrSearch}></li-button>
                `: html``}   
            </div>` : html``}

            ${this.type === 'bottom' && this.data?.options?.footerHidden || this.type === 'top' && this.data?.options?.headerHidden ? html`` : html`
            <div class="panel ${this.type}" style="left: ${-this.left}; height: ${this.data?.options?.headerHeight ? this.data?.options?.headerHeight : 'auto'}">
                <div style="display: flex; background-color:${(this.type === 'bottom' && this.data?.options?.footerColor)
                || (this.type === 'top' && this.data?.options?.headerColor)
                || '#eee'}">
                    ${this.data?._columns?.map(i => html`
                        <div style="width: ${i._width < 16 ? 16 : i._width}; min-height: ${this._columnMinHeight};
                            min-width: ${i.minWidth ? i.minWidth : this.data?.options?.minWidth ? this.data?.options?.minWidth : 15 + 'px'}">
                            <li-table-panel-cell .column="${i}" type=${this.type}></li-table-panel-cell>
                        </div>
                    `)}
                </div>
            </div>`}

            ${this.type === 'bottom' && this.data?.options?.footerService ? html`
            <div class="service _bottom">
                <div class="service-text">${this.data?.options?.footerServiceTotal ? 'total:' + this._data?.rows?.length : ''}</div>
                <div class="service-text">${this.data?.options?.footerServiceText || ''}</div>
                <li-button name="chevron-left" width="auto" size=18 style="margin-left: auto" border='none' @click=${(e) => this.fire('scrollTo', -1_000_000_000)}></li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 100_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -100_000)}>-100 000</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 10_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -10_000)}>-10 000</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 1_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -1_000)}>-1 000</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 100 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -100)}>-100</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 100 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 100)}>+100</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 1_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 1_000)}>+1 000</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 10_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 10_000)}>+10 000</li-button>
                <li-button size=18 width="auto" border='none' style="display: ${this._data?.rows?.length > 100_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 100_000)}>+100 000</li-button>
                <li-button name="chevron-right" width="auto" size=18 border='none' @click=${(e) => this.fire('scrollTo', 1_000_000_000)}></li-button>
            </div>` : html``} 
        `
    }

    static get properties() {
        return {
            type: { type: String },
            left: { type: Number, local: true },
            data: { type: Object, local: true },
            _data: { type: Object, local: true },
            strSearch: { type: String, local: true },
        }
    }
    get _columnMinHeight() {
        return this.data?.options?.columnMinHeight || this.data?.options?.columnMinHeight || 32;
    }

    firstUpdated() {
        super.firstUpdated();
        if (this.data?.options?.headerService && this.data?.options?.searchColumns?.length) {
            const search = this.renderRoot.getElementById('strSearch');
            if (search)
                search.value = this.strSearch || '';
        }
    }

    _clearStrSearch() {
        this.renderRoot.getElementById('strSearch').value = '';
        this._setStrSearch();
    }
    _setStrSearch() {
        this.strSearch = this.renderRoot.getElementById('strSearch').value;
        setTimeout(() => {
            this._data._setRows();
            this.$update();
        }, 100)
    }
})


customElements.define('li-table-panel-cell', class extends LiElement {
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
                font-size: 14px;
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
            <div class="label" style="writing-mode: ${this.data?.options?.headerVertical && this.type === 'header' ? 'vertical-lr' : ''}">
                ${this.type === 'top' && (this.column?.label || this.column?.name) || ''}
                ${this.type === 'bottom' && this.column?.name === '$idx' ? this._data?.rows?.length : ''}
                ${this.sum}
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
            data: { type: Object, local: true },
            _data: { type: Object, local: true },
        }
    }
    get disableResize() {
        return this.data?.options?.disableResizeColumns || this.column?.disableResize;
    }
    get sum() {
        return this.type === 'bottom' && this.data?.options?.sum?.includes(this.column.name) ? Math.round(this._data.sum[this.column.name] * 100) / 100 : '';
    }

    _setAutoWidth(e) {
        this.column.width = undefined;
        this._data._resizeColumns();
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
        this._data._resizeColumns();
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
                box-sizing: border-box;
                position: relative;
                cursor: pointer;
                border-right: 1px solid lightgray;
            }
            .cell {
                background-color: transparent;
                position: relative;
                display: flex;
                flex: 1;
                align-items: center;
                overflow: hidden;
                word-break: break-word;
                outline: none;
                box-sizing: border-box;
            }
            .input {
                padding: 0;
                color: gray;
                background-color: transparent;
                border: none;
            }
            .input:focus {
                outline: none !important;
            }
        `;
    }
    get styles() {
        return {
            'min-width': (this.column?.minWidth ? this.column?.minWidth : this.data?.options?.minWidth ? this.data?.options?.minWidth : 16) - 1 + 'px',
            width: this.column?._width < 15 ? 15 : this.column?._width - 1,
            height: this.data?.options?.rowHeight ? this.data?.options?.rowHeight + 'px' : '100%',
            'max-height': this.data?.options?.rowHeight ? this.data?.options?.rowHeight + 'px' : '100%',
            'min-height': this.data?.options?.rowMinHeight ? this.data?.options?.rowMinHeight || 32 + 'px' : '32px',
            'text-align': this.column?.textAlign || 'center',
            'justify-content': this.column?.textAlign || 'center',
            'font-size': this.column?.fontSize || this.data?.options?.fontSize || '1rem',
            'background-color': this.selectedRow ? 'lightyellow' : this.idx % 2 ? '#f5f5f5' : 'white',
            color: 'gray'
        }
    }
    get styles2() {
        return { ...this.styles, 'border-bottom': this.selectedRow ? '1px solid blue' : '1px solid lightgray' }
    }
    render() {
        return html`
            <div class="cell" style=${styleMap(this.styles2)}
                    .title=${this.column?.showTitle ? this.item : ''} 
                    @dblclick=${this._dblClick}
                    @click=${this._click}
                >
                ${this.column.typeColumn === 'rating' ? html`
                        <li-rating .value=${this.row[this.column.name]} @change=${this._changeValue}></li-rating>
                    ` : html`
                    ${this.column.calc ? html`
                            ${this._calc}
                    ` : html`
                        ${this.selected ? html`` : html`${this.row[this.column.name] || ''}`}
                        ${!this.selected ? html`` : html`
                            <input class="input" .value=${this.row[this.column.name] || ''} style=${styleMap(this.styles)}
                                @blur=${this._changeValue} 
                                @change=${this._changeValue}     
                            >
                        `}
                    `}
                `}
            </div>
        `
    }

    static get properties() {
        return {
            item: { type: Object },
            column: { type: Object },
            data: { type: Object, local: true },
            _data: { type: Object, local: true },
            row: { type: Object },
            action: { type: Object, global: true },
            _action: { type: Object, global: true },
            selected: { type: Boolean },
            selectedRow: { type: Boolean },
            idx: { type: Number }
        }
    }
    get readonly() {
        return this.column.name === '$idx' || this.column?.readonly || this.data?.options?.readonly;
    }
    get _calc() {
        let res = this.column.calc(this.row);
        if (+res) return (+res).toFixed(2);
        return '';
    }

    updated(e) {
        if (e.has('_action') && this._action && this._action.action === 'clearSelected' && this.$ulid !== this._action.ulid)
            this.selected = false;
    }

    _click() {
        this._action = {
            action: 'clearSelected',
            ulid: this.$ulid
        }
        if (!this.readonly) this.selected = true;
    }
    _changeValue(e) {
        if (this.row[this.column.name] !== e.target.value) {
            this.row[this.column.name] = e.target.value;
            this.selected = false;
            this._data._setRows();
            this.action = {
                action: 'tableCellChanged',
                ulid: this.$ulid,
                row: this.row,
            }
        }
    }
    _dblClick(e) {
        this.action = undefined;
        if (this.data?.options?.actions?.includes('dblClickTableCell')) {
            this.action = {
                id: this.id || this.partid,
                action: `dblClickTableCell`,
                row: this.row,
                cell: e.target.innerText
            }
        }
    }
})
