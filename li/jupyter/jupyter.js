import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../dropdown/dropdown.js';

let $s = {}, $a = {}, $c = {};

customElements.define('li-jupyter', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
                padding: 12px 0;
            }
        `;
    }
    render() {
        return html`
            ${$c.notebook?.cells?.length ? html`` : html`
                <li-jupyter-cell-addbutton style="position: absolute; top: 18px; left: 12px; z-index: 31;"></li-jupyter-cell-addbutton>
            `}
            ${($c.notebook?.cells || []).map((cell, idx) => html`
                ${cell.cell_type}
                <li-jupyter-cell .cell=${cell} idx=${idx}></li-jupyter-cell>
            `)}
        `
    }

    firstUpdated() {
        super.firstUpdated();
        $s = this.$$s; $a = this.$$a; $c = this.$$c;
    }
    updated(changedProperties) {
        if (changedProperties.has('url')) this.loadURL();
    }

    static get properties() {
        return {
            $$s: {
                type: Object, local: true, save: true, default: {
                    showBorder: false
                }
            },
            $$a: {
                type: Object, local: true, default: {
                    readOnly: false
                }
            },
            $$c: {
                type: Object, local: true, default: {
                    notebook: {},
                    focusedCell: undefined,
                    editedCell: undefined
                }
            },
            url: { type: String, default: '' }
        }
    }

    async loadURL(url = this.url) {
        $c.focusedCell = undefined;
        if (url) {
            const response = await fetch(url);
            const json = await response.json();
            $c.notebook = json;
            this.$update();
        }
    }
})

customElements.define('li-jupyter-cell-addbutton', class extends LiElement {
    static get styles() {
        return css`
            .btn {
                display: flex;
                position: absolute;
                left: -8px;
                z-index: 31;
                opacity: 0.5;
            }
            .btn:hover {
                opacity: 1;
            }
            .cell {
                position: absolute;
                top: -12px;
                left: 20px;
                z-index: 21;
                font-size: 10px;
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            <li-button class="btn" name="add" size=16 radius="50%" title="add cell" @click=${() => this.showCellViews('add')}
                    style="top: ${this.position === 'top' ? '-12px' : 'unset'}; bottom: ${this.position !== 'top' ? '-12px' : 'unset'};"></li-button>
            ${this.position === 'top' ? html`
                <div class="cell" @click=${() => this.showCellViews('select type')} title="select cell type" style="{color: ${this.cell?.color || 'gray'}">${this.cell?.label || this.cell?.cell_type}</div>
            ` : html``}
        `
    }

    static get properties() {
        return {
            cell: { type: Object, default: undefined },
            position: { type: String, default: 'top' }
        }
    }

    async showCellViews(view) {
        const res = await LI.show('dropdown', new LiJupyterListViews, { cell: this.cell, position: this.position, view });
        if (res && view === 'add') $c.editedCell = undefined;
        console.log('from dropdown.... ', res.detail.cell_type)
    }
})

class LiJupyterListViews extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                min-width: 140px;
                position: relative;
                background: white;
                border: 1px solid lightgray;
                color: gray;
                font-family: Arial;
            }
        `;
    }

    render() {
        return html`
            <div style="text-align: center; padding: 4px; border-bottom: 1px solid lightgray;">${this.view} cell</div>
            <div style="display: flex; flex-direction: column; padding: 4px;">
                ${this.cellViews.map(i => html`
                    <li-button width="auto" textAlign="left" border=0 @click=${() => this.addCell(i)} style="padding: 2px">${i.source + i.label}</li-button>
                `)}
            </div>
        `
    }

    static get properties() {
        return {
            cell: { type: Object, default: undefined },
            position: { type: String, default: 'top' },
            view: { type: String, default: '' },
        }
    }
    get cellViews() { 
        return [
            { cell_type: 'markdown', cell_extType: 'md', color: '#F7630C', source: '🟠 ... ', label: 'md' },
            { cell_type: 'html', cell_extType: 'html', color: '#16C60C', source: '🟢 ... ', label: 'html' },
            { cell_type: 'code', cell_extType: 'code', color: '#0078D7', source: '🔵 ... ', label: 'code' },
        ]
    }

    addCell(item) {
        // const idx = this.cell?.order || 0;
        // if (this.view === 'add') {
        //     const ord = this.position === 'top' ? idx - .1 : idx + .1;
        //     const cell = { order: ord, cell_type: item.cell_type, cell_extType: item.cell_extType, source: item.source, color: item.color, label: item.label };
        //     this.notebook.cells ||= [];
        //     this.notebook.cells.splice(idx, 0, cell);
        //     this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - .1 <= ord ? idx : idx + 1);
        // } else if (this.view === 'select type') {
        //     const cell = { ...this.cell, ...{ cell_type: item.cell_type, cell_extType: item.cell_extType, color: item.color, label: item.label  } };
        //     this.notebook.cells.splice(idx, 1, cell);
        // }
        LI.fire(document, 'ok', item);
    }
}
customElements.define('li-jupyter-list-views', LiJupyterListViews);
