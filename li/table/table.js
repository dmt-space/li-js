import { LiElement, html, css, styleMap } from '../../li.js';
import '../button/button.js';

customElements.define('li-table', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; border-left: 1px solid gray;}
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
                ${this.data?.options?.headerHidden ? html`` : html`<div style="border-top:1px solid gray; height: 1px;"></div>`}
                <div id="container" @scroll=${this._scroll}>
                    <div id="main" style="width: ${this.maxWidth}px; height: ${this._tableHeight}px;">
                        ${this._rows.map((row, idx) => html`
                            <li-table-row .row=${row} idx=${idx} style="box-sizing: border-box;
                                position: ${this.data?.options?.lazy ? 'absolute' : 'relative'};
                                top: ${this.data?.options?.lazy ? (row._idx - 1) * this._rowHeight + 'px' : ''}">
                            </li-table-row>
                        `)}   
                    </div>
                </div>
                ${this.data?.options?.footerHidden ? html`` : html`<div style="border-bottom:1px solid gray; height: 1px;"></div>`}
                <li-table-panel-row class="panel bottom" type="bottom"></li-table-panel-row>
            </div>
        `
    }

    static get properties() {
        return {
            $partid: { type: String },
            data: { type: Object, local: true },
            maxWidth: { type: Number, local: true },
            lazy: { type: Object, default: { step: 40, start: 0, end: 80, max: 80, scroll: 1, ok: false }, local: true },
            ready: { type: Boolean },
            left: { type: Number, local: true },
            _start: { type: Number },
            selected: { type: Object, default: {}, local: true },
        }
    }
    get _rows() {
        if (!this.data?.options?.lazy) return this.data?.rows || [];
        return this.data?.rows?.slice(this._start, this.lazy.end,) || [];
    }
    get _rowHeight() {
        return this.data?.options?.rowHeight || 36;
    }
    get _tableHeight() {
        return (this.data?.rows?.length || 0) * this._rowHeight + 1;
    }
    get _left() {
        return this.$id?.container?.scrollLeft || 0;
    }
    get _visibleRowCount() {
        return Math.round(this.$id?.container?.clientHeight / this._rowHeight || 0);
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.__resizeColumns = this.__resizeColumns || this._resizeColumns.bind(this));
        this.listen('scrollTo', (e) => {
            this.$id?.container?.scrollTo(0, this.$id.container.scrollTop += e.detail * this._rowHeight);
        });
        this._start = this._lastTop = this._top = this._lastLeft = this._scrollTop = 0;
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.__resizeColumns);
        super.disconnectedCallback();
    }
    updated(e) {
        if (e.has('data')) {
            if (this.data) {
                this.lazy.step = this.data.options?.lazyStep || this._visibleRowCount + 2 || 40;
                this.lazy.end = this.lazy.max = this.data.options?.lazyMax || this.lazy.step * 2;
                this.data._resizeColumns = () => this._resizeColumns();
                this._resizeColumns();
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.$id.table?.setAttribute('ready', true);
                        this.ready = true;
                    });
                }, 100);
            }
        }
    }

    _resizeColumns() {
        this.left = this._left;
        this.maxWidth = this.$id?.main?.offsetWidth;
        let length = this.data?.columns?.length,
            left = 0;
        this.data?.columns?.forEach(i => {
            if (i.width) {
                length--;
                left += i.width;
            }
        })
        let width = (this.maxWidth - left) / length;
        left = 0;
        this.data?.columns?.map((i, idx) => {
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
                this._start = this.lazy.start = this._scrollTop - 1;
                this.lazy.end = this.lazy.start + this.lazy.max;
                console.log(this._start, this.lazy.end)
                this.$update();
            } else if (this._start !== 0) {
                this.lazy.start = this._scrollTop - 1 - this.lazy.max;
                this._start = this.lazy.start = this.lazy.start < 0 ? 0 : this.lazy.start;
                this.lazy.end = this.lazy.start + this.lazy.max + this._visibleRowCount + 2;
                console.log(this._start, this.lazy.end)
                this.$update();
            }

        }
    }
})

customElements.define('li-table-row', class extends LiElement {
    static get styles() {
        return css`
            .row {
                position: relative;
                display: flex;
                border-bottom: 1px solid lightgray;
                box-sizing: border-box;
                cursor: pointer;
            }
            .row:not(.selected):hover {
                border-bottom: 1px solid black;
            }
            .row.selected {
                border-bottom: 1px solid blue;
            }
        `;
    }
    render() {
        return html` 
            <div class="row ${this._selected ? 'selected' : ''}" style="background-color: ${this._selected ? 'lightyellow' : this.idx % 2 ? '#f5f5f5' : 'white'}">
                ${this.data?.columns?.map(c => html`
                    <li-table-cell .item="${this.row[c.name]}" .column="${c}" idx="${this.idx || 0}" @click=${this._click}></li-table-cell>
                `)}
            </div>        
        `
    }

    static get properties() {
        return {
            row: { type: Object },
            idx: { type: Number },
            data: { type: Object, local: true },
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
        this.fire('tableSelected', this.row);
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
        `;
    }
    render() {
        return html`
            ${this.type === 'bottom' && this.data?.options?.footerHidden || this.type === 'top' && this.data?.options?.headerHidden ? html`` : html`
                ${this.type === 'top' && this.data?.options?.headerService ? html`
                <div class="service _top">
                    <div class="service-text">${this.data?.options?.headerServiceText || ''}</div>    
                    <li-button name="add" size=18 style="margin-left: auto" border='none' title="add"></li-button>
                    <li-button name="delete" size=18 border='none' title="dlete"></li-button>
                    <li-button name="edit" size=18 border='none' title="edit"></li-button>
                </div>` : html``}   
                <div class="panel ${this.type}" style="left: ${-this.left}; height: ${this.data?.options?.headerHeight ? this.data?.options?.headerHeight : 'auto'}">
                    <div style="display: flex; background-color:${this.data?.options?.footerColor || '#eee'}">
                        ${this.data?.columns?.map(i => html`
                            <div style="width: ${i._width < 16 ? 16 : i._width}; min-height: ${this._columnMinHeight}">
                                <li-table-panel-cell .column="${i}" type=${this.type}></li-table-panel-cell>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.type === 'bottom' && this.data?.options?.footerService ? html`
                <div class="service _bottom">
                    <div class="service-text">${this.data?.options?.footerServiceText || ''}</div>
                    <li-button name="chevron-left" width="auto" size=18 style="margin-left: auto" border='none' @click=${(e) => this.fire('scrollTo', -1_000_000_000)}></li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 100_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -100_000)}>-100 000</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 10_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -10_000)}>-10 000</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 1_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -1_000)}>-1 000</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 100 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', -100)}>-100</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 100 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 100)}>+100</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 1_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 1_000)}>+1 000</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 10_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 10_000)}>+10 000</li-button>
                    <li-button size=18 width="auto" border='none' style="display: ${this.data?.rows?.length > 100_000 ? 'block' : 'none'}" @click=${(e) => this.fire('scrollTo', 100_000)}>+100 000</li-button>
                    <li-button name="chevron-right" width="auto" size=18 border='none' @click=${(e) => this.fire('scrollTo', 1_000_000_000)}></li-button>
                </div>` : html``} 
            `}
        `
    }

    static get properties() {
        return {
            type: { type: String },
            left: { type: Number, local: true },
            data: { type: Object, local: true }
        }
    }
    get _columnMinHeight() {
        return this.data?.options?.columnMinHeight || this.data?.options?.columnMinHeight || 32;
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
            data: { type: Object, local: true }
        }
    }
    get disableResize() {
        return this.data?.options?.disableResizeColumns || this.column?.disableResize;
    }

    _setAutoWidth(e) {
        this.column.width = undefined;
        this.data._resizeColumns();
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
        this.data._resizeColumns();
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
                border-right: 1px solid lightgray;
                background-color: transparent;
                position: relative;
                display: flex;
                flex: 1;
                align-items: center;
                overflow: hidden;
                word-break: break-word;
                outline: none;
                padding: 2px;
                box-sizing: border-box;
            }
        `;
    }
    get styles() {
        return {
            width: this.column?._width < 16 ? 16 : this.column?._width,
            height: this.data?.options?.rowHeight ? this.data?.options?.rowHeight - 1 + 'px' : 'auto',
            'max-height': this.data?.options?.rowHeight ? this.data?.options?.rowHeight + 'px' : 'auto',
            'min-height': this.data?.options?.rowMinHeight ? this.data?.options?.rowMinHeight || 32 + 'px' : '32px',
            // 'background-color': this.idx % 2 ? '#f5f5f5' : 'white',
            'text-align': this.column?.textAlign || 'center',
            'justify-content': this.column?.textAlign || 'center'
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
            data: { type: Object, local: true }
        }
    }
})
