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
                border-right: 1px solid lightgray;
                flex: 1;
                min-height: 32px;
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
                flex: 1;
                justify-content: center;
                align-items: center;
                border-right: 1px solid lightgray;
                max-height: 32px;
            }
        `;
    }

    render() {
        return html`
            <div class="top-panel">
                ${this.columns?.map(i => html`
                    <div class="column">${i.label}</div>
                `)}
            </div>
            <div class="main-panel">
                ${this.data?.map((i, idx) => html`
                    <div class="row"> ${this.columns?.map((i2, idx2) => html`<div class="cell">${idx + ' - 000' + (idx2 + 1)}</div>`)}</div>
                `)}
            </div>
            <div class="bottom-panel">
                ${this.columns?.map(i => html`
                    <div class="column">${i.label}</div>
                `)}
            </div>
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
        this.columns = [
            { label: 'col-001' },
            { label: 'col-002' },
            { label: 'col-003' },
            { label: 'col-004' },
            { label: 'col-005' },
        ]
        this.data = [
            { label: 'col-001' },
            { label: 'col-002' },
            { label: 'col-003' },
            { label: 'col-004' },
            { label: 'col-005' },
        ]
    }

    updated(changedProperties) {

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
