import { LiElement, html, css, styleMap } from '../../li.js';

customElements.define('li-table', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; border-left: 1px solid gray;}
            ::-webkit-scrollbar-track { background-color: #eee;}
            ::-webkit-scrollbar-thumb { background-color: #aaa;  border-radius: 2px; }
            #table {
                position: absolute;
                display: flex;
                flex-direction: column;
                flex: 1;
                height: 100%;
                width: 100%;
                border: 1px solid gray;
                overflow: hidden;
                opacity: 0;
                transition: opacity .5s linear;
            }
            #table[ready] {
                opacity: 1;
            }
            #container {
                overflow: auto; 
                display: flex; 
                flex: 1;
                border-top: 1px solid gray;
                border-bottom: 1px solid gray;
            }
            #main {
                position: relative;
                display: flex;
                flex-direction: column;
                height: 100%;
                flex: 1;
            }
            .vertical-line {
                position: absolute;
                border-right: 1px solid lightgray;
                height: 100%;
                width: 1px;
                top: 1;
                z-index: 2;
                opacity: 1;
                transition: opacity .5s linear;
            }
        `;
    }
    render() {
        return html`
            <div id="table">
                <li-table-header-row class="panel top" type="top"></li-table-header-row>
                <div id="container" @scroll=${this._scroll} @pointerdown=${this._pointerdown}>
                    <div id="main" style="width: ${this.maxWidth}" @mousewheel=${this._wheel}>
                        <div style="position: absolute; top: ${this.options?.lazy ? this.lazy?.start * this._rowHeight : 0}">
                            ${this._data.map((row, idx) => html`<li-table-row .row=${row} idx=${idx}></li-table-row>`)}
                        </div>            
                    </div>
                    <div style="border:1px solid transparent; height: ${this._tableHeight}px;"></div>
                </div>
                <li-table-header-row class="panel bottom" type="bottom"></li-table-header-row>
            </div>
            ${this.columns?.map((i, idx) => html`
                <div class="vertical-line" style="left : ${i.left - this._left}px; opacity: ${this.ready ? 1 : 0}; 
                    visibility: ${i.left - this._left < 0 || i.left - this._left > this.maxWidth ? 'hidden' : 'visibility'}"></div>
            `)}
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
            ready: { type: Boolean },
            left: { type: Number, local: true },
        }
    }
    get _hasScroll() {
        return this.$id?.main?.clientHeight < this.$id?.main?.scrollHeight;
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
    get _left() {
        return this.$id?.container?.scrollLeft || 0;
    }
    get _rowCount() {
        return Math.round(this.$id.main.offsetHeight / this._rowHeight);
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
                    this.$update();
                    // this.requestUpdate();
                }
                if (this.lazy.ok && e[0].intersectionRatio > 0 && this.lazy.scroll < 0) {
                    this.lazy.start -= this.lazy.step;
                    this.lazy.end = this.lazy.start + this.lazy.max;
                    if (this.lazy.start < 0) {
                        this.lazy.start = 0;
                        this.lazy.end = this.lazy.max;
                    }
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
    _wheel(e) {
        this.lazy.scroll = e.deltaY < 0 ? -1 : 1;
    }
    _scroll(e) {
        //this.left = this._left;
        this._scrollTop = Math.floor((e.target.scrollTop / this._rowHeight));
        // this._refreshData();
        requestAnimationFrame(() => {
            this.$update();
        })
    }
    _refreshData() {
        if (this._down) return;
        // LI.throttle('_scroll', () => {
        //console.log('scroll')
        if (this._scrollTop <= this._rowCount && this.lazy.start !== 0) {
            this.lazy.start = 0;
            this.lazy.end = this.lazy.start + this.lazy.max;
        } else if (this._scrollTop >= this.data.length - this._rowCount) {
            this.lazy.start = this.data.length - this._rowCount - 2;
            this.lazy.end = this.lazy.start + this.lazy.max;
        } else {
            this.lazy.start = this._scrollTop;
            this.lazy.end = this.lazy.start + this.lazy.max;
        }
        requestAnimationFrame(() => {
            this.$update();
        })
        // }, 50)
    }
    _pointerdown(e) {
        document.addEventListener('pointerup', this.__pointerup = this.__pointerup || this._pointerup.bind(this));
        this._down = true;
    }
    _pointerup(e) {
        document.removeEventListener('pointerup', this.__pointerup);
        this._down = false;
        //this._refreshData();
    }
})

customElements.define('li-table-row', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                border-bottom: 1px solid lightgray;
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

customElements.define('li-table-header-row', class extends LiElement {
    static get styles() {
        return css`
            .panel {
                position: relative;
                display: flex;
            }
        `;
    }
    render() {
        return html`
            ${this.options?.footerHidden ? html`` : html`
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
            _fn: { type: Object, local: true },
            lazy: { type: Object, local: true },
            options: { type: Object, local: true },
            columns: { type: Object, local: true },
        }
    }
    get _columnMinHeight() {
        return this.options?.columnMinHeight || this.options?.columnMinHeight || 32;
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
                /* border-right: 1px solid lightgray; */
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
                /* border-right: 1px solid lightgray; */
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
            width: this.column?._width < 0 ? 0 : this.column?._width,
            height: this.options?.rowHeight ? this.options?.rowHeight - 1 + 'px' : 'auto',
            'max-height': this.options?.rowHeight ? this.options?.rowHeight + 'px' : 'auto',
            'min-height': this.options?.rowMinHeight ? this.options?.rowMinHeight || 32 + 'px' : '32px',
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
