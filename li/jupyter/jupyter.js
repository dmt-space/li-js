import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../dropdown/dropdown.js';
import '../editor-html/editor-html.js';
import '../editor-ace/editor-ace.js';
import '../editor-monaco/editor-monaco.js';
import '../viewer-md/viewer-md.js';

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
            $c.notebook.cells.map((i, idx) => i.order ||= idx);
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
                left: 16px;
                z-index: 31;
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
                <div class="cell" @click=${() => this.showCellViews('select type')} title="select cell type" style="color: ${this.cell?.color || 'gray'}">${this.cell?.label || this.cell?.cell_type}</div>
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
        this.$update();
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
        const idx = this.cell?.order || 0;
        if (this.view === 'add') {
            const ord = this.position === 'top' ? idx - .1 : idx + .1;
            const cell = { order: ord, cell_type: item.cell_type, cell_extType: item.cell_extType, source: item.source, color: item.color, label: item.label };
            $c.notebook.cells ||= [];
            $c.notebook.cells.splice(idx, 0, cell);
            $c.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - .1 <= ord ? idx : idx + 1);
        } else if (this.view === 'select type') {
            const cell = { ...this.cell, ...{ cell_type: item.cell_type, cell_extType: item.cell_extType, color: item.color, label: item.label  } };
            $c.notebook.cells.splice(idx, 1, cell);
        }
        LI.fire(document, 'ok', item);
    }
}
customElements.define('li-jupyter-list-views', LiJupyterListViews);

customElements.define('li-jupyter-cell', class extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                position: relative;
                margin: 6px 6px;
            }
            .cell {
                display: flex;
                position: relative;
                padding: 4px;
                min-height: 28px;
                width: 100%
            }
            .focused {
                box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.4);
            }
        `;
    }

    render() {
        return html`
            <div id="${this.id}" class="cell ${this.focused}" style="order: ${this.cell?.order || 0}; box-shadow: ${!this.readOnly && $s.showBorder && $c.focusedCell !== this.cell ? 'inset 0px 0px 0px 1px lightgray' : ''};">
                ${this.cellType}
            </div>
            ${!$a.readOnly && $c.focusedCell === this.cell ? html`
                <li-jupyter-cell-toolbar .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-toolbar>
            ` : html``}
            ${!$a.readOnly && this.cell && $c.focusedCell === this.cell ? html`
                <li-jupyter-cell-addbutton .cell=${this.cell}></li-jupyter-cell-addbutton>
            ` : html``}
            ${!$a.readOnly && this.cell && $c.focusedCell === this.cell ? html`
                <li-jupyter-cell-addbutton .cell=${this.cell} position="bottom"></li-jupyter-cell-addbutton>
            ` : html``}
        `
    }

    static get properties() {
        return {
            cell: { type: Object, default: undefined },
            idx: { type: Number, default: 0 },
        }
    }
    get focused() { return !$a.readOnly && $c.focusedCell === this.cell ? 'focused' : '' }
    get id() { return 'cell-' + (this.cell?.order || this.idx || 0) }
    get cellType() {
        if (this.cell?.cell_type === 'markdown')
            return html`<li-jupyter-cell-markdown @click=${this.click} .cell=${this.cell}></li-jupyter-cell-markdown>`;
        if (this.cell?.cell_type === 'html')
            return html`<li-jupyter-cell-html @click=${this.click} .cell=${this.cell}></li-jupyter-cell-html>`;
        if (this.cell?.cell_type === 'code')
            return html`<li-jupyter-cell-code @click=${this.click} .cell=${this.cell}></li-jupyter-cell-code>`;
        return html`<div></div>`;
    }
    click(e) {
        $c.focusedCell = this.cell;
        this.$update();
    }
})

customElements.define('li-jupyter-cell-toolbar', class extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                position: absolute;
                right: 8px;
                top: -12px;
                z-index: 21;
                box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.4);
                background: white;
                width: 200px;
                height: 24px;
            }
            li-button {
                border-radius: 3px;
                margin: 4px 2px;
            }
            li-button[disabled] {
                pointer-events: none;
                opacity: .5;
            }
        `;
    }

    render() {
        return html`
            <li-button name="close" @click=${() => { $c.focusedCell = undefined; this.$update() }} border=0 size=16></li-button>
            <li-button name="arrow-back" @click=${(e) => this.tapOrder(e, -1.1)} ?disabled=${this.order <= 0} title="move up" border=0 size=16 rotate=90></li-button>
            <li-button name="arrow-forward"  @click=${(e) => this.tapOrder(e, 1.1)} ?disabled=${this.order >= $c.notebook?.cells?.length - 1} title="move down" border=0 size=16 rotate=90></li-button>
            <li-button name="select-all" title="show cells border" @click=${() => { $s.showBorder = !$s.showBorder; this.$update(); }} border=0 size=16></li-button>
            <li-button name="mode-edit" @click=${() => { $c.editedCell = $c.editedCell === this.cell ? undefined : this.cell; this.$update() }} style="fill: ${$c.editedCell === this.cell ? 'red' : ''}" title="edit mode" border=0 size=16></li-button>
            ${$c.editedCell === this.cell ? html`
                <li-button name="settings" border=0 size=16></li-button>
            ` : html``}
            <div style="flex: 1;"></div>
            <li-button name="delete" @click=${this.tapDelete} title="delete" border=0 size=16></li-button>
        `
    }

    static get properties() {
        return {
            cell: { type: Object },
            idx: { type: Number, default: 0 }
        }
    }
    get order() { return this.cell.order || this.idx }

    tapOrder(e, v) {
        if ($c.focusedCell !== this.cell) return;
        const ord = this.cell.order = this.order + v;
        $c.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - 1.1 <= ord ? idx : idx + 1);
        this.$update();
    }
    tapDelete() {
        if (!this.cell.source || this.cell.source === ' ' || ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️'].includes(this.cell.source.slice(0, 2))) {
            $c.notebook.cells.splice(this.cell.order, 1);
            $c.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx);
            $c.focusedCell = $c.notebook.cells[(this.cell.order > $c.notebook.cells.length - 1) ? $c.notebook.cells.length - 1 : this.cell.order];
            this.$update();
        }
    }
})

