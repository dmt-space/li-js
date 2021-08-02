import { LiElement, html, css } from '../../li.js';

import '../cell/cell.js';

customElements.define('li-table', class extends LiElement {

    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
            :host {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            .top-panel, .bottom-panel {
                display: flex;
                border-left: 1px solid gray;
                border-right: 1px solid gray;
                background-color: #eee;
            }
            .top-panel {
                border-top: 1px solid gray;
            }
            .bottom-panel {
                border-bottom: 1px solid gray;
            }
            .column {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 32px;
                overflow: hidden;
            }
            .main-panel {
                flex: 1;
                border: 1px solid gray;
                overflow: auto;
            }
            .row {
                display: flex;
                border-bottom: 1px solid lightgray;
                min-height: 32px;
            }
            .cell {
                display: flex;
                justify-content: center;
                align-items: center;
                max-height: 32px;
                overflow: hidden;
            }
            .vertical {
                position: absolute;
                top: 1;
                bottom: 1;
                border-left: 1px solid lightgray;
                z-index: 1;
            }
            .scroll {
                position: absolute;
                top: 1;
                height: 28px;
                border: 2px solid transparent;
                cursor: col-resize;
            }
            .scroll:first-child {
                border: none;
            }
            .scroll:last-child {
                border: none;
            }
        `;
    }

    render() {
        return html`
            <div class="top-panel">
                ${this.columns?.map(i => html`
                    <div class="column" style="width: ${i._width}">${i.label}</div>
                `)}
            </div>
            <div class="main-panel">
                ${this.data?.map((i, idx) => html`
                    <div class="row"> ${this.columns?.map((i2, idx2) => html`
                        <div class="cell" style="width: ${i2._width}">${idx + ' - 000' + (idx2 + 1)}</div>
                    `)}</div>
                `)}
            </div>
            <div class="bottom-panel">
                ${this.columns?.map(i => html`
                    <div class="column" style="width: ${i._width}">${i.label}</div>
                `)}
            </div>
            ${this.columns?.map((i, idx) => html`
                <div class="scroll" style="left: ${i.left - 4}px" @pointerdown="${(e) => this._pointerdown(e, i)}"></div>
                <div class="vertical" style="left: ${i.left}px"></div>
                <div class="scroll" style="left: ${i.left + 1}px" @pointerdown="${(e) => this._pointerdown(e, this.columns[idx+1])}"></div>
            `)}
        `
    }

    static get properties() {
        return {
            columns: { type: Array, local: true },
            data: { type: Array, local: true },
        }
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this._setScrollPosition.bind(this));
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this._setScrollPosition);
        super.disconnectedCallback();
    }

    firstUpdated() {
        super.firstUpdated();

        this.__move = this._move.bind(this);
        this.__up = this._up.bind(this);

        this.columns = [
            { label: 'col-001', width: 140 },
            { label: 'col-002', width: 200 },
            { label: 'col-003' },
            { label: 'col-004' },
            { label: 'col-005', width: 100 },
        ]
        this._data = [
            { label: 'col-001' },
            { label: 'col-002' },
            { label: 'col-003' },
            { label: 'col-004' },
            { label: 'col-005' },
        ]
        this.data = [];
        for (let i = 0; i < 200; i++) {
            this.data.push([...this._data])

        }
        console.log('generateDataSet')
        this._setScrollPosition();
    }

    updated(changedProperties) {

    }

    _setScrollPosition() {
        let l = this.columns.length;
        let left = 0;
        this.columns.forEach(i => {
            if (i.width) {
                l--;
                left += i.width;
            }
        })
        let w = (this.parentElement.offsetWidth - left) / l;
        left = 0;
        this.columns.map((i, idx) => {
            i.idx = idx;
            i._width = i.width || w;
            left = i.left = left + i._width;
        })
        this.$update();
    }

    _pointerdown(e, i) {
        e.stopPropagation();
        e.preventDefault();
        this._lastX = e.pageX;
        this._item = i;
        document.documentElement.addEventListener("pointermove", this.__move, false);
        document.documentElement.addEventListener("pointerup", this.__up, false);
        document.documentElement.addEventListener("pointercancel", this.__up, false);
    }
    _move(e) {
        const movX = e.pageX - this._lastX;
        this._lastX = e.pageX;
        this._item.left += movX;
        this._item._width += movX;
        this._item._width = this._item._width < 60 ? 60 : this._item._width;
        this._item.width = this._item._width;
        this._setScrollPosition();
        //this.requestUpdate();
    }
    _up() {
        document.documentElement.removeEventListener("pointermove", this.__move, false);
        document.documentElement.removeEventListener("pointerup", this.__up, false);
        document.documentElement.removeEventListener("pointercancel", this.__up, false);
        this._setScrollPosition();
        this.$update();
    }
})

customElements.define('li-table-row', class extends LiElement {

    static get styles() {
        return css`

        `;
    }

    render() {
        return html`

        `
    }

    static get properties() {
        return {
            columns: { type: Array, local: true },
            data: { type: Array, local: true },
        }
    }

    constructor() {
        super();
    }

    firstUpdated() {
        super.firstUpdated();
    }

    updated(changedProperties) {

    }

})

customElements.define('li-table-cell', class extends LiElement {

    static get styles() {
        return css`

        `;
    }

    render() {
        return html`

        `
    }

    static get properties() {
        return {
            columns: { type: Array, local: true },
            data: { type: Array, local: true },
        }
    }

    constructor() {
        super();
    }

    firstUpdated() {
        super.firstUpdated();
    }

    updated(changedProperties) {

    }

})