customElements.define('li-jupyter-cell-markdown', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb {  background-color: gray; }            
            :host {
                display: flex;
                flex: 1;
                width: 100%;
                min-height: 28px;
                height: 100%;
                /* max-height: {{!readOnly&&editedCell===cell ? '80vh' : ''}}; */
            }
        `;
    }

    render() {
        return html`
            <!-- <div class="flex" ~show="!readOnly&&editedCell===cell" style="min-width: 50%; overflow: auto;">
                <li-editor-ace class="flex ace" highlight-active-line="false" show-print-margin="false" theme="solarized_light" mode:markdown show-gutter="false" min-lines=1></li-editor-ace></li-ace-editor>
            </div> -->
            <!-- <li-splitter class="no-flex" ~if="!readOnly&&editedCell===cell" style="width: 4px;"></li-splitter> -->
            <li-viewer-md src=${this.cell?.source} style="width: 100%"></li-viewer-md>
        `
    }

    static get properties() {
        return {
            cell: { type: Object }
        }
    }
})

customElements.define('li-jupyter-cell-code', class extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
                display: flex;
                padding: 4px;
                min-height: 28px;
            }
            .box {
                width: 24px;
                cursor: pointer;
                align-self: flex-start;
                padding-right: 4px;
            }
        `;
    }

    render() {
        return html`
            <div class="box ">
                <div>[...]</div>
            </div>
            <li-editor-ace class="ace" style="width: 100%;" theme=${!$a.readOnly && $c.editedCell === this.cell ? 'solarized_light' : 'dawn'} mode="javascript"></li-editor-ace>    
        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            const ace = this.$qs('li-editor-ace');
            ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
            ace.value = this.cell.source;
            this.$update();
        });
    }

    static get properties() {
        return {
            cell: { type: Object }
        }
    }
})

customElements.define('li-jupyter-cell-html', class extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex: 1;
                min-height: 28px;
            }
        `;
    }

    render() {
        return html`
            ${$a.readOnly || $c.editedCell !== this.cell ? html`
                <div .innerHTML=${this.cell.source} style="width: 100%; padding: 8px;"></div>
            `: html`
                <li-editor-html style="width: 100%;"></li-editor-html>
            `}
        `
    }

    static get properties() {
        return {
            cell: { type: Object }
        }
    }
})
